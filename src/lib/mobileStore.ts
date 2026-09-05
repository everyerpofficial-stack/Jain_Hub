import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "sonner";
import { safeLocalStorage } from "./safeStorage";
import { formatDateToInr, parseAppDate, useStore } from "./store";
import { type SheetsConfig, type SheetRow, type SheetName, writeSheet, clearSheets, readSheet, upsertRow, deleteRow, nowTimestamp } from "./googleSheets";
import { nextSeqId } from "./utils";
import { enqueueWrite, markIdDeleted, clearSyncState } from "./syncQueue";
import { resetRealtimeSyncCache } from "./useRealtimeSync";
import { toOptionalNumber } from "./ledger";

export const BRANDS_BY_CATEGORY: Record<string, string[]> = {
  "TV": [
    "Samsung", "LG", "Sony", "Mi / Xiaomi", "OnePlus", "Haier", "TCL", "Hisense",
    "Panasonic", "Vu", "Realme", "Thomson", "Lloyd", "Sansui", "Motorola"
  ],
  "Frize": [
    "LG", "Samsung", "Whirlpool", "Haier", "Godrej", "Bosch", "Panasonic", "Liebherr", "Lloyd"
  ],
  "Fridge (Frize)": [
    "LG", "Samsung", "Whirlpool", "Haier", "Godrej", "Bosch", "Panasonic", "Liebherr", "Lloyd"
  ],
  "Fridge": [
    "LG", "Samsung", "Whirlpool", "Haier", "Godrej", "Bosch", "Panasonic", "Liebherr", "Lloyd"
  ],
  "Waching Machine": [
    "LG", "Samsung", "Whirlpool", "IFB", "Bosch", "Haier", "Godrej", "Panasonic", "Lloyd"
  ],
  "Washing Machine": [
    "LG", "Samsung", "Whirlpool", "IFB", "Bosch", "Haier", "Godrej", "Panasonic", "Lloyd"
  ],
  "Smartphones": [
    "Apple", "Samsung", "OnePlus", "Vivo", "Oppo", "Xiaomi", "Realme", "Poco",
    "Motorola", "Nothing", "Nokia", "iQOO", "Google", "Techno", "Infinix", "Lava"
  ],
  "Basic Phones": [
    "Nokia", "Samsung", "Lava", "Itel", "Micromax", "Jio", "Karbonn"
  ],
  "Tablets": [
    "Apple", "Samsung", "Lenovo", "Xiaomi", "Realme", "OnePlus", "Nokia", "Motorola"
  ],
  "Accessories": [
    "boAt", "Noise", "Fire-Boltt", "Realme", "JBL", "Sony", "Apple", "Samsung",
    "OnePlus", "Boult", "Portronics", "Zebronics", "pTron", "Mi / Xiaomi"
  ]
};

export const DEFAULT_BRANDS_FALLBACK = [
  "Samsung", "Apple", "LG", "Sony", "OnePlus", "Vivo", "Oppo", "Xiaomi", "Realme", "Haier", "Whirlpool", "Godrej"
];

export function getBrandsForCategory(category: string): string[] {
  if (!category) return DEFAULT_BRANDS_FALLBACK;
  if (BRANDS_BY_CATEGORY[category]) return BRANDS_BY_CATEGORY[category];
  const trimmed = category.trim();
  if (BRANDS_BY_CATEGORY[trimmed]) return BRANDS_BY_CATEGORY[trimmed];
  return DEFAULT_BRANDS_FALLBACK;
}

/**
 * Line items for a record just read back from Google Sheets.
 *
 * Recovery path: an earlier version of the realtime poller re-uploaded raw
 * in-memory records, so a sale's/purchase's `items` array reached the sheet as
 * the string "[object Object]" and the per-product breakdown on that row was
 * destroyed — which is why purchased units stopped reaching stock. Those rows
 * still exist on the sheet. When the sheet copy is unusable but this device
 * still holds a good local copy of the same record, keep the local items
 * rather than letting the damaged row overwrite them.
 */
export function itemsFromSheet(raw: any, localItems: any): any[] {
  const parsed = safeItems(raw);
  if (parsed.length > 0) return parsed;
  const local = safeItems(localItems);
  return local.length > 0 ? local : [];
}

/** Safely parse items field whether it's an array, a JSON string from Google Sheets, or undefined */
export function safeItems<T = any>(items: any): T[] {
  if (Array.isArray(items)) return items;
  if (typeof items === "string" && items.trim().length > 0) {
    try {
      const parsed = JSON.parse(items);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [];
    }
  }
  return [];
}

export interface MobileProduct {
  id: string;
  name: string;
  brand: string;
  model: string;
  color: string;
  ramRom: string;
  category: string;
  purchasePrice: number;
  sellingPrice?: number;
  warranty?: string;
  barcode?: string;
  remark?: string;
  image?: string;
  status: "In Stock" | "Low Stock" | "Out of Stock";
}

export interface MobileInventoryItem {
  id: string;
  productId: string;
  productName: string;
  brand: string;
  quantity: number;
  minLimit: number;
  purchasePrice: number;
  sellingPrice: number;
  profitMargin: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
}

export interface MobileSupplier {
  id: string;
  name: string;
  gstNo?: string;
  contact: string;
  email?: string;
  address: string;
  outstanding: number;
}

export interface MobilePurchase {
  id: string;
  supplierId: string;
  supplierName: string;
  invoiceNo: string;
  date: string;
  quantity: number;
  amount: number;
  gst: number;
  status: "Paid" | "Partial Paid" | "Not Paid" | "Outstanding";
  paymentStatus: "Paid" | "Partial Paid" | "Not Paid";
  amountPaid: number;
  dueAmount: number;
  paymentMode?: "Cash" | "UPI" | "Cash & UPI" | "Bank" | "Cash & Bank";
  cashAmount?: number;
  bankAmount?: number;
  paymentRemark?: string;
  items: { productId: string; productName: string; quantity: number; cost: number }[];
}

export interface SaleItem {
  productId: string;
  productName: string;
  brand?: string;
  quantity: number;
  price: number;
  imei1?: string;
  imei2?: string;
}

export interface MobileSale {
  id: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  fatherName?: string;
  village?: string;
  date: string;
  dueDate?: string;
  subtotal: number;
  gst: number;
  totalAmount: number;
  paymentMethod: "Cash" | "UPI" | "Cash & UPI";
  paymentStatus: "Full Paid" | "Partial Paid" | "Not Paid";
  amountPaid: number;
  dueAmount: number;
  cashAmountPaid?: number;
  upiAmountPaid?: number;
  items: SaleItem[];
}

export interface MobileCustomer {
  id: string;
  name: string;
  mobile: string;
  email: string;
  address: string;
  registeredDate: string;
  fatherName?: string;
  village?: string;
  isBlacklisted?: boolean;
}

export interface MobileImei {
  imei1: string;
  imei2: string;
  serialNo: string;
  productId: string;
  productName: string;
  brand: string;
  status: "Available" | "Sold" | "Returned" | "Damaged";
  saleId?: string;
  purchaseId?: string;
}

export interface MobileAccessory {
  id: string;
  name: string;
  category: string; // Charger, Case, Screen Guard, Earbuds, etc.
  stock: number;
  minLimit: number;
  purchasePrice: number;
  sellingPrice: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
}

export interface MobileWarrantyClaim {
  id: string;
  customerName: string;
  customerMobile: string;
  productName: string;
  imei: string;
  claimDate: string;
  issue: string;
  status: "Pending" | "Sent to Brand" | "Resolved" | "Rejected";
}

export interface MobileSettings {
  storeName: string;
  gstNo: string;
  contact: string;
  email: string;
  address: string;
  invoicePrefix: string;
}

export interface SupplierPayment {
  id: string;
  supplierId: string;
  supplierName: string;
  amount: number;
  date: string;
  remark?: string;
  paymentMode?: "Cash" | "UPI" | "Cash & UPI" | "Bank" | "Cash & Bank";
  cashAmount?: number;
  bankAmount?: number;
}

export interface MobileExpense {
  id: string;
  date: string;
  cat: string;
  desc: string;
  amount: string;
  type?: "Income" | "Expense";
  paymentMode?: "Cash" | "UPI" | "Cash & UPI" | "Bank" | "Cash & Bank";
  cashAmount?: number;
  bankAmount?: number;
}

export interface MobileAuditEntry {
  id?: string;
  ts: string;
  user: string;
  action: string;
  target: string;
}

interface MobilesState {
  products: MobileProduct[];
  inventory: MobileInventoryItem[];
  suppliers: MobileSupplier[];
  purchases: MobilePurchase[];
  sales: MobileSale[];
  customers: MobileCustomer[];
  imeis: MobileImei[];
  accessories: MobileAccessory[];
  warranties: MobileWarrantyClaim[];
  settings: MobileSettings;
  supplierPayments: SupplierPayment[];
  expenses: MobileExpense[];
  audit: MobileAuditEntry[];
  pushAudit: (e: { action: string; target: string; user?: string; id?: string }) => void;

