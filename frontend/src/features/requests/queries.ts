import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AssignmentCreate,
  RepairRequestCreate,
  RepairRequestResponse,
  RequestStatus,
} from "@/api/generated/dormitoryRepairRequests.schemas";
import {
  assignRequest,
  changeRequestStatus,
  createRequest,
  getGetRequestHistoryQueryKey,
  getGetRequestQueryKey,
  getListRequestsQueryKey,
  getRequest,
  getRequestHistory,
  listRequests,
} from "@/api/generated/requests/requests";
import { isDbId } from "@/lib/ids";

export const requestsQueryOptions = queryOptions({
  queryKey: getListRequestsQueryKey(),
  queryFn: ({ signal }) => listRequests({}, { signal }),
});

export const requestQueryOptions = (requestId: number) =>
  queryOptions({
    queryKey: getGetRequestQueryKey(requestId),
    queryFn: ({ signal }) => getRequest(requestId, { signal }),
  });

export const requestHistoryQueryOptions = (requestId: number) =>
  queryOptions({
    queryKey: getGetRequestHistoryQueryKey(requestId),
    queryFn: ({ signal }) => getRequestHistory(requestId, { signal }),
  });

const LIVE_REFETCH_INTERVAL = 60_000;

export const useRequests = ({ live = false }: { live?: boolean } = {}) =>
  useQuery({
    ...requestsQueryOptions,
    refetchOnWindowFocus: live,
    refetchInterval: live ? LIVE_REFETCH_INTERVAL : false,
  });

export const useRequest = (requestId: number) =>
  useQuery({
    ...requestQueryOptions(requestId),
    enabled: isDbId(requestId),
    refetchOnWindowFocus: true,
  });

export const useRequestHistory = (requestId: number) =>
  useQuery({ ...requestHistoryQueryOptions(requestId), refetchOnWindowFocus: true });

function useStoreRequest() {
  const queryClient = useQueryClient();
  return (request: RepairRequestResponse) => {
    queryClient.setQueryData(getGetRequestQueryKey(request.id), request);
    queryClient.invalidateQueries({ queryKey: getListRequestsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetRequestHistoryQueryKey(request.id) });
  };
}

export function useCreateRequest() {
  const storeRequest = useStoreRequest();
  return useMutation({
    mutationFn: (data: RepairRequestCreate) => createRequest(data),
    onSuccess: storeRequest,
  });
}

export function useAssignMaster(requestId: number) {
  const storeRequest = useStoreRequest();
  return useMutation({
    mutationFn: (data: AssignmentCreate) => assignRequest(requestId, data),
    onSuccess: storeRequest,
  });
}

export function useChangeStatus(requestId: number) {
  const storeRequest = useStoreRequest();
  return useMutation({
    mutationFn: (status: RequestStatus) => changeRequestStatus(requestId, { status }),
    onSuccess: storeRequest,
  });
}
