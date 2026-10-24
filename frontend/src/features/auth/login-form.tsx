import { useState, type KeyboardEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { HttpStatus, getErrorMessage, isApiError } from "@/api/client";
import type { UserResponse } from "@/api/generated/dormitoryRepairRequests.schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/form-field";
import { fieldControlProps } from "@/lib/form-field";
import { InlineAlert } from "@/components/shared/inline-alert";
import { PasswordInput } from "@/components/shared/password-input";
import { applyServerFieldErrors } from "@/lib/form-errors";
import { limitPasswordBytes } from "@/lib/password";
import { useLogin } from "./session";

const MAX_LOGIN_LENGTH = 255;

const schema = z.object({
  login: z.string().trim().min(1, "Введите логин").max(MAX_LOGIN_LENGTH, "Слишком длинный логин"),
  password: limitPasswordBytes(z.string().min(1, "Введите пароль")),
});
type LoginValues = z.infer<typeof schema>;

const CREDENTIALS_ERROR = "Неверный логин или пароль";
const CREDENTIALS_HINT = "Проверьте раскладку клавиатуры и Caps Lock.";

export function LoginForm({ onSuccess }: { onSuccess: (user: UserResponse) => void }) {
  const [capsLock, setCapsLock] = useState(false);
  const form = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { login: "", password: "" },
  });
  const { errors, isSubmitting } = form.formState;
  const loginMutation = useLogin();

  const submit = async (values: LoginValues) => {
    try {
      onSuccess(await loginMutation.mutateAsync(values));
    } catch (error) {
      if (applyServerFieldErrors(form, error)) return;
      const message = isApiError(error, HttpStatus.UNAUTHORIZED)
        ? CREDENTIALS_ERROR
        : getErrorMessage(error);
      form.setError("root", { message });
      form.setFocus("password");
    }
  };

  const trackCapsLock = (event: KeyboardEvent<HTMLInputElement>) =>
    setCapsLock(event.getModifierState("CapsLock"));

  const pending = isSubmitting || loginMutation.isPending;
  const capsLockHint = capsLock ? "Включён Caps Lock" : undefined;

  return (
    <form onSubmit={form.handleSubmit(submit)} className="space-y-6" noValidate>
      <FormField id="login" label="Логин" error={errors.login?.message}>
        <Input
          {...fieldControlProps("login", errors.login?.message)}
          {...form.register("login")}
          className="h-9"
          autoComplete="username"
          autoCapitalize="none"
          autoFocus
          spellCheck={false}
        />
      </FormField>

      <FormField id="password" label="Пароль" error={errors.password?.message} hint={capsLockHint}>
        <PasswordInput
          {...fieldControlProps("password", errors.password?.message, capsLockHint)}
          {...form.register("password")}
          className="h-9"
          autoComplete="current-password"
          onKeyDown={trackCapsLock}
          onKeyUp={trackCapsLock}
        />
      </FormField>

      {errors.root?.message && (
        <InlineAlert title={errors.root.message}>
          {errors.root.message === CREDENTIALS_ERROR && CREDENTIALS_HINT}
        </InlineAlert>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={pending} aria-busy={pending}>
        {pending ? (
          <>
            <Loader2 aria-hidden className="animate-spin" />
            Входим…
          </>
        ) : (
          "Войти"
        )}
      </Button>
    </form>
  );
}