  // Actions
  addExpense: (e: Omit<MobileExpense, "id" | "date"> & { date?: string }) => MobileExpense;
  deleteExpense: (id: string) => void;
  addProduct: (p: Omit<MobileProduct, "id" | "status">) => void;
  updateProduct: (id: string, p: Partial<MobileProduct>) => void;
  deleteProduct: (id: string) => void;
  
  adjustStock: (productId: string, qtyChange: number) => void;
  stockIn: (productId: string, quantity: number, cost: number) => void;
  /** Rebuild every inventory row from products + purchases − sales. */
  recomputeInventory: () => void;
  
  addSupplier: (s: Omit<MobileSupplier, "id" | "outstanding">) => void;
  updateSupplier: (id: string, s: Partial<MobileSupplier>) => void;
  deleteSupplier: (id: string) => void;
  paySupplier: (
    id: string,
    amount: number,
    date: string,
    remark?: string,
    paymentMode?: "Cash" | "UPI" | "Cash & UPI" | "Bank" | "Cash & Bank",
    cashAmount?: number,
    bankAmount?: number
  ) => void;
  
  recordPurchase: (pur: Omit<MobilePurchase, "id" | "amount" | "gst" | "status" | "paymentStatus" | "amountPaid" | "dueAmount"> & {
    payNow?: boolean;
    paymentStatus?: "Paid" | "Partial Paid" | "Not Paid";
    amountPaid?: number;
    paymentMode?: "Cash" | "UPI" | "Cash & UPI" | "Bank" | "Cash & Bank";
    cashAmount?: number;
    bankAmount?: number;
    paymentRemark?: string;
  }) => MobilePurchase;
  payPurchaseBalance: (
    purchaseId: string,
    amount: number,
    paymentMode?: "Cash" | "UPI" | "Cash & UPI",
    cashAmount?: number,
    bankAmount?: number,
    remark?: string,
    date?: string
  ) => void;
  createBill: (sale: Omit<MobileSale, "id" | "subtotal" | "gst" | "totalAmount" | "paymentStatus" | "amountPaid" | "dueAmount"> & { date?: string; paymentStatus?: MobileSale["paymentStatus"]; amountPaid?: number; dueAmount?: number }) => MobileSale;
  collectSalePayment: (saleId: string, amount: number, paymentMethod: "Cash" | "UPI", date?: string) => void;
  
  addCustomer: (c: Omit<MobileCustomer, "id" | "registeredDate">) => MobileCustomer;
  updateCustomer: (id: string, c: Partial<MobileCustomer>) => void;
  deleteCustomer: (id: string) => void;
  
  addImei: (imei: MobileImei) => void;
  updateImeiStatus: (imei1: string, status: MobileImei["status"]) => void;
  
  addAccessory: (a: Omit<MobileAccessory, "id" | "status">) => void;
  updateAccessory: (id: string, a: Partial<MobileAccessory>) => void;
  deleteAccessory: (id: string) => void;
  sellAccessory: (id: string, qty: number) => void;
  
  addWarrantyClaim: (w: Omit<MobileWarrantyClaim, "id" | "claimDate" | "status">) => void;
  updateWarrantyStatus: (id: string, status: MobileWarrantyClaim["status"]) => void;
  
  updateSettings: (s: Partial<MobileSettings>) => void;
  resetAll: () => Promise<void>;
  sheetsConfig: SheetsConfig;
  updateSheetsConfig: (cfg: Partial<SheetsConfig>) => void;
  syncToSheets: () => Promise<{ ok: boolean; error?: string }>;
  loadFromSheets: () => Promise<{ ok: boolean; error?: string }>;
}

// Helper to determine status based on quantities
const getQtyStatus = (qty: number, minLimit: number): "In Stock" | "Low Stock" | "Out of Stock" => {
  if (qty <= 0) return "Out of Stock";
  if (qty <= minLimit) return "Low Stock";
  return "In Stock";
};

/**
 * Rebuild the entire inventory table from the records that actually move
 * stock: one row per product, quantity = (units purchased − units sold).
 *
 * Inventory rows used to be created ONLY by addProduct() and changed ONLY by
 * adjustStock(), and there is no inventory sheet — so the moment a browser got
 * its product catalogue from Google Sheets instead of from its own addProduct()
 * calls (a second device, or this one after its local storage was cleared or
 * reset), those products had NO inventory row at all. adjustStock() then
 * matched nothing on every purchase, the units went nowhere, and the shop was
 * left with Inventory showing "0 stock records", every product "Out of Stock",
 * and every option in the sales dropdown disabled — while the purchase log
 * happily showed the units as received.
 *
 * Deriving the quantity instead of storing it means any device can reproduce
 * it from the purchase/sale ledgers (which DO sync), and a device that starts
 * from a bad or empty inventory heals itself on the next recompute.
 */
function buildInventory(
  products: MobileProduct[],
  purchases: MobilePurchase[],
  sales: MobileSale[],
  existing: MobileInventoryItem[]
): MobileInventoryItem[] {
  const purchasedQty = new Map<string, number>();
  const soldQty = new Map<string, number>();
  // Unit cost from the most recent purchase that included the product.
  const latestCost = new Map<string, { cost: number; time: number }>();

  (purchases || []).forEach((pur, idx) => {
    if (!pur) return;
    // Older/newer ordering differs between locally-added (newest first) and
    // sheet-loaded (append order) lists, so rank on the parsed date and only
    // fall back to array position when two dates tie.
    const parsed = parseAppDate(typeof pur.date === "string" ? pur.date : String(pur.date ?? ""));
    const time = (parsed ? parsed.getTime() : 0) - idx / 1e6;
    safeItems<{ productId?: string; quantity?: number; cost?: number }>(pur.items).forEach((item) => {
      const pid = String(item?.productId || "");
      if (!pid) return;
      const qty = Number(item?.quantity) || 0;
      purchasedQty.set(pid, (purchasedQty.get(pid) ?? 0) + qty);
      const cost = Number(item?.cost) || 0;
      const prev = latestCost.get(pid);
      if (cost > 0 && (!prev || time > prev.time)) latestCost.set(pid, { cost, time });
    });
  });

  (sales || []).forEach((sale) => {
    if (!sale) return;
    safeItems<{ productId?: string; quantity?: number }>(sale.items).forEach((item) => {
      const pid = String(item?.productId || "");
      if (!pid) return;
      soldQty.set(pid, (soldQty.get(pid) ?? 0) + (Number(item?.quantity) || 0));
    });
  });

  const byProductId = new Map((existing || []).filter(Boolean).map((inv) => [String(inv.productId), inv]));
  const usedIds = new Set<string>();

  return (products || []).filter(Boolean).map((p) => {
    const pid = String(p.id);
    const prev = byProductId.get(pid);
    // Never reuse an id another row already claimed — duplicate keys in the
    // persisted list would otherwise collide in React and in every lookup.
    let id = prev?.id;
    if (!id || usedIds.has(id)) id = nextSeqId("INV-", [...usedIds]);
    usedIds.add(id);

    const quantity = Math.max(0, (purchasedQty.get(pid) ?? 0) - (soldQty.get(pid) ?? 0));
    const minLimit = Number(prev?.minLimit);
    const limit = Number.isFinite(minLimit) && minLimit > 0 ? minLimit : 3;
    const purchasePrice = latestCost.get(pid)?.cost ?? (Number(p.purchasePrice) || 0);
    const sellingPrice = Number(p.sellingPrice) || Number(prev?.sellingPrice) || 0;

    return {
      id,
      productId: pid,
      productName: p.name,
      brand: p.brand,
      quantity,
      minLimit: limit,
      purchasePrice,
      sellingPrice,
      profitMargin: sellingPrice - purchasePrice,
      status: getQtyStatus(quantity, limit),
    };
  });
}

// Seed Mock Data
const initialProducts: MobileProduct[] = [];
const initialInventory: MobileInventoryItem[] = [];
const initialSuppliers: MobileSupplier[] = [];
const initialPurchases: MobilePurchase[] = [];
const initialCustomers: MobileCustomer[] = [];
const initialSales: MobileSale[] = [];
const initialImeis: MobileImei[] = [];
const initialAccessories: MobileAccessory[] = [];
const initialWarranties: MobileWarrantyClaim[] = [];

const initialExpenses: MobileExpense[] = [];

const seedMobileAudit: MobileAuditEntry[] = [];

