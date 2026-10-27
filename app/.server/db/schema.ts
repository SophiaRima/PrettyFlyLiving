import { sql } from "drizzle-orm";
import {
  index,
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

// Relative import: drizzle-kit loads this file outside Vite's alias setup.
import {
  bookingStatuses,
  enquiryTypes,
  guideCategories,
  type OwnerUnitRow,
} from "../../lib/constants";

/*
 * Conventions
 * - Dates are YYYY-MM-DD strings in Nairobi local time.
 * - Date ranges are half-open: [start_date, end_date).
 * - Timestamps are SQLite CURRENT_TIMESTAMP strings (UTC).
 * - Prices are whole KES integers.
 */

const id = () => integer("id").primaryKey({ autoIncrement: true });
const createdAt = () =>
  text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`);
const updatedAt = () =>
  text("updated_at").notNull().default(sql`(CURRENT_TIMESTAMP)`);
const sortOrder = () => integer("sort_order").notNull().default(0);
const isPublished = () =>
  integer("is_published", { mode: "boolean" }).notNull().default(true);
const isFeatured = () =>
  integer("is_featured", { mode: "boolean" }).notNull().default(false);

// ---------------------------------------------------------------- properties

export const properties = sqliteTable(
  "properties",
  {
    id: id(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    area: text("area").notNull(),
    address: text("address").notNull().default(""),
    mapUrl: text("map_url"),
    propertyType: text("property_type").notNull().default("Apartment"),
    tag: text("tag"),
    rating: real("rating"),
    description: text("description").notNull().default(""),
    goodToKnow: text("good_to_know"),
    bedrooms: integer("bedrooms").notNull(),
    bathrooms: integer("bathrooms").notNull(),
    sleeps: integer("sleeps").notNull(),
    monthlyPriceKes: integer("monthly_price_kes").notNull(),
    minNights: integer("min_nights").notNull().default(30),
    amenities: text("amenities", { mode: "json" })
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'`),
    isFeatured: isFeatured(),
    isPublished: isPublished(),
    sortOrder: sortOrder(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("properties_slug_idx").on(t.slug),
    index("properties_area_idx").on(t.area),
  ],
);

