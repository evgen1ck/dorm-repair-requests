import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="grid place-items-center rounded-lg border border-dashed border-border py-16 text-center">
      <div className="space-y-3">
        <p className="font-medium">{title}</p>
        {description && <p className="max-w-[45ch] text-muted-foreground">{description}</p>}
        {action}
      </div>
    </div>
  );
}
