import { describe, expect, it } from "vitest";

import {
  contactReplyLink,
  emailReplyUrl,
  formatReceived,
  isRecentSignIn,
  moveItem,
  parseLines,
  safeAdminPath,
  slugify,
  whatsappNumberFor,
} from "./admin";

describe("safeAdminPath", () => {
  it("keeps dashboard paths", () => {
    expect(safeAdminPath("/admin")).toBe("/admin");
    expect(safeAdminPath("/admin/bookings/3")).toBe("/admin/bookings/3");
    expect(safeAdminPath("/admin/properties?tab=photos")).toBe("/admin/properties?tab=photos");
  });

  it("falls back to /admin for anything else", () => {
    expect(safeAdminPath(null)).toBe("/admin");
    expect(safeAdminPath("")).toBe("/admin");
    expect(safeAdminPath("https://evil.example/admin")).toBe("/admin");
    expect(safeAdminPath("//evil.example")).toBe("/admin");
    expect(safeAdminPath("/administrator")).toBe("/admin");
    expect(safeAdminPath("/admin\\..\\evil")).toBe("/admin");
    expect(safeAdminPath("/admin/login?next=/admin")).toBe("/admin");
    expect(safeAdminPath("/stays")).toBe("/admin");
  });
});

describe("slugify", () => {
  it("makes URL-safe slugs", () => {
    expect(slugify("The Lennox Residence")).toBe("the-lennox-residence");
    expect(slugify("  Couples’ pick & Brunch!  ")).toBe("couples-pick-and-brunch");
    expect(slugify("Café Déjà Vu")).toBe("cafe-deja-vu");
    expect(slugify("---")).toBe("");
  });

  it("caps the length without a trailing dash", () => {
    const slug = slugify(`${"a".repeat(79)} b`);
    expect(slug.length).toBeLessThanOrEqual(80);
    expect(slug.endsWith("-")).toBe(false);
  });
});

describe("parseLines", () => {
  it("trims lines and drops blanks", () => {
    expect(parseLines(" Fast Wi-Fi \r\n\nPool\n  \nSmart TV")).toEqual(["Fast Wi-Fi", "Pool", "Smart TV"]);
    expect(parseLines("")).toEqual([]);
  });
});

describe("moveItem", () => {
  const ids = [1, 2, 3, 4];
  it("moves an item up, down, to the front and to the end", () => {
    expect(moveItem(ids, 3, 1)).toEqual([1, 3, 2, 4]);
    expect(moveItem(ids, 1, 1)).toEqual([2, 1, 3, 4]);
    expect(moveItem(ids, 4, 0)).toEqual([4, 1, 2, 3]);
    expect(moveItem(ids, 1, 99)).toEqual([2, 3, 4, 1]);
    expect(moveItem(ids, 2, -1)).toEqual([2, 1, 3, 4]);
  });

  it("leaves the list alone for an unknown id", () => {
    expect(moveItem(ids, 9, 0)).toEqual(ids);
  });
});

describe("reply links", () => {
  it("turns phone numbers into wa.me digits", () => {
    expect(whatsappNumberFor("0712 345 678")).toBe("254712345678");
    expect(whatsappNumberFor("0110-123-456")).toBe("254110123456");
    expect(whatsappNumberFor("712345678")).toBe("254712345678");
    expect(whatsappNumberFor("+254 712 345 678")).toBe("254712345678");
    expect(whatsappNumberFor("+44 20 7946 0958")).toBe("442079460958");
    expect(whatsappNumberFor("12345")).toBeNull();
    expect(whatsappNumberFor("not a number")).toBeNull();
  });

  it("builds a prefilled mailto link", () => {
    expect(emailReplyUrl("a@b.co", "Your stay", "Hi & welcome")).toBe(
      "mailto:a%40b.co?subject=Your%20stay&body=Hi%20%26%20welcome",
    );
  });

  it("picks email or WhatsApp from a booking's contact field", () => {
    expect(contactReplyLink(" guest@example.com ", "S", "B")?.kind).toBe("email");
    expect(contactReplyLink("0712345678", "S", "Hello")).toEqual({
      kind: "whatsapp",
      href: "https://wa.me/254712345678?text=Hello",
    });
    expect(contactReplyLink("call me", "S", "B")).toBeNull();
  });
});

describe("formatReceived", () => {
  it("shows a UTC SQLite timestamp in Nairobi time", () => {
    expect(formatReceived("2026-10-22 08:20:24")).toMatch(/22 Oct 2026.*11:20/);
  });

  it("returns unparseable input unchanged", () => {
    expect(formatReceived("soon")).toBe("soon");
  });
});

describe("isRecentSignIn", () => {
  const signedIn = "2026-10-22T12:00:00.000Z";
  const at = (minutes: number) => Date.parse(signedIn) + minutes * 60 * 1000;

  it("allows changes for 10 minutes after signing in", () => {
    expect(isRecentSignIn(signedIn, at(0))).toBe(true);
    expect(isRecentSignIn(signedIn, at(9.9))).toBe(true);
    expect(isRecentSignIn(signedIn, at(10))).toBe(false);
  });

  it("refuses unknown, unreadable or future sign-in times", () => {
    expect(isRecentSignIn(null, at(1))).toBe(false);
    expect(isRecentSignIn("not a date", at(1))).toBe(false);
    expect(isRecentSignIn(signedIn, at(-1))).toBe(false);
  });
});
