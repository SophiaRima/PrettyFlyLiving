import { useState } from "react";
import { Form, useFetcher, useNavigation } from "react-router";

import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { guideCategories } from "~/lib/constants";
import type { FormFailure } from "~/lib/forms";
import { cn } from "~/lib/utils";

import { CheckboxField, FormError, FormSection, SelectField, TextAreaField, TextField } from "./form-fields";

export interface GuideFormValues {
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  highlights: string[];
  bodyMd: string;
  isFeatured: boolean;
  isPublished: boolean;
  sortOrder: number;
}

/**
 * Markdown textarea with a Preview tab. The preview is rendered by the same
 * server code as the live guide page (routes/admin/guide-preview.ts).
 */
function MarkdownField({ defaultValue, failure }: { defaultValue: string; failure?: FormFailure }) {
  const preview = useFetcher<{ html: string }>();
  const [mode, setMode] = useState<"write" | "preview">("write");
  const [body, setBody] = useState(failure ? (failure.values.bodyMd ?? "") : defaultValue);
  const error = failure?.fieldErrors.bodyMd;

  function showPreview(): void {
    setMode("preview");
    void preview.submit({ bodyMd: body }, { method: "post", action: "/admin/guides/preview" });
  }

  const tab = (active: boolean) =>
    cn(
      "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
      active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
    );

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor="field-bodyMd">Guide text</Label>
        <div className="flex gap-1 rounded-lg bg-muted p-0.5" role="tablist" aria-label="Guide text view">
          <button type="button" role="tab" aria-selected={mode === "write"} className={tab(mode === "write")} onClick={() => setMode("write")}>
            Write
          </button>
          <button type="button" role="tab" aria-selected={mode === "preview"} className={tab(mode === "preview")} onClick={showPreview}>
            Preview
          </button>
        </div>
      </div>
      <Textarea
        id="field-bodyMd"
        name="bodyMd"
        rows={16}
        value={body}
        onChange={(event) => setBody(event.target.value)}
        className={cn("font-mono text-xs", mode === "preview" && "hidden")}
        aria-invalid={error ? true : undefined}
      />
      {mode === "preview" && (
        <div className="guide-preview min-h-40 rounded-lg border bg-card p-4">
          {preview.state !== "idle" ? (
            <p className="text-sm text-muted-foreground">Loading preview…</p>
          ) : preview.data?.html ? (
            <div dangerouslySetInnerHTML={{ __html: preview.data.html }} />
          ) : (
            <p className="text-sm text-muted-foreground">Nothing to preview yet.</p>
          )}
        </div>
      )}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Markdown: <code>## Heading</code>, <code>**bold**</code>, <code>- list item</code>,{" "}
          <code>[venue name](https://…)</code>. Links to other websites open in a new tab.
        </p>
      )}
    </div>
  );
}

/** Text fields for a new or existing guide. Photos live on the Photos tab. */
export function GuideForm({
  values,
  failure,
  submitLabel,
}: {
  values?: GuideFormValues;
  failure?: FormFailure;
  submitLabel: string;
}) {
  const saving = useNavigation().state === "submitting";
  const common = { failure };

  return (
    <Form method="post" className="grid max-w-3xl gap-6">
      <FormSection title="Card">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField {...common} name="title" label="Title" defaultValue={values?.title} required className="sm:col-span-2" />
          <SelectField {...common} name="category" label="Category" options={guideCategories} defaultValue={values?.category ?? guideCategories[0]} />
          <TextField
            {...common}
            name="slug"
            label="URL name"
            defaultValue={values?.slug}
            placeholder="made from the title"
            hint="/things-to-do/url-name. Changing it breaks old links."
          />
        </div>
        <TextAreaField {...common} name="excerpt" label="Short summary" rows={2} defaultValue={values?.excerpt} required hint="One or two sentences on the card." />
        <TextAreaField
          {...common}
          name="highlights"
          label="Highlights"
          rows={3}
          defaultValue={values?.highlights.join("\n")}
          hint="Up to 8 short chips on the card, one per line, e.g. Brunch & coffee."
        />
      </FormSection>

      <FormSection title="Guide page">
        <MarkdownField defaultValue={values?.bodyMd ?? ""} failure={failure} />
      </FormSection>

      <FormSection title="Visibility">
        <div className="grid gap-3 sm:grid-cols-2">
          <CheckboxField {...common} name="isPublished" label="Published" defaultChecked={values?.isPublished ?? false} hint="Shown on Things to Do." />
          <CheckboxField {...common} name="isFeatured" label="Featured on Home" defaultChecked={values?.isFeatured ?? false} hint="Home shows four guides, featured ones first." />
        </div>
        <TextField {...common} name="sortOrder" label="Sort order" type="number" min={0} defaultValue={values?.sortOrder ?? 0} className="max-w-40" hint="Lower numbers come first." />
      </FormSection>

      <div className="grid gap-3">
        <FormError failure={failure} />
        <div>
          <Button type="submit" size="lg" disabled={saving}>
            {saving ? "Saving…" : submitLabel}
          </Button>
        </div>
      </div>
    </Form>
  );
}
