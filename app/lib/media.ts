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
