import { robotsTxt } from "~/lib/seo";

/** /robots.txt: everything except the admin, plus the sitemap location. */
export function loader() {
  return new Response(robotsTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
