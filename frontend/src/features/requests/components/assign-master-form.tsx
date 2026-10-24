import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { getErrorMessage } from "@/api/client";
import type { AssignmentResponse } from "@/api/generated/dormitoryRepairRequests.schemas";
import { FormField } from "@/components/shared/form-field";
import { InlineAlert } from "@/components/shared/inline-alert";
import { DateTimePicker } from "@/components/shared/date-time-picker";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useActiveMasters } from "@/features/users/queries";
import { applyServerFieldErrors } from "@/lib/form-errors";
import { fieldControlProps } from "@/lib/form-field";
import { useAssignMaster } from "../queries";

const schema = z.object({
  master_id: z.string().min(1, "Выберите мастера"),
  due_at: z
    .string()
    .min(1, "Укажите срок")
    .refine((value) => new Date(value) > new Date(), "Срок уже прошёл"),
});
type AssignValues = z.infer<typeof schema>;

const toLocalInputValue = (iso: string) => {
  const date = new Date(iso);
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
};

export function AssignMasterForm({
  requestId,
  current,
  onDone,
  onCancel,
}: {
  requestId: number;
  current: AssignmentResponse | null;
  onDone: () => void;
  onCancel?: () => void;
}) {
  const masters = useActiveMasters();
  const assign = useAssignMaster(requestId);
  const form = useForm<AssignValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      master_id: current ? String(current.master.id) : "",
      due_at: current ? toLocalInputValue(current.due_at) : "",
    },
  });
  const { errors, isSubmitting } = form.formState;

  const submit = async (values: AssignValues) => {
    try {
      await assign.mutateAsync({
        master_id: Number(values.master_id),
        due_at: new Date(values.due_at).toISOString(),
      });
      toast.success(current ? "Мастер переназначен" : "Мастер назначен");
      onDone();
    } catch (error) {
      if (!applyServerFieldErrors(form, error)) {
        form.setError("root", { message: getErrorMessage(error) });
      }
    }
  };

  return (
    <form onSubmit={form.handleSubmit(submit)} className="max-w-md space-y-5" noValidate>
      <FormField id="master_id" label="Мастер" error={errors.master_id?.message}>
        {masters.isPending ? (
          <Skeleton className="h-8 w-full" />
        ) : masters.isError ? (
          <InlineAlert title="Не удалось загрузить мастеров">
            {getErrorMessage(masters.error)}
          </InlineAlert>
        ) : (
          <Controller
            control={form.control}
            name="master_id"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  {...fieldControlProps("master_id", errors.master_id?.message)}
                  className="w-full"
                >
                  <SelectValue placeholder="Выберите мастера" />
                </SelectTrigger>
                <SelectContent>
                  {masters.data.map((master) => (
                    <SelectItem key={master.id} value={String(master.id)}>
                      {master.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        )}
      </FormField>

      <FormField id="due_at" label="Срок выполнения" error={errors.due_at?.message}>
        <Controller
          control={form.control}
          name="due_at"
          render={({ field }) => (
            <DateTimePicker
              {...fieldControlProps("due_at", errors.due_at?.message)}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </FormField>

      {errors.root?.message && <InlineAlert title={errors.root.message} />}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSubmitting || masters.isError} aria-busy={isSubmitting}>
          {isSubmitting && <Loader2 aria-hidden className="animate-spin" />}
          {current ? "Переназначить" : "Назначить"}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Отмена
          </Button>
        )}
      </div>
    </form>
  );
}