// Fingerprints of the fake demo entries this seed used to contain. Audit
// logs are local-only (never synced to the Google Sheet), so a browser that
// loaded an old build before this was emptied has these permanently cached
// in localStorage — emptying the seed above only prevents it for *new*
// browsers. This list lets already-affected browsers self-clean on load.
const FAKE_MOBILE_AUDIT_TS = new Set([
  "28 Jul 2026, 10:30 AM", "28 Jul 2026, 09:15 AM", "27 Jul 2026, 05:45 PM",
  "27 Jul 2026, 01:20 PM", "26 Jul 2026, 03:10 PM", "26 Jul 2026, 11:05 AM",
  "25 Jul 2026, 04:30 PM",
]);

const defaultSettings: MobileSettings = {
  storeName: "Jain Mobiles & Electronics",
  gstNo: "27JAINMOB9812A1ZX",
  contact: "+91 98220 12345",
  email: "contact@jainmobiles.com",
  address: "Shop No. 5, Municipal Market, Shirwal, Satara, Maharashtra - 412801",
  invoicePrefix: "JM-INV-"
};

// ── Sheet row shape builders ──────────────────────────────────────────────────
// Single source of truth for how each entity maps to its sheet's columns —
// used both by the full-table syncToSheets() below and by the per-record
// upsert/delete calls each mutator makes, so the two paths can't drift.
export function saleRow(s: MobileSale): SheetRow {
  return {
    id: s.id,
    customerName: s.customerName,
    customerMobile: s.customerMobile,
    fatherName: s.fatherName || "",
    village: s.village || "",
    date: s.date,
    dueDate: s.dueDate || "",
    subtotal: s.subtotal,
    gst: s.gst,
    totalAmount: s.totalAmount,
    paymentMethod: s.paymentMethod,
    paymentStatus: s.paymentStatus,
    amountPaid: s.amountPaid,
    dueAmount: s.dueAmount,
    cashAmountPaid: s.cashAmountPaid ?? "",
    upiAmountPaid: s.upiAmountPaid ?? "",
    items: JSON.stringify(s.items || []),
  };
}
export function purchaseRow(p: MobilePurchase): SheetRow {
  const pStatus = p.paymentStatus || (p.status === "Paid" ? "Paid" : p.status === "Partial Paid" ? "Partial Paid" : "Not Paid");
  const paid = p.amountPaid !== undefined ? p.amountPaid : (pStatus === "Paid" ? p.amount : 0);
  const due = p.dueAmount !== undefined ? p.dueAmount : Math.max(0, p.amount - paid);
  return {
    id: p.id, supplierId: p.supplierId || "", supplierName: p.supplierName, invoiceNo: p.invoiceNo,
    date: p.date, quantity: p.quantity, amount: p.amount,
    status: pStatus,
    paymentStatus: pStatus,
    amountPaid: paid,
    dueAmount: due,
    gst: p.gst,
    paymentMode: p.paymentMode || "",
    cashAmount: p.cashAmount ?? "",
    bankAmount: p.bankAmount ?? "",
    paymentRemark: p.paymentRemark || "",
    items: JSON.stringify(p.items || []),
  };
}
export function mobileExpenseRow(e: MobileExpense): SheetRow {
  return {
    id: e.id, date: e.date, cat: e.cat, desc: e.desc,
    amount: e.amount, type: e.type ?? "Expense", paymentMode: e.paymentMode ?? "Cash",
    cashAmount: e.cashAmount ?? "",
    bankAmount: e.bankAmount ?? "",
  };
}
export function supplierRow(s: MobileSupplier): SheetRow {
  return {
    id: s.id, name: s.name, gstNo: s.gstNo ?? "", contact: s.contact,
    // email was missing from the row and was lost on every sheet round-trip.
    email: s.email ?? "",
    address: s.address, outstanding: s.outstanding,
  };
}
export function supplierPaymentRow(p: SupplierPayment): SheetRow {
  return {
    // supplierId was omitted, so after a reload payments could only be matched
    // back to a vendor by name — renaming a supplier detached their history.
    id: p.id, supplierId: p.supplierId || "", supplierName: p.supplierName, amount: p.amount,
    date: p.date, remark: p.remark ?? "",
    paymentMode: p.paymentMode ?? "Cash",
    cashAmount: p.cashAmount ?? "",
    bankAmount: p.bankAmount ?? "",
  };
}
export function mobileCustomerRow(c: MobileCustomer): SheetRow {
  return {
    id: c.id, name: c.name, mobile: c.mobile, email: c.email,
    address: c.address, registeredDate: c.registeredDate,
    fatherName: c.fatherName || "",
    village: c.village || "",
    isBlacklisted: c.isBlacklisted ? "true" : "false",
  };
}
export function productRow(p: MobileProduct): SheetRow {
  return {
    id: p.id, name: p.name, brand: p.brand, model: p.model,
    color: p.color, ramRom: p.ramRom, category: p.category,
    purchasePrice: p.purchasePrice, sellingPrice: p.sellingPrice ?? 0, status: p.status,
    // These were absent from the row, so every sheet round-trip silently
    // erased them from the catalogue. (`image` stays out on purpose — it can
    // be a base64 data URL, far past what a single cell will hold.)
    warranty: p.warranty ?? "", barcode: p.barcode ?? "", remark: p.remark ?? "",
  };
}
export function accessoryRow(a: MobileAccessory): SheetRow {
  return {
    id: a.id, name: a.name, category: a.category,
    stock: a.stock, minLimit: a.minLimit,
    purchasePrice: a.purchasePrice, sellingPrice: a.sellingPrice,
    status: a.status,
  };
}
/**
 * The shop profile is a single record, so it occupies one fixed-id row.
 * It prints on every sales invoice and purchase bill, yet it used to live
 * only in the browser it was typed into — a second device kept showing the
 * seeded placeholder name and GST number on customer-facing paperwork.
 */
export const MOBILE_SETTINGS_ROW_ID = "MOBILE_SETTINGS";
export function mobileSettingsRow(s: MobileSettings): SheetRow {
  return {
    id: MOBILE_SETTINGS_ROW_ID,
    storeName: s.storeName || "", gstNo: s.gstNo || "", contact: s.contact || "",
    email: s.email || "", address: s.address || "", invoicePrefix: s.invoicePrefix || "",
  };
}
export function warrantyRow(w: MobileWarrantyClaim): SheetRow {
  return {
    id: w.id, customerName: w.customerName, mobile: w.customerMobile || "",
    productName: w.productName, imei: w.imei, claimDate: w.claimDate,
    issueDescription: w.issue || "", status: w.status,
  };
}

export function auditRow(a: MobileAuditEntry): SheetRow {
  const tsId = String(a.ts || "").replace(/[^a-zA-Z0-9]/g, "_");
  const actionId = String(a.action || "").replace(/[^a-zA-Z0-9]/g, "_");
  const userId = String(a.user || "").replace(/[^a-zA-Z0-9]/g, "_");
  const rowId = a.id || `AUD-M-${tsId}-${userId}-${actionId}`;
  return {
    id: rowId,
    ts: a.ts,
    user: a.user,
    action: a.action,
    target: a.target,
  };
}

export function auditFromRow(r: SheetRow): MobileAuditEntry {
  return {
    id: String(r.id ?? ""),
    ts: String(r.ts ?? ""),
    user: String(r.user ?? "System"),
    action: String(r.action ?? "Action"),
    target: String(r.target ?? "—"),
  };
}

// ── Per-record sync helpers ─────────────────────────────────────────────────
// Mutators call these instead of the full syncToSheets(), so a single add/
// edit/delete only ever touches its own row(s) on the shared sheet — see
// the matching comment in store.ts for why a full-table rewrite on every
// mutation caused lost updates between devices.
function syncUpsert(get: () => MobilesState, sheet: SheetName, row: SheetRow, label: string) {
  const { sheetsConfig } = get();
  if (sheetsConfig.enabled && sheetsConfig.url) {
    const url = sheetsConfig.url;
    void enqueueWrite(sheet, label, () => upsertRow(url, sheet, row));
  }
}
function syncDelete(get: () => MobilesState, sheet: SheetName, id: string, label: string) {
  markIdDeleted(sheet, id);
  const { sheetsConfig } = get();
  if (sheetsConfig.enabled && sheetsConfig.url) {
    const url = sheetsConfig.url;
    void enqueueWrite(sheet, label, () => deleteRow(url, sheet, id));
  }
}

// ── PERMANENT GOOGLE SHEETS DATABASE URL ─────────────────────────────────────
const PERMANENT_SHEETS_URL =
  (import.meta.env.VITE_GOOGLE_SHEETS_URL as string) ||
  "https://script.google.com/macros/s/AKfycbwHwPiu9_3U5D-g819nikVbyMoeJq_myynn75pAufETx4kQdVgfGlTQvlPiRJvLYRGMXQ/exec";

