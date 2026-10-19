import { Link } from "react-router";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <div className="grid min-h-[60svh] place-items-center text-center">
      <div className="space-y-3">
        <p className="text-5xl font-semibold tracking-tight">404</p>
        <p className="text-muted-foreground">Такой страницы нет.</p>
        <Button asChild variant="outline">
          <Link to="/requests">К моим заявкам</Link>
        </Button>
      </div>
    </div>
  );
}
