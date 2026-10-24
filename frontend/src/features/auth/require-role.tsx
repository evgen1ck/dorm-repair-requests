import { Outlet } from "react-router";
import type { UserRole } from "@/api/generated/dormitoryRepairRequests.schemas";
import { ForbiddenPage } from "./forbidden-page";
import { useCurrentUser } from "./current-user-context";

export function RequireRole({ roles }: { roles: readonly UserRole[] }) {
  const user = useCurrentUser();
  return roles.includes(user.role) ? <Outlet /> : <ForbiddenPage />;
}
