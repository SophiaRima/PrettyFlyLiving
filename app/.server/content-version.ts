import { eq, sql } from "drizzle-orm";

import type { Database } from "./db/client";
import { contentVersion } from "./db/schema";

/*
 * The content version: a counter that every dashboard save moves on. The
 * public page cache keys pages by it, so edits show on the site immediately
 * (workers/page-cache.ts).
 */

const ROW_ID = 1;

/** The current content version (0 before the first save). */
export async function getContentVersion(db: Database): Promise<number> {
  const [row] = await db
    .select({ version: contentVersion.version })
    .from(contentVersion)
    .where(eq(contentVersion.id, ROW_ID))
    .limit(1);
  return row?.version ?? 0;
}

/** Moves the content version on, retiring every cached public page. */
export async function bumpContentVersion(db: Database): Promise<void> {
  await db
    .insert(contentVersion)
    .values({ id: ROW_ID, version: 1 })
    .onConflictDoUpdate({ target: contentVersion.id, set: { version: sql`${contentVersion.version} + 1` } });
}
