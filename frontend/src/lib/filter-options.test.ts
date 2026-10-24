import { pickFilter } from "./filter-options";

const filters = [{ label: "Все" }, { value: "in_progress" as const, label: "В работе" }];

test("accepts only values the filter list offers", () => {
  expect(pickFilter(filters, "in_progress")).toBe("in_progress");
  expect(pickFilter(filters, "new")).toBeUndefined();
  expect(pickFilter(filters, "constructor")).toBeUndefined();
  expect(pickFilter(filters, null)).toBeUndefined();
});
