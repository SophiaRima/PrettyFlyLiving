/**
 * Copies the seed photos in scripts/seed-media/ into R2, so the photo keys in
 * the seed SQL resolve through /media/* (AGENTS.md section 10).
 *
 *   npm run db:seed                     runs seed.sql, then this script (local R2)
 *   node scripts/seed-media.ts --remote  production R2: only the photos that
 *                                        seed-production.sql uses
 *
 * Each file's path under seed-media/ is its R2 key (e.g.
 * properties/<hash>.webp), named the same way the dashboard names uploads,
 * including each photo's 800px small copy (properties/<hash>-800.webp).
 * Later production photos are uploaded through the dashboard.
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const BUCKET = "prettyflyliving-media";
const root = fileURLToPath(new URL("./seed-media/", import.meta.url));
const remote = process.argv.includes("--remote");

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

/** R2 keys the production seed references, with their 800px copies. */
function productionKeys(): Set<string> {
  const sql = readFileSync(fileURLToPath(new URL("./seed-production.sql", import.meta.url)), "utf8");
  const keys = new Set<string>();
  for (const [, dir, hash, ext] of sql.matchAll(/'(properties|services)\/([0-9a-f]{32})\.(webp|jpg|png)'/g)) {
    keys.add(`${dir}/${hash}.${ext}`);
    keys.add(`${dir}/${hash}-800.${ext}`);
  }
  return keys;
}

const wanted = remote ? productionKeys() : undefined;
const pairs = readdirSync(root, { recursive: true, withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => {
    const file = join(entry.parentPath, entry.name);
    return { key: file.slice(root.length).split("\\").join("/"), file };
  })
  .filter((pair) => !wanted || wanted.has(pair.key));

if (wanted) {
  const missing = [...wanted].filter((key) => !pairs.some((pair) => pair.key === key));
  if (missing.length > 0) fail(`Missing from scripts/seed-media/:\n${missing.join("\n")}`);
}

const dir = mkdtempSync(join(tmpdir(), "pfl-media-"));
const list = join(dir, "media.json");
writeFileSync(list, JSON.stringify(pairs));
try {
  const wrangler = fileURLToPath(new URL("../node_modules/wrangler/bin/wrangler.js", import.meta.url));
  const result = spawnSync(
    process.execPath,
    [
      wrangler, "r2", "bulk", "put", BUCKET, remote ? "--remote" : "--local", "--filename", list,
      "--content-type", "image/webp", "--cache-control", "public, max-age=31536000, immutable",
    ],
    { stdio: "inherit" },
  );
  if (result.status !== 0) fail("Copying the seed photos failed (see the Wrangler output above).");
} finally {
  rmSync(dir, { recursive: true, force: true });
}

console.log(`\n${pairs.length} seed photos are in ${remote ? "production" : "local"} R2.`);
