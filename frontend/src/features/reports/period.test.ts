import { isDateParam } from "./period";

test("accepts only real calendar dates in the url format", () => {
  expect(isDateParam("2026-02-28")).toBe(true);
  expect(isDateParam("2026-02-30")).toBe(false);
  expect(isDateParam("2026-2-8")).toBe(false);
  expect(isDateParam(null)).toBe(false);
});
