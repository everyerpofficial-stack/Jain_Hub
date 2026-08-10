import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { D as Plus, p as Trash2 } from "../_libs/lucide-react.mjs";
import { _ as useStore, f as isDateInRange, p as parseAppDate, v as useUi } from "./mobileStore-B8EWbC21.mjs";
import { a as SectionHeader, n as Badge, o as StatCard, r as Card, t as AppShell } from "./ui-kit-iW0nuj1I.mjs";
import { n as useDateFilter, t as FilterBar } from "./FilterBar-B1CYUr5_.mjs";
import { a as XAxis, c as CartesianGrid, d as Tooltip, i as YAxis, r as LineChart, s as Line, u as ResponsiveContainer } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/investments-4F6gLNzZ.js
var import_jsx_runtime = require_jsx_runtime();
function InvestmentsPage() {
	const investments = useStore((s) => s.investments);
	const customers = useStore((s) => s.customers);
	const payments = useStore((s) => s.payments);
	const deleteInvestment = useStore((s) => s.deleteInvestment);
	const currentUser = useStore((s) => s.currentUser);
	const { openDialog } = useUi();
	const { preset: filterPreset, setPreset: setFilterPreset, customStart, setCustomStart, customEnd, setCustomEnd, startDate, endDate } = useDateFilter();
	const filteredInvestments = investments.filter((i) => {
		return isDateInRange(parseAppDate(i.maturity), startDate, endDate);
	});
	const filteredCustomers = customers.filter((c) => {
		return isDateInRange(parseAppDate(c.billDate), startDate, endDate);
	});
	const total = filteredInvestments.reduce((sum, i) => sum + Number(i.amount.replace(/[^\d]/g, "")), 0);
	const balanceForEmi = filteredCustomers.reduce((s, c) => s + c.balanceForEmi, 0);
	filteredInvestments.length && (filteredInvestments.reduce((sum, i) => sum + parseFloat(i.roi), 0) / filteredInvestments.length).toFixed(1);
	const today = /* @__PURE__ */ new Date();
	const referenceYear = startDate ? startDate.getFullYear() : today.getFullYear() < 2026 ? 2026 : today.getFullYear();
	const growth = (() => {
		const data = [];
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
		const yearNum = referenceYear;
		for (let i = 0; i < 12; i++) {
			const monthLabel = months[i];
			const d = new Date(yearNum, i + 1, 0);
			const activeTotal = customers.filter((c) => {
				const cDate = parseAppDate(c.billDate);
				return !!cDate && cDate <= d && isDateInRange(cDate, startDate, endDate);
			}).reduce((sum, c) => sum + c.balanceForEmi, 0);
			data.push({
				m: monthLabel,
				v: Math.round(activeTotal / 1e3)
			});
		}
		return data;
	})();
	const totalDownpayments = customers.reduce((sum, c) => sum + c.deposit, 0);
	const totalFileCharges = customers.reduce((sum, c) => sum + c.fileCharge, 0);
	const custInterestMap = new Map(customers.map((c) => [c.id, c.interestPerMonth]));
	const totalInterestCollected = payments.filter((p) => p.status === "Success").reduce((sum, p) => sum + (custInterestMap.get(p.customerId) || 0), 0);
	const totalReceived = totalDownpayments + payments.filter((p) => p.status === "Success").reduce((sum, p) => sum + Number(p.amount.replace(/[^\d]/g, "")), 0);
	const netEarnings = totalFileCharges + totalInterestCollected;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		breadcrumb: "Investments",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3 mb-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-[26px] font-semibold tracking-tight",
					children: "Investment Portfolio"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted-foreground mt-1",
					children: [
						filteredInvestments.length,
						" investors · ₹",
						total.toLocaleString("en-IN"),
						" deployed"
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => openDialog("investment"),
					className: "h-9 px-4 rounded-md bg-foreground text-background text-sm font-semibold inline-flex items-center gap-1.5 hover:opacity-90 shadow transition-opacity",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" }), " Add Investment"]
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
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 sm:grid-cols-3 gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Financed Principal",
						value: `₹${balanceForEmi.toLocaleString("en-IN")}`,
						sub: `${filteredCustomers.length} active customer loans`,
						trend: "up"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Total Received (Returns)",
						value: `₹${totalReceived.toLocaleString("en-IN")}`,
						sub: "Downpayments & collections",
						trend: "up"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Net Financing Profit",
						value: `₹${netEarnings.toLocaleString("en-IN")}`,
						sub: "File charges & interest",
						trend: "up"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
					title: "Financing portfolio growth",
					action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted-foreground",
						children: "Full Year (₹ in thousands)"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "px-2 pb-4 h-[280px]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
							data: growth,
							margin: {
								top: 10,
								right: 16,
								left: 0,
								bottom: 0
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									stroke: "var(--border)",
									strokeDasharray: "3 3",
									vertical: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "m",
									tickLine: false,
									axisLine: false,
									fontSize: 11,
									stroke: "var(--muted-foreground)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									tickLine: false,
									axisLine: false,
									fontSize: 11,
									stroke: "var(--muted-foreground)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
									borderRadius: 8,
									border: "1px solid var(--border)",
									fontSize: 12
								} }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
									type: "monotone",
									dataKey: "v",
									stroke: "var(--success)",
									strokeWidth: 2.5,
									dot: {
										r: 3,
										fill: "var(--success)"
									}
								})
							]
						})
					})
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "mt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, { title: "Active investments" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-sm table-fixed min-w-[960px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left font-medium px-5 py-2.5 w-[90px]",
									children: "Ref"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left font-medium px-4 py-2.5 w-[120px]",
									children: "Date"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left font-medium px-4 py-2.5 w-[200px]",
									children: "Investor"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left font-medium px-4 py-2.5 w-[130px]",
									children: "Amount"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left font-medium px-4 py-2.5 w-[100px]",
									children: "ROI"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left font-medium px-4 py-2.5 w-[130px]",
									children: "Maturity"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left font-medium px-5 py-2.5 w-[110px]",
									children: "Status"
								}),
								currentUser?.role.toLowerCase() === "admin" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-right font-medium px-5 py-2.5 w-[80px]",
									children: "Actions"
								})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: filteredInvestments.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							colSpan: currentUser?.role.toLowerCase() === "admin" ? 8 : 7,
							className: "px-5 py-10 text-center text-muted-foreground",
							children: "No investments match these filters."
						}) }) : filteredInvestments.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-t border-border hover:bg-accent/40",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-5 py-3 font-medium w-[90px] truncate",
									children: i.id
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 text-muted-foreground w-[120px] truncate",
									children: i.date || "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 w-[200px] truncate",
									children: i.investor
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 font-medium w-[130px] truncate",
									children: i.amount
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 text-success font-medium w-[100px] truncate",
									children: i.roi
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 text-muted-foreground w-[130px] truncate",
									children: i.maturity
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-5 py-3 w-[110px]",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										tone: i.status === "Active" ? "success" : i.status === "Maturing" ? "warning" : "neutral",
										children: i.status
									})
								}),
								currentUser?.role.toLowerCase() === "admin" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-5 py-3 text-right w-[80px]",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => {
											if (confirm(`Are you sure you want to delete investment ${i.id} for ${i.investor}?`)) {
												deleteInvestment(i.id);
												toast.success(`Deleted investment ${i.id}`);
											}
										},
										className: "size-7 rounded border border-border inline-flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors text-muted-foreground",
										title: "Delete Investment",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" })
									})
								})
							]
						}, i.id)) })]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "mt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
					title: "Capital Deployment (Financed Customers)",
					action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-xs text-muted-foreground",
						children: [filteredCustomers.length, " active customer loans"]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-sm text-left",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border bg-muted/10",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3 px-5 font-semibold",
									children: "Cust ID"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3 px-4 font-semibold",
									children: "Customer Name"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3 px-4 font-semibold",
									children: "Village"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3 px-4 font-semibold",
									children: "Device Model"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3 px-4 font-semibold text-right",
									children: "Financed Principal"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3 px-4 font-semibold text-right",
									children: "Interest to Collect"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3 px-4 font-semibold text-right",
									children: "Interest Collected"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3 px-4 font-semibold text-right",
									children: "Outstanding Balance"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3 px-5 font-semibold",
									children: "Status"
								})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: filteredCustomers.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							colSpan: 9,
							className: "py-12 text-center text-muted-foreground font-medium",
							children: "No customer loans match the current filters."
						}) }) : filteredCustomers.map((c) => {
							const interestCollected = c.paidEmis * c.interestPerMonth;
							const interestRemaining = c.totalInterest - interestCollected;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-b border-border hover:bg-accent/40 cursor-pointer transition-colors last:border-0",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-3 px-5 font-mono text-xs text-muted-foreground",
										children: c.id
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-3 px-4 font-semibold text-foreground",
										children: c.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-3 px-4 text-muted-foreground",
										children: c.village
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "py-3 px-4 text-muted-foreground",
										children: [
											c.mobileBrand,
											" ",
											c.mobileModel
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "py-3 px-4 text-right font-semibold text-foreground",
										children: ["₹", c.balanceForEmi.toLocaleString("en-IN")]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "py-3 px-4 text-right font-medium text-warning",
										children: ["₹", interestRemaining.toLocaleString("en-IN")]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "py-3 px-4 text-right font-medium text-success",
										children: ["₹", interestCollected.toLocaleString("en-IN")]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "py-3 px-4 text-right font-bold text-danger",
										children: ["₹", c.pendingAmount.toLocaleString("en-IN")]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-3 px-5",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											tone: c.status === "Active" ? "success" : c.status === "Overdue" ? "warning" : c.status === "Defaulted" ? "danger" : "neutral",
											children: c.status
										})
									})
								]
							}, c.id);
						}) })]
					})
				})]
			})
		]
	});
}
//#endregion
export { InvestmentsPage as component };
