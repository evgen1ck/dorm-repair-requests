import type { FaultTypeReportRow } from "@/api/generated/dormitoryRepairRequests.schemas";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { sharePercent, splitByActivity, sumReport } from "../model";

const numberCell = "text-right tabular-nums";

function Count({ value }: { value: number }) {
  if (value > 0) return value;
  return (
    <>
      <span className="sr-only">0</span>
      <span aria-hidden className="text-muted-foreground/60">
        –
      </span>
    </>
  );
}

function ShareCell({ share }: { share: number }) {
  return (
    <TableCell className={numberCell}>
      <div className="flex items-center gap-2">
        <div aria-hidden className="h-1.5 flex-1 rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary/70" style={{ width: `${share}%` }} />
        </div>
        <span className="w-9 text-muted-foreground">{share}%</span>
      </div>
    </TableCell>
  );
}

export function ReportTable({ rows }: { rows: FaultTypeReportRow[] }) {
  const totals = sumReport(rows);
  const { active, idle } = splitByActivity(rows);
  return (
    <div className="max-w-4xl rounded-lg border border-border bg-surface">
      <Table className="min-w-xl">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead rowSpan={2} className="align-bottom">
              Тип неисправности
            </TableHead>
            <TableHead rowSpan={2} className="text-right align-bottom">
              Всего
            </TableHead>
            <TableHead rowSpan={2} className="w-44 text-right align-bottom">
              Доля
            </TableHead>
            <TableHead colSpan={3} className="h-7 border-b border-border text-center">
              Из них
            </TableHead>
          </TableRow>
          <TableRow className="hover:bg-transparent">
            <TableHead className="h-7 text-right">Новые</TableHead>
            <TableHead className="h-7 text-right">В работе</TableHead>
            <TableHead className="h-7 text-right">Выполнены</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {active.map((row) => (
            <TableRow key={row.fault_type.id}>
              <TableCell>{row.fault_type.name}</TableCell>
              <TableCell className={cn(numberCell, "font-medium")}>{row.total}</TableCell>
              <ShareCell share={sharePercent(row.total, totals.total)} />
              <TableCell className={numberCell}>
                <Count value={row.new} />
              </TableCell>
              <TableCell className={numberCell}>
                <Count value={row.in_progress} />
              </TableCell>
              <TableCell className={numberCell}>
                <Count value={row.done} />
              </TableCell>
            </TableRow>
          ))}
          <TableRow className="border-t-2 bg-muted/40 font-medium hover:bg-muted/40">
            <TableCell>Итого</TableCell>
            <TableCell className={numberCell}>{totals.total}</TableCell>
            <TableCell className={cn(numberCell, "font-normal text-muted-foreground")}>
              100%
            </TableCell>
            <TableCell className={numberCell}>
              <Count value={totals.new} />
            </TableCell>
            <TableCell className={numberCell}>
              <Count value={totals.in_progress} />
            </TableCell>
            <TableCell className={numberCell}>
              <Count value={totals.done} />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      {idle.length > 0 && (
        <p className="border-t border-border px-3 py-2.5 text-sm text-muted-foreground">
          Без заявок за период: {idle.map((row) => row.fault_type.name).join(", ")}
        </p>
      )}
    </div>
  );
}
