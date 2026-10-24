import type { RepairRequestResponse } from "@/api/generated/dormitoryRepairRequests.schemas";
import { countByStatus, filterByList, isOverdue, sortByUrgency } from "./model";

const user = {
  id: 2,
  login: "u",
  full_name: "U",
  phone: null,
  role: "master" as const,
  is_active: true,
};
const base = {
  resident: { ...user, id: 1, role: "resident" as const },
  room: { id: 1, building: "1", number: "101", floor: 1 },
  fault_type: { id: 1, code: "plumbing", name: "Сантехника" },
  fault_description: "x",
  created_at: "2026-10-01T10:00:00Z",
  updated_at: "2026-10-01T10:00:00Z",
  closed_at: null,
};
const assigned = (dueAt: string) => ({
  id: 1,
  master: user,
  dispatcher: user,
  due_at: dueAt,
  created_at: base.created_at,
});

const make = (
  id: number,
  status: RepairRequestResponse["status"],
  dueAt?: string,
): RepairRequestResponse => ({
  ...base,
  id,
  status,
  active_assignment: dueAt ? assigned(dueAt) : null,
});

test("orders new, then in progress by due date, then done, keeping server order otherwise", () => {
  const requests = [
    make(1, "done"),
    make(2, "in_progress", "2026-10-05T10:00:00Z"),
    make(3, "new"),
    make(4, "in_progress", "2026-10-02T10:00:00Z"),
    make(5, "new"),
    make(6, "in_progress"),
  ];
  expect(sortByUrgency(requests).map((r) => r.id)).toEqual([3, 5, 4, 2, 6, 1]);
});

test("counts requests per status and overdue ones", () => {
  const now = new Date("2026-10-10T00:00:00Z");
  const counts = countByStatus(
    [make(1, "new"), make(2, "done"), make(3, "in_progress", "2026-10-05T10:00:00Z")],
    now,
  );
  expect(counts).toEqual({ all: 3, new: 1, in_progress: 1, done: 1, overdue: 1 });
});

test("filters by status or overdue and passes everything through without a filter", () => {
  const now = new Date("2026-10-10T00:00:00Z");
  const requests = [
    make(1, "new"),
    make(2, "in_progress", "2026-10-05T10:00:00Z"),
    make(3, "in_progress", "2026-10-20T10:00:00Z"),
  ];
  const ids = (filter?: Parameters<typeof filterByList>[1]) =>
    filterByList(requests, filter, now).map((r) => r.id);
  expect(ids()).toEqual([1, 2, 3]);
  expect(ids("in_progress")).toEqual([2, 3]);
  expect(ids("overdue")).toEqual([2]);
});

test("overdue only applies to open requests with a past due date", () => {
  const now = new Date("2026-10-10T00:00:00Z");
  expect(isOverdue(make(1, "in_progress", "2026-10-05T10:00:00Z"), now)).toBe(true);
  expect(isOverdue(make(2, "done", "2026-10-05T10:00:00Z"), now)).toBe(false);
  expect(isOverdue(make(3, "new"), now)).toBe(false);
});
