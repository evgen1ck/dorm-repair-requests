import type { z } from "zod";

const MAX_PASSWORD_BYTES = 72;

const byteLength = (value: string) => new TextEncoder().encode(value).length;

export const limitPasswordBytes = (schema: z.ZodString) =>
  schema.refine((value) => byteLength(value) <= MAX_PASSWORD_BYTES, "Слишком длинный пароль");
