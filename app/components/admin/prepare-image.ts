/**
 * Resizes a photo in the browser before upload (AGENTS.md section 8): at
 * most 2000px on the long side, saved as WebP. Browsers that can't encode
 * WebP (some Safari versions) get JPEG instead. If the browser can't read the
 * file at all, the original is sent and the server decides.
 */

const MAX_SIDE = 2000;
const QUALITY = 0.85;

function toBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, QUALITY));
}

export async function prepareImage(file: File): Promise<File> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }

  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    return file;
  }
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const base = file.name.replace(/\.[^.]+$/, "") || "photo";
  const webp = await toBlob(canvas, "image/webp");
  if (webp?.type === "image/webp") return new File([webp], `${base}.webp`, { type: "image/webp" });
  const jpeg = await toBlob(canvas, "image/jpeg");
  return jpeg ? new File([jpeg], `${base}.jpg`, { type: "image/jpeg" }) : file;
}
