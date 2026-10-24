import { screen, within } from "@testing-library/react";
import { jsonResponse, renderWithProviders, residentUser } from "@/test/test-utils";
import { UsersPage } from "./users-page";

const admin = { ...residentUser, id: 4, full_name: "Администратор", role: "admin" as const };
const master = {
  id: 3,
  login: "master",
  full_name: "Сергей Кузнецов",
  phone: null,
  role: "master",
  is_active: false,
};

const usersFetch = jsonResponse([master, admin, residentUser]);

afterEach(() => vi.unstubAllGlobals());

test("lists active users first, marks inactive ones and the current admin", async () => {
  vi.stubGlobal("fetch", vi.fn(usersFetch));
  renderWithProviders(<UsersPage />, { user: admin });
  const rows = (await screen.findAllByRole("row")).slice(1);
  expect(rows.map((row) => row.textContent)).toEqual([
    expect.stringContaining("Администратор"),
    expect.stringContaining("Иван Петров"),
    expect.stringContaining("Сергей Кузнецов"),
  ]);
  expect(rows[0]).toHaveTextContent("это вы");
  expect(rows[2]).toHaveTextContent("Отключён");
  expect(screen.getByRole("link", { name: "Сергей Кузнецов" })).toHaveAttribute("href", "/users/3");
});

test("filters by role from the url", async () => {
  vi.stubGlobal("fetch", vi.fn(usersFetch));
  renderWithProviders(<UsersPage />, { route: "/users?role=master", user: admin });
  const table = within(await screen.findByRole("table"));
  expect(table.getByText("Сергей Кузнецов")).toBeInTheDocument();
  expect(table.queryByText("Иван Петров")).not.toBeInTheDocument();
});
