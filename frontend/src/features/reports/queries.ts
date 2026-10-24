import { keepPreviousData, queryOptions, useQuery } from "@tanstack/react-query";
import {
  getRequestsByFaultTypeQueryKey,
  requestsByFaultType,
} from "@/api/generated/reports/reports";
import type { Period } from "./period";

export const faultTypeReportQueryOptions = ({ from, to }: Period) =>
  queryOptions({
    queryKey: getRequestsByFaultTypeQueryKey({ date_from: from, date_to: to }),
    queryFn: ({ signal }) => requestsByFaultType({ date_from: from, date_to: to }, { signal }),
  });

export const useFaultTypeReport = (period: Period, enabled = true) =>
  useQuery({ ...faultTypeReportQueryOptions(period), enabled, placeholderData: keepPreviousData });
