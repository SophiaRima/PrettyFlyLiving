import { data } from "react-router";

import { requireAdmin } from "~/.server/auth";
import { formFailure, readAdminForm } from "~/.server/forms";
import {
  getAllAreas,
  getPropertyById,
  isPropertySlugTaken,
  updateProperty,
} from "~/.server/queries/properties";
import { dbFromContext, idParam } from "~/.server/request";
import { useSuccessToast } from "~/components/admin/form-fields";
import { PropertyForm } from "~/components/admin/property-form";
import { propertySchema } from "~/lib/validation";

import type { Route } from "./+types/property-details";

export async function loader({ params, context }: Route.LoaderArgs) {
  requireAdmin(context);
  const db = dbFromContext(context);
  const [property, areas] = await Promise.all([
    getPropertyById(db, idParam(params.id)),
    getAllAreas(db),
  ]);
  if (!property) throw new Response("Not found", { status: 404 });
  return { property, areas };
}

export async function action({ request, params, context }: Route.ActionArgs) {
  requireAdmin(context);
  const db = dbFromContext(context);
  const id = idParam(params.id);
  if (!(await getPropertyById(db, id))) throw new Response("Not found", { status: 404 });

  const form = readAdminForm(await request.formData(), propertySchema);
  if (form.kind === "invalid") return data(form.failure, { status: 400 });
  if (await isPropertySlugTaken(db, form.data.slug, id)) {
    return data(
      formFailure("Please check the highlighted fields.", form.values, {
        slug: "Another property already uses this URL name.",
      }),
      { status: 400 },
    );
  }
  await updateProperty(db, id, form.data);
  return { ok: true as const, message: "Property saved" };
}

export default function AdminPropertyDetails({ loaderData, actionData }: Route.ComponentProps) {
  useSuccessToast(actionData);
  return (
    <PropertyForm
      // Remount after a save so the fields show the saved (normalised) values.
      key={loaderData.property.updatedAt}
      values={loaderData.property}
      areas={loaderData.areas}
      failure={actionData && !actionData.ok ? actionData : undefined}
      submitLabel="Save changes"
    />
  );
}
