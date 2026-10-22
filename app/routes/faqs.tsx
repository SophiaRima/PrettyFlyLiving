import { Form, Link } from "react-router";

import { getFaqs } from "~/.server/queries/content";
import { dbFromContext } from "~/.server/request";
import { PageHero } from "~/components/site/page-hero";
import { site, whatsappMessages, whatsappUrl } from "~/lib/site";

import type { Route } from "./+types/faqs";

export function meta(): Route.MetaDescriptors {
  return [
    { title: "FAQs  -  Pretty Fly Living" },
    {
      name: "description",
      content:
        "Answers about staying with Pretty Fly Living in Nairobi, and about having us manage your property.",
    },
  ];
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
            <div className="eyebrow" style={{ margin: "10px 0" }}>
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
            <div className="eyebrow">{isGuests ? "Your stay" : "Property management"}</div>
            <h2 style={{ fontSize: 35 }}>
              {isGuests ? "Questions about staying?" : "Questions about your property?"}
            </h2>
            {faqs.map((faq) => (
              <details className="accordion" key={faq.id}>
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
