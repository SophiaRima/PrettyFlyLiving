import type { RefObject } from "react";
import { Form } from "react-router";

import type { StayDates } from "~/lib/dates";
import type { FormFailure } from "~/lib/forms";
import { formatKes, whatsappMessages, whatsappUrl } from "~/lib/site";
import type { PropertyDetailData } from "~/lib/types";

import { FormGuard, FormStatus, fieldHelpers } from "./form-parts";

interface BookingCardProps {
  property: Pick<PropertyDetailData, "name" | "area" | "sleeps" | "monthlyPriceKes" | "minNights">;
  today: string;
  /** Shared with the availability calendar. */
  dates: StayDates;
  onDatesChange: (dates: StayDates) => void;
  turnstileSiteKey: string;
  formRef: RefObject<HTMLFormElement | null>;
  sending: boolean;
  /** Result of the last submission, if any. */
  result?: FormFailure | { ok: true; whatsappUrl: string };
}

/** The concept's sticky `.booking-card` with the Request to Book form. */
export function BookingCard({
  property,
  today,
  dates,
  onDatesChange,
  turnstileSiteKey,
  formRef,
  sending,
  result,
}: BookingCardProps) {
  const failure = result && !result.ok ? result : undefined;
  const { field, error } = fieldHelpers("book", failure);
  return (
    <div className="booking-card" id="booking">
      <div className="price">
        {formatKes(property.monthlyPriceKes)} <small>/ month</small>
      </div>
      <p style={{ fontSize: 11, margin: "5px 0 15px" }}>
        Ask about your dates  -  no payment is taken here.
      </p>
      <Form method="post" id="booking-form" ref={formRef} preventScrollReset>
        <label htmlFor="book-checkIn">Check-in date</label>
        <input
          className="form-control"
          {...field("checkIn")}
          defaultValue={undefined}
          type="date"
          min={today}
          required
          value={dates.checkIn}
          onChange={(event) => {
            const checkIn = event.target.value;
            // A check-out on or before the new check-in no longer makes sense.
            const checkOut = dates.checkOut > checkIn ? dates.checkOut : "";
            onDatesChange({ checkIn, checkOut });
          }}
        />
        {error("checkIn")}
        <label htmlFor="book-checkOut">Check-out date</label>
        <input
          className="form-control"
          {...field("checkOut")}
          defaultValue={undefined}
          type="date"
          min={dates.checkIn || today}
          required
          value={dates.checkOut}
          onChange={(event) => onDatesChange({ ...dates, checkOut: event.target.value })}
        />
        {error("checkOut")}
        <label htmlFor="book-guests">Guests</label>
        <select className="form-control" {...field("guests")}>
          {Array.from({ length: property.sleeps }, (_, i) => (
            <option key={i} value={i + 1}>
              {i + 1} guest{i ? "s" : ""}
            </option>
          ))}
        </select>
        {error("guests")}
        <label htmlFor="book-name">Your name</label>
        <input
          className="form-control"
          {...field("name")}
          required
          placeholder="Full name"
          autoComplete="name"
        />
        {error("name")}
        <label htmlFor="book-email">Email</label>
        <input
          className="form-control"
          {...field("email")}
          type="email"
          required
          placeholder="you@example.com"
          autoComplete="email"
        />
        {error("email")}
        <label htmlFor="book-phone">Phone / WhatsApp</label>
        <input
          className="form-control"
          {...field("phone")}
          type="tel"
          required
          placeholder="+254…"
          autoComplete="tel"
        />
        {error("phone")}
        <FormGuard siteKey={turnstileSiteKey} action="booking" resetKey={result} />
        <button className="btn" type="submit" disabled={sending}>
          {sending ? "Sending…" : "Request to book ↗"}
        </button>
        <a
          className="btn btn-light"
          href={whatsappUrl(whatsappMessages.property(property.name, property.area))}
          target="_blank"
          rel="noopener noreferrer"
          style={{ width: "100%", marginTop: 9 }}
        >
          Ask us on WhatsApp
        </a>
        {result?.ok && (
          <FormStatus tone="success">
            Your request has been sent. Our team will contact you to confirm
            availability, the total price and next steps. This is not a
            confirmed reservation.
            <a
              className="btn btn-light"
              href={result.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Send on WhatsApp too ↗
            </a>
          </FormStatus>
        )}
        {failure && <FormStatus tone="error">{failure.message}</FormStatus>}
        <p className="booking-note">
          Your request is not a confirmed reservation.
          {property.minNights > 1 && ` Minimum stay ${property.minNights} nights.`}
        </p>
      </Form>
    </div>
  );
}

/** Fixed bottom bar on mobile that scrolls to the booking card. */
export function MobileBookBar({ monthlyPriceKes }: { monthlyPriceKes: number }) {
  return (
    <div className="mobile-book">
      <div className="price">
        {formatKes(monthlyPriceKes)} <small>/ month</small>
      </div>
      <button
        className="btn"
        type="button"
        onClick={() =>
          document.querySelector(".booking-card")?.scrollIntoView({
            // Guests who ask their device for less motion jump straight there.
            behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
            block: "center",
          })
        }
      >
        Request to book ↗
      </button>
    </div>
  );
}
