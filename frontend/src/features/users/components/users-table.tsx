import type { UserResponse } from "@/api/generated/dormitoryRepairRequests.schemas";
import { Person } from "@/components/shared/person";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROLE_LABELS } from "@/features/auth/roles";
import { cn } from "@/lib/utils";

export function UsersTable({
  users,
  currentUserId,
}: {
  users: UserResponse[];
  currentUserId: number;
}) {
  return (
    <div className="max-w-4xl rounded-lg border border-border bg-surface">
      <Table className="min-w-2xl table-fixed">
        <colgroup>
          <col />
          <col className="w-36" />
          <col className="w-40" />
          <col className="w-40" />
          <col className="w-28" />
        </colgroup>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Имя</TableHead>
            <TableHead>Логин</TableHead>
            <TableHead>Роль</TableHead>
            <TableHead>Телефон</TableHead>
            <TableHead>Статус</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className={cn(!user.is_active && "text-muted-foreground")}>
              <TableCell>
                <Person
                  name={user.full_name}
                  href={`/users/${user.id}`}
                  badge={user.id === currentUserId && "это вы"}
                  size="sm"
                  muted={!user.is_active}
                />
              </TableCell>
              <TableCell className="truncate font-mono text-xs">{user.login}</TableCell>
              <TableCell>{ROLE_LABELS[user.role]}</TableCell>
              <TableCell className="truncate">{user.phone ?? "—"}</TableCell>
              <TableCell>
                {user.is_active ? (
                  <StatusBadge tone="success">Активен</StatusBadge>
                ) : (
                  <StatusBadge tone="neutral">Отключён</StatusBadge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
