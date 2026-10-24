import type { ReactNode } from "react";
import { CircleAlert, Info, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

const TONES = {
  destructive: { icon: CircleAlert, className: "bg-destructive/10 text-destructive" },
  warning: { icon: TriangleAlert, className: "bg-warning/15 text-warning" },
  info: { icon: Info, className: "bg-info/10 text-info" },
} as const;

export type AlertTone = keyof typeof TONES;

export function InlineAlert({
  tone = "destructive",
  title,
  children,
  className,
}: {
  tone?: AlertTone;
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  const { icon: Icon, className: toneClassName } = TONES[tone];
  return (
    <div
      role={tone === "destructive" ? "alert" : "status"}
      className={cn(
        "flex gap-2.5 rounded-lg px-3 py-2.5 text-sm animate-in fade-in-0 slide-in-from-bottom-1 duration-200 ease-(--ease-out-quart)",
        toneClassName,
        className,
      )}
    >
      <Icon aria-hidden className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0 space-y-0.5">
        {title && <p className="font-medium">{title}</p>}
        {children && <div className={cn(title && "opacity-90")}>{children}</div>}
      </div>
    </div>
  );
}
