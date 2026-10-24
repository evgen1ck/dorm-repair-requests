import { Link } from "react-router";
import type { UserResponse } from "@/api/generated/dormitoryRepairRequests.schemas";
import { Person } from "@/components/shared/person";
import { StatusBadge } from "@/components/shared/status-badge";
import { ROLE_LABELS } from "@/features/auth/roles";
import { cn } from "@/lib/utils";

export function UserCards({
  users,
  currentUserId,
  className,
}: {
  users: UserResponse[];
  currentUserId: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {users.map((user) => (
        <Link
          key={user.id}
          to={`/users/${user.id}`}
          className={cn(
            "block rounded-lg border border-border bg-surface p-4 shadow-xs transition-colors hover:border-muted-foreground focus-visible:outline-2 focus-visible:outline-ring",
            !user.is_active && "text-muted-foreground",
          )}
        >
          <div className="flex items-center justify-between gap-4">
            <Person
              name={user.full_name}
              badge={user.id === currentUserId && "это вы"}
              muted={!user.is_active}
              className="font-medium"
              detail={
                <>
                  {ROLE_LABELS[user.role]} · <span className="font-mono">{user.login}</span>
                  {user.phone && ` · ${user.phone}`}
                </>
              }
            />
            {user.is_active ? (
              <StatusBadge tone="success">Активен</StatusBadge>
            ) : (
              <StatusBadge tone="neutral">Отключён</StatusBadge>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
