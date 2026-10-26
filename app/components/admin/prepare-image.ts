/**
 * Resizes a photo in the browser before upload (AGENTS.md section 8): at
 * most 2000px on the long side, saved as WebP, plus a small copy
 * THUMB_WIDTH pixels wide for cards and tiles. Browsers that can't encode
 * WebP (some Safari versions) get JPEG instead. If the browser can't read the
 * file at all, the original is sent as both and the server decides.
 */

import { THUMB_WIDTH } from "~/lib/media";

const MAX_SIDE = 2000;
const QUALITY = 0.85;

export interface PreparedImage {
  photo: File;
  /** Same format as `photo`; the photo itself when it is already small. */
  thumb: File;
}

function toBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, QUALITY));
}

/** Draws the bitmap at the given size and encodes it as WebP, or JPEG as a fallback. */
async function encode(bitmap: ImageBitmap, width: number, height: number, name: string): Promise<File | null> {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.drawImage(bitmap, 0, 0, width, height);

  const webp = await toBlob(canvas, "image/webp");
  if (webp?.type === "image/webp") return new File([webp], `${name}.webp`, { type: "image/webp" });
  const jpeg = await toBlob(canvas, "image/jpeg");
  return jpeg ? new File([jpeg], `${name}.jpg`, { type: "image/jpeg" }) : null;
}

export async function prepareImage(file: File): Promise<PreparedImage> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return { photo: file, thumb: file };
  }

  try {
    const base = file.name.replace(/\.[^.]+$/, "") || "photo";
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const photo = await encode(bitmap, width, height, base);
    if (!photo) return { photo: file, thumb: file };
    if (width <= THUMB_WIDTH) return { photo, thumb: photo };

    const thumb = await encode(bitmap, THUMB_WIDTH, Math.round((height * THUMB_WIDTH) / width), `${base}-small`);
    // The server only accepts a small copy in the photo's own format.
    return { photo, thumb: thumb?.type === photo.type ? thumb : photo };
  } finally {
    bitmap.close();
  }
}
