import { getErrorMessage } from "@/api/client";
import type { RequestStatusHistoryResponse } from "@/api/generated/dormitoryRepairRequests.schemas";
import { InlineAlert } from "@/components/shared/inline-alert";
import type { StatusTone } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ROLE_LABELS } from "@/features/auth/roles";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { STATUS_LABELS } from "../labels";
import { useRequestHistory } from "../queries";

const DOT_TONES: Record<StatusTone, string> = {
  info: "bg-info",
  warning: "bg-warning",
  success: "bg-success",
  neutral: "bg-muted-foreground",
  destructive: "bg-destructive",
};

const entryTitle = (entry: RequestStatusHistoryResponse) =>
  entry.old_status === null
    ? "Заявка создана"
    : `${STATUS_LABELS[entry.old_status].label} → ${STATUS_LABELS[entry.new_status].label}`;

const entryAuthor = ({ changed_by: author }: RequestStatusHistoryResponse) =>
  `${author.full_name}, ${ROLE_LABELS[author.role].toLowerCase()}`;

export function HistoryTimeline({ requestId }: { requestId: number }) {
  const history = useRequestHistory(requestId);

  if (history.isPending) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-10 w-1/2" />
      </div>
    );
  }

  if (history.isError) {
    return (
      <InlineAlert title="Не удалось загрузить историю">
        {getErrorMessage(history.error)}
      </InlineAlert>
    );
  }

  if (history.data.length === 0) {
    return <p className="text-muted-foreground">История пока пуста.</p>;
  }

  return (
    <ol className="relative ml-1.5 space-y-6 border-l border-border pl-6">
      {history.data.map((entry, index) => {
        const latest = index === history.data.length - 1;
        return (
          <li key={entry.id} className="relative">
            <span
              aria-hidden
              className="absolute top-1.5 -left-[1.875rem] size-3 rounded-full bg-surface ring-4 ring-surface"
            >
              <span
                className={cn(
                  "block size-full rounded-full",
                  DOT_TONES[STATUS_LABELS[entry.new_status].tone],
                  !latest && "opacity-60",
                )}
              />
            </span>
            <p className={cn("font-medium", !latest && "text-foreground/80")}>
              {entryTitle(entry)}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              <time dateTime={entry.changed_at}>{formatDateTime(entry.changed_at)}</time>
              {" · "}
              {entryAuthor(entry)}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
