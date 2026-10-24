import { Navigate, useLocation, useNavigate } from "react-router";
import { FloorPlan } from "./floor-plan";
import { LoginForm } from "./login-form";
import { redirectTargetFrom } from "./paths";
import { HOME_PATH } from "./roles";
import { useSession } from "./session";

const FLOW_STEPS = [
  "Жилец описывает, что сломалось в комнате.",
  "Диспетчер назначает мастера и срок.",
  "Мастер закрывает заявку, история сохраняется.",
];

export function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const session = useSession();
  const target = redirectTargetFrom(location, HOME_PATH);

  if (session.data) return <Navigate to={target} replace />;

  return (
    <div className="min-h-svh lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <aside className="relative isolate overflow-hidden bg-brand-panel text-brand-panel-foreground">
        <FloorPlan className="absolute bottom-0 left-12 -z-10 hidden w-[640px] max-w-none [mask-image:linear-gradient(to_top,black_60%,transparent)] lg:block" />
        <div className="flex flex-col gap-2 px-6 py-5 lg:gap-12 lg:px-12 lg:py-12">
          <p className="text-xs font-medium tracking-[0.12em] text-brand-panel-muted uppercase">
            Общежитие
          </p>
          <div className="lg:space-y-8">
            <h1 className="max-w-[16ch] text-xl font-semibold tracking-tight lg:text-3xl">
              Заявки на ремонт
            </h1>
            <ol className="hidden max-w-[40ch] space-y-4 text-sm text-brand-panel-muted lg:block">
              {FLOW_STEPS.map((step, index) => (
                <li key={step} className="flex gap-4">
                  <span className="w-5 shrink-0 font-mono text-xs leading-5 tabular-nums text-brand-panel-foreground/60">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </aside>

      <main className="flex items-center justify-center px-4 py-12 lg:px-12">
        <div className="w-full max-w-sm space-y-8 animate-in fade-in-0 slide-in-from-bottom-2 duration-300 ease-(--ease-out-quart) fill-mode-both">
          <header className="space-y-3">
            <p className="hidden text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase lg:block">
              Общежитие · Заявки на ремонт
            </p>
            <h2 className="text-2xl font-semibold tracking-tight">Вход</h2>
          </header>
          <LoginForm onSuccess={() => navigate(target, { replace: true })} />
          <p className="text-xs text-muted-foreground">
            Нет логина или забыли пароль? Обратитесь к администратору общежития.
          </p>
        </div>
      </main>
    </div>
  );
}
