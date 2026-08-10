// Central operational store for Jain Finance ERP — Mobile Phone EMI Finance System.
// Persists to localStorage. All pages read from and write to this store.

import { create } from "zustand";
import { persist } from "zustand/middleware";
import XLSX from "xlsx-js-style";
import { type SheetsConfig, writeSheet, readSheet, nowTimestamp } from "./googleSheets";

export type Tone = "success" | "warning" | "danger" | "info" | "neutral";

// ---- Mobile brands & models ----
export const MOBILE_BRANDS: Record<string, string[]> = {
  Apple:    ["Apple1", "Apple2", "Apple3", "Apple4", "Apple5", "Apple6"],
  Samsung:  ["Samsung1", "Samsung2", "Samsung3", "Samsung4", "Samsung5", "Samsung6"],
  Xiaomi:   ["Xiaomi1", "Xiaomi2", "Xiaomi3", "Xiaomi4", "Xiaomi5", "Xiaomi6", "Xiaomi7", "Xiaomi8", "Xiaomi9", "Xiaomi10", "Xiaomi11", "Xiaomi12", "Xiaomi13", "Xiaomi14"],
  Oppo:     ["Oppo1", "Oppo2", "Oppo3", "Oppo4", "Oppo5", "Oppo6", "Oppo7", "Oppo8", "Oppo9", "Oppo10", "Oppo11", "Oppo12", "Oppo13", "Oppo14"],
  Vivo:     ["Vivo1", "Vivo2", "Vivo3", "Vivo4", "Vivo5", "Vivo6", "Vivo7", "Vivo8", "Vivo9", "Vivo10", "Vivo11", "Vivo12", "Vivo13", "Vivo14"],
  OnePlus:  ["OnePlus1", "OnePlus2", "OnePlus3", "OnePlus4", "OnePlus5", "OnePlus6", "OnePlus7", "OnePlus8", "OnePlus9", "OnePlus10", "OnePlus11", "OnePlus12", "OnePlus13", "OnePlus14"],
  Realme:   ["Realme1", "Realme2", "Realme3", "Realme4", "Realme5", "Realme6", "Realme7", "Realme8", "Realme9", "Realme10", "Realme11", "Realme12", "Realme13", "Realme14"],
  Nokia:    ["Nokia1", "Nokia2", "Nokia3", "Nokia4", "Nokia5", "Nokia6", "Nokia7", "Nokia8", "Nokia9", "Nokia10", "Nokia11", "Nokia12", "Nokia13", "Nokia14"],
  Sony:     ["Sony1", "Sony2", "Sony3", "Sony4", "Sony5", "Sony6", "Sony7", "Sony8", "Sony9", "Sony10", "Sony11", "Sony12", "Sony13", "Sony14"],
  Huawei:   ["Huawei1", "Huawei2", "Huawei3", "Huawei4", "Huawei5", "Huawei6", "Huawei7", "Huawei8", "Huawei9", "Huawei10", "Huawei11", "Huawei12", "Huawei13", "Huawei14"],
  Micromax: ["Micromax1", "Micromax2", "Micromax3", "Micromax4", "Micromax5", "Micromax6", "Micromax7", "Micromax8", "Micromax9", "Micromax10", "Micromax11", "Micromax12", "Micromax13", "Micromax14"],
  Lava:     ["Lava1", "Lava2", "Lava3", "Lava4", "Lava5", "Lava6", "Lava7", "Lava8", "Lava9", "Lava10", "Lava11", "Lava12", "Lava13", "Lava14"],
  "Reliance Jio": ["Reliance Jio1", "Reliance Jio2", "Reliance Jio3", "Reliance Jio4", "Reliance Jio5", "Reliance Jio6", "Reliance Jio7", "Reliance Jio8", "Reliance Jio9", "Reliance Jio10", "Reliance Jio11", "Reliance Jio12", "Reliance Jio13", "Reliance Jio14"],
};

export const RAM_ROM_OPTIONS = ["4GB/64GB", "4GB/128GB", "6GB/128GB", "6GB/256GB", "8GB/128GB", "8GB/256GB"];
export const INTEREST_OPTIONS = ["1", "2", "3", "4", "5"];
export const EMI_COUNT_OPTIONS = Array.from({ length: 24 }, (_, i) => String(i + 1));
export const REGIONS = ["Baserkund", "Saikheda", "Rasva", "Tamrani", "Bamonali", "Balakwada", "Jaipur"];

export const VILLAGES_BY_REGION: Record<string, string[]> = {
  Baserkund: [
    "Bajirpura",
    "Andhavan",
    "Pokhar",
    "Sailani",
    "Chandanpuri",
    "Umariya",
    "Utavat",
    "Sangvi",
    "Javada",
    "Naraypura",
    "Aujari",
    "Bider",
    "Khushwad",
    "Makandkheda",
    "Mandeleswar",
    "Kalbujarg",
    "Dharmpuri",
  ],
  Saikheda: [
    "Rampura",
    "Tirnga",
    "Dakhopur",
    "Naydad",
    "Besavad",
    "Hirapura",
  ],
  Rasva: [
    "Katrya",
    "Vandiya",
    "Singun",
    "Abari",
    "Maltar",
    "Vagadi",
    "Jodhpura",
    "Nandla",
    "Dolani",
    "Hatola",
    "Motapura",
    "Mirzapura",
    "Ambapura",
    "Dangadkheda",
    "Jahagirpura",
    "Khurumpura",
  ],
  Tamrani: [
    "Mapalpua",
    "Gopalpura",
    "Navalpura",
    "Bardevla",
    "Regva",
    "Khachipura",
    "Rupakheda",
    "Balsamand",
    "Maingaon",
    "Aasgaon",
    "Kundhadiya",
  ],
  Bamonali: [
    "Mokriya",
    "Surva",
    "Kusumpura",
    "Tamrani",
    "Jaljyote",
    "Khedi",
    "Chapla",
    "Pandhaniya",
    "Andvad",
    "Jayli",
    "Chokhti",
    "Coloumbiya",
    "Aswariya",
    "Damanchima",
    "Sangwal",
  ],
  Balakwada: [
    "Bhopalpura",
    "Silohiy",
    "Jhagdi",
    "Dasnaval",
    "Pipalvadi",
    "Kalikaray",
    "Damkheda",
    "Sauli",
  ],
  Jaipur: [
    "Jaipur",
  ],
};

export const VILLAGES = Object.values(VILLAGES_BY_REGION).flat();

// ---- Customer (Mobile Finance) ----
export type Customer = {
  id: string;
  billDate: string;
  // Personal
  firstName: string;
  fatherName: string;
  surname: string;
  name: string;         // firstName + " " + surname
  mobile: string;
  aadhaar: string;
  guarantyName: string;
  guarantyMobile: string;
  region: string;
  village: string;
  // Mobile Device
  mobileBrand: string;
  mobileModel: string;
  ramRom: string;
  imei1: string;
  imei2: string;
  // Finance (all numbers)
  price: number;
  fileCharge: number;       // price × 10%
  deposit: number;
  balanceForEmi: number;    // price − deposit
  interestRate: number;     // % per month
  interestPerMonth: number; // balance × rate / 100
  noOfEmi: number;
  totalInterest: number;    // interestPerMonth × noOfEmi
  totalEmiAmount: number;   // balance + totalInterest + fileCharge
  perMonthEmi: number;      // totalEmiAmount / noOfEmi
  emiDate: string;
  // Payment tracking
  paidEmis: number;
  pendingEmis: number;      // noOfEmi − paidEmis
  pendingAmount: number;    // pendingEmis × perMonthEmi
  lastPaymentDate: string;
  lastPaymentAmt: number;
  status: "Active" | "Overdue" | "Closed" | "Defaulted";
  missedEmis?: number;
  // Legacy compat (used by old pages)
  loan: string;
  emi: string;
  due: string;
};

export type Payment = {
  id: string;
  customer: string;
  customerId: string;
  date: string;
  amount: string;
  pending: string;
  collector: string;
  method: "Cash" | "UPI";
  status: "Success" | "Refunded";
  remarks: string;
};

export type Expense = {
  id: string;
  date: string;
  cat: string;
  desc: string;
  amount: string;
  type?: "Income" | "Expense";
  method?: "Cash" | "UPI";
};

export type Investment = {
  id: string;
  investor: string;
  amount: string;
  roi: string;
  maturity: string;
  status: "Active" | "Maturing" | "Closed";
  date?: string;
  method?: "Cash" | "UPI";
};

export type Notification = {
  id: string;
  type: string;
  text: string;
  time: string;
  tone: Tone;
  read?: boolean;
};

export type AuditEntry = {
  ts: string;
  user: string;
  action: string;
  target: string;
};

export type AppDocument = {
  id: string;
  customerId: string;
  customerName: string;
  type: "Aadhaar Card" | "Customer Photo" | "Invoice" | "PAN Card" | "Loan Agreement";
  fileName: string;
  fileSize: string;
  date: string;
  status: "Verified" | "Signed" | "Pending";
  fileUrl?: string;
};

export type Staff = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Inactive";
  access?: "Finance" | "Mobiles" | "Both";
  password?: string;
};

// Legacy types (kept for backward compat)
export type Loan = {
  id: string;
  customer: string;
  product: string;
  amount: string;
  deposit: string;
  emi: string;
  duration: string;
  interest: string;
  status: "Active" | "Overdue" | "Completed" | "Defaulted";
};

