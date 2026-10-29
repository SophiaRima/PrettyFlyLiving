import { and, asc, count, desc, eq, gte, lt } from "drizzle-orm";

import type { BookingStatus } from "~/lib/constants";
import type {
  BookingRequestInput,
  BookingUpdateInput,
  ContactMessageInput,
  OwnerEnquiryInput,
} from "~/lib/validation";

import type { Database } from "../db/client";
import {
  availabilityBlocks,
  bookingRequests,
  contactMessages,
  ownerEnquiries,
  properties,
  type ContactMessage,
  type OwnerEnquiry,
} from "../db/schema";

/** Saves a Request to Book. It never blocks dates by itself (AGENTS.md section 6). */
export async function createBookingRequest(
  db: Database,
  propertyId: number,
  input: BookingRequestInput,
): Promise<number> {
  const [row] = await db
    .insert(bookingRequests)
    .values({
      propertyId,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      guests: input.guests,
      name: input.name,
      contact: input.email,
      phone: input.phone,
    })
    .returning({ id: bookingRequests.id });
  return row.id;
}

export async function createContactMessage(
  db: Database,
  input: ContactMessageInput,
): Promise<number> {
  const [row] = await db
    .insert(contactMessages)
    .values({
      enquiryType: input.type,
      name: input.name,
      email: input.email,
      phone: input.phone ?? null,
      message: input.message,
    })
    .returning({ id: contactMessages.id });
  return row.id;
}

export async function createOwnerEnquiry(
  db: Database,
  input: OwnerEnquiryInput,
): Promise<number> {
  const [row] = await db
    .insert(ownerEnquiries)
    .values({
      name: input.name,
      email: input.email,
      phone: input.phone,
      propertyArea: input.location,
      propertyType: input.type,
      units: String(input.units),
      message: input.message ?? null,
    })
    .returning({ id: ownerEnquiries.id });
  return row.id;
}

// ------------------------------------------------------------------ admin

export interface InboxCounts {
  bookings: number;
  messages: number;
  enquiries: number;
}

/** Items still marked "new" in each inbox. */
export async function getNewInboxCounts(db: Database): Promise<InboxCounts> {
  const [bookings, messages, enquiries] = await db.batch([
    db.select({ n: count() }).from(bookingRequests).where(eq(bookingRequests.status, "new")),
    db.select({ n: count() }).from(contactMessages).where(eq(contactMessages.status, "new")),
    db.select({ n: count() }).from(ownerEnquiries).where(eq(ownerEnquiries.status, "new")),
  ]);
  return {
    bookings: bookings[0]?.n ?? 0,
    messages: messages[0]?.n ?? 0,
    enquiries: enquiries[0]?.n ?? 0,
  };
}

export interface UpcomingCheckIn {
  id: number;
  propertyName: string;
  name: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}

/** Confirmed booking requests checking in during [from, to). */
export async function getUpcomingCheckIns(
  db: Database,
  from: string,
  to: string,
): Promise<UpcomingCheckIn[]> {
  return db
    .select({
      id: bookingRequests.id,
      propertyName: properties.name,
      name: bookingRequests.name,
      checkIn: bookingRequests.checkIn,
      checkOut: bookingRequests.checkOut,
      guests: bookingRequests.guests,
    })
    .from(bookingRequests)
    .innerJoin(properties, eq(properties.id, bookingRequests.propertyId))
    .where(
      and(
        eq(bookingRequests.status, "confirmed"),
        gte(bookingRequests.checkIn, from),
        lt(bookingRequests.checkIn, to),
      ),
    )
    .orderBy(asc(bookingRequests.checkIn));
}

/** Newest items shown per inbox list. */
const INBOX_LIMIT = 200;

export interface BookingRequestRow {
  id: number;
  propertyId: number;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  name: string;
  /** The guest's email (older requests: email or phone, as typed). */
  contact: string;
  /** Phone / WhatsApp; null on requests sent before 2026-10-29. */
  phone: string | null;
  status: BookingStatus;
  createdAt: string;
}

const bookingColumns = {
  id: bookingRequests.id,
  propertyId: bookingRequests.propertyId,
  propertyName: properties.name,
  checkIn: bookingRequests.checkIn,
  checkOut: bookingRequests.checkOut,
  guests: bookingRequests.guests,
  name: bookingRequests.name,
  contact: bookingRequests.contact,
  phone: bookingRequests.phone,
  status: bookingRequests.status,
  createdAt: bookingRequests.createdAt,
};

