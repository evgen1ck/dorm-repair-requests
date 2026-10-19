import { Link, useLocation } from "react-router";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const NEW_REQUEST_PATH = "/requests/new";

export function Header() {
  const { pathname } = useLocation();
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-6 px-4">
        <Link
          to="/requests"
          className="text-sm font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-ring"
        >
          Заявки на ремонт
        </Link>
        {pathname !== NEW_REQUEST_PATH && (
          <Button asChild size="sm">
            <Link to={NEW_REQUEST_PATH}>
              <Plus aria-hidden />
              Новая заявка
            </Link>
          </Button>
        )}
      </div>
    </header>
  );
}
