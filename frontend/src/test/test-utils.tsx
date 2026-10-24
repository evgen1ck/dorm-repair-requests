import type { ReactNode } from "react";
import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, type InitialEntry } from "react-router";
import type { UserResponse } from "@/api/generated/dormitoryRepairRequests.schemas";
import { CurrentUserProvider } from "@/features/auth/current-user-provider";

export const residentUser: UserResponse = {
  id: 1,
  login: "ivan",
  full_name: "Иван Петров",
  phone: null,
  role: "resident",
  is_active: true,
};

export function renderWithProviders(
  ui: ReactNode,
  { route = "/", user = residentUser }: { route?: InitialEntry; user?: UserResponse | null } = {},
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        {user ? <CurrentUserProvider user={user}>{ui}</CurrentUserProvider> : ui}
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

export const jsonResponse =
  (body: unknown, status = 200) =>
  () =>
    new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
