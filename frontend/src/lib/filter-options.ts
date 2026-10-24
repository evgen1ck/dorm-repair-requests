export type FilterOption<T extends string> = { value?: T; label: string };

export const pickFilter = <T extends string>(
  filters: FilterOption<T>[],
  value: string | null,
): T | undefined =>
  filters.find((filter) => filter.value !== undefined && filter.value === value)?.value;
