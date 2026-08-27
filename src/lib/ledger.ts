/**
 * ledger.ts
 *
 * Pure money rules shared by the cash-flow ledger and the supplier profile.
 * These used to live inline in components, where two of them were wrong in
 * ways that only showed up as mismatched totals on screen:
 *
 *  • The cash-flow ledger hardcoded `method: "UPI"` for purchases and supplier
 *    payments, so a bill settled in cash was reported as a bank outflow.
 *  • The supplier profile derived Paid/Due from a purchase's binary `status`,
 *    so a part payment showed Paid "—" with the full amount still Due.
 *  • It also summed "Paid" purchases AND supplier payments, double-counting
 *    every pay-now purchase (recordPurchase writes both records).
 *
 * Keeping them here makes each rule checkable on its own.
 */

/** Payment modes recorded across purchases, sales, expenses and supplier payments. */
export type PaymentMode = "Cash" | "UPI" | "Bank" | "Cash & UPI" | "Cash & Bank";

/**
 * Split a total into its cash and bank/UPI portions using whatever the record
 * actually stored. Explicit portions win over the mode; an unusable mode with
 * no portions keeps the historical bank-default so old rows don't move.
 */
export function splitByMethod(
  mode: string | undefined,
  total: number,
  cashAmount?: number,
  bankAmount?: number
): { cash: number; bank: number } {
  if (mode === "Cash & UPI" || mode === "Cash & Bank") {
    const cash = cashAmount !== undefined ? cashAmount : Math.floor(total / 2);
    const bank = bankAmount !== undefined ? bankAmount : total - cash;
    return { cash, bank };
  }
  if (mode === "Cash") return { cash: total, bank: 0 };
  if (mode === "UPI" || mode === "Bank") return { cash: 0, bank: total };
  if (cashAmount !== undefined || bankAmount !== undefined) {
    const cash = cashAmount ?? 0;
    return { cash, bank: bankAmount ?? Math.max(0, total - cash) };
  }
  return { cash: 0, bank: total };
}

/**
 * Coerce a stored optional money field to a number, or undefined if absent.
 *
 * saleRow() writes `cashAmountPaid ?? ""` to the sheet, and the reconciler
 * hands that back as an empty string. `"" !== undefined` is true, so callers
 * testing `field !== undefined` treated a blank as a real zero-ish value and
 * `"" > 0` then silently dropped the row — a sale's cash inflow disappeared
 * after a Sheets round-trip. Use this instead of comparing against undefined.
 */
export function toOptionalNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  // Strip formatting, but treat a value with no digits at all ("abc", "—") as
  // absent rather than 0 — a stray zero would look like a real split and
  // suppress the payment-method fallback.
  const cleaned = String(value).replace(/[^\d.-]/g, "");
  if (!cleaned || !/\d/.test(cleaned)) return undefined;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : undefined;
}

/** Minimal shape needed to settle a supplier's bills. */
export interface SettleablePurchase {
  id: string;
  date: string;
  amount: number;
  status: "Paid" | "Outstanding" | "Partial Paid" | "Not Paid" | string;
}

export interface SupplierSettlement {
  /** Sum of every bill logged against the supplier. */
  totalPurchases: number;
  /** Bills settled at the counter (pay-now), already fully paid. */
  immediatePaid: number;
  /** Money applied to credit bills through the supplier's Pay ledger. */
  ledgerPaid: number;
  /** immediatePaid + ledgerPaid, with no double counting. */
  totalPaid: number;
  /** What the supplier is still owed. */
  outstanding: number;
  /** Per-bill settlement, keyed by purchase id. */
  byPurchaseId: Map<string, { paid: number; due: number; label: "Paid" | "Partial" | "Outstanding" }>;
}

/**
 * Work out what each bill has actually received.
 *
 * A pay-now purchase is stored as a "Paid" purchase AND as a SupplierPayment,
 * so payments are only counted as ledger money to the extent they exceed the
 * pay-now bills. Whatever is left is spread across the credit bills
 * oldest-first, which is how a supplier ledger is normally cleared.
 */
export function settleSupplier(
  purchases: SettleablePurchase[],
  paymentTotal: number
): SupplierSettlement {
  const totalPurchases = purchases.reduce((sum, p) => sum + (p.amount || 0), 0);
  const immediatePaid = purchases
    .filter((p) => p.status === "Paid")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const creditPurchases = purchases.filter((p) => p.status !== "Paid");
  const creditTotal = creditPurchases.reduce((sum, p) => sum + (p.amount || 0), 0);
  const ledgerPaid = Math.min(creditTotal, Math.max(0, paymentTotal - immediatePaid));

  const byPurchaseId = new Map<string, { paid: number; due: number; label: "Paid" | "Partial" | "Outstanding" }>();
  for (const p of purchases) {
    if (p.status === "Paid") {
      byPurchaseId.set(p.id, { paid: p.amount || 0, due: 0, label: "Paid" });
    }
  }

  const oldestFirst = [...creditPurchases].sort((a, b) => {
    const at = new Date(a.date).getTime();
    const bt = new Date(b.date).getTime();
    if (Number.isNaN(at) || Number.isNaN(bt) || at === bt) return a.id.localeCompare(b.id);
    return at - bt;
  });

  let remaining = ledgerPaid;
  for (const p of oldestFirst) {
    const total = p.amount || 0;
    const paid = Math.min(Math.max(0, remaining), total);
    remaining -= paid;
    const due = Math.max(0, total - paid);
    byPurchaseId.set(p.id, {
      paid,
      due,
      label: due <= 0 ? "Paid" : paid > 0 ? "Partial" : "Outstanding",
    });
  }

  return {
    totalPurchases,
    immediatePaid,
    ledgerPaid,
    totalPaid: immediatePaid + ledgerPaid,
    outstanding: Math.max(0, creditTotal - ledgerPaid),
    byPurchaseId,
  };
}
