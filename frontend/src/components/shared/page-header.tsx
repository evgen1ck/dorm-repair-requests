import type { ReactNode } from "react";

export function PageHeader({
  title,
  badge,
  description,
  backLink,
  actions,
}: {
  title: string;
  badge?: ReactNode;
  description?: ReactNode;
  backLink?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        {backLink && <div className="mb-2">{backLink}</div>}
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          {badge}
        </div>
        {description && <p className="max-w-[65ch] text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}
