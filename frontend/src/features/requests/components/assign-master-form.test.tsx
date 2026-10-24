import { screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import dayjs from "dayjs";
import { jsonResponse, renderWithProviders } from "@/test/test-utils";
import { AssignMasterForm } from "./assign-master-form";

const masters = [
  {
    id: 3,
    login: "master",
    full_name: "Сергей Кузнецов",
    phone: null,
    role: "master",
    is_active: true,
  },
];

const dueDate = dayjs().add(1, "month").date(15);

async function fillForm(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole("combobox", { name: "Мастер" }));
  await user.click(await screen.findByRole("option", { name: "Сергей Кузнецов" }));
  await user.click(screen.getByLabelText("Срок выполнения"));
  await user.click(await screen.findByRole("button", { name: "Следующий месяц" }));
  await user.click(screen.getByRole("button", { name: new RegExp(dueDate.format("D MMMM YYYY")) }));
  await user.click(screen.getByRole("combobox", { name: "Часы" }));
  await user.click(await screen.findByRole("option", { name: "18" }));
  await user.click(screen.getByRole("combobox", { name: "Минуты" }));
  await user.click(await screen.findByRole("option", { name: "30" }));
  await user.click(screen.getByRole("button", { name: "Готово" }));
}

afterEach(() => vi.unstubAllGlobals());

test("shows validation errors on empty submit", async () => {
  vi.stubGlobal("fetch", vi.fn(jsonResponse(masters)));
  renderWithProviders(<AssignMasterForm requestId={7} current={null} onDone={() => {}} />);
  await screen.findByRole("combobox", { name: "Мастер" });
  await userEvent.click(screen.getByRole("button", { name: "Назначить" }));
  expect(await screen.findByText("Укажите срок")).toBeInTheDocument();
  expect(screen.getByRole("combobox", { name: "Мастер" })).toHaveAccessibleDescription(
    "Выберите мастера",
  );
  expect(screen.getByLabelText("Срок выполнения")).toHaveAccessibleDescription("Укажите срок");
});

test("submits master id and an ISO due date picked in the calendar", async () => {
  const onDone = vi.fn();
  const fetchMock = vi.fn((_url: string, init?: RequestInit) =>
    init?.method === "POST" ? jsonResponse({ id: 7 }, 201)() : jsonResponse(masters)(),
  );
  vi.stubGlobal("fetch", fetchMock);
  renderWithProviders(<AssignMasterForm requestId={7} current={null} onDone={onDone} />);
  const user = userEvent.setup();

  await fillForm(user);
  expect(screen.getByLabelText("Срок выполнения")).toHaveTextContent(
    dueDate.format("D MMM YYYY, 18:30"),
  );
  await user.click(screen.getByRole("button", { name: "Назначить" }));

  await vi.waitFor(() => expect(onDone).toHaveBeenCalled());
  const [url, init] = fetchMock.mock.calls.find(([, i]) => i?.method === "POST")!;
  expect(url).toBe("/api/v1/requests/7/assignments");
  expect(JSON.parse(init!.body as string)).toEqual({
    master_id: 3,
    due_at: dueDate.hour(18).minute(30).second(0).millisecond(0).toISOString(),
  });
});

test("shows a conflict from the server inline", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn((_url: string, init?: RequestInit) =>
      init?.method === "POST"
        ? jsonResponse({ detail: "Заявка уже закрыта" }, 409)()
        : jsonResponse(masters)(),
    ),
  );
  renderWithProviders(<AssignMasterForm requestId={7} current={null} onDone={() => {}} />);
  const user = userEvent.setup();
  await fillForm(user);
  await user.click(screen.getByRole("button", { name: "Назначить" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Заявка уже закрыта");
});
