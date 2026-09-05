/**
 * syncQueue.ts
 *
 * One place where every per-record write to Google Sheets goes.
 *
 * Two bugs this exists to fix:
 *
 *  1. SILENT WRITE FAILURES. Every mutator used to fire its upsert/delete and
 *     hang a bare `.catch(err => console.warn(...))` off it. The UI showed a
 *     success toast, the local (persisted) store updated, and a failed write —
 *     offline, Apps Script quota, bad deploy — left no trace anywhere the user
 *     would ever look. Records looked saved and simply were not on the sheet.
 *     Writes now retry with backoff and, if they still fail, say so out loud.
 *
 *  2. THE POLLER ATE UNSYNCED RECORDS. useRealtimeSync polls a digest every
 *     20s and full-replaces local state from the sheet. A record added locally
 *     but whose write hadn't landed yet was, to the poller, "a row the sheet
 *     doesn't have" — so it replaced local state and the just-added record
 *     vanished from the UI (with an "↩ Records removed (synced)" toast, no
 *     less). Reconciliation now skips any sheet with a write in flight, and
 *     for a short grace period after one lands, so the sheet has time to
 *     reflect it before we trust the sheet over local state.
 */

import { toast } from "sonner";
import type { SheetName } from "./googleSheets";
import { safeLocalStorage } from "./safeStorage";

/** Attempts per write before giving up and telling the user. */
const MAX_ATTEMPTS = 3;
/** Backoff between attempts (ms) — index i is the wait *before* attempt i+1. */
const BACKOFF_MS = [600, 1800];
/**
 * After a write resolves, keep treating its sheet as "busy" for this long.
 * Apps Script writes aren't instantly visible to a subsequent read, and the
 * poller must not conclude the row is missing during that window.
 */
const SETTLE_MS = 6_000;

/**
 * Sheets the Apps Script has told us it will not accept.
 *
 * A tab that is missing from ALLOWED_SHEETS in Code.gs fails instantly and
 * identically every time — retrying it is pointless, and the poller re-offers
 * every un-synced local record every 20s, so without this the user gets an
 * error toast per record per poll, forever. Fail it once, say what to do
 * about it, then stay quiet for the rest of the session.
 */
const unavailableSheets = new Set<string>();

/** True if the deployed Apps Script has rejected this sheet as not allowed. */
export function isSheetUnavailable(sheet: string): boolean {
  return unavailableSheets.has(sheet);
}

function isSheetNotAllowed(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err ?? "");
  return /sheet not allowed/i.test(msg);
}

/** In-flight write count per sheet. */
const inFlight = new Map<string, number>();
/** Timestamp (ms) when a sheet's last write settled. */
const settledAt = new Map<string, number>();

/** Sheets that currently have unsynced local work — the poller must not
 *  overwrite local state for these. */
export function isSheetBusy(sheet: string): boolean {
  if ((inFlight.get(sheet) ?? 0) > 0) return true;
  const t = settledAt.get(sheet);
  return t !== undefined && Date.now() - t < SETTLE_MS;
}

/** True if ANY sheet has pending local writes. */
export function hasPendingWrites(): boolean {
  for (const [, n] of inFlight) if (n > 0) return true;
  for (const [, t] of settledAt) if (Date.now() - t < SETTLE_MS) return true;
  return false;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function isOffline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

/**
 * Run one sheet write with retries, marking its sheet busy for the duration.
 *
 * Deliberately NOT awaited by mutators: the local store update stays optimistic
 * so the app keeps working offline. What changed is that failure is now visible
 * instead of being swallowed into console.warn.
 */
export function enqueueWrite(
  sheet: SheetName,
  label: string,
  run: () => Promise<void>
): Promise<boolean> {
  inFlight.set(sheet, (inFlight.get(sheet) ?? 0) + 1);

  const attempt = async (): Promise<boolean> => {
    // Already known-rejected by the deployed script — don't retry or re-toast.
    if (unavailableSheets.has(sheet)) return false;

    let lastErr: unknown;
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      try {
        await run();
        return true;
      } catch (err) {
        lastErr = err;
        // A tab the script doesn't whitelist will never succeed — retrying
        // just multiplies the noise.
        if (isSheetNotAllowed(err)) break;
        // Nothing to retry against while the device is offline — fail fast
        // and let the user know rather than burning the backoff budget.
        if (isOffline()) break;
        if (i < MAX_ATTEMPTS - 1) await sleep(BACKOFF_MS[i] ?? 1800);
      }
    }

    if (isSheetNotAllowed(lastErr)) {
      unavailableSheets.add(sheet);
      console.error(`[SyncQueue] ${sheet} is not whitelisted by the deployed Apps Script.`);
      toast.error(`Google Sheet "${sheet}" is not set up yet`, {
        description:
          "Re-deploy the Apps Script (Code.gs) from this project so it accepts this tab. Until then these records are saved on this device only.",
        duration: 12000,
      });
      return false;
    }

    const detail = lastErr instanceof Error ? lastErr.message : String(lastErr ?? "");
    console.error(`[SyncQueue] ${label} → ${sheet} failed after retries:`, lastErr);
    toast.error(`Not saved to Google Sheets: ${label}`, {
      description: isOffline()
        ? "You appear to be offline. The change is saved on this device — reopen the app once you're back online to retry."
        : `The change is saved on this device only. ${detail || "The sheet could not be reached."}`,
      duration: 8000,
    });
    return false;
  };

  return attempt().finally(() => {
    const n = (inFlight.get(sheet) ?? 1) - 1;
    inFlight.set(sheet, Math.max(0, n));
    settledAt.set(sheet, Date.now());
  });
}