export const useMobileStore = create<MobilesState>()(
  persist(
    (set, get) => ({
      products: initialProducts,
      inventory: initialInventory,
      suppliers: initialSuppliers,
      purchases: initialPurchases,
      sales: initialSales,
      customers: initialCustomers,
      imeis: initialImeis,
      accessories: initialAccessories,
      warranties: initialWarranties,
      settings: defaultSettings,
      supplierPayments: [],
      expenses: initialExpenses,
      audit: seedMobileAudit,
      pushAudit: (e) => {
        const currentUser = useStore.getState().currentUser;
        const user = e.user || currentUser?.name || "Admin";
        const ts = new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
        const entry: MobileAuditEntry = {
          id: e.id || `AUD-M-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          ts,
          user,
          action: e.action,
          target: e.target,
        };
        set((s) => ({ audit: [entry, ...s.audit] }));
        syncUpsert(get, "Mobiles_Audit", auditRow(entry), "mobiles audit log");
      },
      sheetsConfig: {
        url: PERMANENT_SHEETS_URL,
        enabled: true,
        lastSync: undefined
      },

      addProduct: (p) => {
        const id = nextSeqId("MP-", get().products.map((x) => x.id));
        const newProduct: MobileProduct = { ...p, id, status: "In Stock" };

        // Also insert into Inventory
        const invId = nextSeqId("INV-", get().inventory.map((x) => x.id));
        const newInvItem: MobileInventoryItem = {
          id: invId,
          productId: id,
          productName: p.name,
          brand: p.brand,
          quantity: 0,
          minLimit: 3,
          purchasePrice: p.purchasePrice,
          sellingPrice: p.sellingPrice || 0,
          profitMargin: (p.sellingPrice || 0) - p.purchasePrice,
          status: "Out of Stock"
        };

        set((state) => ({
          products: [...state.products, newProduct],
          inventory: [...state.inventory, newInvItem]
        }));
        // Inventory has no sheet of its own — only the product row syncs; the
        // quantities are re-derived from the purchase/sale ledgers instead.
        get().recomputeInventory();
        syncUpsert(get, "Mobiles_Products", productRow(newProduct), "product add");
        get().pushAudit({
          action: "Created Product",
          target: `${newProduct.brand} ${newProduct.name} (${id}) · Selling Price: ₹${newProduct.sellingPrice}`,
        });
      },

      updateProduct: (id, updatedFields) => {
        set((state) => {
          const products = state.products.map((p) =>
            p.id === id ? { ...p, ...updatedFields } : p
          );
          const inventory = state.inventory.map((inv) => {
            if (inv.productId === id) {
              const purchasePrice = updatedFields.purchasePrice ?? inv.purchasePrice;
              const sellingPrice = updatedFields.sellingPrice ?? inv.sellingPrice;
              return {
                ...inv,
                productName: updatedFields.name ?? inv.productName,
                brand: updatedFields.brand ?? inv.brand,
                purchasePrice,
                sellingPrice,
                profitMargin: sellingPrice - purchasePrice
              };
            }
            return inv;
          });
          return { products, inventory };
        });
        get().recomputeInventory();
        const updatedProduct = get().products.find((p) => p.id === id);
        if (updatedProduct) {
          syncUpsert(get, "Mobiles_Products", productRow(updatedProduct), "product update");
          get().pushAudit({
            action: "Updated Product",
            target: `${updatedProduct.brand} ${updatedProduct.name} (${id})`,
          });
        }
      },

      deleteProduct: (id) => {
        const deletedP = get().products.find((p) => p.id === id);
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
          inventory: state.inventory.filter((inv) => inv.productId !== id)
        }));
        syncDelete(get, "Mobiles_Products", id, "product delete");
        get().pushAudit({
          action: "Deleted Product",
          target: `Product ID: ${id} ${deletedP ? `(${deletedP.brand} ${deletedP.name})` : ""}`,
        });
      },

      recomputeInventory: () => {
        set((state) => {
          const inventory = buildInventory(state.products, state.purchases, state.sales, state.inventory);
          const statusByProduct = new Map(inventory.map((inv) => [inv.productId, inv.status]));
          const products = state.products.map((p) =>
            p && statusByProduct.has(p.id) ? { ...p, status: statusByProduct.get(p.id)! } : p
          );
          return { inventory, products };
        });
      },

      adjustStock: (productId, qtyChange) => {
        set((state) => {
          // A product with no inventory row (catalogue pulled from Sheets on a
          // fresh device) used to swallow the movement silently. Create the row
          // on demand so the units land somewhere.
          const hasRow = state.inventory.some((inv) => inv && inv.productId === productId);
          const product = state.products.find((p) => p && p.id === productId);
          let base = state.inventory;
          if (!hasRow && product) {
            base = [
              ...state.inventory,
              {
                id: nextSeqId("INV-", state.inventory.map((x) => x.id)),
                productId,
                productName: product.name,
                brand: product.brand,
                quantity: 0,
                minLimit: 3,
                purchasePrice: Number(product.purchasePrice) || 0,
                sellingPrice: Number(product.sellingPrice) || 0,
                profitMargin: (Number(product.sellingPrice) || 0) - (Number(product.purchasePrice) || 0),
                status: "Out of Stock" as const,
              },
            ];
          }

          const inventory = base.map((inv) => {
            if (inv.productId === productId) {
              const quantity = Math.max(0, (Number(inv.quantity) || 0) + qtyChange);
              const status = getQtyStatus(quantity, inv.minLimit);
              return { ...inv, quantity, status };
            }
            return inv;
          });

          const products = state.products.map((p) => {
            if (p && p.id === productId) {
              const invItem = inventory.find((inv) => inv.productId === productId);
              return { ...p, status: invItem ? invItem.status : p.status };
            }
            return p;
          });

          return { inventory, products };
        });
      },

      stockIn: (productId, quantity, cost) => {
        // Simple stock in adjustment
        get().adjustStock(productId, quantity);
        set((state) => {
          const inventory = state.inventory.map((inv) => {
            if (inv.productId === productId) {
              return { ...inv, purchasePrice: cost, profitMargin: inv.sellingPrice - cost };
            }
            return inv;
          });
          return { inventory };
        });
      },

      addSupplier: (s) => {
        const id = nextSeqId("MS-", get().suppliers.map((x) => x.id));
        const newSupplier: MobileSupplier = { ...s, id, outstanding: 0 };
        set((state) => ({ suppliers: [...state.suppliers, newSupplier] }));
        syncUpsert(get, "Mobiles_Suppliers", supplierRow(newSupplier), "supplier add");
        get().pushAudit({
          action: "Added Supplier",
          target: `${newSupplier.name} (${newSupplier.contact || "No Contact"})`,
        });
      },

      updateSupplier: (id, updatedFields) => {
        set((state) => ({
          suppliers: state.suppliers.map((s) => (s.id === id ? { ...s, ...updatedFields } : s))
        }));
        const updatedSupplier = get().suppliers.find((s) => s.id === id);
        if (updatedSupplier) {
          syncUpsert(get, "Mobiles_Suppliers", supplierRow(updatedSupplier), "supplier update");
          get().pushAudit({
            action: "Updated Supplier",
            target: `Supplier ID: ${id} (${updatedSupplier.name})`,
          });
        }
      },

      deleteSupplier: (id) => {
        const deletedSup = get().suppliers.find((s) => s.id === id);
        set((state) => ({ suppliers: state.suppliers.filter((s) => s.id !== id) }));
        syncDelete(get, "Mobiles_Suppliers", id, "supplier delete");
        get().pushAudit({
          action: "Deleted Supplier",
          target: `Supplier ID: ${id} ${deletedSup ? `(${deletedSup.name})` : ""}`,
        });
      },

      paySupplier: (id, amount, date, remark, paymentMode = "Cash", cashAmount, bankAmount) => {
        const idKey = String(id ?? "").trim().toLowerCase();
        const supplier = get().suppliers.find(
          (s) => s.id === id || String(s?.name ?? "").trim().toLowerCase() === idKey
        );
        if (!supplier) return;
        const newPayment: SupplierPayment = {
          id: nextSeqId("SPM-", (get().supplierPayments || []).map((x) => x.id)),
          supplierId: supplier.id,
          supplierName: supplier.name,
          amount,
          date,
          remark,
          paymentMode,
          cashAmount,
          bankAmount,
        };
        set((state) => ({
          suppliers: state.suppliers.map((s) =>
            s.id === supplier.id ? { ...s, outstanding: Math.max(0, s.outstanding - amount) } : s
          ),
          supplierPayments: [newPayment, ...(state.supplierPayments || [])]
        }));
        syncUpsert(get, "Mobiles_SupplierPayments", supplierPaymentRow(newPayment), "supplier payment");
        const updatedSupplier = get().suppliers.find((s) => s.id === supplier.id);
        if (updatedSupplier) syncUpsert(get, "Mobiles_Suppliers", supplierRow(updatedSupplier), "supplier balance (from payment)");
        get().pushAudit({
          action: "Vendor Payment",
          target: `Paid ₹${amount.toLocaleString("en-IN")} to ${supplier.name} (${paymentMode})`,
        });
      },

      recordPurchase: (pur) => {
        const id = nextSeqId("MPR-", get().purchases.map((x) => x.id));
        const subtotal = pur.items.reduce((sum, item) => sum + item.quantity * item.cost, 0);
        const total = subtotal;

        let rawStatus: "Paid" | "Partial Paid" | "Not Paid" =
          pur.paymentStatus || (pur.payNow ? "Paid" : "Not Paid");

        let amountPaid = 0;
        if (rawStatus === "Paid") {
          amountPaid = total;
        } else if (rawStatus === "Partial Paid") {
          amountPaid = Math.min(total, Math.max(0, Number(pur.amountPaid) || 0));
          if (amountPaid <= 0) {
            rawStatus = "Not Paid";
          } else if (amountPaid >= total) {
            rawStatus = "Paid";
          }
        } else {
          amountPaid = 0;
        }

        const dueAmount = Math.max(0, total - amountPaid);
        const paymentStatus = rawStatus;
        const status = paymentStatus;

        let supplier = get().suppliers.find(
          (s) =>
            s.id === pur.supplierId ||
            (!!pur.supplierName &&
              String(s?.name ?? "").trim().toLowerCase() === String(pur.supplierName).trim().toLowerCase())
        );

        if (!supplier && pur.supplierName) {
          const supId = nextSeqId("MS-", get().suppliers.map((x) => x.id));
          supplier = { id: supId, name: pur.supplierName, contact: "—", address: "—", outstanding: 0 };
          set((state) => ({ suppliers: [...state.suppliers, supplier!] }));
        }

        const newPurchase: MobilePurchase = {
          ...pur,
          supplierId: supplier ? supplier.id : pur.supplierId,
          supplierName: supplier ? supplier.name : pur.supplierName,
          id,
          amount: total,
          gst: 0,
          status,
          paymentStatus,
          amountPaid,
          dueAmount,
        };

        // Update inventory quantities & purchase prices
        pur.items.forEach((item) => {
          get().adjustStock(item.productId, item.quantity);
          set((state) => ({
            inventory: state.inventory.map((inv) =>
              inv.productId === item.productId
                ? { ...inv, purchasePrice: item.cost, profitMargin: inv.sellingPrice - item.cost }
                : inv
            )
          }));
        });

        // Add remaining due amount to supplier ledger outstanding debt
        if (dueAmount > 0 && supplier) {
          set((state) => ({
            suppliers: state.suppliers.map((s) =>
              s.id === supplier!.id ? { ...s, outstanding: s.outstanding + dueAmount } : s
            )
          }));
        }

        // If upfront payment was made, log SupplierPayment
        if (amountPaid > 0 && supplier) {
          const pMode = pur.paymentMode || "Cash";
          const cAmt = pur.cashAmount !== undefined ? pur.cashAmount : pMode === "Cash" ? amountPaid : pMode === "Cash & UPI" ? amountPaid / 2 : 0;
          const bAmt = pur.bankAmount !== undefined ? pur.bankAmount : pMode === "UPI" || pMode === "Bank" ? amountPaid : pMode === "Cash & UPI" ? amountPaid / 2 : 0;
          const newPayment: SupplierPayment = {
            id: nextSeqId("SPM-", (get().supplierPayments || []).map((x) => x.id)),
            supplierId: supplier.id,
            supplierName: supplier.name,
            amount: amountPaid,
            date: pur.date,
            remark: pur.paymentRemark || `${paymentStatus} payment for Purchase Bill ${pur.invoiceNo} (${pMode})`,
            paymentMode: pMode,
            cashAmount: cAmt,
            bankAmount: bAmt,
          };
          set((state) => ({
            supplierPayments: [newPayment, ...(state.supplierPayments || [])]
          }));
        }

        set((state) => ({
          purchases: [newPurchase, ...state.purchases]
        }));

        // Re-derive from the ledger now that this bill is recorded, so the
        // stock figure matches the invoices even if the incremental
        // adjustStock() calls above had nothing to increment.
        get().recomputeInventory();

        syncUpsert(get, "Mobiles_Purchases", purchaseRow(newPurchase), "purchase");
        
        pur.items.forEach((item) => {
          const updatedProduct = get().products.find((p) => p.id === item.productId);
          if (updatedProduct) syncUpsert(get, "Mobiles_Products", productRow(updatedProduct), "product (from purchase)");
        });

        if (supplier) {
          const finalSupplier = get().suppliers.find((s) => s.id === supplier!.id);
          if (finalSupplier) syncUpsert(get, "Mobiles_Suppliers", supplierRow(finalSupplier), "supplier (from purchase)");
          if (amountPaid > 0) {
            const latestPayment = get().supplierPayments?.[0];
            if (latestPayment) syncUpsert(get, "Mobiles_SupplierPayments", supplierPaymentRow(latestPayment), "supplier payment (from purchase)");
          }
        }
        get().pushAudit({
          action: "Recorded Purchase",
          target: `Invoice #${pur.invoiceNo} from ${newPurchase.supplierName} · Total: ₹${total.toLocaleString("en-IN")}`,
        });
        return newPurchase;
      },

      payPurchaseBalance: (purchaseId, amount, paymentMode = "Cash", cashAmount, bankAmount, remark, date) => {
        const purchase = get().purchases.find((p) => p.id === purchaseId);
        if (!purchase) return;

        const currentPaid = purchase.amountPaid !== undefined ? purchase.amountPaid : (purchase.status === "Paid" ? purchase.amount : 0);
        const currentDue = purchase.dueAmount !== undefined ? purchase.dueAmount : Math.max(0, purchase.amount - currentPaid);

        if (currentDue <= 0) return;

        const payAmt = Math.min(amount, currentDue);
        const newAmountPaid = currentPaid + payAmt;
        const newDueAmount = Math.max(0, purchase.amount - newAmountPaid);
        const newPaymentStatus: "Paid" | "Partial Paid" | "Not Paid" = newDueAmount <= 0 ? "Paid" : "Partial Paid";
        const formattedDate = date || new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

        const updatedPurchase: MobilePurchase = {
          ...purchase,
          amountPaid: newAmountPaid,
          dueAmount: newDueAmount,
          status: newPaymentStatus,
          paymentStatus: newPaymentStatus,
        };

        const supplierKey = String(purchase.supplierName || "").trim().toLowerCase();
        const supplier = get().suppliers.find(
          (s) => s.id === purchase.supplierId || String(s?.name ?? "").trim().toLowerCase() === supplierKey
        );
        if (supplier) {
          set((state) => ({
            suppliers: state.suppliers.map((s) =>
              s.id === supplier.id ? { ...s, outstanding: Math.max(0, s.outstanding - payAmt) } : s
            )
          }));
        }

        const cAmt = cashAmount !== undefined ? cashAmount : paymentMode === "Cash" ? payAmt : paymentMode === "Cash & UPI" ? payAmt / 2 : 0;
        const bAmt = bankAmount !== undefined ? bankAmount : paymentMode === "UPI" || (paymentMode as string) === "Bank" ? payAmt : paymentMode === "Cash & UPI" ? payAmt / 2 : 0;
        
        const newPayment: SupplierPayment = {
          id: nextSeqId("SPM-", (get().supplierPayments || []).map((x) => x.id)),
          supplierId: supplier ? supplier.id : purchase.supplierId,
          supplierName: supplier ? supplier.name : purchase.supplierName,
          amount: payAmt,
          date: formattedDate,
          remark: remark || `Payment of ₹${payAmt.toLocaleString("en-IN")} towards Purchase Invoice #${purchase.invoiceNo}`,
          paymentMode,
          cashAmount: cAmt,
          bankAmount: bAmt,
        };

        set((state) => ({
          purchases: state.purchases.map((p) => (p.id === purchaseId ? updatedPurchase : p)),
          supplierPayments: [newPayment, ...(state.supplierPayments || [])]
        }));

        syncUpsert(get, "Mobiles_Purchases", purchaseRow(updatedPurchase), "purchase balance payment");
        if (supplier) {
          const updatedSup = get().suppliers.find((s) => s.id === supplier.id);
          if (updatedSup) syncUpsert(get, "Mobiles_Suppliers", supplierRow(updatedSup), "supplier balance update");
        }
        syncUpsert(get, "Mobiles_SupplierPayments", supplierPaymentRow(newPayment), "supplier payment log");
        get().pushAudit({
          action: "Purchase Balance Payment",
          target: `Paid ₹${payAmt.toLocaleString("en-IN")} towards Invoice #${purchase.invoiceNo} (${purchase.supplierName})`,
        });
      },

      createBill: (saleInput) => {
        const id = nextSeqId("MSL-", get().sales.map((x) => x.id));
        const date = saleInput.date || new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
        
        const subtotal = saleInput.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const gst = 0;
        const totalAmount = subtotal;

        const newSale: MobileSale = {
          ...saleInput,
          id,
          date,
          subtotal: totalAmount,
          gst: 0,
          totalAmount,
          paymentStatus: saleInput.paymentStatus || "Full Paid",
          amountPaid: saleInput.amountPaid !== undefined ? saleInput.amountPaid : totalAmount,
          dueAmount: saleInput.dueAmount !== undefined ? saleInput.dueAmount : 0
        };

        // Deduct quantities from inventory & update IMEI records to "Sold"
        saleInput.items.forEach((item) => {
          get().adjustStock(item.productId, -item.quantity);
          
          if (item.imei1) {
            get().updateImeiStatus(item.imei1, "Sold");
            // Link sale ID to IMEI
            set((state) => ({
              imeis: state.imeis.map((im) => im.imei1 === item.imei1 ? { ...im, saleId: id } : im)
            }));
          }
        });

        // Add Customer to database if they don't exist
        const customerExists = get().customers.some(
          (c) => String(c.mobile || "").replace(/[^\d]/g, "") === String(saleInput.customerMobile || "").replace(/[^\d]/g, "")
        );
        if (!customerExists) {
          get().addCustomer({
            name: saleInput.customerName,
            mobile: saleInput.customerMobile,
            email: "",
            address: saleInput.village || "",
            fatherName: saleInput.fatherName || "",
            village: saleInput.village || "",
            isBlacklisted: false
          });
        }

        set((state) => ({
          sales: [newSale, ...state.sales]
        }));

        get().recomputeInventory();

        // addCustomer() above already syncs itself when it creates a new customer.
        syncUpsert(get, "Mobiles_Sales", saleRow(newSale), "sale");
        // adjustStock() above can flip a product's status (e.g. In Stock ->
        // Out of Stock) — sync each affected product row, same rationale as
        // the equivalent loop in recordPurchase.
        saleInput.items.forEach((item) => {
          const updatedProduct = get().products.find((p) => p.id === item.productId);
          if (updatedProduct) syncUpsert(get, "Mobiles_Products", productRow(updatedProduct), "product (from sale)");
        });
        get().pushAudit({
          action: "Created Sales Bill",
          target: `Bill ${id} for ${saleInput.customerName} · Total: ₹${totalAmount.toLocaleString("en-IN")} (${saleInput.paymentMethod || "Cash"})`,
        });
        return newSale;
      },

      collectSalePayment: (saleId, amount, paymentMethod, date) => {
        const sale = get().sales.find((s) => s.id === saleId);
        if (!sale || amount <= 0) return;

        // Cap the receipt at what is actually outstanding. The dialog rejects an
        // over-payment, but the dialog is not the only caller (a reconciled
        // sheet row, a future screen, a replayed action all reach this directly)
        // and without the cap amountPaid climbs past totalAmount while dueAmount
        // clamps at 0 — so the bill reads "Full Paid" while the cash/UPI split
        // reports money the shop never took. payPurchaseBalance already caps the
        // mirror-image case on the supplier side.
        const currentPaid = Number(sale.amountPaid) || 0;
        const outstanding = Math.max(0, (Number(sale.totalAmount) || 0) - currentPaid);
        if (outstanding <= 0) return;
        const payAmt = Math.min(amount, outstanding);

        const newAmountPaid = currentPaid + payAmt;
        const newDueAmount = Math.max(0, (Number(sale.totalAmount) || 0) - newAmountPaid);
        const newPaymentStatus: MobileSale["paymentStatus"] = newDueAmount <= 0 ? "Full Paid" : "Partial Paid";

        const updatedCashPaid = (sale.cashAmountPaid || 0) + (paymentMethod === "Cash" ? payAmt : 0);
        const updatedUpiPaid = (sale.upiAmountPaid || 0) + (paymentMethod === "UPI" ? payAmt : 0);

        set((state) => ({
          sales: state.sales.map((s) =>
            s.id === saleId
              ? {
                  ...s,
                  amountPaid: newAmountPaid,
                  dueAmount: newDueAmount,
                  paymentStatus: newPaymentStatus,
                  cashAmountPaid: updatedCashPaid,
                  upiAmountPaid: updatedUpiPaid,
                }
              : s
          ),
        }));

        get().pushAudit({
          user: "Admin",
          action: "COLLECT_SALE_DUE",
          target: `Collected ₹${payAmt} (${paymentMethod}) for Bill ${saleId} from ${sale.customerName}. Remaining Due: ₹${newDueAmount}`,
        });
        const updatedSale = get().sales.find((s) => s.id === saleId);
        if (updatedSale) syncUpsert(get, "Mobiles_Sales", saleRow(updatedSale), "sale payment");
      },

      addCustomer: (c) => {
        const id = nextSeqId("MC-", get().customers.map((x) => x.id));
        const registeredDate = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
        const newCustomer: MobileCustomer = { ...c, id, registeredDate };
        set((state) => ({ customers: [...state.customers, newCustomer] }));
        syncUpsert(get, "Mobiles_Customers", mobileCustomerRow(newCustomer), "customer add");
        get().pushAudit({
          action: "Registered Customer",
          target: `${newCustomer.name} (${newCustomer.mobile})`,
        });
        return newCustomer;
      },

      updateCustomer: (id, updatedFields) => {
        set((state) => ({
          customers: state.customers.map((c) => (c.id === id ? { ...c, ...updatedFields } : c))
        }));
        const updatedCustomer = get().customers.find((c) => c.id === id);
        if (updatedCustomer) {
          syncUpsert(get, "Mobiles_Customers", mobileCustomerRow(updatedCustomer), "customer update");
          get().pushAudit({
            action: "Updated Customer",
            target: `Customer ID: ${id} (${updatedCustomer.name})`,
          });
        }
      },

      deleteCustomer: (id) => {
        const deletedCust = get().customers.find((c) => c.id === id);
        set((state) => ({ customers: state.customers.filter((c) => c.id !== id) }));
        syncDelete(get, "Mobiles_Customers", id, "customer delete");
        get().pushAudit({
          action: "Deleted Customer",
          target: `Customer ID: ${id} ${deletedCust ? `(${deletedCust.name})` : ""}`,
        });
      },

      addImei: (imei) => {
        set((state) => ({ imeis: [imei, ...state.imeis] }));
        // Automatically increments stock of product
        get().adjustStock(imei.productId, 1);
      },

      updateImeiStatus: (imei1, status) => {
        set((state) => ({
          imeis: state.imeis.map((im) => (im.imei1 === imei1 ? { ...im, status } : im))
        }));
      },

      addAccessory: (a) => {
        const id = nextSeqId("MA-", get().accessories.map((x) => x.id));
        const newAccessory: MobileAccessory = { ...a, id, status: getQtyStatus(a.stock, a.minLimit) };
        set((state) => ({ accessories: [...state.accessories, newAccessory] }));
        syncUpsert(get, "Mobiles_Accessories", accessoryRow(newAccessory), "accessory add");
        get().pushAudit({
          action: "Added Accessory",
          target: `${newAccessory.name} · Stock Qty: ${newAccessory.stock}`,
        });
      },

      updateAccessory: (id, updatedFields) => {
        set((state) => ({
          accessories: state.accessories.map((a) => {
            if (a.id === id) {
              const stock = updatedFields.stock ?? a.stock;
              const minLimit = updatedFields.minLimit ?? a.minLimit;
              return {
                ...a,
                ...updatedFields,
                status: getQtyStatus(stock, minLimit)
              };
            }
            return a;
          })
        }));
        const updatedAccessory = get().accessories.find((a) => a.id === id);
        if (updatedAccessory) {
          syncUpsert(get, "Mobiles_Accessories", accessoryRow(updatedAccessory), "accessory update");
          get().pushAudit({
            action: "Updated Accessory",
            target: `Accessory ID: ${id} (${updatedAccessory.name})`,
          });
        }
      },

      deleteAccessory: (id) => {
        const deletedAcc = get().accessories.find((a) => a.id === id);
        set((state) => ({ accessories: state.accessories.filter((a) => a.id !== id) }));
        syncDelete(get, "Mobiles_Accessories", id, "accessory delete");
        get().pushAudit({
          action: "Deleted Accessory",
          target: `Accessory ID: ${id} ${deletedAcc ? `(${deletedAcc.name})` : ""}`,
        });
      },

      sellAccessory: (id, qty) => {
        set((state) => ({
          accessories: state.accessories.map((a) => {
            if (a.id === id) {
              const stock = Math.max(0, a.stock - qty);
              return { ...a, stock, status: getQtyStatus(stock, a.minLimit) };
            }
            return a;
          })
        }));
        const soldAccessory = get().accessories.find((a) => a.id === id);
        if (soldAccessory) {
          syncUpsert(get, "Mobiles_Accessories", accessoryRow(soldAccessory), "accessory sell");
          get().pushAudit({
            action: "Sold Accessory",
            target: `Sold ${qty}x ${soldAccessory.name} (${id})`,
          });
        }
      },

      addWarrantyClaim: (w) => {
        const id = nextSeqId("WC-", get().warranties.map((x) => x.id));
        const claimDate = new Date().toISOString().split("T")[0];
        const newClaim: MobileWarrantyClaim = { ...w, id, claimDate, status: "Pending" };
        set((state) => ({ warranties: [...state.warranties, newClaim] }));
        syncUpsert(get, "Mobiles_WarrantyClaims", warrantyRow(newClaim), "warranty add");
        get().pushAudit({
          action: "Recorded Warranty Claim",
          target: `Claim ${newClaim.id} for ${w.customerName} (${w.productName})`,
        });
      },

      updateWarrantyStatus: (id, status) => {
        set((state) => ({
          warranties: state.warranties.map((w) => (w.id === id ? { ...w, status } : w))
        }));
        const updatedClaim = get().warranties.find((w) => w.id === id);
        if (updatedClaim) {
          syncUpsert(get, "Mobiles_WarrantyClaims", warrantyRow(updatedClaim), "warranty status update");
          get().pushAudit({
            action: "Updated Warranty Status",
            target: `Claim ${id} status set to ${status}`,
          });
        }
      },

      updateSettings: (updatedSettings) => {
        set((state) => ({ settings: { ...state.settings, ...updatedSettings } }));
        syncUpsert(get, "Mobiles_Settings", mobileSettingsRow(get().settings), "store profile");
        get().pushAudit({
          action: "Updated Settings",
          target: `Updated Mobiles shop & GST settings`,
        });
      },

      addExpense: (input) => {
        const existingExp = get().expenses.filter((e) => e.id.startsWith("ME-"));
        const maxExpId = existingExp.reduce((max, e) => {
          const n = parseInt(e.id.replace("ME-", ""), 10);
          return isNaN(n) ? max : Math.max(max, n);
        }, 5);
        const id = "ME-" + (maxExpId + 1).toString().padStart(3, "0");
        const date = input.date 
          ? formatDateToInr(input.date) 
          : new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
        const newExpense: MobileExpense = {
          id,
          date,
          cat: input.cat,
          desc: input.desc,
          amount: `₹${Number(input.amount).toLocaleString("en-IN")}`,
          type: input.type || "Expense",
          paymentMode: input.paymentMode || "Cash"
        };
        set((state) => ({
          expenses: [newExpense, ...state.expenses]
        }));
        syncUpsert(get, "Mobiles_Expenses", mobileExpenseRow(newExpense), "expense");
        get().pushAudit({
          action: "Added Expense",
          target: `[${newExpense.type}] ${newExpense.cat}: ${newExpense.desc} · ${newExpense.amount}`,
        });
        return newExpense;
      },

      deleteExpense: (id) => {
        const deletedExp = get().expenses.find((e) => e.id === id);
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id)
        }));
        syncDelete(get, "Mobiles_Expenses", id, "expense delete");
        get().pushAudit({
          action: "Deleted Expense",
          target: `Expense ID: ${id} ${deletedExp ? `(${deletedExp.desc})` : ""}`,
        });
      },

      resetAll: async () => {
        // 1. Clear local state
        set({
          products: [],
          inventory: [],
          suppliers: [],
          purchases: [],
          sales: [],
          customers: [],
          imeis: [],
          accessories: [],
          warranties: [],
          settings: defaultSettings,
          supplierPayments: [],
          expenses: [],
          audit: []
        });
        // 2. Clear sync tracking state and digest cache
        clearSyncState();
        resetRealtimeSyncCache();

        // 3. Clear Google Sheets — write empty arrays to all Mobiles sheets
        const { sheetsConfig } = get();
        if (sheetsConfig.enabled && sheetsConfig.url) {
          const mobileSheets: SheetName[] = [
            "Mobiles_Sales",
            "Mobiles_Purchases",
            "Mobiles_Expenses",
            "Mobiles_Suppliers",
            "Mobiles_SupplierPayments",
            "Mobiles_Customers",
            "Mobiles_Products",
            "Mobiles_Accessories",
            "Mobiles_WarrantyClaims",
            "Mobiles_Settings",
            "Mobiles_Audit",
          ];
          const res = await clearSheets(sheetsConfig.url, mobileSheets);
          if (!res.ok) {
            console.warn("[mobileStore] Google Sheets clear issue:", res.error);
            toast.error(`Google Sheets clear notice: ${res.error}`);
          }
          const ts = nowTimestamp();
          set((s) => ({ sheetsConfig: { ...s.sheetsConfig, lastSync: ts } }));
        }
      },

      updateSheetsConfig: (cfg) => set((s) => ({ sheetsConfig: { ...s.sheetsConfig, ...cfg } })),

      syncToSheets: async () => {
        const { sheetsConfig, sales, purchases, expenses, suppliers, supplierPayments, customers, products, accessories, warranties } = get();
        if (!sheetsConfig.enabled || !sheetsConfig.url) {
          return { ok: false, error: "Google Sheets sync is not configured or disabled." };
        }
        try {
          await writeSheet(sheetsConfig.url, "Mobiles_Sales", sales.map(saleRow));
          await writeSheet(sheetsConfig.url, "Mobiles_Purchases", purchases.map(purchaseRow));
          await writeSheet(sheetsConfig.url, "Mobiles_Expenses", expenses.map(mobileExpenseRow));
          await writeSheet(sheetsConfig.url, "Mobiles_Suppliers", suppliers.map(supplierRow));
          await writeSheet(sheetsConfig.url, "Mobiles_SupplierPayments", supplierPayments.map(supplierPaymentRow));
          await writeSheet(sheetsConfig.url, "Mobiles_Customers", customers.map(mobileCustomerRow));
          await writeSheet(sheetsConfig.url, "Mobiles_Products", products.map(productRow));
          await writeSheet(sheetsConfig.url, "Mobiles_Accessories", accessories.map(accessoryRow));
          await writeSheet(sheetsConfig.url, "Mobiles_WarrantyClaims", warranties.map(warrantyRow));
          await writeSheet(sheetsConfig.url, "Mobiles_Settings", [mobileSettingsRow(get().settings)]);
          const ts = nowTimestamp();
          set((s) => ({ sheetsConfig: { ...s.sheetsConfig, lastSync: ts } }));
          return { ok: true };
        } catch (err: any) {
          return { ok: false, error: err?.message || String(err) };
        }
      },

      loadFromSheets: async () => {
        const { sheetsConfig } = get();
        if (!sheetsConfig.enabled || !sheetsConfig.url) {
          return { ok: false, error: "Google Sheets sync is not configured or disabled." };
        }
        try {
          const [salesRows, expRows, supRows, supPayRows, custRows, prodRows, purRows, accRows, warRows, setRows, auditRows] = await Promise.all([
            readSheet(sheetsConfig.url, "Mobiles_Sales"),
            readSheet(sheetsConfig.url, "Mobiles_Expenses"),
            readSheet(sheetsConfig.url, "Mobiles_Suppliers"),
            readSheet(sheetsConfig.url, "Mobiles_SupplierPayments"),
            readSheet(sheetsConfig.url, "Mobiles_Customers"),
            readSheet(sheetsConfig.url, "Mobiles_Products"),
            readSheet(sheetsConfig.url, "Mobiles_Purchases"),
            readSheet(sheetsConfig.url, "Mobiles_Accessories"),
            readSheet(sheetsConfig.url, "Mobiles_WarrantyClaims"),
            readSheet(sheetsConfig.url, "Mobiles_Settings"),
            readSheet(sheetsConfig.url, "Mobiles_Audit"),
          ]);
          const localSalesById = new Map(get().sales.map((x) => [String(x?.id), x]));
          const sanitizedSales = salesRows.map((r: any) => {
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
          });
          // Same guard as every other table here: Code.gs answers a missing or
          // header-only tab with {status:"ok", rows: []}, so an unconditional
          // set() wiped this device's sales/purchases/accessories/warranties.
          if (salesRows.length > 0 || get().sales.length === 0) {
            set({ sales: sanitizedSales as unknown as MobileSale[] });
          }

          if (expRows.length > 0 || get().expenses.length === 0) set({ expenses: expRows as unknown as MobileExpense[] });
          const sanitizedSuppliers = supRows.map((r: any) => ({
            ...r,
            name: String(r.name ?? ""),
            contact: String(r.contact ?? ""),
            gstNo: String(r.gstNo ?? ""),
            address: String(r.address ?? ""),
            outstanding: Number(r.outstanding) || 0,
          }));
          if (supRows.length > 0 || get().suppliers.length === 0) set({ suppliers: sanitizedSuppliers as unknown as MobileSupplier[] });

          // Sanitise supplier payments — paymentMode must survive the Sheets
          // round-trip or splitByMethod defaults every payment to bank/UPI.
          const sanitizedSupPayments = supPayRows.map((r: any) => {
            const mode = String(r.paymentMode || "").trim();
            const normalizedMode =
              mode === "Cash" ? "Cash"
              : mode === "UPI" || mode === "Bank" ? "UPI"
              : mode === "Cash & UPI" || mode === "Cash & Bank" ? "Cash & UPI"
              : r.paymentMode || "Cash";
            return {
              ...r,
              amount: Number(r.amount) || 0,
              paymentMode: normalizedMode,
              cashAmount: toOptionalNumber(r.cashAmount),
              bankAmount: toOptionalNumber(r.bankAmount),
            };
          });
          if (supPayRows.length > 0 || (get().supplierPayments || []).length === 0) {
            set({ supplierPayments: sanitizedSupPayments as unknown as SupplierPayment[] });
          }

          const sanitizedCustomers = custRows.map((r: any) => ({
            ...r,
            mobile: String(r.mobile ?? ""),
            outstanding: Number(r.outstanding) || 0,
            isBlacklisted: r.isBlacklisted === true || r.isBlacklisted === "true",
          }));
          if (custRows.length > 0 || get().customers.length === 0) set({ customers: sanitizedCustomers as unknown as MobileCustomer[] });

          // Same coercion the realtime poller applies: a numeric model/spec
          // comes back as a NUMBER and .toLowerCase() on it crashed the
          // Products page the moment anything was typed in its search box.
          const sanitizedProducts = prodRows.map((r: any) => ({
            ...r,
            name: String(r.name ?? ""),
            brand: String(r.brand ?? ""),
            model: String(r.model ?? ""),
            color: String(r.color ?? ""),
            ramRom: String(r.ramRom ?? ""),
            category: String(r.category ?? ""),
            remark: String(r.remark ?? ""),
            purchasePrice: Number(r.purchasePrice) || 0,
            sellingPrice: Number(r.sellingPrice) || 0,
          }));
          if (prodRows.length > 0 || get().products.length === 0) set({ products: sanitizedProducts as unknown as MobileProduct[] });

          // Sanitise purchases — amount/quantity must be numbers for
          // settleSupplier arithmetic, and paymentMode must be normalised
          // so splitByMethod routes cash payments correctly.
          const localPurchasesById = new Map(get().purchases.map((x) => [String(x?.id), x]));
          const sanitizedPurchases = purRows.map((r: any) => {
            const parsedItems = itemsFromSheet(r.items, localPurchasesById.get(String(r.id))?.items);
            const mode = String(r.paymentMode || "").trim();
            const normalizedMode =
              mode === "Cash" ? "Cash"
              : mode === "UPI" || mode === "Bank" ? "UPI"
              : mode === "Cash & UPI" || mode === "Cash & Bank" ? "Cash & UPI"
              : r.paymentMode || undefined;
            const amt = Number(r.amount) || 0;
            const rawPStatus = r.paymentStatus || r.status;
            const normalizedPStatus: "Paid" | "Partial Paid" | "Not Paid" =
              rawPStatus === "Paid" ? "Paid"
              : rawPStatus === "Partial Paid" ? "Partial Paid"
              : "Not Paid";

            const amtPaid = r.amountPaid !== undefined && r.amountPaid !== "" ? Number(r.amountPaid) : (normalizedPStatus === "Paid" ? amt : 0);
            const dueAmt = r.dueAmount !== undefined && r.dueAmount !== "" ? Number(r.dueAmount) : Math.max(0, amt - amtPaid);

            return {
              ...r,
              amount: amt,
              quantity: Number(r.quantity) || 0,
              gst: Number(r.gst) || 0,
              status: normalizedPStatus,
              paymentStatus: normalizedPStatus,
              amountPaid: amtPaid,
              dueAmount: dueAmt,
              paymentMode: normalizedMode,
              cashAmount: toOptionalNumber(r.cashAmount),
              bankAmount: toOptionalNumber(r.bankAmount),
              items: parsedItems,
            };
          });
          if (purRows.length > 0 || get().purchases.length === 0) {
            set({ purchases: sanitizedPurchases as unknown as MobilePurchase[] });
          }

          const sanitizedAcc = accRows.map((r: any) => ({
            ...r,
            stock: Number(r.stock) || 0,
            minLimit: Number(r.minLimit) || 0,
            purchasePrice: Number(r.purchasePrice) || 0,
            sellingPrice: Number(r.sellingPrice) || 0,
          }));
          if (accRows.length > 0 || get().accessories.length === 0) {
            set({ accessories: sanitizedAcc as unknown as MobileAccessory[] });
          }

          if (warRows.length > 0 || get().warranties.length === 0) {
            set({ warranties: warRows as unknown as MobileWarrantyClaim[] });
          }

          const savedSettings = setRows.find((r: any) => String(r?.id) === MOBILE_SETTINGS_ROW_ID);
          if (savedSettings) {
            set((st) => ({
              settings: {
                ...st.settings,
                storeName: String(savedSettings.storeName ?? st.settings.storeName),
                gstNo: String(savedSettings.gstNo ?? st.settings.gstNo),
                contact: String(savedSettings.contact ?? st.settings.contact),
                email: String(savedSettings.email ?? st.settings.email),
                address: String(savedSettings.address ?? st.settings.address),
                invoicePrefix: String(savedSettings.invoicePrefix ?? st.settings.invoicePrefix),
              },
            }));
          }

          if (auditRows.length > 0) {
            const sanitizedAudit = auditRows.map(auditFromRow);
            set({ audit: sanitizedAudit });
          }

          // Products/purchases/sales were just replaced wholesale; the local
          // inventory table refers to the old ones until it is rebuilt.
          get().recomputeInventory();

          const ts = nowTimestamp();
          set((s) => ({ sheetsConfig: { ...s.sheetsConfig, lastSync: ts } }));
          return { ok: true };
        } catch (err: any) {
          return { ok: false, error: err?.message || String(err) };
        }
      },
    }),
    {
      name: "jain-mobiles-erp-v2",
      // Never let a full/blocked localStorage throw out of set() — see safeStorage.
      storage: createJSONStorage(() => safeLocalStorage),
      merge: (persistedState: any, currentState) => {
        const merged = { ...currentState, ...(persistedState || {}) };
        merged.products = Array.isArray(merged.products) ? merged.products : initialProducts;
        merged.inventory = Array.isArray(merged.inventory) ? merged.inventory : initialInventory;
        merged.suppliers = Array.isArray(merged.suppliers) ? merged.suppliers : initialSuppliers;
        merged.purchases = Array.isArray(merged.purchases) ? merged.purchases : initialPurchases;
        merged.sales = Array.isArray(merged.sales) ? merged.sales : initialSales;
        merged.customers = Array.isArray(merged.customers) ? merged.customers : initialCustomers;
        merged.imeis = Array.isArray(merged.imeis) ? merged.imeis : initialImeis;
        merged.accessories = Array.isArray(merged.accessories) ? merged.accessories : initialAccessories;
        merged.warranties = Array.isArray(merged.warranties) ? merged.warranties : initialWarranties;
        merged.expenses = Array.isArray(merged.expenses) ? merged.expenses : initialExpenses;
        merged.supplierPayments = Array.isArray(merged.supplierPayments) ? merged.supplierPayments : [];
        merged.audit = Array.isArray(merged.audit)
          ? merged.audit.filter((a: any) => !FAKE_MOBILE_AUDIT_TS.has(a?.ts))
          : seedMobileAudit;
        merged.settings = { ...defaultSettings, ...(merged.settings || {}) };
        // PERMANENT: Always force the hardcoded URL — no per-device config needed
        merged.sheetsConfig = {
          url: PERMANENT_SHEETS_URL,
          enabled: merged.sheetsConfig?.enabled ?? true,
          lastSync: merged.sheetsConfig?.lastSync,
        };
        merged.inventory = buildInventory(
          merged.products,
          merged.purchases,
          merged.sales,
          merged.inventory
        );
        return merged;
      }
    }
  )
);

// NOTE: there used to be a debounced subscriber here that did a full
// syncToSheets() 3s after ANY change to sales/purchases/products/expenses/
// suppliers/customers/accessories/warranties. That's been removed — every
// mutator above now pushes its own targeted upsert/delete immediately (see
// syncUpsert/syncDelete), which is what actually fixes the lost-update
// race described in store.ts's matching comment. A delayed FULL rewrite on
// top of that would just reintroduce the same race. syncToSheets() itself
// is intentionally still used for the manual "Sync Now" button and initial
// connect, where a full rewrite is exactly what's wanted.
