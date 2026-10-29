/**
 * Enum values shared by the database schema and the UI. Lives in app/lib so
 * components can use them without importing server code.
 */

export const guideCategories = [
  "Food",
  "Entertainment",
  "Nightlife",
  "Activities",
  "Shopping",
  "Attractions",
] as const;
export type GuideCategory = (typeof guideCategories)[number];

export const enquiryTypes = [
  "Booking a stay",
  "Property management",
  "General question",
] as const;
export type EnquiryType = (typeof enquiryTypes)[number];

export const bookingStatuses = [
  "new",
  "contacted",
  "confirmed",
  "declined",
] as const;
export type BookingStatus = (typeof bookingStatuses)[number];

/**
 * One "property type + number of units" row. Only enquiries sent with the
 * longer owner form (2026-10, since replaced by the concept's short form)
 * have these; the admin still shows them.
 */
export interface OwnerUnitRow {
  type: string;
  count: number;
}
