/**
 * Copies the seed photos in scripts/seed-media/ into local R2, so the photo
 * keys in seed.sql resolve through /media/* (AGENTS.md section 10).
 *
 *   npm run db:seed    runs seed.sql, then this script
 *
 * Each file's path under seed-media/ is its R2 key (e.g.
 * properties/<hash>.webp), named the same way the dashboard names uploads.
 * Local only: production photos are uploaded through the dashboard.
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const BUCKET = "prettyflyliving-media";
const root = fileURLToPath(new URL("./seed-media/", import.meta.url));

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

const pairs = readdirSync(root, { recursive: true, withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => {
    const file = join(entry.parentPath, entry.name);
    return { key: file.slice(root.length).split("\\").join("/"), file };
  });

const dir = mkdtempSync(join(tmpdir(), "pfl-media-"));
const list = join(dir, "media.json");
writeFileSync(list, JSON.stringify(pairs));
try {
  const wrangler = fileURLToPath(new URL("../node_modules/wrangler/bin/wrangler.js", import.meta.url));
  const result = spawnSync(
    process.execPath,
    [
      wrangler, "r2", "bulk", "put", BUCKET, "--local", "--filename", list,
      "--content-type", "image/webp", "--cache-control", "public, max-age=31536000, immutable",
    ],
    { stdio: "inherit" },
  );
  if (result.status !== 0) fail("Copying the seed photos failed (see the Wrangler output above).");
} finally {
  rmSync(dir, { recursive: true, force: true });
}

console.log(`\n${pairs.length} seed photos are in local R2.`);
