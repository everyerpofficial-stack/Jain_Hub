/**
 * useRealtimeSync.ts
 *
 * Real-time bidirectional sync between the app and Google Sheets.
 *
 * Features:
 *  1. Automatic polling of Google Sheets digest fingerprints every 15-30s.
 *  2. Instant sync trigger on window focus & tab visibility change (cross-device switch).
 *  3. Full reconciliation of Finance & Mobiles entities including Staff directory.
 *  4. Manual sync trigger function for direct UI actions.
 */

import { useEffect, useRef } from "react";
import {
  useStore, recalculateLoanStatuses, seedStaff,
  loanRow, profitTransactionRow, customerRow, paymentRow, documentRow, auditRow, auditFromRow,
  parseAmount,
} from "./store";
import {
  useMobileStore,
  saleRow, purchaseRow, productRow, supplierRow, mobileCustomerRow,
  mobileExpenseRow, accessoryRow, supplierPaymentRow, warrantyRow, warrantyFromRow,
  auditRow as mobileAuditRow, auditFromRow as mobileAuditFromRow,
  itemsFromSheet, safeItems,
  mobileSettingsRow, MOBILE_SETTINGS_ROW_ID,
} from "./mobileStore";
import { digestSheets, readSheet, upsertRow, type ResetEpochs, type SheetName, type SheetRow } from "./googleSheets";
import {
  isSheetBusy, isIdDeleted, isSheetUnavailable, recordSheetIds, wasSeenOnSheet, isLocallyRecent,
  clearSyncState, getKnownEpoch, setKnownEpoch, getResetGeneration, isResetInProgress, onStaleEpoch,
  isCreatedHere, renameCreatedHere,
  SYNC_MODULES, type SyncModule,
} from "./syncQueue";
import { toOptionalNumber } from "./ledger";
import { toast } from "sonner";

/** Poll interval in milliseconds (20 seconds — responsive yet quota-safe) */
const POLL_INTERVAL_MS = 20_000;

/** Global flag so only ONE polling instance runs at a time */
let pollerRunning = false;
let globalPollFn: (() => Promise<void>) | null = null;

/** Trigger an immediate sync poll across all modules (e.g. on manual button click or tab focus) */
export async function triggerManualSync(forceAll = false): Promise<boolean> {
  const activeUrl = useStore.getState().sheetsConfig.url || useMobileStore.getState().sheetsConfig.url;
  if (!activeUrl) return false;

  try {
    if (forceAll) {
      const [finRes, mobRes] = await Promise.all([
        useStore.getState().loadFromSheets(),
        useMobileStore.getState().loadFromSheets(),
      ]);
      return finRes.ok || mobRes.ok;
    }

    if (globalPollFn) {
      await globalPollFn();
      return true;
    } else {
      const finRes = await useStore.getState().loadFromSheets();
      return finRes.ok;
    }
  } catch (err) {
    console.warn("[RealtimeSync] Manual sync error:", err);
    return false;
  }
}

/**
 * Merge a fresh sheet read with this device's copy of the same table:
 * - Sheet rows win for every id the sheet has.
 * - Local records the sheet lacks are kept and re-uploaded if they never
 *   reached it, and dropped if they were seen there before (deleted elsewhere).
 * - With `identity`, a record THIS device created whose id now holds a
 *   different record on the sheet (an id clash with another device) is
 *   renumbered and re-uploaded rather than lost.
 */
