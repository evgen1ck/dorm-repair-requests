import type { ValidationError } from "./generated/dormitoryRepairRequests.schemas";

export const HttpStatus = {
  NO_CONTENT: 204,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  SERVER_ERROR: 500,
} as const;

export class ApiError extends Error {
  readonly statusCode: number;
  readonly validation: ValidationError[];

  constructor(statusCode: number, message: string, validation: ValidationError[] = []) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.validation = validation;
  }
}

export class NetworkError extends Error {
  constructor() {
    super("Не удалось связаться с сервером. Проверьте подключение и попробуйте ещё раз.");
    this.name = "NetworkError";
  }
}

export type RequestError = ApiError | NetworkError;

export const isApiError = (error: unknown, statusCode?: number): error is ApiError =>
  error instanceof ApiError && (statusCode === undefined || error.statusCode === statusCode);

export const getErrorMessage = (error: unknown): string =>
  error instanceof ApiError || error instanceof NetworkError
    ? error.message
    : "Неизвестная ошибка. Попробуйте ещё раз.";

const toValidationList = (detail: unknown): ValidationError[] | null =>
  Array.isArray(detail) &&
  detail.length > 0 &&
  detail.every((item) => typeof item?.msg === "string")
    ? detail.map((item) => ({ ...item, loc: Array.isArray(item.loc) ? item.loc : [] }))
    : null;

const formatValidationItem = ({ loc, msg }: ValidationError) => {
  const field = loc.slice(1).join(".");
  return field ? `${field}: ${msg}` : msg;
};

const fallbackMessage = (status: number) =>
  status >= HttpStatus.SERVER_ERROR
    ? "Сервер временно недоступен. Попробуйте ещё раз позже."
    : `Не удалось выполнить запрос (код ${status}).`;

async function toApiError(res: Response): Promise<ApiError> {
  const fallback = fallbackMessage(res.status);
  try {
    const detail = (await res.json())?.detail;
    if (typeof detail === "string") return new ApiError(res.status, detail);
    const validation = toValidationList(detail);
    if (validation) {
      return new ApiError(res.status, validation.map(formatValidationItem).join("; "), validation);
    }
  } catch {}
  return new ApiError(res.status, fallback);
}

export async function apiFetch(url: string, init: RequestInit = {}): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new NetworkError();
  }
  if (!res.ok) throw await toApiError(res);
  return res;
}
