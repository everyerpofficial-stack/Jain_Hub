import { create } from "zustand";
import { persist } from "zustand/middleware";
import { formatDateToInr } from "./store";
import { type SheetsConfig, type SheetRow, type SheetName, writeSheet, readSheet, upsertRow, deleteRow, nowTimestamp } from "./googleSheets";
import { nextSeqId } from "./utils";
import { enqueueWrite } from "./syncQueue";
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
  status: "Paid" | "Outstanding";
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
  pushAudit: (e: Omit<MobileAuditEntry, "ts">) => void;

  // Actions
  addExpense: (e: Omit<MobileExpense, "id" | "date"> & { date?: string }) => MobileExpense;
  deleteExpense: (id: string) => void;
  addProduct: (p: Omit<MobileProduct, "id" | "status">) => void;
  updateProduct: (id: string, p: Partial<MobileProduct>) => void;
  deleteProduct: (id: string) => void;
  
  adjustStock: (productId: string, qtyChange: number) => void;
  stockIn: (productId: string, quantity: number, cost: number) => void;
  
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
  
  recordPurchase: (pur: Omit<MobilePurchase, "id" | "amount" | "gst" | "status"> & {
    payNow: boolean;
    paymentMode?: "Cash" | "UPI" | "Cash & UPI" | "Bank" | "Cash & Bank";
    cashAmount?: number;
    bankAmount?: number;
    paymentRemark?: string;
  }) => MobilePurchase;
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
  resetAll: () => void;
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
function saleRow(s: MobileSale): SheetRow {
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
function purchaseRow(p: MobilePurchase): SheetRow {
  return {
    id: p.id, supplierName: p.supplierName, invoiceNo: p.invoiceNo,
    date: p.date, quantity: p.quantity, amount: p.amount, status: p.status,
    gst: p.gst,
    paymentMode: p.paymentMode || "",
    paymentRemark: p.paymentRemark || "",
    items: JSON.stringify(p.items || []),
  };
}
function mobileExpenseRow(e: MobileExpense): SheetRow {
  return {
    id: e.id, date: e.date, cat: e.cat, desc: e.desc,
    amount: e.amount, type: e.type ?? "Expense", paymentMode: e.paymentMode ?? "Cash",
  };
}
function supplierRow(s: MobileSupplier): SheetRow {
  return {
    id: s.id, name: s.name, gstNo: s.gstNo ?? "", contact: s.contact,
    address: s.address, outstanding: s.outstanding,
  };
}
function supplierPaymentRow(p: SupplierPayment): SheetRow {
  return {
    id: p.id, supplierName: p.supplierName, amount: p.amount,
    date: p.date, remark: p.remark ?? "",
    paymentMode: p.paymentMode ?? "Cash",
  };
}
function mobileCustomerRow(c: MobileCustomer): SheetRow {
  return {
    id: c.id, name: c.name, mobile: c.mobile, email: c.email,
    address: c.address, registeredDate: c.registeredDate,
    fatherName: c.fatherName || "",
    village: c.village || "",
    isBlacklisted: c.isBlacklisted ? "true" : "false",
  };
}
function productRow(p: MobileProduct): SheetRow {
  return {
    id: p.id, name: p.name, brand: p.brand, model: p.model,
    color: p.color, ramRom: p.ramRom, category: p.category,
    purchasePrice: p.purchasePrice, sellingPrice: p.sellingPrice ?? 0, status: p.status,
  };
}
function accessoryRow(a: MobileAccessory): SheetRow {
  return {
    id: a.id, name: a.name, category: a.category,
    stock: a.stock, minLimit: a.minLimit,
    purchasePrice: a.purchasePrice, sellingPrice: a.sellingPrice,
    status: a.status,
  };
}
function warrantyRow(w: MobileWarrantyClaim): SheetRow {
  return {
    id: w.id, customerName: w.customerName, mobile: w.customerMobile || "",
    productName: w.productName, imei: w.imei, claimDate: w.claimDate,
    issueDescription: w.issue || "", status: w.status,
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
  const { sheetsConfig } = get();
  if (sheetsConfig.enabled && sheetsConfig.url) {
    const url = sheetsConfig.url;
    void enqueueWrite(sheet, label, () => deleteRow(url, sheet, id));
  }
}

// ── PERMANENT GOOGLE SHEETS DATABASE URL ─────────────────────────────────────
const PERMANENT_SHEETS_URL =
  (import.meta.env.VITE_GOOGLE_SHEETS_URL as string) ||
  "https://script.google.com/macros/s/AKfycbxgaIiJWfwN9_ssvDfRpWCzbgFwh4aD5OIeibbcaEIP9HxNxWTDyJL5CjFUjduFa1FO7A/exec";

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
      pushAudit: (e) => set((s) => ({
        audit: [
          {
            ts: new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
            ...e
          },
          ...s.audit
        ]
      })),
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
        // Inventory has no sheet of its own — only the product row syncs.
        syncUpsert(get, "Mobiles_Products", productRow(newProduct), "product add");
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
        const updatedProduct = get().products.find((p) => p.id === id);
        if (updatedProduct) syncUpsert(get, "Mobiles_Products", productRow(updatedProduct), "product update");
      },

      deleteProduct: (id) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
          inventory: state.inventory.filter((inv) => inv.productId !== id)
        }));
        syncDelete(get, "Mobiles_Products", id, "product delete");
      },

      adjustStock: (productId, qtyChange) => {
        set((state) => {
          const inventory = state.inventory.map((inv) => {
            if (inv.productId === productId) {
              const quantity = Math.max(0, inv.quantity + qtyChange);
              const status = getQtyStatus(quantity, inv.minLimit);
              return { ...inv, quantity, status };
            }
            return inv;
          });

          const products = state.products.map((p) => {
            if (p.id === productId) {
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
      },

      updateSupplier: (id, updatedFields) => {
        set((state) => ({
          suppliers: state.suppliers.map((s) => (s.id === id ? { ...s, ...updatedFields } : s))
        }));
        const updatedSupplier = get().suppliers.find((s) => s.id === id);
        if (updatedSupplier) syncUpsert(get, "Mobiles_Suppliers", supplierRow(updatedSupplier), "supplier update");
      },

      deleteSupplier: (id) => {
        set((state) => ({ suppliers: state.suppliers.filter((s) => s.id !== id) }));
        syncDelete(get, "Mobiles_Suppliers", id, "supplier delete");
      },

      paySupplier: (id, amount, date, remark, paymentMode = "Cash", cashAmount, bankAmount) => {
        const supplier = get().suppliers.find((s) => s.id === id || s.name.trim().toLowerCase() === id.trim().toLowerCase());
        if (!supplier) return;
        const newPayment: SupplierPayment = {
          id: nextSeqId("SPM-", (get().supplierPayments || []).map((x) => x.id)),
          supplierId: supplier.id,
          supplierName: supplier.name,
          amount,
          date,
          remark,
          paymentMode: paymentMode as "Cash" | "Bank" | "Cash & Bank",
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
      },

      recordPurchase: (pur) => {
        const id = nextSeqId("MPR-", get().purchases.map((x) => x.id));
        const subtotal = pur.items.reduce((sum, item) => sum + item.quantity * item.cost, 0);
        const total = subtotal;
        const status = pur.payNow ? "Paid" : "Outstanding";

        let supplier = get().suppliers.find(
          (s) => s.id === pur.supplierId || (pur.supplierName && s.name.trim().toLowerCase() === pur.supplierName.trim().toLowerCase())
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
          status
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

        // Add to supplier ledger outstanding if not paid, or log immediate supplier payment if paid
        if (!pur.payNow && supplier) {
          set((state) => ({
            suppliers: state.suppliers.map((s) =>
              s.id === supplier!.id ? { ...s, outstanding: s.outstanding + total } : s
            )
          }));
        } else if (pur.payNow && supplier) {
          const pMode = pur.paymentMode || "Cash";
          const cAmt = pur.cashAmount !== undefined ? pur.cashAmount : pMode === "Cash" ? total : pMode === "Cash & UPI" ? total / 2 : 0;
          const bAmt = pur.bankAmount !== undefined ? pur.bankAmount : pMode === "UPI" || pMode === "Bank" ? total : pMode === "Cash & UPI" ? total / 2 : 0;
          const newPayment: SupplierPayment = {
            id: nextSeqId("SPM-", (get().supplierPayments || []).map((x) => x.id)),
            supplierId: supplier.id,
            supplierName: supplier.name,
            amount: total,
            date: pur.date,
            remark: pur.paymentRemark || `Immediate payment for Purchase Bill ${pur.invoiceNo} (${pMode})`,
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

        syncUpsert(get, "Mobiles_Purchases", purchaseRow(newPurchase), "purchase");
        // adjustStock() above can flip a product's status (e.g. Out of Stock
        // -> In Stock) — sync each affected product row so that change isn't
        // silently lost now that this action no longer does a full-table sync.
        pur.items.forEach((item) => {
          const updatedProduct = get().products.find((p) => p.id === item.productId);
          if (updatedProduct) syncUpsert(get, "Mobiles_Products", productRow(updatedProduct), "product (from purchase)");
        });
        if (supplier) {
          // Covers both an auto-created supplier and an outstanding-balance
          // update — by now the store holds the final state for either case.
          const finalSupplier = get().suppliers.find((s) => s.id === supplier!.id);
          if (finalSupplier) syncUpsert(get, "Mobiles_Suppliers", supplierRow(finalSupplier), "supplier (from purchase)");
          if (pur.payNow) {
            const latestPayment = get().supplierPayments?.[0];
            if (latestPayment) syncUpsert(get, "Mobiles_SupplierPayments", supplierPaymentRow(latestPayment), "supplier payment (from purchase)");
          }
        }
        return newPurchase;
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

        // addCustomer() above already syncs itself when it creates a new customer.
        syncUpsert(get, "Mobiles_Sales", saleRow(newSale), "sale");
        // adjustStock() above can flip a product's status (e.g. In Stock ->
        // Out of Stock) — sync each affected product row, same rationale as
        // the equivalent loop in recordPurchase.
        saleInput.items.forEach((item) => {
          const updatedProduct = get().products.find((p) => p.id === item.productId);
          if (updatedProduct) syncUpsert(get, "Mobiles_Products", productRow(updatedProduct), "product (from sale)");
        });
        return newSale;
      },

      collectSalePayment: (saleId, amount, paymentMethod, date) => {
        const sale = get().sales.find((s) => s.id === saleId);
        if (!sale || amount <= 0) return;

        const newAmountPaid = (sale.amountPaid || 0) + amount;
        const newDueAmount = Math.max(0, sale.totalAmount - newAmountPaid);
        const newPaymentStatus: MobileSale["paymentStatus"] = newDueAmount <= 0 ? "Full Paid" : "Partial Paid";

        const updatedCashPaid = (sale.cashAmountPaid || 0) + (paymentMethod === "Cash" ? amount : 0);
        const updatedUpiPaid = (sale.upiAmountPaid || 0) + (paymentMethod === "UPI" ? amount : 0);

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
          target: `Collected ₹${amount} (${paymentMethod}) for Bill ${saleId} from ${sale.customerName}. Remaining Due: ₹${newDueAmount}`,
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
        return newCustomer;
      },

      updateCustomer: (id, updatedFields) => {
        set((state) => ({
          customers: state.customers.map((c) => (c.id === id ? { ...c, ...updatedFields } : c))
        }));
        const updatedCustomer = get().customers.find((c) => c.id === id);
        if (updatedCustomer) syncUpsert(get, "Mobiles_Customers", mobileCustomerRow(updatedCustomer), "customer update");
      },

      deleteCustomer: (id) => {
        set((state) => ({ customers: state.customers.filter((c) => c.id !== id) }));
        syncDelete(get, "Mobiles_Customers", id, "customer delete");
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
        if (updatedAccessory) syncUpsert(get, "Mobiles_Accessories", accessoryRow(updatedAccessory), "accessory update");
      },

      deleteAccessory: (id) => {
        set((state) => ({ accessories: state.accessories.filter((a) => a.id !== id) }));
        syncDelete(get, "Mobiles_Accessories", id, "accessory delete");
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
        if (soldAccessory) syncUpsert(get, "Mobiles_Accessories", accessoryRow(soldAccessory), "accessory sell");
      },

      addWarrantyClaim: (w) => {
        const id = nextSeqId("WC-", get().warranties.map((x) => x.id));
        const claimDate = new Date().toISOString().split("T")[0];
        const newClaim: MobileWarrantyClaim = { ...w, id, claimDate, status: "Pending" };
        set((state) => ({ warranties: [...state.warranties, newClaim] }));
        syncUpsert(get, "Mobiles_WarrantyClaims", warrantyRow(newClaim), "warranty add");
      },

      updateWarrantyStatus: (id, status) => {
        set((state) => ({
          warranties: state.warranties.map((w) => (w.id === id ? { ...w, status } : w))
        }));
        const updatedClaim = get().warranties.find((w) => w.id === id);
        if (updatedClaim) syncUpsert(get, "Mobiles_WarrantyClaims", warrantyRow(updatedClaim), "warranty status update");
      },

      updateSettings: (updatedSettings) => {
        set((state) => ({ settings: { ...state.settings, ...updatedSettings } }));
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
        return newExpense;
      },

      deleteExpense: (id) => {
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id)
        }));
        syncDelete(get, "Mobiles_Expenses", id, "expense delete");
      },

      resetAll: () => {
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
          expenses: []
        });
        // 2. Also clear Google Sheets — write empty arrays to all Mobiles sheets
        const { sheetsConfig } = get();
        if (sheetsConfig.enabled && sheetsConfig.url) {
          Promise.all([
            writeSheet(sheetsConfig.url, "Mobiles_Sales", []),
            writeSheet(sheetsConfig.url, "Mobiles_Purchases", []),
            writeSheet(sheetsConfig.url, "Mobiles_Expenses", []),
            writeSheet(sheetsConfig.url, "Mobiles_Suppliers", []),
            writeSheet(sheetsConfig.url, "Mobiles_SupplierPayments", []),
            writeSheet(sheetsConfig.url, "Mobiles_Customers", []),
            writeSheet(sheetsConfig.url, "Mobiles_Products", []),
            writeSheet(sheetsConfig.url, "Mobiles_Accessories", []),
            writeSheet(sheetsConfig.url, "Mobiles_WarrantyClaims", []),
          ]).catch(() => {/* silent — best effort */});
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
          const [salesRows, expRows, supRows, supPayRows, custRows, prodRows, purRows, accRows, warRows] = await Promise.all([
            readSheet(sheetsConfig.url, "Mobiles_Sales"),
            readSheet(sheetsConfig.url, "Mobiles_Expenses"),
            readSheet(sheetsConfig.url, "Mobiles_Suppliers"),
            readSheet(sheetsConfig.url, "Mobiles_SupplierPayments"),
            readSheet(sheetsConfig.url, "Mobiles_Customers"),
            readSheet(sheetsConfig.url, "Mobiles_Products"),
            readSheet(sheetsConfig.url, "Mobiles_Purchases"),
            readSheet(sheetsConfig.url, "Mobiles_Accessories"),
            readSheet(sheetsConfig.url, "Mobiles_WarrantyClaims"),
          ]);
          const sanitizedSales = salesRows.map((r: any) => {
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
          });
          set({ sales: sanitizedSales as unknown as MobileSale[] });

          set({ expenses: expRows as unknown as MobileExpense[] });
          set({ suppliers: supRows as unknown as MobileSupplier[] });
          set({ supplierPayments: supPayRows as unknown as SupplierPayment[] });

          const sanitizedCustomers = custRows.map((r: any) => ({
            ...r,
            mobile: String(r.mobile ?? ""),
            outstanding: Number(r.outstanding) || 0,
            isBlacklisted: r.isBlacklisted === true || r.isBlacklisted === "true",
          }));
          set({ customers: sanitizedCustomers as unknown as MobileCustomer[] });

          set({ products: prodRows as unknown as MobileProduct[] });
          set({ purchases: purRows as unknown as MobilePurchase[] });

          const sanitizedAcc = accRows.map((r: any) => ({
            ...r,
            stock: Number(r.stock) || 0,
            minLimit: Number(r.minLimit) || 0,
            purchasePrice: Number(r.purchasePrice) || 0,
            sellingPrice: Number(r.sellingPrice) || 0,
          }));
          set({ accessories: sanitizedAcc as unknown as MobileAccessory[] });

          set({ warranties: warRows as unknown as MobileWarrantyClaim[] });

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
        // Preserve user configured or disconnected sheetsConfig, fallback to PERMANENT_SHEETS_URL if undefined
        merged.sheetsConfig = {
          url: merged.sheetsConfig?.url ?? PERMANENT_SHEETS_URL,
          enabled: merged.sheetsConfig?.enabled ?? true,
          lastSync: merged.sheetsConfig?.lastSync,
        };
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
