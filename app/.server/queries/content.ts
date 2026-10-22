import { and, asc, desc, eq, inArray, like, max, ne, or, sql, type SQL } from "drizzle-orm";

import { moveItem } from "~/lib/admin";
import type {
  ExtraServiceData,
  FaqData,
  GuideCardData,
  GuideDetailData,
  PhotoData,
  ReviewData,
} from "~/lib/types";
import type {
  ExtraServiceInput,
  FaqInput,
  GuideFilters,
  GuideInput,
  ReviewInput,
} from "~/lib/validation";

import type { Database } from "../db/client";
import {
  extraServices,
  faqs,
  guidePhotos,
  guides,
  reviews,
  type ExtraService,
  type Faq,
  type Guide,
  type Review,
} from "../db/schema";
import { renderGuideMarkdown } from "../markdown";

// -------------------------------------------------------------------- reviews

const reviewColumns = {
  id: reviews.id,
  guestName: reviews.guestName,
  context: reviews.context,
  body: reviews.body,
  rating: reviews.rating,
};

export async function getFeaturedReview(db: Database): Promise<ReviewData | null> {
  const [review] = await db
    .select(reviewColumns)
    .from(reviews)
    .where(eq(reviews.isPublished, true))
    .orderBy(desc(reviews.isFeatured), asc(reviews.sortOrder))
    .limit(1);
  return review ?? null;
}

export async function getPublishedReviews(db: Database): Promise<ReviewData[]> {
  return db
    .select(reviewColumns)
    .from(reviews)
    .where(eq(reviews.isPublished, true))
    .orderBy(asc(reviews.sortOrder), asc(reviews.id));
}

// --------------------------------------------------------------------- guides

const guideCardColumns = {
  id: guides.id,
  slug: guides.slug,
  title: guides.title,
  category: guides.category,
  excerpt: guides.excerpt,
  coverKey: guides.coverR2Key,
  highlights: guides.highlights,
};

type GuideRow = { id: number } & Omit<GuideCardData, "photos">;

/** Adds each guide's gallery: the cover first, then its guide_photos. */
async function withPhotos(db: Database, rows: GuideRow[]): Promise<GuideCardData[]> {
  const byGuide = new Map<number, PhotoData[]>();
  if (rows.length > 0) {
    const photos = await db
      .select({ guideId: guidePhotos.guideId, key: guidePhotos.r2Key, alt: guidePhotos.alt })
      .from(guidePhotos)
      .where(inArray(guidePhotos.guideId, rows.map((r) => r.id)))
      .orderBy(asc(guidePhotos.sortOrder), asc(guidePhotos.id));
    for (const photo of photos) {
      const list = byGuide.get(photo.guideId) ?? [];
      list.push({ key: photo.key, alt: photo.alt });
      byGuide.set(photo.guideId, list);
    }
  }
  return rows.map(({ id, ...row }) => {
    const cover: PhotoData[] = row.coverKey ? [{ key: row.coverKey, alt: row.title }] : [];
    const gallery = (byGuide.get(id) ?? []).filter((p) => p.key !== row.coverKey);
    return { ...row, photos: [...cover, ...gallery] };
  });
}

export async function getFeaturedGuides(
  db: Database,
  limit: number,
): Promise<GuideCardData[]> {
  const rows = await db
    .select(guideCardColumns)
    .from(guides)
    .where(eq(guides.isPublished, true))
    .orderBy(desc(guides.isFeatured), asc(guides.sortOrder))
    .limit(limit);
  return withPhotos(db, rows);
}

export async function getPublishedGuides(
  db: Database,
  filters: GuideFilters,
): Promise<GuideCardData[]> {
  const conditions: SQL[] = [eq(guides.isPublished, true)];
  if (filters.category) conditions.push(eq(guides.category, filters.category));
  if (filters.q) {
    const term = `%${filters.q}%`;
    const textMatch = or(
      like(guides.title, term),
      like(guides.category, term),
      like(guides.excerpt, term),
      like(guides.highlights, term),
    );
    if (textMatch) conditions.push(textMatch);
  }
  const rows = await db
    .select(guideCardColumns)
    .from(guides)
    .where(and(...conditions))
    .orderBy(asc(guides.sortOrder), asc(guides.id));
  return withPhotos(db, rows);
}

