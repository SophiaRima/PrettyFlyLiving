import { data, Link, redirect } from "react-router";

import { requireAdmin } from "~/.server/auth";
import { formFailure, readAdminForm } from "~/.server/forms";
import { checkImage, putImage, type CheckedImage } from "~/.server/media";
import { addPhoto } from "~/.server/queries/photos";
import { createProperty, getAllAreas, isPropertySlugTaken } from "~/.server/queries/properties";
import { dbFromContext } from "~/.server/request";
import { AdminPageHeader } from "~/components/admin/admin-shell";
import { PropertyForm } from "~/components/admin/property-form";
import { cloudflareContext } from "~/context";
import { propertySchema } from "~/lib/validation";

import type { Route } from "./+types/property-new";

/** Keeps one request (and its CPU time) small; more can be added on the Photos tab. */
const MAX_NEW_PHOTOS = 20;

export function meta(): Route.MetaDescriptors {
  return [{ title: "New property  -  Pretty Fly Living admin" }];
}

export async function loader({ context }: Route.LoaderArgs) {
  requireAdmin(context);
  return { areas: await getAllAreas(dbFromContext(context)) };
}

export async function action({ request, context }: Route.ActionArgs) {
  requireAdmin(context);
  const db = dbFromContext(context);
  const formData = await request.formData();
  const form = readAdminForm(formData, propertySchema);
  if (form.kind === "invalid") return data(form.failure, { status: 400 });
  const invalid = (fieldErrors: Record<string, string>) =>
    data(formFailure("Please check the highlighted fields.", form.values, fieldErrors), { status: 400 });

  if (await isPropertySlugTaken(db, form.data.slug)) {
    return invalid({ slug: "Another property already uses this URL name." });
  }

  // Check every photo before saving anything, so a bad file never leaves a
  // half-created property behind.
  const files = formData.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length > MAX_NEW_PHOTOS) {
    return invalid({ photos: `Please choose up to ${MAX_NEW_PHOTOS} photos. You can add more on the Photos tab.` });
  }
  const photos: CheckedImage[] = [];
  for (const file of files) {
    const checked = await checkImage(file);
    if (!checked.ok) return invalid({ photos: `${file.name}: ${checked.message}` });
    photos.push(checked.image);
  }

  const id = await createProperty(db, form.data);
  const bucket = context.get(cloudflareContext).env.MEDIA;
  for (const photo of photos) {
    const key = await putImage(bucket, "properties", photo);
    await addPhoto(db, "property", id, { key, width: photo.width, height: photo.height, alt: form.data.name });
  }
  // The Photos tab shows what was uploaded and is where alt text is written.
  throw redirect(`/admin/properties/${id}/photos`);
}

export default function AdminPropertyNew({ loaderData, actionData }: Route.ComponentProps) {
  return (
    <>
      <p className="mb-2 text-sm">
        <Link to="/admin/properties" className="text-muted-foreground hover:text-foreground">
          ← Properties
        </Link>
      </p>
      <AdminPageHeader
        title="New property"
        description="Add the details and photos. You can block dates once it’s created. It stays hidden until you tick Published."
      />
      <PropertyForm areas={loaderData.areas} failure={actionData} submitLabel="Create property" withPhotos />
    </>
  );
}
