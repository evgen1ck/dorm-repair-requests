import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { HOME_PATH } from "@/features/auth/roles";
import { LIST_COPY } from "@/features/requests/labels";
import { useCurrentUser } from "./current-user-context";

export function ForbiddenPage() {
  const { role } = useCurrentUser();
  return (
    <div className="grid min-h-[60svh] place-items-center text-center">
      <div className="space-y-3">
        <p className="text-xl font-semibold tracking-tight">Недостаточно прав</p>
        <p className="max-w-[45ch] text-muted-foreground">
          Эта страница доступна только другой роли. Если вам нужен доступ, обратитесь к
          администратору общежития.
        </p>
        <Button asChild variant="outline">
          <Link to={HOME_PATH}>{LIST_COPY[role].back}</Link>
        </Button>
      </div>
    </div>
  );
}
