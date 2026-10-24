import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";
import { ru } from "react-day-picker/locale";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const LABELS = {
  labelPrevious: () => "Предыдущий месяц",
  labelNext: () => "Следующий месяц",
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  const defaults = getDefaultClassNames();
  return (
    <DayPicker
      locale={ru}
      labels={LABELS}
      showOutsideDays={showOutsideDays}
      className={cn("p-1 [--cell-size:2rem]", className)}
      classNames={{
        root: cn("w-fit", defaults.root),
        months: cn("relative flex flex-col gap-4", defaults.months),
        month: cn("flex w-full flex-col gap-3", defaults.month),
        nav: cn("absolute inset-x-0 top-0 flex w-full items-center justify-between", defaults.nav),
        button_previous: cn(
          buttonVariants({ variant: "ghost", size: "icon-sm" }),
          "text-muted-foreground aria-disabled:opacity-50",
          defaults.button_previous,
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost", size: "icon-sm" }),
          "text-muted-foreground aria-disabled:opacity-50",
          defaults.button_next,
        ),
        month_caption: cn(
          "flex h-7 w-full items-center justify-center px-8 text-sm font-medium capitalize",
          defaults.month_caption,
        ),
        weekdays: cn("flex", defaults.weekdays),
        weekday: cn(
          "flex-1 text-center text-xs font-normal text-muted-foreground select-none",
          defaults.weekday,
        ),
        week: cn("mt-1 flex w-full", defaults.week),
        day: cn(
          "group/day relative aspect-square size-(--cell-size) p-0 text-center select-none",
          defaults.day,
        ),
        today: cn("[&>button]:font-semibold [&>button]:text-primary", defaults.today),
        outside: cn("text-muted-foreground/60", defaults.outside),
        disabled: cn("text-muted-foreground opacity-40", defaults.disabled),
        hidden: cn("invisible", defaults.hidden),
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: chevronClassName, ...rest }) => {
          const Icon = orientation === "left" ? ChevronLeftIcon : ChevronRightIcon;
          return <Icon className={cn("size-4", chevronClassName)} {...rest} />;
        },
        DayButton: ({ className: dayClassName, modifiers, day, ...rest }) => (
          <button
            data-day={day.date.toLocaleDateString()}
            data-selected={modifiers.selected || undefined}
            className={cn(
              "flex size-(--cell-size) items-center justify-center rounded-md text-sm transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none data-selected:bg-primary data-selected:text-primary-foreground data-selected:hover:bg-primary",
              dayClassName,
            )}
            {...rest}
          />
        ),
      }}
      {...props}
    />
  );
}

export { Calendar };
