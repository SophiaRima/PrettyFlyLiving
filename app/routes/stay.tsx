import { useEffect, useRef, useState } from "react";
import { data, Link, useNavigation } from "react-router";

import { notifyInBackground } from "~/.server/email";
import { formFailure, readGuardedForm } from "~/.server/forms";
import { getBlockedNights, isRangeBlocked } from "~/.server/queries/availability";
import { createBookingRequest } from "~/.server/queries/inbox";
import { getPropertyBySlug, getSimilarProperties } from "~/.server/queries/properties";
import { dbFromContext, nairobiToday } from "~/.server/request";
import { AvailabilityCalendar } from "~/components/site/availability-calendar";
import { BookingCard, MobileBookBar } from "~/components/site/booking-card";
import { Gallery } from "~/components/site/gallery";
import { PropertyCard } from "~/components/site/property-card";
import { cloudflareContext } from "~/context";
import { addDays, formatShortDate, nightsBetween, stayRangeError, type StayDates } from "~/lib/dates";
import { pageMeta, stayJsonLd } from "~/lib/seo";
import { bedroomLabel, countLabel, formatKes, whatsappMessages, whatsappUrl } from "~/lib/site";
import { bookingRequestSchema } from "~/lib/validation";

import type { Route } from "./+types/stay";

export function meta({ loaderData }: Route.MetaArgs): Route.MetaDescriptors {
  if (!loaderData) return [{ title: "Stay not found  -  Pretty Fly Living" }];
  const { property } = loaderData;
  return pageMeta({
    title: `${property.name}, ${property.area}  -  Pretty Fly Living`,
    description: property.description.slice(0, 160),
    path: `/stays/${property.slug}`,
    image: property.coverKey ? { src: property.coverKey, alt: property.coverAlt } : undefined,
    jsonLd: stayJsonLd(property),
  });
}

/** How far ahead the calendar shows availability (about 18 months). */
const CALENDAR_DAYS = 548;

export async function loader({ params, context }: Route.LoaderArgs) {
  const db = dbFromContext(context);
  const property = await getPropertyBySlug(db, params.slug);
  if (!property) throw data(null, { status: 404 });
  const today = nairobiToday();
  const calendarEnd = addDays(today, CALENDAR_DAYS);
  const [similar, blocked] = await Promise.all([
    getSimilarProperties(db, property, 2),
    getBlockedNights(db, property.id, today, calendarEnd),
  ]);
  return {
    property,
    similar,
    blocked,
    today,
    calendarEnd,
    turnstileSiteKey: context.get(cloudflareContext).env.TURNSTILE_SITE_KEY,
  };
}

export async function action({ request, params, context }: Route.ActionArgs) {
  const { env, ctx } = context.get(cloudflareContext);
  const db = dbFromContext(context);
  const property = await getPropertyBySlug(db, params.slug);
  if (!property) throw data(null, { status: 404 });

  const form = await readGuardedForm(request, env, "booking", bookingRequestSchema);
  if (form.kind === "spam") {
    return { ok: true as const, whatsappUrl: whatsappUrl(whatsappMessages.general) };
  }
  if (form.kind === "invalid") return data(form.failure, { status: 400 });

  const booking = form.data;
  const today = nairobiToday();
  const rangeError = stayRangeError(booking.checkIn, booking.checkOut, today, property.minNights);
  if (rangeError) {
    const field = booking.checkIn < today ? "checkIn" : "checkOut";
    return data(formFailure(rangeError, form.values, { [field]: rangeError }), { status: 400 });
  }
  if (booking.guests > property.sleeps) {
    const message = `This stay sleeps up to ${countLabel(property.sleeps, "guest")}.`;
    return data(formFailure(message, form.values, { guests: message }), { status: 400 });
  }
  if (await isRangeBlocked(db, property.id, booking.checkIn, booking.checkOut)) {
    return data(
      formFailure(
        "Sorry, some of those dates are already booked. Please choose different dates or ask us on WhatsApp.",
        form.values,
        { checkIn: "Not available for these dates." },
      ),
      { status: 409 },
    );
  }

  const id = await createBookingRequest(db, property.id, booking);
  const checkIn = formatShortDate(booking.checkIn);
  const checkOut = formatShortDate(booking.checkOut);
  notifyInBackground(env, ctx, {
    subject: `New booking request: ${property.name}, ${checkIn} – ${checkOut}`,
    rows: [
      ["Stay", `${property.name} (${property.area})`],
      ["Check-in", checkIn],
      ["Check-out", checkOut],
      ["Nights", String(nightsBetween(booking.checkIn, booking.checkOut))],
      ["Guests", String(booking.guests)],
      ["Name", booking.name],
      ["Email", booking.email],
      ["Phone / WhatsApp", booking.phone],
      ["Listed price", `${formatKes(property.monthlyPriceKes)} / month`],
    ],
    adminPath: `/admin/bookings/${id}`,
    replyTo: booking.email,
    idempotencyKey: `booking-request/${id}`,
  });

  return {
    ok: true as const,
    whatsappUrl: whatsappUrl(
      whatsappMessages.bookingRequest({
        property: property.name,
        area: property.area,
        checkIn,
        checkOut,
        guests: booking.guests,
        name: booking.name,
        email: booking.email,
        phone: booking.phone,
      }),
    ),
  };
}

