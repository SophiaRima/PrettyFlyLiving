import { MEDIA_KEY } from "~/.server/media";
import { cloudflareContext } from "~/context";

import type { Route } from "./+types/media";

/**
 * /media/* streams uploaded images from R2. Keys are content-hashed, so a
 * file never changes and browsers may cache it for a year.
 */
export async function loader({ request, params, context }: Route.LoaderArgs) {
  const key = params["*"] ?? "";
  if (!MEDIA_KEY.test(key)) return new Response("Not found", { status: 404 });

  const { env } = context.get(cloudflareContext);
  const object = await env.MEDIA.get(key, { onlyIf: request.headers });
  if (!object) return new Response("Not found", { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("ETag", object.httpEtag);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  headers.set("X-Content-Type-Options", "nosniff");

  // onlyIf failed (e.g. If-None-Match matched): R2 returns metadata without a body.
  if (!("body" in object)) return new Response(null, { status: 304, headers });
  return new Response(object.body, { headers });
}
