import { describe, expect, it } from "vitest";

import { DUMMY_HASH, hashPassword, verifyPassword } from "./password";

const PEPPER = "a-test-pepper-that-is-at-least-32-characters";

describe("password hashing", () => {
  it("verifies the right password with the same pepper", async () => {
    const stored = await hashPassword("correct horse battery", PEPPER);
    expect(stored).toMatch(/^pbkdf2-sha256-hmac\$4000\$[^$]+\$[^$]+$/);
    expect(await verifyPassword("correct horse battery", stored, PEPPER)).toBe(true);
  });

  it("rejects a wrong password or a different pepper", async () => {
    const stored = await hashPassword("correct horse battery", PEPPER);
    expect(await verifyPassword("correct horse batterY", stored, PEPPER)).toBe(false);
    expect(await verifyPassword("correct horse battery", stored, `${PEPPER}-rotated`)).toBe(false);
  });

  it("salts every hash", async () => {
    expect(await hashPassword("same password", PEPPER)).not.toBe(await hashPassword("same password", PEPPER));
  });

  it("refuses to run without a long enough pepper", async () => {
    await expect(hashPassword("correct horse battery", "")).rejects.toThrow(/PASSWORD_PEPPER/);
    await expect(hashPassword("correct horse battery", "too short")).rejects.toThrow(/PASSWORD_PEPPER/);
  });

  it("rejects malformed, old-format and over-costly hashes", async () => {
    const stored = await hashPassword("correct horse battery", PEPPER);
    const [, , salt, hash] = stored.split("$");
    expect(await verifyPassword("correct horse battery", `pbkdf2-sha256$4000$${salt}$${hash}`, PEPPER)).toBe(false);
    expect(await verifyPassword("correct horse battery", `pbkdf2-sha256-hmac$200000$${salt}$${hash}`, PEPPER)).toBe(false);
    expect(await verifyPassword("correct horse battery", "pbkdf2-sha256-hmac$4000$!!$!!", PEPPER)).toBe(false);
    expect(await verifyPassword("correct horse battery", "", PEPPER)).toBe(false);
    expect(await verifyPassword("correct horse battery", "plain-text", PEPPER)).toBe(false);
    expect(await verifyPassword("correct horse battery", `pbkdf2-sha256-hmac$abc$${salt}$${hash}`, PEPPER)).toBe(false);
  });

  it("has a dummy hash that is well formed but matches nothing", async () => {
    expect(DUMMY_HASH.split("$")).toHaveLength(4);
    expect(await verifyPassword("", DUMMY_HASH, PEPPER)).toBe(false);
  });
});
