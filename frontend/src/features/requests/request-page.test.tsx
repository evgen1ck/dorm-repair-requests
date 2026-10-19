import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router";
import { jsonResponse, renderWithProviders } from "@/test/test-utils";
import { RequestPage } from "./request-page";

const request = {
  id: 7,
  resident_id: 1,
  room: { id: 3, building: "1", number: "305а", floor: 3 },
  fault_type: { id: 2, code: "electrical", name: "Электрика" },
  fault_description: "Не работает розетка",
  status: "done",
  created_at: "2026-10-01T10:00:00Z",
  updated_at: "2026-10-02T10:00:00Z",
  closed_at: "2026-10-02T10:00:00Z",
};

const renderPage = (route: string) =>
  renderWithProviders(
    <Routes>
      <Route path="/requests/:requestId" element={<RequestPage />} />
    </Routes>,
    route,
  );

afterEach(() => vi.unstubAllGlobals());

test("renders request details", async () => {
  vi.stubGlobal("fetch", vi.fn(jsonResponse(request)));
  renderPage("/requests/7");
  expect(await screen.findByRole("heading", { name: "Заявка №7" })).toBeInTheDocument();
  expect(screen.getByText("Электрика")).toBeInTheDocument();
  expect(screen.getByText("Выполнена")).toBeInTheDocument();
  expect(screen.getByText("Не работает розетка")).toBeInTheDocument();
});

test("shows not found state on 404", async () => {
  vi.stubGlobal("fetch", vi.fn(jsonResponse({ detail: "Заявка не найдена" }, 404)));
  renderPage("/requests/999");
  expect(await screen.findByText("Заявка не найдена")).toBeInTheDocument();
});

test("shows load error for other failures", async () => {
  vi.stubGlobal("fetch", vi.fn(jsonResponse({ detail: "db down" }, 500)));
  renderPage("/requests/7");
  expect(await screen.findByText("Не удалось загрузить заявку")).toBeInTheDocument();
  expect(screen.getByText("db down")).toBeInTheDocument();
});
