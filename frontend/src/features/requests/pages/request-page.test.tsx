import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router";
import { jsonResponse, renderWithProviders, residentUser } from "@/test/test-utils";
import { RequestPage } from "./request-page";

const master = {
  id: 3,
  login: "master",
  full_name: "Сергей Кузнецов",
  phone: "+79990000000",
  role: "master",
  is_active: true,
};
const dispatcher = {
  id: 2,
  login: "dispatcher",
  full_name: "Мария Смирнова",
  phone: null,
  role: "dispatcher",
  is_active: true,
};

const request = {
  id: 7,
  resident: { ...residentUser, phone: "+79991112233" },
  room: { id: 3, building: "1", number: "305а", floor: 3 },
  fault_type: { id: 2, code: "electrical", name: "Электрика" },
  fault_description: "Не работает розетка",
  status: "done",
  active_assignment: {
    id: 1,
    master,
    dispatcher,
    due_at: "2026-10-03T15:00:00Z",
    created_at: "2026-10-01T12:00:00Z",
  },
  created_at: "2026-10-01T10:00:00Z",
  updated_at: "2026-10-02T10:00:00Z",
  closed_at: "2026-10-02T10:00:00Z",
};

const history = [
  {
    id: 1,
    changed_by: residentUser,
    old_status: null,
    new_status: "new",
    changed_at: "2026-10-01T10:00:00Z",
  },
  {
    id: 2,
    changed_by: dispatcher,
    old_status: "new",
    new_status: "in_progress",
    changed_at: "2026-10-01T12:00:00Z",
  },
];

const requestFetch = (url: string) =>
  url.includes("/history") ? jsonResponse(history)() : jsonResponse(request)();

const renderPage = (route: string, user = residentUser) =>
  renderWithProviders(
    <Routes>
      <Route path="/requests/:requestId" element={<RequestPage />} />
    </Routes>,
    { route, user },
  );

afterEach(() => vi.unstubAllGlobals());

test("renders request details, assignment and history", async () => {
  vi.stubGlobal("fetch", vi.fn(requestFetch));
  renderPage("/requests/7");
  expect(await screen.findByRole("heading", { name: "Заявка №7" })).toBeInTheDocument();
  expect(screen.getByText("Электрика")).toBeInTheDocument();
  expect(screen.getByText("Выполнена")).toBeInTheDocument();
  expect(screen.getByText("Не работает розетка")).toBeInTheDocument();
  expect(screen.getByText("Сергей Кузнецов")).toBeInTheDocument();
  expect(await screen.findByText("Заявка создана")).toBeInTheDocument();
  expect(screen.getByText("Новая → В работе")).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Переназначить" })).not.toBeInTheDocument();
});

test("shows the resident and lets a dispatcher reassign an open request", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn((url: string) =>
      url.includes("/history")
        ? jsonResponse(history)()
        : jsonResponse({ ...request, status: "in_progress", closed_at: null })(),
    ),
  );
  renderPage("/requests/7", { ...residentUser, id: 2, role: "dispatcher" });
  expect(await screen.findByRole("button", { name: "Переназначить" })).toBeInTheDocument();
  expect(await screen.findByText("Иван Петров")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "+79991112233" })).toHaveAttribute(
    "href",
    "tel:+79991112233",
  );
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
