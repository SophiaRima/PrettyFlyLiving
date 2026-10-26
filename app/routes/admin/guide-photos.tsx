import { data } from "react-router";

import { requireAdmin } from "~/.server/auth";
import { formFailure } from "~/.server/forms";
import { deleteImageIfUnused, storeImage } from "~/.server/media";
import { handlePhotoIntent } from "~/.server/photo-actions";
import { getGuideById, setGuideCover } from "~/.server/queries/content";
import { getPhotos } from "~/.server/queries/photos";
import { dbFromContext, idParam } from "~/.server/request";
import { PhotoManager, PhotoUploader } from "~/components/admin/photo-manager";
import { cloudflareContext } from "~/context";
import { mediaUrl } from "~/lib/media";

import type { Route } from "./+types/guide-photos";

export async function loader({ params, context }: Route.LoaderArgs) {
  requireAdmin(context);
  const db = dbFromContext(context);
  const id = idParam(params.id);
  const [guide, photos] = await Promise.all([getGuideById(db, id), getPhotos(db, "guide", id)]);
  if (!guide) throw new Response("Not found", { status: 404 });
  return { cover: guide.coverR2Key, title: guide.title, photos };
}

export async function action({ request, params, context }: Route.ActionArgs) {
  requireAdmin(context);
  const db = dbFromContext(context);
  const guide = await getGuideById(db, idParam(params.id));
  if (!guide) throw new Response("Not found", { status: 404 });
  const bucket = context.get(cloudflareContext).env.MEDIA;
  const formData = await request.formData();
  const intent = String(formData.get("intent") ?? "");

  if (intent === "cover") {
    const stored = await storeImage(bucket, "guides", formData.get("photo"));
    if (!stored.ok) return data(formFailure(stored.message, {}), { status: 400 });
    const old = await setGuideCover(db, guide.id, stored);
    if (old !== stored.key) await deleteImageIfUnused(bucket, db, old);
    return { ok: true as const, message: "Cover photo saved" };
  }

  const result = await handlePhotoIntent(intent, formData, {
    db,
    bucket,
    owner: "guide",
    ownerId: guide.id,
    folder: "guides",
    defaultAlt: guide.title,
  });
  return result.ok ? result : data(result, { status: 400 });
}

export default function AdminGuidePhotos({ loaderData }: Route.ComponentProps) {
  const { cover, title, photos } = loaderData;
  return (
    <div className="grid gap-10">
      <section className="grid max-w-3xl gap-4">
        <div>
          <h2 className="font-heading text-xl">Cover photo</h2>
          <p className="text-sm text-muted-foreground">
            The large photo on the guide’s card, and always the first photo on its page.
          </p>
        </div>
        {cover ? (
          <img src={mediaUrl(cover)} alt={title} className="aspect-video w-full max-w-md rounded-xl object-cover" />
        ) : (
          <p className="text-sm text-muted-foreground">No cover photo yet.</p>
        )}
        <PhotoUploader intent="cover" label={cover ? "Replace cover" : "Add cover"} multiple={false} />
      </section>

      <section className="grid gap-4">
        <div>
          <h2 className="font-heading text-xl">More photos</h2>
          <p className="text-sm text-muted-foreground">
            Shown after the cover in the guide’s gallery. The card collage uses the cover and the
            first two of these.
          </p>
        </div>
        <PhotoManager photos={photos} emptyText="No gallery photos yet." firstIsCover={false} />
      </section>
    </div>
  );
}
