/**
 * imageFile.ts
 *
 * Turning a picked file into something the app can actually keep.
 *
 * KYC uploads (Aadhaar xerox, customer photo) were read straight through
 * `FileReader.readAsDataURL` at full resolution. A phone camera photo is
 * 2–5 MB, and base64 inflates it by a third — so a handful of registrations
 * filled the browser's ~5 MB localStorage budget, at which point EVERY
 * subsequent write to the store failed.
 *
 * Downscaling to a size where the document is still legible costs nothing
 * for this use case (these are read on screen, not printed at A4) and takes
 * a typical upload from ~3 MB to ~150 KB.
 */

/** Longest edge, in pixels, kept after downscaling. Aadhaar text stays legible. */
const MAX_EDGE = 1400;
/** JPEG quality for the re-encode. */
const QUALITY = 0.75;
/** Files at or under this size are kept as-is — re-encoding would only add loss. */
const SKIP_BELOW_BYTES = 120 * 1024;

export interface StoredFile {
  name: string;
  url: string;
  size: string;
}

function formatSize(bytes: number): string {
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** Approximate decoded byte length of a data: URL's payload. */
export function dataUrlBytes(dataUrl: string): number {
  const comma = dataUrl.indexOf(",");
  if (comma === -1) return 0;
  const b64 = dataUrl.slice(comma + 1);
  const padding = b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0;
  return Math.max(0, Math.floor((b64.length * 3) / 4) - padding);
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error("Could not read the file"));
    reader.onloadend = () => resolve(String(reader.result ?? ""));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("The file is not a readable image"));
    img.src = src;
  });
}

/**
 * Read a picked file into a data URL, downscaling and re-encoding images that
 * are larger than they need to be.
 *
 * Non-images (and anything the browser can't decode) are passed through
 * untouched, so a PDF scan still works — it just stays its original size.
 */
export async function readFileForStorage(file: File): Promise<StoredFile> {
  const original = await readAsDataUrl(file);

  const isImage = file.type.startsWith("image/");
  if (!isImage || file.size <= SKIP_BELOW_BYTES) {
    return { name: file.name, url: original, size: formatSize(file.size) };
  }

  try {
    const img = await loadImage(original);
    const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
    const width = Math.max(1, Math.round(img.width * scale));
    const height = Math.max(1, Math.round(img.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return { name: file.name, url: original, size: formatSize(file.size) };

    // White backdrop: a transparent PNG would otherwise flatten to black.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    const compressed = canvas.toDataURL("image/jpeg", QUALITY);
    // Only take the re-encode if it actually helped.
    if (!compressed.startsWith("data:image/jpeg") || compressed.length >= original.length) {
      return { name: file.name, url: original, size: formatSize(file.size) };
    }
    return { name: file.name, url: compressed, size: formatSize(dataUrlBytes(compressed)) };
  } catch {
    return { name: file.name, url: original, size: formatSize(file.size) };
  }
}