function safeReconcile<T extends { id?: string }>(
  url: string,
  sheet: SheetName,
  rows: T[],
  localList: T[],
  setter: (fn: (s: any) => any) => void,
  key: string,
  /**
   * Serialiser for records this device uploads back to the sheet.
   *
   * This used to push the raw in-memory record. For sales and purchases that
   * record carries `items` as a real array, which a spreadsheet cell cannot
   * hold — it landed as "[object Object]" and permanently destroyed the line
   * items on that invoice, which is what left purchased units invisible to
   * stock. Always upload through the same row builder the mutators use.
   */
  // Deliberately loose: callers pass the domain row builders (saleRow,
  // purchaseRow, ...) while `rows` here are sanitised sheet rows, so the two
  // sides never line up nominally.
  toRow: (item: any) => SheetRow = (item) => item as SheetRow,
  /**
   * The fields that make two records "the same record", normalised so a sheet
   * round-trip cannot change them (Sheets turns "₹1,660" into 1660 and dates
   * into Date cells). Only for tables whose records are never edited in those
   * fields after creation; a mismatch then can only mean an id clash.
   */
  identity?: (item: any) => string
) {
  const push = (item: T) => {
    // The deployed script rejects this tab outright — re-offering every local
    // record on every 20s poll would just spam failures.
    if (isSheetUnavailable(sheet)) return;
    try {
      // .catch is required, not decorative: a rejected upsert here is an
      // unhandled promise rejection that surfaces as a hard error in the tab.
      void upsertRow(url, sheet, toRow(item)).catch((err) => {
        console.warn(`[RealtimeSync] Could not re-upload ${sheet} row ${item?.id}:`, err);
      });
    } catch (err) {
      console.warn(`[RealtimeSync] Could not serialise ${sheet} row ${item?.id}:`, err);
    }
  };

  // An empty sheet goes through the same rules as any other read. It used to
  // be special-cased as "keep everything local", which is exactly why a
  // database cleared from one device stayed visible on the others — and why
  // they then wrote it back: the first edit or EMI payment on a stale record
  // re-upserted it (and its customer) for the whole shop. The per-record rules
  // below are already safe for an empty read: records this device created and
  // never saw on the sheet are kept and pushed; only records it HAS seen there
  // before are treated as deleted.

  // Map of sheet items by ID
  const sheetMap = new Map<string, T>(rows.map((r) => [String(r.id), r]));

  // Remember what the sheet holds right now.
  recordSheetIds(
    sheet,
    rows.map((r) => String(r.id ?? "")).filter(Boolean)
  );

  // Start with rows from Google Sheets
  const merged: T[] = [...rows];

  const usedIds = new Set<string>([...rows, ...localList].map((r) => String(r?.id ?? "")).filter(Boolean));
  const renumbered: string[] = [];

  // 3. Decide what to do with each local record the sheet does not have.
  let removedRemotely = 0;
  for (const loc of localList) {
    if (!loc || !loc.id) continue;
    const idStr = String(loc.id);
    if (sheetMap.has(idStr)) {
      // Another device allocated the same id and its upsert replaced ours on
      // the sheet. Give our record the next free id and upload it again.
      if (identity && isCreatedHere(sheet, idStr) && identity(loc) !== identity(sheetMap.get(idStr))) {
        const newId = nextFreeId(idStr, usedIds);
        usedIds.add(newId);
        const moved = { ...loc, id: newId } as T;
        renameCreatedHere(sheet, idStr, newId);
        merged.push(moved);
        push(moved);
        renumbered.push(`${idStr} → ${newId}`);
      }
      continue;
    }

    // Deleted on this device; the delete may still be in flight.
    if (isIdDeleted(sheet, idStr)) continue;

    // Locally created or edited recently: keep it and ensure it gets pushed
    if (isLocallyRecent(sheet, idStr)) {
      merged.push(loc);
      push(loc);
      continue;
    }

    // This device has seen the row on the sheet before and it is gone now, so
    // somebody deleted it. Dropping it locally is the point: re-uploading it
    // (which is what happened before) undid the deletion for the whole shop.
    if (wasSeenOnSheet(sheet, idStr)) {
      removedRemotely++;
      continue;
    }

    // Never been on the sheet — a genuinely un-synced local record.
    merged.push(loc);
    push(loc);
  }

  const localJSON = JSON.stringify(localList);
  const mergedJSON = JSON.stringify(merged);

  if (localJSON !== mergedJSON) {
    setter(() => ({ [key]: merged }));
    if (renumbered.length > 0) {
      toast.warning("Record number clash with another device", {
        description: `Both devices used the same number at the same time. This device's entry was renumbered so neither is lost: ${renumbered.join(", ")}.`,
        duration: 15000,
      });
    }
    // Straight after adopting a reset the whole module reloads; one summary
    // toast already said why, so a "new records" toast per tab is just noise.
    if (quietPrefixes.some((p) => sheet.startsWith(p))) return;
    const localIds = new Set(localList.map((l) => String(l?.id)));
    const newFromSheetCount = rows.filter((r) => !localIds.has(String(r.id))).length;
    if (newFromSheetCount > 0) {
      toast.info(`↓ ${newFromSheetCount} new records synced from ${sheet}`);
    }
    if (removedRemotely > 0) {
      toast.info(`↩ ${removedRemotely} record(s) removed on another device`, {
        description: `Deleted from ${sheet} elsewhere and now removed here too.`,
      });
    }
  }
}

