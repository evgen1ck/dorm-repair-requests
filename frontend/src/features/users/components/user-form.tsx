import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Link } from "react-router";
import { getErrorMessage } from "@/api/client";
import type {
  UserCreate,
  UserResponse,
  UserRole,
  UserUpdate,
} from "@/api/generated/dormitoryRepairRequests.schemas";
import { FormField } from "@/components/shared/form-field";
import { InlineAlert } from "@/components/shared/inline-alert";
import { PasswordInput } from "@/components/shared/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { applyServerFieldErrors } from "@/lib/form-errors";
import { fieldControlProps } from "@/lib/form-field";
import { limitPasswordBytes } from "@/lib/password";
import { ROLE_OPTIONS } from "../labels";
import { useCreateUser, useUpdateUser } from "../queries";

const MAX_NAME_LENGTH = 255;
const MAX_PHONE_LENGTH = 20;
const MIN_PASSWORD_LENGTH = 8;
const USERS_PATH = "/users";
const PASSWORD_HINT = `Не короче ${MIN_PASSWORD_LENGTH} символов`;
const NEW_PASSWORD_HINT = "Оставьте пустым, чтобы не менять";
const PHONE_HINT = "Необязательно";

const password = limitPasswordBytes(z.string().min(MIN_PASSWORD_LENGTH, PASSWORD_HINT));

const profile = {
  full_name: z.string().trim().min(1, "Введите имя").max(MAX_NAME_LENGTH, "Слишком длинное имя"),
  phone: z.string().trim().max(MAX_PHONE_LENGTH, `Не длиннее ${MAX_PHONE_LENGTH} символов`),
  role: z.enum(["resident", "dispatcher", "master", "admin"], { message: "Выберите роль" }),
};

const createSchema = z.object({
  ...profile,
  login: z.string().trim().min(1, "Введите логин").max(MAX_NAME_LENGTH, "Слишком длинный логин"),
  password,
});

const editSchema = z.object({
  ...profile,
  password: z.union([z.literal(""), password]),
  is_active: z.boolean(),
});

type CreateValues = z.infer<typeof createSchema>;
type EditValues = z.infer<typeof editSchema>;

const phoneOrNull = (phone: string) => (phone === "" ? null : phone);

function RoleSelect({
  value,
  onChange,
  error,
  disabled,
}: {
  value: UserRole | "";
  onChange: (role: UserRole) => void;
  error?: string;
  disabled?: boolean;
}) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger {...fieldControlProps("role", error)} className="w-full">
        <SelectValue placeholder="Выберите роль" />
      </SelectTrigger>
      <SelectContent>
        {ROLE_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function FormActions({ pending, label }: { pending: boolean; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <Button type="submit" disabled={pending} aria-busy={pending}>
        {pending && <Loader2 aria-hidden className="animate-spin" />}
        {label}
      </Button>
      <Button asChild variant="ghost">
        <Link to={USERS_PATH}>Отмена</Link>
      </Button>
    </div>
  );
}

export function CreateUserForm({ onCreated }: { onCreated: (user: UserResponse) => void }) {
  const create = useCreateUser();
  const form = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { full_name: "", phone: "", role: "resident", login: "", password: "" },
  });
  const { errors, isSubmitting } = form.formState;

  const submit = async (values: CreateValues) => {
    const data: UserCreate = { ...values, phone: phoneOrNull(values.phone) };
    try {
      onCreated(await create.mutateAsync(data));
    } catch (error) {
      if (!applyServerFieldErrors(form, error)) {
        form.setError("root", { message: getErrorMessage(error) });
      }
    }
  };

  return (
    <form onSubmit={form.handleSubmit(submit)} className="max-w-md space-y-6" noValidate>
      <FormField id="full_name" label="Имя" error={errors.full_name?.message}>
        <Input
          {...fieldControlProps("full_name", errors.full_name?.message)}
          {...form.register("full_name")}
          autoComplete="off"
          autoFocus
        />
      </FormField>
      <FormField id="role" label="Роль" error={errors.role?.message}>
        <Controller
          control={form.control}
          name="role"
          render={({ field }) => (
            <RoleSelect
              value={field.value}
              onChange={field.onChange}
              error={errors.role?.message}
            />
          )}
        />
      </FormField>
      <FormField id="phone" label="Телефон" error={errors.phone?.message} hint={PHONE_HINT}>
        <Input
          type="tel"
          {...fieldControlProps("phone", errors.phone?.message, PHONE_HINT)}
          {...form.register("phone")}
          autoComplete="off"
        />
      </FormField>
      <FormField id="login" label="Логин" error={errors.login?.message}>
        <Input
          {...fieldControlProps("login", errors.login?.message)}
          {...form.register("login")}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
        />
      </FormField>
      <FormField id="password" label="Пароль" error={errors.password?.message} hint={PASSWORD_HINT}>
        <PasswordInput
          {...fieldControlProps("password", errors.password?.message, PASSWORD_HINT)}
          {...form.register("password")}
          autoComplete="new-password"
        />
      </FormField>
      {errors.root?.message && <InlineAlert title={errors.root.message} />}
      <FormActions pending={isSubmitting} label="Создать пользователя" />
    </form>
  );
}

