import { describe, expect, it } from "vitest";

import {
  absoluteUrl,
  faqJsonLd,
  guideJsonLd,
  imageUrl,
  pageMeta,
  robotsTxt,
  sitemapXml,
  stayJsonLd,
  timestampToIso,
} from "./seo";
import type { GuideDetailData, PropertyDetailData } from "./types";

const property: PropertyDetailData = {
  id: 7,
  slug: "little-urban-nook",
  name: "Little Urban Nook",
  area: "Kilimani",
  address: "",
  propertyType: "Studio",
  tag: null,
  rating: 4.9,
  description: "A calm studio.",
  goodToKnow: null,
  bedrooms: 0,
  bathrooms: 1,
  sleeps: 2,
  monthlyPriceKes: 60000,
  minNights: 30,
  amenities: ["Wi-Fi", "Pool"],
  photos: Array.from({ length: 7 }, (_, i) => ({ key: `photos/${i}.webp`, alt: `Photo ${i}` })),
  coverKey: "photos/0.webp",
  coverAlt: "Photo 0",
};

const guide: GuideDetailData = {
  slug: "a-taste-of-nairobi",
  title: "A taste of Nairobi",
  category: "Food",
  excerpt: "Find your next table.",
  coverKey: "https://images.unsplash.com/cover.jpg",
  highlights: [],
  photos: [{ key: "https://images.unsplash.com/cover.jpg", alt: "Cover" }],
  bodyHtml: "<p>Body</p>",
  createdAt: "2026-10-20 08:00:00",
  updatedAt: "2026-10-22 09:15:30",
};

describe("absoluteUrl and imageUrl", () => {
  it("always points at the production domain", () => {
    expect(absoluteUrl("/")).toBe("https://prettyflyliving.com/");
    expect(absoluteUrl("/faqs?tab=owners")).toBe("https://prettyflyliving.com/faqs?tab=owners");
  });

  it("serves R2 keys from /media and keeps public paths and absolute URLs", () => {
    expect(imageUrl("photos/a.webp")).toBe("https://prettyflyliving.com/media/photos/a.webp");
    expect(imageUrl("/brand/og-default.jpg")).toBe("https://prettyflyliving.com/brand/og-default.jpg");
    expect(imageUrl("https://images.unsplash.com/x.jpg")).toBe("https://images.unsplash.com/x.jpg");
  });
});

describe("timestampToIso", () => {
  it("reads SQLite CURRENT_TIMESTAMP as UTC", () => {
    expect(timestampToIso("2026-10-22 09:15:30")).toBe("2026-10-22T09:15:30Z");
  });
});

describe("pageMeta", () => {
  const tags = pageMeta({ title: "Our stays", description: "Stays.", path: "/stays" });

  it("sets the title, canonical and Open Graph tags", () => {
    expect(tags).toContainEqual({ title: "Our stays" });
    expect(tags).toContainEqual({ tagName: "link", rel: "canonical", href: "https://prettyflyliving.com/stays" });
    expect(tags).toContainEqual({ property: "og:url", content: "https://prettyflyliving.com/stays" });
    expect(tags).toContainEqual({ property: "og:type", content: "website" });
  });

  it("falls back to the default share image", () => {
    expect(tags).toContainEqual({
      property: "og:image",
      content: "https://prettyflyliving.com/brand/og-default.jpg",
    });
  });

  it("always includes the LodgingBusiness, then the page's own JSON-LD", () => {
    const withLd = pageMeta({ title: "T", description: "D", path: "/faqs", jsonLd: [{ "@type": "FAQPage" }] });
    const script = withLd.find((tag) => "script:ld+json" in tag) as { "script:ld+json": { "@graph": { "@type": string }[] } };
    expect(script["script:ld+json"]["@graph"].map((node) => node["@type"])).toEqual(["LodgingBusiness", "FAQPage"]);
  });
});

describe("stayJsonLd", () => {
  const [accommodation, offer] = stayJsonLd(property);

  it("describes the stay with up to five photos and no rating", () => {
    expect(accommodation["@type"]).toBe("Accommodation");
    expect(accommodation.image).toHaveLength(5);
    expect(accommodation).not.toHaveProperty("aggregateRating");
    expect(accommodation.address).not.toHaveProperty("streetAddress");
  });

  it("offers the monthly price in KES", () => {
    expect(offer).toMatchObject({
      "@type": "Offer",
      price: 60000,
      priceCurrency: "KES",
      itemOffered: { "@id": "https://prettyflyliving.com/stays/little-urban-nook#accommodation" },
    });
  });
});

describe("faqJsonLd", () => {
  it("turns each FAQ into a question and answer", () => {
    const [page] = faqJsonLd([{ id: 1, question: "Is Wi-Fi included?", answer: "Yes." }]);
    expect(page.mainEntity).toEqual([
      { "@type": "Question", name: "Is Wi-Fi included?", acceptedAnswer: { "@type": "Answer", text: "Yes." } },
    ]);
  });

  it("adds nothing when there are no FAQs", () => {
    expect(faqJsonLd([])).toEqual([]);
  });
});

describe("guideJsonLd", () => {
  it("is an Article with ISO dates and no empty keywords", () => {
    const [article] = guideJsonLd(guide);
    expect(article).toMatchObject({
      "@type": "Article",
      headline: "A taste of Nairobi",
      datePublished: "2026-10-20T08:00:00Z",
      dateModified: "2026-10-22T09:15:30Z",
      image: ["https://images.unsplash.com/cover.jpg"],
    });
    expect(article).not.toHaveProperty("keywords");
  });
});

describe("sitemapXml", () => {
  it("lists absolute, escaped URLs with the edit date as lastmod", () => {
    const xml = sitemapXml([
      { path: "/" },
      { path: "/faqs?tab=owners" },
      { path: "/stays/little-urban-nook", updatedAt: "2026-10-22 09:15:30" },
    ]);
    expect(xml).toContain("<url><loc>https://prettyflyliving.com/</loc></url>");
    expect(xml).toContain("<loc>https://prettyflyliving.com/faqs?tab=owners</loc>");
    expect(xml).toContain(
      "<url><loc>https://prettyflyliving.com/stays/little-urban-nook</loc><lastmod>2026-10-22</lastmod></url>",
    );
  });

  it("escapes XML special characters", () => {
    expect(sitemapXml([{ path: "/stays?a=1&b=2" }])).toContain("/stays?a=1&amp;b=2");
  });
});

describe("robotsTxt", () => {
  it("keeps crawlers out of the admin and points at the sitemap", () => {
    const robots = robotsTxt();
    expect(robots).toContain("Disallow: /admin");
    expect(robots).toContain("Sitemap: https://prettyflyliving.com/sitemap.xml");
  });
});