export async function getGuideBySlug(
  db: Database,
  slug: string,
): Promise<GuideDetailData | null> {
  const [guide] = await db
    .select({ ...guideCardColumns, bodyMd: guides.bodyMd })
    .from(guides)
    .where(and(eq(guides.slug, slug), eq(guides.isPublished, true)))
    .limit(1);
  if (!guide) return null;
  const { bodyMd, ...row } = guide;
  const [card] = await withPhotos(db, [row]);
  return { ...card, bodyHtml: renderGuideMarkdown(bodyMd) };
}

// ----------------------------------------------------------------------- faqs

export async function getFaqs(
  db: Database,
  audience: "guest" | "owner",
): Promise<FaqData[]> {
  return db
    .select({ id: faqs.id, question: faqs.question, answer: faqs.answer })
    .from(faqs)
    .where(and(eq(faqs.audience, audience), eq(faqs.isPublished, true)))
    .orderBy(asc(faqs.sortOrder), asc(faqs.id));
}

// ------------------------------------------------------------- extra services

export async function getExtraServices(db: Database): Promise<ExtraServiceData[]> {
  return db
    .select({
      id: extraServices.id,
      title: extraServices.title,
      description: extraServices.description,
      imageKey: extraServices.imageR2Key,
    })
    .from(extraServices)
    .where(eq(extraServices.isPublished, true))
    .orderBy(asc(extraServices.sortOrder), asc(extraServices.id));
}

// ------------------------------------------------------------------ admin

type SortableTable = typeof faqs | typeof reviews | typeof extraServices;

const sortableTables = { faqs, reviews, extraServices } as const;
export type SortableList = keyof typeof sortableTables;

/** Saves a new order for a sortable list (ids in display order). */
async function reorderRows(db: Database, table: SortableTable, orderedIds: number[]): Promise<void> {
  const updates = orderedIds.map((id, index) =>
    db.update(table).set({ sortOrder: index }).where(eq(table.id, id)),
  );
  const [first, ...rest] = updates;
  if (first) await db.batch([first, ...rest]);
}

/**
 * Moves one item up (-1) or down (+1) within its list. `orderedIds` is the
 * list as shown. Returns false if the id isn't in it.
 */
export async function moveRow(
  db: Database,
  list: SortableList,
  orderedIds: number[],
  id: number,
  direction: -1 | 1,
): Promise<boolean> {
  const index = orderedIds.indexOf(id);
  if (index === -1) return false;
  await reorderRows(db, sortableTables[list], moveItem(orderedIds, id, index + direction));
  return true;
}

/** Next sort position, so new items go to the end of their list. */
async function nextSortOrder(db: Database, table: SortableTable | typeof guides, where?: SQL): Promise<number> {
  const [row] = await db.select({ last: max(table.sortOrder) }).from(table).where(where);
  return (row?.last ?? -1) + 1;
}

// FAQs

export async function getAdminFaqs(db: Database, audience: "guest" | "owner"): Promise<Faq[]> {
  return db
    .select()
    .from(faqs)
    .where(eq(faqs.audience, audience))
    .orderBy(asc(faqs.sortOrder), asc(faqs.id));
}

export async function getFaqById(db: Database, id: number): Promise<Faq | null> {
  const [row] = await db.select().from(faqs).where(eq(faqs.id, id)).limit(1);
  return row ?? null;
}

export async function createFaq(db: Database, input: FaqInput): Promise<void> {
  const sortOrder = await nextSortOrder(db, faqs, eq(faqs.audience, input.audience));
  await db.insert(faqs).values({ ...input, sortOrder });
}

export async function updateFaq(db: Database, id: number, input: Omit<FaqInput, "audience">): Promise<void> {
  await db
    .update(faqs)
    .set({ question: input.question, answer: input.answer, isPublished: input.isPublished })
    .where(eq(faqs.id, id));
}

export async function deleteFaq(db: Database, id: number): Promise<void> {
  await db.delete(faqs).where(eq(faqs.id, id));
}

// Reviews

export async function getAdminReviews(db: Database): Promise<Review[]> {
  return db.select().from(reviews).orderBy(asc(reviews.sortOrder), asc(reviews.id));
}

export async function createReview(db: Database, input: ReviewInput): Promise<void> {
  await db.insert(reviews).values({ ...input, sortOrder: await nextSortOrder(db, reviews) });
}

