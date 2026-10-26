import type { MetaDescriptor } from "react-router";

import { mediaUrl } from "./media";
import { site } from "./site";
import type { FaqData, GuideDetailData, PhotoData, PropertyDetailData } from "./types";

/**
 * Meta tags, Open Graph and JSON-LD for public pages (AGENTS.md section 8).
 *
 * A route's `meta` replaces its parents' tags, so every public route returns
 * pageMeta(), which also carries the sitewide LodgingBusiness block.
 */

type JsonLd = Record<string, unknown>;

interface PageImage {
  src: string;
  alt: string;
}

/** The share image generated from the logo (1200 × 630). */
export const defaultShareImage: PageImage = {
  src: "/brand/og-default.jpg",
  alt: "Pretty Fly Living",
};

/** The concept's home description, reused for the business itself. */
const businessDescription =
  "Thoughtfully selected serviced apartments in Nairobi for short and extended stays. Explore Pretty Fly Living.";

const businessId = `${site.url}/#business`;

/** Absolute URL on the production domain for a path such as "/stays". */
export function absoluteUrl(path: string): string {
  return new URL(path, site.url).toString();
}

/** Absolute URL for an image: an R2 key, a /public path or an absolute URL. */
export function imageUrl(src: string): string {
  return absoluteUrl(src.startsWith("/") ? src : mediaUrl(src));
}

/** SQLite CURRENT_TIMESTAMP ("2026-10-22 09:15:00", UTC) as ISO 8601. */
export function timestampToIso(timestamp: string): string {
  return `${timestamp.replace(" ", "T")}Z`;
}

/** First five photos as absolute URLs, matching the five-photo gallery. */
function photoUrls(photos: PhotoData[]): string[] {
  return photos.slice(0, 5).map((photo) => imageUrl(photo.key));
}

export function lodgingBusinessJsonLd(): JsonLd {
  return {
    "@type": "LodgingBusiness",
    "@id": businessId,
    name: site.name,
    description: businessDescription,
    url: absoluteUrl("/"),
    logo: imageUrl("/brand/icon-512.png"),
    image: imageUrl(defaultShareImage.src),
    telephone: site.phone,
    email: site.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Nairobi",
      addressCountry: "KE",
    },
    areaServed: { "@type": "City", name: "Nairobi" },
    currenciesAccepted: "KES",
  };
}

/**
 * The stay as an Accommodation plus its monthly Offer. The admin rating has no
 * review count behind it, so it is left out rather than shown as a rating.
 */
export function stayJsonLd(property: PropertyDetailData): JsonLd[] {
  const url = absoluteUrl(`/stays/${property.slug}`);
  const accommodationId = `${url}#accommodation`;
  return [
    {
      "@type": "Accommodation",
      "@id": accommodationId,
      name: property.name,
      description: property.description,
      url,
      image: photoUrls(property.photos),
      accommodationCategory: property.propertyType,
      address: {
        "@type": "PostalAddress",
        ...(property.address ? { streetAddress: property.address } : {}),
        addressLocality: `${property.area}, Nairobi`,
        addressCountry: "KE",
      },
      numberOfBedrooms: property.bedrooms,
      numberOfBathroomsTotal: property.bathrooms,
      occupancy: { "@type": "QuantitativeValue", maxValue: property.sleeps },
      amenityFeature: property.amenities.map((name) => ({
        "@type": "LocationFeatureSpecification",
        name,
        value: true,
      })),
    },
    {
      "@type": "Offer",
      url,
      itemOffered: { "@id": accommodationId },
      seller: { "@id": businessId },
      price: property.monthlyPriceKes,
      priceCurrency: "KES",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: property.monthlyPriceKes,
        priceCurrency: "KES",
        unitCode: "MON",
        unitText: "month",
      },
      eligibleDuration: {
        "@type": "QuantitativeValue",
        minValue: property.minNights,
        unitCode: "DAY",
      },
    },
  ];
}

export function faqJsonLd(faqs: FaqData[]): JsonLd[] {
  if (faqs.length === 0) return [];
  return [
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    },
  ];
}

export function guideJsonLd(guide: GuideDetailData): JsonLd[] {
  const url = absoluteUrl(`/things-to-do/${guide.slug}`);
  return [
    {
      "@type": "Article",
      headline: guide.title,
      description: guide.excerpt,
      url,
      mainEntityOfPage: url,
      image: photoUrls(guide.photos),
      articleSection: guide.category,
      ...(guide.highlights.length > 0 ? { keywords: guide.highlights.join(", ") } : {}),
      datePublished: timestampToIso(guide.createdAt),
      dateModified: timestampToIso(guide.updatedAt),
      author: { "@id": businessId },
      publisher: { "@id": businessId },
    },
  ];
}

interface PageMetaInput {
  title: string;
  description: string;
  /** Canonical path without filter query strings, e.g. "/stays". */
  path: string;
  image?: PageImage;
  type?: "website" | "article";
  /** Page-specific JSON-LD nodes, added after the LodgingBusiness. */
  jsonLd?: JsonLd[];
}

export function pageMeta(input: PageMetaInput): MetaDescriptor[] {
  const url = absoluteUrl(input.path);
  const image = input.image ?? defaultShareImage;
  return [
    { title: input.title },
    { name: "description", content: input.description },
    { tagName: "link", rel: "canonical", href: url },
    { property: "og:site_name", content: site.name },
    { property: "og:locale", content: "en_KE" },
    { property: "og:type", content: input.type ?? "website" },
    { property: "og:title", content: input.title },
    { property: "og:description", content: input.description },
    { property: "og:url", content: url },
    { property: "og:image", content: imageUrl(image.src) },
    { property: "og:image:alt", content: image.alt },
    { name: "twitter:card", content: "summary_large_image" },
    {
      "script:ld+json": {
        "@context": "https://schema.org",
        "@graph": [lodgingBusinessJsonLd(), ...(input.jsonLd ?? [])],
      },
    },
  ];
}

// --------------------------------------------------------- sitemap / robots

export interface SitemapEntry {
  path: string;
  /** SQLite timestamp of the last edit, when known. */
  updatedAt?: string;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function sitemapXml(entries: SitemapEntry[]): string {
  const urls = entries.map((entry) => {
    const lastmod = entry.updatedAt
      ? `<lastmod>${entry.updatedAt.slice(0, 10)}</lastmod>`
      : "";
    return `<url><loc>${escapeXml(absoluteUrl(entry.path))}</loc>${lastmod}</url>`;
  });
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
    "",
  ].join("\n");
}

export function robotsTxt(): string {
  return ["User-agent: *", "Allow: /", "Disallow: /admin", "", `Sitemap: ${absoluteUrl("/sitemap.xml")}`, ""].join("\n");
}
