import { Trash2Icon } from "lucide-react";
import type { FormEvent } from "react";
import { data, Form, redirect } from "react-router";

import { requireAdmin } from "~/.server/auth";
import { formFailure, readAdminForm } from "~/.server/forms";
import { deleteImageIfUnused } from "~/.server/media";
import { deleteGuide, getGuideById, isGuideSlugTaken, updateGuide } from "~/.server/queries/content";
import { dbFromContext, idParam } from "~/.server/request";
import { useSuccessToast } from "~/components/admin/form-fields";
import { GuideForm } from "~/components/admin/guide-form";
import { Button } from "~/components/ui/button";
import { cloudflareContext } from "~/context";
import { guideSchema } from "~/lib/validation";

import type { Route } from "./+types/guide-details";

export async function loader({ params, context }: Route.LoaderArgs) {
  requireAdmin(context);
  const guide = await getGuideById(dbFromContext(context), idParam(params.id));
  if (!guide) throw new Response("Not found", { status: 404 });
  return { guide };
}

export async function action({ request, params, context }: Route.ActionArgs) {
  requireAdmin(context);
  const db = dbFromContext(context);
  const id = idParam(params.id);
  if (!(await getGuideById(db, id))) throw new Response("Not found", { status: 404 });
  const formData = await request.formData();

  if (formData.get("intent") === "delete") {
    const bucket = context.get(cloudflareContext).env.MEDIA;
    for (const key of await deleteGuide(db, id)) await deleteImageIfUnused(bucket, db, key);
    throw redirect("/admin/guides");
  }

  const form = readAdminForm(formData, guideSchema);
  if (form.kind === "invalid") return data(form.failure, { status: 400 });
  if (await isGuideSlugTaken(db, form.data.slug, id)) {
    return data(
      formFailure("Please check the highlighted fields.", form.values, { slug: "Another guide already uses this URL name." }),
      { status: 400 },
    );
  }
  await updateGuide(db, id, form.data);
  return { ok: true as const, message: "Guide saved" };
}

function confirmDelete(event: FormEvent<HTMLFormElement>): void {
  if (!window.confirm("Delete this guide and all its photos? This can’t be undone. To hide it instead, untick Published.")) {
    event.preventDefault();
  }
}

export default function AdminGuideDetails({ loaderData, actionData }: Route.ComponentProps) {
  useSuccessToast(actionData);
  const { guide } = loaderData;
  return (
    <div className="grid gap-10">
      <GuideForm
        key={guide.updatedAt}
        values={guide}
        failure={actionData && !actionData.ok ? actionData : undefined}
        submitLabel="Save changes"
      />
      <Form method="post" onSubmit={confirmDelete} className="max-w-3xl border-t pt-6">
        <p className="mb-3 text-sm text-muted-foreground">
          To hide this guide, untick Published above. Deleting removes it and its photos for good.
        </p>
        <Button type="submit" name="intent" value="delete" variant="destructive">
          <Trash2Icon data-icon="inline-start" />
          Delete guide
        </Button>
      </Form>
    </div>
  );
}
