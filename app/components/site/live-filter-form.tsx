import { useEffect, useRef, type ReactNode } from "react";
import { Form, useSearchParams, useSubmit } from "react-router";

/**
 * GET filter form that updates results as you type or select, like the
 * concept's live filters. Without JavaScript it still works as a plain
 * form submitted with Enter.
 */
export function LiveFilterForm({ children }: { children: ReactNode }) {
  const submit = useSubmit();
  const [searchParams] = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  // Keep the (uncontrolled) fields in sync when the URL changes from outside
  // the form, e.g. "Clear filters" or back/forward. The field being typed in
  // is left alone so focus and the caret are never disturbed.
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    for (const element of Array.from(form.elements)) {
      if (
        (element instanceof HTMLInputElement || element instanceof HTMLSelectElement) &&
        element.name &&
        element !== document.activeElement
      ) {
        element.value = searchParams.get(element.name) ?? "";
      }
    }
  }, [searchParams]);

  function submitNow(form: HTMLFormElement): void {
    // Drop empty fields so URLs stay short and shareable.
    const params = new URLSearchParams();
    for (const [key, value] of new FormData(form)) {
      if (typeof value === "string" && value !== "") params.set(key, value);
    }
    submit(params, { method: "get", replace: true, preventScrollReset: true });
  }

  return (
    <Form
      ref={formRef}
      className="filter-bar"
      method="get"
      preventScrollReset
      onChange={(event) => {
        const form = event.currentTarget;
        const isText = (event.target as HTMLElement).tagName === "INPUT";
        clearTimeout(timer.current);
        if (isText) timer.current = setTimeout(() => submitNow(form), 300);
        else submitNow(form);
      }}
      onSubmit={(event) => {
        event.preventDefault();
        clearTimeout(timer.current);
        submitNow(event.currentTarget);
      }}
    >
      {children}
    </Form>
  );
}
