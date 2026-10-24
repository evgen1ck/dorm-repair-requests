import { splitByActivity } from "./model";

const row = (id: number, total: number) => ({
  fault_type: { id, code: `type-${id}`, name: `Тип ${id}` },
  total,
  new: total,
  in_progress: 0,
  done: 0,
});

test("splits fault types into those with requests sorted by total and idle ones", () => {
  const { active, idle } = splitByActivity([row(1, 0), row(2, 2), row(3, 5)]);
  expect(active.map((item) => item.fault_type.id)).toEqual([3, 2]);
  expect(idle.map((item) => item.fault_type.id)).toEqual([1]);
});
