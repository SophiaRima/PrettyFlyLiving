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

/** Owner enquiry form options, as in the concept. */
export const ownerPropertyTypes = [
  "Apartment",
  "House / villa",
  "Studio",
  "Other",
] as const;
export const ownerUnitCounts = ["1", "2–5", "6–10", "11+"] as const;
