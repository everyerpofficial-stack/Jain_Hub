import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { D as Plus, Z as Download, p as Trash2 } from "../_libs/lucide-react.mjs";
import { a as DialogFooter, d as downloadExcel, f as isDateInRange, g as useMobileStore, i as DialogDescription, n as Dialog, o as DialogHeader, p as parseAppDate, r as DialogContent, s as DialogTitle } from "./mobileStore-B8EWbC21.mjs";
import { a as SectionHeader, i as ProgressBar, n as Badge, o as StatCard, r as Card, t as AppShell } from "./ui-kit-iW0nuj1I.mjs";
import { n as useDateFilter, t as FilterBar } from "./FilterBar-B1CYUr5_.mjs";
import { a as XAxis, c as CartesianGrid, d as Tooltip, i as YAxis, l as Bar, n as BarChart, u as ResponsiveContainer } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/expenses-Ci0OiAi4.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ExpenseFormDialog({ onClose }) {
	const addExpense = useMobileStore((s) => s.addExpense);
	const [type, setType] = (0, import_react.useState)("Expense");
	const EXPENSE_CATEGORIES = [
		"Shop Rent",
		"Electricity",
		"Salary",
		"Tea & Snacks",
		"Utilities",
		"Marketing",
		"Other Expense"
	];
	const INCOME_CATEGORIES = [
		"Accessories Income",
		"Repair Income",
		"Device Sales Income",
		"Other Income"
	];
	const getTodayYmd = () => {
		const d = /* @__PURE__ */ new Date();
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
	};
	const [cat, setCat] = (0, import_react.useState)("Shop Rent");
	const [desc, setDesc] = (0, import_react.useState)("");
	const [amount, setAmount] = (0, import_react.useState)("");
	const [paymentMode, setPaymentMode] = (0, import_react.useState)("Cash");
	const [date, setDate] = (0, import_react.useState)(getTodayYmd());
	(0, import_react.useEffect)(() => {
		setCat(type === "Expense" ? "Shop Rent" : "Accessories Income");
	}, [type]);
	const canSubmit = cat && amount && desc.trim() && date;
	const handleSave = () => {
		addExpense({
			cat,
			desc: desc.trim(),
			amount,
			type,
			paymentMode,
			date
		});
		toast.success(`${type} entry recorded successfully`);
		onClose();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: true,
		onOpenChange: (open) => !open && onClose(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-sm rounded-xl border border-border shadow-2xl p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
					className: "border-b border-border pb-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
						className: "text-base font-bold",
						children: "Add Income / Expense Entry"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
						className: "text-xs text-muted-foreground",
						children: "Record a cash transaction against the mobile shop."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "py-4 space-y-3.5 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-semibold text-muted-foreground",
								children: "Entry Date"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "date",
								value: date,
								onChange: (e) => setDate(e.target.value),
								className: "mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-semibold text-muted-foreground",
								children: "Entry Type"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: type,
								onChange: (e) => setType(e.target.value),
								className: "mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "Expense",
									children: "Expense"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "Income",
									children: "Income"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-semibold text-muted-foreground",
								children: "Category"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								value: cat,
								onChange: (e) => setCat(e.target.value),
								className: "mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none",
								children: (type === "Expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: c,
									children: c
								}, c))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-semibold text-muted-foreground",
								children: "Payment Mode"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: paymentMode,
								onChange: (e) => setPaymentMode(e.target.value),
								className: "mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "Cash",
									children: "Cash"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "UPI",
									children: "UPI"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-semibold text-muted-foreground",
								children: "Amount (₹)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "number",
								value: amount,
								onChange: (e) => setAmount(e.target.value),
								placeholder: "1000",
								className: "mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-semibold text-muted-foreground",
								children: "Description"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: desc,
								onChange: (e) => setDesc(e.target.value),
								placeholder: "e.g. Shop assistant boy tea bill, counter accessories sale...",
								className: "mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
					className: "border-t border-border pt-4 flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onClose,
						className: "h-9 px-3.5 rounded-md border border-border bg-surface text-sm hover:bg-accent transition-colors",
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						disabled: !canSubmit,
						onClick: handleSave,
						className: "h-9 px-4 rounded-md bg-foreground text-background text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all ml-auto",
						children: "Save Entry"
					})]
				})
			]
		})
	});
}
var CATEGORY_COLORS = {
	"Shop Rent": "var(--danger)",
	"Electricity": "var(--info)",
	"Salary": "var(--foreground)",
	"Tea & Snacks": "var(--warning)",
	"Utilities": "var(--success)",
	"Accessories Income": "var(--success)",
	"Repair Income": "var(--info)"
};
function MobilesExpensesPage() {
	const expenses = useMobileStore((s) => s.expenses);
	const deleteExpense = useMobileStore((s) => s.deleteExpense);
	const [showAddDialog, setShowAddDialog] = (0, import_react.useState)(false);
	const { preset: filterPreset, setPreset: setFilterPreset, customStart, setCustomStart, customEnd, setCustomEnd, startDate, endDate } = useDateFilter();
	const filteredEntries = expenses.filter((e) => {
		return isDateInRange(parseAppDate(e.date), startDate, endDate);
	});
	const isIncome = (e) => e.type === "Income";
	const totalIncome = filteredEntries.filter(isIncome).reduce((sum, e) => sum + Number(e.amount.replace(/[^\d]/g, "")), 0);
	const totalExpenses = filteredEntries.filter((e) => !isIncome(e)).reduce((sum, e) => sum + Number(e.amount.replace(/[^\d]/g, "")), 0);
	const netBalance = totalIncome - totalExpenses;
	const incomeByCat = Object.entries(filteredEntries.filter(isIncome).reduce((acc, e) => {
		acc[e.cat] = (acc[e.cat] || 0) + Number(e.amount.replace(/[^\d]/g, ""));
		return acc;
	}, {})).sort((a, b) => b[1] - a[1]);
	const expenseByCat = Object.entries(filteredEntries.filter((e) => !isIncome(e)).reduce((acc, e) => {
		acc[e.cat] = (acc[e.cat] || 0) + Number(e.amount.replace(/[^\d]/g, ""));
		return acc;
	}, {})).sort((a, b) => b[1] - a[1]);
	const today = /* @__PURE__ */ new Date();
	const referenceYear = startDate ? startDate.getFullYear() : today.getFullYear() < 2026 ? 2026 : today.getFullYear();
	const monthlyData = (() => {
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
		const yearStr = referenceYear.toString();
		for (let i = 0; i < 12; i++) {
			const monthLabel = months[i];
			const monthIncome = expenses.filter((e) => {
				const dateLower = e.date.toLowerCase();
				const pDate = parseAppDate(e.date);
				return isIncome(e) && dateLower.includes(monthLabel.toLowerCase()) && dateLower.includes(yearStr) && isDateInRange(pDate, startDate, endDate);
			}).reduce((sum, e) => sum + Number(e.amount.replace(/[^\d]/g, "")), 0);
			const monthExpense = expenses.filter((e) => {
				const dateLower = e.date.toLowerCase();
				const pDate = parseAppDate(e.date);
				return !isIncome(e) && dateLower.includes(monthLabel.toLowerCase()) && dateLower.includes(yearStr) && isDateInRange(pDate, startDate, endDate);
			}).reduce((sum, e) => sum + Number(e.amount.replace(/[^\d]/g, "")), 0);
			data.push({
				m: monthLabel,
				income: Math.round(monthIncome / 1e3),
				expense: Math.round(monthExpense / 1e3)
			});
		}
		return data;
	})();
	const yearStr = referenceYear.toString();
	const ytdNet = expenses.filter((e) => {
		const dateLower = e.date.toLowerCase();
		const pDate = parseAppDate(e.date);
		return isIncome(e) && dateLower.includes(yearStr) && isDateInRange(pDate, startDate, endDate);
	}).reduce((sum, e) => sum + Number(e.amount.replace(/[^\d]/g, "")), 0) - expenses.filter((e) => {
		const dateLower = e.date.toLowerCase();
		const pDate = parseAppDate(e.date);
		return !isIncome(e) && dateLower.includes(yearStr) && isDateInRange(pDate, startDate, endDate);
	}).reduce((sum, e) => sum + Number(e.amount.replace(/[^\d]/g, "")), 0);
	const ytdNetStr = `${ytdNet >= 0 ? "+" : "-"}₹${Math.abs(ytdNet) >= 1e5 ? `${(Math.abs(ytdNet) / 1e5).toFixed(2)} L` : Math.abs(ytdNet).toLocaleString("en-IN")}`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		breadcrumb: "Income & Expenses",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3 mb-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-[26px] font-semibold tracking-tight",
					children: "Income & Expenses Ledger"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted-foreground mt-1",
					children: [
						incomeByCat.length + expenseByCat.length,
						" categories · ",
						filteredEntries.length,
						" transaction entries"
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => {
							downloadExcel("mobile-expenses.xlsx", "Income & Expenses", filteredEntries.map((e) => ({
								Reference: e.id,
								Date: e.date,
								Type: e.type || "Expense",
								"Payment Mode": e.paymentMode || "Cash",
								Category: e.cat,
								Description: e.desc,
								Amount: e.amount
							})));
							toast.success("Income & Expenses exported to Excel");
						},
						className: "h-9 px-3.5 rounded-md border border-border bg-surface text-sm inline-flex items-center gap-1.5 hover:bg-accent font-semibold transition-colors shadow-sm cursor-pointer",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-3.5" }), " Export Excel"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setShowAddDialog(true),
						className: "h-9 px-4 rounded-md bg-foreground text-background text-sm font-semibold inline-flex items-center gap-1.5 hover:opacity-90 shadow transition-opacity cursor-pointer",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" }), " Add Income / Expense"]
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
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Total Income",
						value: `₹${totalIncome.toLocaleString("en-IN")}`,
						sub: "Period cash inflow",
						trend: "up"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Total Expenses",
						value: `₹${totalExpenses.toLocaleString("en-IN")}`,
						sub: "Period cash outflow",
						trend: totalExpenses > 0 ? "warn" : void 0
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Net Balance",
						value: `${netBalance >= 0 ? "+" : ""}₹${netBalance.toLocaleString("en-IN")}`,
						sub: "Inflow - Outflow",
						trend: netBalance >= 0 ? "up" : "down"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "YTD Net Cash",
						value: ytdNetStr,
						sub: `Net total for year ${referenceYear}`,
						trend: ytdNet >= 0 ? "up" : "down"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "lg:col-span-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
						title: "Monthly income vs expense",
						action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted-foreground",
							children: "Full Year (₹ in thousands)"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "px-2 pb-4 h-[260px]",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: "100%",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
								data: monthlyData,
								margin: {
									top: 10,
									right: 16,
									left: -10,
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
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
										dataKey: "income",
										fill: "oklch(0.62 0.15 160)",
										radius: [
											4,
											4,
											0,
											0
										],
										name: "Income"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
										dataKey: "expense",
										fill: "oklch(0.63 0.14 0)",
										radius: [
											4,
											4,
											0,
											0
										],
										name: "Expense"
									})
								]
							})
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "p-5 flex flex-col justify-between",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, { title: "By category" }),
							incomeByCat.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[10px] uppercase font-bold tracking-wider text-success mb-2",
								children: "Income Streams"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "space-y-2.5",
								children: incomeByCat.map(([name, spent]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between text-xs mb-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium",
										children: name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-muted-foreground",
										children: ["₹", spent.toLocaleString("en-IN")]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProgressBar, {
									value: totalIncome ? Math.round(spent / totalIncome * 100) : 0,
									color: CATEGORY_COLORS[name] ?? "var(--success)"
								})] }, name))
							})] }),
							expenseByCat.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: incomeByCat.length > 0 ? "pt-3 border-t border-border/60" : "",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[10px] uppercase font-bold tracking-wider text-danger mb-2",
									children: "Expenses Breakdown"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "space-y-2.5",
									children: expenseByCat.map(([name, spent]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between text-xs mb-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-medium",
											children: name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-muted-foreground",
											children: ["₹", spent.toLocaleString("en-IN")]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProgressBar, {
										value: totalExpenses ? Math.round(spent / totalExpenses * 100) : 0,
										color: CATEGORY_COLORS[name] ?? "var(--danger)"
									})] }, name))
								})]
							}),
							incomeByCat.length === 0 && expenseByCat.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-muted-foreground text-center py-6",
								children: "No data available for the period"
							})
						]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "mt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
					title: "Recent entries",
					action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted-foreground",
						children: "All transactions"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "text-[11px] uppercase tracking-wider text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left font-medium px-5 py-2.5",
								children: "Reference"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left font-medium px-4 py-2.5",
								children: "Date"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left font-medium px-4 py-2.5",
								children: "Type"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left font-medium px-4 py-2.5",
								children: "Payment Mode"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left font-medium px-4 py-2.5",
								children: "Category"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left font-medium px-4 py-2.5",
								children: "Description"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-right font-medium px-5 py-2.5",
								children: "Amount"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-right font-medium px-5 py-2.5",
								children: "Running Balance"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-right font-medium px-5 py-2.5",
								children: "Actions"
							})
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: filteredEntries.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						colSpan: 9,
						className: "px-5 py-10 text-center text-muted-foreground",
						children: "No entries match these filters."
					}) }) : (() => {
						let runningSum = 0;
						return filteredEntries.map((e) => {
							const amt = Number(e.amount.replace(/[^\d]/g, ""));
							if (e.type === "Income") runningSum += amt;
							else runningSum -= amt;
							return {
								...e,
								runningBalance: runningSum
							};
						}).map((e) => {
							const entryIsIncome = isIncome(e);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-t border-border",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-5 py-3 font-medium",
										children: e.id
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3 text-muted-foreground",
										children: e.date
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											tone: entryIsIncome ? "success" : "neutral",
											children: entryIsIncome ? "Income" : "Expense"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3 text-xs text-muted-foreground font-semibold",
										children: e.paymentMode || "Cash"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3",
										children: e.cat
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3 text-muted-foreground",
										children: e.desc
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: `px-5 py-3 text-right font-semibold ${entryIsIncome ? "text-success font-bold" : "text-foreground"}`,
										children: entryIsIncome ? `+ ₹${Number(e.amount.replace(/[^\d]/g, "")).toLocaleString("en-IN")}` : `- ₹${Number(e.amount.replace(/[^\d]/g, "")).toLocaleString("en-IN")}`
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: `px-5 py-3 text-right font-semibold text-xs ${e.runningBalance >= 0 ? "text-success" : "text-danger"}`,
										children: [
											e.runningBalance >= 0 ? "+" : "",
											"₹",
											e.runningBalance.toLocaleString("en-IN")
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-5 py-3 text-right",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => {
												if (confirm(`Are you sure you want to delete entry ${e.id} for ${e.amount}?`)) {
													deleteExpense(e.id);
													toast.success(`Deleted ledger entry ${e.id}`);
												}
											},
											className: "size-7 rounded border border-border inline-flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors text-muted-foreground cursor-pointer",
											title: "Delete Entry",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" })
										})
									})
								]
							}, e.id);
						});
					})() })]
				})]
			}),
			showAddDialog && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExpenseFormDialog, { onClose: () => setShowAddDialog(false) })
		]
	});
}
//#endregion
export { MobilesExpensesPage as component };
