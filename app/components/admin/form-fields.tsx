import { useEffect, type ReactNode } from "react";
import { toast } from "sonner";

import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import type { AdminActionResult, FormFailure } from "~/lib/forms";
import { cn } from "~/lib/utils";

/** Shows a toast when an admin action succeeds. */
export function useSuccessToast(result: AdminActionResult | undefined): void {
  useEffect(() => {
    if (result?.ok) toast.success(result.message);
  }, [result]);
}

interface FieldProps {
  name: string;
  label: string;
  /** Saved value; replaced by what was typed after a failed submit. */
  defaultValue?: string | number | null;
  failure?: FormFailure;
  hint?: ReactNode;
  className?: string;
  /** Keeps ids unique when several forms share a page, e.g. "faq-3". */
  idPrefix?: string;
}

function fieldState({ name, defaultValue, failure, idPrefix = "field" }: FieldProps) {
  const id = `${idPrefix}-${name}`;
  const error = failure?.fieldErrors[name];
  const value = failure ? (failure.values[name] ?? "") : (defaultValue ?? "");
  return {
    id,
    error,
    value: String(value),
    aria: {
      "aria-invalid": error ? true : undefined,
      "aria-describedby": error ? `${id}-error` : undefined,
    },
  };
}

function FieldFrame({
  id,
  label,
  hint,
  error,
  className,
  children,
}: {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("grid content-start gap-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextField(
  props: FieldProps & {
    type?: "text" | "number" | "url" | "email" | "date";
    required?: boolean;
    placeholder?: string;
    list?: string;
    step?: string;
    min?: number;
    max?: number;
  },
) {
  const { id, error, value, aria } = fieldState(props);
  return (
    <FieldFrame id={id} label={props.label} hint={props.hint} error={error} className={props.className}>
      <Input
        id={id}
        name={props.name}
        type={props.type ?? "text"}
        defaultValue={value}
        required={props.required}
        placeholder={props.placeholder}
        list={props.list}
        step={props.step}
        min={props.min}
        max={props.max}
        {...aria}
      />
    </FieldFrame>
  );
}

export function TextAreaField(
  props: FieldProps & { rows?: number; required?: boolean; placeholder?: string; mono?: boolean },
) {
  const { id, error, value, aria } = fieldState(props);
  return (
    <FieldFrame id={id} label={props.label} hint={props.hint} error={error} className={props.className}>
      <Textarea
        id={id}
        name={props.name}
        defaultValue={value}
        rows={props.rows ?? 4}
        required={props.required}
        placeholder={props.placeholder}
        className={props.mono ? "font-mono text-xs" : undefined}
        {...aria}
      />
    </FieldFrame>
  );
}

/** Native select styled like the shadcn Input, so it posts without JavaScript. */
type SelectOption = string | { value: string; label: string };

export function SelectField(props: FieldProps & { options: readonly SelectOption[]; required?: boolean }) {
  const { id, error, value, aria } = fieldState(props);
  return (
    <FieldFrame id={id} label={props.label} hint={props.hint} error={error} className={props.className}>
      <select
        id={id}
        name={props.name}
        defaultValue={value}
        required={props.required}
        className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive"
        {...aria}
      >
        {props.options.map((option) =>
          typeof option === "string" ? (
            <option key={option}>{option}</option>
          ) : (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ),
        )}
      </select>
    </FieldFrame>
  );
}

export function CheckboxField({
  name,
  label,
  defaultChecked,
  failure,
  hint,
}: {
  name: string;
  label: string;
  defaultChecked: boolean;
  failure?: FormFailure;
  hint?: ReactNode;
}) {
  const checked = failure ? failure.values[name] === "on" : defaultChecked;
  return (
    <label className="flex items-start gap-3 rounded-lg border p-3 text-sm">
      <input type="checkbox" name={name} defaultChecked={checked} className="mt-0.5 size-4 accent-primary" />
      <span>
        <span className="font-medium">{label}</span>
        {hint && <span className="mt-0.5 block text-xs text-muted-foreground">{hint}</span>}
      </span>
    </label>
  );
}

/** Error summary shown above the save button after a failed submit. */
export function FormError({ failure }: { failure?: FormFailure }) {
  if (!failure) return null;
  return (
    <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
      {failure.message}
    </p>
  );
}

/** A titled group of fields. */
export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="grid gap-4 rounded-xl bg-card p-5 ring-1 ring-foreground/10">
      <legend className="sr-only">{title}</legend>
      <div>
        <h2 className="font-heading text-lg">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </fieldset>
  );
}
