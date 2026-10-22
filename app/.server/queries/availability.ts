import { and, asc, eq, gt, lt, ne } from "drizzle-orm";
import type { BatchItem } from "drizzle-orm/batch";

import { expandNights, subtractRange } from "~/lib/dates";

import type { Database } from "../db/client";
import { availabilityBlocks, type AvailabilityBlock } from "../db/schema";

/** Blocks for one property that share a night with [from, to). */
function overlapping(propertyId: number, from: string, to: string) {
  return and(
    eq(availabilityBlocks.propertyId, propertyId),
    lt(availabilityBlocks.startDate, to),
    gt(availabilityBlocks.endDate, from),
  );
}

/** Unavailable nights (YYYY-MM-DD) in [from, to), for the stay calendar. */
export async function getBlockedNights(
  db: Database,
  propertyId: number,
  from: string,
  to: string,
): Promise<string[]> {
  const blocks = await db
    .select({ start: availabilityBlocks.startDate, end: availabilityBlocks.endDate })
    .from(availabilityBlocks)
    .where(overlapping(propertyId, from, to));
  const nights = new Set<string>();
  for (const block of blocks) {
    for (const night of expandNights(block.start, block.end, from, to)) nights.add(night);
  }
  return [...nights].sort();
}

/** True when any night of [checkIn, checkOut) is blocked. */
export async function isRangeBlocked(
  db: Database,
  propertyId: number,
  checkIn: string,
  checkOut: string,
): Promise<boolean> {
  const [hit] = await db
    .select({ id: availabilityBlocks.id })
    .from(availabilityBlocks)
    .where(overlapping(propertyId, checkIn, checkOut))
    .limit(1);
  return hit !== undefined;
}

// ------------------------------------------------------------------ admin

export interface AdminBlock {
  id: number;
  startDate: string;
  endDate: string;
  source: AvailabilityBlock["source"];
  note: string | null;
}

/** Blocks for one property that end after `from`, earliest first. */
export async function getBlocks(db: Database, propertyId: number, from: string): Promise<AdminBlock[]> {
  return db
    .select({
      id: availabilityBlocks.id,
      startDate: availabilityBlocks.startDate,
      endDate: availabilityBlocks.endDate,
      source: availabilityBlocks.source,
      note: availabilityBlocks.note,
    })
    .from(availabilityBlocks)
    .where(and(eq(availabilityBlocks.propertyId, propertyId), gt(availabilityBlocks.endDate, from)))
    .orderBy(asc(availabilityBlocks.startDate));
}

/** Blocks [start, end). Callers check for overlaps first with isRangeBlocked(). */
export async function createBlock(
  db: Database,
  block: {
    propertyId: number;
    startDate: string;
    endDate: string;
    source: "admin" | "booking";
    note: string | null;
  },
): Promise<void> {
  await db.insert(availabilityBlocks).values(block);
}

/**
 * Frees every night in [start, end): blocks inside the range are removed,
 * blocks that stick out are trimmed or split. Calendar-sync (iCal) blocks
 * are left alone, since the next sync would recreate them.
 * Returns how many blocks changed.
 */
export async function unblockRange(
  db: Database,
  propertyId: number,
  start: string,
  end: string,
): Promise<number> {
  const blocks = await db
    .select()
    .from(availabilityBlocks)
    .where(and(overlapping(propertyId, start, end), ne(availabilityBlocks.source, "ical")));

  const writes: BatchItem<"sqlite">[] = [];
  for (const block of blocks) {
    const [keep, extra] = subtractRange(block.startDate, block.endDate, start, end);
    if (!keep) {
      writes.push(db.delete(availabilityBlocks).where(eq(availabilityBlocks.id, block.id)));
      continue;
    }
    writes.push(
      db
        .update(availabilityBlocks)
        .set({ startDate: keep.start, endDate: keep.end })
        .where(eq(availabilityBlocks.id, block.id)),
    );
    if (extra) {
      writes.push(
        db.insert(availabilityBlocks).values({
          propertyId,
          startDate: extra.start,
          endDate: extra.end,
          source: block.source,
          note: block.note,
        }),
      );
    }
  }
  const [first, ...rest] = writes;
  if (first) await db.batch([first, ...rest]);
  return blocks.length;
}

/** Removes one block of this property. */
export async function deleteBlock(db: Database, propertyId: number, blockId: number): Promise<void> {
  await db
    .delete(availabilityBlocks)
    .where(and(eq(availabilityBlocks.id, blockId), eq(availabilityBlocks.propertyId, propertyId)));
}
