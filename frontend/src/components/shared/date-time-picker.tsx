import { useState } from "react";
import dayjs from "dayjs";
import { CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const LOCAL_FORMAT = "YYYY-MM-DDTHH:mm";
const DEFAULT_HOUR = 12;
const MINUTE_STEP = 15;
const HOURS = Array.from({ length: 24 }, (_, hour) => hour);
const MINUTE_STEPS = Array.from({ length: 60 / MINUTE_STEP }, (_, i) => i * MINUTE_STEP);

const pad = (value: number) => String(value).padStart(2, "0");

export function DateTimePicker({
  id,
  value,
  onChange,
  placeholder = "Выберите дату и время",
  className,
  ...aria
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}) {
  const [open, setOpen] = useState(false);
  const current = value ? dayjs(value) : null;
  const minutes =
    current && !MINUTE_STEPS.includes(current.minute())
      ? [...MINUTE_STEPS, current.minute()].sort((a, b) => a - b)
      : MINUTE_STEPS;

  const emit = (next: dayjs.Dayjs) => onChange(next.format(LOCAL_FORMAT));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className={cn(
            "justify-start font-normal data-[empty=true]:text-muted-foreground",
            className,
          )}
          data-empty={!current}
          {...aria}
        >
          <CalendarClock aria-hidden className="text-muted-foreground" />
          {current ? formatDateTime(current.toISOString()) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto">
        <Calendar
          mode="single"
          selected={current?.toDate()}
          defaultMonth={current?.toDate()}
          disabled={{ before: dayjs().startOf("day").toDate() }}
          onSelect={(date) => {
            if (!date) return;
            const time = current ?? dayjs().hour(DEFAULT_HOUR).minute(0);
            emit(dayjs(date).hour(time.hour()).minute(time.minute()));
          }}
        />
        <div className="mt-2 flex items-center gap-2 border-t border-border pt-3">
          <span className="text-sm text-muted-foreground">Время</span>
          <Select
            value={current ? String(current.hour()) : ""}
            disabled={!current}
            onValueChange={(hour) => current && emit(current.hour(Number(hour)))}
          >
            <SelectTrigger aria-label="Часы" size="sm" className="w-18">
              <SelectValue placeholder="—" />
            </SelectTrigger>
            <SelectContent>
              {HOURS.map((hour) => (
                <SelectItem key={hour} value={String(hour)}>
                  {pad(hour)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-muted-foreground">:</span>
          <Select
            value={current ? String(current.minute()) : ""}
            disabled={!current}
            onValueChange={(minute) => current && emit(current.minute(Number(minute)))}
          >
            <SelectTrigger aria-label="Минуты" size="sm" className="w-18">
              <SelectValue placeholder="—" />
            </SelectTrigger>
            <SelectContent>
              {minutes.map((minute) => (
                <SelectItem key={minute} value={String(minute)}>
                  {pad(minute)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            size="sm"
            className="ml-auto"
            disabled={!current}
            onClick={() => setOpen(false)}
          >
            Готово
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