export async function updateReview(db: Database, id: number, input: ReviewInput): Promise<void> {
  await db.update(reviews).set(input).where(eq(reviews.id, id));
}

export async function deleteReview(db: Database, id: number): Promise<void> {
  await db.delete(reviews).where(eq(reviews.id, id));
}

// Extra services

export async function getAdminExtraServices(db: Database): Promise<ExtraService[]> {
  return db.select().from(extraServices).orderBy(asc(extraServices.sortOrder), asc(extraServices.id));
}

export async function createExtraService(db: Database, input: ExtraServiceInput): Promise<void> {
  await db.insert(extraServices).values({ ...input, sortOrder: await nextSortOrder(db, extraServices) });
}

export async function updateExtraService(db: Database, id: number, input: ExtraServiceInput): Promise<void> {
  await db.update(extraServices).set(input).where(eq(extraServices.id, id));
}

/** Sets the photo and returns the previous key, so it can be cleaned up. */
export async function setExtraServiceImage(db: Database, id: number, key: string): Promise<string | null> {
  const [old] = await db
    .select({ key: extraServices.imageR2Key })
    .from(extraServices)
    .where(eq(extraServices.id, id))
    .limit(1);
  await db.update(extraServices).set({ imageR2Key: key }).where(eq(extraServices.id, id));
  return old?.key ?? null;
}

/** Removes a service and returns its photo key. */
export async function deleteExtraService(db: Database, id: number): Promise<string | null> {
  const [row] = await db
    .delete(extraServices)
    .where(eq(extraServices.id, id))
    .returning({ key: extraServices.imageR2Key });
  return row?.key ?? null;
}

// Guides

export interface AdminGuideRow {
  id: number;
  slug: string;
  title: string;
  category: string;
  coverKey: string | null;
  isPublished: boolean;
  isFeatured: boolean;
  sortOrder: number;
}

export async function getAdminGuides(db: Database): Promise<AdminGuideRow[]> {
  return db
    .select({
      id: guides.id,
      slug: guides.slug,
      title: guides.title,
      category: guides.category,
      coverKey: guides.coverR2Key,
      isPublished: guides.isPublished,
      isFeatured: guides.isFeatured,
      sortOrder: guides.sortOrder,
    })
    .from(guides)
    .orderBy(asc(guides.sortOrder), asc(guides.id));
}

export async function getGuideById(db: Database, id: number): Promise<Guide | null> {
  const [row] = await db.select().from(guides).where(eq(guides.id, id)).limit(1);
  return row ?? null;
}

export async function isGuideSlugTaken(db: Database, slug: string, exceptId?: number): Promise<boolean> {
  const [row] = await db
    .select({ id: guides.id })
    .from(guides)
    .where(exceptId === undefined ? eq(guides.slug, slug) : and(eq(guides.slug, slug), ne(guides.id, exceptId)))
    .limit(1);
  return row !== undefined;
}

export async function createGuide(db: Database, input: GuideInput): Promise<number> {
  const [row] = await db.insert(guides).values(input).returning({ id: guides.id });
  return row.id;
}

export async function updateGuide(db: Database, id: number, input: GuideInput): Promise<void> {
  await db
    .update(guides)
    .set({ ...input, updatedAt: sql`(CURRENT_TIMESTAMP)` })
    .where(eq(guides.id, id));
}

/** Sets the cover photo and returns the previous key. */
export async function setGuideCover(db: Database, id: number, key: string | null): Promise<string | null> {
  const [old] = await db.select({ key: guides.coverR2Key }).from(guides).where(eq(guides.id, id)).limit(1);
  await db
    .update(guides)
    .set({ coverR2Key: key, updatedAt: sql`(CURRENT_TIMESTAMP)` })
    .where(eq(guides.id, id));
  return old?.key ?? null;
}

/** Removes a guide (its gallery rows go with it) and returns every photo key it used. */
export async function deleteGuide(db: Database, id: number): Promise<string[]> {
  const photos = await db.select({ key: guidePhotos.r2Key }).from(guidePhotos).where(eq(guidePhotos.guideId, id));
  const [row] = await db.delete(guides).where(eq(guides.id, id)).returning({ cover: guides.coverR2Key });
  if (!row) return [];
  return [row.cover, ...photos.map((p) => p.key)].filter((key): key is string => key !== null);
}
