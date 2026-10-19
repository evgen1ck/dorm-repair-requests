import { ApiError, apiFetch } from "./client";

export const customFetch = async <T>(url: string, init: RequestInit = {}): Promise<T> => {
  const res = await apiFetch(url, init);
  return (await res.json()) as T;
};

export type ErrorType<_Error> = ApiError;
export type BodyType<BodyData> = BodyData;
