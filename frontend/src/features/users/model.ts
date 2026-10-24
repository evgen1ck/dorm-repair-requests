import type { UserResponse } from "@/api/generated/dormitoryRepairRequests.schemas";

export const sortUsers = (users: UserResponse[]) =>
  [...users].sort(
    (a, b) =>
      Number(b.is_active) - Number(a.is_active) || a.full_name.localeCompare(b.full_name, "ru"),
  );
