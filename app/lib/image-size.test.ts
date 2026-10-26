import { describe, expect, it } from "vitest";

import logoJpeg from "../../design/logo-original.jpg?inline";
import iconPng from "../../public/brand/apple-touch-icon.png?inline";
import photoWebp from "../../scripts/seed-media/properties/11f3f516ba42dded022c86e0c984034d.webp?inline";

import { readImageSize } from "./image-size";

/** Bytes of a file imported as a base64 data URL. */
function bytesOf(dataUrl: string): Uint8Array {
  return Uint8Array.from(atob(dataUrl.slice(dataUrl.indexOf(",") + 1)), (c) => c.charCodeAt(0));
}

/** A RIFF/WEBP header with one chunk whose first payload bytes are `payload`. */
function webpHeader(chunk: string, payload: number[]): Uint8Array {
  const ascii = (s: string): number[] => [...s].map((c) => c.charCodeAt(0));
  const bytes = [...ascii("RIFF"), 0, 0, 0, 0, ...ascii("WEBP"), ...ascii(chunk), 0, 0, 0, 0, ...payload];
  while (bytes.length < 32) bytes.push(0);
  return new Uint8Array(bytes);
}

describe("readImageSize", () => {
  it("reads real JPEG, PNG and lossy WebP files", () => {
    expect(readImageSize(bytesOf(logoJpeg))).toEqual({ width: 1600, height: 1600 });
    expect(readImageSize(bytesOf(iconPng))).toEqual({ width: 180, height: 180 });
    expect(readImageSize(bytesOf(photoWebp))).toEqual({ width: 1208, height: 2000 });
  });

  it("reads lossless (VP8L) WebP", () => {
    // 924 x 2000: 14-bit (width - 1) then 14-bit (height - 1), little-endian.
    const bits = (924 - 1) | ((2000 - 1) << 14);
    const header = webpHeader("VP8L", [0x2f, bits & 0xff, (bits >> 8) & 0xff, (bits >> 16) & 0xff, (bits >> 24) & 0xff]);
    expect(readImageSize(header)).toEqual({ width: 924, height: 2000 });
  });

  it("reads extended (VP8X) WebP", () => {
    // Flags, then 24-bit (width - 1) and (height - 1): 2000 x 1360.
    const header = webpHeader("VP8X", [0x10, 0, 0, 0, 0xcf, 0x07, 0x00, 0x4f, 0x05, 0x00]);
    expect(readImageSize(header)).toEqual({ width: 2000, height: 1360 });
  });

  it("returns null for anything it can't read", () => {
    expect(readImageSize(new Uint8Array([1, 2, 3]))).toBeNull();
    expect(readImageSize(new TextEncoder().encode("GIF89a........................"))).toBeNull();
    expect(readImageSize(new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00]))).toBeNull();
  });
});
