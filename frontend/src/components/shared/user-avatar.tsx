import { cn } from "@/lib/utils";

const SIZES = {
  sm: "size-5 text-[0.6rem]",
  md: "size-6 text-[0.7rem]",
} as const;

const initials = (fullName: string) =>
  fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");

export function UserAvatar({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-primary/10 font-semibold text-primary",
        SIZES[size],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
