import { screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import type { RepairRequestResponse } from "@/api/generated/dormitoryRepairRequests.schemas";
import { jsonResponse, renderWithProviders, residentUser } from "@/test/test-utils";
import { StatusActions } from "./status-actions";

const request = {
  id: 7,
  resident: residentUser,
  room: { id: 3, building: "1", number: "305а", floor: 3 },
  fault_type: { id: 2, code: "electrical", name: "Электрика" },
  fault_description: "Не работает розетка",
  status: "in_progress",
  active_assignment: null,
  created_at: "2026-10-01T10:00:00Z",
  updated_at: "2026-10-02T10:00:00Z",
  closed_at: null,
} satisfies RepairRequestResponse;

afterEach(() => vi.unstubAllGlobals());

test("marks a request in progress as done", async () => {
  const fetchMock = vi.fn((_url: string, _init?: RequestInit) =>
    jsonResponse({ ...request, status: "done" })(),
  );
  vi.stubGlobal("fetch", fetchMock);
  renderWithProviders(<StatusActions request={request} />);
  await userEvent.click(screen.getByRole("button", { name: "Отметить выполненной" }));
  await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled());
  const [url, init] = fetchMock.mock.calls[0]!;
  expect(url).toBe("/api/v1/requests/7/status");
  expect(init?.method).toBe("PATCH");
  expect(JSON.parse(init?.body as string)).toEqual({ status: "done" });
});

test("offers to reopen a done request", () => {
  renderWithProviders(<StatusActions request={{ ...request, status: "done" }} />);
  expect(screen.getByRole("button", { name: "Вернуть в работу" })).toBeInTheDocument();
});

test("shows a server conflict inline", async () => {
  vi.stubGlobal("fetch", vi.fn(jsonResponse({ detail: "Переход недопустим" }, 409)));
  renderWithProviders(<StatusActions request={request} />);
  await userEvent.click(screen.getByRole("button", { name: "Отметить выполненной" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Переход недопустим");
});
