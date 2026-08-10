/**
 * useRealtimeSync.ts
 *
 * Real-time bidirectional sync between the app and Google Sheets.
 *
 * Strategy:
 *  1. Poll the "digest" endpoint every POLL_INTERVAL_MS (row counts only — fast).
 *  2. If any sheet count changed vs the last known digest → fetch full data for
 *     only those changed sheets and merge into the store.
 *  3. Deletions in Sheets: if a row ID exists locally but not in Sheets → delete locally.
 *  4. Auto-sync on every mutation: stores call syncToSheets after every add/edit/delete.
 */

import { useEffect, useRef } from "react";
import { useStore } from "./store";
import { useMobileStore } from "./mobileStore";
import { digestSheets, readSheet } from "./googleSheets";
import { toast } from "sonner";

/** Poll interval in milliseconds (30 seconds — respects Apps Script quotas) */
const POLL_INTERVAL_MS = 30_000;

/** Global flag so only ONE polling instance runs at a time (across React strict-mode double mounts) */
let pollerRunning = false;

export function useRealtimeSync() {
  const lastDigestRef = useRef<Record<string, number>>({});
  const isMountedRef  = useRef(true);

  // Finance store
  const finConfig       = useStore((s) => s.sheetsConfig);
  const finCustomers    = useStore((s) => s.customers);
  const finPayments     = useStore((s) => s.payments);
  const finExpenses     = useStore((s) => s.expenses);
  const finInvestments  = useStore((s) => s.investments);

  // Mobiles store
  const mobConfig       = useMobileStore((s) => s.sheetsConfig);
  const mobSales        = useMobileStore((s) => s.sales);
  const mobPurchases    = useMobileStore((s) => s.purchases);
  const mobProducts     = useMobileStore((s) => s.products);
  const mobSuppliers    = useMobileStore((s) => s.suppliers);
  const mobCustomers    = useMobileStore((s) => s.customers);
  const mobExpenses     = useMobileStore((s) => s.expenses);

  useEffect(() => {
    isMountedRef.current = true;

    // Only run if we have a configured URL
    const url = finConfig.url || mobConfig.url;
    if (!url || !finConfig.enabled) return;
    if (pollerRunning) return;

    pollerRunning = true;

    const poll = async () => {
      if (!isMountedRef.current) return;

      const activeUrl = useStore.getState().sheetsConfig.url;
      if (!activeUrl) return;

      try {
        // Step 1: Get row counts (cheap single call)
        const digest = await digestSheets(activeUrl);
        if (!digest || !isMountedRef.current) return;

        const prev = lastDigestRef.current;
        const changedFinance  = Object.keys(digest).filter(
          (k) => k.startsWith("Finance_") && digest[k] !== (prev[k] ?? -1)
        );
        const changedMobiles = Object.keys(digest).filter(
          (k) => k.startsWith("Mobiles_") && digest[k] !== (prev[k] ?? -1)
        );

        lastDigestRef.current = digest;

        // Step 2: Fetch only changed sheets
        if (changedFinance.length > 0) {
          await reconcileFinance(activeUrl, changedFinance);
        }
        if (changedMobiles.length > 0) {
          await reconcileMobiles(activeUrl, changedMobiles);
        }

        if (changedFinance.length > 0 || changedMobiles.length > 0) {
          // Update last sync time
          useStore.getState().updateSheetsConfig({ lastSync: new Date().toLocaleTimeString("en-IN") });
        }

      } catch (err) {
        // Silently ignore poll errors (no toast spam)
        console.warn("[RealtimeSync] Poll error:", err);
      }
    };

    // First poll after 2 seconds (let the UI settle)
    const initialTimer = setTimeout(poll, 2000);
    const interval = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      isMountedRef.current = false;
      pollerRunning = false;
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finConfig.url, finConfig.enabled]);
}

