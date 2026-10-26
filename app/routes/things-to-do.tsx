import { Link } from "react-router";

import { getPublishedGuides } from "~/.server/queries/content";
import { dbFromContext } from "~/.server/request";
import { CtaSection } from "~/components/site/cta-band";
import { GuideArticleCard } from "~/components/site/guide-cards";
import { LiveFilterForm } from "~/components/site/live-filter-form";
import { PageHero } from "~/components/site/page-hero";
import { guideCategories } from "~/lib/constants";
import { pageMeta } from "~/lib/seo";
import { guideTopics } from "~/lib/site";
import { guideFiltersSchema, parseSearchParams } from "~/lib/validation";

import type { Route } from "./+types/things-to-do";

export function meta(): Route.MetaDescriptors {
  return pageMeta({
    title: "Things to do in Nairobi  -  Pretty Fly Living",
    description:
      "Neighbourhood favourites, food, nightlife, activities and local experiences to help you find your own rhythm in Nairobi.",
    path: "/things-to-do",
  });
}

export async function loader({ request, context }: Route.LoaderArgs) {
  const filters = parseSearchParams(guideFiltersSchema, request.url);
  const guides = await getPublishedGuides(dbFromContext(context), filters);
  return { guides, filters };
}

export default function ThingsToDo({ loaderData }: Route.ComponentProps) {
  const { guides, filters } = loaderData;
  return (
    <main>
      <PageHero
        eyebrow="A local’s point of view"
        title={
          <>
            Make a little room
            <br />
            for Nairobi.
          </>
        }
        intro="Neighbourhood favourites, new discoveries and local experiences to help you find your own rhythm in the city."
      />

      <section className="section">
        <div className="container">
          <LiveFilterForm>
            <label className="sr-only" htmlFor="guide-q">
              Search guides
            </label>
            <input
              id="guide-q"
              name="q"
              type="text"
              enterKeyHint="search"
              placeholder="Search guides and recommendations…"
              defaultValue={filters.q ?? ""}
            />
            <label className="sr-only" htmlFor="guide-cat">
              Category
            </label>
            <select id="guide-cat" name="category" defaultValue={filters.category ?? ""}>
              <option value="">All</option>
              {guideCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <span className="results-count">
              {guides.length} guide{guides.length === 1 ? "" : "s"}
            </span>
          </LiveFilterForm>

          <nav className="guide-topics" aria-label="Browse by topic">
            <span>Browse by</span>
            <Link
              className={!filters.q && !filters.category ? "active" : undefined}
              to="/things-to-do"
              preventScrollReset
            >
              All topics
            </Link>
            {guideTopics.map((topic) => {
              const params = new URLSearchParams();
              if (topic.q) params.set("q", topic.q);
              if (topic.category) params.set("category", topic.category);
              const active =
                (filters.q ?? "").toLowerCase() === (topic.q ?? "") &&
                (filters.category ?? "") === (topic.category ?? "");
              return (
                <Link
                  key={topic.label}
                  className={active ? "active" : undefined}
                  to={`/things-to-do?${params}`}
                  preventScrollReset
                >
                  {topic.label}
                </Link>
              );
            })}
          </nav>

          {/* Keeps the heading order h1 → h2 → card h3 for screen readers. */}
          <h2 className="sr-only">Nairobi guides</h2>
          <div className="article-grid guide-article-grid">
            {guides.length > 0 ? (
              guides.map((guide, i) => <GuideArticleCard key={guide.slug} guide={guide} priority={i === 0} />)
            ) : (
              <div className="empty-state">
                <h3>No guides found just yet</h3>
                <p>Try another search or category.</p>
                <Link className="btn btn-light" to="/things-to-do">
                  Clear filters
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <CtaSection
        title="Stay close to what you love."
        text="Explore our apartments and choose a neighbourhood that suits your plans."
      >
        <Link className="btn" to="/stays">
          Find a stay ↗
        </Link>
      </CtaSection>
    </main>
  );
}
