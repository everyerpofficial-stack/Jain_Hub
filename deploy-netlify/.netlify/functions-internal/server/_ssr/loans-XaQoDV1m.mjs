import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { C as Search, D as Plus, Z as Download, p as Trash2 } from "../_libs/lucide-react.mjs";
import { _ as useStore, d as downloadExcel, f as isDateInRange, p as parseAppDate, v as useUi } from "./mobileStore-B8EWbC21.mjs";
import { a as SectionHeader, n as Badge, r as Card, t as AppShell } from "./ui-kit-iW0nuj1I.mjs";
import { n as useDateFilter, t as FilterBar } from "./FilterBar-B1CYUr5_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/loans-XaQoDV1m.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STATUS_FILTERS = [
	"All",
	"Active",
	"Overdue",
	"Completed",
	"Defaulted"
];
function LoansPage() {
	const loans = useStore((s) => s.loans);
	const customers = useStore((s) => s.customers);
	const deleteLoan = useStore((s) => s.deleteLoan);
	const currentUser = useStore((s) => s.currentUser);
	const { openDialog } = useUi();
	const [q, setQ] = (0, import_react.useState)("");
	const [statusFilter, setStatusFilter] = (0, import_react.useState)("All");
	const { preset: filterPreset, setPreset: setFilterPreset, customStart, setCustomStart, customEnd, setCustomEnd, startDate, endDate } = useDateFilter();
	const custMap = new Map(customers.map((c) => [c.name, c.billDate]));
	const tone = (s) => s === "Active" ? "success" : s === "Overdue" ? "warning" : s === "Defaulted" ? "danger" : "neutral";
	const filtered = loans.filter((l) => {
		if (statusFilter !== "All" && l.status !== statusFilter) return false;
		const bDateStr = custMap.get(l.customer);
		if (bDateStr) {
			if (!isDateInRange(parseAppDate(bDateStr), startDate, endDate)) return false;
		}
		if (q) {
			const n = q.toLowerCase();
			return [
				l.id,
				l.customer,
				l.product
			].some((v) => v.toLowerCase().includes(n));
		}
		return true;
	});
	const outstanding = filtered.filter((l) => l.status === "Active" || l.status === "Overdue").reduce((sum, l) => sum + Number(l.amount.replace(/[^\d]/g, "")), 0);
	const active = filtered.filter((l) => l.status === "Active").length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		breadcrumb: "Loans",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3 mb-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-[26px] font-semibold tracking-tight",
					children: "Loan Management"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted-foreground mt-1",
					children: [
						active,
						" active loans · ₹",
						outstanding.toLocaleString("en-IN"),
						" outstanding"
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => {
							downloadExcel("loans.xlsx", "Loans", filtered);
							toast.success(`Exported ${filtered.length} loans`);
						},
						className: "h-9 px-3 rounded-md border border-border bg-surface text-sm inline-flex items-center gap-1.5 hover:bg-accent",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-3.5" }), " Export"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => openDialog("loan"),
						className: "h-9 px-3 rounded-md bg-foreground text-background text-sm font-medium inline-flex items-center gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" }), " New Loan"]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterBar, {
				preset: filterPreset,
				onChangePreset: setFilterPreset,
				customStart,
				onChangeStart: setCustomStart,
				customEnd,
				onChangeEnd: setCustomEnd,
				startDate,
				endDate
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-4 border-b border-border flex flex-wrap items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative flex-1 min-w-[240px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: q,
							onChange: (e) => setQ(e.target.value),
							placeholder: "Search by loan ID, customer, product…",
							className: "h-9 w-full rounded-md border border-border bg-background pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
						})]
					}), STATUS_FILTERS.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setStatusFilter(f),
						className: `h-9 px-3 rounded-md border text-sm transition-colors ${statusFilter === f ? "bg-foreground text-background border-foreground" : "border-border bg-surface hover:bg-accent"}`,
						children: f
					}, f))]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
					title: `${filtered.length} loan${filtered.length !== 1 ? "s" : ""}`,
					action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted-foreground",
						children: "Updated just now"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-sm table-fixed min-w-[1020px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left font-medium px-5 py-2.5 w-[100px]",
									children: "Loan"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left font-medium py-2.5 w-[160px]",
									children: "Customer"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left font-medium py-2.5 w-[160px]",
									children: "Product"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left font-medium py-2.5 w-[110px]",
									children: "Amount"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left font-medium py-2.5 w-[110px]",
									children: "Deposit"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left font-medium py-2.5 w-[110px]",
									children: "EMI"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left font-medium py-2.5 w-[90px]",
									children: "Duration"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left font-medium py-2.5 w-[90px]",
									children: "Interest"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left font-medium py-2.5 px-5 w-[110px]",
									children: "Status"
								}),
								currentUser?.role.toLowerCase() === "admin" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-right font-medium px-5 py-2.5 w-[80px]",
									children: "Actions"
								})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							colSpan: currentUser?.role.toLowerCase() === "admin" ? 10 : 9,
							className: "px-5 py-10 text-center text-muted-foreground text-sm",
							children: "No loans match these filters."
						}) }) : filtered.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-t border-border hover:bg-accent/40 cursor-pointer",
							onClick: () => toast.message(l.id, { description: `${l.customer} · ${l.product} · ${l.amount} @ ${l.interest}` }),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-5 py-3 font-medium text-xs w-[100px] truncate",
									children: l.id
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-3 w-[160px] truncate",
									children: l.customer
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-3 text-muted-foreground w-[160px] truncate",
									children: l.product
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-3 font-medium w-[110px] truncate",
									children: l.amount
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-3 text-muted-foreground w-[110px] truncate",
									children: l.deposit
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-3 w-[110px] truncate",
									children: l.emi
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-3 text-muted-foreground w-[90px] truncate",
									children: l.duration
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-3 w-[90px] truncate",
									children: l.interest
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-5 py-3 w-[110px]",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										tone: tone(l.status),
										children: l.status
									})
								}),
								currentUser?.role.toLowerCase() === "admin" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-5 py-3 text-right w-[80px]",
									onClick: (e) => e.stopPropagation(),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => {
											if (confirm(`Are you sure you want to delete loan ${l.id} for ${l.customer}?`)) {
												deleteLoan(l.id);
												toast.success(`Deleted loan ${l.id}`);
											}
										},
										className: "size-7 rounded border border-border inline-flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors text-muted-foreground",
										title: "Delete Loan",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" })
									})
								})
							]
						}, l.id)) })]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "px-5 py-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						"Showing ",
						filtered.length,
						" of ",
						loans.length,
						" loans"
					] })
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 md:grid-cols-4 gap-4 mt-6",
				children: [
					"Active",
					"Overdue",
					"Completed",
					"Defaulted"
				].map((s) => {
					const filteredByStatus = loans.filter((l) => l.status === s);
					const total = filteredByStatus.reduce((sum, l) => sum + Number(l.amount.replace(/[^\d]/g, "")), 0);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-5 cursor-pointer hover:shadow-sm transition-shadow",
						onClick: () => setStatusFilter(s),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between mb-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xs text-muted-foreground",
									children: [s, " loans"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: s === "Active" ? "success" : s === "Overdue" ? "warning" : s === "Defaulted" ? "danger" : "neutral",
									children: s
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1 text-2xl font-semibold tracking-tight",
								children: filteredByStatus.length
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1 text-xs text-muted-foreground",
								children: [
									"₹",
									total.toLocaleString("en-IN"),
									" principal"
								]
							})
						]
					}, s);
				})
			})
		]
	});
}
//#endregion
export { LoansPage as component };
