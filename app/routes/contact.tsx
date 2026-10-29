import { useEffect, useRef } from "react";
import { data, Form, Link, useNavigation } from "react-router";

import { notifyInBackground } from "~/.server/email";
import { readGuardedForm } from "~/.server/forms";
import { createContactMessage } from "~/.server/queries/inbox";
import { dbFromContext } from "~/.server/request";
import { FormGuard, FormStatus, fieldHelpers } from "~/components/site/form-parts";
import { PageHero } from "~/components/site/page-hero";
import { cloudflareContext } from "~/context";
import { enquiryTypes } from "~/lib/constants";
import { pageMeta } from "~/lib/seo";
import { site, whatsappMessages, whatsappUrl } from "~/lib/site";
import { contactMessageSchema } from "~/lib/validation";

import type { Route } from "./+types/contact";

export function meta(): Route.MetaDescriptors {
  return pageMeta({
    title: "Contact us  -  Pretty Fly Living",
    description:
      "Planning a stay or considering property management in Nairobi? Reach Pretty Fly Living by WhatsApp, email, phone or the contact form.",
    path: "/contact",
  });
}

export function loader({ context }: Route.LoaderArgs) {
  return { turnstileSiteKey: context.get(cloudflareContext).env.TURNSTILE_SITE_KEY };
}

export async function action({ request, context }: Route.ActionArgs) {
  const { env, ctx } = context.get(cloudflareContext);
  const form = await readGuardedForm(request, env, "contact", contactMessageSchema);
  if (form.kind === "spam") return { ok: true as const };
  if (form.kind === "invalid") return data(form.failure, { status: 400 });

  const message = form.data;
  const id = await createContactMessage(dbFromContext(context), message);
  notifyInBackground(env, ctx, {
    subject: `New enquiry (${message.type}) from ${message.name}`,
    rows: [
      ["Enquiry", message.type],
      ["Name", message.name],
      ["Email", message.email],
      ["Phone", message.phone ?? "-"],
      ["Message", message.message],
    ],
    adminPath: "/admin/messages",
    replyTo: message.email,
    idempotencyKey: `contact-message/${id}`,
  });
  return { ok: true as const };
}

export default function Contact({ loaderData, actionData }: Route.ComponentProps) {
  const failure = actionData && !actionData.ok ? actionData : undefined;
  const { field, error } = fieldHelpers("contact", failure);
  const sending = useNavigation().state === "submitting";
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (actionData?.ok) formRef.current?.reset();
  }, [actionData]);

  return (
    <main>
      <PageHero
        eyebrow="We’re here to help"
        title="Let’s talk."
        intro="Planning a stay, have a question, or considering professional property management? Tell us what you need."
      />

      <section className="section">
        <div className="container contact-grid">
          <div>
            <div className="eyebrow">Get in touch</div>
            <h2>Good conversations start here.</h2>
            <p>
              Choose the enquiry that fits best and our team will help you with
              the next step.
            </p>
            <div className="contact-method">
              <div className="service-icon">◉</div>
              <div>
                <strong>WhatsApp</strong>
                <p>Quick questions and stay enquiries.</p>
                <a
                  className="text-link"
                  href={whatsappUrl(whatsappMessages.general)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Start a WhatsApp chat ↗
                </a>
              </div>
            </div>
            <div className="contact-method">
              <div className="service-icon">✉</div>
              <div>
                <strong>Email</strong>
                <p>{site.email}</p>
                <a
                  className="text-link"
                  href={`mailto:${site.email}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Send an email ↗
                </a>
              </div>
            </div>
            <div className="contact-method">
              <div className="service-icon">☏</div>
              <div>
                <strong>Phone</strong>
                <p>{site.phone}</p>
                <a className="text-link" href={`tel:${site.phone.replace(/\s/g, "")}`}>
                  Call us ↗
                </a>
              </div>
            </div>
            <div className="contact-method">
              <div className="service-icon">⌂</div>
              <div>
                <strong>Based in Nairobi</strong>
                <p>Serving guests and property owners in Nairobi, Kenya.</p>
              </div>
            </div>
            <div style={{ marginTop: 24 }}>
              <h3>Looking for a place to stay?</h3>
              <Link viewTransition className="btn btn-light" to="/stays">
                Browse all stays ↗
              </Link>
            </div>
          </div>

          <Form method="post" id="contact-form" ref={formRef} preventScrollReset>
            <div className="eyebrow">Send an enquiry</div>
            <h2 style={{ fontSize: 34 }}>How can we help?</h2>
            <div className="form-grid">
              <div className="form-group full">
                <label htmlFor="contact-type">I’m enquiring about *</label>
                <select {...field("type")}>
                  {enquiryTypes.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
                {error("type")}
              </div>
              <div className="form-group">
                <label htmlFor="contact-name">Your name *</label>
                <input {...field("name")} required placeholder="Full name" autoComplete="name" />
                {error("name")}
              </div>
              <div className="form-group">
                <label htmlFor="contact-email">Email *</label>
                <input {...field("email")} type="email" required placeholder="you@example.com" autoComplete="email" />
                {error("email")}
              </div>
              <div className="form-group full">
                <label htmlFor="contact-phone">Phone / WhatsApp</label>
                <input {...field("phone")} type="tel" placeholder="+254…" autoComplete="tel" />
                {error("phone")}
              </div>
              <div className="form-group full">
                <label htmlFor="contact-message">Your message *</label>
                <textarea {...field("message")} required placeholder="Tell us a little about what you need…" />
                {error("message")}
              </div>
              <div className="form-group full">
                <FormGuard
                  siteKey={loaderData.turnstileSiteKey}
                  action="contact"
                  resetKey={actionData}
                />
                <button className="btn" type="submit" disabled={sending}>
                  {sending ? "Sending…" : "Send enquiry ↗"}
                </button>
                {actionData?.ok && (
                  <FormStatus tone="success">
                    Thank you, your message has been sent. Our team will get
                    back to you soon.
                  </FormStatus>
                )}
                {failure && <FormStatus tone="error">{failure.message}</FormStatus>}
              </div>
            </div>
          </Form>
        </div>
      </section>
    </main>
  );
}