export const propertyPhotos = sqliteTable(
  "property_photos",
  {
    id: id(),
    propertyId: integer("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    r2Key: text("r2_key").notNull(),
    alt: text("alt").notNull().default(""),
    /** Pixel size, read from the upload; null for photos added before it was stored. */
    width: integer("width"),
    height: integer("height"),
    sortOrder: sortOrder(),
  },
  (t) => [index("property_photos_property_idx").on(t.propertyId, t.sortOrder)],
);

export const availabilityBlocks = sqliteTable(
  "availability_blocks",
  {
    id: id(),
    propertyId: integer("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    startDate: text("start_date").notNull(),
    /** Exclusive: the first night that is free again. */
    endDate: text("end_date").notNull(),
    source: text("source", { enum: ["admin", "booking", "ical"] })
      .notNull()
      .default("admin"),
    /** iCal UID for future calendar sync; null for blocks made in the dashboard. */
    externalUid: text("external_uid"),
    note: text("note"),
    createdAt: createdAt(),
  },
  (t) => [
    index("availability_blocks_property_start_idx").on(
      t.propertyId,
      t.startDate,
    ),
  ],
);

// ------------------------------------------------------------------- inboxes

export const bookingRequests = sqliteTable(
  "booking_requests",
  {
    id: id(),
    propertyId: integer("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    checkIn: text("check_in").notNull(),
    checkOut: text("check_out").notNull(),
    guests: integer("guests").notNull(),
    name: text("name").notNull(),
    /** Email or phone, exactly as the guest typed it. */
    contact: text("contact").notNull(),
    status: text("status", { enum: bookingStatuses }).notNull().default("new"),
    adminNotes: text("admin_notes"),
    createdAt: createdAt(),
  },
  (t) => [index("booking_requests_status_idx").on(t.status, t.createdAt)],
);

export const contactMessages = sqliteTable(
  "contact_messages",
  {
    id: id(),
    enquiryType: text("enquiry_type", { enum: enquiryTypes }).notNull(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    message: text("message").notNull(),
    status: text("status", { enum: ["new", "handled"] })
      .notNull()
      .default("new"),
    createdAt: createdAt(),
  },
  (t) => [index("contact_messages_status_idx").on(t.status, t.createdAt)],
);

export const ownerEnquiries = sqliteTable(
  "owner_enquiries",
  {
    id: id(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    propertyArea: text("property_area").notNull(),
    /** The single unit's type, or a summary such as "2 × Studio, 1 × 1-bedroom apartment". */
    propertyType: text("property_type").notNull(),
    units: text("units").notNull(),
    /** JSON [{ type, count }] for owners with several units; null for one unit. */
    unitBreakdown: text("unit_breakdown", { mode: "json" }).$type<OwnerUnitRow[]>(),
    sameLocation: text("same_location"),
    furnishing: text("furnishing"),
    listedOnline: text("listed_online"),
    listingLinks: text("listing_links"),
    /** JSON list of the support options the owner ticked. */
    supportNeeded: text("support_needed", { mode: "json" }).$type<string[]>(),
    preferredContact: text("preferred_contact"),
    message: text("message"),
    status: text("status", { enum: ["new", "handled"] })
      .notNull()
      .default("new"),
    createdAt: createdAt(),
  },
  (t) => [index("owner_enquiries_status_idx").on(t.status, t.createdAt)],
);

// ------------------------------------------------------------------- content

export const faqs = sqliteTable("faqs", {
  id: id(),
  audience: text("audience", { enum: ["guest", "owner"] }).notNull(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  sortOrder: sortOrder(),
  isPublished: isPublished(),
});

export const reviews = sqliteTable("reviews", {
  id: id(),
  guestName: text("guest_name").notNull(),
  /** Small line under the name, e.g. "Recent Nairobi stay". */
  context: text("context"),
  body: text("body").notNull(),
  rating: integer("rating").notNull().default(5),
  propertyId: integer("property_id").references(() => properties.id, {
    onDelete: "set null",
  }),
  isFeatured: isFeatured(),
  sortOrder: sortOrder(),
  isPublished: isPublished(),
});

export const guides = sqliteTable(
  "guides",
  {
    id: id(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    category: text("category", { enum: guideCategories }).notNull(),
    excerpt: text("excerpt").notNull(),
    coverR2Key: text("cover_r2_key"),
    coverWidth: integer("cover_width"),
    coverHeight: integer("cover_height"),
    /** Short tag chips on the Things to Do card, e.g. "Brunch & coffee". */
    highlights: text("highlights", { mode: "json" })
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'`),
    bodyMd: text("body_md").notNull().default(""),
    isFeatured: isFeatured(),
    sortOrder: sortOrder(),
    isPublished: isPublished(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("guides_slug_idx").on(t.slug)],
);

/** Gallery photos for a guide (client revision: each guide has several). */
export const guidePhotos = sqliteTable(
  "guide_photos",
  {
    id: id(),
    guideId: integer("guide_id")
      .notNull()
      .references(() => guides.id, { onDelete: "cascade" }),
    r2Key: text("r2_key").notNull(),
    alt: text("alt").notNull().default(""),
    width: integer("width"),
    height: integer("height"),
    sortOrder: sortOrder(),
  },
  (t) => [index("guide_photos_guide_idx").on(t.guideId, t.sortOrder)],
);

export const extraServices = sqliteTable("extra_services", {
  id: id(),
  /** Small label above the title, e.g. "See the city differently". */
  eyebrow: text("eyebrow"),
  title: text("title").notNull(),
  description: text("description").notNull(),
  /** Short line under the description, e.g. "Available on request · Additional charges apply". */
  details: text("details"),
  /** Button text; the button opens WhatsApp with a message about this service. */
  ctaLabel: text("cta_label"),
  imageR2Key: text("image_r2_key"),
  imageWidth: integer("image_width"),
  imageHeight: integer("image_height"),
  sortOrder: sortOrder(),
  isPublished: isPublished(),
});

// --------------------------------------------------------------------- admin

export const adminUsers = sqliteTable(
  "admin_users",
  {
    id: id(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("admin_users_email_idx").on(t.email)],
);

export const sessions = sqliteTable(
  "sessions",
  {
    /** SHA-256 hex of the session token; the raw token only lives in the cookie. */
    id: text("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => adminUsers.id, { onDelete: "cascade" }),
    expiresAt: text("expires_at").notNull(),
    /** When this session logged in (ISO). Null for sessions from before it was recorded. */
    signedInAt: text("signed_in_at"),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

export const loginAttempts = sqliteTable(
  "login_attempts",
  {
    id: id(),
    ip: text("ip").notNull(),
    attemptedAt: text("attempted_at")
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
  },
  (t) => [index("login_attempts_ip_idx").on(t.ip, t.attemptedAt)],
);

/**
 * One row (id 1) counting dashboard saves. The public page cache files pages
 * under this number, so a save makes every cached page stale at once
 * (workers/page-cache.ts). No row yet means version 0.
 */
export const contentVersion = sqliteTable("content_version", {
  id: integer("id").primaryKey(),
  version: integer("version").notNull().default(0),
});

// --------------------------------------------------------------------- types

export type Property = typeof properties.$inferSelect;
export type PropertyPhoto = typeof propertyPhotos.$inferSelect;
export type AvailabilityBlock = typeof availabilityBlocks.$inferSelect;
export type BookingRequest = typeof bookingRequests.$inferSelect;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type OwnerEnquiry = typeof ownerEnquiries.$inferSelect;
export type Faq = typeof faqs.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Guide = typeof guides.$inferSelect;
export type GuidePhoto = typeof guidePhotos.$inferSelect;
export type ExtraService = typeof extraServices.$inferSelect;
