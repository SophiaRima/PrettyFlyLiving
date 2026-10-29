import { Link } from "react-router";

import { getFeaturedGuides, getFeaturedReview } from "~/.server/queries/content";
import { getAreas, getFeaturedProperties } from "~/.server/queries/properties";
import { dbFromContext } from "~/.server/request";
import { CtaSection } from "~/components/site/cta-band";
import { GuideTile } from "~/components/site/guide-cards";
import { Img } from "~/components/site/img";
import { PropertyCard } from "~/components/site/property-card";
import { QuoteCard } from "~/components/site/quote-card";
import { SearchPanel } from "~/components/site/search-panel";
import { pageMeta } from "~/lib/seo";
import { pageImages } from "~/lib/site";

import type { Route } from "./+types/home";

export function meta(): Route.MetaDescriptors {
  return pageMeta({
    title: "Pretty Fly Living  -  Your Home in Nairobi",
    description:
      "Thoughtfully selected serviced apartments in Nairobi for short and extended stays. Explore Pretty Fly Living.",
    path: "/",
  });
}

export async function loader({ context }: Route.LoaderArgs) {
  const db = dbFromContext(context);
  const [stays, areas, review, guides] = await Promise.all([
    getFeaturedProperties(db, 4),
    getAreas(db),
    getFeaturedReview(db),
    getFeaturedGuides(db, 4),
  ]);
  return { stays, areas, review, guides };
}

const benefits = [
  ["01 · Thoughtful locations", "Neighbourhoods close to the things that bring you to Nairobi."],
  ["02 · Ready to live in", "Comfortable furnishings and the everyday essentials already here."],
  ["03 · A little flexibility", "Options for quick getaways and longer stays alike."],
  ["04 · Human support", "Friendly, responsive help throughout your stay."],
] as const;

export default function Home({ loaderData }: Route.ComponentProps) {
  const { stays, areas, review, guides } = loaderData;
  return (
    <main>
      <section className="hero">
        {/* Full bleed above 980px (site.css revision 7), the content column below. */}
        <div className="container hero-frame">
          <div className="hero-photo">
            {/* The LCP image: never lazy. React adds a matching <link rel="preload"> in <head> for it. */}
            <img
              src={pageImages.hero.src}
              srcSet={pageImages.hero.srcSet}
              sizes={pageImages.hero.sizes}
              width={pageImages.hero.width}
              height={pageImages.hero.height}
              alt={pageImages.hero.alt}
              fetchPriority="high"
            />
          </div>
          <div className="hero-inner">
            <div className="hero-copy">
              <div className="eyebrow">Serviced apartments · Nairobi</div>
              <h1>
                Your home
                <br />
                in Nairobi.
              </h1>
              <p>
                Beautiful apartments. Thoughtful service. Room to settle in,
                whether you’re here for a weekend or a little longer.
              </p>
              <Link viewTransition className="btn" to="/stays">
                Browse our stays <span>↗</span>
              </Link>
              <div className="hero-note">
                Beautiful stays, thoughtfully managed.
              </div>
            </div>
          </div>
        </div>
        <div className="container">
          <SearchPanel areas={areas} />
          <div className="intro-strip">
            <span>Considered spaces</span>
            <span>Comforts that matter</span>
            <span>Local knowledge</span>
            <span>Here when you need us</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">A place to settle in</div>
              <h2>Stays worth coming home to.</h2>
            </div>
            <div>
              <p>
                Discover thoughtfully furnished apartments in Nairobi’s
                most-loved neighbourhoods, chosen for comfort, convenience and
                a little breathing room.
              </p>
              <Link viewTransition className="text-link" to="/stays">
                Explore all stays ↗
              </Link>
            </div>
          </div>
          <div className="property-grid">
            {stays.map((stay) => (
              <PropertyCard key={stay.slug} property={stay} />
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 20 }}>
        <div className="container split">
          <div>
            <div className="eyebrow">The Pretty Fly feeling</div>
            <h2>More than a place to stay.</h2>
            <p>
              We believe the best stays feel effortless. That means inviting
              spaces, the details taken care of, and a real person to turn to
              when you need a hand.
            </p>
            <div className="benefits">
              {benefits.map(([title, text]) => (
                <div className="benefit" key={title}>
                  <strong>{title}</strong>
                  <p>{text}</p>
                </div>
              ))}
            </div>
            <Link viewTransition className="btn" to="/why-us">
              Why stay with us ↗
            </Link>
          </div>
          <div className="split-image">
            <Img {...pageImages.homeSplit} />
            <div className="image-caption">A softer landing in the city.</div>
          </div>
        </div>
      </section>

      {review && (
        <section className="section quote-section">
          <div className="container quote-grid">
            <div>
              <div className="eyebrow">Kind words, real stays</div>
              <h2>Good stays stay with you.</h2>
              <p>
                We want every guest to feel looked after, comfortable and glad
                they chose us.
              </p>
              <Link viewTransition className="text-link" to="/why-us">
                What makes us different ↗
              </Link>
            </div>
            <QuoteCard review={review} />
          </div>
        </section>
      )}

      {guides.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-head">
              <div>
                <div className="eyebrow">Get to know the neighbourhood</div>
                <h2>Make yourself at home in Nairobi.</h2>
              </div>
              <Link viewTransition className="text-link" to="/things-to-do">
                Discover the city ↗
              </Link>
            </div>
            <div className="guide-grid">
              {guides.map((guide) => (
                <GuideTile key={guide.slug} guide={guide} />
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaSection
        eyebrow="For property owners"
        title="Your property. Our expertise."
        text="Thoughtful property management, with your returns and your home in mind."
      >
        <Link viewTransition className="btn" to="/management">
          Explore property management ↗
        </Link>
      </CtaSection>
    </main>
  );
}
