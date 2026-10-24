import type { FaultTypeReportRow } from "@/api/generated/dormitoryRepairRequests.schemas";

export type ReportTotals = Pick<FaultTypeReportRow, "total" | "new" | "in_progress" | "done">;

export function sumReport(rows: FaultTypeReportRow[]): ReportTotals {
  const totals: ReportTotals = { total: 0, new: 0, in_progress: 0, done: 0 };
  for (const row of rows) {
    totals.total += row.total;
    totals.new += row.new;
    totals.in_progress += row.in_progress;
    totals.done += row.done;
  }
  return totals;
}

export const sortByTotal = (rows: FaultTypeReportRow[]) =>
  [...rows].sort((a, b) => b.total - a.total);

export const sharePercent = (part: number, whole: number) =>
  whole === 0 ? 0 : Math.round((part / whole) * 100);

export const splitByActivity = (rows: FaultTypeReportRow[]) => ({
  active: sortByTotal(rows.filter((row) => row.total > 0)),
  idle: rows.filter((row) => row.total === 0),
});
