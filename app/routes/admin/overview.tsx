import { CalendarCheckIcon, HandshakeIcon, MailIcon, type LucideIcon } from "lucide-react";
import { Link } from "react-router";

import { requireAdmin } from "~/.server/auth";
import { getNewInboxCounts, getUpcomingCheckIns } from "~/.server/queries/inbox";
import { dbFromContext, nairobiToday } from "~/.server/request";
import { AdminPageHeader } from "~/components/admin/admin-shell";
import { EditLink, RowActions } from "~/components/admin/row-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { addDays, formatShortDate, nightsBetween } from "~/lib/dates";

import type { Route } from "./+types/overview";

const UPCOMING_DAYS = 30;

export function meta(): Route.MetaDescriptors {
  return [{ title: "Overview  -  Pretty Fly Living admin" }];
}

export async function loader({ context }: Route.LoaderArgs) {
  requireAdmin(context);
  const db = dbFromContext(context);
  const today = nairobiToday();
  const [counts, checkIns] = await Promise.all([
    getNewInboxCounts(db),
    getUpcomingCheckIns(db, today, addDays(today, UPCOMING_DAYS)),
  ]);
  return { counts, checkIns };
}

function CountCard({
  to,
  label,
  count,
  icon: Icon,
}: {
  to: string;
  label: string;
  count: number;
  icon: LucideIcon;
}) {
  return (
    <Link to={to} className="rounded-xl transition-shadow hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none">
      <Card className="h-full">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <Icon className="size-4" />
            {label}
          </CardDescription>
          <CardTitle className="text-4xl">{count}</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground">
          {count === 1 ? "1 new item" : `${count} new items`} →
        </CardContent>
      </Card>
    </Link>
  );
}

export default function AdminOverview({ loaderData }: Route.ComponentProps) {
  const { counts, checkIns } = loaderData;
  return (
    <>
      <AdminPageHeader title="Overview" description="What needs your attention today." />

      <div className="grid gap-4 sm:grid-cols-3">
        <CountCard to="/admin/bookings" label="Booking requests" count={counts.bookings} icon={CalendarCheckIcon} />
        <CountCard to="/admin/messages" label="Messages" count={counts.messages} icon={MailIcon} />
        <CountCard to="/admin/enquiries" label="Owner enquiries" count={counts.enquiries} icon={HandshakeIcon} />
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-xl">Upcoming check-ins</CardTitle>
          <CardDescription>Confirmed bookings arriving in the next {UPCOMING_DAYS} days.</CardDescription>
        </CardHeader>
        <CardContent>
          {checkIns.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">No confirmed check-ins in the next {UPCOMING_DAYS} days.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Guest</TableHead>
                  <TableHead className="hidden md:table-cell">Property</TableHead>
                  <TableHead className="hidden md:table-cell text-right">Nights</TableHead>
                  <TableHead className="text-right">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {checkIns.map((stay) => (
                  <TableRow key={stay.id}>
                    <TableCell>
                      <Link to={`/admin/bookings/${stay.id}`} className="font-medium text-primary hover:underline">
                        {formatShortDate(stay.checkIn)}
                      </Link>
                    </TableCell>
                    <TableCell className="whitespace-normal">
                      {stay.name}
                      <span className="text-muted-foreground"> · {stay.guests} guest{stay.guests === 1 ? "" : "s"}</span>
                      <div className="mt-1 text-xs text-muted-foreground md:hidden">
                        {stay.propertyName} · {nightsBetween(stay.checkIn, stay.checkOut)} nights
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{stay.propertyName}</TableCell>
                    <TableCell className="hidden md:table-cell text-right">{nightsBetween(stay.checkIn, stay.checkOut)}</TableCell>
                    <TableCell>
                      <RowActions>
                        <EditLink to={`/admin/bookings/${stay.id}`} itemName={`booking for ${stay.name}`} label="Manage" />
                      </RowActions>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
