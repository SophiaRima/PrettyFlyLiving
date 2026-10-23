import { describe, expect, it } from "vitest";

import {
  adminEmailChangeSchema,
  adminPasswordChangeSchema,
  bookingRequestSchema,
  calendarRangeSchema,
  contactMessageSchema,
  guideSchema,
  isPhoneNumber,
  ownerEnquirySchema,
  propertySchema,
  reviewSchema,
  stayFiltersSchema,
} from "./validation";

describe("isPhoneNumber", () => {
  it("accepts Kenyan and international formats", () => {
    expect(isPhoneNumber("+254 700 000 000")).toBe(true);
    expect(isPhoneNumber("0712345678")).toBe(true);
    expect(isPhoneNumber("(020) 123-4567")).toBe(true);
  });

  it("rejects text and wrong lengths", () => {
    expect(isPhoneNumber("call me")).toBe(false);
    expect(isPhoneNumber("12345")).toBe(false);
    expect(isPhoneNumber("+1234567890123456")).toBe(false);
  });
});

describe("bookingRequestSchema", () => {
  const valid = {
    checkIn: "2026-11-01",
    checkOut: "2026-12-01",
    guests: "2",
    name: " Amina ",
    contact: "amina@example.com",
  };

  it("parses and trims a valid request", () => {
    const result = bookingRequestSchema.parse(valid);
    expect(result).toMatchObject({ guests: 2, name: "Amina" });
  });

  it("takes either an email or a phone number as contact", () => {
    expect(bookingRequestSchema.safeParse({ ...valid, contact: "+254 712 345 678" }).success).toBe(true);
    expect(bookingRequestSchema.safeParse({ ...valid, contact: "amina@" }).success).toBe(false);
    expect(bookingRequestSchema.safeParse({ ...valid, contact: "soon" }).success).toBe(false);
  });

  it("requires real dates and a name", () => {
    expect(bookingRequestSchema.safeParse({ ...valid, checkIn: "" }).success).toBe(false);
    expect(bookingRequestSchema.safeParse({ ...valid, name: "  " }).success).toBe(false);
  });
});

describe("contact and owner forms", () => {
  it("keeps phone optional on the contact form", () => {
    const result = contactMessageSchema.parse({
      type: "General question",
      name: "Sam",
      email: "sam@example.com",
      phone: "",
      message: "Hello",
    });
    expect(result.phone).toBeUndefined();
  });

});

describe("ownerEnquirySchema", () => {
  const single = {
    location: "Kilimani, Nairobi",
    units: "1",
    type: "Studio",
    name: "Sam",
    email: "sam@example.com",
    phone: "0712345678",
  };
  const firstIssue = (input: Record<string, string>) => {
    const parsed = ownerEnquirySchema.safeParse(input);
    return parsed.success ? null : parsed.error.issues[0];
  };

  it("accepts one unit with its type, and leaves blank answers out", () => {
    const parsed = ownerEnquirySchema.parse({ ...single, furnishing: "", preferredContact: "" });
    expect(parsed).toMatchObject({ units: 1, propertyType: "Studio", unitBreakdown: null, support: [] });
    expect(parsed.furnishing).toBeUndefined();
    expect(parsed.preferredContact).toBeUndefined();
  });

  it("needs a property type for a single unit", () => {
    expect(firstIssue({ ...single, type: "" })?.path).toEqual(["type"]);
    expect(firstIssue({ ...single, type: "Castle" })?.path).toEqual(["type"]);
  });

  it("gathers numbered unit rows for several units and summarises them", () => {
    const parsed = ownerEnquirySchema.parse({
      ...single,
      units: "3",
      type: "",
      unitType1: "Studio",
      unitCount1: "2",
      unitType2: "",
      unitCount2: "",
      unitType3: "1-bedroom apartment",
      unitCount3: "1",
    });
    expect(parsed.unitBreakdown).toEqual([
      { type: "Studio", count: 2 },
      { type: "1-bedroom apartment", count: 1 },
    ]);
    expect(parsed.propertyType).toBe("2 × Studio, 1 × 1-bedroom apartment");
  });

  it("needs at least one complete row for several units", () => {
    expect(firstIssue({ ...single, units: "4" })?.path).toEqual(["unitRows"]);
    expect(firstIssue({ ...single, units: "4", unitType1: "Studio" })?.path[0]).toBe("unitRows");
    expect(firstIssue({ ...single, units: "4", unitType1: "Castle", unitCount1: "2" })?.path[0]).toBe("unitRows");
  });

  it("gathers ticked support options and rejects unknown ones", () => {
    const parsed = ownerEnquirySchema.parse({ ...single, support2: "Listing creation and optimisation", support9: "Property inspections" });
    expect(parsed.support).toEqual(["Listing creation and optimisation", "Property inspections"]);
    expect(firstIssue({ ...single, support1: "Free money" })?.path[0]).toBe("support");
  });

  it("only accepts the listed radio answers", () => {
    expect(ownerEnquirySchema.safeParse({ ...single, furnishing: "Fully furnished", preferredContact: "WhatsApp" }).success).toBe(true);
    expect(firstIssue({ ...single, furnishing: "Half" })?.path).toEqual(["furnishing"]);
  });

  it("needs the contact details", () => {
    expect(firstIssue({ ...single, phone: "" })?.path).toEqual(["phone"]);
    expect(firstIssue({ ...single, units: "" })?.path).toEqual(["units"]);
  });
});