/** Booking requests, newest first, optionally with one status. */
export async function getBookingRequests(
  db: Database,
  status?: BookingStatus,
): Promise<BookingRequestRow[]> {
  return db
    .select(bookingColumns)
    .from(bookingRequests)
    .innerJoin(properties, eq(properties.id, bookingRequests.propertyId))
    .where(status ? eq(bookingRequests.status, status) : undefined)
    .orderBy(desc(bookingRequests.createdAt), desc(bookingRequests.id))
    .limit(INBOX_LIMIT);
}

/** How many booking requests have each status. */
export async function getBookingStatusCounts(db: Database): Promise<Record<BookingStatus, number>> {
  const rows = await db
    .select({ status: bookingRequests.status, n: count() })
    .from(bookingRequests)
    .groupBy(bookingRequests.status);
  const counts: Record<BookingStatus, number> = { new: 0, contacted: 0, confirmed: 0, declined: 0 };
  for (const row of rows) counts[row.status] = row.n;
  return counts;
}

export interface BookingRequestDetail extends BookingRequestRow {
  propertySlug: string;
  propertyArea: string;
  sleeps: number;
  minNights: number;
  adminNotes: string | null;
}

export async function getBookingRequest(db: Database, id: number): Promise<BookingRequestDetail | null> {
  const [row] = await db
    .select({
      ...bookingColumns,
      propertySlug: properties.slug,
      propertyArea: properties.area,
      sleeps: properties.sleeps,
      minNights: properties.minNights,
      adminNotes: bookingRequests.adminNotes,
    })
    .from(bookingRequests)
    .innerJoin(properties, eq(properties.id, bookingRequests.propertyId))
    .where(eq(bookingRequests.id, id))
    .limit(1);
  return row ?? null;
}

export async function updateBookingRequest(
  db: Database,
  id: number,
  input: BookingUpdateInput,
): Promise<void> {
  await db
    .update(bookingRequests)
    .set({ status: input.status, adminNotes: input.adminNotes })
    .where(eq(bookingRequests.id, id));
}

/**
 * "Confirm & block dates": marks the request confirmed and blocks its nights
 * in one batch. Callers check the dates are still free first.
 */
export async function confirmBookingRequest(db: Database, request: BookingRequestDetail): Promise<void> {
  await db.batch([
    db.insert(availabilityBlocks).values({
      propertyId: request.propertyId,
      startDate: request.checkIn,
      endDate: request.checkOut,
      source: "booking",
      note: `Booking request #${request.id} · ${request.name}`,
    }),
    db.update(bookingRequests).set({ status: "confirmed" }).where(eq(bookingRequests.id, request.id)),
  ]);
}

/**
 * Deletes a booking request. A confirmed request's calendar block stays:
 * the dates are only freed from the property's calendar.
 */
export async function deleteBookingRequest(db: Database, id: number): Promise<void> {
  await db.delete(bookingRequests).where(eq(bookingRequests.id, id));
}

export type HandledStatus = "new" | "handled";

/** A "new"/"handled" value from a query string or form, or undefined. */
export function parseHandledStatus(value: FormDataEntryValue | null): HandledStatus | undefined {
  return value === "new" || value === "handled" ? value : undefined;
}

export async function getContactMessages(db: Database, status?: HandledStatus): Promise<ContactMessage[]> {
  return db
    .select()
    .from(contactMessages)
    .where(status ? eq(contactMessages.status, status) : undefined)
    .orderBy(desc(contactMessages.createdAt), desc(contactMessages.id))
    .limit(INBOX_LIMIT);
}

export async function setContactMessageStatus(db: Database, id: number, status: HandledStatus): Promise<void> {
  await db.update(contactMessages).set({ status }).where(eq(contactMessages.id, id));
}

export async function deleteContactMessage(db: Database, id: number): Promise<void> {
  await db.delete(contactMessages).where(eq(contactMessages.id, id));
}

export async function getOwnerEnquiries(db: Database, status?: HandledStatus): Promise<OwnerEnquiry[]> {
  return db
    .select()
    .from(ownerEnquiries)
    .where(status ? eq(ownerEnquiries.status, status) : undefined)
    .orderBy(desc(ownerEnquiries.createdAt), desc(ownerEnquiries.id))
    .limit(INBOX_LIMIT);
}

export async function setOwnerEnquiryStatus(db: Database, id: number, status: HandledStatus): Promise<void> {
  await db.update(ownerEnquiries).set({ status }).where(eq(ownerEnquiries.id, id));
}

export async function deleteOwnerEnquiry(db: Database, id: number): Promise<void> {
  await db.delete(ownerEnquiries).where(eq(ownerEnquiries.id, id));
}
