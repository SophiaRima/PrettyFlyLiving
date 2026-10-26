/**
 * Pixel size of a JPEG, PNG or WebP image, read from its header bytes, so
 * uploads can store width/height without an image library (AGENTS.md
 * section 8). Returns null when the header can't be read.
 *
 * JPEG EXIF orientation is not applied. Dashboard uploads are re-encoded in
 * the browser first, which bakes the rotation in.
 */

export interface ImageSize {
  width: number;
  height: number;
}

function u16be(b: Uint8Array, i: number): number {
  return (b[i] << 8) | b[i + 1];
}

function u16le(b: Uint8Array, i: number): number {
  return b[i] | (b[i + 1] << 8);
}

function u24le(b: Uint8Array, i: number): number {
  return b[i] | (b[i + 1] << 8) | (b[i + 2] << 16);
}

function u32be(b: Uint8Array, i: number): number {
  return ((b[i] << 24) | (b[i + 1] << 16) | (b[i + 2] << 8) | b[i + 3]) >>> 0;
}

function ascii(b: Uint8Array, start: number, length: number): string {
  return String.fromCharCode(...b.subarray(start, start + length));
}

function valid(width: number, height: number): ImageSize | null {
  return width > 0 && height > 0 ? { width, height } : null;
}

function pngSize(b: Uint8Array): ImageSize | null {
  if (b.length < 24 || ascii(b, 12, 4) !== "IHDR") return null;
  return valid(u32be(b, 16), u32be(b, 20));
}

/** Start-of-frame markers carry the size; DHT (C4), JPG (C8) and DAC (CC) don't. */
function isStartOfFrame(marker: number): boolean {
  return marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
}

function jpegSize(b: Uint8Array): ImageSize | null {
  let i = 2;
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) return null;
    const marker = b[i + 1];
    if (marker === 0xff) {
      i++; // fill byte
      continue;
    }
    // Markers without a length field.
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd9)) {
      i += 2;
      continue;
    }
    if (isStartOfFrame(marker)) return valid(u16be(b, i + 7), u16be(b, i + 5));
    i += 2 + u16be(b, i + 2);
  }
  return null;
}

function webpSize(b: Uint8Array): ImageSize | null {
  if (b.length < 30) return null;
  switch (ascii(b, 12, 4)) {
    case "VP8 ": // lossy
      return valid(u16le(b, 26) & 0x3fff, u16le(b, 28) & 0x3fff);
    case "VP8L": // lossless: 14-bit width - 1, then 14-bit height - 1
      if (b[20] !== 0x2f) return null;
      return valid(
        1 + (((b[22] & 0x3f) << 8) | b[21]),
        1 + (((b[24] & 0x0f) << 10) | (b[23] << 2) | ((b[22] & 0xc0) >> 6)),
      );
    case "VP8X": // extended: 24-bit canvas width - 1 and height - 1
      return valid(1 + u24le(b, 24), 1 + u24le(b, 27));
    default:
      return null;
  }
}

export function readImageSize(bytes: Uint8Array): ImageSize | null {
  if (bytes[0] === 0x89 && ascii(bytes, 1, 3) === "PNG") return pngSize(bytes);
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return jpegSize(bytes);
  if (ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 4) === "WEBP") return webpSize(bytes);
  return null;
}
