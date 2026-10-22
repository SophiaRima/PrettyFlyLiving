/**
 * Creates the admin user, or resets their password (AGENTS.md section 10).
 *
 *   npm run admin:create            local D1 (npm run dev)
 *   npm run admin:create -- --remote  production D1
 *
 * Prompts for the email and password. For scripted local setup, set
 * ADMIN_EMAIL and ADMIN_PASSWORD instead. Resetting a password signs out
 * every existing session for that user.
 *
 * Runs with Node 22.18+ (built-in TypeScript support) and hashes with the
 * same module the Worker uses, so the formats can't drift apart.
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createInterface } from "node:readline/promises";
import { Writable } from "node:stream";
import { fileURLToPath } from "node:url";

import { hashPassword } from "../app/.server/password.ts";

const MIN_PASSWORD_LENGTH = 10;
const remote = process.argv.includes("--remote");

async function prompt(): Promise<{ email: string; password: string }> {
  let muted = false;
  const output = new Writable({
    write(chunk, encoding, callback) {
      if (!muted) process.stdout.write(chunk, encoding);
      callback();
    },
  });
  const rl = createInterface({ input: process.stdin, output, terminal: true });
  const askHidden = async (label: string): Promise<string> => {
    process.stdout.write(label);
    muted = true;
    const answer = await rl.question("");
    muted = false;
    process.stdout.write("\n");
    return answer;
  };

  const email = await rl.question("Admin email: ");
  const password = await askHidden(`Password (at least ${MIN_PASSWORD_LENGTH} characters): `);
  const again = await askHidden("Repeat password: ");
  rl.close();
  if (password !== again) fail("The passwords don't match.");
  return { email, password };
}

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

const input =
  process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD
    ? { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD }
    : await prompt();

const email = input.email.trim().toLowerCase();
if (!/^[^\s@']+@[^\s@']+\.[^\s@']+$/.test(email)) fail("Please enter a valid email address.");
if (input.password.length < MIN_PASSWORD_LENGTH) {
  fail(`The password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
}

// The hash is base64 plus "$" and the email has no quotes (checked above),
// so both are safe inside single-quoted SQL strings.
const hash = await hashPassword(input.password);
const sql = `INSERT INTO admin_users (email, password_hash) VALUES ('${email}', '${hash}')
  ON CONFLICT(email) DO UPDATE SET password_hash = excluded.password_hash;
DELETE FROM sessions WHERE user_id = (SELECT id FROM admin_users WHERE email = '${email}');
`;

const dir = mkdtempSync(join(tmpdir(), "pfl-admin-"));
const file = join(dir, "admin.sql");
writeFileSync(file, sql);
try {
  const wrangler = fileURLToPath(new URL("../node_modules/wrangler/bin/wrangler.js", import.meta.url));
  const result = spawnSync(
    process.execPath,
    [wrangler, "d1", "execute", "DB", remote ? "--remote" : "--local", "--file", file],
    { stdio: "inherit" },
  );
  if (result.status !== 0) fail("Saving the admin user failed (see the Wrangler output above).");
} finally {
  rmSync(dir, { recursive: true, force: true });
}

console.log(`\nAdmin user ${email} is ready (${remote ? "production" : "local"} database).`);