export type Collection = {
  id: string;
  name: string;
  customerId: string;
  village: string;
  amount: string;
  state: "Collected" | "Pending" | "Missed";
  collector: string;
  method: "Cash" | "UPI" | "—";
};

const today = () =>
  new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const fmtInr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

// ---- EMI Calculation ----
export function calcEmi(price: number, deposit: number, interestRate: number, noOfEmi: number, customFileCharge?: number) {
  const fileCharge = customFileCharge !== undefined && !isNaN(customFileCharge) ? customFileCharge : Math.round(price * 0.1);
  const balance = price - deposit;
  const interestPerMonth = Math.round(balance * interestRate / 100);
  const totalInterest = interestPerMonth * noOfEmi;
  const totalEmiAmount = balance + totalInterest + fileCharge;
  const perMonthEmi = noOfEmi > 0 ? Math.round(totalEmiAmount / noOfEmi) : 0;
  return { fileCharge, balance, interestPerMonth, totalInterest, totalEmiAmount, perMonthEmi };
}

// Legacy EMI calc
export function calculateEmi(principal: number, annualRatePct: number, months: number) {
  if (!principal || !months) return 0;
  if (!annualRatePct) return principal / months;
  const r = annualRatePct / 12 / 100;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

// ---- EMI Date Advancement Helpers ----
export function advanceEmiDate(dateStr: string): string {
  if (!dateStr) return "";
  // Check if it's YYYY-MM-DD
  const ymdMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (ymdMatch) {
    const y = parseInt(ymdMatch[1], 10);
    const m = parseInt(ymdMatch[2], 10) - 1; // 0-indexed
    const d = parseInt(ymdMatch[3], 10);
    const date = new Date(y, m + 1, d); // add 1 month
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Check if it's DD MMM YYYY (e.g., "19 Jun 2026")
  const dmyMatch = dateStr.match(/^(\d{2})\s+([a-zA-Z]{3})\s+(\d{4})$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const monthAbbrs = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthIdx = monthAbbrs.indexOf(dmyMatch[2]);
    const year = parseInt(dmyMatch[3], 10);
    if (monthIdx !== -1) {
      const date = new Date(year, monthIdx + 1, day); // add 1 month
      const nextDay = String(date.getDate()).padStart(2, '0');
      const nextMonth = monthAbbrs[date.getMonth()];
      const nextYear = date.getFullYear();
      return `${nextDay} ${nextMonth} ${nextYear}`;
    }
  }

  return dateStr; // fallback
}

export function formatDateToInr(ymd: string): string {
  if (!ymd) return "";
  const parts = ymd.split("-");
  if (parts.length !== 3) return ymd; // already formatted
  const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  if (isNaN(dateObj.getTime())) return ymd;
  return dateObj.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDateToYmd(dmy: string): string {
  if (!dmy) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(dmy)) return dmy;
  const parts = dmy.split(" ");
  if (parts.length === 3) {
    const day = parts[0].padStart(2, "0");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthIdx = months.indexOf(parts[1]);
    if (monthIdx !== -1) {
      const month = String(monthIdx + 1).padStart(2, "0");
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }
  }
  return dmy;
}

// ---- Seed data ----
function makeCust(
  id: string, billDate: string,
  firstName: string, fatherName: string, surname: string,
  mobile: string, aadhaar: string,
  guarantyName: string, guarantyMobile: string,
  region: string, village: string,
  mobileBrand: string, mobileModel: string, ramRom: string,
  imei1: string, imei2: string,
  price: number, deposit: number, interestRate: number, noOfEmi: number,
  emiDate: string, paidEmis: number,
  lastPaymentDate: string, lastPaymentAmt: number,
  status: Customer["status"],
): Customer {
  const { fileCharge, balance, interestPerMonth, totalInterest, totalEmiAmount, perMonthEmi } =
    calcEmi(price, deposit, interestRate, noOfEmi);
  const pendingEmis = noOfEmi - paidEmis;
  const pendingAmount = pendingEmis * perMonthEmi;
  return {
    id, billDate,
    firstName, fatherName, surname,
    name: `${firstName} ${surname}`,
    mobile, aadhaar, guarantyName, guarantyMobile, region, village,
    mobileBrand, mobileModel, ramRom, imei1, imei2,
    price, fileCharge, deposit, balanceForEmi: balance,
    interestRate, interestPerMonth, noOfEmi,
    totalInterest, totalEmiAmount, perMonthEmi,
    emiDate, paidEmis, pendingEmis, pendingAmount,
    lastPaymentDate, lastPaymentAmt, status,
    loan: fmtInr(price), emi: fmtInr(perMonthEmi), due: emiDate,
  };
}

const seedCustomers: Customer[] = [];
const seedLoans: Loan[] = [];
const seedCollections: Collection[] = [];
const seedPayments: Payment[] = [];
const seedExpenses: Expense[] = [];
const seedInvestments: Investment[] = [];
const seedNotifications: Notification[] = [];
const seedAudit: AuditEntry[] = [
  { ts: "28 Jul 2026, 10:15 AM", user: "Avinash G", action: "User Login", target: "Signed in to Jain Finance Management Console" },
  { ts: "28 Jul 2026, 09:40 AM", user: "Rajesh Jain", action: "Recorded payment", target: "TXN-012 · ₹3,500 from Bajrang Singh" },
  { ts: "27 Jul 2026, 04:20 PM", user: "Sunil Verma", action: "Added customer", target: "JF-048 · Vikram Patel (Balakwada)" },
  { ts: "27 Jul 2026, 02:10 PM", user: "Avinash G", action: "Added expense", target: "EX-015 · Office Refreshments (₹1,200)" },
  { ts: "26 Jul 2026, 11:30 AM", user: "Rajesh Jain", action: "Added investment", target: "INV-004 · Suresh Sharma (₹1,000,000)" },
  { ts: "25 Jul 2026, 05:15 PM", user: "Sunil Verma", action: "Collected EMI", target: "JF-022 · Ramesh Chandra (₹2,800)" },
  { ts: "25 Jul 2026, 10:00 AM", user: "Avinash G", action: "Updated Staff", target: "ST-003 · Sunil Verma (Finance Access)" },
  { ts: "24 Jul 2026, 03:45 PM", user: "Rajesh Jain", action: "Exported Reports", target: "Full Customer Ledger Statement Excel" },
];

const seedStaff: Staff[] = [
  { id: "ST-001", name: "Avinash G", email: "g.avinash10005@gmail.com", role: "Admin", status: "Active", access: "Both" },
  { id: "ST-002", name: "Rajesh Jain", email: "rajesh@jainfinance.com", role: "Admin", status: "Active", access: "Both" },
  { id: "ST-003", name: "Sunil Verma", email: "sunil@jainfinance.com", role: "Staff", status: "Active", access: "Finance" },
  { id: "ST-004", name: "Ramesh Shah", email: "ramesh@jainfinance.com", role: "Staff", status: "Active", access: "Mobiles" },
];

// ── Login Rate Limiting ──────────────────────────────────────────────────────
// Track failed login attempts in-memory (resets on page reload — intentional for UX)
const loginFailures: Map<string, { count: number; lockedUntil: number }> = new Map();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MS = 5 * 60 * 1000; // 5 minutes

export function checkLoginRateLimit(email: string): { allowed: boolean; secondsLeft?: number } {
  const key = email.trim().toLowerCase();
  const entry = loginFailures.get(key);
  if (!entry) return { allowed: true };
  if (entry.lockedUntil > Date.now()) {
    const secondsLeft = Math.ceil((entry.lockedUntil - Date.now()) / 1000);
    return { allowed: false, secondsLeft };
  }
  return { allowed: true };
}

export function recordLoginFailure(email: string): void {
  const key = email.trim().toLowerCase();
  const entry = loginFailures.get(key) || { count: 0, lockedUntil: 0 };
  entry.count += 1;
  if (entry.count >= MAX_LOGIN_ATTEMPTS) {
    entry.lockedUntil = Date.now() + LOCKOUT_MS;
    entry.count = 0;
  }
  loginFailures.set(key, entry);
}

export function clearLoginFailures(email: string): void {
  loginFailures.delete(email.trim().toLowerCase());
}

/** Returns true if the staff member is allowed to access the given module path */
export function canAccessModule(staff: Staff | null, path: string): boolean {
  if (!staff) return false;
  if (staff.role?.toLowerCase() === "admin") return true;
  const isMobiles = path.startsWith("/mobiles");
  const access = staff.access || "Both";
  if (access === "Both") return true;
  if (access === "Finance" && !isMobiles) return true;
  if (access === "Mobiles" && isMobiles) return true;
  return false;
}

// ---- Store ----
type State = {
  customers: Customer[];
  loans: Loan[];
  collections: Collection[];
  payments: Payment[];
  expenses: Expense[];
  investments: Investment[];
  notifications: Notification[];
  audit: AuditEntry[];
  documents: AppDocument[];
  darkMode: boolean;
  staff: Staff[];
  currentUser: Staff | null;
  sheetsConfig: SheetsConfig;

  toggleDarkMode: () => void;
  login: (email: string) => boolean;
  loginWithPassword: (email: string, password: string) => boolean;
  logout: () => void;
  addStaff: (input: { name: string; email: string; role: string; access?: "Finance" | "Mobiles" | "Both"; password?: string }) => Staff;
  updateStaff: (id: string, input: Partial<Omit<Staff, "id">>) => Staff | undefined;
  deleteStaff: (id: string) => void;
  deleteCustomer: (id: string) => void;
  deleteLoan: (id: string) => void;
  deletePayment: (id: string) => void;
  deleteExpense: (id: string) => void;
  deleteInvestment: (id: string) => void;
  deleteDocument: (id: string) => void;
  addCustomer: (input: {
    firstName: string; fatherName: string; surname: string;
    mobile: string; aadhaar: string;
    guarantyName: string; guarantyMobile: string;
    region: string; village: string;
    mobileBrand: string; mobileModel: string; ramRom: string;
    imei1: string; imei2: string;
    price: number; deposit: number;
    interestRate: number; noOfEmi: number; emiDate: string;
    billDate?: string;
    fileCharge?: number;
    aadhaarFile?: { name: string; url: string; size: string };
    photoFile?: { name: string; url: string; size: string };
  }) => Customer;
  updateCustomer: (id: string, input: {
    firstName: string; fatherName: string; surname: string;
    mobile: string; aadhaar: string;
    guarantyName: string; guarantyMobile: string;
    region: string; village: string;
    mobileBrand: string; mobileModel: string; ramRom: string;
    imei1: string; imei2: string;
    price: number; deposit: number;
    interestRate: number; noOfEmi: number; emiDate: string;
    status: Customer["status"];
    fileCharge?: number;
  }) => Customer | undefined;
  addLoan: (input: { customer: string; product: string; amount: number; deposit: number; interest: number; months: number }) => Loan;
  recordPayment: (input: { customerId: string; amount: number; method: Payment["method"]; collector: string; remarks: string; date?: string }) => void;
  collectEmi: (input: { collectionId: string; method: Collection["method"] }) => void;
  receiveCustomPayment: (input: { customer: string; amount: number; method: Payment["method"]; collector: string }) => void;
  addExpense: (input: { cat: string; desc: string; amount: number; type?: "Income" | "Expense"; date?: string; method?: "Cash" | "UPI" }) => Expense;
  addInvestment: (input: { investor: string; amount: number; roi: number; maturity: string; date?: string; method?: "Cash" | "UPI" }) => Investment;
  sendWhatsapp: (input: { to: string; kind: string }) => void;
  markAllNotificationsRead: () => void;
  markNotificationRead: (id: string) => void;
  pushNotification: (n: Omit<Notification, "id" | "time">) => void;
  pushAudit: (e: Omit<AuditEntry, "ts">) => void;
  resetSeed: () => void;
  recheckStatuses: () => void;
  updateSheetsConfig: (cfg: Partial<SheetsConfig>) => void;
  syncToSheets: () => Promise<{ ok: boolean; error?: string }>;
  loadFromSheets: () => Promise<{ ok: boolean; error?: string }>;
};

// ── PERMANENT GOOGLE SHEETS DATABASE URL ─────────────────────────────────────
// This URL is permanently baked into the app — no manual configuration needed.
const PERMANENT_SHEETS_URL =
  (import.meta.env.VITE_GOOGLE_SHEETS_URL as string) ||
  "https://script.google.com/macros/s/AKfycbwWVkQNCNKEhICOxfWZasNAeUbJBQTB2gXaTtFk2QzCSt1r2ZhwsuZgTNYGJy_1I1ek/exec";

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      customers: seedCustomers,
      loans: seedLoans,
      collections: seedCollections,
      payments: seedPayments,
      expenses: seedExpenses,
      investments: seedInvestments,
      notifications: seedNotifications,
      audit: seedAudit,
      documents: [],
      darkMode: false,
      staff: seedStaff,
      currentUser: null, // starts logged out to prompt user login
      sheetsConfig: {
        url: PERMANENT_SHEETS_URL,
        enabled: true,
        lastSync: undefined
      },

      toggleDarkMode: () => {
        const next = !get().darkMode;
        set({ darkMode: next });
        if (next) document.documentElement.classList.add("dark");
        else document.documentElement.classList.remove("dark");
      },

      login: (email) => {
        const found = get().staff.find(
          (s) => s.email.toLowerCase() === email.trim().toLowerCase() && s.status === "Active"
        );
        if (found) {
          set({ currentUser: found });
          return true;
        }
        return false;
      },

      loginWithPassword: (email, password) => {
        const cleanEmail = email.trim().toLowerCase();
        const cleanPass = password.trim();
        const found = get().staff.find(
          (s) =>
            s.email.toLowerCase() === cleanEmail &&
            s.status === "Active" &&
            (s.password ? s.password === cleanPass : true)
        );
        if (found) {
          clearLoginFailures(cleanEmail);
          set({ currentUser: found });
          return true;
        }
        return false;
      },

      logout: () => {
        set({ currentUser: null });
      },

      addStaff: (input) => {
        const existing = get().staff;
        const maxId = existing.reduce((max, s) => {
          const n = parseInt(s.id.replace("ST-", ""), 10);
          return isNaN(n) ? max : Math.max(max, n);
        }, 0);
        const id = "ST-" + (maxId + 1).toString().padStart(3, "0");
        const newMember: Staff = {
          id,
          name: input.name,
          email: input.email,
          role: input.role,
          status: "Active",
          access: input.access || "Both",
          password: input.password || "",
        };
        set((s) => ({
          staff: [...s.staff, newMember],
          audit: [
            {
              ts: new Date().toLocaleString("en-IN"),
              user: s.currentUser?.name || "System",
              action: "Added staff member",
              target: `${id} · ${input.name} (${input.role})`,
            },
            ...s.audit,
          ],
        }));
        // Trigger immediate background sync to Google Sheets
        get().syncToSheets().catch((err) => console.warn("[Store] Immediate staff add sync failed:", err));
        return newMember;
      },

      updateStaff: (id, input) => {
        const existing = get().staff.find((s) => s.id === id);
        if (!existing) return undefined;
        const updated: Staff = {
          ...existing,
          name: input.name ?? existing.name,
          email: input.email ?? existing.email,
          role: input.role ?? existing.role,
          access: input.access ?? existing.access,
          password: input.password !== undefined ? input.password : existing.password,
          status: input.status ?? existing.status,
        };
        set((s) => ({
          staff: s.staff.map((m) => (m.id === id ? updated : m)),
          currentUser: s.currentUser?.id === id ? updated : s.currentUser,
          audit: [
            {
              ts: new Date().toLocaleString("en-IN"),
              user: s.currentUser?.name || "System",
              action: "Updated staff member",
              target: `${id} · ${updated.name} (${updated.role})`,
            },
            ...s.audit,
          ],
        }));
        // Trigger immediate background sync to Google Sheets
        get().syncToSheets().catch((err) => console.warn("[Store] Immediate staff update sync failed:", err));
        return updated;
      },

      deleteStaff: (id) => {
        const found = get().staff.find((s) => s.id === id);
        set((s) => ({
          staff: s.staff.filter((m) => m.id !== id),
          audit: [
            {
              ts: new Date().toLocaleString("en-IN"),
              user: s.currentUser?.name || "System",
              action: "Deleted staff member",
              target: `${id} · ${found?.name || ""}`,
            },
            ...s.audit,
          ],
        }));
        // Trigger immediate background sync to Google Sheets
        get().syncToSheets().catch((err) => console.warn("[Store] Immediate staff delete sync failed:", err));
      },

      deleteCustomer: (id) => {
        const found = get().customers.find((c) => c.id === id);
        set((s) => ({
          customers: s.customers.filter((c) => c.id !== id),
          collections: s.collections.filter((col) => col.customerId !== id),
          payments: s.payments.filter((p) => p.customerId !== id),
          documents: s.documents.filter((doc) => doc.customerId !== id),
          audit: [
            {
              ts: new Date().toLocaleString("en-IN"),
              user: s.currentUser?.name || "System",
              action: "Deleted customer",
              target: `${id} · ${found?.name || ""}`,
            },
            ...s.audit,
          ],
        }));
        get().syncToSheets().catch((err) => console.warn("[Store] Immediate customer delete sync failed:", err));
      },

      deleteLoan: (id) => {
        const found = get().loans.find((l) => l.id === id);
        set((s) => ({
          loans: s.loans.filter((l) => l.id !== id),
          audit: [
            {
              ts: new Date().toLocaleString("en-IN"),
              user: s.currentUser?.name || "System",
              action: "Deleted loan",
              target: `${id} · ${found?.customer || ""}`,
            },
            ...s.audit,
          ],
        }));
      },

      deletePayment: (id) => {
        const p = get().payments.find((x) => x.id === id);
        if (!p) return;
        
        if (p.customerId) {
          const cust = get().customers.find((c) => c.id === p.customerId);
          if (cust) {
            const newPaid = Math.max(0, cust.paidEmis - 1);
            const newPending = cust.noOfEmi - newPaid;
            const newPendingAmt = newPending * cust.perMonthEmi;
            
            const revertEmiDate = (dStr: string): string => {
              const match = dStr.match(/^(\d{2})\s+([a-zA-Z]{3})\s+(\d{4})$/);
              if (match) {
                const day = parseInt(match[1], 10);
                const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                const monthIdx = months.indexOf(match[2]);
                const year = parseInt(match[3], 10);
                if (monthIdx !== -1) {
                  const d = new Date(year, monthIdx - 1, day);
                  const prevDay = String(d.getDate()).padStart(2, '0');
                  const prevMonth = months[d.getMonth()];
                  const prevYear = d.getFullYear();
                  return `${prevDay} ${prevMonth} ${prevYear}`;
                }
              }
              return dStr;
            };

            const prevEmiDate = revertEmiDate(cust.emiDate);
            const remainingPayments = get().payments.filter((x) => x.id !== id && x.customerId === p.customerId && x.status === "Success");
            const lastP = remainingPayments[0];

            set((s) => ({
              customers: recalculateStatuses(s.customers.map((c) =>
                c.id === p.customerId
                  ? {
                      ...c,
                      paidEmis: newPaid,
                      pendingEmis: newPending,
                      pendingAmount: newPendingAmt,
                      lastPaymentDate: lastP ? lastP.date : "—",
                      lastPaymentAmt: lastP ? Number(lastP.amount.replace(/[^\d]/g, "")) : 0,
                      status: newPending === 0 ? "Closed" : "Active",
                      emiDate: prevEmiDate,
                      due: prevEmiDate
                    }
                  : c
              )),
              collections: s.collections.map((col) =>
                col.customerId === p.customerId ? { ...col, state: lastP ? "Collected" : "Pending" } : col
              )
            }));
          }
        }

        set((s) => ({
          payments: s.payments.filter((x) => x.id !== id),
          audit: [
            {
              ts: new Date().toLocaleString("en-IN"),
              user: s.currentUser?.name || "System",
              action: "Deleted payment entry",
              target: `${id} · Reversed payment of ${p.amount} from ${p.customer}`,
            },
            ...s.audit,
          ],
        }));
        get().syncToSheets().catch((err) => console.warn("[Store] Immediate payment delete sync failed:", err));
      },

      deleteExpense: (id) => {
        const found = get().expenses.find((e) => e.id === id);
        set((s) => ({
          expenses: s.expenses.filter((e) => e.id !== id),
          audit: [
            {
              ts: new Date().toLocaleString("en-IN"),
              user: s.currentUser?.name || "System",
              action: "Deleted expense",
              target: `${id} · ${found?.cat || ""} (${found?.amount || ""})`,
            },
            ...s.audit,
          ],
        }));
        get().syncToSheets().catch((err) => console.warn("[Store] Immediate expense delete sync failed:", err));
      },

      deleteInvestment: (id) => {
        const found = get().investments.find((i) => i.id === id);
        set((s) => ({
          investments: s.investments.filter((i) => i.id !== id),
          audit: [
            {
              ts: new Date().toLocaleString("en-IN"),
              user: s.currentUser?.name || "System",
              action: "Deleted investment",
              target: `${id} · ${found?.investor || ""} (${found?.amount || ""})`,
            },
            ...s.audit,
          ],
        }));
        get().syncToSheets().catch((err) => console.warn("[Store] Immediate investment delete sync failed:", err));
      },

      deleteDocument: (id) => {
        const found = get().documents.find((d) => d.id === id);
        set((s) => ({
          documents: s.documents.filter((d) => d.id !== id),
          audit: [
            {
              ts: new Date().toLocaleString("en-IN"),
              user: s.currentUser?.name || "System",
              action: "Deleted document",
              target: `${id} · ${found?.fileName || ""}`,
            },
            ...s.audit,
          ],
        }));
      },

      addCustomer: (input) => {
        const { fileCharge, balance, interestPerMonth, totalInterest, totalEmiAmount, perMonthEmi } =
          calcEmi(input.price, input.deposit, input.interestRate, input.noOfEmi, input.fileCharge);
        const existing = get().customers.filter((c) => c.id.startsWith("JF-"));
        const maxId = existing.reduce((max, c) => {
          const n = parseInt(c.id.replace("JF-", ""), 10);
          return isNaN(n) ? max : Math.max(max, n);
        }, 0);
        const id = "JF-" + (maxId + 1).toString().padStart(3, "0");
        const customer: Customer = {
          id,
          billDate: input.billDate || today(),
          firstName: input.firstName,
          fatherName: input.fatherName,
          surname: input.surname,
          name: `${input.firstName} ${input.surname}`,
          mobile: input.mobile,
          aadhaar: input.aadhaar,
          guarantyName: input.guarantyName,
          guarantyMobile: input.guarantyMobile,
          region: input.region,
          village: input.village,
          mobileBrand: input.mobileBrand,
          mobileModel: input.mobileModel,
          ramRom: input.ramRom,
          imei1: input.imei1,
          imei2: input.imei2,
          price: input.price,
          fileCharge,
          deposit: input.deposit,
          balanceForEmi: balance,
          interestRate: input.interestRate,
          interestPerMonth,
          noOfEmi: input.noOfEmi,
          totalInterest,
          totalEmiAmount,
          perMonthEmi,
          emiDate: input.emiDate,
          paidEmis: 0,
          pendingEmis: input.noOfEmi,
          pendingAmount: totalEmiAmount,
          lastPaymentDate: "—",
          lastPaymentAmt: 0,
          status: "Active",
          loan: fmtInr(input.price),
          emi: fmtInr(perMonthEmi),
          due: input.emiDate,
        };
        // Also add to collections due list
        const colId = "C-" + (get().collections.length + 1).toString().padStart(3, "0");
        const collection: Collection = {
          id: colId,
          name: customer.name,
          customerId: id,
          village: customer.village,
          amount: customer.emi,
          state: "Pending",
          collector: "Rajesh Jain",
          method: "—",
        };

        // Create documents if uploaded
        const newDocs: AppDocument[] = [];
        if (input.aadhaarFile) {
          newDocs.push({
            id: `DOC-${Date.now()}-1`,
            customerId: id,
            customerName: customer.name,
            type: "Aadhaar Card",
            fileName: input.aadhaarFile.name,
            fileSize: input.aadhaarFile.size,
            date: today(),
            status: "Verified",
            fileUrl: input.aadhaarFile.url,
          });
        }
        if (input.photoFile) {
          newDocs.push({
            id: `DOC-${Date.now()}-2`,
            customerId: id,
            customerName: customer.name,
            type: "Customer Photo",
            fileName: input.photoFile.name,
            fileSize: input.photoFile.size,
            date: today(),
            status: "Verified",
            fileUrl: input.photoFile.url,
          });
        }

        // ── Inline HTML escaping to prevent XSS in invoice template ────────────────
        const esc = (v: string | undefined | null): string => {
          if (v === undefined || v === null || v === "") return "—";
          return String(v)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
        };

        // Generate printable HTML invoice content
        const invoiceContent = `
          <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; padding: 40px; max-width: 800px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; background: white; color: #1e293b; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);">
            <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #f1f5f9; padding-bottom: 24px; margin-bottom: 24px;">
              <div>
                <h1 style="margin: 0; font-size: 28px; font-weight: 800; color: #0f172a; letter-spacing: -0.025em; text-transform: uppercase;">JAIN FINANCE</h1>
                <p style="margin: 6px 0 0 0; font-size: 13px; color: #64748b; font-weight: 500;">Mobile Phone EMI Repayment Invoice</p>
                <p style="margin: 2px 0 0 0; font-size: 12px; color: #94a3b8;">Shirwal, Maharashtra, India</p>
              </div>
              <div style="text-align: right;">
                <h2 style="margin: 0; font-size: 16px; font-weight: 700; color: #3b82f6; letter-spacing: 0.05em; text-transform: uppercase;">Invoice Statement</h2>
                <p style="margin: 6px 0 0 0; font-size: 13px; font-weight: 600; color: #0f172a;">Invoice ID: <strong>INV-${id}</strong></p>
                <p style="margin: 2px 0 0 0; font-size: 12px; color: #64748b;">Date: ${customer.billDate}</p>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; font-size: 13px; line-height: 1.5;">
              <div style="background: #f8fafc; padding: 16px; border-radius: 8px;">
                <h3 style="margin: 0 0 10px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em;">Customer Details</h3>
                <p style="margin: 3px 0;"><strong>Name:</strong> ${esc(customer.name)}</p>
                <p style="margin: 3px 0;"><strong>Father's Name:</strong> ${esc(input.fatherName)}</p>
                <p style="margin: 3px 0;"><strong>Mobile:</strong> ${esc(customer.mobile)}</p>
                <p style="margin: 3px 0;"><strong>Aadhaar:</strong> ${customer.aadhaar ? "XXXX-XXXX-" + String(customer.aadhaar).replace(/\D/g, "").slice(-4) : "—"}</p>
                <p style="margin: 3px 0;"><strong>Location:</strong> ${esc(customer.village)}, ${esc(customer.region)}</p>
              </div>
              <div style="background: #f8fafc; padding: 16px; border-radius: 8px;">
                <h3 style="margin: 0 0 10px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em;">Device &amp; Guarantor Information</h3>
                <p style="margin: 3px 0;"><strong>Guarantor:</strong> ${esc(input.guarantyName)} (${esc(input.guarantyMobile)})</p>
                <p style="margin: 3px 0;"><strong>Brand &amp; Model:</strong> ${esc(customer.mobileBrand)} ${esc(customer.mobileModel)} (${esc(customer.ramRom)})</p>
                <p style="margin: 3px 0;"><strong>IMEI 1:</strong> ${esc(customer.imei1)}</p>
                <p style="margin: 3px 0;"><strong>IMEI 2:</strong> ${esc(customer.imei2)}</p>
              </div>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 13px;">
              <thead>
                <tr style="border-bottom: 2px solid #e2e8f0; background: #f8fafc; text-align: left;">
                  <th style="padding: 12px; font-weight: 600; color: #475569;">Item Description</th>
                  <th style="padding: 12px; text-align: right; font-weight: 600; color: #475569;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 12px; color: #334155;">Mobile Phone Selling Price</td>
                  <td style="padding: 12px; text-align: right; font-weight: 500; color: #0f172a;">₹${customer.price.toLocaleString("en-IN")}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 12px; color: #334155;">Processing / File Charge (10% standard fee)</td>
                  <td style="padding: 12px; text-align: right; font-weight: 500; color: #0f172a;">₹${customer.fileCharge.toLocaleString("en-IN")}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 12px; color: #334155;">Finance Interest (${customer.interestRate}% monthly interest rate for ${customer.noOfEmi} months)</td>
                  <td style="padding: 12px; text-align: right; font-weight: 500; color: #0f172a;">₹${customer.totalInterest.toLocaleString("en-IN")}</td>
                </tr>
                <tr style="border-bottom: 2px solid #e2e8f0; font-weight: 600; background: #f8fafc;">
                  <td style="padding: 12px; color: #0f172a;">Gross Total Value</td>
                  <td style="padding: 12px; text-align: right; color: #0f172a;">₹${(customer.price + customer.fileCharge + customer.totalInterest).toLocaleString("en-IN")}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 12px; color: #64748b; font-style: italic;">Less: Down Payment / Initial Deposit Paid</td>
                  <td style="padding: 12px; text-align: right; font-weight: 600; color: #ef4444;">- ₹${customer.deposit.toLocaleString("en-IN")}</td>
                </tr>
                <tr style="border-bottom: 2px solid #0f172a; font-weight: 700; font-size: 14px; background: #f1f5f9;">
                  <td style="padding: 12px; color: #0f172a;">Remaining Principal Financed (Total EMI Debt)</td>
                  <td style="padding: 12px; text-align: right; color: #16a34a;">₹${customer.totalEmiAmount.toLocaleString("en-IN")}</td>
                </tr>
              </tbody>
            </table>

            <div style="margin-bottom: 35px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; background: #f8fafc; font-size: 13px;">
              <h4 style="margin: 0 0 10px 0; font-size: 12px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em;">EMI Installment Schedule</h4>
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;">
                <div>
                  <div style="font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 600;">Monthly EMI Instalment</div>
                  <div style="font-size: 16px; font-weight: 800; color: #16a34a; margin-top: 4px;">₹${customer.perMonthEmi.toLocaleString("en-IN")}</div>
                </div>
                <div>
                  <div style="font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 600;">Repayment Duration</div>
                  <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 4px;">${customer.noOfEmi} Months</div>
                </div>
                <div>
                  <div style="font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 600;">EMI Starting Date</div>
                  <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 4px;">${customer.emiDate}</div>
                </div>
              </div>
            </div>

            <div style="margin-top: 50px; display: flex; justify-content: space-between; font-size: 12px; color: #64748b;">
              <div style="text-align: center;">
                <div style="border-top: 1px solid #cbd5e1; width: 180px; padding-top: 8px; font-weight: 500;">Customer's Signature</div>
              </div>
              <div style="text-align: center;">
                <div style="border-top: 1px solid #cbd5e1; width: 180px; padding-top: 8px; font-weight: 500; margin-left: auto;">For JAIN FINANCE</div>
              </div>
            </div>
          </div>
        `;

        newDocs.push({
          id: `DOC-${Date.now()}-3`,
          customerId: id,
          customerName: customer.name,
          type: "Invoice",
          fileName: `Invoice-${id}.html`,
          fileSize: "5.2 KB",
          date: today(),
          status: "Signed",
          fileUrl: `data:text/html;charset=utf-8,${encodeURIComponent(invoiceContent)}`,
        });

        set((s) => ({
          customers: recalculateStatuses([customer, ...s.customers]),
          collections: [collection, ...s.collections],
          documents: [...newDocs, ...s.documents],
          notifications: [
            { id: "N" + Date.now(), type: "New Customer", text: `${customer.name} registered – ${input.mobileBrand} ${input.mobileModel}`, time: "just now", tone: "info" },
            ...s.notifications,
          ],
          audit: [
            { ts: new Date().toLocaleString("en-IN"), user: "Rajesh Jain", action: "Registered customer", target: `${id} ${customer.name} – ${input.mobileBrand} ${input.mobileModel}` },
            ...s.audit,
          ],
        }));
        get().syncToSheets().catch((err) => console.warn("[Store] Immediate customer add sync failed:", err));
        return customer;
      },

      updateCustomer: (id, input) => {
        const cust = get().customers.find((c) => c.id === id);
        if (!cust) return undefined;

        const { fileCharge, balance, interestPerMonth, totalInterest, totalEmiAmount, perMonthEmi } =
          calcEmi(input.price, input.deposit, input.interestRate, input.noOfEmi, input.fileCharge);

        const paidEmis = Math.min(cust.paidEmis, input.noOfEmi);
        const pendingEmis = input.noOfEmi - paidEmis;
        const pendingAmount = pendingEmis * perMonthEmi;
        const nextStatus = pendingEmis === 0 ? "Closed" : input.status;

        const updated: Customer = {
          ...cust,
          firstName: input.firstName,
          fatherName: input.fatherName,
          surname: input.surname,
          name: `${input.firstName} ${input.surname}`,
          mobile: input.mobile,
          aadhaar: input.aadhaar,
          guarantyName: input.guarantyName,
          guarantyMobile: input.guarantyMobile,
          region: input.region,
          village: input.village,
          mobileBrand: input.mobileBrand,
          mobileModel: input.mobileModel,
          ramRom: input.ramRom,
          imei1: input.imei1,
          imei2: input.imei2,
          price: input.price,
          fileCharge,
          deposit: input.deposit,
          balanceForEmi: balance,
          interestRate: input.interestRate,
          interestPerMonth,
          noOfEmi: input.noOfEmi,
          totalInterest,
          totalEmiAmount,
          perMonthEmi,
          emiDate: input.emiDate,
          paidEmis,
          pendingEmis,
          pendingAmount,
          status: nextStatus,
          loan: fmtInr(input.price),
          emi: fmtInr(perMonthEmi),
          due: input.emiDate,
        };

        set((s) => ({
          customers: recalculateStatuses(s.customers.map((c) => (c.id === id ? updated : c))),
          collections: s.collections.map((col) =>
            col.customerId === id
              ? {
                  ...col,
                  name: updated.name,
                  village: updated.village,
                  amount: updated.emi,
                }
              : col
          ),
          audit: [
            {
              ts: new Date().toLocaleString("en-IN"),
              user: "Rajesh Jain",
              action: "Updated customer details",
              target: `${id} ${updated.name}`,
            },
            ...s.audit,
          ],
        }));

        get().syncToSheets().catch((err) => console.warn("[Store] Immediate customer update sync failed:", err));
        return updated;
      },

      recordPayment: ({ customerId, amount, method, collector, remarks, date }) => {
        const cust = get().customers.find((c) => c.id === customerId);
        if (!cust) return;
        const txnId = "TXN-" + (get().payments.length + 1).toString().padStart(3, "0");
        const newPaidEmis = Math.min(cust.paidEmis + 1, cust.noOfEmi);
        const newPendingEmis = cust.noOfEmi - newPaidEmis;
        const newPendingAmount = newPendingEmis * cust.perMonthEmi;
        const newStatus: Customer["status"] =
          newPendingEmis === 0 ? "Closed" : cust.status;
        const pDate = date ? formatDateToInr(date) : today();
        const nextEmiDate = advanceEmiDate(cust.emiDate);
        set((s) => ({
          customers: recalculateStatuses(s.customers.map((c) =>
            c.id === customerId
              ? {
                  ...c,
                  paidEmis: newPaidEmis,
                  pendingEmis: newPendingEmis,
                  pendingAmount: newPendingAmount,
                  lastPaymentDate: pDate,
                  lastPaymentAmt: amount,
                  status: newStatus,
                  emiDate: nextEmiDate,
                  due: nextEmiDate,
                }
              : c
          )),
          collections: s.collections.map((c) =>
            c.customerId === customerId ? { ...c, state: "Collected" as const, method } : c
          ),
          payments: [
            { id: txnId, customer: cust.name, customerId, date: pDate, amount: fmtInr(amount), pending: fmtInr(newPendingAmount), collector, method, status: "Success", remarks },
            ...s.payments,
          ],
          notifications: [
            { id: "N" + Date.now(), type: "Payment", text: `${fmtInr(amount)} received from ${cust.name}`, time: "just now", tone: "success" },
            ...s.notifications,
          ],
          audit: [
            { ts: new Date().toLocaleString("en-IN"), user: collector, action: "Recorded payment", target: `${txnId} · ${fmtInr(amount)} from ${cust.name}` },
            ...s.audit,
          ],
        }));
        get().syncToSheets().catch((err) => console.warn("[Store] Immediate payment sync failed:", err));
      },

      addLoan: (input) => {
        const months = input.months || 12;
        const principal = input.amount - input.deposit;
        const emi = calculateEmi(principal, input.interest, months);
        const existingLoans = get().loans.filter((l) => l.id.startsWith("LN-"));
        const maxLoanId = existingLoans.reduce((max, l) => {
          const n = parseInt(l.id.replace("LN-", ""), 10);
          return isNaN(n) ? max : Math.max(max, n);
        }, 0);
        const id = "LN-" + (maxLoanId + 1).toString().padStart(3, "0");
        const loan: Loan = {
          id, customer: input.customer, product: input.product,
          amount: fmtInr(input.amount), deposit: fmtInr(input.deposit),
          emi: fmtInr(emi), duration: `${months} mo`, interest: `${input.interest}%`, status: "Active",
        };
        set((s) => ({ loans: [loan, ...s.loans] }));
        return loan;
      },

      collectEmi: ({ collectionId, method }) => {
        const c = get().collections.find((x) => x.id === collectionId);
        if (!c) return;
        const customerId = c.customerId;
        if (customerId) {
          get().recordPayment({
            customerId,
            amount: Number(c.amount.replace(/[^\d]/g, "")),
            method: method === "—" ? "Cash" : method,
            collector: c.collector,
            remarks: "Collected from due list",
          });
        }
      },

      receiveCustomPayment: ({ customer, amount, method, collector }) => {
        const txnId = "TXN-" + (get().payments.length + 1).toString().padStart(3, "0");
        set((s) => ({
          payments: [
            { id: txnId, customer, customerId: "", date: today(), amount: fmtInr(amount), pending: "—", collector, method, status: "Success", remarks: "" },
            ...s.payments,
          ],
        }));
        get().syncToSheets().catch((err) => console.warn("[Store] Immediate custom payment sync failed:", err));
      },

      addExpense: (input) => {
        const existingExpenses = get().expenses.filter((e) => e.id.startsWith("EX-"));
        const maxExpId = existingExpenses.reduce((max, e) => {
          const n = parseInt(e.id.replace("EX-", ""), 10);
          return isNaN(n) ? max : Math.max(max, n);
        }, 0);
        const id = "EX-" + (maxExpId + 1).toString().padStart(3, "0");
        const expense: Expense = {
          id,
          date: input.date ? formatDateToInr(input.date) : today(),
          cat: input.cat,
          desc: input.desc,
          amount: fmtInr(input.amount),
          type: input.type ?? "Expense",
          method: input.method ?? "Cash"
        };
        set((s) => ({
          expenses: [expense, ...s.expenses],
          audit: [{ ts: new Date().toLocaleString("en-IN"), user: "Rajesh Jain", action: `Added ${expense.type?.toLowerCase() || "expense"}`, target: `${id} · ${expense.amount}` }, ...s.audit],
        }));
        get().syncToSheets().catch((err) => console.warn("[Store] Immediate expense sync failed:", err));
        return expense;
      },

      addInvestment: (input) => {
        const existingInv = get().investments.filter((i) => i.id.startsWith("INV-"));
        const maxInvId = existingInv.reduce((max, i) => {
          const n = parseInt(i.id.replace("INV-", ""), 10);
          return isNaN(n) ? max : Math.max(max, n);
        }, 0);
        const id = "INV-" + (maxInvId + 1).toString().padStart(3, "0");
        const investment: Investment = {
          id, investor: input.investor, amount: fmtInr(input.amount),
          roi: `${input.roi}%`, maturity: input.maturity, status: "Active",
          date: input.date ? formatDateToInr(input.date) : today(),
          method: input.method ?? "UPI",
        };
        set((s) => ({
          investments: [investment, ...s.investments],
          audit: [{ ts: new Date().toLocaleString("en-IN"), user: "Rajesh Jain", action: "Added investment", target: `${id} · ${investment.amount}` }, ...s.audit],
        }));
        get().syncToSheets().catch((err) => console.warn("[Store] Immediate investment sync failed:", err));
        return investment;
      },

      sendWhatsapp: ({ to, kind }) => {
        const cust = get().customers.find((c) => c.mobile === to);
        let msg = `Hello! This is a message from Jain Finance.`;
        if (cust) {
          if (kind === "EMI Reminder" || kind === "EMI Due Reminder") {
            msg = `Dear *${cust.name}*, this is a friendly reminder from *Jain Finance* regarding your EMI for *${cust.mobileBrand} ${cust.mobileModel}*. Your monthly instalment of *₹${cust.perMonthEmi.toLocaleString("en-IN")}* is due on *${cust.emiDate}*. Please keep the payment ready. Thank you!`;
          } else {
            msg = `Dear *${cust.name}*, this is a message from *Jain Finance* regarding your account status (*${cust.status}*). Please contact us for details. Thank you!`;
          }
        }

        if (typeof window !== "undefined") {
          let cleanPhone = to.replace(/[^\d]/g, "");
          if (cleanPhone.length === 10) {
            cleanPhone = "91" + cleanPhone;
          }
          const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`;
          window.open(url, "_blank");
        }

        set((s) => ({
          notifications: [
            { id: "N" + Date.now(), type: "WhatsApp", text: `${kind} sent to ${to}`, time: "just now", tone: "info" },
            ...s.notifications,
          ],
          audit: [{ ts: new Date().toLocaleString("en-IN"), user: "System", action: "Sent WhatsApp", target: `${kind} → ${to}` }, ...s.audit],
        }));
      },

      markAllNotificationsRead: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
      markNotificationRead: (id) => set((s) => ({ notifications: s.notifications.map((n) => n.id === id ? { ...n, read: true } : n) })),
      pushNotification: (n) => set((s) => ({ notifications: [{ id: "N" + Date.now(), time: "just now", ...n }, ...s.notifications] })),
      pushAudit: (e) => set((s) => ({ audit: [{ ts: new Date().toLocaleString("en-IN"), ...e }, ...s.audit] })),

      resetSeed: () => {
        // 1. Reset local state to empty (NOT seed data)
        set({
          customers: [], loans: [], collections: [],
          payments: [], expenses: [], investments: [],
          notifications: [], audit: [], documents: [],
        });
        // 2. Also clear Google Sheets — write empty arrays to all Finance sheets
        const { sheetsConfig } = get();
        if (sheetsConfig.enabled && sheetsConfig.url) {
          Promise.all([
            writeSheet(sheetsConfig.url, "Finance_Customers", []),
            writeSheet(sheetsConfig.url, "Finance_Payments", []),
            writeSheet(sheetsConfig.url, "Finance_Expenses", []),
            writeSheet(sheetsConfig.url, "Finance_Investments", []),
          ]).catch(() => {/* silent — best effort */});
        }
      },

      recheckStatuses: () => set((s) => ({
        customers: recalculateStatuses(s.customers)
      })),

      updateSheetsConfig: (cfg) => set((s) => ({ sheetsConfig: { ...s.sheetsConfig, ...cfg } })),

      syncToSheets: async () => {
        const { sheetsConfig, customers, payments, expenses, investments, staff } = get();
        if (!sheetsConfig.enabled || !sheetsConfig.url) {
          return { ok: false, error: "Google Sheets sync is not configured or disabled." };
        }
        try {
          await writeSheet(sheetsConfig.url, "Finance_Customers", customers.map((c) => ({
            id: c.id, billDate: c.billDate || "",
            firstName: c.firstName || "", fatherName: c.fatherName || "", surname: c.surname || "",
            name: c.name, mobile: c.mobile, aadhaar: c.aadhaar || "",
            guarantyName: c.guarantyName || "", guarantyMobile: c.guarantyMobile || "",
            region: c.region || "", village: c.village || "",
            mobileBrand: c.mobileBrand || "", mobileModel: c.mobileModel || "", ramRom: c.ramRom || "",
            imei1: c.imei1 || "", imei2: c.imei2 || "",
            price: c.price, fileCharge: c.fileCharge, deposit: c.deposit,
            balanceForEmi: c.balanceForEmi, interestRate: c.interestRate,
            interestPerMonth: c.interestPerMonth, noOfEmi: c.noOfEmi,
            totalInterest: c.totalInterest, totalEmiAmount: c.totalEmiAmount,
            perMonthEmi: c.perMonthEmi, emiDate: c.emiDate || "",
            paidEmis: c.paidEmis, pendingEmis: c.pendingEmis,
            pendingAmount: c.pendingAmount,
            lastPaymentDate: c.lastPaymentDate || "—",
            lastPaymentAmt: c.lastPaymentAmt,
            status: c.status, missedEmis: c.missedEmis ?? 0,
            loan: c.loan || "", emi: c.emi || "", due: c.due || "",
          })));
          await writeSheet(sheetsConfig.url, "Finance_Payments", payments.map((p) => ({
            id: p.id, customer: p.customer, customerId: p.customerId || "",
            amount: p.amount, method: p.method,
            date: p.date, collector: p.collector, remarks: p.remarks || "",
            pending: p.pending || "", status: p.status || "Success",
          })));
          await writeSheet(sheetsConfig.url, "Finance_Expenses", expenses.map((e) => ({
            id: e.id, date: e.date, cat: e.cat, desc: e.desc,
            amount: e.amount, type: e.type ?? "Expense", method: e.method ?? "Cash",
          })));
          await writeSheet(sheetsConfig.url, "Finance_Investments", investments.map((inv) => ({
            id: inv.id, investor: inv.investor, amount: inv.amount,
            roi: inv.roi, maturity: inv.maturity, status: inv.status,
            date: inv.date ?? "", method: inv.method ?? "Cash",
          })));
          await writeSheet(sheetsConfig.url, "Finance_Staff", staff.map((s) => ({
            id: s.id, name: s.name, email: s.email, role: s.role,
            status: s.status, access: s.access || "Both", password: s.password || "",
          })));
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
          const [custRows, payRows, expRows, invRows, staffRows] = await Promise.all([
            readSheet(sheetsConfig.url, "Finance_Customers"),
            readSheet(sheetsConfig.url, "Finance_Payments"),
            readSheet(sheetsConfig.url, "Finance_Expenses"),
            readSheet(sheetsConfig.url, "Finance_Investments"),
            readSheet(sheetsConfig.url, "Finance_Staff"),
          ]);
          // Customers: parse all numeric fields (always update state, even if empty array)
          const sanitizedCust = custRows.map((r: any) => ({
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
          set({ customers: sanitizedCust as unknown as Customer[] });

          // Payments: ensure customerId and status are present
          const sanitizedPay = payRows.map((r: any) => ({
            ...r,
            customerId: String(r.customerId || ""),
            status: (r.status || "Success") as "Success" | "Refunded",
          }));
          set({ payments: sanitizedPay as unknown as Payment[] });

          set({ expenses: expRows as unknown as Expense[] });
          set({ investments: invRows as unknown as Investment[] });

          if (staffRows.length > 0) {
            const mappedStaff = staffRows.map((r: any) => ({
              id: String(r.id || ""),
              name: String(r.name || ""),
              email: String(r.email || ""),
              role: String(r.role || "Staff"),
              status: (r.status || "Active") as "Active" | "Inactive",
              access: (r.access || "Both") as "Finance" | "Mobiles" | "Both",
              password: String(r.password || ""),
            }));
            set({ staff: mappedStaff });
          }
          const ts = nowTimestamp();
          set((s) => ({ sheetsConfig: { ...s.sheetsConfig, lastSync: ts } }));
          return { ok: true };
        } catch (err: any) {
          return { ok: false, error: err?.message || String(err) };
        }
      },
    }),
    {
      name: "jain-finance-erp-v4",
      merge: (persistedState: any, currentState) => {
        const merged = { ...currentState, ...(persistedState || {}) };
        merged.customers = Array.isArray(merged.customers) ? merged.customers : seedCustomers;
        merged.loans = Array.isArray(merged.loans) ? merged.loans : seedLoans;
        merged.collections = Array.isArray(merged.collections) ? merged.collections : seedCollections;
        merged.payments = Array.isArray(merged.payments) ? merged.payments : seedPayments;
        merged.expenses = Array.isArray(merged.expenses) ? merged.expenses : seedExpenses;
        merged.investments = Array.isArray(merged.investments) ? merged.investments : seedInvestments;
        merged.notifications = Array.isArray(merged.notifications) ? merged.notifications : seedNotifications;
        merged.audit = Array.isArray(merged.audit) && merged.audit.length > 0 ? merged.audit : seedAudit;
        merged.documents = Array.isArray(merged.documents) ? merged.documents : [];
        merged.staff = Array.isArray(merged.staff) ? merged.staff : seedStaff;
        // Always force the permanent URL — override any empty/stale persisted URL
        merged.sheetsConfig = {
          ...merged.sheetsConfig,
          url: PERMANENT_SHEETS_URL,
          enabled: true,
        };
        return merged;
      }
    }
  )
);

// ── Auto-push to Sheets on every Finance data mutation ──────────────────────
// Debounced: waits 3s after last change, then syncs in background.
// This means every add/edit/delete automatically syncs without manual button click.
let _financeAutoSyncTimer: ReturnType<typeof setTimeout> | null = null;
let _lastFinCustomers = useStore.getState().customers;
let _lastFinPayments = useStore.getState().payments;
let _lastFinExpenses = useStore.getState().expenses;
let _lastFinInvestments = useStore.getState().investments;
let _lastFinStaff = useStore.getState().staff;

useStore.subscribe((state) => {
  if (!state.sheetsConfig.enabled || !state.sheetsConfig.url) return;

  if (
    state.customers !== _lastFinCustomers ||
    state.payments !== _lastFinPayments ||
    state.expenses !== _lastFinExpenses ||
    state.investments !== _lastFinInvestments ||
    state.staff !== _lastFinStaff
  ) {
    _lastFinCustomers = state.customers;
    _lastFinPayments = state.payments;
    _lastFinExpenses = state.expenses;
    _lastFinInvestments = state.investments;
    _lastFinStaff = state.staff;

    if (_financeAutoSyncTimer) clearTimeout(_financeAutoSyncTimer);
    _financeAutoSyncTimer = setTimeout(() => {
      useStore.getState().syncToSheets().catch(() => {/* silent */});
    }, 3000);
  }
});


export function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) {
    triggerDownload(filename, new Blob(["\ufeff"], { type: "text/csv;charset=utf-8" }));
    return;
  }
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => { const s = v == null ? "" : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
  triggerDownload(filename, new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" }));
}

// ---- Premium Excel export (HTML table format) ----
// ---- Premium Excel export (xlsx-js-style binary format) ----
export function downloadExcel(filename: string, reportName: string, rows: Record<string, any>[] | any[]) {
  const cleanFilename = filename.replace(/\.(xls|csv)$/i, "") + ".xlsx";
  const wb = XLSX.utils.book_new();

  let ws: any;
  if (!rows.length) {
    ws = XLSX.utils.aoa_to_sheet([["No data available"]]);
  } else {
    const headers = Object.keys(rows[0]);
    const data = [
      headers,
      ...rows.map((row) => headers.map((h) => row[h] !== undefined && row[h] !== null ? String(row[h]) : ""))
    ];
    ws = XLSX.utils.aoa_to_sheet(data);

    // Apply header style: Bold, light gray background, bottom border
    headers.forEach((_, idx) => {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: idx });
      if (ws[cellRef]) {
        ws[cellRef].s = {
          font: { bold: true, name: "Segoe UI", sz: 11 },
          fill: { fgColor: { rgb: "F1F5F9" } },
          border: { bottom: { style: "thin", color: { rgb: "CBD5E1" } } }
        };
      }
    });

    // Auto-fit column widths based on maximum text length
    const colWidths = headers.map((h) => {
      let maxLen = h.length;
      rows.forEach((row) => {
        const val = row[h] !== undefined && row[h] !== null ? String(row[h]) : "";
        if (val.length > maxLen) {
          maxLen = val.length;
        }
      });
      return { wch: Math.min(Math.max(maxLen + 3, 12), 45) };
    });
    ws["!cols"] = colWidths;
  }

  XLSX.utils.book_append_sheet(wb, ws, reportName.replace(/[\\*?:/[\]]/g, "").substring(0, 31) || "Sheet1");

  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "binary" });
  const s2ab = (s: string) => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  };

  const blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });
  triggerDownload(cleanFilename, blob);
}

// ---- Premium Customer Statement Excel export ----
export function downloadCustomerStatementExcel(filename: string, c: Customer, custPayments: Payment[]) {
  const cleanFilename = filename.replace(/\.(xls|csv)$/i, "") + ".xlsx";
  const wb = XLSX.utils.book_new();
  const ws: Record<string, any> = {};

  const setCell = (r: number, col: number, val: any, style: any = {}) => {
    const ref = XLSX.utils.encode_cell({ r, c: col });
    ws[ref] = {
      t: typeof val === "number" ? "n" : "s",
      v: val,
      s: {
        font: { name: "Segoe UI", sz: 11, ...style.font },
        fill: style.fill,
        alignment: style.alignment,
        border: style.border
      }
    };
  };

  const titleStyle = { font: { bold: true, sz: 14 } };
  const sectionHeaderStyle = {
    font: { bold: true, sz: 12 },
    fill: { fgColor: { rgb: "F1F5F9" } },
    border: { bottom: { style: "thin", color: { rgb: "CBD5E1" } } }
  };
  const tableHeaderStyle = {
    font: { bold: true, sz: 11 },
    fill: { fgColor: { rgb: "E2E8F0" } },
    border: {
      top: { style: "thin", color: { rgb: "CBD5E1" } },
      bottom: { style: "medium", color: { rgb: "94A3B8" } },
      left: { style: "thin", color: { rgb: "CBD5E1" } },
      right: { style: "thin", color: { rgb: "CBD5E1" } }
    }
  };
  const labelStyle = { font: { bold: true, color: { rgb: "475569" } } };
  const valueStyle = { font: { name: "Segoe UI" } };
  const tableDataStyle = {
    border: {
      bottom: { style: "thin", color: { rgb: "E2E8F0" } },
      left: { style: "thin", color: { rgb: "E2E8F0" } },
      right: { style: "thin", color: { rgb: "E2E8F0" } }
    }
  };

  const safeFormatInr = (val: any) => {
    if (val === undefined || val === null || val === "") return "—";
    const num = typeof val === "number" ? val : Number(String(val).replace(/[^\d.-]/g, ""));
    return isNaN(num) ? String(val) : `₹${num.toLocaleString("en-IN")}`;
  };

  // Row 0: Title
  setCell(0, 0, "CUSTOMER ACCOUNT LEDGER STATEMENT", titleStyle);
  
  // Row 1: Date
  setCell(1, 0, "Statement Date:", labelStyle);
  setCell(1, 1, `${new Date().toLocaleDateString("en-IN")} ${new Date().toLocaleTimeString("en-IN")}`, valueStyle);
  
  // Row 3: Section 1
  setCell(3, 0, "CUSTOMER PROFILE", sectionHeaderStyle);
  
  // Row 4: Profile Details
  setCell(4, 0, "Customer ID", labelStyle);
  setCell(4, 1, c.id, valueStyle);
  setCell(4, 2, "Full Name", labelStyle);
  setCell(4, 3, c.name, valueStyle);
  
  // Row 5
  setCell(5, 0, "Mobile No", labelStyle);
  setCell(5, 1, c.mobile, valueStyle);
  setCell(5, 2, "Aadhaar Card", labelStyle);
  setCell(5, 3, c.aadhaar || "—", valueStyle);
  
  // Row 6
  setCell(6, 0, "Village", labelStyle);
  setCell(6, 1, c.village || "—", valueStyle);
  setCell(6, 2, "Guarantor", labelStyle);
  setCell(6, 3, `${c.guarantyName || "—"} (${c.guarantyMobile || "—"})`, valueStyle);

  // Row 8: Section 2
  setCell(8, 0, "DEVICE & FINANCE INFO", sectionHeaderStyle);

  // Row 9
  setCell(9, 0, "Device", labelStyle);
  setCell(9, 1, `${c.mobileBrand} ${c.mobileModel}`, valueStyle);
  setCell(9, 2, "IMEI 1 / 2", labelStyle);
  setCell(9, 3, `${c.imei1 || "—"} / ${c.imei2 || "—"}`, valueStyle);

  // Row 10
  setCell(10, 0, "Selling Price", labelStyle);
  setCell(10, 1, safeFormatInr(c.price), valueStyle);
  setCell(10, 2, "Down Payment", labelStyle);
  setCell(10, 3, safeFormatInr(c.deposit), valueStyle);

  // Row 11
  setCell(11, 0, "Monthly EMI", labelStyle);
  setCell(11, 1, safeFormatInr(c.perMonthEmi), valueStyle);
  setCell(11, 2, "Total Interest", labelStyle);
  setCell(11, 3, safeFormatInr(c.totalInterest), valueStyle);

  // Row 12
  setCell(12, 0, "EMIs Progress", labelStyle);
  setCell(12, 1, `${c.paidEmis} / ${c.noOfEmi} paid`, valueStyle);
  setCell(12, 2, "Status", labelStyle);
  setCell(12, 3, c.status, valueStyle);

  // Row 13
  setCell(13, 0, "Pending Balance", labelStyle);
  setCell(13, 1, safeFormatInr(c.pendingAmount), valueStyle);
  setCell(13, 2, "Next EMI Date", labelStyle);
  setCell(13, 3, c.emiDate || "—", valueStyle);

  // Row 15: Section 3
  setCell(15, 0, "TRANSACTION LEDGER", sectionHeaderStyle);

  // Row 16: Table Headers
  const tableHeaders = ["Txn ID", "Date", "Payment Mode", "Amount Paid"];
  tableHeaders.forEach((h, idx) => {
    setCell(16, idx, h, tableHeaderStyle);
  });

  // Rows 17+: Table Data
  let currentRow = 17;
  if (custPayments.length === 0) {
    setCell(currentRow, 0, "No payments recorded yet.", valueStyle);
    currentRow++;
  } else {
    custPayments.forEach((p) => {
      setCell(currentRow, 0, p.id, tableDataStyle);
      setCell(currentRow, 1, p.date, tableDataStyle);
      setCell(currentRow, 2, p.method, tableDataStyle);
      setCell(currentRow, 3, p.amount, {
        ...tableDataStyle,
        alignment: { horizontal: "right" }
      });
      currentRow++;
    });
  }

  // Merge headers for sections
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }, // Title
    { s: { r: 3, c: 0 }, e: { r: 3, c: 3 } }, // Section 1
    { s: { r: 8, c: 0 }, e: { r: 8, c: 3 } }, // Section 2
    { s: { r: 15, c: 0 }, e: { r: 15, c: 3 } } // Section 3
  ];

  // If no payments, merge that row too
  if (custPayments.length === 0) {
    ws["!merges"].push({ s: { r: 17, c: 0 }, e: { r: 17, c: 3 } });
  }

  // Ref range
  const maxCell = XLSX.utils.encode_cell({ r: currentRow - 1, c: 3 });
  ws["!ref"] = `A1:${maxCell}`;

  // Column widths
  ws["!cols"] = [
    { wch: 18 }, // Col A
    { wch: 25 }, // Col B
    { wch: 18 }, // Col C
    { wch: 25 }  // Col D
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Statement");

  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "binary" });
  const s2ab = (s: string) => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  };

  const blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });
  triggerDownload(cleanFilename, blob);
}

function triggerDownload(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

// ---- Shared Date Utilities ----
export function parseAppDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr || typeof dateStr !== "string") return null;
  const cleaned = dateStr.trim();
  if (!cleaned) return null;
  
  // Format: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
    const d = new Date(cleaned);
    return isNaN(d.getTime()) ? null : d;
  }
  
  // Format: DD MMM YYYY (e.g. "18 Jun 2026")
  const parts = cleaned.split(/\s+/);
  if (parts.length === 3 && parts[1]) {
    const day = parseInt(parts[0], 10);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthIdx = months.findIndex(m => m.toLowerCase() === parts[1].toLowerCase().substring(0, 3));
    const year = parseInt(parts[2], 10);
    if (!isNaN(day) && monthIdx !== -1 && !isNaN(year)) {
      return new Date(year, monthIdx, day);
    }
  }

  // Format: DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = cleaned.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    return new Date(year, month, day);
  }
  
  const parsed = new Date(cleaned);
  return isNaN(parsed.getTime()) ? null : parsed;
}

export function isDateInRange(date: Date | null, start: Date | null, end: Date | null): boolean {
  if (!date) return false;
  const dTime = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  
  if (start) {
    const sTime = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
    if (dTime < sTime) return false;
  }
  
  if (end) {
    const eTime = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
    if (dTime > eTime) return false;
  }
  
  return true;
}

export function retreatEmiDate(dateStr: string): string {
  if (!dateStr) return "";
  
  // Check if YYYY-MM-DD
  const ymdMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (ymdMatch) {
    const y = parseInt(ymdMatch[1], 10);
    const m = parseInt(ymdMatch[2], 10) - 1; // 0-indexed
    const d = parseInt(ymdMatch[3], 10);
    const date = new Date(y, m - 1, d); // subtract 1 month
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Check if DD MMM YYYY (e.g., "19 Jun 2026")
  const dmyMatch = dateStr.match(/^(\d{2})\s+([a-zA-Z]{3})\s+(\d{4})$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const monthAbbrs = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthIdx = monthAbbrs.indexOf(dmyMatch[2]);
    const year = parseInt(dmyMatch[3], 10);
    if (monthIdx !== -1) {
      const date = new Date(year, monthIdx - 1, day); // subtract 1 month
      const nextDay = String(date.getDate()).padStart(2, '0');
      const nextMonth = monthAbbrs[date.getMonth()];
      const nextYear = date.getFullYear();
      return `${nextDay} ${nextMonth} ${nextYear}`;
    }
  }

  return dateStr;
}

export function getOriginalEmiStartDate(emiDateStr: string, paidEmis: number): string {
  let date = emiDateStr;
  for (let i = 0; i < paidEmis; i++) {
    date = retreatEmiDate(date);
  }
  return date;
}

export function getMissedEmisCount(emiDateStr: string, paidEmis: number, noOfEmi: number): number {
  const originalStart = getOriginalEmiStartDate(emiDateStr, paidEmis);
  const today = new Date();
  const todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  let emisExpected = 0;
  let currentDueDate = originalStart;
  
  for (let i = 0; i < noOfEmi; i++) {
    const parsedDue = parseAppDate(currentDueDate);
    if (parsedDue) {
      const dueZero = new Date(parsedDue.getFullYear(), parsedDue.getMonth(), parsedDue.getDate());
      if (dueZero <= todayZero) {
        emisExpected++;
      } else {
        break;
      }
    }
    currentDueDate = advanceEmiDate(currentDueDate);
  }
  
  return Math.max(0, emisExpected - paidEmis);
}

export function recalculateStatuses(customers: Customer[]): Customer[] {
  return customers.map((c) => {
    if (c.pendingEmis === 0) {
      return { ...c, status: "Closed" as const, missedEmis: 0 };
    }
    
    const missed = getMissedEmisCount(c.emiDate, c.paidEmis, c.noOfEmi);
    let status = c.status;
    if (missed === 0) {
      status = "Active" as const;
    } else if (missed === 1 || missed === 2) {
      status = "Overdue" as const;
    } else if (missed >= 3) {
      status = "Defaulted" as const;
    }
    
    return { ...c, status, missedEmis: missed };
  });
}

// Re-export mock data
export { collectionTrend, revenueTrend, villagePerf, upcoming, roles } from "./mock-data";
