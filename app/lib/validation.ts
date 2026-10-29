import { z } from "zod";

import { bookingStatuses, enquiryTypes, guideCategories } from "./constants";
import { parseLines, slugify } from "./admin";
import { isIsoDate } from "./dates";

/** Blank strings from GET forms mean "no filter". */
const optionalText = z
  .string()
  .trim()
  .max(100)
  .optional()
  .transform((v) => (v ? v : undefined));

const optionalPositiveInt = z
  .string()
  .optional()
  .transform((v) => {
    const n = Number(v);
    return v && Number.isInteger(n) && n > 0 ? n : undefined;
  });

export const staySorts = ["featured", "price-low", "price-high"] as const;
export type StaySort = (typeof staySorts)[number];

const optionalIsoDate = z
  .string()
  .optional()
  .transform((v) => (v && isIsoDate(v) ? v : undefined));

/**
 * /stays query string. Invalid values fall back to "no filter". Dates only
 * filter as a pair, with check-out after check-in.
 */
export const stayFiltersSchema = z
  .object({
    q: optionalText,
    area: optionalText,
    in: optionalIsoDate,
    out: optionalIsoDate,
    guests: optionalPositiveInt,
    beds: optionalPositiveInt,
    max: optionalPositiveInt,
    sort: z
      .string()
      .optional()
      .transform((v): StaySort =>
        staySorts.includes(v as StaySort) ? (v as StaySort) : "featured",
      ),
  })
  .transform((filters) =>
    filters.in && filters.out && filters.out > filters.in
      ? filters
      : { ...filters, in: undefined, out: undefined },
  );
export type StayFilters = z.infer<typeof stayFiltersSchema>;

/** /things-to-do query string. */
export const guideFiltersSchema = z.object({
  q: optionalText,
  category: z
    .string()
    .optional()
    .transform((v) =>
      guideCategories.includes(v as (typeof guideCategories)[number])
        ? (v as (typeof guideCategories)[number])
        : undefined,
    ),
});
export type GuideFilters = z.infer<typeof guideFiltersSchema>;

// ---------------------------------------------------------------- forms
// Field names match the form inputs, so errors map straight back to them.

const requiredText = (label: string, max: number) =>
  z
    .string({ error: `Please enter ${label}.` })
    .trim()
    .min(1, `Please enter ${label}.`)
    .max(max, `Please keep ${label} under ${max} characters.`);

/** Whole number typed into a form field; blank is an error, not 0. */
const wholeNumber = (label: string, min: number, max: number) =>
  z
    .string({ error: `Please enter ${label}.` })
    .trim()
    .min(1, `Please enter ${label}.`)
    .pipe(
      z.coerce
        .number<string>({ error: `Please enter ${label} as a number.` })
        .int("Please enter a whole number.")
        .min(min, `Please enter at least ${min}.`)
        .max(max, `Please enter ${max} or less.`),
    );

const emailField = z
  .string({ error: "Please enter your email." })
  .trim()
  .min(1, "Please enter your email.")
  .max(200)
  .pipe(z.email("Please enter a valid email address."));

const PHONE = /^\+?[\d\s()-]+$/;

/** True for 9–15 digits with optional +, spaces, brackets or dashes. */
export function isPhoneNumber(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return PHONE.test(value) && digits.length >= 9 && digits.length <= 15;
}

const phoneField = z
  .string()
  .trim()
  .max(30)
  .refine((v) => isPhoneNumber(v), "Please enter a valid phone number.");

const optionalPhoneField = z
  .string()
  .trim()
  .max(30)
  .optional()
  .transform((v) => (v ? v : undefined))
  .refine((v) => v === undefined || isPhoneNumber(v), "Please enter a valid phone number.");

const isoDateField = (label: string) =>
  z
    .string({ error: `Please choose a ${label} date.` })
    .refine((v) => isIsoDate(v), `Please choose a ${label} date.`);

/** Request to Book (stay page). Range and availability are checked on the server. */
export const bookingRequestSchema = z.object({
  checkIn: isoDateField("check-in"),
  checkOut: isoDateField("check-out"),
  guests: z.coerce
    .number({ error: "Please choose the number of guests." })
    .int()
    .min(1, "Please choose the number of guests.")
    .max(50),
  name: requiredText("your name", 100),
  email: emailField,
  phone: phoneField,
});
export type BookingRequestInput = z.infer<typeof bookingRequestSchema>;

