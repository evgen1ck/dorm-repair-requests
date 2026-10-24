import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/features/auth/current-user-context";
import { HOME_PATH } from "@/features/auth/roles";
import { LIST_COPY } from "@/features/requests/labels";

export function NotFoundPage() {
  const { role } = useCurrentUser();
  return (
    <div className="grid min-h-[60svh] place-items-center text-center">
      <div className="space-y-3">
        <p className="text-5xl font-semibold tracking-tight">404</p>
        <p className="text-muted-foreground">Такой страницы нет.</p>
        <Button asChild variant="outline">
          <Link to={HOME_PATH}>{LIST_COPY[role].back}</Link>
        </Button>
      </div>
    </div>
  );
}
