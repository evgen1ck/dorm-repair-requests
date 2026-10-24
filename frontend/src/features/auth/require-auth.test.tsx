import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router";
import { jsonResponse, renderWithProviders, residentUser } from "@/test/test-utils";
import { RequireAuth } from "./require-auth";

const renderGuarded = () =>
  renderWithProviders(
    <Routes>
      <Route path="/login" element={<p>Страница входа</p>} />
      <Route element={<RequireAuth />}>
        <Route path="/requests" element={<p>Список заявок</p>} />
      </Route>
    </Routes>,
    { route: "/requests", user: null },
  );

afterEach(() => vi.unstubAllGlobals());

test("renders the protected page for an authenticated user", async () => {
  vi.stubGlobal("fetch", vi.fn(jsonResponse(residentUser)));
  renderGuarded();
  expect(await screen.findByText("Список заявок")).toBeInTheDocument();
});

test("redirects to login when the session is missing", async () => {
  vi.stubGlobal("fetch", vi.fn(jsonResponse({ detail: "Требуется вход" }, 401)));
  renderGuarded();
  expect(await screen.findByText("Страница входа")).toBeInTheDocument();
});

test("offers a retry when the server is unreachable", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(() => Promise.reject(new TypeError("Failed to fetch"))),
  );
  renderGuarded();
  expect(await screen.findByText("Сервер недоступен")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Повторить" })).toBeInTheDocument();
});
