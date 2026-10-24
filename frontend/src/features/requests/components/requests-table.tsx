import type { MouseEvent } from "react";
import { Link, useNavigate } from "react-router";
import type { RepairRequestResponse } from "@/api/generated/dormitoryRepairRequests.schemas";
import { Person } from "@/components/shared/person";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { STATUS_LABELS, roomLabel } from "../labels";
import { Deadline } from "./deadline";

const INTERACTIVE_SELECTOR = "a, button";

function RequestRow({ request }: { request: RepairRequestResponse }) {
  const navigate = useNavigate();
  const status = STATUS_LABELS[request.status];
  const assignment = request.active_assignment;
  const done = request.status === "done";

  const openRequest = (event: MouseEvent<HTMLTableRowElement>) => {
    if ((event.target as HTMLElement).closest(INTERACTIVE_SELECTOR)) return;
    navigate(`/requests/${request.id}`);
  };

  return (
    <TableRow
      onClick={openRequest}
      className={cn("cursor-pointer", done && "text-muted-foreground")}
    >
      <TableCell className="text-muted-foreground tabular-nums">{request.id}</TableCell>
      <TableCell>
        <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
      </TableCell>
      <TableCell className="truncate">{roomLabel(request.room)}</TableCell>
      <TableCell>
        <Link
          to={`/requests/${request.id}`}
          className="block truncate font-medium outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {request.fault_description}
        </Link>
        <span className="block truncate text-xs text-muted-foreground">
          {request.fault_type.name}
        </span>
      </TableCell>
      <TableCell className="truncate">
        <Person name={request.resident.full_name} size="sm" muted={done} />
      </TableCell>
      <TableCell className="truncate">
        {assignment ? (
          <Person name={assignment.master.full_name} size="sm" muted={done} />
        ) : (
          <span className="text-muted-foreground">Не назначен</span>
        )}
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <Deadline request={request} />
      </TableCell>
      <TableCell className="whitespace-nowrap text-muted-foreground tabular-nums">
        {formatDate(request.created_at)}
      </TableCell>
    </TableRow>
  );
}

export function RequestsTable({ requests }: { requests: RepairRequestResponse[] }) {
  return (
    <div className="rounded-lg border border-border bg-surface">
      <Table className="min-w-5xl table-fixed">
        <colgroup>
          <col className="w-12" />
          <col className="w-28" />
          <col className="w-44" />
          <col />
          <col className="w-44" />
          <col className="w-44" />
          <col className="w-44" />
          <col className="w-32" />
        </colgroup>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>№</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Комната</TableHead>
            <TableHead>Неисправность</TableHead>
            <TableHead>Жилец</TableHead>
            <TableHead>Мастер</TableHead>
            <TableHead>Срок</TableHead>
            <TableHead>Создана</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <RequestRow key={request.id} request={request} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
