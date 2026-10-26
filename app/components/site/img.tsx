import type { SyntheticEvent } from "react";

import { mediaUrl } from "~/lib/media";

interface ImgProps {
  /** R2 key, absolute URL or /public path. */
  src: string | null;
  alt: string;
  /** Intrinsic pixel size, when known (AGENTS.md section 8). CSS still sets the displayed size. */
  width?: number | null;
  height?: number | null;
  /** Above-the-fold images load eagerly (hero, first gallery photo). */
  eager?: boolean;
}

// Mirrors the concept's img() helper, including its soft fallback when an
// image fails to load.
function onImageError(event: SyntheticEvent<HTMLImageElement>): void {
  event.currentTarget.style.background = "#e9dfd0";
  event.currentTarget.style.opacity = ".3";
}

export function Img({ src, alt, width, height, eager = false }: ImgProps) {
  if (!src) return null;
  const url = src.startsWith("/") ? src : mediaUrl(src);
  return (
    <img
      src={url}
      alt={alt}
      width={width ?? undefined}
      height={height ?? undefined}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onError={onImageError}
    />
  );
}
