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
import { digestSheets, readSheet } from "./googleSheets";
import { isSheetBusy } from "./syncQueue";
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

        // A sheet we skipped (local write still in flight) has NOT been
        // reconciled, so drop its fingerprint — otherwise it now matches the
        // recorded digest and would never be seen as "changed" again, leaving
        // that sheet permanently un-synced for the rest of the session.
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
// Full-replace strategy: when digest changes for a sheet, we replace local data
// with sheet data. This ensures EDITS (not just adds/deletes) propagate.
async function reconcileFinance(url: string, sheets: string[]): Promise<string[]> {
  const deferred: string[] = [];
  for (const sheet of sheets) {
    // A row we just wrote locally may not be readable back from the sheet
    // yet. Reconciling now would see it as "missing upstream" and wipe it
    // from local state. Leave this sheet for the next poll.
    if (isSheetBusy(sheet)) { deferred.push(sheet); continue; }
    try {
      const rows = await readSheet(url, sheet as import("./googleSheets").SheetName);

      if (sheet === "Finance_Customers") {
        // Sanitize numeric fields
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
        const current = useStore.getState().customers;
        if (JSON.stringify(current.map(c => c.id).sort()) !== JSON.stringify(sanitized.map((r: any) => String(r.id)).sort()) ||
            sanitized.length !== current.length) {
          useStore.setState({ customers: sanitized as any[] });
          toast.info(`↓ Customers synced from Sheets (${sanitized.length} records)`);
        } else {
          // Check for field-level changes
          const currentJSON = JSON.stringify(current);
          const newJSON = JSON.stringify(sanitized);
          if (currentJSON !== newJSON) {
            useStore.setState({ customers: sanitized as any[] });
            toast.info(`↓ Customer data updated from Sheets`);
          }
        }
      }

      if (sheet === "Finance_Payments") {
        const sanitized = rows.map((r: any) => ({
          ...r,
          customerId: String(r.customerId || ""),
          status: (r.status || "Success") as "Success" | "Refunded",
          cashAmount: r.cashAmount !== undefined && r.cashAmount !== "" ? Number(r.cashAmount) || 0 : undefined,
          bankAmount: r.bankAmount !== undefined && r.bankAmount !== "" ? Number(r.bankAmount) || 0 : undefined,
        }));
        const current = useStore.getState().payments;
        const currentJSON = JSON.stringify(current);
        const newJSON = JSON.stringify(sanitized);
        if (currentJSON !== newJSON) {
          useStore.setState({ payments: sanitized as any[] });
          if (sanitized.length !== current.length) {
            toast.info(`↓ Payments synced from Sheets (${sanitized.length} records)`);
          }
        }
      }

      if (sheet === "Finance_Expenses") {
        const current = useStore.getState().expenses;
        const currentJSON = JSON.stringify(current);
        const newJSON = JSON.stringify(rows);
        if (currentJSON !== newJSON) {
          useStore.setState({ expenses: rows as any[] });
          if (rows.length !== current.length) {
            toast.info(`↓ Expenses synced from Sheets (${rows.length} records)`);
          }
        }
      }

      if (sheet === "Finance_Investments") {
        const current = useStore.getState().investments;
        const currentJSON = JSON.stringify(current);
        const newJSON = JSON.stringify(rows);
        if (currentJSON !== newJSON) {
          useStore.setState({ investments: rows as any[] });
          if (rows.length !== current.length) {
            toast.info(`↓ Investments synced from Sheets (${rows.length} records)`);
          }
        }
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

          const normalizedCurrent = useStore.getState().staff.map((s) => ({
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
            toast.info(`↓ Staff directory synced from Sheets`);
          }
        }
      }
    } catch (err) {
      // A read that failed leaves local state untouched, so treat it like a
      // deferral: forget the fingerprint and retry on the next poll.
      deferred.push(sheet);
      console.warn(`[RealtimeSync] Failed to reconcile ${sheet}:`, err);
    }
  }
  return deferred;
}

// ── Mobiles reconciliation ──────────────────────────────────────────────────
// Full-replace strategy: replace local with sheets data when digest changes.
async function reconcileMobiles(url: string, sheets: string[]): Promise<string[]> {
  const deferred: string[] = [];
  for (const sheet of sheets) {
    // See reconcileFinance — don't let a poll overwrite a local record whose
    // write to the sheet is still in flight.
    if (isSheetBusy(sheet)) { deferred.push(sheet); continue; }
    try {
      const rawRows = await readSheet(url, sheet as import("./googleSheets").SheetName);
      
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
            items: parsedItems,
          };
        }
        if (sheet === "Mobiles_SupplierPayments") {
          return {
            ...r,
            amount: Number(r.amount) || 0,
            cashAmount: r.cashAmount !== undefined ? Number(r.cashAmount) || 0 : undefined,
            bankAmount: r.bankAmount !== undefined ? Number(r.bankAmount) || 0 : undefined,
          };
        }
        return r;
      });

      // Full-replace reconciliation: compare and replace if different
      const fullReplace = (
        localList: { id: string }[],
        setter: (fn: (s: any) => any) => void,
        key: string
      ) => {
        const localIds = new Set(localList.map((x) => x.id));
        const sheetIds = new Set(rows.map((r) => String(r.id)));
        
        // Check if there are any differences (adds, deletes, or potential edits)
        const hasAdds = rows.some((r) => !localIds.has(String(r.id)));
        const hasDeletes = localList.some((x) => !sheetIds.has(x.id));
        const sizeChanged = rows.length !== localList.length;
        
        if (hasAdds || hasDeletes || sizeChanged) {
          setter(() => ({ [key]: rows as any[] }));
          if (hasDeletes) toast.info(`↩ Records removed from ${sheet} (synced)`);
          if (hasAdds) toast.info(`↓ New records from ${sheet} (synced)`);
          if (!hasAdds && !hasDeletes && sizeChanged) toast.info(`↓ ${sheet} synced`);
        } else if (rows.length > 0) {
          // Same IDs but might have field-level edits — do a lightweight content check
          const localJSON = JSON.stringify(localList.map(x => x.id).sort());
          const sheetJSON = JSON.stringify(rows.map((r: any) => String(r.id)).sort());
          if (localJSON === sheetJSON) {
            // IDs match, check if content differs
            setter(() => ({ [key]: rows as any[] }));
          }
        }
      };

      const store = useMobileStore.getState();
      const set = (fn: (s: any) => any) => useMobileStore.setState(fn);

      if (sheet === "Mobiles_Sales")            fullReplace(store.sales,            set, "sales");
      if (sheet === "Mobiles_Purchases")        fullReplace(store.purchases,        set, "purchases");
      if (sheet === "Mobiles_Products")         fullReplace(store.products,         set, "products");
      if (sheet === "Mobiles_Suppliers")        fullReplace(store.suppliers,        set, "suppliers");
      if (sheet === "Mobiles_Customers")        fullReplace(store.customers,        set, "customers");
      if (sheet === "Mobiles_Expenses")         fullReplace(store.expenses,         set, "expenses");
      if (sheet === "Mobiles_Accessories")      fullReplace(store.accessories,      set, "accessories");
      if (sheet === "Mobiles_SupplierPayments") fullReplace(store.supplierPayments || [], set, "supplierPayments");
      if (sheet === "Mobiles_WarrantyClaims")   fullReplace(store.warranties || [], set, "warranties");

    } catch (err) {
      deferred.push(sheet);
      console.warn(`[RealtimeSync] Failed to reconcile ${sheet}:`, err);
    }
  }
  return deferred;
}

