import { apiFetch } from "./client";

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

test("422 array detail is joined without the body prefix", async () => {
  fetchMock.mockResolvedValueOnce(
    okJson({ detail: [{ loc: ["body", "room_id"], msg: "field required" }] }, 422),
  );
  await expect(apiFetch("/x")).rejects.toMatchObject({
    statusCode: 422,
    message: "room_id: field required",
  });
});

test("non-json error body falls back to status text", async () => {
  fetchMock.mockResolvedValueOnce(new Response("boom", { status: 502, statusText: "Bad Gateway" }));
  await expect(apiFetch("/x")).rejects.toMatchObject({ message: "Bad Gateway" });
});
