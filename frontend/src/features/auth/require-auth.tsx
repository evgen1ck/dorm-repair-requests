import { useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { getErrorMessage } from "@/api/client";
import { AppLoading } from "@/components/shared/app-loading";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { CurrentUserProvider } from "./current-user-provider";
import { LOGIN_PATH } from "./paths";
import { useSession } from "./session";

export function RequireAuth() {
  const location = useLocation();
  const session = useSession();
  const [hadSession, setHadSession] = useState(false);
  if (session.data && !hadSession) setHadSession(true);

  if (session.isPending) return <AppLoading label="Проверяем доступ…" />;

  if (session.isError) {
    return (
      <div className="grid min-h-svh place-items-center px-4">
        <EmptyState
          title="Сервер недоступен"
          description={getErrorMessage(session.error)}
          action={
            <Button variant="outline" onClick={() => session.refetch()}>
              Повторить
            </Button>
          }
        />
      </div>
    );
  }

  if (!session.data) {
    const returnTo = hadSession ? null : { from: location };
    return <Navigate to={LOGIN_PATH} replace state={returnTo} />;
  }

  return (
    <CurrentUserProvider user={session.data}>
      <Outlet />
    </CurrentUserProvider>
  );
}
