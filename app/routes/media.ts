import { MEDIA_KEY } from "~/.server/media";
import { cloudflareContext } from "~/context";

import type { Route } from "./+types/media";

/**
 * /media/* streams uploaded images from R2. Keys are content-hashed, so a
 * file never changes and browsers may cache it for a year. The edge keeps a
 * copy too, so repeat requests skip R2.
 */
export async function loader({ request, params, context }: Route.LoaderArgs) {
  const key = params["*"] ?? "";
  if (!MEDIA_KEY.test(key)) return new Response("Not found", { status: 404 });

  const { env, ctx } = context.get(cloudflareContext);
  const cacheUrl = new URL(request.url);
  cacheUrl.search = "";
  // A named cache (caches.default's type is shadowed by the DOM lib's CacheStorage).
  const cache = await caches.open("media");
  const cached = await cache.match(cacheUrl.toString());
  if (cached) {
    // The cache doesn't answer conditional requests itself, so check the ETag here.
    const etag = cached.headers.get("ETag");
    if (etag && request.headers.get("If-None-Match") === etag) {
      return new Response(null, { status: 304, headers: cached.headers });
    }
    return cached;
  }

  const object = await env.MEDIA.get(key, { onlyIf: request.headers });
  if (!object) return new Response("Not found", { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("ETag", object.httpEtag);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  headers.set("X-Content-Type-Options", "nosniff");

  // onlyIf failed (e.g. If-None-Match matched): R2 returns metadata without a body.
  if (!("body" in object)) return new Response(null, { status: 304, headers });
  const response = new Response(object.body, { headers });
  ctx.waitUntil(cache.put(cacheUrl.toString(), response.clone()));
  return response;
}
