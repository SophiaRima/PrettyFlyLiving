import type { z } from "zod";

import { HONEYPOT_FIELD, TURNSTILE_FIELD, type FormFailure } from "~/lib/forms";

import { verifyTurnstile, type TurnstileAction } from "./turnstile";

export type GuardedForm<T> =
  | { kind: "spam" }
  | { kind: "invalid"; failure: FormFailure }
  | { kind: "valid"; data: T; values: Record<string, string> };

/** A failure the visitor sees, keeping what they typed. */
export function formFailure(
  message: string,
  values: Record<string, string>,
  fieldErrors: FormFailure["fieldErrors"] = {},
): FormFailure {
  return { ok: false, message, fieldErrors, values };
}

/**
 * Steps 1–3 for every public form (AGENTS.md section 8): reject a filled
 * honeypot silently, verify Turnstile, then validate with the Zod schema.
 * Business checks, saving and the email alert stay in the route action.
 */
export async function readGuardedForm<S extends z.ZodType>(
  request: Request,
  env: Env,
  action: TurnstileAction,
  schema: S,
): Promise<GuardedForm<z.infer<S>>> {
  const formData = await request.formData();

  const values: Record<string, string> = {};
  for (const [key, value] of formData) {
    if (typeof value === "string" && key !== TURNSTILE_FIELD && key !== HONEYPOT_FIELD) {
      values[key] = value;
    }
  }

  const honeypot = formData.get(HONEYPOT_FIELD);
  if (typeof honeypot === "string" && honeypot.trim() !== "") return { kind: "spam" };

  if (!(await verifyTurnstile(request, formData.get(TURNSTILE_FIELD), action, env))) {
    return {
      kind: "invalid",
      failure: formFailure("Please complete the security check and try again.", values),
    };
  }

  return validateValues(values, schema);
}

/** First error per field, keyed by input name. */
function fieldErrorsOf(error: z.ZodError): FormFailure["fieldErrors"] {
  const fieldErrors: FormFailure["fieldErrors"] = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "");
    if (field && !fieldErrors[field]) fieldErrors[field] = issue.message;
  }
  return fieldErrors;
}

function validateValues<S extends z.ZodType>(
  values: Record<string, string>,
  schema: S,
): Exclude<GuardedForm<z.infer<S>>, { kind: "spam" }> {
  const parsed = schema.safeParse(values);
  if (!parsed.success) {
    return {
      kind: "invalid",
      failure: formFailure("Please check the highlighted fields.", values, fieldErrorsOf(parsed.error)),
    };
  }
  return { kind: "valid", data: parsed.data, values };
}

/**
 * Validates an admin form with its Zod schema. The session and Origin are
 * already checked by the admin middleware and requireAdmin().
 */
export function readAdminForm<S extends z.ZodType>(
  formData: FormData,
  schema: S,
): Exclude<GuardedForm<z.infer<S>>, { kind: "spam" }> {
  const values: Record<string, string> = {};
  for (const [key, value] of formData) {
    if (typeof value === "string") values[key] = value;
  }
  return validateValues(values, schema);
}
