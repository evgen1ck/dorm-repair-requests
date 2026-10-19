import { Outlet } from "react-router";
import { Header } from "./header";

export function AppLayout() {
  return (
    <div className="min-h-svh">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
