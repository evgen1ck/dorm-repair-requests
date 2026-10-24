import { Link } from "react-router";
import type { FilterOption } from "@/lib/filter-options";
import { cn } from "@/lib/utils";

export function ParamFilter<T extends string>({
  param,
  label,
  filters,
  value,
  counts,
}: {
  param: string;
  label: string;
  filters: FilterOption<T>[];
  value?: T;
  counts?: Partial<Record<T | "all", number>>;
}) {
  return (
    <nav aria-label={label} className="mb-5 flex flex-wrap gap-1">
      {filters.map((filter) => {
        const active = filter.value === value;
        const count = counts?.[filter.value ?? "all"];
        return (
          <Link
            key={filter.label}
            to={filter.value ? `?${param}=${filter.value}` : "?"}
            replace
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              active
                ? "bg-muted font-medium text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {filter.label}{" "}
            {count !== undefined && (
              <span className="text-xs text-muted-foreground tabular-nums">{count}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
