import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { C as Search, E as Printer, Z as Download, p as Trash2 } from "../_libs/lucide-react.mjs";
import { _ as useStore, d as downloadExcel, f as isDateInRange, p as parseAppDate } from "./mobileStore-B8EWbC21.mjs";
import { n as Badge, o as StatCard, r as Card, t as AppShell } from "./ui-kit-iW0nuj1I.mjs";
import { n as useDateFilter, t as FilterBar } from "./FilterBar-B1CYUr5_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/payments-BDYfg7rn.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PaymentsPage() {
	const payments = useStore((s) => s.payments);
	const deletePayment = useStore((s) => s.deletePayment);
	const currentUser = useStore((s) => s.currentUser);
	const [q, setQ] = (0, import_react.useState)("");
	const [method, setMethod] = (0, import_react.useState)("All methods");
	const [collector, setCollector] = (0, import_react.useState)("All collectors");
	const [status, setStatus] = (0, import_react.useState)("All status");
	const { preset: filterPreset, setPreset: setFilterPreset, customStart, setCustomStart, customEnd, setCustomEnd, startDate, endDate } = useDateFilter();
	const collectors = ["All collectors", ...Array.from(new Set(payments.map((p) => p.collector)))];
	const filtered = payments.filter((p) => {
		if (method !== "All methods" && p.method !== method) return false;
		if (collector !== "All collectors" && p.collector !== collector) return false;
		if (status !== "All status" && p.status !== status) return false;
		if (!isDateInRange(parseAppDate(p.date), startDate, endDate)) return false;
		if (q) {
			const needle = q.toLowerCase();
			return [
				p.id,
				p.customer,
				p.collector
			].some((v) => v.toLowerCase().includes(needle));
		}
		return true;
	});
	payments.filter((p) => p.status === "Success").reduce((sum, p) => sum + Number(p.amount.replace(/[^\d]/g, "")), 0);
	const filteredTotal = filtered.filter((p) => p.status === "Success").reduce((sum, p) => sum + Number(p.amount.replace(/[^\d]/g, "")), 0);
	const byMethod = ["Cash", "UPI"].map((m) => ({
		method: m,
		count: filtered.filter((p) => p.method === m && p.status === "Success").length,
		amount: filtered.filter((p) => p.method === m && p.status === "Success").reduce((s, p) => s + Number(p.amount.replace(/[^\d]/g, "")), 0)
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		breadcrumb: "Payments",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3 mb-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-[26px] font-semibold tracking-tight",
					children: "Payment History"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted-foreground mt-1",
					children: [
						filtered.length,
						" payments · ₹",
						filteredTotal.toLocaleString("en-IN"),
						" collected"
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2 print:hidden",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => {
							window.print();
							toast.success("Print dialog opened");
						},
						className: "h-9 px-3.5 rounded-md border border-border bg-surface text-sm inline-flex items-center gap-1.5 hover:bg-accent font-semibold transition-colors shadow-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Printer, { className: "size-3.5" }), " Print"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => {
							downloadExcel("payments.xlsx", "Payments", filtered);
							toast.success(`Exported ${filtered.length} payments`);
						},
						className: "h-9 px-4 rounded-md bg-foreground text-background text-sm font-semibold inline-flex items-center gap-1.5 hover:opacity-90 shadow transition-opacity",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-3.5" }), " Export Excel"]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "print:hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterBar, {
					preset: filterPreset,
					onChangePreset: setFilterPreset,
					customStart,
					onChangeStart: setCustomStart,
					customEnd,
					onChangeEnd: setCustomEnd,
					startDate,
					endDate
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 print:hidden",
				children: byMethod.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
					label: `${b.method} payments`,
					value: `₹${b.amount.toLocaleString("en-IN")}`,
					sub: `${b.count} transactions`
				}, b.method))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-4 border-b border-border flex flex-wrap items-center gap-2 print:hidden",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative flex-1 min-w-[200px]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: q,
								onChange: (e) => setQ(e.target.value),
								placeholder: "Search by customer, txn id, collector…",
								className: "h-9 w-full rounded-md border border-border bg-background pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: method,
							onChange: (e) => setMethod(e.target.value),
							className: "h-9 rounded-md border border-border bg-surface px-3 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "All methods" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Cash" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "UPI" })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							value: collector,
							onChange: (e) => setCollector(e.target.value),
							className: "h-9 rounded-md border border-border bg-surface px-3 text-sm",
							children: collectors.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: c }, c))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: status,
							onChange: (e) => setStatus(e.target.value),
							className: "h-9 rounded-md border border-border bg-surface px-3 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "All status" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Success" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Refunded" })
							]
						}),
						(q || method !== "All methods" || collector !== "All collectors" || status !== "All status") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => {
								setQ("");
								setMethod("All methods");
								setCollector("All collectors");
								setStatus("All status");
							},
							className: "h-9 px-3 rounded-md border border-border text-sm text-muted-foreground hover:bg-accent",
							children: "Clear filters"
						})
					]
				}),
				filtered.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-5 py-2.5 border-b border-border flex items-center justify-between text-xs text-muted-foreground bg-muted/30 print:hidden",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						filtered.length,
						" result",
						filtered.length !== 1 ? "s" : ""
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-medium text-foreground",
						children: [
							"₹",
							filteredTotal.toLocaleString("en-IN"),
							" total"
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-sm table-fixed min-w-[1000px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left font-medium px-5 py-2.5 w-[100px]",
									children: "Txn"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left font-medium px-4 py-2.5 w-[200px]",
									children: "Customer"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left font-medium px-4 py-2.5 w-[130px]",
									children: "Date"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left font-medium px-4 py-2.5 w-[110px]",
									children: "Method"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left font-medium px-4 py-2.5 w-[130px]",
									children: "Collector"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-right font-medium px-4 py-2.5 w-[120px]",
									children: "Amount paid"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-right font-medium px-4 py-2.5 w-[120px]",
									children: "Pending"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left font-medium px-5 py-2.5 w-[110px]",
									children: "Status"
								}),
								currentUser?.role.toLowerCase() === "admin" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-right font-medium px-5 py-2.5 w-[80px] print:hidden",
									children: "Actions"
								})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							colSpan: currentUser?.role.toLowerCase() === "admin" ? 9 : 8,
							className: "px-5 py-10 text-center text-muted-foreground",
							children: "No payments match."
						}) }) : filtered.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-t border-border hover:bg-accent/40",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-5 py-3 font-medium text-xs w-[100px] truncate",
									children: p.id
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 w-[200px] truncate",
									children: p.customer
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 text-muted-foreground w-[130px] truncate",
									children: p.date
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 w-[110px] truncate",
									children: p.method
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 text-muted-foreground w-[130px] truncate",
									children: p.collector
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 text-right font-medium w-[120px] truncate",
									children: p.amount
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 text-right text-muted-foreground w-[120px] truncate",
									children: p.pending
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-5 py-3 w-[110px]",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										tone: p.status === "Success" ? "success" : "danger",
										children: p.status
									})
								}),
								currentUser?.role.toLowerCase() === "admin" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-5 py-3 text-right w-[80px] print:hidden",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => {
											if (confirm(`Are you sure you want to delete payment ${p.id} of ${p.amount} from ${p.customer}? This will revert the payment EMI count for this customer.`)) {
												deletePayment(p.id);
												toast.success(`Deleted payment ${p.id}`);
											}
										},
										className: "size-7 rounded border border-border inline-flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors text-muted-foreground",
										title: "Delete Payment",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" })
									})
								})
							]
						}, p.id)) })]
					})
				})
			] })
		]
	});
}
//#endregion
export { PaymentsPage as component };
