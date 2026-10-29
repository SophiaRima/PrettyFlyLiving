import { data, Link } from "react-router";

import { getGuideBySlug } from "~/.server/queries/content";
import { dbFromContext } from "~/.server/request";
import { CtaBand } from "~/components/site/cta-band";
import { Gallery } from "~/components/site/gallery";
import { PageHero } from "~/components/site/page-hero";
import { guideJsonLd, pageMeta } from "~/lib/seo";

import type { Route } from "./+types/guide";

export function meta({ loaderData }: Route.MetaArgs): Route.MetaDescriptors {
  if (!loaderData) return [{ title: "Guide not found  -  Pretty Fly Living" }];
  const { guide } = loaderData;
  const cover = guide.photos[0];
  return pageMeta({
    title: `${guide.title}  -  Nairobi guide  -  Pretty Fly Living`,
    description: guide.excerpt,
    path: `/things-to-do/${guide.slug}`,
    image: cover ? { src: cover.key, alt: cover.alt } : undefined,
    type: "article",
    jsonLd: guideJsonLd(guide),
  });
}

export async function loader({ params, context }: Route.LoaderArgs) {
  const guide = await getGuideBySlug(dbFromContext(context), params.slug);
  if (!guide) throw data(null, { status: 404 });
  return { guide };
}

export default function Guide({ loaderData }: Route.ComponentProps) {
  const { guide } = loaderData;
  return (
    <main>
      <PageHero
        eyebrow={`Nairobi guide · ${guide.category}`}
        title={`${guide.title}.`}
        intro={guide.excerpt}
        action={
          <Link viewTransition className="btn" to="/things-to-do">
            All city guides ↗
          </Link>
        }
      />
      <article className="section">
        <div className="container article-layout">
          <div className="guide-gallery">
            <Gallery photos={guide.photos} name={guide.title} />
          </div>
          <p className="eyebrow">The Pretty Fly local edit</p>
          {/* Rendered on the server from admin Markdown, raw HTML disabled. */}
          <div
            className="article-body"
            dangerouslySetInnerHTML={{ __html: guide.bodyHtml }}
          />
          <h2>Make it part of your stay</h2>
          <p>
            Whether you are visiting for a few days or getting to know the
            city over a longer stay, leave space for the places and
            experiences that make Nairobi yours. Our team can help point you
            in the right direction.
          </p>
          <CtaBand
            title="Make Nairobi your own."
            text="Find a comfortable base for your next city adventure."
            style={{ marginTop: 30 }}
          >
            <Link viewTransition className="btn" to="/stays">
              Explore our stays ↗
            </Link>
          </CtaBand>
          <p style={{ marginTop: 25 }}>
            <Link viewTransition className="text-link" to="/things-to-do">
              ← Back to all guides
            </Link>
          </p>
        </div>
      </article>
    </main>
  );
}
