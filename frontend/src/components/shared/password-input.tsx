import { useState, type ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const ICON_CLASS = "col-start-1 row-start-1 transition-opacity duration-150";

export function PasswordInput({ className, ...props }: Omit<ComponentProps<typeof Input>, "type">) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input type={visible ? "text" : "password"} className={cn("pr-10", className)} {...props} />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="absolute top-1/2 right-1 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        aria-label={visible ? "Скрыть пароль" : "Показать пароль"}
        aria-pressed={visible}
        onClick={() => setVisible((value) => !value)}
      >
        <span aria-hidden className="grid place-items-center">
          <Eye className={cn(ICON_CLASS, visible && "opacity-0")} />
          <EyeOff className={cn(ICON_CLASS, !visible && "opacity-0")} />
        </span>
      </Button>
    </div>
  );
}
