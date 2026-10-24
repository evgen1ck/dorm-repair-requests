import { Link } from "react-router";
import type { RepairRequestResponse } from "@/api/generated/dormitoryRepairRequests.schemas";
import { Person } from "@/components/shared/person";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDateTime, formatOverdueBy, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import { STATUS_LABELS, roomLabel } from "../labels";
import { isOverdue } from "../model";

export function RequestCard({
  request,
  showResident = false,
  showMaster = true,
}: {
  request: RepairRequestResponse;
  showResident?: boolean;
  showMaster?: boolean;
}) {
  const status = STATUS_LABELS[request.status];
  const assignment = request.active_assignment;
  const done = request.status === "done";
  const overdue = isOverdue(request);
  const deadline =
    assignment &&
    `до ${formatDateTime(assignment.due_at)}${
      done
        ? ""
        : ` · ${overdue ? formatOverdueBy(assignment.due_at) : formatRelative(assignment.due_at)}`
    }`;

  return (
    <Link
      to={`/requests/${request.id}`}
      className={cn(
        "block rounded-lg border border-border bg-surface p-4 shadow-xs transition-colors hover:border-muted-foreground focus-visible:outline-2 focus-visible:outline-ring",
        done && "text-muted-foreground",
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
        <span className="text-xs text-muted-foreground">{formatDateTime(request.created_at)}</span>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        {request.fault_type.name}
        {showResident && ` · ${request.resident.full_name}`}
      </p>
      <p className="mt-1 line-clamp-2 font-medium">{request.fault_description}</p>
      {assignment &&
        (showMaster ? (
          <Person
            className="mt-3"
            name={assignment.master.full_name}
            muted={done}
            detail={<span className={cn(overdue && "text-destructive")}>{deadline}</span>}
          />
        ) : (
          <p className={cn("mt-2 text-xs", overdue ? "text-destructive" : "text-muted-foreground")}>
            {deadline}
          </p>
        ))}
      <div className="mt-3 flex items-center justify-between gap-4 text-xs text-muted-foreground">
        <span>{roomLabel(request.room)}</span>
        <span>Заявка №{request.id}</span>
      </div>
    </Link>
  );
}
