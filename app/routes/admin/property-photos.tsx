import { data } from "react-router";

import { requireAdmin } from "~/.server/auth";
import { handlePhotoIntent } from "~/.server/photo-actions";
import { getPhotos } from "~/.server/queries/photos";
import { getPropertyById } from "~/.server/queries/properties";
import { dbFromContext, idParam } from "~/.server/request";
import { PhotoManager } from "~/components/admin/photo-manager";
import { cloudflareContext } from "~/context";

import type { Route } from "./+types/property-photos";

export async function loader({ params, context }: Route.LoaderArgs) {
  requireAdmin(context);
  return { photos: await getPhotos(dbFromContext(context), "property", idParam(params.id)) };
}

export async function action({ request, params, context }: Route.ActionArgs) {
  requireAdmin(context);
  const db = dbFromContext(context);
  const property = await getPropertyById(db, idParam(params.id));
  if (!property) throw new Response("Not found", { status: 404 });

  const formData = await request.formData();
  const result = await handlePhotoIntent(String(formData.get("intent") ?? ""), formData, {
    db,
    bucket: context.get(cloudflareContext).env.MEDIA,
    owner: "property",
    ownerId: property.id,
    folder: "properties",
    defaultAlt: property.name,
  });
  return result.ok ? result : data(result, { status: 400 });
}

export default function AdminPropertyPhotos({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
        The first photo is the cover on the stays list. The first five fill the gallery on the
        stay page. Describe each photo for guests using screen readers.
      </p>
      <PhotoManager photos={loaderData.photos} emptyText="No photos yet. Upload a few to get started." />
    </>
  );
}
