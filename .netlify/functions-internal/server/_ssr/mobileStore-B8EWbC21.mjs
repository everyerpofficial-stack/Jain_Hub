import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
import { a as Portal, i as Overlay, n as Content, o as Root, r as Description, s as Title, t as Close } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { t as X } from "../_libs/lucide-react.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { t as require_xlsx_min } from "../_libs/xlsx-js-style.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/mobileStore-B8EWbC21.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_xlsx_min = /* @__PURE__ */ __toESM(require_xlsx_min());
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var Dialog = Root;
var DialogPortal = Portal;
var DialogOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overlay, {
	ref,
	className: cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props
}));
DialogOverlay.displayName = Overlay.displayName;
var DialogContent = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Content, {
	ref,
	className: cn("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Close, {
		className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Close"
		})]
	})]
})] }));
DialogContent.displayName = Content.displayName;
var DialogHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col space-y-1.5 text-center sm:text-left", className),
	...props
});
DialogHeader.displayName = "DialogHeader";
var DialogFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
DialogFooter.displayName = "DialogFooter";
var DialogTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Title, {
	ref,
	className: cn("text-lg font-semibold leading-none tracking-tight", className),
	...props
}));
DialogTitle.displayName = Title.displayName;
var DialogDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Description, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
DialogDescription.displayName = Description.displayName;
/** Max bytes per GET request chunk (URL limit safety) */
var CHUNK_BYTES = 4e4;
/**
* Safely base64-encode a string (works in all browsers)
*/
function b64Encode(str) {
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
async function getFromScript(url, params) {
	const fetchUrl = `${url}?${Object.entries(params).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&")}`;
	const response = await fetch(fetchUrl, {
		method: "GET",
		redirect: "follow"
	});
	if (!response.ok) throw new Error(`Sheets request failed: HTTP ${response.status}`);
	const result = await response.json();
	if (result.status !== "ok") throw new Error(result.error || "Unknown Apps Script error");
	return result;
}
/**
* Write rows to a sheet in chunks to stay within URL length limits.
* Each chunk sends a batch of rows encoded as base64 JSON.
*/
async function writeChunked(url, action, sheet, rows) {
	if (rows.length === 0) return;
	const chunks = [];
	let current = [];
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
	for (let i = 0; i < chunks.length; i++) await getFromScript(url, {
		action: i === 0 ? action : "append",
		sheet,
		payload: b64Encode(JSON.stringify(chunks[i]))
	});
}
/**
* GET all rows from a specific sheet tab.
* Returns an array of row objects keyed by column headers (first row).
*/
async function readSheet(url, sheet) {
	return (await getFromScript(url, {
		action: "read",
		sheet
	})).rows ?? [];
}
/**
* Overwrite an entire sheet with the given rows array.
* Used for full-sync operations (Settings > "Sync Now").
*/
async function writeSheet(url, sheet, rows) {
	if (rows.length === 0) return;
	await writeChunked(url, "write", sheet, rows);
}
/**
* Ping the Apps Script to verify it's reachable and correctly deployed.
* Returns { ok: true } on success.
*/
async function pingScript(url) {
	try {
		await getFromScript(url, { action: "ping" });
		return { ok: true };
	} catch (err) {
		return {
			ok: false,
			error: err?.message || String(err)
		};
	}
}
/**
* Get row counts for all sheets in a single call.
* Used by the polling engine to detect if anything changed without pulling full data.
*/
async function digestSheets(url) {
	try {
		return (await getFromScript(url, { action: "digest" })).digest ?? null;
	} catch {
		return null;
	}
}
/** Helper — get today's datetime string for lastSync timestamps */
function nowTimestamp() {
	return (/* @__PURE__ */ new Date()).toLocaleString("en-IN", {
		day: "2-digit",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit"
	});
}
var MOBILE_BRANDS = {
	Apple: [
		"Apple1",
		"Apple2",
		"Apple3",
		"Apple4",
		"Apple5",
		"Apple6"
	],
	Samsung: [
		"Samsung1",
		"Samsung2",
		"Samsung3",
		"Samsung4",
		"Samsung5",
		"Samsung6"
	],
	Xiaomi: [
		"Xiaomi1",
		"Xiaomi2",
		"Xiaomi3",
		"Xiaomi4",
		"Xiaomi5",
		"Xiaomi6",
		"Xiaomi7",
		"Xiaomi8",
		"Xiaomi9",
		"Xiaomi10",
		"Xiaomi11",
		"Xiaomi12",
		"Xiaomi13",
		"Xiaomi14"
	],
	Oppo: [
		"Oppo1",
		"Oppo2",
		"Oppo3",
		"Oppo4",
		"Oppo5",
		"Oppo6",
		"Oppo7",
		"Oppo8",
		"Oppo9",
		"Oppo10",
		"Oppo11",
		"Oppo12",
		"Oppo13",
		"Oppo14"
	],
	Vivo: [
		"Vivo1",
		"Vivo2",
		"Vivo3",
		"Vivo4",
		"Vivo5",
		"Vivo6",
		"Vivo7",
		"Vivo8",
		"Vivo9",
		"Vivo10",
		"Vivo11",
		"Vivo12",
		"Vivo13",
		"Vivo14"
	],
	OnePlus: [
		"OnePlus1",
		"OnePlus2",
		"OnePlus3",
		"OnePlus4",
		"OnePlus5",
		"OnePlus6",
		"OnePlus7",
		"OnePlus8",
		"OnePlus9",
		"OnePlus10",
		"OnePlus11",
		"OnePlus12",
		"OnePlus13",
		"OnePlus14"
	],
	Realme: [
		"Realme1",
		"Realme2",
		"Realme3",
		"Realme4",
		"Realme5",
		"Realme6",
		"Realme7",
		"Realme8",
		"Realme9",
		"Realme10",
		"Realme11",
		"Realme12",
		"Realme13",
		"Realme14"
	],
	Nokia: [
		"Nokia1",
		"Nokia2",
		"Nokia3",
		"Nokia4",
		"Nokia5",
		"Nokia6",
		"Nokia7",
		"Nokia8",
		"Nokia9",
		"Nokia10",
		"Nokia11",
		"Nokia12",
		"Nokia13",
		"Nokia14"
	],
	Sony: [
		"Sony1",
		"Sony2",
		"Sony3",
		"Sony4",
		"Sony5",
		"Sony6",
		"Sony7",
		"Sony8",
		"Sony9",
		"Sony10",
		"Sony11",
		"Sony12",
		"Sony13",
		"Sony14"
	],
	Huawei: [
		"Huawei1",
		"Huawei2",
		"Huawei3",
		"Huawei4",
		"Huawei5",
		"Huawei6",
		"Huawei7",
		"Huawei8",
		"Huawei9",
		"Huawei10",
		"Huawei11",
		"Huawei12",
		"Huawei13",
		"Huawei14"
	],
	Micromax: [
		"Micromax1",
		"Micromax2",
		"Micromax3",
		"Micromax4",
		"Micromax5",
		"Micromax6",
		"Micromax7",
		"Micromax8",
		"Micromax9",
		"Micromax10",
		"Micromax11",
		"Micromax12",
		"Micromax13",
		"Micromax14"
	],
	Lava: [
		"Lava1",
		"Lava2",
		"Lava3",
		"Lava4",
		"Lava5",
		"Lava6",
		"Lava7",
		"Lava8",
		"Lava9",
		"Lava10",
		"Lava11",
		"Lava12",
		"Lava13",
		"Lava14"
	],
	"Reliance Jio": [
		"Reliance Jio1",
		"Reliance Jio2",
		"Reliance Jio3",
		"Reliance Jio4",
		"Reliance Jio5",
		"Reliance Jio6",
		"Reliance Jio7",
		"Reliance Jio8",
		"Reliance Jio9",
		"Reliance Jio10",
		"Reliance Jio11",
		"Reliance Jio12",
		"Reliance Jio13",
		"Reliance Jio14"
	]
};
var RAM_ROM_OPTIONS = [
	"4GB/64GB",
	"4GB/128GB",
	"6GB/128GB",
	"6GB/256GB",
	"8GB/128GB",
	"8GB/256GB"
];
var INTEREST_OPTIONS = [
	"1",
	"2",
	"3",
	"4",
	"5"
];
var EMI_COUNT_OPTIONS = Array.from({ length: 24 }, (_, i) => String(i + 1));
var REGIONS = [
	"Baserkund",
	"Saikheda",
	"Rasva",
	"Tamrani",
	"Bamonali",
	"Balakwada",
	"Jaipur"
];
var VILLAGES_BY_REGION = {
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
		"Dharmpuri"
	],
	Saikheda: [
		"Rampura",
		"Tirnga",
		"Dakhopur",
		"Naydad",
		"Besavad",
		"Hirapura"
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
		"Khurumpura"
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
		"Kundhadiya"
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
		"Sangwal"
	],
	Balakwada: [
		"Bhopalpura",
		"Silohiy",
		"Jhagdi",
		"Dasnaval",
		"Pipalvadi",
		"Kalikaray",
		"Damkheda",
		"Sauli"
	],
	Jaipur: ["Jaipur"]
};
Object.values(VILLAGES_BY_REGION).flat();
var today = () => (/* @__PURE__ */ new Date()).toLocaleDateString("en-IN", {
	day: "2-digit",
	month: "short",
	year: "numeric"
});
var fmtInr = (n) => "₹" + Math.round(n).toLocaleString("en-IN");
function calcEmi(price, deposit, interestRate, noOfEmi, customFileCharge) {
	const fileCharge = customFileCharge !== void 0 && !isNaN(customFileCharge) ? customFileCharge : Math.round(price * .1);
	const balance = price - deposit;
	const interestPerMonth = Math.round(balance * interestRate / 100);
	const totalInterest = interestPerMonth * noOfEmi;
	const totalEmiAmount = balance + totalInterest + fileCharge;
	return {
		fileCharge,
		balance,
		interestPerMonth,
		totalInterest,
		totalEmiAmount,
		perMonthEmi: noOfEmi > 0 ? Math.round(totalEmiAmount / noOfEmi) : 0
	};
}
function calculateEmi(principal, annualRatePct, months) {
	if (!principal || !months) return 0;
	if (!annualRatePct) return principal / months;
	const r = annualRatePct / 12 / 100;
	return principal * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1);
}
function advanceEmiDate(dateStr) {
	if (!dateStr) return "";
	const ymdMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
	if (ymdMatch) {
		const y = parseInt(ymdMatch[1], 10);
		const m = parseInt(ymdMatch[2], 10) - 1;
		const d = parseInt(ymdMatch[3], 10);
		const date = new Date(y, m + 1, d);
		return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
	}
	const dmyMatch = dateStr.match(/^(\d{2})\s+([a-zA-Z]{3})\s+(\d{4})$/);
	if (dmyMatch) {
		const day = parseInt(dmyMatch[1], 10);
		const monthAbbrs = [
			"Jan",
			"Feb",
			"Mar",
			"Apr",
			"May",
			"Jun",
			"Jul",
			"Aug",
			"Sep",
			"Oct",
			"Nov",
			"Dec"
		];
		const monthIdx = monthAbbrs.indexOf(dmyMatch[2]);
		const year = parseInt(dmyMatch[3], 10);
		if (monthIdx !== -1) {
			const date = new Date(year, monthIdx + 1, day);
			return `${String(date.getDate()).padStart(2, "0")} ${monthAbbrs[date.getMonth()]} ${date.getFullYear()}`;
		}
	}
	return dateStr;
}
function formatDateToInr(ymd) {
	if (!ymd) return "";
	const parts = ymd.split("-");
	if (parts.length !== 3) return ymd;
	const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
	if (isNaN(dateObj.getTime())) return ymd;
	return dateObj.toLocaleDateString("en-IN", {
		day: "2-digit",
		month: "short",
		year: "numeric"
	});
}
var seedCustomers = [];
var seedLoans = [];
var seedCollections = [];
var seedPayments = [];
var seedExpenses = [];
var seedInvestments = [];
var seedNotifications = [];
var seedAudit = [];
var seedStaff = [
	{
		id: "ST-001",
		name: "Avinash G",
		email: "g.avinash10005@gmail.com",
		role: "Admin",
		status: "Active",
		access: "Both",
		password: "Avinash@123"
	},
	{
		id: "ST-002",
		name: "Rajesh Jain",
		email: "rajesh@jainfinance.com",
		role: "Admin",
		status: "Active",
		access: "Both"
	},
	{
		id: "ST-003",
		name: "Sunil Verma",
		email: "sunil@jainfinance.com",
		role: "Staff",
		status: "Active",
		access: "Finance"
	},
	{
		id: "ST-004",
		name: "Ramesh Shah",
		email: "ramesh@jainfinance.com",
		role: "Staff",
		status: "Active",
		access: "Mobiles"
	}
];
var PERMANENT_SHEETS_URL$1 = "https://script.google.com/macros/s/AKfycbwWVkQNCNKEhICOxfWZasNAeUbJBQTB2gXaTtFk2QzCSt1r2ZhwsuZgTNYGJy_1I1ek/exec";
var useStore = create()(persist((set, get) => ({
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
	currentUser: null,
	sheetsConfig: {
		url: PERMANENT_SHEETS_URL$1,
		enabled: true,
		lastSync: void 0
	},
	toggleDarkMode: () => {
		const next = !get().darkMode;
		set({ darkMode: next });
		if (next) document.documentElement.classList.add("dark");
		else document.documentElement.classList.remove("dark");
	},
	login: (email) => {
		const found = get().staff.find((s) => s.email.toLowerCase() === email.trim().toLowerCase() && s.status === "Active");
		if (found) {
			set({ currentUser: found });
			return true;
		}
		return false;
	},
	loginWithPassword: (email, password) => {
		const found = get().staff.find((s) => s.email.toLowerCase() === email.trim().toLowerCase() && s.status === "Active" && (s.password === password || s.email.toLowerCase() === "g.avinash10005@gmail.com" && password === "Avinash@123"));
		if (found) {
			set({ currentUser: found });
			return true;
		}
		return false;
	},
	logout: () => {
		set({ currentUser: null });
	},
	addStaff: (input) => {
		const id = "ST-" + (get().staff.reduce((max, s) => {
			const n = parseInt(s.id.replace("ST-", ""), 10);
			return isNaN(n) ? max : Math.max(max, n);
		}, 0) + 1).toString().padStart(3, "0");
		const newMember = {
			id,
			name: input.name,
			email: input.email,
			role: input.role,
			status: "Active",
			access: input.access || "Both",
			password: input.password || ""
		};
		set((s) => ({
			staff: [...s.staff, newMember],
			audit: [{
				ts: (/* @__PURE__ */ new Date()).toLocaleString("en-IN"),
				user: s.currentUser?.name || "System",
				action: "Added staff member",
				target: `${id} · ${input.name} (${input.role})`
			}, ...s.audit]
		}));
		return newMember;
	},
	deleteStaff: (id) => {
		const found = get().staff.find((s) => s.id === id);
		set((s) => ({
			staff: s.staff.filter((m) => m.id !== id),
			audit: [{
				ts: (/* @__PURE__ */ new Date()).toLocaleString("en-IN"),
				user: s.currentUser?.name || "System",
				action: "Deleted staff member",
				target: `${id} · ${found?.name || ""}`
			}, ...s.audit]
		}));
	},
	deleteCustomer: (id) => {
		const found = get().customers.find((c) => c.id === id);
		set((s) => ({
			customers: s.customers.filter((c) => c.id !== id),
			collections: s.collections.filter((col) => col.customerId !== id),
			payments: s.payments.filter((p) => p.customerId !== id),
			documents: s.documents.filter((doc) => doc.customerId !== id),
			audit: [{
				ts: (/* @__PURE__ */ new Date()).toLocaleString("en-IN"),
				user: s.currentUser?.name || "System",
				action: "Deleted customer",
				target: `${id} · ${found?.name || ""}`
			}, ...s.audit]
		}));
	},
	deleteLoan: (id) => {
		const found = get().loans.find((l) => l.id === id);
		set((s) => ({
			loans: s.loans.filter((l) => l.id !== id),
			audit: [{
				ts: (/* @__PURE__ */ new Date()).toLocaleString("en-IN"),
				user: s.currentUser?.name || "System",
				action: "Deleted loan",
				target: `${id} · ${found?.customer || ""}`
			}, ...s.audit]
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
				const revertEmiDate = (dStr) => {
					const match = dStr.match(/^(\d{2})\s+([a-zA-Z]{3})\s+(\d{4})$/);
					if (match) {
						const day = parseInt(match[1], 10);
						const months = [
							"Jan",
							"Feb",
							"Mar",
							"Apr",
							"May",
							"Jun",
							"Jul",
							"Aug",
							"Sep",
							"Oct",
							"Nov",
							"Dec"
						];
						const monthIdx = months.indexOf(match[2]);
						const year = parseInt(match[3], 10);
						if (monthIdx !== -1) {
							const d = new Date(year, monthIdx - 1, day);
							return `${String(d.getDate()).padStart(2, "0")} ${months[d.getMonth()]} ${d.getFullYear()}`;
						}
					}
					return dStr;
				};
				const prevEmiDate = revertEmiDate(cust.emiDate);
				const lastP = get().payments.filter((x) => x.id !== id && x.customerId === p.customerId && x.status === "Success")[0];
				set((s) => ({
					customers: recalculateStatuses(s.customers.map((c) => c.id === p.customerId ? {
						...c,
						paidEmis: newPaid,
						pendingEmis: newPending,
						pendingAmount: newPendingAmt,
						lastPaymentDate: lastP ? lastP.date : "—",
						lastPaymentAmt: lastP ? Number(lastP.amount.replace(/[^\d]/g, "")) : 0,
						status: newPending === 0 ? "Closed" : "Active",
						emiDate: prevEmiDate,
						due: prevEmiDate
					} : c)),
					collections: s.collections.map((col) => col.customerId === p.customerId ? {
						...col,
						state: lastP ? "Collected" : "Pending"
					} : col)
				}));
			}
		}
		set((s) => ({
			payments: s.payments.filter((x) => x.id !== id),
			audit: [{
				ts: (/* @__PURE__ */ new Date()).toLocaleString("en-IN"),
				user: s.currentUser?.name || "System",
				action: "Deleted payment entry",
				target: `${id} · Reversed payment of ${p.amount} from ${p.customer}`
			}, ...s.audit]
		}));
	},
	deleteExpense: (id) => {
		const found = get().expenses.find((e) => e.id === id);
		set((s) => ({
			expenses: s.expenses.filter((e) => e.id !== id),
			audit: [{
				ts: (/* @__PURE__ */ new Date()).toLocaleString("en-IN"),
				user: s.currentUser?.name || "System",
				action: "Deleted expense",
				target: `${id} · ${found?.cat || ""} (${found?.amount || ""})`
			}, ...s.audit]
		}));
	},
	deleteInvestment: (id) => {
		const found = get().investments.find((i) => i.id === id);
		set((s) => ({
			investments: s.investments.filter((i) => i.id !== id),
			audit: [{
				ts: (/* @__PURE__ */ new Date()).toLocaleString("en-IN"),
				user: s.currentUser?.name || "System",
				action: "Deleted investment",
				target: `${id} · ${found?.investor || ""} (${found?.amount || ""})`
			}, ...s.audit]
		}));
	},
	deleteDocument: (id) => {
		const found = get().documents.find((d) => d.id === id);
		set((s) => ({
			documents: s.documents.filter((d) => d.id !== id),
			audit: [{
				ts: (/* @__PURE__ */ new Date()).toLocaleString("en-IN"),
				user: s.currentUser?.name || "System",
				action: "Deleted document",
				target: `${id} · ${found?.fileName || ""}`
			}, ...s.audit]
		}));
	},
	addCustomer: (input) => {
		const { fileCharge, balance, interestPerMonth, totalInterest, totalEmiAmount, perMonthEmi } = calcEmi(input.price, input.deposit, input.interestRate, input.noOfEmi, input.fileCharge);
		const id = "JF-" + (get().customers.filter((c) => c.id.startsWith("JF-")).reduce((max, c) => {
			const n = parseInt(c.id.replace("JF-", ""), 10);
			return isNaN(n) ? max : Math.max(max, n);
		}, 0) + 1).toString().padStart(3, "0");
		const customer = {
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
			due: input.emiDate
		};
		const collection = {
			id: "C-" + (get().collections.length + 1).toString().padStart(3, "0"),
			name: customer.name,
			customerId: id,
			village: customer.village,
			amount: customer.emi,
			state: "Pending",
			collector: "Rajesh Jain",
			method: "—"
		};
		const newDocs = [];
		if (input.aadhaarFile) newDocs.push({
			id: `DOC-${Date.now()}-1`,
			customerId: id,
			customerName: customer.name,
			type: "Aadhaar Card",
			fileName: input.aadhaarFile.name,
			fileSize: input.aadhaarFile.size,
			date: today(),
			status: "Verified",
			fileUrl: input.aadhaarFile.url
		});
		if (input.photoFile) newDocs.push({
			id: `DOC-${Date.now()}-2`,
			customerId: id,
			customerName: customer.name,
			type: "Customer Photo",
			fileName: input.photoFile.name,
			fileSize: input.photoFile.size,
			date: today(),
			status: "Verified",
			fileUrl: input.photoFile.url
		});
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
                <p style="margin: 3px 0;"><strong>Name:</strong> ${customer.name}</p>
                <p style="margin: 3px 0;"><strong>Father's Name:</strong> ${input.fatherName}</p>
                <p style="margin: 3px 0;"><strong>Mobile:</strong> ${customer.mobile}</p>
                <p style="margin: 3px 0;"><strong>Aadhaar:</strong> ${customer.aadhaar || "—"}</p>
                <p style="margin: 3px 0;"><strong>Location:</strong> ${customer.village}, ${customer.region}</p>
              </div>
              <div style="background: #f8fafc; padding: 16px; border-radius: 8px;">
                <h3 style="margin: 0 0 10px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em;">Device & Guarantor Information</h3>
                <p style="margin: 3px 0;"><strong>Guarantor:</strong> ${input.guarantyName} (${input.guarantyMobile || "—"})</p>
                <p style="margin: 3px 0;"><strong>Brand & Model:</strong> ${customer.mobileBrand} ${customer.mobileModel} (${customer.ramRom})</p>
                <p style="margin: 3px 0;"><strong>IMEI 1:</strong> ${customer.imei1 || "—"}</p>
                <p style="margin: 3px 0;"><strong>IMEI 2:</strong> ${customer.imei2 || "—"}</p>
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
			fileUrl: `data:text/html;charset=utf-8,${encodeURIComponent(invoiceContent)}`
		});
		set((s) => ({
			customers: recalculateStatuses([customer, ...s.customers]),
			collections: [collection, ...s.collections],
			documents: [...newDocs, ...s.documents],
			notifications: [{
				id: "N" + Date.now(),
				type: "New Customer",
				text: `${customer.name} registered – ${input.mobileBrand} ${input.mobileModel}`,
				time: "just now",
				tone: "info"
			}, ...s.notifications],
			audit: [{
				ts: (/* @__PURE__ */ new Date()).toLocaleString("en-IN"),
				user: "Rajesh Jain",
				action: "Registered customer",
				target: `${id} ${customer.name} – ${input.mobileBrand} ${input.mobileModel}`
			}, ...s.audit]
		}));
		return customer;
	},
	updateCustomer: (id, input) => {
		const cust = get().customers.find((c) => c.id === id);
		if (!cust) return void 0;
		const { fileCharge, balance, interestPerMonth, totalInterest, totalEmiAmount, perMonthEmi } = calcEmi(input.price, input.deposit, input.interestRate, input.noOfEmi, input.fileCharge);
		const paidEmis = Math.min(cust.paidEmis, input.noOfEmi);
		const pendingEmis = input.noOfEmi - paidEmis;
		const pendingAmount = pendingEmis * perMonthEmi;
		const nextStatus = pendingEmis === 0 ? "Closed" : input.status;
		const updated = {
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
			due: input.emiDate
		};
		set((s) => ({
			customers: recalculateStatuses(s.customers.map((c) => c.id === id ? updated : c)),
			collections: s.collections.map((col) => col.customerId === id ? {
				...col,
				name: updated.name,
				village: updated.village,
				amount: updated.emi
			} : col),
			audit: [{
				ts: (/* @__PURE__ */ new Date()).toLocaleString("en-IN"),
				user: "Rajesh Jain",
				action: "Updated customer details",
				target: `${id} ${updated.name}`
			}, ...s.audit]
		}));
		return updated;
	},
	recordPayment: ({ customerId, amount, method, collector, remarks, date }) => {
		const cust = get().customers.find((c) => c.id === customerId);
		if (!cust) return;
		const txnId = "TXN-" + (get().payments.length + 1).toString().padStart(3, "0");
		const newPaidEmis = Math.min(cust.paidEmis + 1, cust.noOfEmi);
		const newPendingEmis = cust.noOfEmi - newPaidEmis;
		const newPendingAmount = newPendingEmis * cust.perMonthEmi;
		const newStatus = newPendingEmis === 0 ? "Closed" : cust.status;
		const pDate = date ? formatDateToInr(date) : today();
		const nextEmiDate = advanceEmiDate(cust.emiDate);
		set((s) => ({
			customers: recalculateStatuses(s.customers.map((c) => c.id === customerId ? {
				...c,
				paidEmis: newPaidEmis,
				pendingEmis: newPendingEmis,
				pendingAmount: newPendingAmount,
				lastPaymentDate: pDate,
				lastPaymentAmt: amount,
				status: newStatus,
				emiDate: nextEmiDate,
				due: nextEmiDate
			} : c)),
			collections: s.collections.map((c) => c.customerId === customerId ? {
				...c,
				state: "Collected",
				method
			} : c),
			payments: [{
				id: txnId,
				customer: cust.name,
				customerId,
				date: pDate,
				amount: fmtInr(amount),
				pending: fmtInr(newPendingAmount),
				collector,
				method,
				status: "Success",
				remarks
			}, ...s.payments],
			notifications: [{
				id: "N" + Date.now(),
				type: "Payment",
				text: `${fmtInr(amount)} received from ${cust.name}`,
				time: "just now",
				tone: "success"
			}, ...s.notifications],
			audit: [{
				ts: (/* @__PURE__ */ new Date()).toLocaleString("en-IN"),
				user: collector,
				action: "Recorded payment",
				target: `${txnId} · ${fmtInr(amount)} from ${cust.name}`
			}, ...s.audit]
		}));
	},
	addLoan: (input) => {
		const months = input.months || 12;
		const emi = calculateEmi(input.amount - input.deposit, input.interest, months);
		const loan = {
			id: "LN-" + (get().loans.filter((l) => l.id.startsWith("LN-")).reduce((max, l) => {
				const n = parseInt(l.id.replace("LN-", ""), 10);
				return isNaN(n) ? max : Math.max(max, n);
			}, 0) + 1).toString().padStart(3, "0"),
			customer: input.customer,
			product: input.product,
			amount: fmtInr(input.amount),
			deposit: fmtInr(input.deposit),
			emi: fmtInr(emi),
			duration: `${months} mo`,
			interest: `${input.interest}%`,
			status: "Active"
		};
		set((s) => ({ loans: [loan, ...s.loans] }));
		return loan;
	},
	collectEmi: ({ collectionId, method }) => {
		const c = get().collections.find((x) => x.id === collectionId);
		if (!c) return;
		const customerId = c.customerId;
		if (customerId) get().recordPayment({
			customerId,
			amount: Number(c.amount.replace(/[^\d]/g, "")),
			method: method === "—" ? "Cash" : method,
			collector: c.collector,
			remarks: "Collected from due list"
		});
	},
	receiveCustomPayment: ({ customer, amount, method, collector }) => {
		const txnId = "TXN-" + (get().payments.length + 1).toString().padStart(3, "0");
		set((s) => ({ payments: [{
			id: txnId,
			customer,
			customerId: "",
			date: today(),
			amount: fmtInr(amount),
			pending: "—",
			collector,
			method,
			status: "Success",
			remarks: ""
		}, ...s.payments] }));
	},
	addExpense: (input) => {
		const id = "EX-" + (get().expenses.filter((e) => e.id.startsWith("EX-")).reduce((max, e) => {
			const n = parseInt(e.id.replace("EX-", ""), 10);
			return isNaN(n) ? max : Math.max(max, n);
		}, 0) + 1).toString().padStart(3, "0");
		const expense = {
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
			audit: [{
				ts: (/* @__PURE__ */ new Date()).toLocaleString("en-IN"),
				user: "Rajesh Jain",
				action: `Added ${expense.type?.toLowerCase() || "expense"}`,
				target: `${id} · ${expense.amount}`
			}, ...s.audit]
		}));
		return expense;
	},
	addInvestment: (input) => {
		const id = "INV-" + (get().investments.filter((i) => i.id.startsWith("INV-")).reduce((max, i) => {
			const n = parseInt(i.id.replace("INV-", ""), 10);
			return isNaN(n) ? max : Math.max(max, n);
		}, 0) + 1).toString().padStart(3, "0");
		const investment = {
			id,
			investor: input.investor,
			amount: fmtInr(input.amount),
			roi: `${input.roi}%`,
			maturity: input.maturity,
			status: "Active",
			date: input.date ? formatDateToInr(input.date) : today(),
			method: input.method ?? "UPI"
		};
		set((s) => ({
			investments: [investment, ...s.investments],
			audit: [{
				ts: (/* @__PURE__ */ new Date()).toLocaleString("en-IN"),
				user: "Rajesh Jain",
				action: "Added investment",
				target: `${id} · ${investment.amount}`
			}, ...s.audit]
		}));
		return investment;
	},
	sendWhatsapp: ({ to, kind }) => {
		const cust = get().customers.find((c) => c.mobile === to);
		let msg = `Hello! This is a message from Jain Finance.`;
		if (cust) if (kind === "EMI Reminder" || kind === "EMI Due Reminder") msg = `Dear *${cust.name}*, this is a friendly reminder from *Jain Finance* regarding your EMI for *${cust.mobileBrand} ${cust.mobileModel}*. Your monthly instalment of *₹${cust.perMonthEmi.toLocaleString("en-IN")}* is due on *${cust.emiDate}*. Please keep the payment ready. Thank you!`;
		else msg = `Dear *${cust.name}*, this is a message from *Jain Finance* regarding your account status (*${cust.status}*). Please contact us for details. Thank you!`;
		if (typeof window !== "undefined") {
			let cleanPhone = to.replace(/[^\d]/g, "");
			if (cleanPhone.length === 10) cleanPhone = "91" + cleanPhone;
			const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`;
			window.open(url, "_blank");
		}
		set((s) => ({
			notifications: [{
				id: "N" + Date.now(),
				type: "WhatsApp",
				text: `${kind} sent to ${to}`,
				time: "just now",
				tone: "info"
			}, ...s.notifications],
			audit: [{
				ts: (/* @__PURE__ */ new Date()).toLocaleString("en-IN"),
				user: "System",
				action: "Sent WhatsApp",
				target: `${kind} → ${to}`
			}, ...s.audit]
		}));
	},
	markAllNotificationsRead: () => set((s) => ({ notifications: s.notifications.map((n) => ({
		...n,
		read: true
	})) })),
	markNotificationRead: (id) => set((s) => ({ notifications: s.notifications.map((n) => n.id === id ? {
		...n,
		read: true
	} : n) })),
	pushNotification: (n) => set((s) => ({ notifications: [{
		id: "N" + Date.now(),
		time: "just now",
		...n
	}, ...s.notifications] })),
	pushAudit: (e) => set((s) => ({ audit: [{
		ts: (/* @__PURE__ */ new Date()).toLocaleString("en-IN"),
		...e
	}, ...s.audit] })),
	resetSeed: () => {
		set({
			customers: [],
			loans: [],
			collections: [],
			payments: [],
			expenses: [],
			investments: [],
			notifications: [],
			audit: [],
			documents: []
		});
		const { sheetsConfig } = get();
		if (sheetsConfig.enabled && sheetsConfig.url) Promise.all([
			writeSheet(sheetsConfig.url, "Finance_Customers", []),
			writeSheet(sheetsConfig.url, "Finance_Payments", []),
			writeSheet(sheetsConfig.url, "Finance_Expenses", []),
			writeSheet(sheetsConfig.url, "Finance_Investments", [])
		]).catch(() => {});
	},
	recheckStatuses: () => set((s) => ({ customers: recalculateStatuses(s.customers) })),
	updateSheetsConfig: (cfg) => set((s) => ({ sheetsConfig: {
		...s.sheetsConfig,
		...cfg
	} })),
	syncToSheets: async () => {
		const { sheetsConfig, customers, payments, expenses, investments, staff } = get();
		if (!sheetsConfig.enabled || !sheetsConfig.url) return {
			ok: false,
			error: "Google Sheets sync is not configured or disabled."
		};
		try {
			await writeSheet(sheetsConfig.url, "Finance_Customers", customers.map((c) => ({
				id: c.id,
				name: c.name,
				mobile: c.mobile,
				village: c.village,
				region: c.region,
				price: c.price,
				deposit: c.deposit,
				emi: c.emi,
				noOfEmi: c.noOfEmi,
				emiDate: c.emiDate,
				billDate: c.billDate,
				status: c.status,
				mobileBrand: c.mobileBrand,
				mobileModel: c.mobileModel
			})));
			await writeSheet(sheetsConfig.url, "Finance_Payments", payments.map((p) => ({
				id: p.id,
				customer: p.customer,
				amount: p.amount,
				method: p.method,
				date: p.date,
				collector: p.collector,
				remarks: p.remarks
			})));
			await writeSheet(sheetsConfig.url, "Finance_Expenses", expenses.map((e) => ({
				id: e.id,
				date: e.date,
				cat: e.cat,
				desc: e.desc,
				amount: e.amount,
				type: e.type ?? "Expense",
				method: e.method ?? "Cash"
			})));
			await writeSheet(sheetsConfig.url, "Finance_Investments", investments.map((inv) => ({
				id: inv.id,
				investor: inv.investor,
				amount: inv.amount,
				roi: inv.roi,
				maturity: inv.maturity,
				status: inv.status,
				date: inv.date ?? "",
				method: inv.method ?? "Cash"
			})));
			await writeSheet(sheetsConfig.url, "Finance_Staff", staff.map((s) => ({
				id: s.id,
				name: s.name,
				email: s.email,
				role: s.role,
				status: s.status,
				access: s.access || "Both",
				password: s.password || ""
			})));
			const ts = nowTimestamp();
			set((s) => ({ sheetsConfig: {
				...s.sheetsConfig,
				lastSync: ts
			} }));
			return { ok: true };
		} catch (err) {
			return {
				ok: false,
				error: err?.message || String(err)
			};
		}
	},
	loadFromSheets: async () => {
		const { sheetsConfig } = get();
		if (!sheetsConfig.enabled || !sheetsConfig.url) return {
			ok: false,
			error: "Google Sheets sync is not configured or disabled."
		};
		try {
			const [custRows, payRows, expRows, invRows, staffRows] = await Promise.all([
				readSheet(sheetsConfig.url, "Finance_Customers"),
				readSheet(sheetsConfig.url, "Finance_Payments"),
				readSheet(sheetsConfig.url, "Finance_Expenses"),
				readSheet(sheetsConfig.url, "Finance_Investments"),
				readSheet(sheetsConfig.url, "Finance_Staff")
			]);
			if (custRows.length > 0) set({ customers: custRows });
			if (payRows.length > 0) set({ payments: payRows });
			if (expRows.length > 0) set({ expenses: expRows });
			if (invRows.length > 0) set({ investments: invRows });
			if (staffRows.length > 0) set({ staff: staffRows.map((r) => ({
				id: String(r.id || ""),
				name: String(r.name || ""),
				email: String(r.email || ""),
				role: String(r.role || "Staff"),
				status: r.status || "Active",
				access: r.access || "Both",
				password: String(r.password || "")
			})) });
			const ts = nowTimestamp();
			set((s) => ({ sheetsConfig: {
				...s.sheetsConfig,
				lastSync: ts
			} }));
			return { ok: true };
		} catch (err) {
			return {
				ok: false,
				error: err?.message || String(err)
			};
		}
	}
}), {
	name: "jain-finance-erp-v4",
	merge: (persistedState, currentState) => {
		const merged = {
			...currentState,
			...persistedState
		};
		merged.sheetsConfig = {
			...merged.sheetsConfig,
			url: PERMANENT_SHEETS_URL$1,
			enabled: true
		};
		return merged;
	}
}));
var _financeAutoSyncTimer = null;
var _lastFinCustomers = useStore.getState().customers;
var _lastFinPayments = useStore.getState().payments;
var _lastFinExpenses = useStore.getState().expenses;
var _lastFinInvestments = useStore.getState().investments;
var _lastFinStaff = useStore.getState().staff;
useStore.subscribe((state) => {
	if (!state.sheetsConfig.enabled || !state.sheetsConfig.url) return;
	if (state.customers !== _lastFinCustomers || state.payments !== _lastFinPayments || state.expenses !== _lastFinExpenses || state.investments !== _lastFinInvestments || state.staff !== _lastFinStaff) {
		_lastFinCustomers = state.customers;
		_lastFinPayments = state.payments;
		_lastFinExpenses = state.expenses;
		_lastFinInvestments = state.investments;
		_lastFinStaff = state.staff;
		if (_financeAutoSyncTimer) clearTimeout(_financeAutoSyncTimer);
		_financeAutoSyncTimer = setTimeout(() => {
			useStore.getState().syncToSheets().catch(() => {});
		}, 3e3);
	}
});
function downloadExcel(filename, reportName, rows) {
	const cleanFilename = filename.replace(/\.(xls|csv)$/i, "") + ".xlsx";
	const wb = import_xlsx_min.default.utils.book_new();
	let ws;
	if (!rows.length) ws = import_xlsx_min.default.utils.aoa_to_sheet([["No data available"]]);
	else {
		const headers = Object.keys(rows[0]);
		const data = [headers, ...rows.map((row) => headers.map((h) => row[h] !== void 0 && row[h] !== null ? String(row[h]) : ""))];
		ws = import_xlsx_min.default.utils.aoa_to_sheet(data);
		headers.forEach((_, idx) => {
			const cellRef = import_xlsx_min.default.utils.encode_cell({
				r: 0,
				c: idx
			});
			if (ws[cellRef]) ws[cellRef].s = {
				font: {
					bold: true,
					name: "Segoe UI",
					sz: 11
				},
				fill: { fgColor: { rgb: "F1F5F9" } },
				border: { bottom: {
					style: "thin",
					color: { rgb: "CBD5E1" }
				} }
			};
		});
		const colWidths = headers.map((h) => {
			let maxLen = h.length;
			rows.forEach((row) => {
				const val = row[h] !== void 0 && row[h] !== null ? String(row[h]) : "";
				if (val.length > maxLen) maxLen = val.length;
			});
			return { wch: Math.min(Math.max(maxLen + 3, 12), 45) };
		});
		ws["!cols"] = colWidths;
	}
	import_xlsx_min.default.utils.book_append_sheet(wb, ws, reportName.replace(/[\\*?:/[\]]/g, "").substring(0, 31) || "Sheet1");
	const wbout = import_xlsx_min.default.write(wb, {
		bookType: "xlsx",
		type: "binary"
	});
	const s2ab = (s) => {
		const buf = new ArrayBuffer(s.length);
		const view = new Uint8Array(buf);
		for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 255;
		return buf;
	};
	triggerDownload(cleanFilename, new Blob([s2ab(wbout)], { type: "application/octet-stream" }));
}
function downloadCustomerStatementExcel(filename, c, custPayments) {
	const cleanFilename = filename.replace(/\.(xls|csv)$/i, "") + ".xlsx";
	const wb = import_xlsx_min.default.utils.book_new();
	const ws = {};
	const setCell = (r, col, val, style = {}) => {
		const ref = import_xlsx_min.default.utils.encode_cell({
			r,
			c: col
		});
		ws[ref] = {
			t: typeof val === "number" ? "n" : "s",
			v: val,
			s: {
				font: {
					name: "Segoe UI",
					sz: 11,
					...style.font
				},
				fill: style.fill,
				alignment: style.alignment,
				border: style.border
			}
		};
	};
	const titleStyle = { font: {
		bold: true,
		sz: 14
	} };
	const sectionHeaderStyle = {
		font: {
			bold: true,
			sz: 12
		},
		fill: { fgColor: { rgb: "F1F5F9" } },
		border: { bottom: {
			style: "thin",
			color: { rgb: "CBD5E1" }
		} }
	};
	const tableHeaderStyle = {
		font: {
			bold: true,
			sz: 11
		},
		fill: { fgColor: { rgb: "E2E8F0" } },
		border: {
			top: {
				style: "thin",
				color: { rgb: "CBD5E1" }
			},
			bottom: {
				style: "medium",
				color: { rgb: "94A3B8" }
			},
			left: {
				style: "thin",
				color: { rgb: "CBD5E1" }
			},
			right: {
				style: "thin",
				color: { rgb: "CBD5E1" }
			}
		}
	};
	const labelStyle = { font: {
		bold: true,
		color: { rgb: "475569" }
	} };
	const valueStyle = { font: { name: "Segoe UI" } };
	const tableDataStyle = { border: {
		bottom: {
			style: "thin",
			color: { rgb: "E2E8F0" }
		},
		left: {
			style: "thin",
			color: { rgb: "E2E8F0" }
		},
		right: {
			style: "thin",
			color: { rgb: "E2E8F0" }
		}
	} };
	const safeFormatInr = (val) => {
		if (val === void 0 || val === null || val === "") return "—";
		const num = typeof val === "number" ? val : Number(String(val).replace(/[^\d.-]/g, ""));
		return isNaN(num) ? String(val) : `₹${num.toLocaleString("en-IN")}`;
	};
	setCell(0, 0, "CUSTOMER ACCOUNT LEDGER STATEMENT", titleStyle);
	setCell(1, 0, "Statement Date:", labelStyle);
	setCell(1, 1, `${(/* @__PURE__ */ new Date()).toLocaleDateString("en-IN")} ${(/* @__PURE__ */ new Date()).toLocaleTimeString("en-IN")}`, valueStyle);
	setCell(3, 0, "CUSTOMER PROFILE", sectionHeaderStyle);
	setCell(4, 0, "Customer ID", labelStyle);
	setCell(4, 1, c.id, valueStyle);
	setCell(4, 2, "Full Name", labelStyle);
	setCell(4, 3, c.name, valueStyle);
	setCell(5, 0, "Mobile No", labelStyle);
	setCell(5, 1, c.mobile, valueStyle);
	setCell(5, 2, "Aadhaar Card", labelStyle);
	setCell(5, 3, c.aadhaar || "—", valueStyle);
	setCell(6, 0, "Village", labelStyle);
	setCell(6, 1, c.village || "—", valueStyle);
	setCell(6, 2, "Guarantor", labelStyle);
	setCell(6, 3, `${c.guarantyName || "—"} (${c.guarantyMobile || "—"})`, valueStyle);
	setCell(8, 0, "DEVICE & FINANCE INFO", sectionHeaderStyle);
	setCell(9, 0, "Device", labelStyle);
	setCell(9, 1, `${c.mobileBrand} ${c.mobileModel}`, valueStyle);
	setCell(9, 2, "IMEI 1 / 2", labelStyle);
	setCell(9, 3, `${c.imei1 || "—"} / ${c.imei2 || "—"}`, valueStyle);
	setCell(10, 0, "Selling Price", labelStyle);
	setCell(10, 1, safeFormatInr(c.price), valueStyle);
	setCell(10, 2, "Down Payment", labelStyle);
	setCell(10, 3, safeFormatInr(c.deposit), valueStyle);
	setCell(11, 0, "Monthly EMI", labelStyle);
	setCell(11, 1, safeFormatInr(c.perMonthEmi), valueStyle);
	setCell(11, 2, "Total Interest", labelStyle);
	setCell(11, 3, safeFormatInr(c.totalInterest), valueStyle);
	setCell(12, 0, "EMIs Progress", labelStyle);
	setCell(12, 1, `${c.paidEmis} / ${c.noOfEmi} paid`, valueStyle);
	setCell(12, 2, "Status", labelStyle);
	setCell(12, 3, c.status, valueStyle);
	setCell(13, 0, "Pending Balance", labelStyle);
	setCell(13, 1, safeFormatInr(c.pendingAmount), valueStyle);
	setCell(13, 2, "Next EMI Date", labelStyle);
	setCell(13, 3, c.emiDate || "—", valueStyle);
	setCell(15, 0, "TRANSACTION LEDGER", sectionHeaderStyle);
	[
		"Txn ID",
		"Date",
		"Payment Mode",
		"Amount Paid"
	].forEach((h, idx) => {
		setCell(16, idx, h, tableHeaderStyle);
	});
	let currentRow = 17;
	if (custPayments.length === 0) {
		setCell(currentRow, 0, "No payments recorded yet.", valueStyle);
		currentRow++;
	} else custPayments.forEach((p) => {
		setCell(currentRow, 0, p.id, tableDataStyle);
		setCell(currentRow, 1, p.date, tableDataStyle);
		setCell(currentRow, 2, p.method, tableDataStyle);
		setCell(currentRow, 3, p.amount, {
			...tableDataStyle,
			alignment: { horizontal: "right" }
		});
		currentRow++;
	});
	ws["!merges"] = [
		{
			s: {
				r: 0,
				c: 0
			},
			e: {
				r: 0,
				c: 3
			}
		},
		{
			s: {
				r: 3,
				c: 0
			},
			e: {
				r: 3,
				c: 3
			}
		},
		{
			s: {
				r: 8,
				c: 0
			},
			e: {
				r: 8,
				c: 3
			}
		},
		{
			s: {
				r: 15,
				c: 0
			},
			e: {
				r: 15,
				c: 3
			}
		}
	];
	if (custPayments.length === 0) ws["!merges"].push({
		s: {
			r: 17,
			c: 0
		},
		e: {
			r: 17,
			c: 3
		}
	});
	ws["!ref"] = `A1:${import_xlsx_min.default.utils.encode_cell({
		r: currentRow - 1,
		c: 3
	})}`;
	ws["!cols"] = [
		{ wch: 18 },
		{ wch: 25 },
		{ wch: 18 },
		{ wch: 25 }
	];
	import_xlsx_min.default.utils.book_append_sheet(wb, ws, "Statement");
	const wbout = import_xlsx_min.default.write(wb, {
		bookType: "xlsx",
		type: "binary"
	});
	const s2ab = (s) => {
		const buf = new ArrayBuffer(s.length);
		const view = new Uint8Array(buf);
		for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 255;
		return buf;
	};
	triggerDownload(cleanFilename, new Blob([s2ab(wbout)], { type: "application/octet-stream" }));
}
function triggerDownload(filename, blob) {
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	a.remove();
	URL.revokeObjectURL(url);
}
function parseAppDate(dateStr) {
	if (!dateStr) return null;
	const cleaned = dateStr.trim();
	if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
		const d = new Date(cleaned);
		return isNaN(d.getTime()) ? null : d;
	}
	const parts = cleaned.split(/\s+/);
	if (parts.length === 3) {
		const day = parseInt(parts[0], 10);
		const monthIdx = [
			"Jan",
			"Feb",
			"Mar",
			"Apr",
			"May",
			"Jun",
			"Jul",
			"Aug",
			"Sep",
			"Oct",
			"Nov",
			"Dec"
		].findIndex((m) => m.toLowerCase() === parts[1].toLowerCase().substring(0, 3));
		const year = parseInt(parts[2], 10);
		if (!isNaN(day) && monthIdx !== -1 && !isNaN(year)) return new Date(year, monthIdx, day);
	}
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
function isDateInRange(date, start, end) {
	if (!date) return false;
	const dTime = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
	if (start) {
		if (dTime < new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime()) return false;
	}
	if (end) {
		if (dTime > new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime()) return false;
	}
	return true;
}
function retreatEmiDate(dateStr) {
	if (!dateStr) return "";
	const ymdMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
	if (ymdMatch) {
		const y = parseInt(ymdMatch[1], 10);
		const m = parseInt(ymdMatch[2], 10) - 1;
		const d = parseInt(ymdMatch[3], 10);
		const date = new Date(y, m - 1, d);
		return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
	}
	const dmyMatch = dateStr.match(/^(\d{2})\s+([a-zA-Z]{3})\s+(\d{4})$/);
	if (dmyMatch) {
		const day = parseInt(dmyMatch[1], 10);
		const monthAbbrs = [
			"Jan",
			"Feb",
			"Mar",
			"Apr",
			"May",
			"Jun",
			"Jul",
			"Aug",
			"Sep",
			"Oct",
			"Nov",
			"Dec"
		];
		const monthIdx = monthAbbrs.indexOf(dmyMatch[2]);
		const year = parseInt(dmyMatch[3], 10);
		if (monthIdx !== -1) {
			const date = new Date(year, monthIdx - 1, day);
			return `${String(date.getDate()).padStart(2, "0")} ${monthAbbrs[date.getMonth()]} ${date.getFullYear()}`;
		}
	}
	return dateStr;
}
function getOriginalEmiStartDate(emiDateStr, paidEmis) {
	let date = emiDateStr;
	for (let i = 0; i < paidEmis; i++) date = retreatEmiDate(date);
	return date;
}
function getMissedEmisCount(emiDateStr, paidEmis, noOfEmi) {
	const originalStart = getOriginalEmiStartDate(emiDateStr, paidEmis);
	const today = /* @__PURE__ */ new Date();
	const todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate());
	let emisExpected = 0;
	let currentDueDate = originalStart;
	for (let i = 0; i < noOfEmi; i++) {
		const parsedDue = parseAppDate(currentDueDate);
		if (parsedDue) if (new Date(parsedDue.getFullYear(), parsedDue.getMonth(), parsedDue.getDate()) <= todayZero) emisExpected++;
		else break;
		currentDueDate = advanceEmiDate(currentDueDate);
	}
	return Math.max(0, emisExpected - paidEmis);
}
function recalculateStatuses(customers) {
	return customers.map((c) => {
		if (c.pendingEmis === 0) return {
			...c,
			status: "Closed",
			missedEmis: 0
		};
		const missed = getMissedEmisCount(c.emiDate, c.paidEmis, c.noOfEmi);
		let status = c.status;
		if (missed === 0) status = "Active";
		else if (missed === 1 || missed === 2) status = "Overdue";
		else if (missed >= 3) status = "Defaulted";
		return {
			...c,
			status,
			missedEmis: missed
		};
	});
}
var useUi = create((set) => ({
	open: null,
	openDialog: (key, prefill) => set({
		open: key,
		prefill
	}),
	close: () => set({
		open: null,
		prefill: void 0
	})
}));
var getTodayYmd = () => {
	const d = /* @__PURE__ */ new Date();
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
function Field({ label, value, onChange, placeholder, type = "text", readOnly = false, highlight = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-xs text-muted-foreground font-medium",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			type,
			value,
			onChange: (e) => onChange?.(e.target.value),
			placeholder,
			readOnly,
			className: `mt-1 h-9 w-full rounded-md border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 ${readOnly ? "border-border/60 bg-muted/10 text-foreground/75 cursor-not-allowed" : highlight ? "border-success/50 bg-success/5 border-border focus:border-success/60" : "border-border bg-surface"}`
		})]
	});
}
function Select({ label, value, onChange, options, readOnly = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-xs text-muted-foreground font-medium",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
			value,
			onChange: (e) => onChange?.(e.target.value),
			disabled: readOnly,
			className: "mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 disabled:bg-muted/40",
			children: options.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: o }, o))
		})]
	});
}
function CalcRow({ label, value, big = false, accent = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between py-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-xs text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: `font-medium ${big ? "text-base" : "text-sm"} ${accent ? "text-success" : ""}`,
			children: value
		})]
	});
}
function SectionTitle({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "text-[10px] uppercase tracking-widest font-semibold text-muted-foreground border-b border-border pb-1.5 mb-3 mt-1",
		children
	});
}
function PrimaryBtn({ children, onClick, disabled }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		disabled,
		className: "h-9 px-5 rounded-md bg-foreground text-background text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity",
		children
	});
}
function GhostBtn({ children, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: "h-9 px-3 rounded-md border border-border bg-surface text-sm hover:bg-accent transition-colors",
		children
	});
}
function CustomerDialog() {
	const { open, close } = useUi();
	const addCustomer = useStore((s) => s.addCustomer);
	const [firstName, setFirstName] = (0, import_react.useState)("");
	const [fatherName, setFatherName] = (0, import_react.useState)("");
	const [surname, setSurname] = (0, import_react.useState)("");
	const [mobile, setMobile] = (0, import_react.useState)("");
	const [aadhaar, setAadhaar] = (0, import_react.useState)("");
	const [guarantyName, setGuarantyName] = (0, import_react.useState)("");
	const [guarantyMobile, setGuarantyMobile] = (0, import_react.useState)("");
	const [region, setRegion] = (0, import_react.useState)(REGIONS[0]);
	const [village, setVillage] = (0, import_react.useState)("");
	const availableVillages = VILLAGES_BY_REGION[region] || [];
	(0, import_react.useEffect)(() => {
		setVillage(availableVillages[0] || "");
	}, [region, availableVillages]);
	const [mobileBrand, setMobileBrand] = (0, import_react.useState)(Object.keys(MOBILE_BRANDS)[0] || "Apple");
	const [mobileModel, setMobileModel] = (0, import_react.useState)("");
	const [ramRom, setRamRom] = (0, import_react.useState)("4GB/64GB");
	const [imei1, setImei1] = (0, import_react.useState)("");
	const [imei2, setImei2] = (0, import_react.useState)("");
	const [price, setPrice] = (0, import_react.useState)("");
	const [deposit, setDeposit] = (0, import_react.useState)("");
	const [interestRate, setInterestRate] = (0, import_react.useState)("5");
	const [noOfEmi, setNoOfEmi] = (0, import_react.useState)("6");
	const [emiDate, setEmiDate] = (0, import_react.useState)("");
	const [billDate, setBillDate] = (0, import_react.useState)(getTodayYmd());
	const [fileChargeVal, setFileChargeVal] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (price) setFileChargeVal(Math.round(Number(price) * .1).toString());
		else setFileChargeVal("");
	}, [price]);
	const [aadhaarFile, setAadhaarFile] = (0, import_react.useState)(void 0);
	const [photoFile, setPhotoFile] = (0, import_react.useState)(void 0);
	(0, import_react.useEffect)(() => {
		if (open !== "customer") {
			setFirstName("");
			setFatherName("");
			setSurname("");
			setMobile("");
			setAadhaar("");
			setGuarantyName("");
			setGuarantyMobile("");
			setRegion(REGIONS[0]);
			setVillage(VILLAGES_BY_REGION[REGIONS[0]]?.[0] || "");
			setMobileBrand(Object.keys(MOBILE_BRANDS)[0] || "Apple");
			setRamRom("4GB/64GB");
			setImei1("");
			setImei2("");
			setPrice("");
			setDeposit("");
			setInterestRate("5");
			setNoOfEmi("6");
			setEmiDate("");
			setBillDate(getTodayYmd());
			setFileChargeVal("");
			setAadhaarFile(void 0);
			setPhotoFile(void 0);
		}
	}, [open]);
	const priceNum = Number(price) || 0;
	const depositNum = Number(deposit) || 0;
	const interestNum = Number(interestRate) || 0;
	const emiCount = Number(noOfEmi) || 0;
	const fileChargeNum = fileChargeVal !== "" ? Number(fileChargeVal) : void 0;
	const { fileCharge, balance, interestPerMonth, totalInterest, totalEmiAmount, perMonthEmi } = calcEmi(priceNum, depositNum, interestNum, emiCount, fileChargeNum);
	const isMobileValid = /^\d{10}$/.test(mobile.trim());
	const isAadhaarValid = /^\d{12}$/.test(aadhaar.trim());
	const isGuarantyMobileValid = !guarantyMobile.trim() || /^\d{10}$/.test(guarantyMobile.trim());
	const canSubmit = firstName.trim() && isMobileValid && isAadhaarValid && isGuarantyMobileValid && mobileModel && priceNum > 0 && emiDate.trim() && billDate.trim();
	const handleAadhaarUpload = (e) => {
		const file = e.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setAadhaarFile({
					name: file.name,
					size: `${(file.size / 1024).toFixed(0)} KB`,
					url: reader.result
				});
				toast.success(`Aadhaar Xerox uploaded: ${file.name}`);
			};
			reader.readAsDataURL(file);
		}
	};
	const handlePhotoUpload = (e) => {
		const file = e.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setPhotoFile({
					name: file.name,
					size: `${(file.size / 1024).toFixed(0)} KB`,
					url: reader.result
				});
				toast.success(`Customer Photo uploaded: ${file.name}`);
			};
			reader.readAsDataURL(file);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: open === "customer",
		onOpenChange: (o) => !o && close(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-4xl max-h-[92vh] overflow-y-auto p-0",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-6 py-4 border-b border-border bg-foreground text-background rounded-t-xl",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-base font-semibold tracking-tight",
						children: "New Customer Registration"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs opacity-70 mt-0.5",
						children: "Mobile phone EMI finance · Jain Finance ERP"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-0 divide-x divide-border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-5 space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, { children: "Personal Information" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Customer Name (First)",
								value: firstName,
								onChange: setFirstName,
								placeholder: "e.g. Avinash"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Father's Name",
								value: fatherName,
								onChange: setFatherName,
								placeholder: "e.g. Ramesh"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Surname",
								value: surname,
								onChange: setSurname,
								placeholder: "e.g. Patil"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Mobile No",
								value: mobile,
								onChange: setMobile,
								placeholder: "7418529639"
							}),
							mobile.trim() && !/^\d{10}$/.test(mobile.trim()) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] text-red-500 font-semibold mt-0.5 block",
								children: "Phone number must be exactly 10 digits"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Adhar Card No",
								value: aadhaar,
								onChange: setAadhaar,
								placeholder: "123456789012"
							}),
							aadhaar.trim() && !/^\d{12}$/.test(aadhaar.trim()) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] text-red-500 font-semibold mt-0.5 block",
								children: "Aadhaar card number must be exactly 12 digits"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, { children: "Guarantor Details" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Guaranty Name",
								value: guarantyName,
								onChange: setGuarantyName,
								placeholder: "e.g. Anna"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Guaranty Mobile No",
								value: guarantyMobile,
								onChange: setGuarantyMobile,
								placeholder: "7418529639"
							}),
							guarantyMobile.trim() && !/^\d{10}$/.test(guarantyMobile.trim()) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] text-red-500 font-semibold mt-0.5 block",
								children: "Guarantor mobile must be exactly 10 digits"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, { children: "Location" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
								label: "Region",
								value: region,
								onChange: setRegion,
								options: REGIONS
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
								label: "Village Name",
								value: village,
								onChange: setVillage,
								options: availableVillages
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, { children: "Documents" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted-foreground font-medium block mb-1",
										children: "Aadhaar Xerox"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "file",
										id: "aadhaar-file-input",
										className: "hidden",
										onChange: handleAadhaarUpload,
										accept: "image/*,application/pdf"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										onClick: () => document.getElementById("aadhaar-file-input")?.click(),
										className: "h-20 rounded-md border border-dashed border-border bg-surface flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-accent transition-colors px-2 text-center",
										children: aadhaarFile ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs font-medium text-success truncate w-full",
											children: aadhaarFile.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[10px] text-muted-foreground",
											children: aadhaarFile.size
										})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-muted-foreground",
											children: "Click to select"
										})
									})
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted-foreground font-medium block mb-1",
										children: "Photo"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "file",
										id: "photo-file-input",
										className: "hidden",
										onChange: handlePhotoUpload,
										accept: "image/*"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										onClick: () => document.getElementById("photo-file-input")?.click(),
										className: "h-20 rounded-md border border-dashed border-border bg-surface flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-accent transition-colors px-2 text-center",
										children: photoFile ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs font-medium text-success truncate w-full",
											children: photoFile.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[10px] text-muted-foreground",
											children: photoFile.size
										})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-muted-foreground",
											children: "Click to select"
										})
									})
								] })]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-5 space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, { children: "Mobile Device Details" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
								label: "Mobile Brand",
								value: mobileBrand,
								onChange: setMobileBrand,
								options: Object.keys(MOBILE_BRANDS)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Model Name (Manual)",
								value: mobileModel,
								onChange: setMobileModel,
								placeholder: "e.g. Redmi 12 5G"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
								label: "RAM / ROM",
								value: ramRom,
								onChange: setRamRom,
								options: RAM_ROM_OPTIONS
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "IMEI 1",
									value: imei1,
									onChange: setImei1,
									placeholder: "15-digit"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "IMEI 2",
									value: imei2,
									onChange: setImei2,
									placeholder: "15-digit"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, { children: "EMI Finance Details" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Price (₹)",
								value: price,
								onChange: setPrice,
								type: "number",
								placeholder: "15000"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Deposit (₹)",
								value: deposit,
								onChange: setDeposit,
								type: "number",
								placeholder: "2000"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "File Charge (₹)",
								value: fileChargeVal,
								onChange: setFileChargeVal,
								type: "number",
								placeholder: "Defaults to 10%"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between h-9 px-3 rounded-md border border-border bg-surface text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground text-xs font-medium",
									children: "Balance for EMI"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-semibold text-foreground",
									children: ["₹", balance.toLocaleString("en-IN")]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
									label: "Interest (% / mo)",
									value: interestRate,
									onChange: setInterestRate,
									options: INTEREST_OPTIONS
								}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between h-9 mt-[22px] px-3 rounded-md border border-border bg-surface text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground text-xs font-medium",
										children: "Interest/mo"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-semibold text-foreground",
										children: ["₹", interestPerMonth.toLocaleString("en-IN")]
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
								label: "No of EMI",
								value: noOfEmi,
								onChange: setNoOfEmi,
								options: EMI_COUNT_OPTIONS
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-lg border border-border bg-surface px-4 py-3 space-y-1 mt-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalcRow, {
										label: "Total Interest",
										value: `₹${totalInterest.toLocaleString("en-IN")}`
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalcRow, {
										label: "Total EMI Amount",
										value: `₹${totalEmiAmount.toLocaleString("en-IN")}`,
										big: true
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "border-t border-border pt-1 mt-1",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalcRow, {
											label: "Per Month EMI",
											value: `₹${perMonthEmi.toLocaleString("en-IN")}`,
											big: true,
											accent: true
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalcRow, {
										label: "No of Pending EMI",
										value: noOfEmi
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalcRow, {
										label: "Pending EMI Amount",
										value: `₹${totalEmiAmount.toLocaleString("en-IN")}`
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Finance Creation Date",
									value: billDate,
									onChange: setBillDate,
									type: "date"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "EMI Start Date",
									value: emiDate,
									onChange: setEmiDate,
									type: "date"
								})]
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-6 py-4 border-t border-border flex items-center justify-between gap-3 bg-surface/50 rounded-b-xl",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: canSubmit ? `✓ Ready to register ${firstName} ${surname}` : "Fill all required fields"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GhostBtn, {
							onClick: close,
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrimaryBtn, {
							disabled: !canSubmit,
							onClick: () => {
								const c = addCustomer({
									firstName: firstName.trim(),
									fatherName: fatherName.trim(),
									surname: surname.trim(),
									mobile: mobile.trim(),
									aadhaar: aadhaar.trim(),
									guarantyName: guarantyName.trim(),
									guarantyMobile: guarantyMobile.trim(),
									region,
									village,
									mobileBrand,
									mobileModel,
									ramRom,
									imei1: imei1.trim(),
									imei2: imei2.trim(),
									price: priceNum,
									deposit: depositNum,
									interestRate: interestNum,
									noOfEmi: emiCount,
									emiDate: formatDateToInr(emiDate),
									billDate: formatDateToInr(billDate),
									fileCharge: fileChargeNum,
									aadhaarFile,
									photoFile
								});
								toast.success(`Customer ${c.id} registered — ${mobileBrand} ${mobileModel}`);
								close();
							},
							children: "Register Customer"
						})]
					})]
				})
			]
		})
	});
}
function CollectDialog() {
	const { open, close, prefill } = useUi();
	const customers = useStore((s) => s.customers);
	const recordPayment = useStore((s) => s.recordPayment);
	const [customerId, setCustomerId] = (0, import_react.useState)("");
	const [amount, setAmount] = (0, import_react.useState)("");
	const [method, setMethod] = (0, import_react.useState)("Cash");
	const [collector, setCollector] = (0, import_react.useState)("Rajesh Jain");
	const [customCollectorName, setCustomCollectorName] = (0, import_react.useState)("");
	const [remarks, setRemarks] = (0, import_react.useState)("");
	const [date, setDate] = (0, import_react.useState)(getTodayYmd());
	const customer = customers.find((c) => c.id === customerId);
	(0, import_react.useEffect)(() => {
		if (open === "collect" || open === "payment") {
			const pid = prefill?.customerId || customers.find((c) => c.pendingEmis > 0)?.id || customers[0]?.id || "";
			setCustomerId(pid);
			const cust = customers.find((c) => c.id === pid);
			if (cust) setAmount(cust.perMonthEmi.toString());
			setRemarks("");
			setDate(getTodayYmd());
			setCollector("Rajesh Jain");
			setCustomCollectorName("");
		}
	}, [
		open,
		prefill,
		customers
	]);
	(0, import_react.useEffect)(() => {
		if (customer) setAmount(customer.perMonthEmi.toString());
	}, [customerId, customer]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: open === "collect" || open === "payment",
		onOpenChange: (o) => !o && close(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Record EMI Payment" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Collect monthly instalment from customer." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3 py-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Payment Date",
							value: date,
							onChange: setDate,
							type: "date"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground font-medium",
								children: "Customer"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								value: customerId,
								onChange: (e) => setCustomerId(e.target.value),
								className: "mt-1 h-9 w-full rounded-md border border-border bg-background px-3 text-sm focus:outline-none",
								children: customers.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
									value: c.id,
									children: [
										c.id,
										" — ",
										c.name,
										" (",
										c.mobileBrand,
										" ",
										c.mobileModel,
										")"
									]
								}, c.id))
							})]
						}),
						customer && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg border border-border bg-muted/20 px-4 py-3 grid grid-cols-3 gap-3 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[10px] text-muted-foreground uppercase tracking-wider",
									children: "Monthly EMI"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "font-semibold mt-0.5",
									children: ["₹", customer.perMonthEmi.toLocaleString("en-IN")]
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[10px] text-muted-foreground uppercase tracking-wider",
									children: "Pending EMIs"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "font-semibold mt-0.5",
									children: [
										customer.pendingEmis,
										" / ",
										customer.noOfEmi
									]
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[10px] text-muted-foreground uppercase tracking-wider",
									children: "Pending Amt"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "font-semibold mt-0.5 text-warning",
									children: ["₹", customer.pendingAmount.toLocaleString("en-IN")]
								})] })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Payment Amount (₹)",
							value: amount,
							onChange: setAmount,
							type: "number",
							highlight: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
								label: "Method",
								value: method,
								onChange: setMethod,
								options: ["Cash", "UPI"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
								label: "Collector",
								value: collector,
								onChange: setCollector,
								options: [
									"Rajesh Jain",
									"Suresh Patil",
									"Ramesh Kumar",
									"Other (Manual Entry)"
								]
							})]
						}),
						collector === "Other (Manual Entry)" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Custom Collector Name",
							value: customCollectorName,
							onChange: setCustomCollectorName,
							placeholder: "Enter collector's name"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Remarks (optional)",
							value: remarks,
							onChange: setRemarks,
							placeholder: "e.g. Partial payment"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GhostBtn, {
					onClick: close,
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrimaryBtn, {
					disabled: !customerId || !amount || !date || collector === "Other (Manual Entry)" && !customCollectorName.trim(),
					onClick: () => {
						const activeCollector = collector === "Other (Manual Entry)" ? customCollectorName.trim() : collector;
						recordPayment({
							customerId,
							amount: Number(amount),
							method,
							collector: activeCollector,
							remarks,
							date
						});
						toast.success(`₹${Number(amount).toLocaleString("en-IN")} recorded for ${customer?.name}`);
						close();
					},
					children: "Confirm Payment"
				})] })
			]
		})
	});
}
function ExpenseDialog() {
	const { open, close } = useUi();
	const addExpense = useStore((s) => s.addExpense);
	const [type, setType] = (0, import_react.useState)("Expense");
	const [cat, setCat] = (0, import_react.useState)("Office Expense");
	const [desc, setDesc] = (0, import_react.useState)("");
	const [amount, setAmount] = (0, import_react.useState)("");
	const [date, setDate] = (0, import_react.useState)(getTodayYmd());
	const [method, setMethod] = (0, import_react.useState)("Cash");
	const EXPENSE_CATEGORIES = [
		"Office Expense",
		"Salary",
		"Travel",
		"Utilities",
		"Maintenance",
		"Marketing"
	];
	const INCOME_CATEGORIES = [
		"Interest Collection",
		"File Charge Income",
		"Capital Inflow",
		"Other Income"
	];
	(0, import_react.useEffect)(() => {
		setCat(type === "Expense" ? "Office Expense" : "Interest Collection");
	}, [type]);
	(0, import_react.useEffect)(() => {
		if (open !== "expense") {
			setType("Expense");
			setCat("Office Expense");
			setDesc("");
			setAmount("");
			setDate(getTodayYmd());
			setMethod("Cash");
		}
	}, [open]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: open === "expense",
		onOpenChange: (o) => !o && close(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Add Income / Expense Entry" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Record a cash transaction against the current month." })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3 py-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "col-span-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Entry Date",
							value: date,
							onChange: setDate,
							type: "date"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
						label: "Entry Type",
						value: type,
						onChange: (val) => setType(val),
						options: ["Expense", "Income"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
						label: "Category",
						value: cat,
						onChange: setCat,
						options: type === "Expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Amount (₹)",
						value: amount,
						onChange: setAmount,
						type: "number",
						placeholder: "1000",
						highlight: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
						label: "Payment Method",
						value: method,
						onChange: (val) => setMethod(val),
						options: ["Cash", "UPI"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "col-span-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Description",
							value: desc,
							onChange: setDesc,
							placeholder: "e.g. Office electricity bill, EMI collection cash..."
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GhostBtn, {
				onClick: close,
				children: "Cancel"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrimaryBtn, {
				disabled: !amount || !desc || !date,
				onClick: () => {
					const e = addExpense({
						cat,
						desc,
						amount: Number(amount),
						type,
						date,
						method
					});
					toast.success(`${type} entry ${e.id} recorded successfully`);
					setDesc("");
					setAmount("");
					close();
				},
				children: "Save Entry"
			})] })
		] })
	});
}
function InvestmentDialog() {
	const { open, close } = useUi();
	const addInvestment = useStore((s) => s.addInvestment);
	const [investor, setInvestor] = (0, import_react.useState)("");
	const [amount, setAmount] = (0, import_react.useState)("");
	const [roi, setRoi] = (0, import_react.useState)("12.5");
	const [maturity, setMaturity] = (0, import_react.useState)("31 Dec 2026");
	const [date, setDate] = (0, import_react.useState)(getTodayYmd());
	const [method, setMethod] = (0, import_react.useState)("UPI");
	(0, import_react.useEffect)(() => {
		if (open !== "investment") {
			setInvestor("");
			setAmount("");
			setRoi("12.5");
			setMaturity("31 Dec 2026");
			setDate(getTodayYmd());
			setMethod("UPI");
		}
	}, [open]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: open === "investment",
		onOpenChange: (o) => !o && close(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Add investment" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Record investor capital deployed into the fund." })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3 py-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "col-span-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Investment Date",
							value: date,
							onChange: setDate,
							type: "date"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Investor name",
						value: investor,
						onChange: setInvestor,
						placeholder: "e.g. Mahavir Jain"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Amount (₹)",
						value: amount,
						onChange: setAmount,
						type: "number",
						placeholder: "1000000",
						highlight: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "ROI (%)",
						value: roi,
						onChange: setRoi,
						type: "number"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
						label: "Payment Method",
						value: method,
						onChange: (val) => setMethod(val),
						options: ["Cash", "UPI"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "col-span-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Maturity date",
							value: maturity,
							onChange: setMaturity,
							placeholder: "31 Dec 2026"
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GhostBtn, {
				onClick: close,
				children: "Cancel"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrimaryBtn, {
				disabled: !investor || !amount || !date,
				onClick: () => {
					const i = addInvestment({
						investor,
						amount: Number(amount),
						roi: Number(roi),
						maturity,
						date,
						method
					});
					toast.success(`Investment ${i.id} added`);
					close();
				},
				children: "Save"
			})] })
		] })
	});
}
function AppDialogs() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CustomerDialog, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollectDialog, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExpenseDialog, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InvestmentDialog, {})
	] });
}
var getQtyStatus = (qty, minLimit) => {
	if (qty <= 0) return "Out of Stock";
	if (qty <= minLimit) return "Low Stock";
	return "In Stock";
};
var initialProducts = [];
var initialInventory = [];
var initialSuppliers = [];
var initialPurchases = [];
var initialCustomers = [];
var initialSales = [];
var initialImeis = [];
var initialAccessories = [];
var initialWarranties = [];
var initialExpenses = [];
var defaultSettings = {
	storeName: "Jain Mobiles & Electronics",
	gstNo: "27JAINMOB9812A1ZX",
	contact: "+91 98220 12345",
	email: "contact@jainmobiles.com",
	address: "Shop No. 5, Municipal Market, Shirwal, Satara, Maharashtra - 412801",
	invoicePrefix: "JM-INV-"
};
var PERMANENT_SHEETS_URL = "https://script.google.com/macros/s/AKfycbwWVkQNCNKEhICOxfWZasNAeUbJBQTB2gXaTtFk2QzCSt1r2ZhwsuZgTNYGJy_1I1ek/exec";
var useMobileStore = create()(persist((set, get) => ({
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
	sheetsConfig: {
		url: PERMANENT_SHEETS_URL,
		enabled: true,
		lastSync: void 0
	},
	addProduct: (p) => {
		const id = "MP-" + (get().products.length + 1).toString().padStart(3, "0");
		const newProduct = {
			...p,
			id,
			status: "In Stock"
		};
		const newInvItem = {
			id: "INV-" + (get().inventory.length + 1).toString().padStart(3, "0"),
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
	},
	updateProduct: (id, updatedFields) => {
		set((state) => {
			return {
				products: state.products.map((p) => p.id === id ? {
					...p,
					...updatedFields
				} : p),
				inventory: state.inventory.map((inv) => {
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
				})
			};
		});
	},
	deleteProduct: (id) => {
		set((state) => ({
			products: state.products.filter((p) => p.id !== id),
			inventory: state.inventory.filter((inv) => inv.productId !== id)
		}));
	},
	adjustStock: (productId, qtyChange) => {
		set((state) => {
			const inventory = state.inventory.map((inv) => {
				if (inv.productId === productId) {
					const quantity = Math.max(0, inv.quantity + qtyChange);
					const status = getQtyStatus(quantity, inv.minLimit);
					return {
						...inv,
						quantity,
						status
					};
				}
				return inv;
			});
			return {
				inventory,
				products: state.products.map((p) => {
					if (p.id === productId) {
						const invItem = inventory.find((inv) => inv.productId === productId);
						return {
							...p,
							status: invItem ? invItem.status : p.status
						};
					}
					return p;
				})
			};
		});
	},
	stockIn: (productId, quantity, cost) => {
		get().adjustStock(productId, quantity);
		set((state) => {
			return { inventory: state.inventory.map((inv) => {
				if (inv.productId === productId) return {
					...inv,
					purchasePrice: cost,
					profitMargin: inv.sellingPrice - cost
				};
				return inv;
			}) };
		});
	},
	addSupplier: (s) => {
		const id = "MS-" + (get().suppliers.length + 1).toString().padStart(3, "0");
		const newSupplier = {
			...s,
			id,
			outstanding: 0
		};
		set((state) => ({ suppliers: [...state.suppliers, newSupplier] }));
	},
	updateSupplier: (id, updatedFields) => {
		set((state) => ({ suppliers: state.suppliers.map((s) => s.id === id ? {
			...s,
			...updatedFields
		} : s) }));
	},
	deleteSupplier: (id) => {
		set((state) => ({ suppliers: state.suppliers.filter((s) => s.id !== id) }));
	},
	paySupplier: (id, amount, date, remark) => {
		const supplier = get().suppliers.find((s) => s.id === id);
		if (!supplier) return;
		const newPayment = {
			id: "SPM-" + ((get().supplierPayments ? get().supplierPayments.length : 0) + 1).toString().padStart(3, "0"),
			supplierId: id,
			supplierName: supplier.name,
			amount,
			date,
			remark
		};
		set((state) => ({
			suppliers: state.suppliers.map((s) => s.id === id ? {
				...s,
				outstanding: Math.max(0, s.outstanding - amount)
			} : s),
			supplierPayments: [newPayment, ...state.supplierPayments || []]
		}));
	},
	recordPurchase: (pur) => {
		const id = "MPR-" + (get().purchases.length + 1).toString().padStart(3, "0");
		const subtotal = pur.items.reduce((sum, item) => sum + item.quantity * item.cost, 0);
		const gst = 0;
		const total = subtotal;
		const status = pur.payNow ? "Paid" : "Outstanding";
		const newPurchase = {
			...pur,
			id,
			amount: total,
			gst,
			status
		};
		pur.items.forEach((item) => {
			get().adjustStock(item.productId, item.quantity);
			set((state) => ({ inventory: state.inventory.map((inv) => inv.productId === item.productId ? {
				...inv,
				purchasePrice: item.cost,
				profitMargin: inv.sellingPrice - item.cost
			} : inv) }));
		});
		if (!pur.payNow) set((state) => ({ suppliers: state.suppliers.map((s) => s.id === pur.supplierId ? {
			...s,
			outstanding: s.outstanding + total
		} : s) }));
		set((state) => ({ purchases: [newPurchase, ...state.purchases] }));
		return newPurchase;
	},
	createBill: (saleInput) => {
		const id = "MSL-" + (get().sales.length + 1).toString().padStart(3, "0");
		const date = saleInput.date || (/* @__PURE__ */ new Date()).toLocaleDateString("en-IN", {
			day: "2-digit",
			month: "short",
			year: "numeric"
		});
		const totalAmount = saleInput.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
		const newSale = {
			...saleInput,
			id,
			date,
			subtotal: totalAmount,
			gst: 0,
			totalAmount,
			paymentStatus: saleInput.paymentStatus || "Full Paid",
			amountPaid: saleInput.amountPaid !== void 0 ? saleInput.amountPaid : totalAmount,
			dueAmount: saleInput.dueAmount !== void 0 ? saleInput.dueAmount : 0
		};
		saleInput.items.forEach((item) => {
			get().adjustStock(item.productId, -item.quantity);
			if (item.imei1) {
				get().updateImeiStatus(item.imei1, "Sold");
				set((state) => ({ imeis: state.imeis.map((im) => im.imei1 === item.imei1 ? {
					...im,
					saleId: id
				} : im) }));
			}
		});
		if (!get().customers.some((c) => c.mobile.replace(/[^\d]/g, "") === saleInput.customerMobile.replace(/[^\d]/g, ""))) get().addCustomer({
			name: saleInput.customerName,
			mobile: saleInput.customerMobile,
			email: "",
			address: "",
			isBlacklisted: false
		});
		set((state) => ({ sales: [newSale, ...state.sales] }));
		return newSale;
	},
	addCustomer: (c) => {
		const id = "MC-" + (get().customers.length + 1).toString().padStart(3, "0");
		const registeredDate = (/* @__PURE__ */ new Date()).toLocaleDateString("en-IN", {
			day: "2-digit",
			month: "short",
			year: "numeric"
		});
		const newCustomer = {
			...c,
			id,
			registeredDate
		};
		set((state) => ({ customers: [...state.customers, newCustomer] }));
		return newCustomer;
	},
	updateCustomer: (id, updatedFields) => {
		set((state) => ({ customers: state.customers.map((c) => c.id === id ? {
			...c,
			...updatedFields
		} : c) }));
	},
	deleteCustomer: (id) => {
		set((state) => ({ customers: state.customers.filter((c) => c.id !== id) }));
	},
	addImei: (imei) => {
		set((state) => ({ imeis: [imei, ...state.imeis] }));
		get().adjustStock(imei.productId, 1);
	},
	updateImeiStatus: (imei1, status) => {
		set((state) => ({ imeis: state.imeis.map((im) => im.imei1 === imei1 ? {
			...im,
			status
		} : im) }));
	},
	addAccessory: (a) => {
		const id = "MA-" + (get().accessories.length + 1).toString().padStart(3, "0");
		const newAccessory = {
			...a,
			id,
			status: getQtyStatus(a.stock, a.minLimit)
		};
		set((state) => ({ accessories: [...state.accessories, newAccessory] }));
	},
	updateAccessory: (id, updatedFields) => {
		set((state) => ({ accessories: state.accessories.map((a) => {
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
		}) }));
	},
	deleteAccessory: (id) => {
		set((state) => ({ accessories: state.accessories.filter((a) => a.id !== id) }));
	},
	sellAccessory: (id, qty) => {
		set((state) => ({ accessories: state.accessories.map((a) => {
			if (a.id === id) {
				const stock = Math.max(0, a.stock - qty);
				return {
					...a,
					stock,
					status: getQtyStatus(stock, a.minLimit)
				};
			}
			return a;
		}) }));
	},
	addWarrantyClaim: (w) => {
		const id = "WC-" + (get().warranties.length + 1).toString().padStart(3, "0");
		const claimDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
		const newClaim = {
			...w,
			id,
			claimDate,
			status: "Pending"
		};
		set((state) => ({ warranties: [...state.warranties, newClaim] }));
	},
	updateWarrantyStatus: (id, status) => {
		set((state) => ({ warranties: state.warranties.map((w) => w.id === id ? {
			...w,
			status
		} : w) }));
	},
	updateSettings: (updatedSettings) => {
		set((state) => ({ settings: {
			...state.settings,
			...updatedSettings
		} }));
	},
	addExpense: (input) => {
		const newExpense = {
			id: "ME-" + (get().expenses.filter((e) => e.id.startsWith("ME-")).reduce((max, e) => {
				const n = parseInt(e.id.replace("ME-", ""), 10);
				return isNaN(n) ? max : Math.max(max, n);
			}, 5) + 1).toString().padStart(3, "0"),
			date: input.date ? formatDateToInr(input.date) : (/* @__PURE__ */ new Date()).toLocaleDateString("en-IN", {
				day: "2-digit",
				month: "short",
				year: "numeric"
			}),
			cat: input.cat,
			desc: input.desc,
			amount: `₹${Number(input.amount).toLocaleString("en-IN")}`,
			type: input.type || "Expense",
			paymentMode: input.paymentMode || "Cash"
		};
		set((state) => ({ expenses: [newExpense, ...state.expenses] }));
		return newExpense;
	},
	deleteExpense: (id) => {
		set((state) => ({ expenses: state.expenses.filter((e) => e.id !== id) }));
	},
	resetAll: () => {
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
		const { sheetsConfig } = get();
		if (sheetsConfig.enabled && sheetsConfig.url) Promise.all([
			writeSheet(sheetsConfig.url, "Mobiles_Sales", []),
			writeSheet(sheetsConfig.url, "Mobiles_Purchases", []),
			writeSheet(sheetsConfig.url, "Mobiles_Expenses", []),
			writeSheet(sheetsConfig.url, "Mobiles_Suppliers", []),
			writeSheet(sheetsConfig.url, "Mobiles_SupplierPayments", []),
			writeSheet(sheetsConfig.url, "Mobiles_Customers", []),
			writeSheet(sheetsConfig.url, "Mobiles_Products", [])
		]).catch(() => {});
	},
	updateSheetsConfig: (cfg) => set((s) => ({ sheetsConfig: {
		...s.sheetsConfig,
		...cfg
	} })),
	syncToSheets: async () => {
		const { sheetsConfig, sales, purchases, expenses, suppliers, supplierPayments, customers, products } = get();
		if (!sheetsConfig.enabled || !sheetsConfig.url) return {
			ok: false,
			error: "Google Sheets sync is not configured or disabled."
		};
		try {
			await writeSheet(sheetsConfig.url, "Mobiles_Sales", sales.map((s) => ({
				id: s.id,
				customerName: s.customerName,
				customerMobile: s.customerMobile,
				date: s.date,
				totalAmount: s.totalAmount,
				paymentMethod: s.paymentMethod,
				paymentStatus: s.paymentStatus,
				amountPaid: s.amountPaid,
				dueAmount: s.dueAmount
			})));
			await writeSheet(sheetsConfig.url, "Mobiles_Purchases", purchases.map((p) => ({
				id: p.id,
				supplierName: p.supplierName,
				invoiceNo: p.invoiceNo,
				date: p.date,
				quantity: p.quantity,
				amount: p.amount,
				status: p.status
			})));
			await writeSheet(sheetsConfig.url, "Mobiles_Expenses", expenses.map((e) => ({
				id: e.id,
				date: e.date,
				cat: e.cat,
				desc: e.desc,
				amount: e.amount,
				type: e.type ?? "Expense",
				paymentMode: e.paymentMode ?? "Cash"
			})));
			await writeSheet(sheetsConfig.url, "Mobiles_Suppliers", suppliers.map((s) => ({
				id: s.id,
				name: s.name,
				gstNo: s.gstNo,
				contact: s.contact,
				address: s.address,
				outstanding: s.outstanding
			})));
			await writeSheet(sheetsConfig.url, "Mobiles_SupplierPayments", supplierPayments.map((p) => ({
				id: p.id,
				supplierName: p.supplierName,
				amount: p.amount,
				date: p.date,
				remark: p.remark ?? ""
			})));
			await writeSheet(sheetsConfig.url, "Mobiles_Customers", customers.map((c) => ({
				id: c.id,
				name: c.name,
				mobile: c.mobile,
				email: c.email,
				address: c.address,
				registeredDate: c.registeredDate
			})));
			await writeSheet(sheetsConfig.url, "Mobiles_Products", products.map((p) => ({
				id: p.id,
				name: p.name,
				brand: p.brand,
				model: p.model,
				color: p.color,
				ramRom: p.ramRom,
				category: p.category,
				purchasePrice: p.purchasePrice,
				sellingPrice: p.sellingPrice ?? 0,
				status: p.status
			})));
			const ts = nowTimestamp();
			set((s) => ({ sheetsConfig: {
				...s.sheetsConfig,
				lastSync: ts
			} }));
			return { ok: true };
		} catch (err) {
			return {
				ok: false,
				error: err?.message || String(err)
			};
		}
	},
	loadFromSheets: async () => {
		const { sheetsConfig } = get();
		if (!sheetsConfig.enabled || !sheetsConfig.url) return {
			ok: false,
			error: "Google Sheets sync is not configured or disabled."
		};
		try {
			const [salesRows, expRows, supRows, supPayRows, custRows] = await Promise.all([
				readSheet(sheetsConfig.url, "Mobiles_Sales"),
				readSheet(sheetsConfig.url, "Mobiles_Expenses"),
				readSheet(sheetsConfig.url, "Mobiles_Suppliers"),
				readSheet(sheetsConfig.url, "Mobiles_SupplierPayments"),
				readSheet(sheetsConfig.url, "Mobiles_Customers")
			]);
			if (salesRows.length > 0) set({ sales: salesRows });
			if (expRows.length > 0) set({ expenses: expRows });
			if (supRows.length > 0) set({ suppliers: supRows });
			if (supPayRows.length > 0) set({ supplierPayments: supPayRows });
			if (custRows.length > 0) set({ customers: custRows });
			const ts = nowTimestamp();
			set((s) => ({ sheetsConfig: {
				...s.sheetsConfig,
				lastSync: ts
			} }));
			return { ok: true };
		} catch (err) {
			return {
				ok: false,
				error: err?.message || String(err)
			};
		}
	}
}), {
	name: "jain-mobiles-erp-v2",
	merge: (persistedState, currentState) => {
		const merged = {
			...currentState,
			...persistedState
		};
		merged.sheetsConfig = {
			...merged.sheetsConfig,
			url: PERMANENT_SHEETS_URL,
			enabled: true
		};
		return merged;
	}
}));
var _mobilesAutoSyncTimer = null;
var _lastMobSales = useMobileStore.getState().sales;
var _lastMobPurchases = useMobileStore.getState().purchases;
var _lastMobProducts = useMobileStore.getState().products;
var _lastMobExpenses = useMobileStore.getState().expenses;
var _lastMobSuppliers = useMobileStore.getState().suppliers;
var _lastMobCustomers = useMobileStore.getState().customers;
useMobileStore.subscribe((state) => {
	if (!state.sheetsConfig.enabled || !state.sheetsConfig.url) return;
	if (state.sales !== _lastMobSales || state.purchases !== _lastMobPurchases || state.products !== _lastMobProducts || state.expenses !== _lastMobExpenses || state.suppliers !== _lastMobSuppliers || state.customers !== _lastMobCustomers) {
		_lastMobSales = state.sales;
		_lastMobPurchases = state.purchases;
		_lastMobProducts = state.products;
		_lastMobExpenses = state.expenses;
		_lastMobSuppliers = state.suppliers;
		_lastMobCustomers = state.customers;
		if (_mobilesAutoSyncTimer) clearTimeout(_mobilesAutoSyncTimer);
		_mobilesAutoSyncTimer = setTimeout(() => {
			useMobileStore.getState().syncToSheets().catch(() => {});
		}, 3e3);
	}
});
//#endregion
export { useStore as _, DialogFooter as a, cn as c, downloadExcel as d, isDateInRange as f, useMobileStore as g, readSheet as h, DialogDescription as i, digestSheets as l, pingScript as m, Dialog as n, DialogHeader as o, parseAppDate as p, DialogContent as r, DialogTitle as s, AppDialogs as t, downloadCustomerStatementExcel as u, useUi as v };
