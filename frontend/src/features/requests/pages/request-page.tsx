import type { ReactNode } from "react";
import { useParams } from "react-router";
import { HttpStatus, getErrorMessage, isApiError } from "@/api/client";
import type { UserRole } from "@/api/generated/dormitoryRepairRequests.schemas";
import { BackLink } from "@/components/shared/back-link";
import { DetailField, DetailList } from "@/components/shared/detail-field";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Person, PhoneLink } from "@/components/shared/person";
import { StatusBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/features/auth/current-user-context";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { AssignmentSection } from "../components/assignment-section";
import { HistoryTimeline } from "../components/history-timeline";
import { StatusActions } from "../components/status-actions";
import { LIST_COPY, STATUS_LABELS, roomLabel } from "../labels";
import { isOverdue } from "../model";
import { useRequest } from "../queries";

const ASSIGNING_ROLES: UserRole[] = ["dispatcher", "admin"];

function Section({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "space-y-5 rounded-lg border border-border bg-surface p-5 shadow-xs",
        className,
      )}
    >
      <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

export function RequestPage() {
  const user = useCurrentUser();
  const requestId = Number(useParams().requestId);
  const { data: request, isLoading, error } = useRequest(requestId);
  const canAssign = ASSIGNING_ROLES.includes(user.role);

  const backLink = (
    <BackLink to="/requests" escape>
      {LIST_COPY[user.role].back}
    </BackLink>
  );

  if (isLoading) return <Skeleton className="h-48 w-full max-w-2xl" />;

  if (!request) {
    const loadFailed = error && !isApiError(error, HttpStatus.NOT_FOUND);
    return (
      <EmptyState
        title={loadFailed ? "Не удалось загрузить заявку" : "Заявка не найдена"}
        description={loadFailed ? getErrorMessage(error) : undefined}
        action={backLink}
      />
    );
  }

  const status = STATUS_LABELS[request.status];

  return (
    <div className="@container">
      <PageHeader
        title={`Заявка №${request.id}`}
        badge={
          <>
            <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
            {isOverdue(request) && <StatusBadge tone="destructive">Просрочена</StatusBadge>}
          </>
        }
        description={`${request.fault_type.name} · ${roomLabel(request.room)}`}
        backLink={backLink}
      />

      <div className="grid gap-6 @4xl:grid-cols-[minmax(0,1fr)_24rem]">
        <Section title="Детали" className="@4xl:col-start-1 @4xl:row-start-1">
          <DetailList>
            <DetailField label="Комната">
              {roomLabel(request.room)}, {request.room.floor} этаж
            </DetailField>
            {canAssign && (
              <DetailField label="Жилец">
                <Person
                  name={request.resident.full_name}
                  detail={
                    request.resident.phone ? <PhoneLink phone={request.resident.phone} /> : null
                  }
                />
              </DetailField>
            )}
            <DetailField label="Тип неисправности">{request.fault_type.name}</DetailField>
            <DetailField label="Создана">{formatDateTime(request.created_at)}</DetailField>
            {request.closed_at && (
              <DetailField label="Закрыта">{formatDateTime(request.closed_at)}</DetailField>
            )}
            <DetailField label="Описание" className="col-span-2">
              <p className="max-w-[65ch] whitespace-pre-wrap">{request.fault_description}</p>
            </DetailField>
          </DetailList>
        </Section>

        <Section
          title="Исполнение"
          className="@4xl:col-start-2 @4xl:row-span-2 @4xl:row-start-1 @4xl:self-start"
        >
          <AssignmentSection request={request} canAssign={canAssign} />
          {user.role === "master" && <StatusActions request={request} />}
        </Section>

        <Section title="История" className="@4xl:col-start-1 @4xl:row-start-2">
          <HistoryTimeline requestId={request.id} />
        </Section>
      </div>
    </div>
  );
}
