import { describe, expect, it } from "vitest";

import { mediaUrl } from "./media";
import { bedroomLabel, countLabel, formatKes, whatsappMessages, whatsappUrl } from "./site";

describe("formatKes", () => {
  it("formats whole shillings with en-KE grouping, like the concept", () => {
    expect(formatKes(180000)).toBe("KES 180,000");
    expect(formatKes(950)).toBe("KES 950");
  });
});

describe("countLabel", () => {
  it("uses the singular only for one", () => {
    expect(countLabel(1, "guest")).toBe("1 guest");
    expect(countLabel(4, "guest")).toBe("4 guests");
    expect(countLabel(0, "bathroom")).toBe("0 bathrooms");
  });
});

describe("bedroomLabel", () => {
  it("calls a stay without a bedroom a studio", () => {
    expect(bedroomLabel(0)).toBe("Studio");
    expect(bedroomLabel(0, "bed")).toBe("Studio");
    expect(bedroomLabel(1)).toBe("1 bedroom");
    expect(bedroomLabel(3, "bed")).toBe("3 beds");
  });
});

describe("whatsappUrl", () => {
  it("links to the chat without a message", () => {
    expect(whatsappUrl()).toMatch(/^https:\/\/wa\.me\/\d+$/);
  });

  it("URL-encodes the prefilled message", () => {
    const url = whatsappUrl(whatsappMessages.property("The Urban Loft", "Kileleshwa"));
    expect(url).toContain("?text=Hello%20Pretty%20Fly%20Living%2C");
    expect(decodeURIComponent(url.split("?text=")[1])).toBe(
      "Hello Pretty Fly Living, I am interested in The Urban Loft in Kileleshwa. Could you please share availability and rates?",
    );
  });
});

describe("mediaUrl", () => {
  it("serves R2 keys through /media", () => {
    expect(mediaUrl("properties/abc123.webp")).toBe("/media/properties/abc123.webp");
    expect(mediaUrl("/guides/x.webp")).toBe("/media/guides/x.webp");
  });

  it("passes absolute seed URLs through unchanged", () => {
    const url = "https://images.unsplash.com/photo-1?w=900";
    expect(mediaUrl(url)).toBe(url);
  });
});
