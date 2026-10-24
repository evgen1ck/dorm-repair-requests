import type {
  RepairRequestResponse,
  RequestStatus,
} from "@/api/generated/dormitoryRepairRequests.schemas";
import { OVERDUE_FILTER, type ListFilter } from "./labels";

const STATUS_PRIORITY: Record<RequestStatus, number> = { new: 0, in_progress: 1, done: 2 };

export const isOverdue = (request: RepairRequestResponse, now = new Date()) => {
  const dueAt = request.active_assignment?.due_at;
  return request.status !== "done" && dueAt !== undefined && new Date(dueAt) < now;
};

export function filterByList(
  requests: RepairRequestResponse[],
  filter?: ListFilter,
  now = new Date(),
): RepairRequestResponse[] {
  if (!filter) return requests;
  if (filter === OVERDUE_FILTER) return requests.filter((request) => isOverdue(request, now));
  return requests.filter((request) => request.status === filter);
}

const dueTime = (request: RepairRequestResponse) =>
  request.active_assignment ? new Date(request.active_assignment.due_at).getTime() : Infinity;

export function sortByUrgency(requests: RepairRequestResponse[]): RepairRequestResponse[] {
  return requests
    .map((request, index) => ({ request, index }))
    .sort((a, b) => {
      const byStatus = STATUS_PRIORITY[a.request.status] - STATUS_PRIORITY[b.request.status];
      if (byStatus !== 0) return byStatus;
      if (a.request.status === "in_progress") {
        const aDue = dueTime(a.request);
        const bDue = dueTime(b.request);
        if (aDue !== bDue) return aDue < bDue ? -1 : 1;
      }
      return a.index - b.index;
    })
    .map(({ request }) => request);
}

export type StatusCounts = Record<RequestStatus, number> & { all: number; overdue: number };

export function countByStatus(requests: RepairRequestResponse[], now = new Date()): StatusCounts {
  const counts: StatusCounts = {
    all: requests.length,
    new: 0,
    in_progress: 0,
    done: 0,
    overdue: 0,
  };
  for (const request of requests) {
    counts[request.status] += 1;
    if (isOverdue(request, now)) counts.overdue += 1;
  }
  return counts;
}
