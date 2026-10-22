import { data, Link, redirect } from "react-router";

import { requireAdmin } from "~/.server/auth";
import { formFailure, readAdminForm } from "~/.server/forms";
import { createGuide, isGuideSlugTaken } from "~/.server/queries/content";
import { dbFromContext } from "~/.server/request";
import { AdminPageHeader } from "~/components/admin/admin-shell";
import { GuideForm } from "~/components/admin/guide-form";
import { guideSchema } from "~/lib/validation";

import type { Route } from "./+types/guide-new";

export function meta(): Route.MetaDescriptors {
  return [{ title: "New guide  -  Pretty Fly Living admin" }];
}

export function loader({ context }: Route.LoaderArgs) {
  requireAdmin(context);
  return null;
}

export async function action({ request, context }: Route.ActionArgs) {
  requireAdmin(context);
  const db = dbFromContext(context);
  const form = readAdminForm(await request.formData(), guideSchema);
  if (form.kind === "invalid") return data(form.failure, { status: 400 });
  if (await isGuideSlugTaken(db, form.data.slug)) {
    return data(
      formFailure("Please check the highlighted fields.", form.values, { slug: "Another guide already uses this URL name." }),
      { status: 400 },
    );
  }
  const id = await createGuide(db, form.data);
  throw redirect(`/admin/guides/${id}/photos`);
}

export default function AdminGuideNew({ actionData }: Route.ComponentProps) {
  return (
    <>
      <p className="mb-2 text-sm">
        <Link to="/admin/guides" className="text-muted-foreground hover:text-foreground">
          ← Nairobi guides
        </Link>
      </p>
      <AdminPageHeader title="New guide" description="Save the text first, then add a cover and gallery photos. It stays hidden until you tick Published." />
      <GuideForm failure={actionData} submitLabel="Create guide" />
    </>
  );
}
