import { describe, expect, it } from "vitest";

import { mediaUrl } from "./media";
import { formatKes, whatsappMessages, whatsappUrl } from "./site";

describe("formatKes", () => {
  it("formats whole shillings with en-KE grouping, like the concept", () => {
    expect(formatKes(180000)).toBe("KES 180,000");
    expect(formatKes(950)).toBe("KES 950");
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
