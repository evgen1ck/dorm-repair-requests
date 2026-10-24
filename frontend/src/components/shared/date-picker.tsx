import { useState } from "react";
import dayjs from "dayjs";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const DATE_FORMAT = "YYYY-MM-DD";

const toDate = (value: string) => (value ? dayjs(value).toDate() : undefined);

export function DatePicker({
  id,
  value,
  onChange,
  min,
  max,
  placeholder = "Выберите дату",
  className,
  ...aria
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  placeholder?: string;
  className?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = toDate(value);
  const disabled = [
    ...(min ? [{ before: dayjs(min).toDate() }] : []),
    ...(max ? [{ after: dayjs(max).toDate() }] : []),
  ];

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
          data-empty={!selected}
          {...aria}
        >
          <CalendarIcon aria-hidden className="text-muted-foreground" />
          {selected ? formatDate(value) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected}
          disabled={disabled}
          onSelect={(date) => {
            if (!date) return;
            onChange(dayjs(date).format(DATE_FORMAT));
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
