import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "./password";

describe("password hashing", () => {
  it("verifies the right password and rejects a wrong one", async () => {
    const stored = await hashPassword("correct horse battery staple");
    expect(stored).toMatch(/^pbkdf2-sha256\$100000\$[A-Za-z0-9+/=]+\$[A-Za-z0-9+/=]+$/);
    expect(await verifyPassword("correct horse battery staple", stored)).toBe(true);
    expect(await verifyPassword("correct horse battery stapler", stored)).toBe(false);
  });

  it("uses a fresh salt for every hash", async () => {
    expect(await hashPassword("same")).not.toBe(await hashPassword("same"));
  });

  it("rejects malformed or unsupported stored hashes", async () => {
    expect(await verifyPassword("x", "")).toBe(false);
    expect(await verifyPassword("x", "plain-text")).toBe(false);
    expect(await verifyPassword("x", "pbkdf2-sha256$abc$AAAA$AAAA")).toBe(false);
    expect(await verifyPassword("x", "pbkdf2-sha256$100000$!!!$AAAA")).toBe(false);
    // More iterations than Workers allow would throw at runtime.
    expect(await verifyPassword("x", "pbkdf2-sha256$200000$AAAA$AAAA")).toBe(false);
  });
});
