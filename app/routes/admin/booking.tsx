import { CalendarCheckIcon, ExternalLinkIcon, TriangleAlertIcon } from "lucide-react";
import { data, Form, Link, useNavigation } from "react-router";

import { requireAdmin } from "~/.server/auth";
import { formFailure, readAdminForm } from "~/.server/forms";
import { isRangeBlocked } from "~/.server/queries/availability";
import {
  confirmBookingRequest,
  getBookingRequest,
  updateBookingRequest,
} from "~/.server/queries/inbox";
import { dbFromContext, idParam, nairobiToday } from "~/.server/request";
import { AdminPageHeader } from "~/components/admin/admin-shell";
import { FormError, SelectField, TextAreaField, useSuccessToast } from "~/components/admin/form-fields";
import { BookingStatusBadge, bookingStatusLabel, ReplyButton } from "~/components/admin/inbox";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { contactReplyLink, formatReceived } from "~/lib/admin";
import { bookingStatuses } from "~/lib/constants";
import { formatShortDate, nightsBetween } from "~/lib/dates";
import { replyMessages } from "~/lib/site";
import { bookingUpdateSchema } from "~/lib/validation";

import type { Route } from "./+types/booking";

export function meta({ loaderData }: Route.MetaArgs): Route.MetaDescriptors {
  return [{ title: `Request from ${loaderData?.booking.name ?? "guest"}  -  Pretty Fly Living admin` }];
}

export async function loader({ params, context }: Route.LoaderArgs) {
  requireAdmin(context);
  const db = dbFromContext(context);
  const booking = await getBookingRequest(db, idParam(params.id));
  if (!booking) throw new Response("Not found", { status: 404 });
  const datesBlocked = await isRangeBlocked(db, booking.propertyId, booking.checkIn, booking.checkOut);
  return { booking, datesBlocked, today: nairobiToday() };
}

export async function action({ request, params, context }: Route.ActionArgs) {
  requireAdmin(context);
  const db = dbFromContext(context);
  const booking = await getBookingRequest(db, idParam(params.id));
  if (!booking) throw new Response("Not found", { status: 404 });
  const formData = await request.formData();

  if (formData.get("intent") === "confirm") {
    if (booking.status === "confirmed") return data(formFailure("This request is already confirmed.", {}), { status: 400 });
    if (booking.checkOut <= booking.checkIn) return data(formFailure("This request has invalid dates.", {}), { status: 400 });
    if (await isRangeBlocked(db, booking.propertyId, booking.checkIn, booking.checkOut)) {
      return data(
        formFailure("Some of these nights are already blocked. Check the property’s calendar first.", {}),
        { status: 400 },
      );
    }
    await confirmBookingRequest(db, booking);
    return { ok: true as const, message: "Confirmed. The dates are now blocked." };
  }

  const form = readAdminForm(formData, bookingUpdateSchema);
  if (form.kind === "invalid") return data(form.failure, { status: 400 });
  await updateBookingRequest(db, booking.id, form.data);
  return { ok: true as const, message: "Saved" };
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[9rem_1fr]">
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

export default function AdminBooking({ loaderData, actionData }: Route.ComponentProps) {
  const { booking, datesBlocked, today } = loaderData;
  useSuccessToast(actionData);
  const busy = useNavigation().state !== "idle";
  const failure = actionData && !actionData.ok ? actionData : undefined;

  const nights = nightsBetween(booking.checkIn, booking.checkOut);
  const reply = contactReplyLink(
    booking.contact,
    `Your stay at ${booking.propertyName}`,
    replyMessages.booking({
      name: booking.name,
      property: booking.propertyName,
      checkIn: formatShortDate(booking.checkIn),
      checkOut: formatShortDate(booking.checkOut),
    }),
  );
  const warnings = [
    booking.checkIn < today && "The check-in date has passed.",
    booking.guests > booking.sleeps && `More guests than the property sleeps (${booking.sleeps}).`,
    nights < booking.minNights && `Shorter than the ${booking.minNights}-night minimum.`,
    booking.status !== "confirmed" && datesBlocked && "Some of these nights are already blocked.",
  ].filter((w): w is string => typeof w === "string");

  return (
    <>
      <p className="mb-2 text-sm">
        <Link to="/admin/bookings" className="text-muted-foreground hover:text-foreground">
          ← Booking requests
        </Link>
      </p>
      <AdminPageHeader
        title={`Request from ${booking.name}`}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <BookingStatusBadge status={booking.status} />
            Received {formatReceived(booking.createdAt)} · #{booking.id}
          </span>
        }
      >
        {reply && <ReplyButton link={reply} />}
      </AdminPageHeader>

      <div className="mb-6 empty:hidden">
        <FormError failure={failure} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="grid content-start gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">The stay</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-3 text-sm">
                <Row label="Property">
                  <Link to={`/admin/properties/${booking.propertyId}/calendar`} className="text-primary hover:underline">
                    {booking.propertyName}
                  </Link>
                  <span className="text-muted-foreground"> · {booking.propertyArea}</span>
                </Row>
                <Row label="Check-in">{formatShortDate(booking.checkIn)}</Row>
                <Row label="Check-out">{formatShortDate(booking.checkOut)}</Row>
                <Row label="Nights">{nights}</Row>
                <Row label="Guests">{booking.guests}</Row>
              </dl>
              {warnings.length > 0 && (
                <ul className="mt-4 grid gap-1.5 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {warnings.map((warning) => (
                    <li key={warning} className="flex items-center gap-2">
                      <TriangleAlertIcon className="size-4 shrink-0" />
                      {warning}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Guest</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-3 text-sm">
                <Row label="Name">{booking.name}</Row>
                <Row label="Email or phone">
                  {reply ? (
                    <a href={reply.href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {booking.contact}
                    </a>
                  ) : (
                    booking.contact
                  )}
                </Row>
              </dl>
            </CardContent>
          </Card>
        </div>

        <div className="grid content-start gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Confirm</CardTitle>
              <CardDescription>
                {booking.status === "confirmed"
                  ? "Confirmed. The nights are blocked on the property’s calendar."
                  : "After you’ve agreed the stay with the guest, block the nights so nobody else can request them."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {booking.status === "confirmed" ? (
                <Link to={`/admin/properties/${booking.propertyId}/calendar`} className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                  Open the calendar
                  <ExternalLinkIcon className="size-3.5" />
                </Link>
              ) : (
                <Form method="post">
                  <Button type="submit" name="intent" value="confirm" size="lg" disabled={busy || datesBlocked} className="w-full">
                    <CalendarCheckIcon data-icon="inline-start" />
                    Confirm & block dates
                  </Button>
                </Form>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Status and notes</CardTitle>
              <CardDescription>Notes are private and never shown to the guest.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form method="post" className="grid gap-4" key={`${booking.status}-${booking.adminNotes ?? ""}`}>
                <SelectField
                  name="status"
                  label="Status"
                  options={bookingStatuses.map((s) => ({ value: s, label: bookingStatusLabel(s) }))}
                  defaultValue={booking.status}
                  failure={failure}
                />
                <TextAreaField name="adminNotes" label="Notes" rows={4} defaultValue={booking.adminNotes} failure={failure} />
                <Button type="submit" name="intent" value="update" variant="outline" disabled={busy}>
                  Save
                </Button>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