/** Contact page form. */
export const contactMessageSchema = z.object({
  type: z.enum(enquiryTypes, { error: "Please choose an enquiry type." }),
  name: requiredText("your name", 100),
  email: emailField,
  phone: optionalPhoneField,
  message: requiredText("a message", 3000),
});
export type ContactMessageInput = z.infer<typeof contactMessageSchema>;

/**
 * Property Management owner enquiry: the concept's short form (client,
 * 2026-10-29). Property type(s) and units are typed in, not chosen.
 */
export const ownerEnquirySchema = z.object({
  name: requiredText("your name", 100),
  email: emailField,
  phone: phoneField,
  location: requiredText("your property's location", 120),
  type: requiredText("your property type(s)", 200),
  units: wholeNumber("the number of units", 1, 500),
  message: z
    .string()
    .trim()
    .max(3000, "Please keep this under 3000 characters.")
    .optional()
    .transform((v) => (v ? v : undefined)),
});
export type OwnerEnquiryInput = z.infer<typeof ownerEnquirySchema>;

// ---------------------------------------------------------------- admin

/** Admin login. The password isn't trimmed: spaces may be part of it. */
export const adminLoginSchema = z.object({
  email: emailField.transform((v) => v.toLowerCase()),
  password: z
    .string({ error: "Please enter your password." })
    .min(1, "Please enter your password.")
    .max(200),
});
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

/** Same minimum as scripts/create-admin.ts. */
export const ADMIN_PASSWORD_MIN_LENGTH = 12;

/** Settings: change the login email (allowed only soon after signing in). */
export const adminEmailChangeSchema = z.object({
  email: emailField.transform((v) => v.toLowerCase()),
});
export type AdminEmailChangeInput = z.infer<typeof adminEmailChangeSchema>;

/** Settings: change the password. Passwords aren't trimmed. */
export const adminPasswordChangeSchema = z
  .object({
    newPassword: z
      .string({ error: "Please enter a new password." })
      .min(ADMIN_PASSWORD_MIN_LENGTH, `Please use at least ${ADMIN_PASSWORD_MIN_LENGTH} characters.`)
      .max(200, "Please keep it under 200 characters."),
    confirmPassword: z.string({ error: "Please repeat the new password." }),
  })
  .refine((v) => v.confirmPassword === v.newPassword, {
    path: ["confirmPassword"],
    message: "The new passwords don’t match.",
  });
export type AdminPasswordChangeInput = z.infer<typeof adminPasswordChangeSchema>;

