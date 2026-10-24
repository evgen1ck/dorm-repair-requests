import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ListUsersParams,
  UserCreate,
  UserResponse,
  UserUpdate,
} from "@/api/generated/dormitoryRepairRequests.schemas";
import {
  createUser,
  getGetUserQueryKey,
  getListUsersQueryKey,
  getUser,
  listUsers,
  updateUser,
} from "@/api/generated/users/users";
import { sessionQueryOptions } from "@/features/auth/session";
import { isDbId } from "@/lib/ids";

export const usersQueryOptions = (params: ListUsersParams) =>
  queryOptions({
    queryKey: getListUsersQueryKey(params),
    queryFn: ({ signal }) => listUsers(params, { signal }),
  });

export const useUsers = (params: ListUsersParams = {}) => useQuery(usersQueryOptions(params));

export const useActiveMasters = () => useUsers({ role: "master", is_active: true });

export const useUser = (userId: number) =>
  useQuery({
    queryKey: getGetUserQueryKey(userId),
    queryFn: ({ signal }) => getUser(userId, { signal }),
    enabled: isDbId(userId),
  });

function useStoreUser() {
  const queryClient = useQueryClient();
  return (user: UserResponse) => {
    queryClient.setQueryData(getGetUserQueryKey(user.id), user);
    queryClient.setQueryData(sessionQueryOptions.queryKey, (current) =>
      current?.id === user.id ? user : current,
    );
    queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
  };
}

export function useCreateUser() {
  const storeUser = useStoreUser();
  return useMutation({ mutationFn: (data: UserCreate) => createUser(data), onSuccess: storeUser });
}

export function useUpdateUser(userId: number) {
  const storeUser = useStoreUser();
  return useMutation({
    mutationFn: (data: UserUpdate) => updateUser(userId, data),
    onSuccess: storeUser,
  });
}
