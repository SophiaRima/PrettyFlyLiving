import { data, Link } from "react-router";

import { requireAdmin } from "~/.server/auth";
import { formFailure } from "~/.server/forms";
import { deleteBookingRequest, getBookingRequests, getBookingStatusCounts } from "~/.server/queries/inbox";
import { dbFromContext } from "~/.server/request";
import { AdminPageHeader } from "~/components/admin/admin-shell";
import { BookingStatusBadge, bookingStatusLabel, DeleteItemButton, FilterTabs } from "~/components/admin/inbox";
import { EditLink, RowActions } from "~/components/admin/row-actions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { formatReceived } from "~/lib/admin";
import { bookingStatuses, type BookingStatus } from "~/lib/constants";
import { formatShortDate, nightsBetween } from "~/lib/dates";

import type { Route } from "./+types/bookings";

export function meta(): Route.MetaDescriptors {
  return [{ title: "Booking requests  -  Pretty Fly Living admin" }];
}

function statusParam(url: string): BookingStatus | undefined {
  const value = new URL(url).searchParams.get("status");
  return bookingStatuses.find((s) => s === value);
}

export async function loader({ request, context }: Route.LoaderArgs) {
  requireAdmin(context);
  const db = dbFromContext(context);
  const status = statusParam(request.url);
  const [requests, counts] = await Promise.all([getBookingRequests(db, status), getBookingStatusCounts(db)]);
  return { requests, counts, status: status ?? "all" };
}

export async function action({ request, context }: Route.ActionArgs) {
  requireAdmin(context);
  const formData = await request.formData();
  const id = Number(formData.get("id"));
  if (formData.get("intent") !== "delete" || !Number.isSafeInteger(id)) {
    return data(formFailure("Unknown action.", {}), { status: 400 });
  }
  await deleteBookingRequest(dbFromContext(context), id);
  return { ok: true as const, message: "Request deleted" };
}

function deleteQuestion(name: string, status: BookingStatus): string {
  return status === "confirmed"
    ? `Delete the request from ${name}? This can’t be undone. Its nights stay blocked: unblock them on the property’s calendar if the stay is off.`
    : `Delete the request from ${name}? This can’t be undone.`;
}

export default function AdminBookings({ loaderData }: Route.ComponentProps) {
  const { requests, counts, status } = loaderData;
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
  return (
    <>
      <AdminPageHeader
        title="Booking requests"
        description="Requests are not reservations. Click Manage to reply, update the status or notes, or Confirm & block dates once agreed."
      />
      <FilterTabs
        active={status}
        options={[
          { value: "all", label: "All", count: total },
          ...bookingStatuses.map((s) => ({ value: s, label: bookingStatusLabel(s), count: counts[s] })),
        ]}
      />

      {requests.length === 0 ? (
        <p className="text-sm text-muted-foreground">No booking requests here yet.</p>
      ) : (
        <div className="rounded-xl bg-card ring-1 ring-foreground/10">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guest</TableHead>
                <TableHead className="hidden md:table-cell">Property</TableHead>
                <TableHead className="hidden md:table-cell">Stay</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="hidden md:table-cell">Received</TableHead>
                <TableHead className="text-right">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((booking) => (
                <TableRow key={booking.id} className={booking.status === "new" ? "font-medium" : undefined}>
                  <TableCell className="whitespace-normal">
                    <Link to={`/admin/bookings/${booking.id}`} className="text-primary hover:underline">
                      {booking.name}
                    </Link>
                    <div className="text-xs font-normal text-muted-foreground wrap-anywhere">
                      {booking.phone ? `${booking.contact} · ${booking.phone}` : booking.contact}
                    </div>
                    <div className="mt-1 grid gap-1 text-xs font-normal text-muted-foreground md:hidden">
                      <span>
                        {booking.propertyName} · {formatShortDate(booking.checkIn)} → {formatShortDate(booking.checkOut)}
                      </span>
                      <span>
                        <BookingStatusBadge status={booking.status} />
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{booking.propertyName}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {formatShortDate(booking.checkIn)} → {formatShortDate(booking.checkOut)}
                    <div className="text-xs font-normal text-muted-foreground">
                      {nightsBetween(booking.checkIn, booking.checkOut)} nights · {booking.guests} guest
                      {booking.guests === 1 ? "" : "s"}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <BookingStatusBadge status={booking.status} />
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-xs font-normal text-muted-foreground">{formatReceived(booking.createdAt)}</TableCell>
                  <TableCell>
                    <RowActions>
                      <EditLink to={`/admin/bookings/${booking.id}`} itemName={`request from ${booking.name}`} label="Manage" />
                      <DeleteItemButton
                        id={booking.id}
                        size="sm"
                        itemName={`request from ${booking.name}`}
                        confirmMessage={deleteQuestion(booking.name, booking.status)}
                      />
                    </RowActions>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
