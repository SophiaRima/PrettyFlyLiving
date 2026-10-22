import { Link } from "react-router";

import { getExtraServices, getPublishedReviews } from "~/.server/queries/content";
import { dbFromContext } from "~/.server/request";
import { CtaSection } from "~/components/site/cta-band";
import { Img } from "~/components/site/img";
import { PageHero } from "~/components/site/page-hero";
import { QuoteCard } from "~/components/site/quote-card";
import { ServiceGrid, type ServiceItem } from "~/components/site/service-grid";
import { pageImages, whyUsReviewCount } from "~/lib/site";

import type { Route } from "./+types/why-us";

export function meta(): Route.MetaDescriptors {
  return [
    { title: "Why stay with us  -  Pretty Fly Living" },
    {
      name: "description",
      content:
        "Inviting spaces, thoughtful details and genuinely helpful hospitality in Nairobi.",
    },
  ];
}

export async function loader({ context }: Route.LoaderArgs) {
  const db = dbFromContext(context);
  const [services, reviews] = await Promise.all([
    getExtraServices(db),
    getPublishedReviews(db, whyUsReviewCount),
  ]);
  return { services, reviews };
}

/** "The details matter": the brief's "our standards". */
const standards: readonly ServiceItem[] = [
  { icon: "⌂", title: "Thoughtful locations", text: "Neighbourhoods that make it easy to get where you need to go." },
  { icon: "✳", title: "Comfort-first spaces", text: "Furnished apartments with the essentials for real everyday living." },
  { icon: "♡", title: "Responsive support", text: "A real team ready to help with questions before and during your stay." },
  { icon: "◷", title: "Flexible options", text: "Tell us what your trip needs, from a few nights to a longer stay." },
  { icon: "✓", title: "Clear communication", text: "Straightforward booking enquiries and practical arrival information." },
  { icon: "⌘", title: "Local knowledge", text: "Helpful recommendations to make Nairobi feel a little more familiar." },
];

export default function WhyUs({ loaderData }: Route.ComponentProps) {
  const { services, reviews } = loaderData;
  return (
    <main>
      <PageHero
        eyebrow="The Pretty Fly approach"
        title={
          <>
            A stay that feels
            <br />
            like you.
          </>
        }
        intro="We bring together inviting spaces, thoughtful details and genuinely helpful hospitality  -  so you can focus on what brought you to Nairobi."
        action={
          <Link className="btn" to="/stays">
            Find your stay ↗
          </Link>
        }
      />

      <section className="section">
        <div className="container split">
          <div>
            <div className="eyebrow">A little more considered</div>
            <h2>Comfort should come naturally.</h2>
            <p>
              Pretty Fly Living is built around a simple idea: where you stay
              shapes how you experience a place. Our aim is to make every
              arrival easier, every day more comfortable, and every guest feel
              welcome.
            </p>
            <p>
              From the neighbourhood we recommend to the small details in your
              apartment, we put care into the parts of a stay that matter.
            </p>
            <Link className="btn" to="/stays">
              Explore our stays ↗
            </Link>
          </div>
          <div className="split-image">
            <Img src={pageImages.whySplit.src} alt={pageImages.whySplit.alt} />
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "#eeece3" }}>
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">What you can expect</div>
              <h2>The details matter.</h2>
            </div>
          </div>
          <ServiceGrid items={standards} />
        </div>
      </section>

      {services.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-head">
              <div>
                <div className="eyebrow">Extra services</div>
                <h2>A little extra, when you need it.</h2>
              </div>
              <p>
                Add the services that make settling in easier. Ask us when you
                send your booking request.
              </p>
            </div>
            <div className="article-grid">
              {services.map((service) => (
                <article className="article-card" key={service.id}>
                  <div className="property-image">
                    <Img src={service.imageKey} alt={service.title} />
                  </div>
                  <div className="property-body">
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {reviews.length > 0 && (
        <section
          className="section"
          style={services.length > 0 ? { paddingTop: 0 } : undefined}
        >
          <div className="container quote-grid">
            <div>
              <div className="eyebrow">Hospitality, thoughtfully done</div>
              <h2>Here for the whole stay.</h2>
              <p>
                From the first enquiry to check-out, we aim to make the
                experience feel considered and personal.
              </p>
            </div>
            <div className="quote-stack">
              {reviews.map((review) => (
                <QuoteCard key={review.id} review={review} />
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaSection
        title="Find your place in Nairobi."
        text="Take a look around and find a stay that fits your trip."
      >
        <Link className="btn" to="/stays">
          View all stays ↗
        </Link>
      </CtaSection>
    </main>
  );
}
