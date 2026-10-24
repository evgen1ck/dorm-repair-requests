import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { fieldErrorId, fieldHintId } from "@/lib/form-field";
import { FieldError } from "./field-error";

export function FormField({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: ReactNode;
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && !error && (
        <p id={fieldHintId(id)} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      <FieldError id={fieldErrorId(id)} message={error} />
    </div>
  );
}
