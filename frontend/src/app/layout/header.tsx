import { Link, NavLink } from "react-router";
import { LogOut } from "lucide-react";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentUser } from "@/features/auth/current-user-context";
import { HOME_PATH, ROLE_LABELS } from "@/features/auth/roles";
import { useLogout } from "@/features/auth/session";
import { cn } from "@/lib/utils";
import { navItemsFor } from "@/app/navigation";

function UserMenu() {
  const user = useCurrentUser();
  const logout = useLogout();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 pl-1"
          aria-label={`${user.full_name}, меню пользователя`}
        >
          <UserAvatar name={user.full_name} />
          <span className="hidden max-w-40 truncate sm:inline">{user.full_name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="space-y-0.5">
          <p className="truncate text-sm font-medium text-foreground">{user.full_name}</p>
          <p>{ROLE_LABELS[user.role]}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled={logout.isPending} onSelect={() => logout.mutate()}>
          <LogOut aria-hidden />
          Выйти
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Header({ containerClassName }: { containerClassName: string }) {
  const user = useCurrentUser();
  return (
    <header className="border-b border-border bg-surface/60">
      <div className={cn("flex h-14 items-center gap-6", containerClassName)}>
        <Link
          to={HOME_PATH}
          className="hidden shrink-0 rounded-sm text-sm font-semibold tracking-tight outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:block"
        >
          Заявки на ремонт
        </Link>
        <nav
          aria-label="Основная навигация"
          className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto"
        >
          {navItemsFor(user.role).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-2 py-1 text-sm whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  isActive
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
