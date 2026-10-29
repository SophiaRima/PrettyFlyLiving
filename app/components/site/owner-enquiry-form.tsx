import { useEffect, useRef } from "react";
import { Form } from "react-router";

import type { FormFailure } from "~/lib/forms";

import { FormGuard, FormStatus, fieldHelpers } from "./form-parts";

interface OwnerEnquiryFormProps {
  failure?: FormFailure;
  sent: boolean;
  sending: boolean;
  siteKey: string;
  /** Changes after each submit, so Turnstile hands out a fresh token. */
  resetKey: unknown;
}

/**
 * The concept's owner enquiry form (client, 2026-10-29: brief, not the longer
 * four-step form). Property type(s) and units are typed in, not chosen.
 */
export function OwnerEnquiryForm({ failure, sent, sending, siteKey, resetKey }: OwnerEnquiryFormProps) {
  const { field, error } = fieldHelpers("owner", failure);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (sent) formRef.current?.reset();
  }, [sent, resetKey]);

  return (
    <Form method="post" id="owner-form" ref={formRef} preventScrollReset>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="owner-name">Your name *</label>
          <input {...field("name")} required placeholder="Full name" autoComplete="name" />
          {error("name")}
        </div>
        <div className="form-group">
          <label htmlFor="owner-email">Email *</label>
          <input {...field("email")} type="email" required placeholder="you@example.com" autoComplete="email" />
          {error("email")}
        </div>
        <div className="form-group">
          <label htmlFor="owner-phone">Phone / WhatsApp *</label>
          <input {...field("phone")} type="tel" required placeholder="+254…" autoComplete="tel" />
          {error("phone")}
        </div>
        <div className="form-group">
          <label htmlFor="owner-location">Property location *</label>
          <input {...field("location")} required placeholder="e.g. Kilimani" />
          {error("location")}
        </div>
        <div className="form-group">
          <label htmlFor="owner-type">Property type(s) *</label>
          <input {...field("type")} required placeholder="e.g. Studio, one bedroom" />
          {error("type")}
        </div>
        <div className="form-group">
          <label htmlFor="owner-units">Number of units *</label>
          <input
            {...field("units")}
            type="number"
            inputMode="numeric"
            min={1}
            max={500}
            required
            placeholder="e.g. 2"
          />
          {error("units")}
        </div>
        <div className="form-group full">
          <label htmlFor="owner-message">What would you like help with?</label>
          <textarea {...field("message")} placeholder="Tell us about your property and goals…" />
          {error("message")}
        </div>
        <div className="form-group full">
          <FormGuard siteKey={siteKey} action="owner" resetKey={resetKey} />
          <button className="btn" type="submit" disabled={sending}>
            {sending ? "Sending…" : "Send property enquiry ↗"}
          </button>
          {sent && (
            <FormStatus tone="success">
              Thank you for your interest in Pretty Fly Living. We’ll review your
              enquiry and get in touch to discuss your property and management
              needs.
            </FormStatus>
          )}
          {failure && <FormStatus tone="error">{failure.message}</FormStatus>}
        </div>
      </div>
    </Form>
  );
}
