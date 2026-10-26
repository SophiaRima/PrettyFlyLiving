import { eq } from "drizzle-orm";

import { readImageSize } from "~/lib/image-size";

import type { Database } from "./db/client";
import { extraServices, guidePhotos, guides, propertyPhotos } from "./db/schema";

/*
 * Image uploads in R2 (AGENTS.md section 8). The dashboard resizes photos to
 * WebP in the browser first; the server still checks the real file type and
 * size, because a request can always skip the browser step.
 */

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

/** Folder in the bucket, per kind of content. */
export type MediaFolder = "properties" | "guides" | "services";

const TYPES = [
  { mime: "image/jpeg", ext: "jpg", magic: (b: Uint8Array) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  {
    mime: "image/png",
    ext: "png",
    magic: (b: Uint8Array) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  },
  {
    mime: "image/webp",
    ext: "webp",
    // "RIFF" .... "WEBP"
    magic: (b: Uint8Array) =>
      b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
      b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50,
  },
] as const;

/** Keys this app writes, e.g. properties/3f2a…9c.webp. Anything else is refused by /media. */
export const MEDIA_KEY = /^(?:properties|guides|services)\/[a-f0-9]{32}\.(?:jpg|png|webp)$/;

/** A saved image: its R2 key and pixel size (null if the header couldn't be read). */
export interface StoredImage {
  key: string;
  width: number | null;
  height: number | null;
}

export type StoreResult = ({ ok: true } & StoredImage) | { ok: false; message: string };

export interface CheckedImage {
  bytes: Uint8Array<ArrayBuffer>;
  type: (typeof TYPES)[number];
  width: number | null;
  height: number | null;
}

export type CheckResult = { ok: true; image: CheckedImage } | { ok: false; message: string };

/** Reads an upload and checks its real type (not just the name) and size. */
export async function checkImage(file: FormDataEntryValue | null): Promise<CheckResult> {
  if (!(file instanceof File) || file.size === 0) return { ok: false, message: "Please choose a photo." };
  if (file.size > MAX_UPLOAD_BYTES) return { ok: false, message: "Photos must be 10 MB or smaller." };

  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = TYPES.find((t) => t.magic(bytes));
  if (!type) return { ok: false, message: "Please upload a JPEG, PNG or WebP image." };
  const size = readImageSize(bytes);
  return { ok: true, image: { bytes, type, width: size?.width ?? null, height: size?.height ?? null } };
}

/**
 * Saves a checked image under a content-hashed key (so the same photo
 * uploaded twice is stored once) and returns the key.
 */
export async function putImage(bucket: R2Bucket, folder: MediaFolder, image: CheckedImage): Promise<string> {
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", image.bytes));
  const hash = [...digest.subarray(0, 16)].map((b) => b.toString(16).padStart(2, "0")).join("");
  const key = `${folder}/${hash}.${image.type.ext}`;

  await bucket.put(key, image.bytes, {
    httpMetadata: { contentType: image.type.mime, cacheControl: "public, max-age=31536000, immutable" },
  });
  return key;
}

/** checkImage + putImage for a single upload. */
export async function storeImage(
  bucket: R2Bucket,
  folder: MediaFolder,
  file: FormDataEntryValue | null,
): Promise<StoreResult> {
  const checked = await checkImage(file);
  if (!checked.ok) return checked;
  const { width, height } = checked.image;
  return { ok: true, key: await putImage(bucket, folder, checked.image), width, height };
}

/** True while any row still shows this image. */
async function isKeyInUse(db: Database, key: string): Promise<boolean> {
  const [propertyPhoto, guidePhoto, guideCover, service] = await db.batch([
    db.select({ id: propertyPhotos.id }).from(propertyPhotos).where(eq(propertyPhotos.r2Key, key)).limit(1),
    db.select({ id: guidePhotos.id }).from(guidePhotos).where(eq(guidePhotos.r2Key, key)).limit(1),
    db.select({ id: guides.id }).from(guides).where(eq(guides.coverR2Key, key)).limit(1),
    db.select({ id: extraServices.id }).from(extraServices).where(eq(extraServices.imageR2Key, key)).limit(1),
  ]);
  return [propertyPhoto, guidePhoto, guideCover, service].some((rows) => rows.length > 0);
}

/**
 * Deletes an image from R2 once nothing uses it. Call after the row that
 * referenced it has been removed or changed. Seed images (https:// URLs)
 * aren't in R2 and are skipped.
 */
export async function deleteImageIfUnused(
  bucket: R2Bucket,
  db: Database,
  key: string | null,
): Promise<void> {
  if (!key || !MEDIA_KEY.test(key)) return;
  if (await isKeyInUse(db, key)) return;
  await bucket.delete(key);
}
