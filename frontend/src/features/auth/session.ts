import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { HttpStatus, getErrorMessage, isApiError } from "@/api/client";
import { getMeQueryKey, login, logout, me } from "@/api/generated/auth/auth";
import type { LoginRequest, UserResponse } from "@/api/generated/dormitoryRepairRequests.schemas";

export type Session = UserResponse | null;

export const sessionQueryOptions = queryOptions({
  queryKey: getMeQueryKey(),
  queryFn: async ({ signal }): Promise<Session> => {
    try {
      return await me({ signal });
    } catch (error) {
      if (isApiError(error, HttpStatus.UNAUTHORIZED)) return null;
      throw error;
    }
  },
  staleTime: Infinity,
  retry: false,
});

export const useSession = () => useQuery(sessionQueryOptions);

const removeUserScopedQueries = (queryClient: QueryClient) =>
  queryClient.removeQueries({
    predicate: (query) => query.queryKey[0] !== sessionQueryOptions.queryKey[0],
  });

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credentials: LoginRequest) => login(credentials),
    onSuccess: (user) => {
      removeUserScopedQueries(queryClient);
      queryClient.setQueryData(sessionQueryOptions.queryKey, user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      queryClient.setQueryData(sessionQueryOptions.queryKey, null);
      removeUserScopedQueries(queryClient);
    },
    onError: (error) => {
      if (isApiError(error, HttpStatus.UNAUTHORIZED)) return;
      toast.error("Не удалось выйти", { description: getErrorMessage(error) });
    },
  });
}
