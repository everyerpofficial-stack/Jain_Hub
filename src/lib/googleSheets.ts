/**
 * googleSheets.ts
 * Client-side utilities to sync app data with Google Sheets
 * via a Google Apps Script Web App deployment.
 *
 * WHY GET FOR WRITES?
 *   Google Apps Script redirects POST from script.google.com → script.googleusercontent.com.
 *   Browsers block this cross-origin redirect (CORS preflight failure → "Failed to fetch").
 *   GET requests do NOT trigger preflight, so they follow the redirect cleanly.
 *   We encode the payload as a URL parameter to work around this.
 *
 * How it works:
 *   GET ?action=read&sheet=<name>                    → read all rows
 *   GET ?action=write&sheet=<name>&payload=<b64json> → write all rows
 *   GET ?action=append&sheet=<name>&payload=<b64json>→ append rows
 *   GET ?action=ping                                 → health check
 *   GET ?action=sendOtp&email=X&otp=Y               → send OTP email
 */

export interface SheetsConfig {
  /** Deployed Apps Script Web App URL (from "Deploy > New deployment") */
  url: string;
  /** Whether syncing is enabled */
  enabled: boolean;
  /** Optional label for the last successful sync timestamp */
  lastSync?: string;
}

export type SheetName =
  | "Finance_Customers"
  | "Finance_Payments"
  | "Finance_Expenses"
  | "Finance_Investments"
  | "Finance_ProfitTransactions"
  | "Finance_Staff"
  | "Mobiles_Sales"
  | "Mobiles_Purchases"
  | "Mobiles_Expenses"
  | "Mobiles_Suppliers"
  | "Mobiles_SupplierPayments"
  | "Mobiles_Customers"
  | "Mobiles_Products"
  | "Mobiles_Accessories"
  | "Mobiles_WarrantyClaims";

/** Generic row — each value is serialised to string in the sheet */
export type SheetRow = Record<string, string | number | boolean | undefined | null>;

/** Max bytes per GET request chunk (URL limit safety) */
const CHUNK_BYTES = 40_000;

/**
 * Shared secret sent with every data request, checked by Code.gs against
 * its Script Property "API_KEY" (see google-apps-script/Code.gs setup
 * notes). Set VITE_SHEETS_API_KEY in .env to enable this check — until
 * then Code.gs runs with no key requirement, matching prior behavior.
 */
function getApiKey(): string {
  return (import.meta.env.VITE_SHEETS_API_KEY as string) || "";
}

/**
 * Safely base64-encode a string (works in all browsers)
 */
function b64Encode(str: string): string {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch {
    return btoa(str);
  }
}

/**
 * Internal GET-based request to the Apps Script web app.
 * All writes use GET to avoid the POST redirect CORS block.
 */
async function getFromScript(
  url: string,
  params: Record<string, string>
): Promise<Record<string, unknown>> {
  const apiKey = getApiKey();
  const allParams = apiKey ? { ...params, key: apiKey } : params;
  const qs = Object.entries(allParams)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");

  const fetchUrl = `${url}?${qs}`;

  const response = await fetch(fetchUrl, {
    method: "GET",
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(`Sheets request failed: HTTP ${response.status}`);
  }

  const result = await response.json();
  if (result.status !== "ok") {
    throw new Error(result.error || "Unknown Apps Script error");
  }

  return result as Record<string, unknown>;
}

/**
 * Write rows to a sheet in chunks to stay within URL length limits.
 * Each chunk sends a batch of rows encoded as base64 JSON.
 */
async function writeChunked(
  url: string,
  action: "write" | "append",
  sheet: SheetName,
  rows: SheetRow[]
): Promise<void> {
  if (rows.length === 0) return;

  // Split rows into chunks that fit within URL limits
  const chunks: SheetRow[][] = [];
  let current: SheetRow[] = [];
  let size = 0;

  for (const row of rows) {
    const rowStr = JSON.stringify(row);
    if (size + rowStr.length > CHUNK_BYTES && current.length > 0) {
      chunks.push(current);
      current = [];
      size = 0;
    }
    current.push(row);
    size += rowStr.length;
  }
  if (current.length > 0) chunks.push(current);

  // First chunk: use the requested action (write/append)
  // Subsequent chunks: always append (to add to what was written)
  for (let i = 0; i < chunks.length; i++) {
    const chunkAction = i === 0 ? action : "append";
    const payload = b64Encode(JSON.stringify(chunks[i]));
    await getFromScript(url, {
      action: chunkAction,
      sheet,
      payload,
    });
  }
}

/**
 * GET all rows from a specific sheet tab.
 * Returns an array of row objects keyed by column headers (first row).
 */
export async function readSheet(
  url: string,
  sheet: SheetName
): Promise<SheetRow[]> {
  const result = await getFromScript(url, { action: "read", sheet });
  return (result.rows as SheetRow[]) ?? [];
}

/**
 * Append a single row to a sheet.
 * Used for incremental writes (new customer, new payment, etc.)
 */
export async function appendRow(
  url: string,
  sheet: SheetName,
  row: SheetRow
): Promise<void> {
  await writeChunked(url, "append", sheet, [row]);
}

/**
 * Update-or-insert a single row by its `id` field, touching only that row.
 * This is the preferred way to sync an individual add/edit — unlike
 * writeSheet() (which rewrites the ENTIRE sheet from this device's local
 * array), it can't clobber a record another device added or edited in the
 * same few seconds, since it only ever touches the one row it's given.
 */
export async function upsertRow(
  url: string,
  sheet: SheetName,
  row: SheetRow
): Promise<void> {
  if (!row.id) throw new Error("upsertRow: row must have an 'id' field");
  const payload = b64Encode(JSON.stringify(row));
  await getFromScript(url, { action: "upsert", sheet, payload });
}

/**
 * Delete a single row by id, touching only that row — same rationale as
 * upsertRow() above (avoids a full-sheet rewrite for a one-record change).
 */
export async function deleteRow(
  url: string,
  sheet: SheetName,
  id: string
): Promise<void> {
  await getFromScript(url, { action: "delete", sheet, id });
}

/**
 * Overwrite an entire sheet with the given rows array.
 * Used for full-sync operations (Settings > "Sync Now").
 */
export async function writeSheet(
  url: string,
  sheet: SheetName,
  rows: SheetRow[]
): Promise<void> {
  if (rows.length === 0) {
    // Send a write with a single dummy row then clear — or use a minimal clear payload
    // We use the write action with an empty-marker row, then the script clears the sheet
    await getFromScript(url, { action: "write", sheet, payload: b64Encode("[]") });
    return;
  }
  await writeChunked(url, "write", sheet, rows);
}

/**
 * Ping the Apps Script to verify it's reachable and correctly deployed.
 * Returns { ok: true } on success.
 */
export async function pingScript(url: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await getFromScript(url, { action: "ping" });
    return { ok: true };
  } catch (err: unknown) {
    return { ok: false, error: (err as Error)?.message || String(err) };
  }
}

/**
 * Get row counts for all sheets in a single call.
 * Used by the polling engine to detect if anything changed without pulling full data.
 */
export async function digestSheets(url: string): Promise<Record<string, number> | null> {
  try {
    const result = await getFromScript(url, { action: "digest" });
    return (result.digest as Record<string, number>) ?? null;
  } catch {
    return null;
  }
}

/** Helper — get today's datetime string for lastSync timestamps */
export function nowTimestamp(): string {
  return new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

