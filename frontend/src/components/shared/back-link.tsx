import { useEffect, type MouseEvent, type ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const OPEN_LAYER_SELECTOR = '[role="dialog"], [role="menu"], [role="listbox"]';
const EDITABLE_SELECTOR = "form, input, textarea, select, [contenteditable=true]";

const hasInAppHistory = () => (window.history.state?.idx ?? 0) > 0;

const escapeIsSafe = (event: KeyboardEvent) =>
  event.key === "Escape" &&
  !event.defaultPrevented &&
  !document.querySelector(OPEN_LAYER_SELECTOR) &&
  !(event.target instanceof Element && event.target.closest(EDITABLE_SELECTOR));

export function BackLink({
  to,
  escape = false,
  className,
  children,
}: {
  to: string;
  escape?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!escape) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (escapeIsSafe(event)) void (hasInAppHistory() ? navigate(-1) : navigate(to));
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [escape, to, navigate]);

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    if (!hasInAppHistory()) return;
    event.preventDefault();
    navigate(-1);
  };

  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm text-sm text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      <ArrowLeft aria-hidden className="size-4" />
      {children}
      {escape && (
        <kbd
          aria-hidden
          className="ml-1 hidden rounded border border-border px-1 font-sans text-[0.65rem] leading-4 text-muted-foreground sm:inline-block"
        >
          Esc
        </kbd>
      )}
    </Link>
  );
}
