/**
 * View models passed from loaders to public components. Kept outside
 * app/.server so components never import server code (AGENTS.md section 4).
 */

export interface PropertyCardData {
  slug: string;
  name: string;
  area: string;
  propertyType: string;
  tag: string | null;
  rating: number | null;
  bedrooms: number;
  bathrooms: number;
  sleeps: number;
  monthlyPriceKes: number;
  coverKey: string | null;
  coverAlt: string;
}

export interface PhotoData {
  key: string;
  alt: string;
}

export interface PropertyDetailData extends PropertyCardData {
  id: number;
  address: string;
  description: string;
  goodToKnow: string | null;
  minNights: number;
  amenities: string[];
  photos: PhotoData[];
}

export interface ReviewData {
  id: number;
  guestName: string;
  context: string | null;
  body: string;
  rating: number;
}

export interface GuideCardData {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  coverKey: string | null;
  /** Tag chips on the Things to Do card. */
  highlights: string[];
  /** Cover first, then the guide's gallery photos in order. */
  photos: PhotoData[];
}

export interface GuideDetailData extends GuideCardData {
  bodyHtml: string;
}

export interface FaqData {
  id: number;
  question: string;
  answer: string;
}

export interface ExtraServiceData {
  id: number;
  eyebrow: string | null;
  title: string;
  description: string;
  details: string | null;
  ctaLabel: string | null;
  imageKey: string | null;
}
