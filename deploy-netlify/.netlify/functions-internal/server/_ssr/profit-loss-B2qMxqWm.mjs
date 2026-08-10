import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { Z as Download, d as TrendingDown, u as TrendingUp } from "../_libs/lucide-react.mjs";
import { _ as useStore, d as downloadExcel, f as isDateInRange, p as parseAppDate } from "./mobileStore-B8EWbC21.mjs";
import { a as SectionHeader, r as Card, t as AppShell } from "./ui-kit-iW0nuj1I.mjs";
import { n as useDateFilter, t as FilterBar } from "./FilterBar-B1CYUr5_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/profit-loss-B2qMxqWm.js
var import_jsx_runtime = require_jsx_runtime();
function FigureBox({ label, value, sub, accent }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex-1 min-w-[150px] rounded-xl border border-border bg-surface p-5 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: `text-2xl font-bold tracking-tight ${accent === "profit" ? "text-success" : accent === "loss" ? "text-danger" : "text-foreground"}`,
				children: value
			}),
			sub && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-xs text-muted-foreground mt-1",
				children: sub
			})
		]
	});
}
function Row({ label, value, bold, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `flex items-center justify-between px-5 py-3 text-sm border-t border-border ${bold ? "bg-muted/20" : ""}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: bold ? "font-semibold" : "text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: `font-medium ${bold ? "text-base font-bold" : ""} ${tone === "success" ? "text-success" : tone === "danger" ? "text-danger" : tone === "warning" ? "text-warning" : ""}`,
			children: value
		})]
	});
}
function ProfitLossPage() {
	const customers = useStore((s) => s.customers);
	const expenses = useStore((s) => s.expenses);
	const investments = useStore((s) => s.investments);
	const payments = useStore((s) => s.payments);
	const { preset: filterPreset, setPreset: setFilterPreset, customStart, setCustomStart, customEnd, setCustomEnd, startDate, endDate } = useDateFilter();
	const filteredCustomers = customers.filter((c) => {
		return isDateInRange(parseAppDate(c.billDate), startDate, endDate);
	});
	const filteredExpenses = expenses.filter((e) => {
		return isDateInRange(parseAppDate(e.date), startDate, endDate);
	});
	const filteredInvestments = investments.filter((i) => {
		return isDateInRange(parseAppDate(i.maturity), startDate, endDate);
	});
	const filteredPayments = payments.filter((p) => {
		return isDateInRange(parseAppDate(p.date), startDate, endDate);
	});
	const totalFileCharge = filteredCustomers.reduce((s, c) => s + c.fileCharge, 0);
	const custInterestMap = new Map(customers.map((c) => [c.id, c.interestPerMonth]));
	const totalInterestIncome = filteredPayments.filter((p) => p.status === "Success").reduce((sum, p) => sum + (custInterestMap.get(p.customerId) || 0), 0);
	const collectedInterest = totalInterestIncome;
	const pendingInterest = filteredCustomers.reduce((s, c) => s + c.pendingEmis * c.interestPerMonth, 0);
	const grossProfit = totalFileCharge + totalInterestIncome;
	const totalExpenses = filteredExpenses.reduce((s, e) => s + Number(e.amount.replace(/[^\d]/g, "")), 0);
	const netProfit = grossProfit - totalExpenses;
	filteredInvestments.reduce((s, i) => s + Number(i.amount.replace(/[^\d]/g, "")), 0);
	filteredCustomers.reduce((s, c) => s + c.balanceForEmi, 0);
	const expByCategory = filteredExpenses.reduce((acc, e) => {
		acc[e.cat] = (acc[e.cat] || 0) + Number(e.amount.replace(/[^\d]/g, ""));
		return acc;
	}, {});
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
			const revenue = customers.filter((c) => {
				const dateLower = c.billDate.toLowerCase();
				const pDate = parseAppDate(c.billDate);
				return dateLower.includes(monthLabel.toLowerCase()) && dateLower.includes(yearStr) && isDateInRange(pDate, startDate, endDate);
			}).reduce((sum, c) => sum + c.fileCharge, 0) + payments.filter((p) => {
				const dateLower = p.date.toLowerCase();
				const pDate = parseAppDate(p.date);
				return dateLower.includes(monthLabel.toLowerCase()) && dateLower.includes(yearStr) && p.status === "Success" && isDateInRange(pDate, startDate, endDate);
			}).reduce((sum, p) => {
				return sum + (custInterestMap.get(p.customerId) || 0);
			}, 0);
			const expense = expenses.filter((e) => {
				const dateLower = e.date.toLowerCase();
				const pDate = parseAppDate(e.date);
				return dateLower.includes(monthLabel.toLowerCase()) && dateLower.includes(yearStr) && isDateInRange(pDate, startDate, endDate);
			}).reduce((sum, e) => sum + Number(e.amount.replace(/[^\d]/g, "")), 0);
			data.push({
				month: `${monthLabel} ${yearStr}`,
				revenue,
				expense,
				profit: revenue - expense
			});
		}
		return data;
	})();
	const fmt = (n) => "₹" + Math.round(n).toLocaleString("en-IN");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		breadcrumb: "Profit & Loss",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3 mb-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-[26px] font-semibold tracking-tight",
					children: "Profit & Loss Report"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted-foreground mt-1",
					children: [
						"Mobile phone EMI finance · ",
						filteredCustomers.length,
						" customers · ",
						filteredCustomers.filter((c) => c.status === "Active").length,
						" active"
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => {
						downloadExcel("profit-loss.xlsx", "Profit & Loss", [
							{
								Item: "File Charge Income",
								Amount: fmt(totalFileCharge)
							},
							{
								Item: "Interest Income (Realised)",
								Amount: fmt(totalInterestIncome)
							},
							{
								Item: "Gross Profit",
								Amount: fmt(grossProfit)
							},
							{
								Item: "Total Expenses",
								Amount: fmt(totalExpenses)
							},
							{
								Item: "Net Profit",
								Amount: fmt(netProfit)
							}
						]);
						toast.success("Profit & Loss exported");
					},
					className: "h-9 px-3 rounded-md border border-border bg-surface text-sm inline-flex items-center gap-1.5 hover:bg-accent",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-3.5" }), " Export"]
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
				className: "flex flex-wrap gap-4 mb-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FigureBox, {
						label: "File Charge",
						value: fmt(totalFileCharge),
						sub: "10% of all phone prices"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FigureBox, {
						label: "Interest Amount",
						value: fmt(totalInterestIncome),
						sub: "Realised interest"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FigureBox, {
						label: "Gross Profit",
						value: fmt(grossProfit),
						accent: "profit"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FigureBox, {
						label: "Expenses",
						value: fmt(totalExpenses),
						accent: "loss"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FigureBox, {
						label: "Net Profit",
						value: fmt(netProfit),
						sub: netProfit >= 0 ? "▲ Profitable" : "▼ Loss",
						accent: netProfit >= 0 ? "profit" : "loss"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 lg:grid-cols-3 gap-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, { title: "Income Breakdown" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "File Charge Income (10% of price)",
							value: fmt(totalFileCharge)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Interest Collected (realised)",
							value: fmt(collectedInterest)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Interest Pending (unrealised)",
							value: fmt(pendingInterest)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Gross Profit",
							value: fmt(grossProfit),
							bold: true,
							tone: "success"
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
							title: "Expense Breakdown",
							action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs text-muted-foreground",
								children: [filteredExpenses.length, " entries"]
							})
						}),
						Object.entries(expByCategory).map(([cat, amt]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: cat,
							value: fmt(amt)
						}, cat)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Total Expenses",
							value: fmt(totalExpenses),
							bold: true,
							tone: "danger"
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, { title: "Net Summary" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Gross Profit",
							value: fmt(grossProfit)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Less: Expenses",
							value: `− ${fmt(totalExpenses)}`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Net Profit",
							value: fmt(netProfit),
							bold: true,
							tone: netProfit >= 0 ? "success" : "danger"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-5 py-4 border-t border-border",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [netProfit >= 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "size-4 text-success" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingDown, { className: "size-4 text-danger" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm font-medium",
									children: netProfit >= 0 ? "Business is profitable" : "Business is in loss"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted-foreground mt-2 leading-relaxed",
								children: [
									"Profit margin: ",
									grossProfit > 0 ? (netProfit / grossProfit * 100).toFixed(1) : 0,
									"%"
								]
							})]
						})
					] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "mt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, { title: "Monthly Profit Trend" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left font-medium px-5 py-2.5",
								children: "Month"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-right font-medium px-4 py-2.5",
								children: "Revenue"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-right font-medium px-4 py-2.5",
								children: "Expenses"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-right font-medium px-5 py-2.5",
								children: "Net Profit"
							})
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: monthlyData.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-t border-border hover:bg-accent/30",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-5 py-3 font-medium",
								children: row.month
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "px-4 py-3 text-right",
								children: ["₹", row.revenue.toLocaleString("en-IN")]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "px-4 py-3 text-right text-danger",
								children: ["₹", row.expense.toLocaleString("en-IN")]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "px-5 py-3 text-right font-semibold text-success",
								children: [
									row.profit >= 0 ? "+" : "−",
									"₹",
									Math.abs(row.profit).toLocaleString("en-IN")
								]
							})
						]
					}, row.month)) })]
				})]
			})
		]
	});
}
//#endregion
export { ProfitLossPage as component };