/**
 * IDs this device has positively observed on the sheet.
 *
 * THE BUG THIS FIXES: a delete never stuck across devices. safeReconcile treats
 * "local record the sheet doesn't have" as "a record that hasn't synced yet"
 * and re-uploads it. So when device A deleted a customer, device B — which
 * still had that customer locally and had no idea it was ever deleted — put the
 * row straight back on the sheet at its next 20-second poll, and device A got
 * it back too. Deleting anything was effectively impossible with two devices in
 * the shop.
 *
 * The missing piece was a way to tell those two cases apart, which needs
 * memory: a record that USED to be on the sheet and now isn't was deleted by
 * someone; a record that has never been on the sheet is genuinely unsynced.
 * That is exactly what this set records. It is persisted, because a page reload
 * would otherwise reset the distinction and resurrect the record anyway.
 */
const SEEN_IDS_KEY = "jain-sync-seen-ids";
/** Upper bound per sheet, so this can never grow without limit. */
const MAX_SEEN_PER_SHEET = 20_000;

let seenCache: Map<string, Set<string>> | null = null;

function loadSeen(): Map<string, Set<string>> {
  if (seenCache) return seenCache;
  seenCache = new Map();
  const raw = safeLocalStorage.getItem(SEEN_IDS_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Record<string, string[]>;
      for (const [sheet, ids] of Object.entries(parsed)) {
        if (Array.isArray(ids)) seenCache.set(sheet, new Set(ids));
      }
    } catch {
      // Corrupt entry — start over rather than blocking sync.
    }
  }
  return seenCache;
}

function persistSeen(): void {
  const out: Record<string, string[]> = {};
  for (const [sheet, ids] of loadSeen()) out[sheet] = [...ids];
  safeLocalStorage.setItem(SEEN_IDS_KEY, JSON.stringify(out));
}

/** Record every id a successful sheet read returned. */
export function recordSheetIds(sheet: string, ids: string[]): void {
  if (ids.length === 0) return;
  const all = loadSeen();
  let set = all.get(sheet);
  if (!set) {
    set = new Set();
    all.set(sheet, set);
  }
  let added = false;
  for (const id of ids) {
    if (id && !set.has(id)) {
      set.add(id);
      added = true;
    }
  }
  if (!added) return;
  if (set.size > MAX_SEEN_PER_SHEET) {
    // Sets iterate in insertion order, so this drops the oldest entries.
    const trimmed = [...set].slice(set.size - MAX_SEEN_PER_SHEET);
    all.set(sheet, new Set(trimmed));
  }
  persistSeen();
}

/** True if a successful read of this sheet has ever returned this id. */
export function wasSeenOnSheet(sheet: string, id: string): boolean {
  return loadSeen().get(sheet)?.has(id) ?? false;
}

/** Registry of IDs explicitly deleted by the user on this device. */
const deletedIdsRegistry = new Set<string>();

export function markIdDeleted(sheet: string, id: string) {
  if (sheet && id) {
    deletedIdsRegistry.add(`${sheet}::${id}`);
  }
}

export function isIdDeleted(sheet: string, id: string): boolean {
  return deletedIdsRegistry.has(`${sheet}::${id}`);
}

/** Clear all tracked seen IDs, deleted IDs, and in-flight/settled states (used when clearing database). */
export function clearSyncState(): void {
  seenCache = new Map();
  deletedIdsRegistry.clear();
  inFlight.clear();
  settledAt.clear();
  safeLocalStorage.removeItem(SEEN_IDS_KEY);
}


