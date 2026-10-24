import type { ReactNode } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import { useGetRequest } from "@/api/generated/requests/requests";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/format";
import { STATUS_LABELS, roomLabel } from "./labels";

const backButton = (
  <Button asChild variant="outline">
    <Link to="/requests">
      <ArrowLeft aria-hidden />К моим заявкам
    </Link>
  </Button>
);

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

export function RequestPage() {
  const requestId = Number(useParams().requestId);
  const {
    data: request,
    isLoading,
    error,
  } = useGetRequest(requestId, {
    query: { enabled: Number.isInteger(requestId) },
  });

  if (isLoading) return <Skeleton className="h-48 w-full" />;

  if (!request) {
    const loadFailed = error && error.statusCode !== 404;
    return (
      <EmptyState
        title={loadFailed ? "Не удалось загрузить заявку" : "Заявка не найдена"}
        description={loadFailed ? error.message : undefined}
        action={backButton}
      />
    );
  }

  const status = STATUS_LABELS[request.status];

  return (
    <>
      <PageHeader title={`Заявка №${request.id}`} actions={backButton} />

      <dl className="grid max-w-2xl grid-cols-2 gap-x-8 gap-y-5">
        <Field label="Статус">
          <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
        </Field>
        <Field label="Комната">
          {roomLabel(request.room)}, {request.room.floor} этаж
        </Field>
        <Field label="Тип неисправности">{request.fault_type.name}</Field>
        <Field label="Создана">{formatDateTime(request.created_at)}</Field>
        {request.updated_at !== request.created_at && (
          <Field label="Обновлена">{formatDateTime(request.updated_at)}</Field>
        )}
        {request.closed_at && <Field label="Закрыта">{formatDateTime(request.closed_at)}</Field>}
        <div className="col-span-2">
          <Field label="Описание">
            <p className="max-w-[65ch] whitespace-pre-wrap">{request.fault_description}</p>
          </Field>
        </div>
      </dl>
    </>
  );
}
