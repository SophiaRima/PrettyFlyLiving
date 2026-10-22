import { PencilIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { data, useFetcher } from "react-router";

import { requireAdmin } from "~/.server/auth";
import { formFailure, readAdminForm } from "~/.server/forms";
import {
  createFaq,
  deleteFaq,
  getAdminFaqs,
  getFaqById,
  moveRow,
  updateFaq,
} from "~/.server/queries/content";
import { dbFromContext } from "~/.server/request";
import { AdminPageHeader } from "~/components/admin/admin-shell";
import { CheckboxField, FormError, TextAreaField, TextField, useSuccessToast } from "~/components/admin/form-fields";
import { FilterTabs } from "~/components/admin/inbox";
import { ItemControls } from "~/components/admin/item-controls";
import { Badge } from "~/components/ui/badge";
import { Button, buttonVariants } from "~/components/ui/button";
import type { AdminActionResult } from "~/lib/forms";
import { cn } from "~/lib/utils";
import { faqSchema } from "~/lib/validation";

import type { Route } from "./+types/faqs";

type Audience = "guest" | "owner";
type Faq = Route.ComponentProps["loaderData"]["faqs"][number];

export function meta(): Route.MetaDescriptors {
  return [{ title: "FAQs  -  Pretty Fly Living admin" }];
}

function audienceOf(url: string): Audience {
  return new URL(url).searchParams.get("audience") === "owner" ? "owner" : "guest";
}

export async function loader({ request, context }: Route.LoaderArgs) {
  requireAdmin(context);
  const audience = audienceOf(request.url);
  return { audience, faqs: await getAdminFaqs(dbFromContext(context), audience) };
}

export async function action({ request, context }: Route.ActionArgs) {
  requireAdmin(context);
  const db = dbFromContext(context);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create") {
    const form = readAdminForm(formData, faqSchema);
    if (form.kind === "invalid") return data(form.failure, { status: 400 });
    await createFaq(db, form.data);
    return { ok: true as const, message: "Question added" };
  }

  const faq = await getFaqById(db, Number(formData.get("id")));
  if (!faq) return data(formFailure("That question no longer exists. Please reload the page.", {}), { status: 404 });

  switch (intent) {
    case "update": {
      const form = readAdminForm(formData, faqSchema);
      if (form.kind === "invalid") return data(form.failure, { status: 400 });
      await updateFaq(db, faq.id, form.data);
      return { ok: true as const, message: "Question saved" };
    }
    case "move-up":
    case "move-down": {
      const ids = (await getAdminFaqs(db, faq.audience)).map((f) => f.id);
      await moveRow(db, "faqs", ids, faq.id, intent === "move-up" ? -1 : 1);
      return { ok: true as const, message: "Order saved" };
    }
    case "delete":
      await deleteFaq(db, faq.id);
      return { ok: true as const, message: "Question deleted" };
    default:
      return data(formFailure("Unknown action.", {}), { status: 400 });
  }
}

function FaqFields({ faq, failure, idPrefix }: { faq?: Faq; failure?: AdminActionResult; idPrefix: string }) {
  const f = failure && !failure.ok ? failure : undefined;
  return (
    <>
      <TextField idPrefix={idPrefix} name="question" label="Question" defaultValue={faq?.question} failure={f} required />
      <TextAreaField idPrefix={idPrefix} name="answer" label="Answer" rows={4} defaultValue={faq?.answer} failure={f} required />
      <CheckboxField name="isPublished" label="Published" defaultChecked={faq?.isPublished ?? true} failure={f} hint="Shown on the FAQs page." />
      <FormError failure={f} />
    </>
  );
}

function FaqItem({ faq, index, count }: { faq: Faq; index: number; count: number }) {
  const fetcher = useFetcher<AdminActionResult>();
  useSuccessToast(fetcher.data);
  return (
    <li className="flex items-start gap-1 rounded-xl bg-card pr-2 ring-1 ring-foreground/10">
      <details className="group min-w-0 flex-1">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4">
          <span className="font-medium">
            {faq.question}
            {!faq.isPublished && (
              <Badge variant="outline" className="ml-2 align-middle">
                Hidden
              </Badge>
            )}
          </span>
          <span className={cn(buttonVariants({ variant: "outline", size: "sm" }), "shrink-0")}>
            <PencilIcon data-icon="inline-start" />
            <span className="group-open:hidden">Edit</span>
            <span className="hidden group-open:inline">Close</span>
          </span>
        </summary>
        <fetcher.Form method="post" className="grid gap-4 border-t p-4" key={`${faq.question}|${faq.answer}|${faq.isPublished}`}>
          <input type="hidden" name="id" value={faq.id} />
          <input type="hidden" name="audience" value={faq.audience} />
          <FaqFields faq={faq} failure={fetcher.data} idPrefix={`faq-${faq.id}`} />
          <div>
            <Button type="submit" name="intent" value="update" disabled={fetcher.state !== "idle"}>
              Save
            </Button>
          </div>
        </fetcher.Form>
      </details>
      <div className="shrink-0 pt-3.5">
        <ItemControls id={faq.id} index={index} count={count} confirmDelete="Delete this question?" />
      </div>
    </li>
  );
}

function AddFaq({ audience }: { audience: Audience }) {
  const fetcher = useFetcher<AdminActionResult>();
  useSuccessToast(fetcher.data);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.ok) formRef.current?.reset();
  }, [fetcher.state, fetcher.data]);

  return (
    <fetcher.Form ref={formRef} method="post" className="grid gap-4 rounded-xl bg-card p-5 ring-1 ring-foreground/10">
      <h2 className="font-heading text-lg">Add a question</h2>
      <input type="hidden" name="audience" value={audience} />
      <FaqFields failure={fetcher.data} idPrefix={`new-faq-${audience}`} />
      <div>
        <Button type="submit" name="intent" value="create" disabled={fetcher.state !== "idle"}>
          Add question
        </Button>
      </div>
    </fetcher.Form>
  );
}

export default function AdminFaqs({ loaderData }: Route.ComponentProps) {
  const { audience, faqs } = loaderData;
  return (
    <>
      <AdminPageHeader title="FAQs" description="Questions on the FAQs page, in the order shown." />
      <FilterTabs
        param="audience"
        active={audience === "owner" ? "owner" : "all"}
        options={[
          { value: "all", label: "For guests" },
          { value: "owner", label: "For property owners" },
        ]}
      />
      <div className="grid max-w-3xl gap-6">
        {faqs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No questions yet.</p>
        ) : (
          <ul className="grid gap-3">
            {faqs.map((faq, index) => (
              <FaqItem key={faq.id} faq={faq} index={index} count={faqs.length} />
            ))}
          </ul>
        )}
        <AddFaq key={audience} audience={audience} />
      </div>
    </>
  );
}
