export class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
  }
}

type ValidationItem = { loc?: (string | number)[]; msg?: string };

async function extractDetail(res: Response): Promise<string> {
  try {
    const body = await res.json();
    const detail = body?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail))
      return (detail as ValidationItem[])
        .map((item) => `${(item.loc ?? []).slice(1).join(".")}: ${item.msg ?? "invalid"}`)
        .join("; ");
  } catch {}
  return res.statusText || `HTTP ${res.status}`;
}

export async function apiFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const res = await fetch(url, init);
  if (!res.ok) throw new ApiError(res.status, await extractDetail(res));
  return res;
}
