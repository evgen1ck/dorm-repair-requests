import type { ReactNode } from "react";
import { renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getListRequestsQueryKey } from "@/api/generated/requests/requests";
import { jsonResponse, residentUser } from "@/test/test-utils";
import { sessionQueryOptions, useLogin } from "./session";

afterEach(() => vi.unstubAllGlobals());

test("login drops data cached for the previous user", async () => {
  const queryClient = new QueryClient();
  queryClient.setQueryData(getListRequestsQueryKey(), [{ id: 7 }]);
  vi.stubGlobal("fetch", vi.fn(jsonResponse(residentUser)));
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const { result } = renderHook(() => useLogin(), { wrapper });

  await result.current.mutateAsync({ login: "ivan", password: "ivan" });

  expect(queryClient.getQueryData(getListRequestsQueryKey())).toBeUndefined();
  expect(queryClient.getQueryData(sessionQueryOptions.queryKey)).toEqual(residentUser);
});
