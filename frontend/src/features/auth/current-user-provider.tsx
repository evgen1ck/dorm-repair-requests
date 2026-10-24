import type { ReactNode } from "react";
import type { UserResponse } from "@/api/generated/dormitoryRepairRequests.schemas";
import { CurrentUserContext } from "./current-user-context";

export function CurrentUserProvider({
  user,
  children,
}: {
  user: UserResponse;
  children: ReactNode;
}) {
  return <CurrentUserContext.Provider value={user}>{children}</CurrentUserContext.Provider>;
}
