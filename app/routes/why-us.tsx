import { Link } from "react-router";

import { getExtraServices, getPublishedReviews } from "~/.server/queries/content";
import { dbFromContext } from "~/.server/request";
import { CtaSection } from "~/components/site/cta-band";
import { Img } from "~/components/site/img";
import { PageHero } from "~/components/site/page-hero";
import { QuoteCard } from "~/components/site/quote-card";
import { ServiceGrid, type ServiceItem } from "~/components/site/service-grid";
import { pageMeta } from "~/lib/seo";
import { pageImages, whatsappMessages, whatsappUrl, whyUsReviewCount } from "~/lib/site";

import type { Route } from "./+types/why-us";

export function meta(): Route.MetaDescriptors {
  return pageMeta({
    title: "Why stay with us  -  Pretty Fly Living",
    description:
      "Inviting spaces, thoughtful details and genuinely helpful hospitality in Nairobi.",
    path: "/why-us",
  });
}

export async function loader({ context }: Route.LoaderArgs) {
  const db = dbFromContext(context);
  const [services, reviews] = await Promise.all([
    getExtraServices(db),
    getPublishedReviews(db, whyUsReviewCount),
  ]);
  return { services, reviews };
}

/** "Our Standards" (client copy, 2026-10). */
const standards: readonly ServiceItem[] = [
  { icon: "✳", title: "Cleanliness", text: "Every space is cleaned and prepared with care before each arrival, so you can settle in comfortably." },
  { icon: "♡", title: "Comfort", text: "From comfortable bedding to thoughtfully furnished interiors, we consider what makes a space pleasant to live in." },
  { icon: "✓", title: "Reliability", text: "We aim to keep essential amenities working as they should, so you can focus on your day without unnecessary interruptions." },
  { icon: "⌘", title: "Security", text: "We prioritise properties in secure settings, helping you feel more at ease throughout your stay." },
  { icon: "⌂", title: "Convenient Locations", text: "Our properties are situated in well-connected neighbourhoods, with easy access to public transport, shopping centres, restaurants and other everyday essentials." },
  { icon: "◷", title: "Thoughtful Hospitality", text: "We believe good hosting means being attentive, approachable and ready to help when you need us." },
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
            <div className="eyebrow">Our story</div>
            <h2>The difference is in the thinking.</h2>
            <p>
              A place can look beautiful in photographs. But what makes it a
              good place to stay is everything you discover once you walk
              through the door.
            </p>
            <p>
              The bed that lets you rest properly. The Wi-Fi that works when
              you need it. The cleanliness you can feel. The security that lets
              you relax. The location that makes getting through your day a
              little easier.
            </p>
            <p>
              At Pretty Fly Living, these details are never incidental. They
              are the starting point.
            </p>
            <p>
              We believe a well-designed stay should do more than look good. It
              should work beautifully, feel effortless and give you the freedom
              to focus on the things that matter to you.
            </p>
            <p>
              That belief shapes how we prepare our spaces, choose our
              locations and care for the people who stay with us. Nothing is
              too small to matter, and comfort is never something we leave to
              chance.
            </p>
            <p>
              You may come for the space. You may stay for the convenience. But
              we hope you’ll remember how considered everything felt.
            </p>
            <p className="story-signoff">
              Pretty Fly Living. Beautiful stays, thoughtfully managed.
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
              <h2>Our standards.</h2>
            </div>
            <p>
              We hold ourselves to clear standards in the way we prepare and
              manage our apartments.
            </p>
          </div>
          <ServiceGrid items={standards} />
          <p className="section-note">
            These standards guide how we select, prepare and manage our
            properties, helping us create stays that feel comfortable,
            convenient and well cared for.
          </p>
        </div>
      </section>

      {services.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-head">
              <div>
                <div className="eyebrow">Extra services</div>
                <h2>More for your stay.</h2>
              </div>
              <p>
                Make your stay even more seamless with a little help along the
                way. From airport transfers to discovering Nairobi with a local,
                we can help you arrange experiences that make your time here
                easier and more memorable.
              </p>
            </div>
            <div className="article-grid">
              {services.map((service) => (
                <article className="article-card" key={service.id}>
                  <div className="property-image">
                    <Img src={service.imageKey} alt={service.title} />
                  </div>
                  <div className="property-body service-card-body">
                    {service.eyebrow && <div className="article-tag">{service.eyebrow}</div>}
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                    {service.details && <p className="service-details">{service.details}</p>}
                    {service.ctaLabel && (
                      <a
                        className="btn btn-light"
                        href={whatsappUrl(whatsappMessages.service(service.title))}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {service.ctaLabel} ↗
                      </a>
                    )}
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
          <div className="container">
            <div className="section-head">
              <div>
                <div className="eyebrow">Hospitality, thoughtfully done</div>
                <h2>Here for the whole stay.</h2>
              </div>
              <p>
                From the first enquiry to check-out, we aim to make the
                experience feel considered and personal.
              </p>
            </div>
            <div className="review-grid">
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
