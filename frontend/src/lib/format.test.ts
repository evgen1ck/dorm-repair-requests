import { formatDateRange, formatOverdueBy, formatRelative, plural } from "./format";

const now = "2026-10-24T12:00:00Z";

test("formats upcoming and past moments relative to now in russian", () => {
  expect(formatRelative("2026-10-30T12:00:00Z", now)).toBe("через 6 дней");
  expect(formatRelative("2026-10-24T09:00:00Z", now)).toBe("3 часа назад");
});

test("formats how long a deadline has been missed", () => {
  expect(formatOverdueBy("2026-10-22T12:00:00Z", now)).toBe("просрочено на 2 дня");
});

test("formats a date range with years only when they differ", () => {
  expect(formatDateRange("2026-09-25", "2026-10-24")).toBe("с 25 сентября по 24 октября");
  expect(formatDateRange("2025-12-25", "2026-01-05")).toBe("с 25 декабря 2025 по 5 января 2026");
});

test("picks the russian plural form for a count", () => {
  const forms: [string, string, string] = ["заявка", "заявки", "заявок"];
  expect([1, 3, 5, 21, 112].map((count) => plural(count, forms))).toEqual([
    "заявка",
    "заявки",
    "заявок",
    "заявка",
    "заявок",
  ]);
});