/** Next unused id with the same prefix as `id` ("TXN-0152" → "TXN-0153" or higher). */
function nextFreeId(id: string, used: Set<string>): string {
  const prefix = id.replace(/\d+$/, "");
  const width = Math.max(3, id.length - prefix.length);
  let max = 0;
  for (const u of used) {
    if (!u.startsWith(prefix)) continue;
    const n = Number(u.slice(prefix.length));
    if (Number.isInteger(n) && n > max) max = n;
  }
  return prefix + String(max + 1).padStart(width, "0");
}

/**
 * Identities for the create-only tables (see safeReconcile's `identity`).
 * Kept to fields Sheets cannot reformat: ids, digits and amounts.
 */
const text = (v: unknown) => String(v ?? "").trim().toLowerCase();
const paymentIdentity = (p: any) => `${text(p.customerId)}|${text(p.loanId)}|${parseAmount(p.amount)}`;
const expenseIdentity = (e: any) => `${text(e.cat)}|${text(e.type || "Expense")}|${parseAmount(e.amount)}`;
const investmentIdentity = (i: any) => `${text(i.investor)}|${parseAmount(i.amount)}`;
const profitTxnIdentity = (t: any) => `${text(t.type)}|${parseAmount(t.amount)}`;
const saleIdentity = (s: any) => `${String(s.customerMobile ?? "").replace(/\D/g, "")}|${parseAmount(s.totalAmount)}`;
const purchaseIdentity = (p: any) => `${text(p.supplierId || p.supplierName)}|${parseAmount(p.amount)}`;
const supplierPaymentIdentity = (p: any) => `${text(p.supplierId || p.supplierName)}|${parseAmount(p.amount)}`;

let globalDigestCache: Record<string, string | number> = {};

/** Sheet-name prefixes whose reconcile toasts are suppressed for the current poll. */
let quietPrefixes: string[] = [];

/** Forget the digest for one module (or all), so its sheets are re-read on the next poll. */
export function resetRealtimeSyncCache(module?: SyncModule) {
  if (!module) {
    globalDigestCache = {};
    return;
  }
  for (const k of Object.keys(globalDigestCache)) {
    if (k.startsWith(`${module}_`)) delete globalDigestCache[k];
  }
}

/** True if the module holds any records on this device. */
function hasLocalData(module: SyncModule): boolean {
  if (module === "Finance") {
    const s = useStore.getState();
    return [s.customers, s.payments, s.loans, s.expenses, s.investments, s.profitTransactions, s.documents]
      .some((list) => (list?.length ?? 0) > 0);
  }
  const m = useMobileStore.getState();
  return [m.sales, m.purchases, m.products, m.suppliers, m.customers, m.expenses, m.accessories, m.supplierPayments, m.warranties]
    .some((list) => (list?.length ?? 0) > 0);
}

/**
 * The module was cleared from another device (its server epoch moved past
 * ours): drop this device's copy so it matches, and so none of it can be
 * written back. Records added on any device AFTER the reset are then pulled in
 * by the normal reconcile, because the module's digest cache is emptied too.
 */
function adoptRemoteReset(module: SyncModule, serverEpoch: number) {
  const hadData = hasLocalData(module);
  if (module === "Finance") useStore.getState().clearLocalData();
  else useMobileStore.getState().clearLocalData();
  clearSyncState(module);
  resetRealtimeSyncCache(module);
  setKnownEpoch(module, serverEpoch);
  quietPrefixes.push(`${module}_`);
  if (hadData) {
    toast.warning(`${module} data was cleared from another device`, {
      id: `remote-reset-${module}`,
      description: "This device's copy has been removed to match the shared database.",
      duration: 10000,
    });
  }
}

/**
 * Compare the server's reset epochs with what this device last saw.
 * `epochs` is null on a Code.gs too old to report them — nothing to compare.
 */
function applyServerEpochs(epochs: ResetEpochs | null) {
  if (!epochs) return;
  for (const module of SYNC_MODULES) {
    const server = epochs[module];
    if (server === undefined) continue;
    const known = getKnownEpoch(module);
    if (server > (known ?? 0)) {
      // Includes a device that has never recorded an epoch (first run of this
      // build) while the server has one: its local data may well predate that
      // reset, and the sheet is the source of truth either way.
      adoptRemoteReset(module, server);
    } else if (known === undefined || server < known) {
      // Never cleared, or the script's properties were reset — just align.
      setKnownEpoch(module, server);
    }
  }
}

/**
 * One sync pass: adopt any reset made on another device, then reconcile every
 * sheet whose digest changed since the last pass. `isActive` lets the caller
 * abandon the pass (e.g. the hook unmounted) after each network round-trip.
 */
