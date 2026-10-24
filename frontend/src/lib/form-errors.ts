import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { HttpStatus, isApiError } from "@/api/client";

const BODY_LOCATION = "body";

export function applyServerFieldErrors<T extends FieldValues>(
  form: UseFormReturn<T, unknown, FieldValues>,
  error: unknown,
): boolean {
  if (!isApiError(error, HttpStatus.UNPROCESSABLE_ENTITY)) return false;
  const fields = new Set(Object.keys(form.getValues()));
  let applied = false;
  for (const item of error.validation) {
    const [location, field] = item.loc;
    if (location !== BODY_LOCATION || typeof field !== "string" || !fields.has(field)) continue;
    form.setError(field as Path<T>, { type: "server", message: item.msg });
    applied = true;
  }
  return applied;
}