/** Optional admin text: blank becomes null, so the site falls back to its default. */
const nullableText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Please keep this under ${max} characters.`)
    .optional()
    .transform((v) => (v ? v : null));

/** A checked checkbox posts "on"; an unchecked one posts nothing. */
const checkbox = z
  .string()
  .optional()
  .transform((v) => v === "on");

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Blank means "make one from the name/title". */
const optionalSlug = z
  .string()
  .trim()
  .toLowerCase()
  .max(80, "Please keep the URL name under 80 characters.")
  .optional()
  .refine((v) => !v || SLUG.test(v), "Use lowercase letters, numbers and dashes only.");

const httpsUrl = z
  .string()
  .trim()
  .max(500)
  .optional()
  .transform((v) => (v ? v : null))
  .refine((v) => v === null || /^https:\/\/\S+$/.test(v), "Please paste a full link starting with https://");

/** One item per line, e.g. amenities or guide highlights. */
const lineList = (label: string, maxItems: number, maxLength: number) =>
  z
    .string()
    .optional()
    .transform((v) => parseLines(v ?? ""))
    .refine((items) => items.length <= maxItems, `Please list at most ${maxItems} ${label}.`)
    .refine(
      (items) => items.every((item) => item.length <= maxLength),
      `Please keep each of the ${label} under ${maxLength} characters.`,
    );

/** Property details form (new property and the Details tab). */
export const propertySchema = z
  .object({
    name: requiredText("the property name", 100),
    slug: optionalSlug,
    area: requiredText("the area", 60),
    address: z.string().trim().max(200, "Please keep the address under 200 characters.").default(""),
    mapUrl: httpsUrl,
    propertyType: requiredText("the property type", 40),
    tag: nullableText(30),
    rating: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v ? Number(v) : null))
      .refine(
        (v) => v === null || (Number.isFinite(v) && v >= 1 && v <= 5),
        "Please enter a rating between 1 and 5, or leave it blank.",
      )
      .transform((v) => (v === null ? null : Math.round(v * 10) / 10)),
    description: requiredText("a description", 3000),
    goodToKnow: nullableText(4000),
    bedrooms: wholeNumber("the number of bedrooms", 0, 20),
    bathrooms: wholeNumber("the number of bathrooms", 0, 20),
    sleeps: wholeNumber("how many guests it sleeps", 1, 50),
    monthlyPriceKes: wholeNumber("the monthly price", 1, 100_000_000),
    minNights: wholeNumber("the minimum stay", 1, 365),
    amenities: lineList("amenities", 40, 60),
    isFeatured: checkbox,
    isPublished: checkbox,
    sortOrder: wholeNumber("the sort order", 0, 9999),
  })
  .transform((p) => ({ ...p, slug: p.slug || slugify(p.name) }))
  .refine((p) => p.slug !== "", { message: "Please enter a URL name.", path: ["slug"] });
export type PropertyInput = z.infer<typeof propertySchema>;

/** Block or unblock dates on the Calendar tab. `last` is the last night, inclusive. */
export const calendarRangeSchema = z
  .object({
    first: isoDateField("first night"),
    last: isoDateField("last night"),
    note: nullableText(200),
  })
  .refine((r) => r.last >= r.first, {
    message: "The last night must be on or after the first night.",
    path: ["last"],
  });
export type CalendarRangeInput = z.infer<typeof calendarRangeSchema>;

/** Status and private notes on a booking request. */
export const bookingUpdateSchema = z.object({
  status: z.enum(bookingStatuses, { error: "Please choose a status." }),
  adminNotes: nullableText(3000),
});
export type BookingUpdateInput = z.infer<typeof bookingUpdateSchema>;

export const faqSchema = z.object({
  audience: z.enum(["guest", "owner"], { error: "Please choose who the question is for." }),
  question: requiredText("the question", 300),
  answer: requiredText("the answer", 3000),
  isPublished: checkbox,
});
export type FaqInput = z.infer<typeof faqSchema>;

export const reviewSchema = z.object({
  guestName: requiredText("the guest’s name", 80),
  context: nullableText(80),
  body: requiredText("the review", 1500),
  rating: wholeNumber("a rating", 1, 5),
  propertyId: z
    .string()
    .optional()
    .transform((v) => {
      const id = Number(v);
      return v && Number.isSafeInteger(id) && id > 0 ? id : null;
    }),
  isFeatured: checkbox,
  isPublished: checkbox,
});
export type ReviewInput = z.infer<typeof reviewSchema>;

export const extraServiceSchema = z.object({
  eyebrow: nullableText(60),
  title: requiredText("a title", 80),
  description: requiredText("a description", 600),
  details: nullableText(120),
  ctaLabel: nullableText(60),
  isPublished: checkbox,
});
export type ExtraServiceInput = z.infer<typeof extraServiceSchema>;

/** Nairobi guide (Things to Do). The body is Markdown. */
export const guideSchema = z
  .object({
    title: requiredText("a title", 120),
    slug: optionalSlug,
    category: z.enum(guideCategories, { error: "Please choose a category." }),
    excerpt: requiredText("a short summary", 400),
    highlights: lineList("highlights", 8, 40),
    bodyMd: z.string().max(20_000, "Please keep the guide under 20,000 characters.").default(""),
    isFeatured: checkbox,
    isPublished: checkbox,
    sortOrder: wholeNumber("the sort order", 0, 9999),
  })
  .transform((g) => ({ ...g, slug: g.slug || slugify(g.title) }))
  .refine((g) => g.slug !== "", { message: "Please enter a URL name.", path: ["slug"] });
export type GuideInput = z.infer<typeof guideSchema>;

export function parseSearchParams<T extends z.ZodType>(
  schema: T,
  url: string,
): z.infer<T> {
  const params = Object.fromEntries(new URL(url).searchParams);
  return schema.parse(params);
}