const DEFAULT_GOOD_TO_KNOW =
  "Check-in details are shared after your booking is confirmed. Please treat the apartment and neighbours with care. Smoking and events are not permitted unless agreed in writing.";

/** A short "Label:" at the start of a Good to know line, shown in bold. */
const LEAD_LABEL = /^([^:.\n]{1,30}):\s+(.+)$/;

/** Good to know text: one paragraph per line, with an optional bold lead label. */
function GoodToKnow({ text }: { text: string }) {
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  return lines.map((line, i) => {
    const match = LEAD_LABEL.exec(line);
    return match ? (
      <p key={i}>
        <strong>{match[1]}:</strong> {match[2]}
      </p>
    ) : (
      <p key={i}>{line}</p>
    );
  });
}

export default function Stay({ loaderData, actionData }: Route.ComponentProps) {
  const { property, similar, today, calendarEnd, turnstileSiteKey } = loaderData;
  // Shared by the calendar and the booking card's date fields.
  const [dates, setDates] = useState<StayDates>(() =>
    actionData && !actionData.ok
      ? { checkIn: actionData.values.checkIn ?? "", checkOut: actionData.values.checkOut ?? "" }
      : { checkIn: "", checkOut: "" },
  );
  const blocked = new Set(loaderData.blocked);
  const sending = useNavigation().state === "submitting";
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!actionData?.ok) return;
    formRef.current?.reset();
    setDates({ checkIn: "", checkOut: "" });
  }, [actionData]);

  return (
    <main>
      <div className="container">
        <div style={{ padding: "25px 0 0", fontSize: 11, color: "var(--muted)" }}>
          <Link viewTransition to="/">Home</Link> / <Link viewTransition to="/stays">Our stays</Link> /{" "}
          {property.name}
        </div>
        <div className="detail-grid">
          <div>
            <Gallery photos={property.photos} name={property.name} />
            <div className="detail-content">
              <div className="detail-section">
                <div className="location">{property.area} · NAIROBI, KENYA</div>
                <h1 className="detail-title">{property.name}</h1>
                <div className="meta" style={{ borderTop: 0, paddingTop: 0 }}>
                  {property.rating !== null && (
                    <span>★ {property.rating.toFixed(1)} guest rating</span>
                  )}
                  <span>{bedroomLabel(property.bedrooms)}</span>
                  <span>{countLabel(property.bathrooms, "bathroom")}</span>
                  <span>Up to {countLabel(property.sleeps, "guest")}</span>
                </div>
                <p>{property.description}</p>
              </div>

              {/* The concept's section titles are h3; this keeps h1 → h2 → h3. */}
              <h2 className="sr-only">About this stay</h2>
              <div className="detail-section">
                <h3>The details that make it feel like home</h3>
                <div className="amenity-grid">
                  {property.amenities.map((amenity) => (
                    <span key={amenity}>{amenity}</span>
                  ))}
                </div>
              </div>

              <div className="detail-section">
                <h3>Good to know</h3>
                <GoodToKnow text={property.goodToKnow || DEFAULT_GOOD_TO_KNOW} />
                <p>
                  Location: {property.address || `${property.area}, Nairobi`}.
                  The exact address and arrival instructions will be provided
                  after confirmation.
                </p>
              </div>

              <div className="detail-section">
                <h3>Availability</h3>
                <p>
                  Stays here are at least {property.minNights} nights. Tap your
                  check-in date, then your check-out date, or choose them in the
                  enquiry panel. Our team will confirm availability before your
                  reservation is finalised.
                </p>
                <AvailabilityCalendar
                  today={today}
                  until={calendarEnd}
                  blocked={blocked}
                  minNights={property.minNights}
                  dates={dates}
                  onChange={setDates}
                />
              </div>

              <div className="detail-section">
                <h3>Frequently asked about this stay</h3>
                <details className="accordion">
                  <summary>How long can I stay?</summary>
                  <p>
                    Stays here start at {property.minNights} nights, and longer
                    stays are welcome. Send your dates and our team will confirm
                    the best available rate.
                  </p>
                </details>
                <details className="accordion">
                  <summary>Is the booking confirmed when I submit a request?</summary>
                  <p>
                    No. A request is not a confirmed reservation. Our team will
                    contact you to verify dates, pricing and next steps.
                  </p>
                </details>
                <details className="accordion">
                  <summary>How do I receive check-in instructions?</summary>
                  <p>
                    We share arrival details and access instructions after your
                    reservation is confirmed.
                  </p>
                </details>
              </div>

              {similar.length > 0 && (
                <div className="detail-section">
                  <h3>Explore similar stays</h3>
                  <div
                    className="property-grid"
                    style={{ gridTemplateColumns: "1fr 1fr" }}
                  >
                    {similar.map((stay) => (
                      <PropertyCard key={stay.slug} property={stay} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <aside>
            <BookingCard
              property={property}
              today={today}
              dates={dates}
              onDatesChange={setDates}
              turnstileSiteKey={turnstileSiteKey}
              formRef={formRef}
              sending={sending}
              result={actionData}
            />
          </aside>
        </div>
      </div>
      <MobileBookBar monthlyPriceKes={property.monthlyPriceKes} />
    </main>
  );
}
