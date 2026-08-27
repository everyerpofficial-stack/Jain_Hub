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
import { useStore } from "./store";
import { useMobileStore } from "./mobileStore";
import { digestSheets, readSheet, upsertRow, type SheetName } from "./googleSheets";
import { isSheetBusy, isIdDeleted } from "./syncQueue";
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
 * Safe non-destructive reconciliation helper:
 * Combines Google Sheets rows with un-synced local records.
 * - Prevents wiping local data if Google Sheets returns 0 rows.
 * - Preserves local records that have not been explicitly deleted by the user.
 * - Re-uploads local un-synced records to Google Sheets.
 */
function safeReconcile<T extends { id: string }>(
  url: string,
  sheet: SheetName,
  rows: T[],
  localList: T[],
  setter: (fn: (s: any) => any) => void,
  key: string
) {
  // 1. If sheet returns 0 rows but local list has data:
  // DO NOT wipe local list! Preserve local data and upload local items to Google Sheets.
  if (rows.length === 0 && localList.length > 0) {
    for (const item of localList) {
      if (item && item.id && !isIdDeleted(sheet, String(item.id))) {
        void upsertRow(url, sheet, item as any);
      }
    }
    return;
  }

  // 2. Map of sheet items by ID
  const sheetMap = new Map<string, T>(rows.map((r) => [String(r.id), r]));

  // Start with rows from Google Sheets
  const merged: T[] = [...rows];

  // 3. Preserve local items NOT present on the sheet (unless user explicitly deleted them)
  for (const loc of localList) {
    if (!loc || !loc.id) continue;
    const idStr = String(loc.id);
    if (!sheetMap.has(idStr)) {
      if (!isIdDeleted(sheet, idStr)) {
        merged.push(loc);
        // Upload un-synced local record to Google Sheets
        void upsertRow(url, sheet, loc as any);
      }
    }
  }

  const localJSON = JSON.stringify(localList);
  const mergedJSON = JSON.stringify(merged);

  if (localJSON !== mergedJSON) {
    setter(() => ({ [key]: merged }));
    const newFromSheetCount = rows.filter((r) => !localList.some((l) => String(l.id) === String(r.id))).length;
    if (newFromSheetCount > 0) {
      toast.info(`↓ ${newFromSheetCount} new records synced from ${sheet}`);
    }
  }
}

export function useRealtimeSync() {
  const lastDigestRef = useRef<Record<string, string | number>>({});
  const isMountedRef  = useRef(true);

  // Finance store
  const finConfig = useStore((s) => s.sheetsConfig);

  // Mobiles store
  const mobConfig = useMobileStore((s) => s.sheetsConfig);

  useEffect(() => {
    isMountedRef.current = true;

    // Only run if we have a configured URL
    const url = finConfig.url || mobConfig.url;
    if (!url || !finConfig.enabled) return;
    if (pollerRunning) return;

    pollerRunning = true;

    const poll = async () => {
      if (!isMountedRef.current) return;

      const activeUrl = useStore.getState().sheetsConfig.url || useMobileStore.getState().sheetsConfig.url;
      if (!activeUrl) return;

      try {
        // Step 1: Get row counts & content fingerprints
        const digest = await digestSheets(activeUrl);
        if (!digest || !isMountedRef.current) return;

        const prev = lastDigestRef.current;
        const changedFinance  = Object.keys(digest).filter(
          (k) => k.startsWith("Finance_") && String(digest[k]) !== String(prev[k] ?? "")
        );
        const changedMobiles = Object.keys(digest).filter(
          (k) => k.startsWith("Mobiles_") && String(digest[k]) !== String(prev[k] ?? "")
        );

        lastDigestRef.current = { ...digest };

        // Step 2: Fetch only changed sheets
        const deferred: string[] = [];
        if (changedFinance.length > 0) {
          deferred.push(...await reconcileFinance(activeUrl, changedFinance));
        }
        if (changedMobiles.length > 0) {
          deferred.push(...await reconcileMobiles(activeUrl, changedMobiles));
        }

        for (const sheet of deferred) delete lastDigestRef.current[sheet];

        const reconciledAny =
          changedFinance.length + changedMobiles.length - deferred.length > 0;
        if (reconciledAny) {
          useStore.getState().updateSheetsConfig({ lastSync: new Date().toLocaleTimeString("en-IN") });
        }

      } catch (err) {
        console.warn("[RealtimeSync] Poll error:", err);
      }
    };

    globalPollFn = poll;

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
      clearTimeout(initialTimer);
      clearInterval(interval);
      window.removeEventListener("focus", handleFocusOrVisibility);
      document.removeEventListener("visibilitychange", handleFocusOrVisibility);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finConfig.url, finConfig.enabled]);
}

