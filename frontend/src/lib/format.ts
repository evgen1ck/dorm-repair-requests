import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ru";

dayjs.extend(relativeTime);
dayjs.locale("ru");

export const formatDateTime = (iso: string | null | undefined) =>
  iso ? dayjs(iso).format("D MMM YYYY, HH:mm") : "—";

export const formatDate = (iso: string | null | undefined) =>
  iso ? dayjs(iso).format("D MMM YYYY") : "—";

export const formatRelative = (iso: string, now: dayjs.ConfigType = undefined) =>
  dayjs(now).to(dayjs(iso));

export const formatOverdueBy = (iso: string, now: dayjs.ConfigType = undefined) =>
  `просрочено на ${dayjs(now).to(dayjs(iso), true)}`;

export const formatDateRange = (from: string, to: string) => {
  const start = dayjs(from);
  const end = dayjs(to);
  const dayFormat = start.year() === end.year() ? "D MMMM" : "D MMMM YYYY";
  return `с ${start.format(dayFormat)} по ${end.format(dayFormat)}`;
};

const RU_PLURAL = new Intl.PluralRules("ru");

export const plural = (count: number, [one, few, many]: [string, string, string]) => {
  const category = RU_PLURAL.select(count);
  return category === "one" ? one : category === "few" ? few : many;
};
