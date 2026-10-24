import { apiFetch } from "./client";
import { customFetch } from "./mutator";

const okJson = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

test("passes init through and returns the response", async () => {
  fetchMock.mockResolvedValueOnce(okJson({ id: 1 }, 201));
  const res = await apiFetch("/api/v1/requests", { method: "POST" });
  expect(res.status).toBe(201);
  expect(fetchMock.mock.calls[0][1]).toEqual({ method: "POST" });
});

test("string detail becomes ApiError message", async () => {
  fetchMock.mockResolvedValueOnce(okJson({ detail: "Заявка не найдена" }, 404));
  await expect(apiFetch("/x")).rejects.toMatchObject({
    name: "ApiError",
    statusCode: 404,
    message: "Заявка не найдена",
  });
});

test("422 array detail is joined and kept for field mapping", async () => {
  const detail = [{ loc: ["body", "room_id"], msg: "field required", type: "missing" }];
  fetchMock.mockResolvedValueOnce(okJson({ detail }, 422));
  await expect(apiFetch("/x")).rejects.toMatchObject({
    statusCode: 422,
    message: "room_id: field required",
    validation: detail,
  });
});

test("422 items keep their message when loc is missing or names no field", async () => {
  const detail = [
    { msg: "Срок уже прошёл", type: "value_error" },
    { loc: ["body"], msg: "Даты перепутаны", type: "value_error" },
  ];
  fetchMock.mockResolvedValueOnce(okJson({ detail }, 422));
  await expect(apiFetch("/x")).rejects.toMatchObject({
    statusCode: 422,
    message: "Срок уже прошёл; Даты перепутаны",
    validation: [{ loc: [], msg: "Срок уже прошёл" }, detail[1]],
  });
});

test("empty 422 detail falls back to a localized message with the status code", async () => {
  fetchMock.mockResolvedValueOnce(okJson({ detail: [] }, 422));
  await expect(apiFetch("/x")).rejects.toMatchObject({
    message: "Не удалось выполнить запрос (код 422).",
    validation: [],
  });
});

test("non-json server error falls back to a localized message", async () => {
  fetchMock.mockResolvedValueOnce(new Response("boom", { status: 502, statusText: "Bad Gateway" }));
  await expect(apiFetch("/x")).rejects.toMatchObject({
    message: "Сервер временно недоступен. Попробуйте ещё раз позже.",
  });
});

test("failed fetch becomes NetworkError", async () => {
  fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));
  await expect(apiFetch("/x")).rejects.toMatchObject({ name: "NetworkError" });
});

test("aborted fetch is rethrown as is", async () => {
  fetchMock.mockRejectedValueOnce(new DOMException("aborted", "AbortError"));
  await expect(apiFetch("/x")).rejects.toMatchObject({ name: "AbortError" });
});

test("customFetch returns undefined for 204", async () => {
  fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));
  await expect(customFetch("/x", { method: "POST" })).resolves.toBeUndefined();
});
