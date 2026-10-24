import type { FaultTypeReportRow } from "@/api/generated/dormitoryRepairRequests.schemas";
import { formatDateRange, plural } from "@/lib/format";
import { cn } from "@/lib/utils";
import { sumReport, type ReportTotals } from "../model";
import type { Period } from "../period";

const SEGMENTS: {
  key: keyof Omit<ReportTotals, "total">;
  className: string;
  forms: [string, string, string];
}[] = [
  { key: "new", className: "bg-info", forms: ["новая", "новые", "новых"] },
  { key: "in_progress", className: "bg-warning", forms: ["в работе", "в работе", "в работе"] },
  { key: "done", className: "bg-success", forms: ["выполнена", "выполнены", "выполнено"] },
];

export function ReportSummary({ period, rows }: { period: Period; rows: FaultTypeReportRow[] }) {
  const totals = sumReport(rows);
  const activeTypes = rows.filter((row) => row.total > 0).length;

  return (
    <div className="mb-6 max-w-4xl space-y-3">
      <p className="text-muted-foreground">
        За период {formatDateRange(period.from, period.to)}{" "}
        {plural(totals.total, ["подана", "подано", "подано"])}{" "}
        <span className="font-medium text-foreground">
          {totals.total} {plural(totals.total, ["заявка", "заявки", "заявок"])}
        </span>{" "}
        по {activeTypes} {plural(activeTypes, ["типу", "типам", "типам"])} из {rows.length}.
      </p>
      <div aria-hidden className="flex h-2 gap-px overflow-hidden rounded-full bg-muted">
        {SEGMENTS.filter((segment) => totals[segment.key] > 0).map((segment) => (
          <div
            key={segment.key}
            className={segment.className}
            style={{ width: `${(totals[segment.key] / totals.total) * 100}%` }}
          />
        ))}
      </div>
      <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
        {SEGMENTS.map((segment) => (
          <li key={segment.key} className="flex items-center gap-2">
            <span aria-hidden className={cn("size-2 rounded-full", segment.className)} />
            <span className="font-medium text-foreground tabular-nums">
              {totals[segment.key]}
            </span>{" "}
            {plural(totals[segment.key], segment.forms)}
          </li>
        ))}
      </ul>
    </div>
  );
}
