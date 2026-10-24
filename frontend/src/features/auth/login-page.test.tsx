import { screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { Route, Routes, type InitialEntry } from "react-router";
import { jsonResponse, renderWithProviders, residentUser } from "@/test/test-utils";
import { LoginPage } from "./login-page";

const unauthorized = jsonResponse({ detail: "Требуется вход" }, 401);

const renderPage = (route: InitialEntry = "/login") =>
  renderWithProviders(
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/requests" element={<p>Список заявок</p>} />
      <Route path="/requests/7" element={<p>Заявка 7</p>} />
    </Routes>,
    { route, user: null },
  );

const fillAndSubmit = async (login: string, password: string) => {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Логин"), login);
  await user.type(screen.getByLabelText("Пароль"), password);
  await user.click(screen.getByRole("button", { name: "Войти" }));
};

afterEach(() => vi.unstubAllGlobals());

test("shows validation errors on empty submit", async () => {
  vi.stubGlobal("fetch", vi.fn(unauthorized));
  renderPage();
  await userEvent.click(screen.getByRole("button", { name: "Войти" }));
  expect(await screen.findByText("Введите логин")).toBeInTheDocument();
  expect(screen.getByLabelText("Пароль")).toHaveAccessibleDescription("Введите пароль");
});

test("shows inline error on wrong credentials", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn((_url: string, init?: RequestInit) =>
      init?.method === "POST"
        ? jsonResponse({ detail: "Неверный логин или пароль" }, 401)()
        : unauthorized(),
    ),
  );
  renderPage();
  await fillAndSubmit("ivan", "wrong");
  expect(await screen.findByRole("alert")).toHaveTextContent("Неверный логин или пароль");
  expect(screen.getByLabelText("Пароль")).toHaveFocus();
});

test("shows network error when the server is unreachable", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn((_url: string, init?: RequestInit) =>
      init?.method === "POST" ? Promise.reject(new TypeError("Failed to fetch")) : unauthorized(),
    ),
  );
  renderPage();
  await fillAndSubmit("ivan", "secret");
  expect(await screen.findByRole("alert")).toHaveTextContent("Не удалось связаться с сервером");
});

test("logs in and goes to the requests list", async () => {
  const fetchMock = vi.fn((_url: string, init?: RequestInit) =>
    init?.method === "POST" ? jsonResponse(residentUser)() : unauthorized(),
  );
  vi.stubGlobal("fetch", fetchMock);
  renderPage();
  await fillAndSubmit("  ivan ", "secret");
  expect(await screen.findByText("Список заявок")).toBeInTheDocument();
  const [, init] = fetchMock.mock.calls.find(([, i]) => i?.method === "POST")!;
  expect(JSON.parse(init!.body as string)).toEqual({ login: "ivan", password: "secret" });
});

test("returns to the page the user came from", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn((_url: string, init?: RequestInit) =>
      init?.method === "POST" ? jsonResponse(residentUser)() : unauthorized(),
    ),
  );
  renderPage({ pathname: "/login", state: { from: { pathname: "/requests/7", search: "" } } });
  await fillAndSubmit("ivan", "secret");
  expect(await screen.findByText("Заявка 7")).toBeInTheDocument();
});

test("sends an already signed in user to the requests list", async () => {
  vi.stubGlobal("fetch", vi.fn(jsonResponse(residentUser)));
  renderPage();
  expect(await screen.findByText("Список заявок")).toBeInTheDocument();
});
