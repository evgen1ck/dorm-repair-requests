import { createContext, useContext } from "react";
import type { UserResponse } from "@/api/generated/dormitoryRepairRequests.schemas";

export const CurrentUserContext = createContext<UserResponse | null>(null);

export function useCurrentUser(): UserResponse {
  const user = useContext(CurrentUserContext);
  if (!user) throw new Error("useCurrentUser must be used inside an authenticated route");
  return user;
}
