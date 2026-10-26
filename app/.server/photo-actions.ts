import { moveItem } from "~/lib/admin";
import type { AdminActionResult } from "~/lib/forms";

import type { Database } from "./db/client";
import { formFailure } from "./forms";
import { deleteImageIfUnused, storeImage, type MediaFolder } from "./media";
import {
  addPhoto,
  deletePhoto,
  getPhotos,
  reorderPhotos,
  updatePhotoAlt,
  type PhotoOwner,
} from "./queries/photos";

export interface PhotoTarget {
  db: Database;
  bucket: R2Bucket;
  owner: PhotoOwner;
  ownerId: number;
  folder: MediaFolder;
  /** Alt text for new uploads until Sophiah writes a better one. */
  defaultAlt: string;
}

const PHOTO_INTENTS = new Set([
  "upload",
  "photo-alt",
  "photo-earlier",
  "photo-later",
  "photo-cover",
  "delete-photo",
]);

export function isPhotoIntent(intent: string): boolean {
  return PHOTO_INTENTS.has(intent);
}

/** Handles the PhotoManager's upload, alt text, reorder and delete buttons. */
export async function handlePhotoIntent(
  intent: string,
  formData: FormData,
  target: PhotoTarget,
): Promise<AdminActionResult> {
  const { db, bucket, owner, ownerId } = target;

  if (intent === "upload") {
    const files = formData.getAll("photo");
    if (files.length === 0) return formFailure("Please choose a photo.", {});
    let added = 0;
    for (const file of files) {
      const stored = await storeImage(bucket, target.folder, file);
      if (!stored.ok) {
        return formFailure(added > 0 ? `${added} uploaded. ${stored.message}` : stored.message, {});
      }
      const { key, width, height } = stored;
      await addPhoto(db, owner, ownerId, { key, width, height, alt: target.defaultAlt });
      added++;
    }
    return { ok: true, message: added === 1 ? "Photo added" : `${added} photos added` };
  }

  const photoId = Number(formData.get("photoId"));
  const photos = await getPhotos(db, owner, ownerId);
  const index = photos.findIndex((p) => p.id === photoId);
  if (index === -1) return formFailure("That photo no longer exists. Please reload the page.", {});

  switch (intent) {
    case "photo-alt": {
      const alt = String(formData.get("alt") ?? "").trim().slice(0, 200);
      await updatePhotoAlt(db, owner, ownerId, photoId, alt);
      return { ok: true, message: "Description saved" };
    }
    case "photo-earlier":
    case "photo-later":
    case "photo-cover": {
      const to = intent === "photo-cover" ? 0 : intent === "photo-earlier" ? index - 1 : index + 1;
      const ids = moveItem(
        photos.map((p) => p.id),
        photoId,
        to,
      );
      await reorderPhotos(db, owner, ownerId, ids);
      return { ok: true, message: "Order saved" };
    }
    case "delete-photo": {
      const key = await deletePhoto(db, owner, ownerId, photoId);
      await deleteImageIfUnused(bucket, db, key);
      return { ok: true, message: "Photo deleted" };
    }
    default:
      return formFailure("Unknown action.", {});
  }
}
