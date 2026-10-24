import type { ReactNode } from "react";
import { Link } from "react-router";
import { cn } from "@/lib/utils";
import { UserAvatar } from "./user-avatar";

export function PhoneLink({ phone }: { phone: string }) {
  return (
    <a href={`tel:${phone}`} className="hover:underline">
      {phone}
    </a>
  );
}

export function Person({
  name,
  href,
  badge,
  detail,
  size = "md",
  muted = false,
  className,
}: {
  name: string;
  href?: string;
  badge?: ReactNode;
  detail?: ReactNode;
  size?: "sm" | "md";
  muted?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("flex min-w-0 items-center gap-2", className)}>
      <UserAvatar name={name} size={size} className={cn(muted && "opacity-60")} />
      <span className="min-w-0">
        <span className="block">
          {href ? (
            <Link
              to={href}
              className="font-medium outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {name}
            </Link>
          ) : (
            name
          )}
          {badge && <span className="ml-2 text-xs font-normal text-muted-foreground">{badge}</span>}
        </span>
        {detail && <span className="block text-xs text-muted-foreground">{detail}</span>}
      </span>
    </span>
  );
}
