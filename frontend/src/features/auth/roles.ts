import type { UserRole } from "@/api/generated/dormitoryRepairRequests.schemas";

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Администратор",
  resident: "Жилец",
  dispatcher: "Диспетчер",
  master: "Мастер",
};

export const HOME_PATH = "/requests";
