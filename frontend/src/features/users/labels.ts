import type { UserRole } from "@/api/generated/dormitoryRepairRequests.schemas";
import { ROLE_LABELS } from "@/features/auth/roles";

export const ROLE_ORDER: UserRole[] = ["resident", "dispatcher", "master", "admin"];

export const ROLE_FILTERS: { value?: UserRole; label: string }[] = [
  { label: "Все" },
  { value: "resident", label: "Жильцы" },
  { value: "dispatcher", label: "Диспетчеры" },
  { value: "master", label: "Мастера" },
  { value: "admin", label: "Администраторы" },
];

export const ROLE_OPTIONS = ROLE_ORDER.map((role) => ({ value: role, label: ROLE_LABELS[role] }));
