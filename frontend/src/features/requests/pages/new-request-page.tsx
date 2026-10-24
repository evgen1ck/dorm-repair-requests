import { Link, useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  getGetRequestQueryKey,
  getListRequestsQueryKey,
  useCreateRequest,
} from "@/api/generated/requests/requests";
import { useListRooms } from "@/api/generated/rooms/rooms";
import { useListFaultTypes } from "@/api/generated/fault-types/fault-types";
import { PageHeader } from "@/components/shared/page-header";
import { FieldError } from "@/components/shared/field-error";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { CURRENT_RESIDENT_ID } from "@/features/auth/current-user";
import { roomLabel } from "./labels";

const MAX_DESCRIPTION_LENGTH = 2000;

const schema = z.object({
  room_id: z.string().min(1, "Выберите комнату").transform(Number),
  fault_type_id: z.string().min(1, "Выберите тип неисправности").transform(Number),
  fault_description: z
    .string()
    .trim()
    .min(1, "Опишите неисправность")
    .max(MAX_DESCRIPTION_LENGTH, `Не длиннее ${MAX_DESCRIPTION_LENGTH} символов`),
});
type NewRequestForm = z.input<typeof schema>;
type NewRequestValues = z.output<typeof schema>;

export function NewRequestPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const rooms = useListRooms();
  const faultTypes = useListFaultTypes();

  const form = useForm<NewRequestForm, unknown, NewRequestValues>({
    resolver: zodResolver(schema),
    defaultValues: { room_id: "", fault_type_id: "", fault_description: "" },
  });
  const { errors } = form.formState;

  const create = useCreateRequest({
    mutation: {
      onSuccess: (request) => {
        toast.success(`Заявка №${request.id} создана`);
        queryClient.setQueryData(getGetRequestQueryKey(request.id), request);
        queryClient.invalidateQueries({
          queryKey: getListRequestsQueryKey({ resident_id: CURRENT_RESIDENT_ID }),
        });
        navigate(`/requests/${request.id}`);
      },
      onError: (error) => toast.error("Не удалось создать заявку", { description: error.message }),
    },
  });

  const submit = (values: NewRequestValues) =>
    create.mutate({ data: { ...values, resident_id: CURRENT_RESIDENT_ID } });

  const lookupsFailed = Boolean(rooms.error || faultTypes.error);

  return (
    <>
      <PageHeader
        title="Новая заявка"
        description="Опишите, что сломалось. Диспетчер увидит заявку и назначит мастера."
      />

      <form onSubmit={form.handleSubmit(submit)} className="max-w-xl space-y-6" noValidate>
        <div className="space-y-2">
          <Label htmlFor="room_id">Комната</Label>
          {rooms.isLoading ? (
            <Skeleton className="h-8 w-full" />
          ) : rooms.error ? (
            <FieldError
              id="room_id-error"
              message={`Не удалось загрузить комнаты: ${rooms.error.message}`}
            />
          ) : (
            <Controller
              control={form.control}
              name="room_id"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="room_id"
                    className="w-full"
                    aria-invalid={Boolean(errors.room_id)}
                    aria-describedby={errors.room_id ? "room_id-error" : undefined}
                  >
                    <SelectValue placeholder="Выберите комнату" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.data?.map((room) => (
                      <SelectItem key={room.id} value={String(room.id)}>
                        {roomLabel(room)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          )}
          {!rooms.error && <FieldError id="room_id-error" message={errors.room_id?.message} />}
        </div>

        <div className="space-y-2">
          <Label htmlFor="fault_type_id">Тип неисправности</Label>
          {faultTypes.isLoading ? (
            <Skeleton className="h-8 w-full" />
          ) : faultTypes.error ? (
            <FieldError
              id="fault_type_id-error"
              message={`Не удалось загрузить типы неисправностей: ${faultTypes.error.message}`}
            />
          ) : (
            <Controller
              control={form.control}
              name="fault_type_id"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="fault_type_id"
                    className="w-full"
                    aria-invalid={Boolean(errors.fault_type_id)}
                    aria-describedby={errors.fault_type_id ? "fault_type_id-error" : undefined}
                  >
                    <SelectValue placeholder="Выберите тип" />
                  </SelectTrigger>
                  <SelectContent>
                    {faultTypes.data?.map((type) => (
                      <SelectItem key={type.id} value={String(type.id)}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          )}
          {!faultTypes.error && (
            <FieldError id="fault_type_id-error" message={errors.fault_type_id?.message} />
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="fault_description">Описание</Label>
          <Textarea
            id="fault_description"
            rows={5}
            placeholder="Например: в душевой не уходит вода, засор уже второй день"
            aria-invalid={Boolean(errors.fault_description)}
            aria-describedby={errors.fault_description ? "fault_description-error" : undefined}
            {...form.register("fault_description")}
          />
          <FieldError id="fault_description-error" message={errors.fault_description?.message} />
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={create.isPending || lookupsFailed}>
            {create.isPending ? "Отправляем…" : "Создать заявку"}
          </Button>
          <Button asChild variant="ghost">
            <Link to="/requests">Отмена</Link>
          </Button>
        </div>
      </form>
    </>
  );
}
