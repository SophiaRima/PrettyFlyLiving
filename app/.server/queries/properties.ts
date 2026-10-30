import {
  and,
  asc,
  desc,
  eq,
  gte,
  inArray,
  like,
  gt,
  lt,
  lte,
  ne,
  notExists,
  or,
  sql,
  type SQL,
} from "drizzle-orm";

import { nightsBetween } from "~/lib/dates";
import type { PhotoData, PropertyCardData, PropertyDetailData } from "~/lib/types";
import type { PropertyInput, StayFilters } from "~/lib/validation";

import type { Database } from "../db/client";
import {
  availabilityBlocks,
  properties,
  propertyPhotos,
  type Property,
} from "../db/schema";

const cardColumns = {
  id: properties.id,
  slug: properties.slug,
  name: properties.name,
  area: properties.area,
  propertyType: properties.propertyType,
  tag: properties.tag,
  rating: properties.rating,
  bedrooms: properties.bedrooms,
  bathrooms: properties.bathrooms,
  sleeps: properties.sleeps,
  monthlyPriceKes: properties.monthlyPriceKes,
};

type CardRow = { id: number } & Omit<PropertyCardData, "coverKey" | "coverAlt" | "coverWidth" | "coverHeight">;

/** Photos for the given properties, in display order, grouped by property. */
async function getPhotosByProperty(
  db: Database,
  propertyIds: number[],
): Promise<Map<number, PhotoData[]>> {
  const byProperty = new Map<number, PhotoData[]>();
  if (propertyIds.length === 0) return byProperty;

  const rows = await db
    .select({
      propertyId: propertyPhotos.propertyId,
      key: propertyPhotos.r2Key,
      alt: propertyPhotos.alt,
      width: propertyPhotos.width,
      height: propertyPhotos.height,
    })
    .from(propertyPhotos)
    .where(inArray(propertyPhotos.propertyId, propertyIds))
    .orderBy(asc(propertyPhotos.sortOrder), asc(propertyPhotos.id));

  for (const { propertyId, ...photo } of rows) {
    const list = byProperty.get(propertyId) ?? [];
    list.push(photo);
    byProperty.set(propertyId, list);
  }
  return byProperty;
}

async function withCovers(
  db: Database,
  rows: CardRow[],
): Promise<PropertyCardData[]> {
  const photos = await getPhotosByProperty(
    db,
    rows.map((r) => r.id),
  );
  return rows.map(({ id, ...row }) => {
    const cover = photos.get(id)?.[0];
    return { ...row, ...coverFields(cover, row.name) };
  });
}

/** The card's cover photo fields; the first photo is the cover. */
function coverFields(
  cover: PhotoData | undefined,
  name: string,
): Pick<PropertyCardData, "coverKey" | "coverAlt" | "coverWidth" | "coverHeight"> {
  return {
    coverKey: cover?.key ?? null,
    coverAlt: cover?.alt || name,
    coverWidth: cover?.width ?? null,
    coverHeight: cover?.height ?? null,
  };
}

export async function getFeaturedProperties(
  db: Database,
  limit: number,
): Promise<PropertyCardData[]> {
  const rows = await db
    .select(cardColumns)
    .from(properties)
    .where(eq(properties.isPublished, true))
    .orderBy(desc(properties.isFeatured), asc(properties.sortOrder))
    .limit(limit);
  return withCovers(db, rows);
}

export async function getPublishedProperties(
  db: Database,
  filters: StayFilters,
): Promise<PropertyCardData[]> {
  const conditions: SQL[] = [eq(properties.isPublished, true)];
  if (filters.q) {
    const term = `%${filters.q}%`;
    const textMatch = or(
      like(properties.name, term),
      like(properties.area, term),
      like(properties.propertyType, term),
    );
    if (textMatch) conditions.push(textMatch);
  }
  if (filters.area) conditions.push(eq(properties.area, filters.area));
  if (filters.beds) conditions.push(gte(properties.bedrooms, filters.beds));
  if (filters.max) conditions.push(lte(properties.monthlyPriceKes, filters.max));
  if (filters.guests) conditions.push(gte(properties.sleeps, filters.guests));
  if (filters.in && filters.out) {
    // Hide stays whose minimum is longer than the dates asked for.
    conditions.push(lte(properties.minNights, nightsBetween(filters.in, filters.out)));
    // Hide stays with any blocked night in [in, out).
    conditions.push(
      notExists(
        db
          .select({ id: availabilityBlocks.id })
          .from(availabilityBlocks)
          .where(
            and(
              eq(availabilityBlocks.propertyId, properties.id),
              lt(availabilityBlocks.startDate, filters.out),
              gt(availabilityBlocks.endDate, filters.in),
            ),
          ),
      ),
    );
  }

  const order =
    filters.sort === "price-low"
      ? [asc(properties.monthlyPriceKes)]
      : filters.sort === "price-high"
        ? [desc(properties.monthlyPriceKes)]
        : [asc(properties.sortOrder), asc(properties.id)];

  const rows = await db
    .select(cardColumns)
    .from(properties)
    .where(and(...conditions))
    .orderBy(...order);
  return withCovers(db, rows);
}

