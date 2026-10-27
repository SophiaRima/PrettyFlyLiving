/**
 * Edge cache for public pages. Anonymous GETs (pages and their `.data`
 * requests) are served from Cloudflare's cache in the visitor's data centre,
 * so most visits skip rendering and most of D1 (faster pages, and far less
 * Worker CPU on the free plan, AGENTS.md section 9).
 *
 * Pages are filed under a tag made of the content version, Nairobi's date and
 * the build (workers/app.ts). Every dashboard save moves the version on
 * (app/.server/content-version.ts), so edits show on the site at once; the
 * date rolls availability calendars over at midnight; and a deploy starts a
 * fresh cache, since cached pages link that build's CSS and JS. Copies also
 * expire after PAGE_KEEP_SECONDS as a backstop.
 *
 * Never cached: /admin, anyone signed in to the dashboard (Sophiah always sees
 * the live site), non-GET requests, and any response that isn't a plain 200
 * or that sets a cookie or says private/no-store.
 */
const PAGE_KEEP_SECONDS = 60 * 60;
/** Same name as SESSION_COOKIE in app/.server/auth.ts. */
const SESSION_COOKIE = "pfl_admin_session";

const BROWSER_CACHE_CONTROL = "X-Page-Browser-Cache-Control";

export function isCacheablePageRequest(request: Request, url: URL): boolean {
  return (
    request.method === "GET" &&
    !url.pathname.startsWith("/admin") &&
    // Photos have their own year-long cache in routes/media.ts.
    !url.pathname.startsWith("/media/") &&
    !request.headers.has("Authorization") &&
    !(request.headers.get("Cookie") ?? "").includes(`${SESSION_COOKIE}=`)
  );
}

/** Where a page is filed: a different tag (new version or new day) is a different entry. */
export function pageCacheKey(url: URL, tag: string): string {
  return `${url.origin}/__page-cache/${encodeURIComponent(tag)}${url.pathname}${url.search}`;
}

function isStorable(response: Response): boolean {
  const cacheControl = response.headers.get("Cache-Control") ?? "";
  return response.status === 200 && !response.headers.has("Set-Cookie") && !/private|no-store/.test(cacheControl);
}

/** The cached copy as the browser should see it: the page's own Cache-Control, no edge headers. */
function forBrowser(cached: Response): Response {
  const response = new Response(cached.body, cached);
  const browserCacheControl = cached.headers.get(BROWSER_CACHE_CONTROL);
  if (browserCacheControl) response.headers.set("Cache-Control", browserCacheControl);
  else response.headers.delete("Cache-Control");
  response.headers.delete(BROWSER_CACHE_CONTROL);
  response.headers.set("X-Page-Cache", "hit");
  return response;
}

export async function cachedPage(
  url: URL,
  tag: string,
  ctx: Pick<ExecutionContext, "waitUntil">,
  render: () => Promise<Response>,
): Promise<Response> {
  // A named cache (caches.default's type is shadowed by the DOM lib's CacheStorage).
  const cache = await caches.open("pages");
  const key = pageCacheKey(url, tag);

  const cached = await cache.match(key);
  if (cached) return forBrowser(cached);

  const response = await render();
  if (!isStorable(response)) return response;
  const copy = new Response(response.clone().body, response);
  copy.headers.set(BROWSER_CACHE_CONTROL, response.headers.get("Cache-Control") ?? "");
  copy.headers.set("Cache-Control", `public, max-age=${PAGE_KEEP_SECONDS}`);
  ctx.waitUntil(cache.put(key, copy));
  response.headers.set("X-Page-Cache", "miss");
  return response;
}
