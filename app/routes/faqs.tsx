import { Form, Link } from "react-router";

import { getFaqs } from "~/.server/queries/content";
import { dbFromContext } from "~/.server/request";
import { CtaSection } from "~/components/site/cta-band";
import { PageHero } from "~/components/site/page-hero";
import { faqJsonLd, pageMeta } from "~/lib/seo";
import { site, whatsappMessages, whatsappUrl } from "~/lib/site";

import type { Route } from "./+types/faqs";

export function meta({ loaderData }: Route.MetaArgs): Route.MetaDescriptors {
  // Each tab is its own page of answers, so the owners tab keeps its query.
  const owners = loaderData?.tab === "owners";
  return pageMeta({
    title: owners ? "FAQs for property owners  -  Pretty Fly Living" : "FAQs  -  Pretty Fly Living",
    description:
      "Answers about staying with Pretty Fly Living in Nairobi, and about having us manage your property.",
    path: owners ? "/faqs?tab=owners" : "/faqs",
    jsonLd: faqJsonLd(loaderData?.faqs ?? []),
  });
}

export async function loader({ request, context }: Route.LoaderArgs) {
  const tab = new URL(request.url).searchParams.get("tab") === "owners" ? "owners" : "guests";
  const faqs = await getFaqs(dbFromContext(context), tab === "owners" ? "owner" : "guest");
  return { tab, faqs };
}

export default function Faqs({ loaderData }: Route.ComponentProps) {
  const { tab, faqs } = loaderData;
  const isGuests = tab === "guests";
  return (
    <main>
      <PageHero
        eyebrow="A few helpful answers"
        title="Good to know."
        intro="Find answers about staying with us or having Pretty Fly Living manage your property."
        action={
          <Link className="btn" to="/contact">
            Still have a question? ↗
          </Link>
        }
      />

      <section className="section">
        <div className="container faq-wrap">
          <aside>
            {/* The visible label is the concept's eyebrow; the hidden h2 keeps
                the heading order h1 → h2 → "Need a human answer?" h3. */}
            <h2 className="sr-only">Browse by topic</h2>
            <div className="eyebrow" style={{ margin: "10px 0" }} aria-hidden="true">
              Browse by topic
            </div>
            {/* A GET form keeps the concept's <button> tabs working without JS. */}
            <Form className="faq-tabs" method="get" preventScrollReset>
              <button
                name="tab"
                value="guests"
                className={isGuests ? "active" : undefined}
                aria-pressed={isGuests}
              >
                For guests
              </button>
              <button
                name="tab"
                value="owners"
                className={isGuests ? undefined : "active"}
                aria-pressed={!isGuests}
              >
                For property owners
              </button>
            </Form>
            <div
              style={{
                marginTop: 28,
                padding: 18,
                background: "var(--sage2)",
                borderRadius: 14,
              }}
            >
              <h3>Need a human answer?</h3>
              <p style={{ fontSize: 11 }}>We’re happy to help with the details.</p>
              <div className="link-row">
                <a
                  className="text-link"
                  href={whatsappUrl(whatsappMessages.general)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp us ↗
                </a>
                <a
                  className="text-link"
                  href={`mailto:${site.email}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Email us ↗
                </a>
                <Link className="text-link" to="/contact">
                  Contact our team ↗
                </Link>
              </div>
            </div>
          </aside>
          <div>
            {isGuests ? (
              <>
                <div className="eyebrow">Guest FAQs</div>
                <h2 style={{ fontSize: 35 }}>Everything you need to know before your stay.</h2>
                <p>
                  Planning an extended stay with Pretty Fly Living? Find answers
                  to common questions about booking, our furnished apartments
                  and what to expect during your stay.
                </p>
              </>
            ) : (
              <>
                <div className="eyebrow">For property owners</div>
                <h2 style={{ fontSize: 35 }}>Property owner FAQs.</h2>
                <p>
                  Considering partnering with Pretty Fly Living? Find answers to
                  common questions about our property management services, how
                  we work and how your property could become part of our
                  growing portfolio.
                </p>
              </>
            )}
            {faqs.map((faq) => (
              <details className="accordion" key={faq.id}>
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
              </details>
            ))}
            {isGuests && (
              <p className="section-note">
                Have a question?{" "}
                <Link className="text-link" to="/contact">
                  Contact Pretty Fly Living
                </Link>
                , and we’ll be happy to assist.
              </p>
            )}
          </div>
        </div>
      </section>

      {isGuests ? (
        <CtaSection
          title="Find your next stay."
          text="Discover furnished apartments designed for extended stays, with the comfort and practical amenities you need to feel at home."
        >
          <Link className="btn" to="/stays">
            Explore our stays ↗
          </Link>
        </CtaSection>
      ) : (
        <CtaSection
          title="Let’s talk about your property."
          text="Whether you own a single apartment or multiple units, we’d love to learn more about your property and explore how we could work together."
        >
          <Link className="btn" to="/management#owner-enquiry">
            Enquire about property management ↗
          </Link>
        </CtaSection>
      )}
    </main>
  );
}