export function EditUserForm({
  user,
  isSelf,
  onSaved,
}: {
  user: UserResponse;
  isSelf: boolean;
  onSaved: (user: UserResponse) => void;
}) {
  const update = useUpdateUser(user.id);
  const form = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      full_name: user.full_name,
      phone: user.phone ?? "",
      role: user.role,
      password: "",
      is_active: user.is_active,
    },
  });
  const { errors, isSubmitting } = form.formState;

  const submit = async (values: EditValues) => {
    const changes: UserUpdate = {};
    if (values.full_name !== user.full_name) changes.full_name = values.full_name;
    if (phoneOrNull(values.phone) !== user.phone) changes.phone = phoneOrNull(values.phone);
    if (values.role !== user.role) changes.role = values.role;
    if (values.is_active !== user.is_active) changes.is_active = values.is_active;
    if (values.password !== "") changes.password = values.password;
    try {
      onSaved(await update.mutateAsync(changes));
    } catch (error) {
      if (!applyServerFieldErrors(form, error)) {
        form.setError("root", { message: getErrorMessage(error) });
      }
    }
  };

  return (
    <form onSubmit={form.handleSubmit(submit)} className="max-w-md space-y-6" noValidate>
      <FormField id="full_name" label="Имя" error={errors.full_name?.message}>
        <Input
          {...fieldControlProps("full_name", errors.full_name?.message)}
          {...form.register("full_name")}
          autoComplete="off"
        />
      </FormField>
      <FormField
        id="role"
        label="Роль"
        error={errors.role?.message}
        hint={isSelf ? "Свою роль изменить нельзя" : undefined}
      >
        <Controller
          control={form.control}
          name="role"
          render={({ field }) => (
            <RoleSelect
              value={field.value}
              onChange={field.onChange}
              error={errors.role?.message}
              disabled={isSelf}
            />
          )}
        />
      </FormField>
      <FormField id="phone" label="Телефон" error={errors.phone?.message} hint={PHONE_HINT}>
        <Input
          type="tel"
          {...fieldControlProps("phone", errors.phone?.message, PHONE_HINT)}
          {...form.register("phone")}
          autoComplete="off"
        />
      </FormField>
      <FormField
        id="password"
        label="Новый пароль"
        error={errors.password?.message}
        hint={NEW_PASSWORD_HINT}
      >
        <PasswordInput
          {...fieldControlProps("password", errors.password?.message, NEW_PASSWORD_HINT)}
          {...form.register("password")}
          autoComplete="new-password"
        />
      </FormField>
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Controller
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <Switch
                id="is_active"
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={isSelf}
              />
            )}
          />
          <Label htmlFor="is_active">Доступ в систему</Label>
        </div>
        <p className="text-xs text-muted-foreground">
          {isSelf
            ? "Свой доступ отключить нельзя."
            : "Отключённый пользователь не сможет войти, его заявки и назначения сохранятся."}
        </p>
      </div>
      {errors.root?.message && <InlineAlert title={errors.root.message} />}
      <FormActions pending={isSubmitting} label="Сохранить" />
    </form>
  );
}
