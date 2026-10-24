import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function DetailList({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <dl className={cn("grid max-w-2xl grid-cols-2 gap-x-8 gap-y-5", className)}>{children}</dl>
  );
}

export function DetailField({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
