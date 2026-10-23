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

/** Property Management Enquiry Form options, in the client's wording. */
export const ownerPropertyTypes = [
  "Studio",
  "1-bedroom apartment",
  "2-bedroom apartment",
  "3-bedroom apartment",
  "4+ bedroom apartment",
  "House or villa",
  "Other",
] as const;

export type OwnerPropertyType = (typeof ownerPropertyTypes)[number];

/** One "property type + number of units" row from a multi-unit owner. */
export interface OwnerUnitRow {
  type: OwnerPropertyType;
  count: number;
}

/** How many of those rows the form offers. */
export const OWNER_UNIT_ROWS_MAX = 10;

export const ownerSameLocationOptions = [
  "Yes, all in one building or development",
  "No, they are in different buildings or locations",
  "Not applicable — I have one unit",
] as const;

export const ownerFurnishingOptions = [
  "Fully furnished",
  "Partially furnished",
  "Unfurnished",
  "A mix of furnished and unfurnished units",
] as const;

export const ownerListedOnlineOptions = [
  "Yes",
  "No",
  "Some units are listed and others are not",
  "Not sure where to start",
] as const;

export const ownerSupportOptions = [
  "Full property management / co-hosting",
  "Listing creation and optimisation",
  "Listing management on Airbnb, Booking.com and Vrbo",
  "Direct bookings through Pretty Fly Living",
  "Pricing and revenue management",
  "Booking management and guest communication",
  "Cleaner sourcing and housekeeping coordination",
  "Linen, laundry and supplies coordination",
  "Property inspections",
  "Maintenance and repairs coordination",
  "Review and reputation management",
  "Other / not sure yet",
] as const;

export const ownerContactMethods = ["WhatsApp", "Phone call", "Email"] as const;
