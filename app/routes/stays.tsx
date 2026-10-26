import { Link } from "react-router";

import { getAreas, getPublishedProperties } from "~/.server/queries/properties";
import { dbFromContext, nairobiToday } from "~/.server/request";
import { CtaSection } from "~/components/site/cta-band";
import { LiveFilterForm } from "~/components/site/live-filter-form";
import { PageHero } from "~/components/site/page-hero";
import { PropertyCard } from "~/components/site/property-card";
import { pageMeta } from "~/lib/seo";
import { formatKes, priceBrackets, site, whatsappMessages, whatsappUrl } from "~/lib/site";
import { parseSearchParams, stayFiltersSchema } from "~/lib/validation";

import type { Route } from "./+types/stays";

export function meta(): Route.MetaDescriptors {
  return pageMeta({
    title: "Our stays  -  Pretty Fly Living",
    description:
      "Considered serviced apartments in Nairobi, with the comforts of home and space to make the city your own.",
    path: "/stays",
  });
}

export async function loader({ request, context }: Route.LoaderArgs) {
  const db = dbFromContext(context);
  const filters = parseSearchParams(stayFiltersSchema, request.url);
  const [stays, areas] = await Promise.all([
    getPublishedProperties(db, filters),
    getAreas(db),
  ]);
  return { stays, areas, filters, today: nairobiToday() };
}

const GUEST_OPTIONS = [1, 2, 3, 4, 5, 6];

export default function Stays({ loaderData }: Route.ComponentProps) {
  const { stays, areas, filters, today } = loaderData;
  return (
    <main>
      <PageHero
        eyebrow="Find your place"
        title="Our stays."
        intro="Considered apartments in Nairobi, with the comforts of home and space to make the city your own."
        action={
          <Link className="btn" to="/contact">
            Need a recommendation? ↗
          </Link>
        }
      />

      <section className="section">
        <div className="container">
          <LiveFilterForm>
            <label className="sr-only" htmlFor="filter-q">
              Search stays
            </label>
            <input
              id="filter-q"
              name="q"
              type="text"
              enterKeyHint="search"
              placeholder="Search by name or neighbourhood…"
              defaultValue={filters.q ?? ""}
            />
            <label className="sr-only" htmlFor="filter-area">
              Neighbourhood
            </label>
            <select id="filter-area" name="area" defaultValue={filters.area ?? ""}>
              <option value="">All locations</option>
              {areas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
            <label className="filter-field" htmlFor="filter-in">
              <span>Check in</span>
              <input
                id="filter-in"
                name="in"
                type="date"
                min={today}
                defaultValue={filters.in ?? ""}
              />
            </label>
            <label className="filter-field" htmlFor="filter-out">
              <span>Check out</span>
              <input
                id="filter-out"
                name="out"
                type="date"
                min={today}
                defaultValue={filters.out ?? ""}
              />
            </label>
            <label className="sr-only" htmlFor="filter-guests">
              Guests
            </label>
            <select
              id="filter-guests"
              name="guests"
              defaultValue={filters.guests ? String(filters.guests) : ""}
            >
              <option value="">Any guests</option>
              {GUEST_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n} guest{n > 1 ? "s" : ""}
                </option>
              ))}
            </select>
            <label className="sr-only" htmlFor="filter-beds">
              Bedrooms
            </label>
            <select
              id="filter-beds"
              name="beds"
              defaultValue={filters.beds ? String(filters.beds) : ""}
            >
              <option value="">Any bedrooms</option>
              {[1, 2, 3].map((n) => (
                <option key={n} value={n}>
                  {n}+ bedroom{n > 1 ? "s" : ""}
                </option>
              ))}
            </select>
            <label className="sr-only" htmlFor="filter-max">
              Monthly price
            </label>
            <select
              id="filter-max"
              name="max"
              defaultValue={filters.max ? String(filters.max) : ""}
            >
              <option value="">Any monthly price</option>
              {priceBrackets.map((max) => (
                <option key={max} value={max}>
                  Up to {formatKes(max)}
                </option>
              ))}
            </select>
            <label className="sr-only" htmlFor="filter-sort">
              Sort
            </label>
            <select
              id="filter-sort"
              name="sort"
              defaultValue={filters.sort === "featured" ? "" : filters.sort}
            >
              <option value="">Featured</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
            </select>
            <span className="results-count">
              {stays.length} stay{stays.length === 1 ? "" : "s"}
            </span>
          </LiveFilterForm>

          <div className="property-grid" id="listing-grid">
            {stays.length > 0 ? (
              stays.map((stay) => <PropertyCard key={stay.slug} property={stay} />)
            ) : (
              <div className="empty-state">
                <h3>No stays found just yet</h3>
                <p>
                  {filters.in
                    ? "Try different dates, a different neighbourhood or a broader price range."
                    : "Try a different neighbourhood or broaden your price range."}
                </p>
                <Link className="btn btn-light" to="/stays">
                  Clear filters
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <CtaSection
        title="Need help choosing an apartment?"
        text="Tell us your dates and what matters to you, and we’ll suggest the right stay."
      >
        <div className="cta-actions">
          <a
            className="btn"
            href={whatsappUrl(whatsappMessages.general)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Chat on WhatsApp ↗
          </a>
          <a
            className="btn btn-ghost"
            href={`mailto:${site.email}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Email us ↗
          </a>
        </div>
      </CtaSection>
    </main>
  );
}
