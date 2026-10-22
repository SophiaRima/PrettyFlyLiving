import type { ReactNode } from "react";

import { HONEYPOT_FIELD, type FormFailure } from "~/lib/forms";

import { Turnstile } from "./turnstile";

/** Honeypot field plus the Turnstile widget, placed above the submit button. */
export function FormGuard({
  siteKey,
  action,
  resetKey,
}: {
  siteKey: string;
  action: string;
  resetKey?: unknown;
}) {
  return (
    <>
      <div className="hp-field" aria-hidden="true">
        <label>
          Leave this field empty
          <input name={HONEYPOT_FIELD} type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <Turnstile siteKey={siteKey} action={action} resetKey={resetKey} />
    </>
  );
}

/** The concept's `.form-status` box (success or error message). */
export function FormStatus({ tone, children }: { tone: "success" | "error"; children: ReactNode }) {
  return (
    <div
      className={`form-status show${tone === "error" ? " error" : ""}`}
      role={tone === "error" ? "alert" : "status"}
    >
      {children}
    </div>
  );
}

/**
 * Props that tie an input to its error and refill it after a failed submit,
 * e.g. `<input {...field("email")} />`.
 */
export function fieldHelpers(prefix: string, failure: FormFailure | undefined) {
  const errorId = (name: string): string => `${prefix}-${name}-error`;
  return {
    field: (name: string) => ({
      id: `${prefix}-${name}`,
      name,
      defaultValue: failure?.values[name],
      "aria-invalid": failure?.fieldErrors[name] ? true : undefined,
      "aria-describedby": failure?.fieldErrors[name] ? errorId(name) : undefined,
    }),
    error: (name: string) =>
      failure?.fieldErrors[name] ? (
        <span className="field-error" id={errorId(name)}>
          {failure.fieldErrors[name]}
        </span>
      ) : null,
  };
}
