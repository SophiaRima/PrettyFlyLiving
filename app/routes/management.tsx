import { data, useNavigation } from "react-router";

import { notifyInBackground } from "~/.server/email";
import { readGuardedForm } from "~/.server/forms";
import { createOwnerEnquiry } from "~/.server/queries/inbox";
import { dbFromContext } from "~/.server/request";
import { Img } from "~/components/site/img";
import { OwnerEnquiryForm } from "~/components/site/owner-enquiry-form";
import { PageHero } from "~/components/site/page-hero";
import { ServiceGrid, type ServiceItem } from "~/components/site/service-grid";
import { cloudflareContext } from "~/context";
import { pageMeta } from "~/lib/seo";
import { pageImages } from "~/lib/site";
import { ownerEnquirySchema } from "~/lib/validation";

import type { Route } from "./+types/management";

export function meta(): Route.MetaDescriptors {
  return pageMeta({
    title: "Property management in Nairobi  -  Pretty Fly Living",
    description:
      "Thoughtful, end-to-end property management in Nairobi: listings, pricing, guest communication, cleaning, maintenance, Airbnb and Booking.com.",
    path: "/management",
  });
}

/** "What We Do" from the brief, as the concept's service cards. */
const services: readonly ServiceItem[] = [
  { icon: "⌂", title: "Listing creation & optimisation", text: "Clear descriptions, considered imagery and listing presentation across suitable booking channels." },
  { icon: "↗", title: "Pricing & revenue support", text: "Thoughtful rate reviews and calendar management based on season, demand and your goals." },
  { icon: "♡", title: "Guest communication", text: "Enquiry handling, practical information and responsive support throughout the guest journey." },
  { icon: "⌑", title: "Check-in & check-out", text: "Coordinated arrival and departure processes with clear guest instructions." },
  { icon: "✳", title: "Cleaning & maintenance", text: "Cleaning coordination, property checks and maintenance follow-up with agreed providers." },
  { icon: "★", title: "Reviews & channel management", text: "Guest feedback support and management of Airbnb, Booking.com and other agreed channels." },
];

const steps = [
  ["Get to know your property", "We learn about the home, your objectives and what matters to you."],
  ["Build the right plan", "We agree on services, responsibilities, reporting and fees."],
  ["Prepare to host", "We coordinate listing details, guest information and operational readiness."],
  ["Manage and improve", "We stay close to the details and review what can work better."],
] as const;

export function loader({ context }: Route.LoaderArgs) {
  return { turnstileSiteKey: context.get(cloudflareContext).env.TURNSTILE_SITE_KEY };
}

export async function action({ request, context }: Route.ActionArgs) {
  const { env, ctx } = context.get(cloudflareContext);
  const form = await readGuardedForm(request, env, "owner", ownerEnquirySchema);
  if (form.kind === "spam") return { ok: true as const };
  if (form.kind === "invalid") return data(form.failure, { status: 400 });

  const enquiry = form.data;
  const id = await createOwnerEnquiry(dbFromContext(context), enquiry);
  notifyInBackground(env, ctx, {
    subject: `New property owner enquiry from ${enquiry.name}`,
    rows: [
      ["Name", enquiry.name],
      ["Email", enquiry.email],
      ["Phone / WhatsApp", enquiry.phone],
      ["Preferred contact", enquiry.preferredContact ?? "-"],
      ["Property location", enquiry.location],
      ["Units to manage", String(enquiry.units)],
      ["Property type", enquiry.propertyType],
      ["Same location", enquiry.sameLocation ?? "-"],
      ["Furnishing", enquiry.furnishing ?? "-"],
      ["Listed online", enquiry.listedOnline ?? "-"],
      ["Listing links", enquiry.listingLinks ?? "-"],
      ["Support needed", enquiry.support.length > 0 ? enquiry.support.join("; ") : "-"],
      ["Message", enquiry.message ?? "-"],
    ],
    adminPath: "/admin/enquiries",
    replyTo: enquiry.email,
    idempotencyKey: `owner-enquiry/${id}`,
  });
  return { ok: true as const };
}

export default function Management({ loaderData, actionData }: Route.ComponentProps) {
  const failure = actionData && !actionData.ok ? actionData : undefined;
  const sending = useNavigation().state === "submitting";

  return (
    <main>
      <PageHero
        eyebrow="For property owners"
        title={
          <>
            Your property.
            <br />
            Our expertise.
          </>
        }
        intro="Thoughtful, end-to-end property management designed to make hosting simpler and your property work harder."
        action={
          <a className="btn" href="#owner-enquiry">
            Talk to our team ↗
          </a>
        }
      />

      <section className="section">
        <div className="container split">
          <div>
            <div className="eyebrow">A more considered way to host</div>
            <h2>Better care for your property. Less on your plate.</h2>
            <p>
              Managing a short-stay property takes time, attention and a great
              deal of coordination. Pretty Fly Living helps owners with the
              everyday details  -  from presenting the property well to
              supporting guests and keeping operations moving.
            </p>
            <p>
              We tailor the conversation to your property, goals and preferred
              level of involvement. Service scope, fees and performance
              expectations are agreed before management begins.
            </p>
            <a className="btn" href="#owner-enquiry">
              Discuss your property ↗
            </a>
          </div>
          <div className="split-image">
            <Img {...pageImages.managementSplit} priority />
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "#eeece3" }}>
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">Support from set-up to check-out</div>
              <h2>Management that covers the details.</h2>
            </div>
          </div>
          <ServiceGrid items={services} />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">A clear process</div>
              <h2>From first conversation to better hosting.</h2>
            </div>
          </div>
          <div className="steps">
            {steps.map(([title, text]) => (
              <div className="step" key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container contact-grid" id="owner-enquiry">
          <div>
            <div className="eyebrow">Property management enquiry</div>
            <h2>Tell us about your property.</h2>
            <p>
              Whether you own a single apartment or several properties, we’d
              love to learn more about what you have and how we can help.
            </p>
            <div className="contact-method">
              <div className="service-icon">⌂</div>
              <div>
                <strong>Made for your property</strong>
                <p>We’ll talk through your goals, property type and management needs.</p>
              </div>
            </div>
            <div className="contact-method">
              <div className="service-icon">↗</div>
              <div>
                <strong>Clear next steps</strong>
                <p>Scope, responsibilities and fees are discussed before any agreement.</p>
              </div>
            </div>
          </div>
          <OwnerEnquiryForm
            failure={failure}
            sent={actionData?.ok === true}
            sending={sending}
            siteKey={loaderData.turnstileSiteKey}
            resetKey={actionData}
          />
        </div>
      </section>
    </main>
  );
}
