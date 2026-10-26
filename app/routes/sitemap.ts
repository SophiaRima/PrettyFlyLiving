import { getSitemapGuides } from "~/.server/queries/content";
import { getSitemapProperties } from "~/.server/queries/properties";
import { dbFromContext } from "~/.server/request";
import { sitemapXml, type SitemapEntry } from "~/lib/seo";

import type { Route } from "./+types/sitemap";

/** Public pages that don't come from the database. */
const staticPaths = [
  "/",
  "/stays",
  "/why-us",
  "/things-to-do",
  "/management",
  "/faqs",
  "/faqs?tab=owners",
  "/contact",
  "/privacy-policy",
] as const;

/** /sitemap.xml: the static pages plus every published stay and guide. */
export async function loader({ context }: Route.LoaderArgs) {
  const db = dbFromContext(context);
  const [stays, guides] = await Promise.all([
    getSitemapProperties(db),
    getSitemapGuides(db),
  ]);
  const entries: SitemapEntry[] = [
    ...staticPaths.map((path) => ({ path })),
    ...stays.map((s) => ({ path: `/stays/${s.slug}`, updatedAt: s.updatedAt })),
    ...guides.map((g) => ({ path: `/things-to-do/${g.slug}`, updatedAt: g.updatedAt })),
  ];
  return new Response(sitemapXml(entries), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