export async function pollOnce(isActive: () => boolean = () => true): Promise<void> {
  if (!isActive()) return;
  // This device is clearing a module right now; see beginReset().
  if (isResetInProgress()) return;

  const activeUrl = useStore.getState().sheetsConfig.url || useMobileStore.getState().sheetsConfig.url;
  if (!activeUrl) return;

  try {
    // Step 1: Get row counts & content fingerprints
    const result = await digestSheets(activeUrl);
    if (!result || !isActive() || isResetInProgress()) return;
    const { digest } = result;

    // Step 1b: a module cleared elsewhere must be wiped here before anything
    // is reconciled, or the stale rows get merged — and pushed — back.
    quietPrefixes = [];
    applyServerEpochs(result.epochs);
    const generation = getResetGeneration();

    const prev = globalDigestCache;
    const changedFinance  = Object.keys(digest).filter(
      (k) => k.startsWith("Finance_") && String(digest[k]) !== String(prev[k] ?? "")
    );
    const changedMobiles = Object.keys(digest).filter(
      (k) => k.startsWith("Mobiles_") && String(digest[k]) !== String(prev[k] ?? "")
    );

    globalDigestCache = { ...digest };

    // Step 2: Fetch only changed sheets
    const deferred: string[] = [];
    if (changedFinance.length > 0) {
      deferred.push(...await reconcileFinance(activeUrl, changedFinance, generation));
    }
    if (changedMobiles.length > 0) {
      deferred.push(...await reconcileMobiles(activeUrl, changedMobiles, generation));
    }

    // A reset landed while this pass was reading: what it read is stale.
    // Re-read every sheet next time rather than trust this pass.
    if (generation !== getResetGeneration()) {
      globalDigestCache = {};
      return;
    }

    for (const sheet of deferred) delete globalDigestCache[sheet];

    const reconciledAny =
      changedFinance.length + changedMobiles.length - deferred.length > 0;
    if (reconciledAny) {
      useStore.getState().updateSheetsConfig({ lastSync: new Date().toLocaleTimeString("en-IN") });
    }
  } catch (err) {
    console.warn("[RealtimeSync] Poll error:", err);
  } finally {
    quietPrefixes = [];
  }
}

