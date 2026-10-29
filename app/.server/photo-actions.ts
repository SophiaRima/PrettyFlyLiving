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
  "photo-move",
  "delete-photo",
]);

export function isPhotoIntent(intent: string): boolean {
  return PHOTO_INTENTS.has(intent);
}

/** Handles the PhotoManager's upload, alt text, reorder (buttons or drag) and delete. */
export async function handlePhotoIntent(
  intent: string,
  formData: FormData,
  target: PhotoTarget,
): Promise<AdminActionResult> {
  const { db, bucket, owner, ownerId } = target;

  if (intent === "upload") {
    const files = formData.getAll("photo");
    // Small copies from the browser, by position; none when JavaScript is off.
    const thumbs = formData.getAll("thumb");
    if (files.length === 0) return formFailure("Please choose a photo.", {});
    let added = 0;
    for (const [index, file] of files.entries()) {
      const stored = await storeImage(bucket, target.folder, file, thumbs[index] ?? null);
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
    case "photo-cover":
    case "photo-move": {
      // A drag posts the photo's new position; moveItem clamps it to the list.
      const to =
        intent === "photo-move"
          ? Number(formData.get("toIndex"))
          : intent === "photo-cover"
            ? 0
            : intent === "photo-earlier"
              ? index - 1
              : index + 1;
      if (!Number.isInteger(to)) return formFailure("Please try moving the photo again.", {});
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
