import { Outlet } from "react-router";
import type { UserRole } from "@/api/generated/dormitoryRepairRequests.schemas";
import { useCurrentUser } from "@/features/auth/current-user-context";
import { cn } from "@/lib/utils";
import { Header } from "./header";

const WIDE_ROLES: UserRole[] = ["dispatcher", "admin"];

export function AppLayout() {
  const { role } = useCurrentUser();
  const containerClassName = cn(
    "mx-auto px-4",
    WIDE_ROLES.includes(role) ? "max-w-7xl" : "max-w-3xl",
  );

  return (
    <div className="min-h-svh">
      <Header containerClassName={containerClassName} />
      <main className={cn(containerClassName, "py-6")}>
        <Outlet />
      </main>
    </div>
  );
}