export function useRealtimeSync() {
  const isMountedRef = useRef(true);

  // Finance store
  const finConfig = useStore((s) => s.sheetsConfig);

  // Mobiles store
  const mobConfig = useMobileStore((s) => s.sheetsConfig);

  // The poller pulls the entire book — every customer with their Aadhaar and
  // mobile number, every payment, and the staff directory with its password
  // hashes — into this browser's localStorage. This hook is mounted by the
  // root route, which renders the login screen for a signed-out visitor, so
  // without this check that whole download happened before anyone signed in
  // (and kept re-running, burning Apps Script quota, on an idle login screen).
  const currentUser = useStore((s) => s.currentUser);

  useEffect(() => {
    isMountedRef.current = true;

    if (!currentUser) return;

    // Only run if we have a configured URL
    const url = finConfig.url || mobConfig.url;
    if (!url || !finConfig.enabled) return;
    if (pollerRunning) return;

    pollerRunning = true;

    // Focus and visibilitychange both fire on returning to the tab, on top of
    // the interval — two polls used to run side by side, reconciling the same
    // sheets and racing each other's writes to the store. Overlapping calls
    // now share the running poll and queue at most one follow-up.
    let inFlight: Promise<void> | null = null;
    let queued = false;
    const isActive = () => isMountedRef.current;
    const poll = (): Promise<void> => {
      if (inFlight) {
        queued = true;
        return inFlight;
      }
      inFlight = pollOnce(isActive).finally(() => {
        inFlight = null;
        if (queued && isMountedRef.current) {
          queued = false;
          void poll();
        }
      });
      return inFlight;
    };

    globalPollFn = poll;
    // A write refused as STALE_EPOCH means a reset happened elsewhere — pick
    // it up now rather than at the next 20-second tick.
    onStaleEpoch(() => { void poll(); });

    // Initial poll almost immediately (100ms)
    const initialTimer = setTimeout(poll, 100);
    const interval = setInterval(poll, POLL_INTERVAL_MS);

    // Instant poll when user returns to window / unlocks device / switches tab
    const handleFocusOrVisibility = () => {
      if (document.visibilityState === "visible") {
        poll().catch(() => {});
      }
    };

    window.addEventListener("focus", handleFocusOrVisibility);
    document.addEventListener("visibilitychange", handleFocusOrVisibility);

    return () => {
      isMountedRef.current = false;
      pollerRunning = false;
      globalPollFn = null;
      onStaleEpoch(null);
      clearTimeout(initialTimer);
      clearInterval(interval);
      window.removeEventListener("focus", handleFocusOrVisibility);
      document.removeEventListener("visibilitychange", handleFocusOrVisibility);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finConfig.url, finConfig.enabled, currentUser?.id]);
}

// ── Finance reconciliation ──────────────────────────────────────────────────
async function reconcileFinance(url: string, sheets: string[], generation: number): Promise<string[]> {
  const deferred: string[] = [];
  const setFin = (fn: (s: any) => any) => useStore.setState(fn);

  for (const sheet of sheets) {
    if (isSheetBusy(sheet)) { deferred.push(sheet); continue; }
    try {
      const rows = await readSheet(url, sheet as SheetName);
      // Data cleared (here or remotely) while this read was in flight.
      if (generation !== getResetGeneration() || isResetInProgress()) return deferred;

      // Read state AFTER the await, once per sheet. A snapshot taken before the
      // loop goes stale the moment an earlier iteration writes, or the operator
      // adds a record while the fetch is in flight — and safeReconcile then
      // treats those newer local records as "missing from the sheet", re-uploads
      // them and writes the stale list straight back over the store.
      const finState = useStore.getState();

      if (sheet === "Finance_Customers") {
        const sanitized = rows.map((r: any) => ({
          ...r,
          // Sheets stores a 10-digit mobile / 12-digit Aadhaar as a NUMBER.
          // Every customer + due-list search calls .toLowerCase() on these,
          // which throws on a number and blanks the whole page.
          name: String(r.name ?? ""),
          mobile: String(r.mobile ?? ""),
          aadhaar: String(r.aadhaar ?? ""),
          guarantyMobile: String(r.guarantyMobile ?? ""),
          village: String(r.village ?? ""),
          emiDate: String(r.emiDate ?? ""),
          billDate: String(r.billDate ?? ""),
          price: Number(r.price) || 0,
          fileCharge: Number(r.fileCharge) || 0,
          deposit: Number(r.deposit) || 0,
          balanceForEmi: Number(r.balanceForEmi) || 0,
          interestRate: Number(r.interestRate) || 0,
          interestPerMonth: Number(r.interestPerMonth) || 0,
          noOfEmi: Number(r.noOfEmi) || 0,
          totalInterest: Number(r.totalInterest) || 0,
          totalEmiAmount: Number(r.totalEmiAmount) || 0,
          perMonthEmi: Number(r.perMonthEmi) || 0,
          paidEmis: Number(r.paidEmis) || 0,
          pendingEmis: Number(r.pendingEmis) || 0,
          pendingAmount: Number(r.pendingAmount) || 0,
          lastPaymentAmt: Number(r.lastPaymentAmt) || 0,
          missedEmis: Number(r.missedEmis) || 0,
          blacklistDate: String(r.blacklistDate ?? ""),
          blacklistReason: String(r.blacklistReason ?? ""),
        }));
        safeReconcile(url, "Finance_Customers", sanitized, finState.customers, setFin, "customers", customerRow);
      }

      if (sheet === "Finance_Payments") {
        const sanitized = rows.map((r: any) => ({
          ...r,
          customerId: String(r.customerId || ""),
          status: (r.status || "Success") as "Success" | "Refunded",
          cashAmount: r.cashAmount !== undefined && r.cashAmount !== "" ? Number(r.cashAmount) || 0 : undefined,
          bankAmount: r.bankAmount !== undefined && r.bankAmount !== "" ? Number(r.bankAmount) || 0 : undefined,
        }));
        safeReconcile(url, "Finance_Payments", sanitized, finState.payments, setFin, "payments", paymentRow, paymentIdentity);
      }

      if (sheet === "Finance_Loans") {
        const sanitized = rows.map((r: any) => ({
          ...r,
          id: String(r.id ?? ""),
          customer: String(r.customer ?? ""),
          product: String(r.product ?? ""),
          amount: String(r.amount ?? "0"),
          deposit: String(r.deposit ?? "0"),
          emi: String(r.emi ?? "0"),
          duration: String(r.duration ?? ""),
          interest: String(r.interest ?? ""),
          date: String(r.date ?? ""),
          collectedAmount: Number(r.collectedAmount) || 0,
          paidEmis: Number(r.paidEmis) || 0,
        }));
        safeReconcile(url, "Finance_Loans", sanitized, useStore.getState().loans, setFin, "loans", loanRow);
        useStore.setState((st) => ({ loans: recalculateLoanStatuses(st.loans) }));
      }

      if (sheet === "Finance_ProfitTransactions") {
        const sanitized = rows.map((r: any) => ({
          ...r,
          amount: Number(r.amount) || 0,
          cashAmount: r.cashAmount !== undefined && r.cashAmount !== "" ? Number(r.cashAmount) || 0 : undefined,
          bankAmount: r.bankAmount !== undefined && r.bankAmount !== "" ? Number(r.bankAmount) || 0 : undefined,
          takenBalanceAfter: Number(r.takenBalanceAfter) || 0,
        }));
        safeReconcile(
          url, "Finance_ProfitTransactions", sanitized,
          useStore.getState().profitTransactions || [], setFin, "profitTransactions",
          profitTransactionRow, profitTxnIdentity
        );
      }

      if (sheet === "Finance_Documents") {
        // The register syncs; the file bytes do not (see documentRow). Keep
        // whatever local fileUrl this device holds for a row the sheet also
        // knows about, or reconciling would blank the only copy of the file.
        const localDocs = new Map(useStore.getState().documents.map((d) => [String(d.id), d]));
        const sanitized = rows.map((r: any) => ({
          ...r,
          id: String(r.id ?? ""),
          customerId: String(r.customerId ?? ""),
          customerName: String(r.customerName ?? ""),
          fileName: String(r.fileName ?? ""),
          fileSize: String(r.fileSize ?? ""),
          date: String(r.date ?? ""),
          driveUrl: String(r.driveUrl ?? "") || undefined,
          fileUrl: localDocs.get(String(r.id))?.fileUrl,
        }));
        safeReconcile(url, "Finance_Documents", sanitized, useStore.getState().documents, setFin, "documents", documentRow);
      }

      if (sheet === "Finance_Expenses") {
        safeReconcile(url, "Finance_Expenses", rows as any[], finState.expenses, setFin, "expenses", undefined, expenseIdentity);
      }

      if (sheet === "Finance_Investments") {
        safeReconcile(url, "Finance_Investments", rows as any[], finState.investments, setFin, "investments", undefined, investmentIdentity);
      }

      if (sheet === "Finance_Audit") {
        const sanitized = rows.map(auditFromRow);
        safeReconcile(url, "Finance_Audit", sanitized, finState.audit, setFin, "audit", auditRow);
      }

      if (sheet === "Finance_Staff") {
        const validRows = rows.filter((r: any) => (r.name && String(r.name).trim()) || (r.email && String(r.email).trim()));
        if (validRows.length > 0) {
          const newStaffList = validRows.map((r: any) => {
            const rawName = String(r.name || "");
            const rawEmail = String(r.email || "");
            const isDefaultAdmin = rawName === "Avinash G" || rawEmail.toLowerCase() === "jainmobile7828@gmail.com" || String(r.id || "") === "ST-001";
            const name = isDefaultAdmin ? "Rishi Rathod" : rawName;
            return {
              id: String(r.id || ""),
              name,
              email: rawEmail,
              role: String(r.role || "Staff"),
              status: (r.status || "Active") as "Active" | "Inactive",
              access: (r.access || "Both") as "Finance" | "Mobiles" | "Both",
              password: r.password ? String(r.password) : undefined,
              passwordHash: r.passwordHash ? String(r.passwordHash) : undefined,
              passwordSalt: r.passwordSalt ? String(r.passwordSalt) : undefined,
            };
          });

          const hasDefaultAdmin = newStaffList.some((s) => s.email.toLowerCase() === "jainmobile7828@gmail.com" || s.id === "ST-001");
          const finalStaffList = hasDefaultAdmin ? newStaffList : [seedStaff[0], ...newStaffList];

          const normalizedCurrent = finState.staff.map((s) => {
            const rawName = String(s.name || "");
            const rawEmail = String(s.email || "");
            const isDefaultAdmin = rawName === "Avinash G" || rawEmail.toLowerCase() === "jainmobile7828@gmail.com" || String(s.id || "") === "ST-001";
            const name = isDefaultAdmin ? "Rishi Rathod" : rawName;
            return {
              id: String(s.id || ""),
              name,
              email: rawEmail,
              role: String(s.role || "Staff"),
              status: (s.status || "Active") as "Active" | "Inactive",
              access: (s.access || "Both") as "Finance" | "Mobiles" | "Both",
              password: s.password ? String(s.password) : undefined,
              passwordHash: s.passwordHash ? String(s.passwordHash) : undefined,
              passwordSalt: s.passwordSalt ? String(s.passwordSalt) : undefined,
            };
          });

          const isDifferent = JSON.stringify(normalizedCurrent) !== JSON.stringify(finalStaffList);
          if (isDifferent) {
            useStore.setState((s) => {
              const updatedUser = s.currentUser
                ? finalStaffList.find((m) => m.id === s.currentUser?.id || m.email.toLowerCase() === s.currentUser?.email?.toLowerCase()) || (s.currentUser.name === "Avinash G" ? { ...s.currentUser, name: "Rishi Rathod" } : s.currentUser)
                : null;
              return { staff: finalStaffList, currentUser: updatedUser };
            });
          }
        }
      }
    } catch (err) {
      deferred.push(sheet);
      console.warn(`[RealtimeSync] Failed to reconcile ${sheet}:`, err);
    }
  }
  return deferred;
}

// ── Mobiles reconciliation ──────────────────────────────────────────────────
async function reconcileMobiles(url: string, sheets: string[], generation: number): Promise<string[]> {
  const deferred: string[] = [];
  for (const sheet of sheets) {
    if (isSheetBusy(sheet)) { deferred.push(sheet); continue; }
    try {
      const rawRows = await readSheet(url, sheet as SheetName);
      // Data cleared (here or remotely) while this read was in flight.
      if (generation !== getResetGeneration() || isResetInProgress()) return deferred;

      const localSalesById = new Map(useMobileStore.getState().sales.map((x: any) => [String(x?.id), x]));
      const localPurchasesById = new Map(useMobileStore.getState().purchases.map((x: any) => [String(x?.id), x]));

      const rows = rawRows.map((r: any) => {
        if (sheet === "Mobiles_Sales") {
          const parsedItems = itemsFromSheet(r.items, localSalesById.get(String(r.id))?.items);
          return {
            ...r,
            subtotal: Number(r.subtotal) || Number(r.totalAmount) || 0,
            gst: Number(r.gst) || 0,
            totalAmount: Number(r.totalAmount) || 0,
            amountPaid: Number(r.amountPaid) || 0,
            dueAmount: Number(r.dueAmount) || 0,
            cashAmountPaid: toOptionalNumber(r.cashAmountPaid),
            upiAmountPaid: toOptionalNumber(r.upiAmountPaid),
            items: parsedItems,
          };
        }
        if (sheet === "Mobiles_Purchases") {
          const parsedItems = itemsFromSheet(r.items, localPurchasesById.get(String(r.id))?.items);
          return {
            ...r,
            quantity: Number(r.quantity) || 0,
            amount: Number(r.amount) || 0,
            gst: Number(r.gst) || 0,
            cashAmount: toOptionalNumber(r.cashAmount),
            bankAmount: toOptionalNumber(r.bankAmount),
            items: parsedItems,
          };
        }
        if (sheet === "Mobiles_Expenses") {
          return {
            ...r,
            cashAmount: toOptionalNumber(r.cashAmount),
            bankAmount: toOptionalNumber(r.bankAmount),
          };
        }
        if (sheet === "Mobiles_Products") {
          return {
            ...r,
            // A 10-digit model or a numeric spec comes back from Sheets as a
            // number; every product search does .toLowerCase() on these.
            name: String(r.name ?? ""),
            brand: String(r.brand ?? ""),
            model: String(r.model ?? ""),
            color: String(r.color ?? ""),
            ramRom: String(r.ramRom ?? ""),
            category: String(r.category ?? ""),
            purchasePrice: Number(r.purchasePrice) || 0,
            sellingPrice: Number(r.sellingPrice) || 0,
          };
        }
        if (sheet === "Mobiles_Customers") {
          return {
            ...r,
            name: String(r.name ?? ""),
            mobile: String(r.mobile ?? ""),
            isBlacklisted: r.isBlacklisted === true || r.isBlacklisted === "true",
          };
        }
        if (sheet === "Mobiles_Suppliers") {
          return {
            ...r,
            name: String(r.name ?? ""),
            contact: String(r.contact ?? ""),
            gstNo: String(r.gstNo ?? ""),
            outstanding: Number(r.outstanding) || 0,
          };
        }
        if (sheet === "Mobiles_Accessories") {
          return {
            ...r,
            stock: Number(r.stock) || 0,
            minLimit: Number(r.minLimit) || 0,
            purchasePrice: Number(r.purchasePrice) || 0,
            sellingPrice: Number(r.sellingPrice) || 0,
          };
        }
        if (sheet === "Mobiles_SupplierPayments") {
          return {
            ...r,
            amount: Number(r.amount) || 0,
            cashAmount: toOptionalNumber(r.cashAmount),
            bankAmount: toOptionalNumber(r.bankAmount),
          };
        }
        if (sheet === "Mobiles_WarrantyClaims") {
          return warrantyFromRow(r);
        }
        return r;
      });

      const mobState = useMobileStore.getState();
      const setMob = (fn: (s: any) => any) => useMobileStore.setState(fn);

      // Push the recovered line items back to the sheet, so a row damaged by
      // the old raw-record upload is repaired for every other device instead
      // of only this one. Only rows this device can actually recover are
      // touched, so this is a handful of writes at most and then never again.
      if (sheet === "Mobiles_Sales" || sheet === "Mobiles_Purchases") {
        const localById = sheet === "Mobiles_Sales" ? localSalesById : localPurchasesById;
        const toRow: (r: any) => SheetRow = sheet === "Mobiles_Sales" ? saleRow : purchaseRow;
        for (const raw of rawRows) {
          const id = String(raw?.id ?? "");
          const local = localById.get(id);
          if (!id || !local) continue;
          if (safeItems(raw?.items).length === 0 && safeItems(local?.items).length > 0) {
            void upsertRow(url, sheet as SheetName, toRow(local)).catch(() => { /* best effort */ });
          }
        }
      }

      if (sheet === "Mobiles_Sales")            safeReconcile(url, "Mobiles_Sales",            rows, mobState.sales,            setMob, "sales", saleRow, saleIdentity);
      if (sheet === "Mobiles_Purchases")        safeReconcile(url, "Mobiles_Purchases",        rows, mobState.purchases,        setMob, "purchases", purchaseRow, purchaseIdentity);
      if (sheet === "Mobiles_Products")         safeReconcile(url, "Mobiles_Products",         rows, mobState.products,         setMob, "products", productRow);
      if (sheet === "Mobiles_Suppliers")        safeReconcile(url, "Mobiles_Suppliers",        rows, mobState.suppliers,        setMob, "suppliers", supplierRow);
      if (sheet === "Mobiles_Customers")        safeReconcile(url, "Mobiles_Customers",        rows, mobState.customers,        setMob, "customers", mobileCustomerRow);
      if (sheet === "Mobiles_Expenses")         safeReconcile(url, "Mobiles_Expenses",         rows, mobState.expenses,         setMob, "expenses", mobileExpenseRow, expenseIdentity);
      if (sheet === "Mobiles_Accessories")      safeReconcile(url, "Mobiles_Accessories",      rows, mobState.accessories,      setMob, "accessories", accessoryRow);
      if (sheet === "Mobiles_SupplierPayments") safeReconcile(url, "Mobiles_SupplierPayments", rows, mobState.supplierPayments || [], setMob, "supplierPayments", supplierPaymentRow, supplierPaymentIdentity);
      if (sheet === "Mobiles_WarrantyClaims")   safeReconcile(url, "Mobiles_WarrantyClaims",   rows, mobState.warranties || [], setMob, "warranties", warrantyRow);
      if (sheet === "Mobiles_Audit")            safeReconcile(url, "Mobiles_Audit",            rows, mobState.audit || [],      setMob, "audit", mobileAuditRow);

      // Shop profile is a single fixed-id row, not a list, so it does not go
      // through safeReconcile — last write from any device wins.
      if (sheet === "Mobiles_Settings") {
        const row: any = rows.find((r: any) => String(r?.id) === MOBILE_SETTINGS_ROW_ID);
        if (row) {
          useMobileStore.setState((st) => ({
            settings: {
              ...st.settings,
              storeName: String(row.storeName ?? st.settings.storeName),
              gstNo: String(row.gstNo ?? st.settings.gstNo),
              contact: String(row.contact ?? st.settings.contact),
              email: String(row.email ?? st.settings.email),
              address: String(row.address ?? st.settings.address),
              invoicePrefix: String(row.invoicePrefix ?? st.settings.invoicePrefix),
            },
          }));
        } else if (!isSheetUnavailable("Mobiles_Settings")) {
          // Nothing on the sheet yet — seed it from this device.
          void upsertRow(url, "Mobiles_Settings", mobileSettingsRow(useMobileStore.getState().settings))
            .catch(() => { /* best effort */ });
        }
      }

      // Any of the three stock-bearing sheets landing means the derived
      // quantities are stale — rebuild them from the reconciled ledgers.
      if (sheet === "Mobiles_Products" || sheet === "Mobiles_Purchases" || sheet === "Mobiles_Sales") {
        useMobileStore.getState().recomputeInventory();
      }

    } catch (err) {
      deferred.push(sheet);
      console.warn(`[RealtimeSync] Failed to reconcile ${sheet}:`, err);
    }
  }
  return deferred;
}


