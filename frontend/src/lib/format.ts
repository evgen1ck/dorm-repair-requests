import dayjs from "dayjs";
import "dayjs/locale/ru";

dayjs.locale("ru");

export const formatDateTime = (iso: string | null | undefined) =>
  iso ? dayjs(iso).format("D MMM YYYY, HH:mm") : "—";
