import { HttpStatus, apiFetch, type RequestError } from "./client";

export const customFetch = async <T>(url: string, init: RequestInit = {}): Promise<T> => {
  const res = await apiFetch(url, init);
  if (res.status === HttpStatus.NO_CONTENT) return undefined as T;
  return (await res.json()) as T;
};

export type ErrorType<_Error> = RequestError;
export type BodyType<BodyData> = BodyData;
