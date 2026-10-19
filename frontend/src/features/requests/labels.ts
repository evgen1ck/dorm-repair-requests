import type { RequestStatus, RoomResponse } from "@/api/generated/dormitoryRepairRequests.schemas";
import type { StatusTone } from "@/components/shared/status-badge";

export const STATUS_LABELS: Record<RequestStatus, { label: string; tone: StatusTone }> = {
  new: { label: "Новая", tone: "info" },
  in_progress: { label: "В работе", tone: "warning" },
  done: { label: "Выполнена", tone: "success" },
};

export const roomLabel = (room: RoomResponse) => `Корпус ${room.building}, комн. ${room.number}`;
