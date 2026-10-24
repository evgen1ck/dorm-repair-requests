import type { RepairRequestResponse } from "@/api/generated/dormitoryRepairRequests.schemas";
import { formatDateTime, formatOverdueBy, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import { isOverdue } from "../model";

export function Deadline({
  request,
  className,
}: {
  request: RepairRequestResponse;
  className?: string;
}) {
  const assignment = request.active_assignment;
  if (!assignment) return <span className={cn("text-muted-foreground", className)}>—</span>;

  const overdue = isOverdue(request);
  const open = request.status !== "done";
  return (
    <span className={cn("block", overdue && "text-destructive", className)}>
      <span className={cn("block tabular-nums", overdue && "font-medium")}>
        {formatDateTime(assignment.due_at)}
      </span>
      {open && (
        <span className={cn("block text-xs", !overdue && "text-muted-foreground")}>
          {overdue ? formatOverdueBy(assignment.due_at) : formatRelative(assignment.due_at)}
        </span>
      )}
    </span>
  );
}
