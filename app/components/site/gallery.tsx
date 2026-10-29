import { useCallback, useEffect, useRef, useState } from "react";

import { mediaUrl } from "~/lib/media";
import type { PhotoData } from "~/lib/types";

import { Img } from "./img";

const GRID_SIZE = 5;

/**
 * The concept's 5-photo `.gallery`. Every photo opens the viewer, which can
 * step through the whole set; extra photos show as "+N" on the last tile.
 */
export function Gallery({ photos, name }: { photos: PhotoData[]; name: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  // The tile that opened the viewer gets focus back when it closes.
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const shown = photos.slice(0, GRID_SIZE);
  const hidden = photos.length - shown.length;
  const close = useCallback(() => {
    setOpenIndex(null);
    openerRef.current?.focus();
  }, []);

  return (
    <>
      <div className="gallery">
        {shown.map((photo, i) => {
          const isLast = i === shown.length - 1 && hidden > 0;
          return (
            <button
              key={photo.key}
              type="button"
              className={isLast ? "gallery-more" : undefined}
              aria-label={
                isLast
                  ? `+${hidden} photos: view all ${photos.length}`
                  : `View photo ${i + 1} of ${photos.length}`
              }
              onClick={(event) => {
                openerRef.current = event.currentTarget;
                setOpenIndex(i);
              }}
            >
              <Img
                src={photo.key}
                alt={photo.alt || `${name} photo ${i + 1}`}
                width={photo.width}
                height={photo.height}
                sizes={i === 0 ? "(max-width: 720px) 100vw, 500px" : "(max-width: 720px) 50vw, 250px"}
                eager={i === 0}
              />
              {isLast && <span className="gallery-more-label">+{hidden} photos</span>}
            </button>
          );
        })}
      </div>
      {openIndex !== null && (
        <ImageModal
          photos={photos}
          index={openIndex}
          onIndexChange={setOpenIndex}
          onClose={close}
        />
      )}
    </>
  );
}

interface ImageModalProps {
  photos: PhotoData[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

function ImageModal({ photos, index, onIndexChange, onClose }: ImageModalProps) {
  const count = photos.length;
  const photo = photos[index];

  useEffect(() => {
    function onKey(event: KeyboardEvent): void {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") onIndexChange((index + 1) % count);
      if (event.key === "ArrowLeft") onIndexChange((index - 1 + count) % count);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, count, onClose, onIndexChange]);

  return (
    <div
      className="modal open image-modal"
      role="dialog"
      aria-modal="true"
      aria-label={`Photo ${index + 1} of ${count}`}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="modal-inner">
        <button className="modal-close" type="button" aria-label="Close" onClick={onClose} autoFocus>
          ×
        </button>
        {/* Keyed so each photo remounts and fades in as the guest steps through. */}
        <img
          key={photo.key}
          src={mediaUrl(photo.key)}
          alt={photo.alt || `Photo ${index + 1}`}
          width={photo.width ?? undefined}
          height={photo.height ?? undefined}
        />
        {count > 1 && (
          <>
            <button
              type="button"
              className="modal-nav prev"
              aria-label="Previous photo"
              onClick={() => onIndexChange((index - 1 + count) % count)}
            >
              ‹
            </button>
            <button
              type="button"
              className="modal-nav next"
              aria-label="Next photo"
              onClick={() => onIndexChange((index + 1) % count)}
            >
              ›
            </button>
            <div className="modal-count">
              {index + 1} / {count}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
