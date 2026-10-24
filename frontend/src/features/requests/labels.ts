import type {
  RequestStatus,
  RoomResponse,
  UserRole,
} from "@/api/generated/dormitoryRepairRequests.schemas";
import type { StatusTone } from "@/components/shared/status-badge";

type ListCopy = { title: string; description: string; empty: string; back: string };

export const LIST_COPY: Record<UserRole, ListCopy> = {
  resident: {
    title: "Мои заявки",
    description: "Заявки на ремонт, которые вы подали, и их текущий статус.",
    empty: "Если что-то сломалось в комнате, создайте заявку: диспетчер назначит мастера.",
    back: "К моим заявкам",
  },
  master: {
    title: "Мои задания",
    description: "Заявки, которые диспетчер назначил на вас.",
    empty: "Как только диспетчер назначит вам заявку, она появится здесь.",
    back: "К моим заданиям",
  },
  dispatcher: {
    title: "Заявки",
    description: "Все заявки жильцов. Новые ждут назначения мастера.",
    empty: "Новые заявки жильцов появятся здесь.",
    back: "К заявкам",
  },
  admin: {
    title: "Заявки",
    description: "Все заявки жильцов и их текущий статус.",
    empty: "Новые заявки жильцов появятся здесь.",
    back: "К заявкам",
  },
};

export const STATUS_LABELS: Record<RequestStatus, { label: string; tone: StatusTone }> = {
  new: { label: "Новая", tone: "info" },
  in_progress: { label: "В работе", tone: "warning" },
  done: { label: "Выполнена", tone: "success" },
};

export const OVERDUE_FILTER = "overdue";

export type ListFilter = RequestStatus | typeof OVERDUE_FILTER;

export const STATUS_FILTERS: { value?: ListFilter; label: string }[] = [
  { label: "Все" },
  { value: "new", label: "Новые" },
  { value: "in_progress", label: "В работе" },
  { value: OVERDUE_FILTER, label: "Просрочено" },
  { value: "done", label: "Выполнены" },
];

export const statusFiltersFor = (role: UserRole) =>
  role === "master" ? STATUS_FILTERS.filter((filter) => filter.value !== "new") : STATUS_FILTERS;

export const EMPTY_FILTER_COPY: Record<ListFilter, string> = {
  new: "Нет новых заявок",
  in_progress: "Нет заявок в работе",
  done: "Выполненных заявок пока нет",
  overdue: "Просроченных заявок нет",
};

export const roomLabel = (room: RoomResponse) => `Корпус ${room.building}, комн. ${room.number}`;
