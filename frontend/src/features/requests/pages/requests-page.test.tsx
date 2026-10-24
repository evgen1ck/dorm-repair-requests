import { screen, within } from "@testing-library/react";
import { jsonResponse, renderWithProviders, residentUser } from "@/test/test-utils";
import { RequestsPage } from "./requests-page";

const request = {
  id: 7,
  resident: residentUser,
  room: { id: 3, building: "1", number: "305а", floor: 3 },
  fault_type: { id: 1, code: "plumbing", name: "Сантехника" },
  fault_description: "Течёт кран",
  status: "in_progress",
  active_assignment: null,
  created_at: "2026-10-01T10:00:00Z",
  updated_at: "2026-10-01T10:00:00Z",
  closed_at: null,
};

afterEach(() => vi.unstubAllGlobals());

test("renders requests as cards for a resident", async () => {
  vi.stubGlobal("fetch", vi.fn(jsonResponse([request])));
  renderWithProviders(<RequestsPage />);
  const card = await screen.findByRole("link", { name: /Течёт кран/ });
  expect(card).toHaveAttribute("href", "/requests/7");
  expect(card).toHaveTextContent("Сантехника");
  expect(card).toHaveTextContent("Корпус 1, комн. 305а");
  expect(card).toHaveTextContent("В работе");
  expect(card).toHaveTextContent("Заявка №7");
  expect(screen.queryByRole("navigation", { name: "Фильтр по статусу" })).not.toBeInTheDocument();
});

test("renders a table with resident names and status filter for a dispatcher", async () => {
  vi.stubGlobal("fetch", vi.fn(jsonResponse([request])));
  renderWithProviders(<RequestsPage />, {
    route: "/requests?status=in_progress",
    user: { ...residentUser, id: 2, role: "dispatcher" },
  });
  const row = (await screen.findByRole("link", { name: "Течёт кран" })).closest("tr")!;
  expect(await screen.findByText("Иван Петров")).toBeInTheDocument();
  expect(row).toHaveTextContent("Не назначен");
  const filter = within(screen.getByRole("navigation", { name: "Фильтр по статусу" }));
  const activeFilter = filter.getByRole("link", { name: /^В работе/ });
  expect(activeFilter).toHaveAttribute("aria-current", "page");
  expect(activeFilter).toHaveTextContent("В работе 1");
});

test("shows empty state when there are no requests", async () => {
  vi.stubGlobal("fetch", vi.fn(jsonResponse([])));
  renderWithProviders(<RequestsPage />);
  expect(await screen.findByText("Заявок пока нет")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Новая заявка" })).toHaveAttribute(
    "href",
    "/requests/new",
  );
});

test("shows error state when api fails", async () => {
  vi.stubGlobal("fetch", vi.fn(jsonResponse({ detail: "db down" }, 500)));
  renderWithProviders(<RequestsPage />);
  expect(await screen.findByText("Не удалось загрузить заявки")).toBeInTheDocument();
  expect(screen.getByText("db down")).toBeInTheDocument();
});
