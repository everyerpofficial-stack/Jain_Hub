import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate the next sequential "<prefix>NNN" id by scanning existing ids for
 * the highest numeric suffix. Using array length instead of a max-scan makes
 * ids collide with an existing record as soon as anything has been deleted
 * (e.g. delete the 2nd of 3 records, then add one — length-based id reuses
 * the deleted one's id), silently merging the new record with an old one on
 * any later edit/delete-by-id. Always prefer this over `array.length + 1`.
 */
export function nextSeqId(prefix: string, existingIds: string[]): string {
  const max = existingIds.reduce((m, id) => {
    const n = parseInt(id.slice(prefix.length), 10);
    return Number.isNaN(n) ? m : Math.max(m, n);
  }, 0);
  return prefix + (max + 1).toString().padStart(3, "0");
}

/**
 * Escape a value for interpolation into an HTML string.
 *
 * Every "print" / "download PDF" path in this app builds an HTML document by
 * template literal and hands it to `document.write()` on a `window.open("")`
 * popup — which is a SAME-ORIGIN document. Anything interpolated there runs
 * with full access to this app's localStorage (the whole customer/staff
 * database, including staff password hashes and the signed-in session).
 *
 * The values being interpolated are customer names, villages, remarks, IMEIs
 * and so on. Those come from operator input AND from the shared Google Sheet,
 * which is writable by anyone who has the Web App URL — so a hostile value
 * reaching a print template is a realistic stored-XSS path, not a theoretical
 * one. Route EVERY dynamic value in an HTML template through this.
 */
export function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
