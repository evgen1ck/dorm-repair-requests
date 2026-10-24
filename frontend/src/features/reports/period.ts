import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

export const DATE_PARAM_FORMAT = "YYYY-MM-DD";

export type Period = { from: string; to: string };

export const PERIOD_PRESETS: { key: string; label: string; days?: number }[] = [
  { key: "week", label: "Неделя", days: 7 },
  { key: "month", label: "Месяц", days: 30 },
  { key: "quarter", label: "Квартал", days: 90 },
  { key: "year", label: "Год", days: 365 },
];

const DEFAULT_PRESET_DAYS = 30;

export const lastDays = (days: number, today = dayjs()): Period => ({
  from: today.subtract(days - 1, "day").format(DATE_PARAM_FORMAT),
  to: today.format(DATE_PARAM_FORMAT),
});

export const defaultPeriod = (today = dayjs()) => lastDays(DEFAULT_PRESET_DAYS, today);

export const isDateParam = (value: string | null): value is string =>
  value !== null && dayjs(value, DATE_PARAM_FORMAT, true).isValid();

export const isPeriodValid = ({ from, to }: Period) => !dayjs(from).isAfter(dayjs(to));

export const periodMatchesPreset = (period: Period, days: number, today = dayjs()) => {
  const preset = lastDays(days, today);
  return preset.from === period.from && preset.to === period.to;
};
