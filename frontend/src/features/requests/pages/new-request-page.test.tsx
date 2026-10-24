import { screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { Route, Routes, useNavigate } from "react-router";
import { jsonResponse, renderWithProviders } from "@/test/test-utils";
import { NewRequestPage } from "./new-request-page";

const rooms = [{ id: 3, building: "1", number: "305а", floor: 3 }];
const faultTypes = [{ id: 1, code: "plumbing", name: "Сантехника" }];

const lookupsFetch = (url: string) =>
  url.includes("/rooms") ? jsonResponse(rooms)() : jsonResponse(faultTypes)();

function RequestPageStub() {
  const navigate = useNavigate();
  return <button onClick={() => navigate(-1)}>Страница заявки</button>;
}

const renderPage = () =>
  renderWithProviders(
    <Routes>
      <Route path="/" element={<NewRequestPage />} />
      <Route path="/requests/:requestId" element={<RequestPageStub />} />
    </Routes>,
  );

afterEach(() => vi.unstubAllGlobals());

test("shows validation errors on empty submit", async () => {
  vi.stubGlobal("fetch", vi.fn(lookupsFetch));
  renderPage();
  await screen.findByRole("combobox", { name: "Комната" });
  await screen.findByRole("combobox", { name: "Тип неисправности" });

  await userEvent.click(screen.getByRole("button", { name: "Создать заявку" }));

  expect(await screen.findByText("Опишите неисправность")).toBeInTheDocument();
  expect(screen.getByRole("combobox", { name: "Комната" })).toHaveAccessibleDescription(
    "Выберите комнату",
  );
  expect(screen.getByRole("combobox", { name: "Тип неисправности" })).toHaveAccessibleDescription(
    "Выберите тип неисправности",
  );
  expect(screen.getByLabelText("Описание")).toHaveAccessibleDescription("Опишите неисправность");
});

test("shows error when lookups fail to load", async () => {
  vi.stubGlobal("fetch", vi.fn(jsonResponse({ detail: "db down" }, 500)));
  renderPage();
  expect(await screen.findByText("Не удалось загрузить комнаты: db down")).toBeInTheDocument();
  expect(
    await screen.findByText("Не удалось загрузить типы неисправностей: db down"),
  ).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Создать заявку" })).toBeDisabled();
});

test("submits the request and replaces the form with it in history", async () => {
  const fetchMock = vi.fn((url: string, init?: RequestInit) =>
    init?.method === "POST" ? jsonResponse({ id: 42 }, 201)() : lookupsFetch(url),
  );
  vi.stubGlobal("fetch", fetchMock);
  renderPage();
  const user = userEvent.setup();

  await user.click(await screen.findByRole("combobox", { name: "Комната" }));
  await user.click(await screen.findByRole("option", { name: "Корпус 1, комн. 305а" }));
  await user.click(await screen.findByRole("combobox", { name: "Тип неисправности" }));
  await user.click(await screen.findByRole("option", { name: "Сантехника" }));
  await user.type(screen.getByLabelText("Описание"), "  Течёт кран  ");
  await user.click(screen.getByRole("button", { name: "Создать заявку" }));

  await user.click(await screen.findByRole("button", { name: "Страница заявки" }));
  expect(screen.getByRole("button", { name: "Страница заявки" })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Создать заявку" })).not.toBeInTheDocument();
  const [, init] = fetchMock.mock.calls.find(([, i]) => i?.method === "POST")!;
  expect(JSON.parse(init!.body as string)).toEqual({
    room_id: 3,
    fault_type_id: 1,
    fault_description: "Течёт кран",
  });
});
