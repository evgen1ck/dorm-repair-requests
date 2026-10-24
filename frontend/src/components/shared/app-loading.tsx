import { Loader2 } from "lucide-react";

export function AppLoading({ label = "Загружаем…" }: { label?: string }) {
  return (
    <div
      role="status"
      className="grid min-h-svh place-items-center text-muted-foreground animate-in fade-in-0 delay-300 duration-300 fill-mode-both"
    >
      <Loader2 aria-hidden className="size-5 animate-spin" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
