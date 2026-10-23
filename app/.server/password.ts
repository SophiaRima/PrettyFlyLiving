/**
 * Peppered PBKDF2-SHA256 password hashing with WebCrypto (AGENTS.md section 9).
 *
 * No imports on purpose: scripts/create-admin.ts loads this file directly
 * with Node, so the CLI and the Worker always hash the same way.
 *
 * The password is first HMAC-SHA256'd with PASSWORD_PEPPER (a Worker secret),
 * then run through PBKDF2. The iteration count is low enough for one hash to
 * fit the Workers free plan's 10 ms CPU limit; the pepper is what keeps a
 * stolen database from being cracked offline, since it never lives in D1.
 *
 * Stored format: pbkdf2-sha256-hmac$<iterations>$<salt base64>$<hash base64>
 * Each hash records its own iteration count, so changing ITERATIONS only
 * affects passwords set afterwards.
 */

/** About 5 ms in local workerd. Re-measure on the live Worker before raising it. */
const ITERATIONS = 4_000;
/** The most Cloudflare Workers' PBKDF2 accepts; also caps the cost of a forged hash. */
const MAX_ITERATIONS = 100_000;
const SALT_BYTES = 16;
const HASH_BITS = 256;
const PREFIX = "pbkdf2-sha256-hmac";
const MIN_PEPPER_LENGTH = 32;

/**
 * A well-formed hash that matches no password. Checked when the email is
 * unknown, so a login takes the same time whether or not the account exists.
 */
export const DUMMY_HASH = `${PREFIX}$${ITERATIONS}$${"A".repeat(22)}==$${"A".repeat(43)}=`;

const encoder = new TextEncoder();

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array<ArrayBuffer> {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}

/** HMAC-SHA256 of the password, keyed with the pepper. */
async function pepperPassword(password: string, pepper: string): Promise<Uint8Array<ArrayBuffer>> {
  if (pepper.length < MIN_PEPPER_LENGTH) {
    throw new Error(`PASSWORD_PEPPER must be set to at least ${MIN_PEPPER_LENGTH} characters.`);
  }
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(pepper),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(password)));
}

async function derive(
  password: string,
  pepper: string,
  salt: Uint8Array<ArrayBuffer>,
  iterations: number,
): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    await pepperPassword(password, pepper),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    key,
    HASH_BITS,
  );
  return new Uint8Array(bits);
}

/** Compares every byte so the time taken doesn't reveal where they differ. */
function equalBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function hashPassword(password: string, pepper: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const hash = await derive(password, pepper, salt, ITERATIONS);
  return `${PREFIX}$${ITERATIONS}$${toBase64(salt)}$${toBase64(hash)}`;
}

/** False for a wrong password, a different pepper, or a malformed stored hash. */
export async function verifyPassword(
  password: string,
  stored: string,
  pepper: string,
): Promise<boolean> {
  const [prefix, iterationsText, saltText, hashText] = stored.split("$");
  const iterations = Number(iterationsText);
  if (prefix !== PREFIX || !Number.isInteger(iterations) || iterations < 1) return false;
  if (iterations > MAX_ITERATIONS || !saltText || !hashText) return false;

  let salt: Uint8Array<ArrayBuffer>;
  let expected: Uint8Array;
  try {
    salt = fromBase64(saltText);
    expected = fromBase64(hashText);
  } catch {
    return false;
  }
  return equalBytes(await derive(password, pepper, salt, iterations), expected);
}