describe("stayFiltersSchema dates", () => {
  it("keeps a valid check-in/check-out pair", () => {
    const filters = stayFiltersSchema.parse({ in: "2026-11-01", out: "2026-12-01", guests: "3" });
    expect(filters).toMatchObject({ in: "2026-11-01", out: "2026-12-01", guests: 3 });
  });

  it("drops half or reversed pairs", () => {
    expect(stayFiltersSchema.parse({ in: "2026-11-01" }).in).toBeUndefined();
    const reversed = stayFiltersSchema.parse({ in: "2026-12-01", out: "2026-11-01" });
    expect(reversed.in).toBeUndefined();
    expect(reversed.out).toBeUndefined();
  });
});

describe("propertySchema (admin)", () => {
  const valid = {
    name: "The Lennox Residence",
    slug: "",
    area: "Kilimani",
    propertyType: "Apartment",
    description: "Calm and bright.",
    bedrooms: "2",
    bathrooms: "2",
    sleeps: "4",
    monthlyPriceKes: "180000",
    minNights: "30",
    sortOrder: "1",
  };

  it("fills in defaults and makes a slug from the name", () => {
    const result = propertySchema.parse({ ...valid, amenities: "Wi-Fi\n\nPool ", isPublished: "on" });
    expect(result.slug).toBe("the-lennox-residence");
    expect(result.amenities).toEqual(["Wi-Fi", "Pool"]);
    expect(result.isPublished).toBe(true);
    expect(result.isFeatured).toBe(false);
    expect(result.tag).toBeNull();
    expect(result.rating).toBeNull();
    expect(result.monthlyPriceKes).toBe(180000);
  });

  it("rounds the rating and rejects impossible ones", () => {
    expect(propertySchema.parse({ ...valid, rating: "4.86" }).rating).toBe(4.9);
    expect(propertySchema.safeParse({ ...valid, rating: "6" }).success).toBe(false);
  });

  it("treats a blank number as missing, not zero", () => {
    expect(propertySchema.safeParse({ ...valid, monthlyPriceKes: "" }).success).toBe(false);
    expect(propertySchema.safeParse({ ...valid, sleeps: "1.5" }).success).toBe(false);
  });

  it("checks custom slugs and map links", () => {
    expect(propertySchema.safeParse({ ...valid, slug: "Bad Slug!" }).success).toBe(false);
    expect(propertySchema.parse({ ...valid, slug: "lennox-2" }).slug).toBe("lennox-2");
    expect(propertySchema.safeParse({ ...valid, mapUrl: "javascript:alert(1)" }).success).toBe(false);
  });
});

describe("calendarRangeSchema", () => {
  it("accepts a single night and rejects a reversed range", () => {
    expect(calendarRangeSchema.safeParse({ first: "2026-11-01", last: "2026-11-01" }).success).toBe(true);
    const reversed = calendarRangeSchema.safeParse({ first: "2026-11-05", last: "2026-11-01" });
    expect(reversed.success).toBe(false);
    expect(reversed.error?.issues[0]?.path).toEqual(["last"]);
  });
});

describe("reviewSchema and guideSchema", () => {
  it("links a review to a property only for a real id", () => {
    const base = { guestName: "Amara", body: "Lovely.", rating: "5" };
    expect(reviewSchema.parse({ ...base, propertyId: "" }).propertyId).toBeNull();
    expect(reviewSchema.parse({ ...base, propertyId: "3" }).propertyId).toBe(3);
  });

  it("only accepts the six guide categories", () => {
    const base = { title: "Weekend markets", excerpt: "Crafts.", sortOrder: "0" };
    expect(guideSchema.parse({ ...base, category: "Shopping" }).slug).toBe("weekend-markets");
    expect(guideSchema.safeParse({ ...base, category: "Spa" }).success).toBe(false);
  });
});

describe("admin settings schemas", () => {
  it("lowercases a new login email", () => {
    const parsed = adminEmailChangeSchema.safeParse({ email: " Sophiah@Example.com " });
    expect(parsed.success && parsed.data.email).toBe("sophiah@example.com");
    expect(adminEmailChangeSchema.safeParse({ email: "not-an-email" }).success).toBe(false);
  });

  const valid = { newPassword: "a brand new one", confirmPassword: "a brand new one" };

  it("accepts a new password of at least 12 characters that is repeated exactly", () => {
    expect(adminPasswordChangeSchema.safeParse(valid).success).toBe(true);
  });

  it("flags the field that is wrong", () => {
    const issueAt = (input: Record<string, string>) => {
      const parsed = adminPasswordChangeSchema.safeParse(input);
      return parsed.success ? null : parsed.error.issues[0]?.path[0];
    };
    expect(issueAt({ newPassword: "eleven char", confirmPassword: "eleven char" })).toBe("newPassword");
    expect(issueAt({ ...valid, confirmPassword: "a brand new on" })).toBe("confirmPassword");
  });

  it("does not trim passwords", () => {
    const parsed = adminPasswordChangeSchema.safeParse({ newPassword: " spaced out pw ", confirmPassword: " spaced out pw " });
    expect(parsed.success && parsed.data.newPassword).toBe(" spaced out pw ");
  });
});
