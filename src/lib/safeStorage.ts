/**
 * safeStorage.ts
 *
 * The persistence layer both zustand stores write through.
 *
 * Why this exists: zustand's `persist` calls `localStorage.setItem` inline
 * from `set()`. localStorage throws QuotaExceededError once it fills up —
 * and this app puts base64 data URLs in there (customer Aadhaar scans,
 * photos, and a generated HTML invoice per customer), so filling it up is a
 * matter of a few dozen registrations, not a hypothetical.
 *
 * When it threw, the exception escaped `set()`, escaped the store action,
 * and escaped the button's click handler. The visible symptom was the
 * "Register Customer" dialog simply not closing: `addCustomer()` never
 * returned, so the `close()` on the line after it never ran — and the
 * record was silently lost too.
 *
 * A failed write must not take the in-memory update with it. Persistence is
 * a cache here (Google Sheets is the real database), so a write that cannot
 * land is reported once and then tolerated.
 */

import { toast } from "sonner";

let quotaWarned = false;

function warnOnce(err: unknown) {
  console.error("[safeStorage] Could not save to this browser's local storage:", err);
  if (quotaWarned) return;
  quotaWarned = true;
  toast.error("This browser's local storage is full", {
    description:
      "Your changes are still being saved to Google Sheets, but this device can no longer keep an offline copy. Removing old uploaded documents frees it up.",
    duration: 10000,
  });
}

/**
 * A `StateStorage` for zustand's `createJSONStorage` that never throws.
 * Reads that fail return null (treated as "nothing persisted"); writes that
 * fail are reported once and dropped.
 */
export const safeLocalStorage = {
  getItem: (name: string): string | null => {
    try {
      return typeof window === "undefined" ? null : window.localStorage.getItem(name);
    } catch (err) {
      console.warn("[safeStorage] read failed:", err);
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      if (typeof window === "undefined") return;
      window.localStorage.setItem(name, value);
    } catch (err) {
      warnOnce(err);
    }
  },
  removeItem: (name: string): void => {
    try {
      if (typeof window === "undefined") return;
      window.localStorage.removeItem(name);
    } catch (err) {
      console.warn("[safeStorage] remove failed:", err);
    }
  },
};
