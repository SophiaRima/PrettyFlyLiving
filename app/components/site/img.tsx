import type { SyntheticEvent } from "react";

import { mediaSrcSet, mediaUrl } from "~/lib/media";

/**
 * `sizes` for photos in cards and tiles: full width on phones, a column
 * otherwise. On the full-width layout the widest card (Explore similar stays,
 * guide collages) is about a third of the screen, so 400px loaded the small
 * copy for 800px cards on large monitors.
 */
export const CARD_SIZES = "(max-width: 720px) 100vw, 33vw";

interface ImgProps {
  /** R2 key, absolute URL or /public path. */
  src: string | null;
  alt: string;
  /** Intrinsic pixel size, when known (AGENTS.md section 8). CSS still sets the displayed size. */
  width?: number | null;
  height?: number | null;
  /**
   * Rendered width hint. When set, uploads also offer their small copy via
   * srcset, so cards and tiles don't download the full-size photo.
   */
  sizes?: string;
  /** Explicit srcset for /public files (uploads build theirs from `sizes`). */
  srcSet?: string;
  /** Above-the-fold images load eagerly (hero, first gallery photo). */
  eager?: boolean;
  /** The page's likely LCP image: eager and fetched ahead of other images. */
  priority?: boolean;
}

// Mirrors the concept's img() helper, including its soft fallback when an
// image fails to load.
function onImageError(event: SyntheticEvent<HTMLImageElement>): void {
  event.currentTarget.style.background = "#e9dfd0";
  event.currentTarget.style.opacity = ".3";
}

export function Img({ src, alt, width, height, sizes, srcSet: fileSrcSet, eager = false, priority = false }: ImgProps) {
  if (!src) return null;
  const isPublicFile = src.startsWith("/");
  const url = isPublicFile ? src : mediaUrl(src);
  const srcSet = fileSrcSet ?? (sizes && !isPublicFile ? mediaSrcSet(src, width) : undefined);
  return (
    <img
      src={url}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      alt={alt}
      width={width ?? undefined}
      height={height ?? undefined}
      loading={eager || priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      onError={onImageError}
    />
  );
}
