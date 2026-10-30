import type { GuideCategory } from "./constants";

/** Site-wide constants (AGENTS.md section 5.4). */
export const site = {
  name: "Pretty Fly Living",
  /** Production origin for canonical, Open Graph and sitemap URLs, on every host. */
  url: "https://prettyflyliving.com",
  tagline: "Serviced apartments · Nairobi",
  /** Sophiah's domain mailbox (Truehost). */
  email: "contact@prettyflyliving.com",
  /** International format, digits only, for wa.me links (+254 708 854755). */
  whatsappNumber: "254708854755",
  /** Display format; tel: links strip the spaces. Same number as WhatsApp (0708 854755). */
  phone: "+254 708 854 755",
  location: "Nairobi, Kenya",
} as const;

export const navItems = [
  { to: "/", label: "Home" },
  { to: "/stays", label: "Our stays" },
  { to: "/why-us", label: "Why us" },
  { to: "/things-to-do", label: "Things to do" },
  { to: "/management", label: "Property management" },
  { to: "/faqs", label: "FAQs" },
  { to: "/contact", label: "Contact" },
] as const;

/**
 * Marketing photos used outside property listings (in public/images).
 * PLACEHOLDERS from the concept: swap the files for Sophiah's own photos.
 */
export const pageImages = {
  hero: {
    src: "/images/hero-living-1280.webp",
    /**
     * The photo is 1920px wide, so 1920 is the largest copy (never upscaled
     * at export). sizes is the width the photo is drawn at, not the box:
     * - 981px+: the short full-bleed box is wider than the photo's shape, so
     *   the photo fills the screen width.
     * - ≤980px: the photo sits above the copy in a 16:10 (tablet) or 4:3
     *   (phone) box, drawn up to 1.33 × the container width.
     */
    srcSet:
      "/images/hero-living-640.webp 640w, /images/hero-living-960.webp 960w, /images/hero-living-1280.webp 1280w, /images/hero-living-1600.webp 1600w, /images/hero-living-1920.webp 1920w",
    sizes: "(min-width: 981px) 100vw, calc((100vw - 44px) * 1.33)",
    width: 1920,
    height: 1088,
    alt: "Sunlit living room with a sofa, wooden coffee table and floor-to-ceiling windows looking out over Nairobi’s trees and skyline",
  },
  homeSplit: {
    src: "/images/home-split.webp",
    width: 1086,
    height: 1448,
    alt: "Small double bed by the window with fresh towels",
  },
  /** On phones the split photo is the page's largest image, so it has an 800px copy. */
  whySplit: {
    src: "/images/why-split.webp",
    srcSet: "/images/why-split-800.webp 800w, /images/why-split.webp 1200w",
    sizes: "(max-width: 720px) 100vw, 540px",
    width: 1200,
    height: 1200,
    alt: "City view over Kilimani from a Pretty Fly Living window",
  },
  managementSplit: {
    src: "/images/management-split.webp",
    srcSet: "/images/management-split-800.webp 800w, /images/management-split.webp 1200w",
    /** A wide panorama in a 520px-tall box: the box's height decides, so desktops need the 1200px file. */
    sizes: "(max-width: 720px) 100vw, 1200px",
    width: 1200,
    height: 554,
    alt: "Courtyard garden with seating in a Pretty Fly Living building",
  },
} as const;

/** How many published reviews Why Us shows (featured first, then by sort order). */
export const whyUsReviewCount = 6;

/**
 * The client rents for 30+ nights (2026-10-29), the default `min_nights`.
 * The home search and the /stays date filter start check-out this many
 * nights after check-in; each stay page uses its own `min_nights`.
 */
export const minStayNights = 30;

/** "Max monthly price" options on /stays: the client's KES 60,000–250,000 range. */
export const priceBrackets = [60000, 100000, 150000, 200000, 250000] as const;

/**
 * "Browse by" shortcuts on /things-to-do. Each one sets either a search term
 * (matched against titles, excerpts and highlights) or a guide category.
 */
export const guideTopics: readonly { label: string; q?: string; category?: GuideCategory }[] = [
  { label: "Live music", q: "live music" },
  { label: "Markets", q: "market" },
  { label: "Wildlife", q: "wildlife" },
  { label: "Food & drink", category: "Food" },
  { label: "Arts & culture", category: "Entertainment" },
  { label: "Outdoor escapes", category: "Activities" },
];

export function whatsappUrl(message?: string): string {
  const base = `https://wa.me/${site.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Prefilled WhatsApp messages, worded as in the concept. */
export const whatsappMessages = {
  general: "Hello Pretty Fly Living, I would like to make an enquiry.",
  service: (title: string): string => `Hello Pretty Fly Living, I would like to ask about ${title}.`,
  property: (name: string, area: string): string =>
    `Hello Pretty Fly Living, I am interested in ${name} in ${area}. Could you please share availability and rates?`,
  bookingRequest: (request: {
    property: string;
    area: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    name: string;
    email: string;
    phone: string;
  }): string =>
    `Hello Pretty Fly Living, I'd like to request a stay at ${request.property} (${request.area}). Check-in: ${request.checkIn}; check-out: ${request.checkOut}; guests: ${request.guests}. Name: ${request.name}. Email: ${request.email}. Phone: ${request.phone}. Please confirm availability and total price.`,
} as const;

/** Concept's money() format: "KES 180,000". */
export function formatKes(amount: number): string {
  return `KES ${amount.toLocaleString("en-KE")}`;
}

/** "1 guest", "2 guests". */
export function countLabel(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

/** "Studio" for a stay without a separate bedroom, otherwise "2 bedrooms" (or "2 beds" on cards). */
export function bedroomLabel(bedrooms: number, word = "bedroom"): string {
  return bedrooms === 0 ? "Studio" : countLabel(bedrooms, word);
}

/** Opening lines for replies from the dashboard; Sophiah finishes them in her email or WhatsApp. */
export const replyMessages = {
  booking: (request: { name: string; property: string; checkIn: string; checkOut: string }): string =>
    `Hello ${request.name}, thank you for your request to stay at ${request.property} from ${request.checkIn} to ${request.checkOut}. `,
  contact: (name: string): string => `Hello ${name}, thank you for getting in touch with Pretty Fly Living. `,
  owner: (name: string, area: string): string =>
    `Hello ${name}, thank you for your interest in property management with Pretty Fly Living for your property in ${area}. `,
} as const;
