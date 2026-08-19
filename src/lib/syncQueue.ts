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
    let lastErr: unknown;
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      try {
        await run();
        return true;
      } catch (err) {
        lastErr = err;
        // Nothing to retry against while the device is offline — fail fast
        // and let the user know rather than burning the backoff budget.
        if (isOffline()) break;
        if (i < MAX_ATTEMPTS - 1) await sleep(BACKOFF_MS[i] ?? 1800);
      }
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
