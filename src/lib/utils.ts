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
