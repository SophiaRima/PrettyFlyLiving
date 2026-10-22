/** Form plumbing shared by the public form components and the server. */

/** Hidden field bots tend to fill in; people never see it. */
export const HONEYPOT_FIELD = "website";

/** Field the Turnstile widget adds to the form. */
export const TURNSTILE_FIELD = "cf-turnstile-response";

export interface FormFailure {
  ok: false;
  /** Shown in the form's `.form-status`. */
  message: string;
  /** First error per field, keyed by input name. */
  fieldErrors: Record<string, string | undefined>;
  /** What the visitor typed, to refill the form. */
  values: Record<string, string>;
}

/** What admin actions return: a success message or a FormFailure. */
export type AdminActionResult = { ok: true; message: string } | FormFailure;
