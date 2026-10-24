import { DatePicker } from "@/components/shared/date-picker";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { PERIOD_PRESETS, lastDays, periodMatchesPreset, type Period } from "../period";

export function PeriodPicker({
  value,
  onChange,
}: {
  value: Period;
  onChange: (period: Period) => void;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end gap-x-6 gap-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-2">
          <Label htmlFor="period-from">С</Label>
          <DatePicker
            id="period-from"
            value={value.from}
            max={value.to}
            onChange={(from) => onChange({ ...value, from })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="period-to">По</Label>
          <DatePicker
            id="period-to"
            value={value.to}
            min={value.from}
            onChange={(to) => onChange({ ...value, to })}
          />
        </div>
      </div>
      <nav aria-label="Быстрый выбор периода" className="flex flex-wrap gap-1">
        {PERIOD_PRESETS.map((preset) => {
          const active = preset.days !== undefined && periodMatchesPreset(value, preset.days);
          return (
            <button
              key={preset.key}
              type="button"
              aria-pressed={active}
              onClick={() => preset.days !== undefined && onChange(lastDays(preset.days))}
              className={cn(
                "h-8 rounded-md px-2.5 text-sm whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                active
                  ? "bg-muted font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {preset.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
