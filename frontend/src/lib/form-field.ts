import type { ReactNode } from "react";

export const fieldErrorId = (id: string) => `${id}-error`;
export const fieldHintId = (id: string) => `${id}-hint`;

export function fieldControlProps(id: string, error?: string, hint?: ReactNode) {
  const describedBy = error ? fieldErrorId(id) : hint ? fieldHintId(id) : undefined;
  return { id, "aria-invalid": Boolean(error), "aria-describedby": describedBy };
}
