import { Link } from "react-router";
import { Plus } from "lucide-react";
import { useListRequests } from "@/api/generated/requests/requests";
import type { RepairRequestResponse } from "@/api/generated/dormitoryRepairRequests.schemas";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/format";
import { CURRENT_RESIDENT_ID } from "@/features/auth/current-user";
import { STATUS_LABELS, roomLabel } from "./labels";

const newRequestButton = (
  <Button asChild>
    <Link to="/requests/new">
      <Plus aria-hidden />
      Новая заявка
    </Link>
  </Button>
);

function RequestCard({ request }: { request: RepairRequestResponse }) {
  const status = STATUS_LABELS[request.status];
  return (
    <Link
      to={`/requests/${request.id}`}
      className="block rounded-lg border border-border bg-surface p-4 shadow-xs transition-colors hover:border-muted-foreground focus-visible:outline-2 focus-visible:outline-ring"
    >
      <div className="flex items-center justify-between gap-4">
        <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
        <span className="text-xs text-muted-foreground">{formatDateTime(request.created_at)}</span>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{request.fault_type.name}</p>
      <p className="mt-1 line-clamp-2 font-medium">{request.fault_description}</p>
      <div className="mt-3 flex items-center justify-between gap-4 text-xs text-muted-foreground">
        <span>{roomLabel(request.room)}</span>
        <span>Заявка №{request.id}</span>
      </div>
    </Link>
  );
}

function RequestsList() {
  const {
    data: requests,
    isLoading,
    error,
  } = useListRequests({ resident_id: CURRENT_RESIDENT_ID });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return <EmptyState title="Не удалось загрузить заявки" description={error.message} />;
  }

  if (!requests?.length) {
    return (
      <EmptyState
        title="Заявок пока нет"
        description="Если что-то сломалось в комнате, создайте заявку — диспетчер назначит мастера."
        action={newRequestButton}
      />
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((request) => (
        <RequestCard key={request.id} request={request} />
      ))}
    </div>
  );
}

export function RequestsPage() {
  return (
    <>
      <PageHeader
        title="Мои заявки"
        description="Заявки на ремонт, которые вы подали, и их текущий статус."
      />
      <RequestsList />
    </>
  );
}
