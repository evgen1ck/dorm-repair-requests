import { Link, useSearchParams } from "react-router";
import { Plus } from "lucide-react";
import { getErrorMessage } from "@/api/client";
import type {
  RepairRequestResponse,
  UserRole,
} from "@/api/generated/dormitoryRepairRequests.schemas";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ParamFilter } from "@/components/shared/param-filter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/features/auth/current-user-context";
import { pickFilter } from "@/lib/filter-options";
import { RequestCard } from "../components/request-card";
import { RequestsTable } from "../components/requests-table";
import { EMPTY_FILTER_COPY, LIST_COPY, statusFiltersFor, type ListFilter } from "../labels";
import { countByStatus, filterByList, sortByUrgency } from "../model";
import { useRequests } from "../queries";

const TABLE_ROLES: UserRole[] = ["dispatcher", "admin"];
const SKELETON_ROWS = 3;

const newRequestButton = (
  <Button asChild>
    <Link to="/requests/new">
      <Plus aria-hidden />
      Новая заявка
    </Link>
  </Button>
);

function RequestCards({
  requests,
  showResident = false,
  showMaster,
  className,
}: {
  requests: RepairRequestResponse[];
  showResident?: boolean;
  showMaster: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      {requests.map((request) => (
        <RequestCard
          key={request.id}
          request={request}
          showResident={showResident}
          showMaster={showMaster}
        />
      ))}
    </div>
  );
}

function RequestsContent({
  role,
  filter,
  tableView,
  requests,
}: {
  role: UserRole;
  filter?: ListFilter;
  tableView: boolean;
  requests: ReturnType<typeof useRequests>;
}) {
  if (requests.isPending) {
    return (
      <div className="space-y-3">
        {Array.from({ length: SKELETON_ROWS }, (_, i) => (
          <Skeleton key={i} className={tableView ? "h-12 w-full" : "h-32 w-full rounded-lg"} />
        ))}
      </div>
    );
  }

  if (requests.isError) {
    return (
      <EmptyState
        title="Не удалось загрузить заявки"
        description={getErrorMessage(requests.error)}
      />
    );
  }

  return (
    <RequestsList
      role={role}
      filter={filter}
      tableView={tableView}
      requests={filterByList(requests.data, filter)}
    />
  );
}

function RequestsList({
  role,
  filter,
  tableView,
  requests,
}: {
  role: UserRole;
  filter?: ListFilter;
  tableView: boolean;
  requests: RepairRequestResponse[];
}) {
  if (requests.length === 0) {
    return (
      <EmptyState
        title={filter ? EMPTY_FILTER_COPY[filter] : "Заявок пока нет"}
        description={filter ? undefined : LIST_COPY[role].empty}
      />
    );
  }

  const sorted = sortByUrgency(requests);

  if (tableView) {
    return (
      <>
        <RequestCards requests={sorted} showResident showMaster className="space-y-3 md:hidden" />
        <div className="hidden md:block">
          <RequestsTable requests={sorted} />
        </div>
      </>
    );
  }

  return <RequestCards requests={sorted} showMaster={role !== "master"} className="space-y-3" />;
}

export function RequestsPage() {
  const { role } = useCurrentUser();
  const [searchParams] = useSearchParams();
  const copy = LIST_COPY[role];
  const showFilter = role !== "resident";
  const filters = showFilter ? statusFiltersFor(role) : [];
  const filter = pickFilter(filters, searchParams.get("status"));
  const requests = useRequests({ live: showFilter });

  return (
    <>
      <PageHeader
        title={copy.title}
        description={copy.description}
        actions={role === "resident" ? newRequestButton : undefined}
      />
      {showFilter && (
        <ParamFilter
          param="status"
          label="Фильтр по статусу"
          filters={filters}
          value={filter}
          counts={requests.data ? countByStatus(requests.data) : undefined}
        />
      )}
      <RequestsContent
        role={role}
        filter={filter}
        tableView={TABLE_ROLES.includes(role)}
        requests={requests}
      />
    </>
  );
}
