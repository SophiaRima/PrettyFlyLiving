import { and, asc, eq, max } from "drizzle-orm";

import type { Database } from "../db/client";
import { guidePhotos, propertyPhotos } from "../db/schema";
import type { StoredImage } from "../media";

/*
 * Photo galleries in the dashboard. Property and guide photos have the same
 * shape, so one set of functions serves both.
 */

export type PhotoOwner = "property" | "guide";

export interface AdminPhoto {
  id: number;
  key: string;
  alt: string;
}

function photoTable(owner: PhotoOwner) {
  return owner === "property"
    ? { table: propertyPhotos, ownerColumn: propertyPhotos.propertyId }
    : { table: guidePhotos, ownerColumn: guidePhotos.guideId };
}

/** Photos in display order; the first one is the cover. */
export async function getPhotos(db: Database, owner: PhotoOwner, ownerId: number): Promise<AdminPhoto[]> {
  const { table, ownerColumn } = photoTable(owner);
  return db
    .select({ id: table.id, key: table.r2Key, alt: table.alt })
    .from(table)
    .where(eq(ownerColumn, ownerId))
    .orderBy(asc(table.sortOrder), asc(table.id));
}

/** Adds a photo at the end of the gallery. */
export async function addPhoto(
  db: Database,
  owner: PhotoOwner,
  ownerId: number,
  photo: StoredImage & { alt: string },
): Promise<void> {
  const { table, ownerColumn } = photoTable(owner);
  const [row] = await db.select({ last: max(table.sortOrder) }).from(table).where(eq(ownerColumn, ownerId));
  const sortOrder = (row?.last ?? -1) + 1;
  const values = { r2Key: photo.key, alt: photo.alt, width: photo.width, height: photo.height, sortOrder };
  if (owner === "property") await db.insert(propertyPhotos).values({ ...values, propertyId: ownerId });
  else await db.insert(guidePhotos).values({ ...values, guideId: ownerId });
}

export async function updatePhotoAlt(
  db: Database,
  owner: PhotoOwner,
  ownerId: number,
  photoId: number,
  alt: string,
): Promise<void> {
  const { table, ownerColumn } = photoTable(owner);
  await db
    .update(table)
    .set({ alt })
    .where(and(eq(table.id, photoId), eq(ownerColumn, ownerId)));
}

/** Saves a new order; ids that don't belong to this owner are ignored. */
export async function reorderPhotos(
  db: Database,
  owner: PhotoOwner,
  ownerId: number,
  orderedIds: number[],
): Promise<void> {
  const { table, ownerColumn } = photoTable(owner);
  const updates = orderedIds.map((id, index) =>
    db
      .update(table)
      .set({ sortOrder: index })
      .where(and(eq(table.id, id), eq(ownerColumn, ownerId))),
  );
  const [first, ...rest] = updates;
  if (first) await db.batch([first, ...rest]);
}

/** Removes a photo and returns its R2 key (null if it wasn't found). */
export async function deletePhoto(
  db: Database,
  owner: PhotoOwner,
  ownerId: number,
  photoId: number,
): Promise<string | null> {
  const { table, ownerColumn } = photoTable(owner);
  const [row] = await db
    .delete(table)
    .where(and(eq(table.id, photoId), eq(ownerColumn, ownerId)))
    .returning({ key: table.r2Key });
  return row?.key ?? null;
}
