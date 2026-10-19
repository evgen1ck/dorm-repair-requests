import { Button } from "@/components/ui/button";

export function ErrorPage() {
  return (
    <div className="grid min-h-svh place-items-center text-center">
      <div className="space-y-3">
        <p className="text-xl font-semibold tracking-tight">Что-то пошло не так</p>
        <p className="text-muted-foreground">Попробуйте перезагрузить страницу.</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Перезагрузить
        </Button>
      </div>
    </div>
  );
}
