import type { UserRole } from "@/api/generated/dormitoryRepairRequests.schemas";
import { LIST_COPY } from "@/features/requests/labels";

export type NavItem = { to: string; label: string };

export const REPORT_ROLES: UserRole[] = ["dispatcher", "admin"];
export const ADMIN_ROLES: UserRole[] = ["admin"];

export const navItemsFor = (role: UserRole): NavItem[] => [
  { to: "/requests", label: LIST_COPY[role].title },
  ...(REPORT_ROLES.includes(role) ? [{ to: "/reports", label: "Отчёт" }] : []),
  ...(ADMIN_ROLES.includes(role) ? [{ to: "/users", label: "Пользователи" }] : []),
];
