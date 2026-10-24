import { Link, useSearchParams } from "react-router";
import { Plus } from "lucide-react";
import { getErrorMessage } from "@/api/client";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/features/auth/current-user-context";
import { ROLE_LABELS } from "@/features/auth/roles";
import { ParamFilter } from "@/components/shared/param-filter";
import { pickFilter } from "@/lib/filter-options";
import { UserCards } from "../components/user-cards";
import { UsersTable } from "../components/users-table";
import { ROLE_FILTERS } from "../labels";
import { sortUsers } from "../model";
import { useUsers } from "../queries";

const ROLE_PARAM = "role";

export function UsersPage() {
  const currentUser = useCurrentUser();
  const [searchParams] = useSearchParams();
  const role = pickFilter(ROLE_FILTERS, searchParams.get(ROLE_PARAM));
  const users = useUsers();

  const counts = users.data
    ? Object.fromEntries([
        ["all", users.data.length],
        ...Object.keys(ROLE_LABELS).map((key) => [
          key,
          users.data!.filter((user) => user.role === key).length,
        ]),
      ])
    : undefined;
  const visible = users.data
    ? sortUsers(users.data.filter((user) => !role || user.role === role))
    : [];

  return (
    <>
      <PageHeader
        title="Пользователи"
        description="Жильцы, диспетчеры, мастера и администраторы. Отключённые не могут войти."
        actions={
          <Button asChild>
            <Link to="/users/new">
              <Plus aria-hidden />
              Новый пользователь
            </Link>
          </Button>
        }
      />
      <ParamFilter
        param={ROLE_PARAM}
        label="Фильтр по роли"
        filters={ROLE_FILTERS}
        value={role}
        counts={counts}
      />
      {users.isPending ? (
        <Skeleton className="h-48 w-full max-w-4xl rounded-lg" />
      ) : users.isError ? (
        <EmptyState
          title="Не удалось загрузить пользователей"
          description={getErrorMessage(users.error)}
        />
      ) : visible.length === 0 ? (
        <EmptyState
          title={
            role ? `Нет пользователей с ролью «${ROLE_LABELS[role]}»` : "Пользователей пока нет"
          }
        />
      ) : (
        <>
          <UserCards users={visible} currentUserId={currentUser.id} className="md:hidden" />
          <div className="hidden md:block">
            <UsersTable users={visible} currentUserId={currentUser.id} />
          </div>
        </>
      )}
    </>
  );
}
