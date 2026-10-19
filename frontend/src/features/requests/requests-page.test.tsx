import { screen } from "@testing-library/react";
import { jsonResponse, renderWithProviders } from "@/test/test-utils";
import { RequestsPage } from "./requests-page";

afterEach(() => vi.unstubAllGlobals());

test("renders requests from api", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(
      jsonResponse([
        {
          id: 7,
          resident_id: 1,
          room: { id: 3, building: "1", number: "305а", floor: 3 },
          fault_type: { id: 1, code: "plumbing", name: "Сантехника" },
          fault_description: "Течёт кран",
          status: "in_progress",
          created_at: "2026-10-01T10:00:00Z",
          updated_at: "2026-10-01T10:00:00Z",
          closed_at: null,
        },
      ]),
    ),
  );
  renderWithProviders(<RequestsPage />);
  const card = await screen.findByRole("link", { name: /Течёт кран/ });
  expect(card).toHaveAttribute("href", "/requests/7");
  expect(card).toHaveTextContent("Сантехника");
  expect(card).toHaveTextContent("Корпус 1, комн. 305а");
  expect(card).toHaveTextContent("В работе");
  expect(card).toHaveTextContent("Заявка №7");
});

test("shows empty state when there are no requests", async () => {
  vi.stubGlobal("fetch", vi.fn(jsonResponse([])));
  renderWithProviders(<RequestsPage />);
  expect(await screen.findByText("Заявок пока нет")).toBeInTheDocument();
});

test("shows error state when api fails", async () => {
  vi.stubGlobal("fetch", vi.fn(jsonResponse({ detail: "db down" }, 500)));
  renderWithProviders(<RequestsPage />);
  expect(await screen.findByText("Не удалось загрузить заявки")).toBeInTheDocument();
  expect(screen.getByText("db down")).toBeInTheDocument();
});
