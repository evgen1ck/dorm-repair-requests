import { screen } from "@testing-library/react";
import { jsonResponse, renderWithProviders, residentUser } from "@/test/test-utils";
import { ReportPage } from "./report-page";

const dispatcher = { ...residentUser, id: 2, role: "dispatcher" as const };

const rows = [
  {
    fault_type: { id: 1, code: "plumbing", name: "Сантехника" },
    total: 3,
    new: 1,
    in_progress: 1,
    done: 1,
  },
  {
    fault_type: { id: 2, code: "electrical", name: "Электрика" },
    total: 5,
    new: 0,
    in_progress: 2,
    done: 3,
  },
  {
    fault_type: { id: 3, code: "furniture", name: "Мебель" },
    total: 0,
    new: 0,
    in_progress: 0,
    done: 0,
  },
];

afterEach(() => vi.unstubAllGlobals());

test("renders the report for the period from the url with totals and shares", async () => {
  const fetchMock = vi.fn((_url: string) => jsonResponse(rows)());
  vi.stubGlobal("fetch", fetchMock);
  renderWithProviders(<ReportPage />, {
    route: "/reports?from=2026-10-01&to=2026-10-24",
    user: dispatcher,
  });
  const totalRow = (await screen.findByText("Итого")).closest("tr")!;
  expect(totalRow).toHaveTextContent("8");
  expect(fetchMock.mock.calls[0]?.[0]).toBe(
    "/api/v1/reports/fault-types?date_from=2026-10-01&date_to=2026-10-24",
  );
  const electrical = screen.getByText("Электрика").closest("tr")!;
  expect(electrical).toHaveTextContent("63%");
  expect(screen.getByLabelText("С")).toHaveTextContent("1 окт. 2026");
});

test("summarizes the period and lists fault types without requests apart", async () => {
  vi.stubGlobal("fetch", vi.fn(jsonResponse(rows)));
  renderWithProviders(<ReportPage />, {
    route: "/reports?from=2026-10-01&to=2026-10-24",
    user: dispatcher,
  });
  const summary = (await screen.findByText("8 заявок")).closest("p")!;
  expect(summary).toHaveTextContent(
    "За период с 1 октября по 24 октября подано 8 заявок по 2 типам из 3.",
  );
  expect(screen.getByText("Без заявок за период: Мебель")).toBeInTheDocument();
  expect(screen.queryByText("Мебель", { exact: true })).not.toBeInTheDocument();
});

test("shows an empty state when nothing was filed in the period", async () => {
  vi.stubGlobal("fetch", vi.fn(jsonResponse(rows.map((row) => ({ ...row, total: 0 })))));
  renderWithProviders(<ReportPage />, { user: dispatcher });
  expect(await screen.findByText("За этот период заявок нет")).toBeInTheDocument();
});

test("refuses an inverted period without calling the api", () => {
  const fetchMock = vi.fn(jsonResponse(rows));
  vi.stubGlobal("fetch", fetchMock);
  renderWithProviders(<ReportPage />, {
    route: "/reports?from=2026-10-24&to=2026-10-01",
    user: dispatcher,
  });
  expect(screen.getByRole("alert")).toHaveTextContent("Начало периода позже его конца");
  expect(fetchMock).not.toHaveBeenCalled();
});
