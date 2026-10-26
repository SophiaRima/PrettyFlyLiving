/**
 * Public URL for a stored image.
 *
 * Uploaded images are R2 keys served by the /media/* resource route.
 * Absolute URLs (https://…) are only used by local seed data and are
 * returned unchanged.
 */
export function mediaUrl(key: string): string {
  if (/^https?:\/\//.test(key)) return key;
  return `/media/${key.replace(/^\/+/, "")}`;
}

/** Width of the small copy stored next to every uploaded photo, for cards and tiles. */
export const THUMB_WIDTH = 800;

const UPLOAD_KEY = /^((?:properties|guides|services)\/[a-f0-9]{32})\.(jpg|png|webp)$/;

/**
 * Key of an upload's small copy: properties/<hash>.webp → properties/<hash>-800.webp.
 * Null for keys that aren't uploads (seed URLs, /public paths).
 */
export function thumbKey(key: string): string | null {
  const match = UPLOAD_KEY.exec(key);
  return match ? `${match[1]}-${THUMB_WIDTH}.${match[2]}` : null;
}

/**
 * srcset offering the small copy and the full photo, or undefined when there
 * is nothing smaller to offer (not an upload, size unknown, or already small).
 */
export function mediaSrcSet(key: string, width: number | null | undefined): string | undefined {
  const thumb = thumbKey(key);
  if (!thumb || !width || width <= THUMB_WIDTH) return undefined;
  return `${mediaUrl(thumb)} ${THUMB_WIDTH}w, ${mediaUrl(key)} ${width}w`;
}