// ── Finance reconciliation ──────────────────────────────────────────────────
async function reconcileFinance(url: string, sheets: string[]): Promise<string[]> {
  const deferred: string[] = [];
  const finState = useStore.getState();
  const setFin = (fn: (s: any) => any) => useStore.setState(fn);

  for (const sheet of sheets) {
    if (isSheetBusy(sheet)) { deferred.push(sheet); continue; }
    try {
      const rows = await readSheet(url, sheet as SheetName);

      if (sheet === "Finance_Customers") {
        const sanitized = rows.map((r: any) => ({
          ...r,
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
        }));
        safeReconcile(url, "Finance_Customers", sanitized, finState.customers, setFin, "customers");
      }

      if (sheet === "Finance_Payments") {
        const sanitized = rows.map((r: any) => ({
          ...r,
          customerId: String(r.customerId || ""),
          status: (r.status || "Success") as "Success" | "Refunded",
          cashAmount: r.cashAmount !== undefined && r.cashAmount !== "" ? Number(r.cashAmount) || 0 : undefined,
          bankAmount: r.bankAmount !== undefined && r.bankAmount !== "" ? Number(r.bankAmount) || 0 : undefined,
        }));
        safeReconcile(url, "Finance_Payments", sanitized, finState.payments, setFin, "payments");
      }

      if (sheet === "Finance_Expenses") {
        safeReconcile(url, "Finance_Expenses", rows as any[], finState.expenses, setFin, "expenses");
      }

      if (sheet === "Finance_Investments") {
        safeReconcile(url, "Finance_Investments", rows as any[], finState.investments, setFin, "investments");
      }

      if (sheet === "Finance_Staff") {
        const validRows = rows.filter((r: any) => (r.name && String(r.name).trim()) || (r.email && String(r.email).trim()));
        if (validRows.length > 0) {
          const newStaffList = validRows.map((r) => ({
            id: String(r.id || ""),
            name: String(r.name || ""),
            email: String(r.email || ""),
            role: String(r.role || "Staff"),
            status: (r.status || "Active") as "Active" | "Inactive",
            access: (r.access || "Both") as "Finance" | "Mobiles" | "Both",
            password: r.password ? String(r.password) : undefined,
            passwordHash: r.passwordHash ? String(r.passwordHash) : undefined,
            passwordSalt: r.passwordSalt ? String(r.passwordSalt) : undefined,
          }));

          const normalizedCurrent = finState.staff.map((s) => ({
            id: String(s.id || ""),
            name: String(s.name || ""),
            email: String(s.email || ""),
            role: String(s.role || "Staff"),
            status: (s.status || "Active") as "Active" | "Inactive",
            access: (s.access || "Both") as "Finance" | "Mobiles" | "Both",
            password: s.password ? String(s.password) : undefined,
            passwordHash: s.passwordHash ? String(s.passwordHash) : undefined,
            passwordSalt: s.passwordSalt ? String(s.passwordSalt) : undefined,
          }));

          const isDifferent = JSON.stringify(normalizedCurrent) !== JSON.stringify(newStaffList);
          if (isDifferent) {
            useStore.setState((s) => {
              const updatedUser = s.currentUser
                ? newStaffList.find((m) => m.id === s.currentUser?.id) || s.currentUser
                : null;
              return { staff: newStaffList, currentUser: updatedUser };
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
async function reconcileMobiles(url: string, sheets: string[]): Promise<string[]> {
  const deferred: string[] = [];
  for (const sheet of sheets) {
    if (isSheetBusy(sheet)) { deferred.push(sheet); continue; }
    try {
      const rawRows = await readSheet(url, sheet as SheetName);

      const rows = rawRows.map((r: any) => {
        if (sheet === "Mobiles_Sales") {
          let parsedItems = [];
          if (Array.isArray(r.items)) {
            parsedItems = r.items;
          } else if (typeof r.items === "string" && r.items.trim()) {
            try { parsedItems = JSON.parse(r.items); } catch { parsedItems = []; }
          }
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
          let parsedItems = [];
          if (Array.isArray(r.items)) {
            parsedItems = r.items;
          } else if (typeof r.items === "string" && r.items.trim()) {
            try { parsedItems = JSON.parse(r.items); } catch { parsedItems = []; }
          }
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
        if (sheet === "Mobiles_SupplierPayments") {
          return {
            ...r,
            amount: Number(r.amount) || 0,
            cashAmount: toOptionalNumber(r.cashAmount),
            bankAmount: toOptionalNumber(r.bankAmount),
          };
        }
        return r;
      });

      const mobState = useMobileStore.getState();
      const setMob = (fn: (s: any) => any) => useMobileStore.setState(fn);

      if (sheet === "Mobiles_Sales")            safeReconcile(url, "Mobiles_Sales",            rows, mobState.sales,            setMob, "sales");
      if (sheet === "Mobiles_Purchases")        safeReconcile(url, "Mobiles_Purchases",        rows, mobState.purchases,        setMob, "purchases");
      if (sheet === "Mobiles_Products")         safeReconcile(url, "Mobiles_Products",         rows, mobState.products,         setMob, "products");
      if (sheet === "Mobiles_Suppliers")        safeReconcile(url, "Mobiles_Suppliers",        rows, mobState.suppliers,        setMob, "suppliers");
      if (sheet === "Mobiles_Customers")        safeReconcile(url, "Mobiles_Customers",        rows, mobState.customers,        setMob, "customers");
      if (sheet === "Mobiles_Expenses")         safeReconcile(url, "Mobiles_Expenses",         rows, mobState.expenses,         setMob, "expenses");
      if (sheet === "Mobiles_Accessories")      safeReconcile(url, "Mobiles_Accessories",      rows, mobState.accessories,      setMob, "accessories");
      if (sheet === "Mobiles_SupplierPayments") safeReconcile(url, "Mobiles_SupplierPayments", rows, mobState.supplierPayments || [], setMob, "supplierPayments");
      if (sheet === "Mobiles_WarrantyClaims")   safeReconcile(url, "Mobiles_WarrantyClaims",   rows, mobState.warranties || [], setMob, "warranties");

    } catch (err) {
      deferred.push(sheet);
      console.warn(`[RealtimeSync] Failed to reconcile ${sheet}:`, err);
    }
  }
  return deferred;
}


