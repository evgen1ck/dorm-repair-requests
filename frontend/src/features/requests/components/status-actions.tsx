import { toast } from "sonner";
import { Check, Loader2, Undo2 } from "lucide-react";
import { getErrorMessage } from "@/api/client";
import type {
  RepairRequestResponse,
  RequestStatus,
} from "@/api/generated/dormitoryRepairRequests.schemas";
import { InlineAlert } from "@/components/shared/inline-alert";
import { Button } from "@/components/ui/button";
import { useChangeStatus } from "../queries";

const TRANSITIONS: Partial<
  Record<RequestStatus, { to: RequestStatus; label: string; done: string; icon: typeof Check }>
> = {
  in_progress: { to: "done", label: "Отметить выполненной", done: "Заявка выполнена", icon: Check },
  done: {
    to: "in_progress",
    label: "Вернуть в работу",
    done: "Заявка снова в работе",
    icon: Undo2,
  },
};

export function StatusActions({ request }: { request: RepairRequestResponse }) {
  const transition = TRANSITIONS[request.status];
  const changeStatus = useChangeStatus(request.id);

  if (!transition) return null;
  const Icon = transition.icon;

  return (
    <div className="space-y-3">
      <Button
        variant={request.status === "done" ? "outline" : "default"}
        disabled={changeStatus.isPending}
        aria-busy={changeStatus.isPending}
        onClick={() =>
          changeStatus.mutate(transition.to, {
            onSuccess: () => toast.success(transition.done),
          })
        }
      >
        {changeStatus.isPending ? (
          <Loader2 aria-hidden className="animate-spin" />
        ) : (
          <Icon aria-hidden />
        )}
        {transition.label}
      </Button>
      {changeStatus.isError && (
        <InlineAlert title="Не удалось изменить статус">
          {getErrorMessage(changeStatus.error)}
        </InlineAlert>
      )}
    </div>
  );
}
