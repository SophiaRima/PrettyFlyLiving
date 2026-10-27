import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { cachedPage, isCacheablePageRequest, pageCacheKey } from "./page-cache";

/** In-memory stand-in for a Workers named cache (match/put by URL). */
class FakeCache {
  entries = new Map<string, { body: string; init: ResponseInit }>();

  async match(request: Request | string): Promise<Response | undefined> {
    const entry = this.entries.get(typeof request === "string" ? request : request.url);
    return entry ? new Response(entry.body, entry.init) : undefined;
  }

  async put(request: Request | string, response: Response): Promise<void> {
    const url = typeof request === "string" ? request : request.url;
    this.entries.set(url, {
      body: await response.text(),
      init: { status: response.status, headers: Object.fromEntries(response.headers) },
    });
  }
}

const url = new URL("https://prettyflyliving.com/stays");
let cache: FakeCache;
let pending: Promise<unknown>[];
const ctx = { waitUntil: (promise: Promise<unknown>): void => void pending.push(promise) };

async function settle(): Promise<void> {
  await Promise.all(pending.splice(0));
}

function page(body: string, headers: Record<string, string> = {}, status = 200): () => Promise<Response> {
  return vi.fn(async () => new Response(body, { status, headers: { "Content-Type": "text/html", ...headers } }));
}

const tag = "v3-2026-10-27";

beforeEach(() => {
  cache = new FakeCache();
  pending = [];
  vi.stubGlobal("caches", { open: async () => cache });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("isCacheablePageRequest", () => {
  const get = (path: string, headers: Record<string, string> = {}): boolean =>
    isCacheablePageRequest(new Request(`https://prettyflyliving.com${path}`, { headers }), new URL(`https://prettyflyliving.com${path}`));

  it("caches anonymous GETs for public pages and their data", () => {
    expect(get("/")).toBe(true);
    expect(get("/stays?area=Kilimani")).toBe(true);
    expect(get("/things-to-do.data")).toBe(true);
  });

  it("never caches the admin, photos, signed-in visitors or form posts", () => {
    expect(get("/admin")).toBe(false);
    expect(get("/admin/bookings")).toBe(false);
    expect(get("/media/guides/0123456789abcdef0123456789abcdef.webp")).toBe(false);
    expect(get("/", { Cookie: "theme=x; pfl_admin_session=abc" })).toBe(false);
    const post = new Request("https://prettyflyliving.com/contact", { method: "POST" });
    expect(isCacheablePageRequest(post, new URL(post.url))).toBe(false);
  });
});

describe("pageCacheKey", () => {
  it("files each page, with its query, under the tag", () => {
    expect(pageCacheKey(new URL("https://prettyflyliving.com/stays?area=Kilimani"), tag)).toBe(
      "https://prettyflyliving.com/__page-cache/v3-2026-10-27/stays?area=Kilimani",
    );
  });
});

describe("cachedPage", () => {
  it("renders on a miss, then serves the copy without rendering again", async () => {
    const render = page("<p>stays</p>", { "Cache-Control": "public, max-age=60" });

    const first = await cachedPage(url, tag, ctx, render);
    expect(first.headers.get("X-Page-Cache")).toBe("miss");
    expect(await first.text()).toBe("<p>stays</p>");
    await settle();

    const second = await cachedPage(url, tag, ctx, render);
    expect(render).toHaveBeenCalledTimes(1);
    expect(second.headers.get("X-Page-Cache")).toBe("hit");
    expect(await second.text()).toBe("<p>stays</p>");
    // The browser gets the page's own Cache-Control, not the edge's hour-long one.
    expect(second.headers.get("Cache-Control")).toBe("public, max-age=60");
    expect(second.headers.has("X-Page-Browser-Cache-Control")).toBe(false);
  });

  it("drops the edge Cache-Control when the page had none", async () => {
    await cachedPage(url, tag, ctx, page("a"));
    await settle();
    const hit = await cachedPage(url, tag, ctx, page("a"));
    expect(hit.headers.has("Cache-Control")).toBe(false);
  });

  it("renders afresh once a dashboard save moves the version on", async () => {
    await cachedPage(url, tag, ctx, page("before the edit"));
    await settle();

    const after = await cachedPage(url, "v4-2026-10-27", ctx, page("after the edit"));
    expect(after.headers.get("X-Page-Cache")).toBe("miss");
    expect(await after.text()).toBe("after the edit");
  });

  it("never stores errors, cookies or private pages", async () => {
    for (const render of [
      page("missing", {}, 404),
      page("signed in", { "Set-Cookie": "a=b" }),
      page("private", { "Cache-Control": "private, no-store" }),
    ]) {
      const response = await cachedPage(url, tag, ctx, render);
      await settle();
      expect(response.headers.has("X-Page-Cache")).toBe(false);
      expect(cache.entries.size).toBe(0);
    }
  });
});
