/**
 * PBKDF2-SHA256 password hashing with WebCrypto (AGENTS.md section 9).
 *
 * No imports on purpose: scripts/create-admin.ts loads this file directly
 * with Node, so the CLI and the Worker always hash the same way.
 *
 * Stored format: pbkdf2-sha256$<iterations>$<salt base64>$<hash base64>
 */

/** Also the most Cloudflare Workers' PBKDF2 accepts. */
const ITERATIONS = 100_000;
const SALT_BYTES = 16;
const HASH_BITS = 256;
const PREFIX = "pbkdf2-sha256";

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array<ArrayBuffer> {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}

async function derive(
  password: string,
  salt: Uint8Array<ArrayBuffer>,
  iterations: number,
): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
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

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const hash = await derive(password, salt, ITERATIONS);
  return `${PREFIX}$${ITERATIONS}$${toBase64(salt)}$${toBase64(hash)}`;
}

/** False for a wrong password or a malformed stored hash. */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [prefix, iterationsText, saltText, hashText] = stored.split("$");
  const iterations = Number(iterationsText);
  if (prefix !== PREFIX || !Number.isInteger(iterations) || iterations < 1) return false;
  if (iterations > ITERATIONS || !saltText || !hashText) return false;

  let salt: Uint8Array<ArrayBuffer>;
  let expected: Uint8Array;
  try {
    salt = fromBase64(saltText);
    expected = fromBase64(hashText);
  } catch {
    return false;
  }
  return equalBytes(await derive(password, salt, iterations), expected);
}
