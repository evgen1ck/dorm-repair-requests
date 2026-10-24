import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { HttpStatus, isApiError } from "@/api/client";
import { getMeQueryKey } from "@/api/generated/auth/auth";

const MAX_RETRIES = 2;

const retryServerErrorsOnly = (failureCount: number, error: unknown) =>
  failureCount < MAX_RETRIES && (!isApiError(error) || error.statusCode >= HttpStatus.SERVER_ERROR);

export function createQueryClient() {
  const queryClient: QueryClient = new QueryClient({
    queryCache: new QueryCache({ onError: (error) => dropExpiredSession(queryClient, error) }),
    mutationCache: new MutationCache({
      onError: (error) => dropExpiredSession(queryClient, error),
    }),
    defaultOptions: {
      queries: { retry: retryServerErrorsOnly, refetchOnWindowFocus: false, staleTime: 30_000 },
    },
  });
  return queryClient;
}

function dropExpiredSession(queryClient: QueryClient, error: unknown) {
  if (!isApiError(error, HttpStatus.UNAUTHORIZED) || !queryClient.getQueryData(getMeQueryKey()))
    return;
  queryClient.setQueryData(getMeQueryKey(), null);
  toast.warning("Сессия истекла", { description: "Войдите снова, чтобы продолжить." });
}
