import { PageHero } from "~/components/site/page-hero";
import { pageMeta } from "~/lib/seo";
import { site } from "~/lib/site";

import type { Route } from "./+types/privacy-policy";

export function meta(): Route.MetaDescriptors {
  return pageMeta({
    title: "Privacy policy  -  Pretty Fly Living",
    description:
      "How Pretty Fly Living collects, uses and protects the details you share through booking requests and enquiries.",
    path: "/privacy-policy",
  });
}

// DRAFT for Sophiah to review before launch (retention periods in particular).
const LAST_UPDATED = "October 2026";

export default function PrivacyPolicy() {
  return (
    <main>
      <PageHero
        eyebrow="Privacy & terms"
        title="Your privacy."
        intro="How we collect, use and look after the details you share with us."
      />
      <article className="section">
        <div className="container article-layout">
          <p className="eyebrow">Last updated {LAST_UPDATED}</p>
          <p>
            {site.name} (“we”, “us”) runs prettyflyliving.com. This policy
            explains what information we collect when you send a booking
            request, contact form or property enquiry, why we collect it and
            how you can reach us about it. We handle personal data in line with
            Kenya’s Data Protection Act, 2019.
          </p>

          <h2>What we collect</h2>
          <p>
            <strong>Booking requests:</strong> your name, an email address or
            phone number, the stay you are interested in, your dates and the
            number of guests.
          </p>
          <p>
            <strong>Contact messages:</strong> your name, email address,
            optional phone number, the type of enquiry and your message.
          </p>
          <p>
            <strong>Property owner enquiries:</strong> your name, email
            address, phone number, the property’s location and type, the
            number of units and any details you choose to share.
          </p>
          <p>
            We do not take payments on this website and we do not ask for card
            or M-Pesa details.
          </p>

          <h2>How we use it</h2>
          <p>
            We use these details only to reply to you: to check availability,
            confirm or decline a booking request, answer your question or
            discuss managing your property. We do not sell your information
            and we do not use it for advertising.
          </p>

          <h2>Where it is stored</h2>
          <p>
            Submissions are stored securely in our website database, hosted by
            Cloudflare, and a copy is emailed to our team’s inbox. Our email
            notifications are sent through Resend. These providers process the
            data on our behalf and may store it outside Kenya.
          </p>

          <h2>Spam protection and saved stays</h2>
          <p>
            Our forms use Cloudflare Turnstile to keep out automated spam. If
            you tap the heart on a stay, the list of saved stays is kept only in
            your own browser; it is never sent to us.
          </p>

          <h2>How long we keep it</h2>
          <p>
            We keep enquiries and booking requests for as long as we need them
            to respond and manage any resulting stay or agreement, and then
            delete them. You can ask us to delete your details sooner.
          </p>

          <h2>Your rights</h2>
          <p>
            You can ask to see, correct or delete the personal information we
            hold about you, or object to how we use it. To make a request,
            email{" "}
            <a className="text-link" href={`mailto:${site.email}`}>
              {site.email}
            </a>
            .
          </p>

          <h2>Changes to this policy</h2>
          <p>
            If we change how we handle your information, we will update this
            page and the date above.
          </p>
        </div>
      </article>
    </main>
  );
}