// ── Finance reconciliation ──────────────────────────────────────────────────
async function reconcileFinance(url: string, sheets: string[]) {
  const store = useStore.getState();

  for (const sheet of sheets) {
    try {
      const rows = await readSheet(url, sheet as import("./googleSheets").SheetName);

      if (sheet === "Finance_Customers") {
        const sheetIds = new Set(rows.map((r) => String(r.id)));
        const localIds = new Set(store.customers.map((c) => c.id));

        // Deletions: locally present but not in Sheets → remove
        const deleted = store.customers.filter((c) => !sheetIds.has(c.id));
        if (deleted.length > 0) {
          useStore.setState((s) => ({
            customers: s.customers.filter((c) => sheetIds.has(c.id)),
          }));
          toast.info(`↩ ${deleted.length} customer(s) removed (deleted from Sheets)`);
        }

        // Additions: in Sheets but not locally → add
        const added = rows.filter((r) => !localIds.has(String(r.id)));
        if (added.length > 0) {
          useStore.setState((s) => ({
            customers: [...s.customers, ...added as any[]],
          }));
          toast.info(`↓ ${added.length} new customer(s) synced from Sheets`);
        }
      }

      if (sheet === "Finance_Payments") {
        const sheetIds = new Set(rows.map((r) => String(r.id)));
        const localIds = new Set(store.payments.map((p) => p.id));
        const deleted  = store.payments.filter((p) => !sheetIds.has(p.id));
        const added    = rows.filter((r) => !localIds.has(String(r.id)));
        if (deleted.length > 0) {
          useStore.setState((s) => ({ payments: s.payments.filter((p) => sheetIds.has(p.id)) }));
        }
        if (added.length > 0) {
          useStore.setState((s) => ({ payments: [...added as any[], ...s.payments] }));
        }
      }

      if (sheet === "Finance_Expenses") {
        const sheetIds = new Set(rows.map((r) => String(r.id)));
        const localIds = new Set(store.expenses.map((e) => e.id));
        const deleted  = store.expenses.filter((e) => !sheetIds.has(e.id));
        const added    = rows.filter((r) => !localIds.has(String(r.id)));
        if (deleted.length > 0) {
          useStore.setState((s) => ({ expenses: s.expenses.filter((e) => sheetIds.has(e.id)) }));
        }
        if (added.length > 0) {
          useStore.setState((s) => ({ expenses: [...added as any[], ...s.expenses] }));
        }
      }

      if (sheet === "Finance_Investments") {
        const sheetIds = new Set(rows.map((r) => String(r.id)));
        const localIds = new Set(store.investments.map((i) => i.id));
        const deleted  = store.investments.filter((i) => !sheetIds.has(i.id));
        const added    = rows.filter((r) => !localIds.has(String(r.id)));
        if (deleted.length > 0) {
          useStore.setState((s) => ({ investments: s.investments.filter((i) => sheetIds.has(i.id)) }));
        }
        if (added.length > 0) {
          useStore.setState((s) => ({ investments: [...added as any[], ...s.investments] }));
        }
      }

      if (sheet === "Finance_Staff") {
        if (rows.length > 0) {
          const newStaffList = rows.map((r) => ({
            id: String(r.id || ""),
            name: String(r.name || ""),
            email: String(r.email || ""),
            role: String(r.role || "Staff"),
            status: (r.status || "Active") as "Active" | "Inactive",
            access: (r.access || "Both") as "Finance" | "Mobiles" | "Both",
            password: String(r.password || ""),
          }));
          const isDifferent = JSON.stringify(store.staff) !== JSON.stringify(newStaffList);
          if (isDifferent) {
            useStore.setState({ staff: newStaffList });
            toast.info(`↓ Staff directory synced from Sheets`);
          }
        }
      }
    } catch (err) {
      console.warn(`[RealtimeSync] Failed to reconcile ${sheet}:`, err);
    }
  }
}

// ── Mobiles reconciliation ──────────────────────────────────────────────────
async function reconcileMobiles(url: string, sheets: string[]) {
  const store = useMobileStore.getState();

  for (const sheet of sheets) {
    try {
      const rawRows = await readSheet(url, sheet as import("./googleSheets").SheetName);
      
      // Pre-process rows to parse items JSON strings into JavaScript arrays & sanitize numbers
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
        return r;
      });

      const reconcile = (
        localList: { id: string }[],
        setter: (fn: (s: any) => any) => void,
        key: string
      ) => {
        const sheetIds = new Set(rows.map((r) => String(r.id)));
        const localIds = new Set(localList.map((x) => x.id));
        const deleted  = localList.filter((x) => !sheetIds.has(x.id));
        const added    = rows.filter((r) => !localIds.has(String(r.id)));
        if (deleted.length > 0 || added.length > 0) {
          setter((s: any) => ({
            [key]: [
              ...added as any[],
              ...s[key].filter((x: any) => sheetIds.has(x.id)),
            ],
          }));
          if (deleted.length > 0) toast.info(`↩ ${deleted.length} record(s) removed from ${sheet}`);
          if (added.length > 0)   toast.info(`↓ ${added.length} new record(s) from ${sheet}`);
        }
      };

      const set = (fn: (s: any) => any) => useMobileStore.setState(fn);

      if (sheet === "Mobiles_Sales")      reconcile(store.sales,      set, "sales");
      if (sheet === "Mobiles_Purchases")  reconcile(store.purchases,  set, "purchases");
      if (sheet === "Mobiles_Products")   reconcile(store.products,   set, "products");
      if (sheet === "Mobiles_Suppliers")  reconcile(store.suppliers,  set, "suppliers");
      if (sheet === "Mobiles_Customers")  reconcile(store.customers,  set, "customers");
      if (sheet === "Mobiles_Expenses")   reconcile(store.expenses,   set, "expenses");
      if (sheet === "Mobiles_Accessories") reconcile(store.accessories, set, "accessories");

    } catch (err) {
      console.warn(`[RealtimeSync] Failed to reconcile ${sheet}:`, err);
    }
  }
}