/** Distinct areas of published stays, for search and filter dropdowns. */
export async function getAreas(db: Database): Promise<string[]> {
  const rows = await db
    .selectDistinct({ area: properties.area })
    .from(properties)
    .where(eq(properties.isPublished, true))
    .orderBy(asc(properties.area));
  return rows.map((r) => r.area);
}

export async function getPropertyBySlug(
  db: Database,
  slug: string,
): Promise<PropertyDetailData | null> {
  const [property]: Property[] = await db
    .select()
    .from(properties)
    .where(and(eq(properties.slug, slug), eq(properties.isPublished, true)))
    .limit(1);
  if (!property) return null;

  const photos = (await getPhotosByProperty(db, [property.id])).get(property.id) ?? [];
  return {
    id: property.id,
    slug: property.slug,
    name: property.name,
    area: property.area,
    address: property.address,
    propertyType: property.propertyType,
    tag: property.tag,
    rating: property.rating,
    description: property.description,
    goodToKnow: property.goodToKnow,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    sleeps: property.sleeps,
    monthlyPriceKes: property.monthlyPriceKes,
    minNights: property.minNights,
    amenities: property.amenities,
    photos,
    ...coverFields(photos[0], property.name),
  };
}

/** Other published stays, same area first (concept: "Explore similar stays"). */
export async function getSimilarProperties(
  db: Database,
  property: { id: number; area: string },
  limit: number,
): Promise<PropertyCardData[]> {
  const rows = await db
    .select(cardColumns)
    .from(properties)
    .where(and(eq(properties.isPublished, true), ne(properties.id, property.id)))
    .orderBy(asc(properties.sortOrder));
  const sameAreaFirst = [
    ...rows.filter((r) => r.area === property.area),
    ...rows.filter((r) => r.area !== property.area),
  ].slice(0, limit);
  return withCovers(db, sameAreaFirst);
}

/** Published stay slugs and edit times for /sitemap.xml. */
export async function getSitemapProperties(
  db: Database,
): Promise<{ slug: string; updatedAt: string }[]> {
  return db
    .select({ slug: properties.slug, updatedAt: properties.updatedAt })
    .from(properties)
    .where(eq(properties.isPublished, true))
    .orderBy(asc(properties.sortOrder), asc(properties.id));
}

// ------------------------------------------------------------------ admin

export interface AdminPropertyRow {
  id: number;
  slug: string;
  name: string;
  area: string;
  monthlyPriceKes: number;
  isPublished: boolean;
  isFeatured: boolean;
  sortOrder: number;
  coverKey: string | null;
  photoCount: number;
}

/** Every property, published or not, for the dashboard list. */
export async function getAdminProperties(db: Database): Promise<AdminPropertyRow[]> {
  const rows = await db
    .select({
      id: properties.id,
      slug: properties.slug,
      name: properties.name,
      area: properties.area,
      monthlyPriceKes: properties.monthlyPriceKes,
      isPublished: properties.isPublished,
      isFeatured: properties.isFeatured,
      sortOrder: properties.sortOrder,
    })
    .from(properties)
    .orderBy(asc(properties.sortOrder), asc(properties.id));
  const photos = await getPhotosByProperty(
    db,
    rows.map((r) => r.id),
  );
  return rows.map((row) => {
    const list = photos.get(row.id) ?? [];
    return { ...row, coverKey: list[0]?.key ?? null, photoCount: list.length };
  });
}

/** Any property by id, published or not. */
export async function getPropertyById(db: Database, id: number): Promise<Property | null> {
  const [row] = await db.select().from(properties).where(eq(properties.id, id)).limit(1);
  return row ?? null;
}

/** All areas in use, including unpublished properties (for the area field's suggestions). */
export async function getAllAreas(db: Database): Promise<string[]> {
  const rows = await db
    .selectDistinct({ area: properties.area })
    .from(properties)
    .orderBy(asc(properties.area));
  return rows.map((r) => r.area);
}

/** True when another property already uses this slug. */
export async function isPropertySlugTaken(
  db: Database,
  slug: string,
  exceptId?: number,
): Promise<boolean> {
  const [row] = await db
    .select({ id: properties.id })
    .from(properties)
    .where(
      exceptId === undefined
        ? eq(properties.slug, slug)
        : and(eq(properties.slug, slug), ne(properties.id, exceptId)),
    )
    .limit(1);
  return row !== undefined;
}

export async function createProperty(db: Database, input: PropertyInput): Promise<number> {
  const [row] = await db.insert(properties).values(input).returning({ id: properties.id });
  return row.id;
}

export async function updateProperty(db: Database, id: number, input: PropertyInput): Promise<void> {
  await db
    .update(properties)
    .set({ ...input, updatedAt: sql`(CURRENT_TIMESTAMP)` })
    .where(eq(properties.id, id));
}

/** Id and name of every property, for dropdowns. */
export async function getPropertyOptions(db: Database): Promise<{ id: number; name: string }[]> {
  return db
    .select({ id: properties.id, name: properties.name })
    .from(properties)
    .orderBy(asc(properties.name));
}
