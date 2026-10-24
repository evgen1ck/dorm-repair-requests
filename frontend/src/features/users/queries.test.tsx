import type { ReactNode } from "react";
import { renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { sessionQueryOptions } from "@/features/auth/session";
import { jsonResponse, residentUser } from "@/test/test-utils";
import { useUpdateUser } from "./queries";

const admin = { ...residentUser, id: 4, full_name: "Администратор", role: "admin" as const };

afterEach(() => vi.unstubAllGlobals());

test("saving a user refreshes the session only when it is the current user", async () => {
  const queryClient = new QueryClient();
  queryClient.setQueryData(sessionQueryOptions.queryKey, admin);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  vi.stubGlobal("fetch", vi.fn(jsonResponse({ ...residentUser, full_name: "Иван Сидоров" })));
  const other = renderHook(() => useUpdateUser(residentUser.id), { wrapper });
  await other.result.current.mutateAsync({ full_name: "Иван Сидоров" });
  expect(queryClient.getQueryData(sessionQueryOptions.queryKey)).toEqual(admin);

  vi.stubGlobal("fetch", vi.fn(jsonResponse({ ...admin, full_name: "Главный админ" })));
  const self = renderHook(() => useUpdateUser(admin.id), { wrapper });
  await self.result.current.mutateAsync({ full_name: "Главный админ" });
  expect(queryClient.getQueryData(sessionQueryOptions.queryKey)).toEqual({
    ...admin,
    full_name: "Главный админ",
  });
});
