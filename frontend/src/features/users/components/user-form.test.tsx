import { screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { jsonResponse, renderWithProviders } from "@/test/test-utils";
import { CreateUserForm, EditUserForm } from "./user-form";

afterEach(() => vi.unstubAllGlobals());

test("creates a user with the entered fields and a null phone", async () => {
  const onCreated = vi.fn();
  const fetchMock = vi.fn((_url: string, _init?: RequestInit) =>
    jsonResponse(
      {
        id: 9,
        login: "olga",
        full_name: "Ольга",
        phone: null,
        role: "dispatcher",
        is_active: true,
      },
      201,
    )(),
  );
  vi.stubGlobal("fetch", fetchMock);
  renderWithProviders(<CreateUserForm onCreated={onCreated} />);
  const user = userEvent.setup();

  await user.type(screen.getByLabelText("Имя"), "Ольга");
  await user.click(screen.getByRole("combobox", { name: "Роль" }));
  await user.click(await screen.findByRole("option", { name: "Диспетчер" }));
  await user.type(screen.getByLabelText("Логин"), "olga");
  await user.type(screen.getByLabelText("Пароль"), "secret123");
  await user.click(screen.getByRole("button", { name: "Создать пользователя" }));

  await vi.waitFor(() => expect(onCreated).toHaveBeenCalled());
  const [, init] = fetchMock.mock.calls[0]!;
  expect(JSON.parse(init?.body as string)).toEqual({
    full_name: "Ольга",
    phone: null,
    role: "dispatcher",
    login: "olga",
    password: "secret123",
  });
});

test("shows a taken login from the server", async () => {
  vi.stubGlobal("fetch", vi.fn(jsonResponse({ detail: "Логин уже занят" }, 409)));
  renderWithProviders(<CreateUserForm onCreated={() => {}} />);
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Имя"), "Ольга");
  await user.type(screen.getByLabelText("Логин"), "olga");
  await user.type(screen.getByLabelText("Пароль"), "secret123");
  await user.click(screen.getByRole("button", { name: "Создать пользователя" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Логин уже занят");
});

test("sends only changed fields when editing", async () => {
  const onSaved = vi.fn();
  const existing = {
    id: 3,
    login: "master",
    full_name: "Сергей Кузнецов",
    phone: null,
    role: "master" as const,
    is_active: true,
  };
  const fetchMock = vi.fn((_url: string, _init?: RequestInit) =>
    jsonResponse({ ...existing, phone: "+79990001122" })(),
  );
  vi.stubGlobal("fetch", fetchMock);
  renderWithProviders(<EditUserForm user={existing} isSelf={false} onSaved={onSaved} />);
  const user = userEvent.setup();

  await user.type(screen.getByLabelText("Телефон"), "+79990001122");
  await user.click(screen.getByRole("switch", { name: "Доступ в систему" }));
  await user.click(screen.getByRole("button", { name: "Сохранить" }));

  await vi.waitFor(() => expect(onSaved).toHaveBeenCalled());
  const [url, init] = fetchMock.mock.calls[0]!;
  expect(url).toBe("/api/v1/users/3");
  expect(init?.method).toBe("PATCH");
  expect(JSON.parse(init?.body as string)).toEqual({ phone: "+79990001122", is_active: false });
});

test("locks role and access for the admin's own account", () => {
  renderWithProviders(
    <EditUserForm
      user={{
        id: 4,
        login: "admin",
        full_name: "Админ",
        phone: null,
        role: "admin",
        is_active: true,
      }}
      isSelf
      onSaved={() => {}}
    />,
  );
  expect(screen.getByRole("combobox", { name: "Роль" })).toBeDisabled();
  expect(screen.getByRole("switch", { name: "Доступ в систему" })).toBeDisabled();
});
