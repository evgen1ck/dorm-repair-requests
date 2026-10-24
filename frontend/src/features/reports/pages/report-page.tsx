import { useSearchParams } from "react-router";
import { getErrorMessage } from "@/api/client";
import { EmptyState } from "@/components/shared/empty-state";
import { InlineAlert } from "@/components/shared/inline-alert";
import { PageHeader } from "@/components/shared/page-header";
import { StaleContent } from "@/components/shared/stale-content";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";
import { PeriodPicker } from "../components/period-picker";
import { ReportSummary } from "../components/report-summary";
import { ReportTable } from "../components/report-table";
import { sumReport } from "../model";
import { defaultPeriod, isDateParam, isPeriodValid, type Period } from "../period";
import { useFaultTypeReport } from "../queries";

const FROM_PARAM = "from";
const TO_PARAM = "to";

function usePeriodParams(): [Period, (period: Period) => void] {
  const [searchParams, setSearchParams] = useSearchParams();
  const from = searchParams.get(FROM_PARAM);
  const to = searchParams.get(TO_PARAM);
  const period = isDateParam(from) && isDateParam(to) ? { from, to } : defaultPeriod();
  const setPeriod = (next: Period) =>
    setSearchParams({ [FROM_PARAM]: next.from, [TO_PARAM]: next.to }, { replace: true });
  return [period, setPeriod];
}

function ReportContent({ period }: { period: Period }) {
  const valid = isPeriodValid(period);
  const report = useFaultTypeReport(period, valid);

  if (!valid) {
    return (
      <InlineAlert title="Начало периода позже его конца">
        Поменяйте даты местами или выберите готовый период.
      </InlineAlert>
    );
  }

  if (report.isPending) return <Skeleton className="h-56 w-full rounded-lg" />;

  if (report.isError) {
    return (
      <EmptyState title="Не удалось построить отчёт" description={getErrorMessage(report.error)} />
    );
  }

  return (
    <StaleContent stale={report.isPlaceholderData}>
      {sumReport(report.data).total === 0 ? (
        <EmptyState
          title="За этот период заявок нет"
          description={`С ${formatDate(period.from)} по ${formatDate(period.to)} жильцы ничего не подавали.`}
        />
      ) : (
        <>
          <ReportSummary period={period} rows={report.data} />
          <ReportTable rows={report.data} />
        </>
      )}
    </StaleContent>
  );
}

export function ReportPage() {
  const [period, setPeriod] = usePeriodParams();

  return (
    <>
      <PageHeader
        title="Отчёт по типам неисправностей"
        description="Сколько заявок подано за период и в каком они состоянии. Период считается по дате создания заявки."
      />
      <PeriodPicker value={period} onChange={setPeriod} />
      <ReportContent period={period} />
    </>
  );
}
