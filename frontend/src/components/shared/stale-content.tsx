import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StaleContent({
  stale,
  className,
  children,
}: {
  stale: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      aria-busy={stale || undefined}
      className={cn("transition-opacity duration-200", stale && "opacity-60", className)}
    >
      {children}
    </div>
  );
}
