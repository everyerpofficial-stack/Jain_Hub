import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { C as Search, H as IndianRupee, _t as Activity, at as CircleAlert, d as TrendingDown, g as Smartphone, pt as Building, r as Wallet, u as TrendingUp } from "../_libs/lucide-react.mjs";
import { _ as useStore, f as isDateInRange, g as useMobileStore, p as parseAppDate } from "./mobileStore-B8EWbC21.mjs";
import { a as SectionHeader, r as Card } from "./ui-kit-iW0nuj1I.mjs";
import { n as useDateFilter, t as FilterBar } from "./FilterBar-B1CYUr5_.mjs";
import { a as XAxis, c as CartesianGrid, d as Tooltip, f as Legend, i as YAxis, l as Bar, n as BarChart, u as ResponsiveContainer } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/CashFlowDashboard-C4ZTWOUj.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var fmt = (num) => `₹${Math.round(num).toLocaleString("en-IN")}`;
var fmtSigned = (num) => {
	const rounded = Math.round(num);
	const absStr = Math.abs(rounded).toLocaleString("en-IN");
	return `${rounded < 0 ? "-" : rounded > 0 ? "+" : ""}₹${absStr}`;
};
function CashFlowDashboard() {
	const { preset: filterPreset, setPreset: setFilterPreset, customStart, setCustomStart, customEnd, setCustomEnd, startDate, endDate } = useDateFilter();
	const [activeTab, setActiveTab] = (0, import_react.useState)("Combined");
	const [methodFilter, setMethodFilter] = (0, import_react.useState)("All");
	const [typeFilter, setTypeFilter] = (0, import_react.useState)("All");
	const [searchQuery, setSearchQuery] = (0, import_react.useState)("");
	const fCustomers = useStore((s) => s.customers);
	const fPayments = useStore((s) => s.payments);
	const fExpenses = useStore((s) => s.expenses);
	const fInvestments = useStore((s) => s.investments);
	const mSales = useMobileStore((s) => s.sales);
	const mExpenses = useMobileStore((s) => s.expenses);
	const mPurchases = useMobileStore((s) => s.purchases);
	const mSupplierPayments = useMobileStore((s) => s.supplierPayments);
	const financeItems = (0, import_react.useMemo)(() => {
		const items = [];
		fCustomers.forEach((c) => {
			if (c.deposit > 0) {
				const dObj = parseAppDate(c.billDate);
				items.push({
					id: `F-DEP-${c.id}`,
					date: c.billDate,
					dateObj: dObj,
					module: "Finance",
					type: "Inflow",
					category: "Down Payment",
					description: `Down payment deposit for EMI scheme of ${c.name}`,
					amount: c.deposit,
					method: "Cash"
				});
			}
			const principal = c.price - c.deposit;
			if (principal > 0) {
				const dObj = parseAppDate(c.billDate);
				items.push({
					id: `F-DISB-${c.id}`,
					date: c.billDate,
					dateObj: dObj,
					module: "Finance",
					type: "Outflow",
					category: "Loan Disbursal",
					description: `Disbursement of micro-loan principal for ${c.name}`,
					amount: principal,
					method: "UPI"
				});
			}
		});
		fPayments.forEach((p) => {
			if (p.status === "Success") {
				const amt = Number(p.amount.replace(/[^\d]/g, ""));
				if (amt > 0) {
					const dObj = parseAppDate(p.date);
					items.push({
						id: `F-EMI-${p.id}`,
						date: p.date,
						dateObj: dObj,
						module: "Finance",
						type: "Inflow",
						category: "EMI Collection",
						description: `EMI Payment collection - ${p.customer}`,
						amount: amt,
						method: p.method === "UPI" ? "UPI" : "Cash"
					});
				}
			}
		});
		fExpenses.forEach((e) => {
			const amt = Number(e.amount.replace(/[^\d]/g, ""));
			if (amt > 0) {
				const dObj = parseAppDate(e.date);
				const isInflow = e.type === "Income";
				items.push({
					id: `F-EXP-${e.id}`,
					date: e.date,
					dateObj: dObj,
					module: "Finance",
					type: isInflow ? "Inflow" : "Outflow",
					category: e.cat,
					description: e.desc,
					amount: amt,
					method: e.method || "Cash"
				});
			}
		});
		fInvestments.forEach((i) => {
			const amt = Number(i.amount.replace(/[^\d]/g, ""));
			if (amt > 0) {
				const dObj = parseAppDate(i.date || "");
				items.push({
					id: `F-INV-${i.id}`,
					date: i.date || "01 Jun 2026",
					dateObj: dObj,
					module: "Finance",
					type: "Inflow",
					category: "Capital Investment",
					description: `Capital deployed by investor: ${i.investor}`,
					amount: amt,
					method: i.method || "UPI"
				});
			}
		});
		return items;
	}, [
		fCustomers,
		fPayments,
		fExpenses,
		fInvestments
	]);
	const mobilesItems = (0, import_react.useMemo)(() => {
		const items = [];
		mSales.forEach((s) => {
			const dObj = parseAppDate(s.date);
			const cashAmt = s.cashAmountPaid !== void 0 ? s.cashAmountPaid : s.paymentMethod === "Cash" ? s.totalAmount : s.paymentMethod === "Cash & UPI" ? s.totalAmount / 2 : 0;
			if (cashAmt > 0) items.push({
				id: `M-SALECASH-${s.id}`,
				date: s.date,
				dateObj: dObj,
				module: "Mobiles",
				type: "Inflow",
				category: "Device Sales (Cash)",
				description: `Cash sales bill ${s.id} - ${s.customerName}`,
				amount: cashAmt,
				method: "Cash"
			});
			const upiAmt = s.upiAmountPaid !== void 0 ? s.upiAmountPaid : s.paymentMethod === "UPI" ? s.totalAmount : s.paymentMethod === "Cash & UPI" ? s.totalAmount / 2 : 0;
			if (upiAmt > 0) items.push({
				id: `M-SALEUPI-${s.id}`,
				date: s.date,
				dateObj: dObj,
				module: "Mobiles",
				type: "Inflow",
				category: "Device Sales (UPI)",
				description: `UPI sales bill ${s.id} - ${s.customerName}`,
				amount: upiAmt,
				method: "UPI"
			});
		});
		mExpenses.forEach((e) => {
			const amt = Number(e.amount.replace(/[^\d]/g, ""));
			if (amt > 0) {
				const dObj = parseAppDate(e.date);
				const isInflow = e.type === "Income";
				items.push({
					id: `M-EXP-${e.id}`,
					date: e.date,
					dateObj: dObj,
					module: "Mobiles",
					type: isInflow ? "Inflow" : "Outflow",
					category: e.cat,
					description: e.desc,
					amount: amt,
					method: e.paymentMode || "Cash"
				});
			}
		});
		mPurchases.forEach((p) => {
			if (p.status === "Paid") {
				const dObj = parseAppDate(p.date);
				items.push({
					id: `M-PUR-${p.id}`,
					date: p.date,
					dateObj: dObj,
					module: "Mobiles",
					type: "Outflow",
					category: "Stock Purchase",
					description: `Purchase Invoice ${p.invoiceNo} from ${p.supplierName}`,
					amount: p.amount,
					method: "UPI"
				});
			}
		});
		mSupplierPayments.forEach((sp) => {
			const dObj = parseAppDate(sp.date);
			items.push({
				id: `M-SUPP-${sp.id}`,
				date: sp.date,
				dateObj: dObj,
				module: "Mobiles",
				type: "Outflow",
				category: "Supplier Payment",
				description: `Paid outstanding balance to vendor: ${sp.supplierName}`,
				amount: sp.amount,
				method: "UPI"
			});
		});
		return items;
	}, [
		mSales,
		mExpenses,
		mPurchases,
		mSupplierPayments
	]);
	const activeRawItems = (0, import_react.useMemo)(() => {
		let list = [];
		if (activeTab === "Combined" || activeTab === "Finance") list = list.concat(financeItems);
		if (activeTab === "Combined" || activeTab === "Mobiles") list = list.concat(mobilesItems);
		return list.filter((item) => {
			if (filterPreset === "all") return true;
			return isDateInRange(item.dateObj, startDate, endDate);
		});
	}, [
		activeTab,
		financeItems,
		mobilesItems,
		filterPreset,
		startDate,
		endDate
	]);
	const breakdownStats = (0, import_react.useMemo)(() => {
		const filterItems = (items) => {
			return items.filter((item) => {
				if (filterPreset === "all") return true;
				return isDateInRange(item.dateObj, startDate, endDate);
			});
		};
		const calc = (items) => {
			let cashIn = 0;
			let cashOut = 0;
			let bankIn = 0;
			let bankOut = 0;
			items.forEach((item) => {
				if (item.type === "Inflow") if (item.method === "Cash") cashIn += item.amount;
				else bankIn += item.amount;
				else if (item.method === "Cash") cashOut += item.amount;
				else bankOut += item.amount;
			});
			const netCash = cashIn - cashOut;
			const netBank = bankIn - bankOut;
			const totalInflow = cashIn + bankIn;
			const totalOutflow = cashOut + bankOut;
			const netConsolidated = totalInflow - totalOutflow;
			return {
				cashIn,
				cashOut,
				bankIn,
				bankOut,
				netCash,
				netBank,
				totalInflow,
				totalOutflow,
				netConsolidated
			};
		};
		const finance = calc(filterItems(financeItems));
		const mobiles = calc(filterItems(mobilesItems));
		return {
			Finance: finance,
			Mobiles: mobiles,
			Combined: {
				cashIn: finance.cashIn + mobiles.cashIn,
				cashOut: finance.cashOut + mobiles.cashOut,
				bankIn: finance.bankIn + mobiles.bankIn,
				bankOut: finance.bankOut + mobiles.bankOut,
				netCash: finance.netCash + mobiles.netCash,
				netBank: finance.netBank + mobiles.netBank,
				totalInflow: finance.totalInflow + mobiles.totalInflow,
				totalOutflow: finance.totalOutflow + mobiles.totalOutflow,
				netConsolidated: finance.netConsolidated + mobiles.netConsolidated
			}
		};
	}, [
		financeItems,
		mobilesItems,
		filterPreset,
		startDate,
		endDate
	]);
	const stats = (0, import_react.useMemo)(() => {
		if (activeTab === "Finance") return breakdownStats.Finance;
		if (activeTab === "Mobiles") return breakdownStats.Mobiles;
		return breakdownStats.Combined;
	}, [activeTab, breakdownStats]);
	const filteredTableItems = (0, import_react.useMemo)(() => {
		return activeRawItems.filter((item) => {
			const matchesSearch = item.category.toLowerCase().includes(searchQuery.toLowerCase()) || item.description.toLowerCase().includes(searchQuery.toLowerCase()) || item.id.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesMethod = methodFilter === "All" || item.method === methodFilter;
			const matchesType = typeFilter === "All" || item.type === typeFilter;
			return matchesSearch && matchesMethod && matchesType;
		}).sort((a, b) => {
			const timeA = a.dateObj ? a.dateObj.getTime() : 0;
			return (b.dateObj ? b.dateObj.getTime() : 0) - timeA;
		});
	}, [
		activeRawItems,
		searchQuery,
		methodFilter,
		typeFilter
	]);
	const chartData = (0, import_react.useMemo)(() => {
		const dailyMap = {};
		activeRawItems.forEach((item) => {
			const dateLabel = item.date;
			if (!dailyMap[dateLabel]) dailyMap[dateLabel] = {
				dateStr: dateLabel,
				cashIn: 0,
				cashOut: 0,
				bankIn: 0,
				bankOut: 0,
				dateObj: item.dateObj || /* @__PURE__ */ new Date()
			};
			if (item.type === "Inflow") if (item.method === "Cash") dailyMap[dateLabel].cashIn += item.amount;
			else dailyMap[dateLabel].bankIn += item.amount;
			else if (item.method === "Cash") dailyMap[dateLabel].cashOut += item.amount;
			else dailyMap[dateLabel].bankOut += item.amount;
		});
		return Object.values(dailyMap).sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime()).map((d) => ({
			name: d.dateStr,
			"Cash Inflow": d.cashIn,
			"Cash Outflow": d.cashOut,
			"Bank Inflow": d.bankIn,
			"Bank Outflow": d.bankOut,
			"Net Cash": d.cashIn - d.cashOut,
			"Net Bank": d.bankIn - d.bankOut,
			"Total Net": d.cashIn + d.bankIn - (d.cashOut + d.bankOut)
		}));
	}, [activeRawItems]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col md:flex-row md:items-center justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
					className: "text-2xl font-bold tracking-tight text-foreground flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "size-6 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Cash & Bank Flow Dashboard" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-0.5",
					children: "Consolidated cash drawer and bank account statements for Finance and Mobiles modules."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex bg-muted/60 border border-border p-1 rounded-xl shadow-inner shrink-0",
					children: [
						"Combined",
						"Finance",
						"Mobiles"
					].map((tab) => {
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setActiveTab(tab),
							className: `flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${activeTab === tab ? "bg-background text-foreground shadow-md scale-[1.02]" : "text-muted-foreground hover:text-foreground hover:bg-background/20"}`,
							children: [
								tab === "Combined" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "size-3.5 text-primary" }),
								tab === "Finance" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building, { className: "size-3.5 text-success" }),
								tab === "Mobiles" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, { className: "size-3.5 text-info" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: tab })
							]
						}, tab);
					})
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
				className: "grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-4 border-l-4 border-l-success flex flex-col justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between items-start",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-bold text-muted-foreground uppercase tracking-wider",
								children: "Cash Inflow"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "bg-success/15 p-1 rounded",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "size-4 text-success" })
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-lg font-extrabold text-foreground",
									children: fmt(stats.cashIn)
								}),
								activeTab === "Combined" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-[9px] font-mono text-muted-foreground/80 mt-0.5 truncate",
									title: `Jain Finance: ${fmt(breakdownStats.Finance.cashIn)} + Jain Mobiles: ${fmt(breakdownStats.Mobiles.cashIn)}`,
									children: [
										fmt(breakdownStats.Finance.cashIn),
										" (Fin) + ",
										fmt(breakdownStats.Mobiles.cashIn),
										" (Mob)"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px] text-muted-foreground mt-0.5",
									children: "Total physically received cash"
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-4 border-l-4 border-l-info flex flex-col justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between items-start",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-bold text-muted-foreground uppercase tracking-wider",
								children: "Bank Inflow (UPI)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "bg-info/15 p-1 rounded",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "size-4 text-info" })
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-lg font-extrabold text-foreground",
									children: fmt(stats.bankIn)
								}),
								activeTab === "Combined" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-[9px] font-mono text-muted-foreground/80 mt-0.5 truncate",
									title: `Jain Finance: ${fmt(breakdownStats.Finance.bankIn)} + Jain Mobiles: ${fmt(breakdownStats.Mobiles.bankIn)}`,
									children: [
										fmt(breakdownStats.Finance.bankIn),
										" (Fin) + ",
										fmt(breakdownStats.Mobiles.bankIn),
										" (Mob)"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px] text-muted-foreground mt-0.5",
									children: "UPI/Bank deposit entries"
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-4 border-l-4 border-l-danger flex flex-col justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between items-start",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-bold text-muted-foreground uppercase tracking-wider",
								children: "Total Outflows"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "bg-danger/15 p-1 rounded",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingDown, { className: "size-4 text-danger" })
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-lg font-extrabold text-foreground",
									children: fmt(stats.totalOutflow)
								}),
								activeTab === "Combined" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-[9px] font-mono text-muted-foreground/80 mt-0.5 truncate",
									title: `Jain Finance: ${fmt(breakdownStats.Finance.totalOutflow)} + Jain Mobiles: ${fmt(breakdownStats.Mobiles.totalOutflow)}`,
									children: [
										fmt(breakdownStats.Finance.totalOutflow),
										" (Fin) + ",
										fmt(breakdownStats.Mobiles.totalOutflow),
										" (Mob)"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px] text-muted-foreground mt-0.5",
									children: "Cash + bank payouts"
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-4 border-l-4 border-l-warning flex flex-col justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between items-start",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-bold text-muted-foreground uppercase tracking-wider",
								children: "Net Cash Flow"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "bg-warning/15 p-1 rounded",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "size-4 text-warning" })
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: `text-lg font-extrabold ${stats.netCash >= 0 ? "text-success" : "text-danger"}`,
									children: [stats.netCash >= 0 ? "+" : "", fmt(stats.netCash)]
								}),
								activeTab === "Combined" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-[9px] font-mono text-muted-foreground/80 mt-0.5 truncate",
									title: `Jain Finance: ${fmtSigned(breakdownStats.Finance.netCash)} | Jain Mobiles: ${fmtSigned(breakdownStats.Mobiles.netCash)}`,
									children: [
										fmtSigned(breakdownStats.Finance.netCash),
										" (Fin) | ",
										fmtSigned(breakdownStats.Mobiles.netCash),
										" (Mob)"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px] text-muted-foreground mt-0.5",
									children: "Physical cash drawer balance"
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-4 border-l-4 border-l-[oklch(0.62_0.14_250)] flex flex-col justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between items-start",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-bold text-muted-foreground uppercase tracking-wider",
								children: "Net Bank Flow"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "bg-info/15 p-1 rounded",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "size-4 text-info" })
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: `text-lg font-extrabold ${stats.netBank >= 0 ? "text-success" : "text-danger"}`,
									children: [stats.netBank >= 0 ? "+" : "", fmt(stats.netBank)]
								}),
								activeTab === "Combined" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-[9px] font-mono text-muted-foreground/80 mt-0.5 truncate",
									title: `Jain Finance: ${fmtSigned(breakdownStats.Finance.netBank)} | Jain Mobiles: ${fmtSigned(breakdownStats.Mobiles.netBank)}`,
									children: [
										fmtSigned(breakdownStats.Finance.netBank),
										" (Fin) | ",
										fmtSigned(breakdownStats.Mobiles.netBank),
										" (Mob)"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px] text-muted-foreground mt-0.5",
									children: "Bank ledger balance change"
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-4 border-l-4 border-l-primary flex flex-col justify-between bg-primary/[0.02]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between items-start",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-bold text-primary uppercase tracking-wider",
								children: "Net Consolidated"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "bg-primary/10 p-1.5 rounded-lg",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IndianRupee, { className: "size-4 text-primary" })
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: `text-xl font-black ${stats.netConsolidated >= 0 ? "text-success" : "text-danger"}`,
									children: [stats.netConsolidated >= 0 ? "+" : "", fmt(stats.netConsolidated)]
								}),
								activeTab === "Combined" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-[9px] font-mono text-muted-foreground/80 mt-0.5 truncate",
									title: `Jain Finance: ${fmtSigned(breakdownStats.Finance.netConsolidated)} | Jain Mobiles: ${fmtSigned(breakdownStats.Mobiles.netConsolidated)}`,
									children: [
										fmtSigned(breakdownStats.Finance.netConsolidated),
										" (Fin) | ",
										fmtSigned(breakdownStats.Mobiles.netConsolidated),
										" (Mob)"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px] text-muted-foreground mt-0.5",
									children: "Grand total net balance flow"
								})
							]
						})]
					})
				]
			}),
			activeTab === "Combined" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-5 border-l-4 border-l-primary bg-primary/[0.01]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
						title: "Module-wise Flow Integration & Reconciliation",
						description: "Mathematical addition and audit checklist of Cash & Bank flows from Jain Finance and Jain Mobiles modules."
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto rounded-xl border border-border",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-left text-xs min-w-[600px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
							className: "bg-muted/40 border-b border-border text-[10px] uppercase font-extrabold tracking-wider text-muted-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-3 w-1/3",
									children: "Transaction Flow Metric"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-3 text-success",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building, { className: "size-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Jain Finance" })]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-3 text-info",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, { className: "size-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Jain Mobiles" })]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-3 text-primary",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "size-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Consolidated Sum (Addition)" })]
									})
								})
							] })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", {
							className: "divide-y divide-border/60 font-medium",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
									className: "bg-muted/10 font-bold text-muted-foreground text-[10px] uppercase tracking-wider",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										colSpan: 4,
										className: "p-2 pl-3",
										children: "Inflows (Receipts)"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "hover:bg-accent/25 transition-colors",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-3 text-foreground pl-6",
											children: "Cash Inflow"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-3 text-foreground",
											children: fmt(breakdownStats.Finance.cashIn)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-3 text-foreground",
											children: fmt(breakdownStats.Mobiles.cashIn)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-3 font-bold text-success bg-success/5",
											children: fmt(breakdownStats.Combined.cashIn)
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "hover:bg-accent/25 transition-colors",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-3 text-foreground pl-6",
											children: "Bank Inflow (UPI)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-3 text-foreground",
											children: fmt(breakdownStats.Finance.bankIn)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-3 text-foreground",
											children: fmt(breakdownStats.Mobiles.bankIn)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-3 font-bold text-success bg-success/5",
											children: fmt(breakdownStats.Combined.bankIn)
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "bg-success/5 font-semibold",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-3 text-foreground pl-6",
											children: "Total Inflow"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-3 text-foreground",
											children: fmt(breakdownStats.Finance.totalInflow)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-3 text-foreground",
											children: fmt(breakdownStats.Mobiles.totalInflow)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-3 font-extrabold text-success bg-success/10",
											children: fmt(breakdownStats.Combined.totalInflow)
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
									className: "bg-muted/10 font-bold text-muted-foreground text-[10px] uppercase tracking-wider",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										colSpan: 4,
										className: "p-2 pl-3",
										children: "Outflows (Payments)"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "hover:bg-accent/25 transition-colors",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-3 text-foreground pl-6",
											children: "Cash Outflow"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-3 text-foreground",
											children: fmt(breakdownStats.Finance.cashOut)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-3 text-foreground",
											children: fmt(breakdownStats.Mobiles.cashOut)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-3 font-bold text-danger bg-danger/5",
											children: fmt(breakdownStats.Combined.cashOut)
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "hover:bg-accent/25 transition-colors",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-3 text-foreground pl-6",
											children: "Bank Outflow (UPI)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-3 text-foreground",
											children: fmt(breakdownStats.Finance.bankOut)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-3 text-foreground",
											children: fmt(breakdownStats.Mobiles.bankOut)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-3 font-bold text-danger bg-danger/5",
											children: fmt(breakdownStats.Combined.bankOut)
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "bg-danger/5 font-semibold",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-3 text-foreground pl-6",
											children: "Total Outflow"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-3 text-foreground",
											children: fmt(breakdownStats.Finance.totalOutflow)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-3 text-foreground",
											children: fmt(breakdownStats.Mobiles.totalOutflow)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-3 font-extrabold text-danger bg-danger/10",
											children: fmt(breakdownStats.Combined.totalOutflow)
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
									className: "bg-muted/10 font-bold text-muted-foreground text-[10px] uppercase tracking-wider",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										colSpan: 4,
										className: "p-2 pl-3",
										children: "Net Balance Flow (Inflow − Outflow)"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "hover:bg-accent/25 transition-colors",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-3 text-foreground pl-6",
											children: "Net Cash Flow (Drawer)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-3 text-foreground",
											children: fmtSigned(breakdownStats.Finance.netCash)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-3 text-foreground",
											children: fmtSigned(breakdownStats.Mobiles.netCash)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-3 font-bold text-foreground bg-muted/40",
											children: fmtSigned(breakdownStats.Combined.netCash)
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "hover:bg-accent/25 transition-colors",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-3 text-foreground pl-6",
											children: "Net Bank Flow (Account)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-3 text-foreground",
											children: fmtSigned(breakdownStats.Finance.netBank)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-3 text-foreground",
											children: fmtSigned(breakdownStats.Mobiles.netBank)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-3 font-bold text-foreground bg-muted/40",
											children: fmtSigned(breakdownStats.Combined.netBank)
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "bg-primary/5 font-bold text-sm",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-3 text-primary uppercase tracking-wide",
											children: "Net Consolidated (Grand Total)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-3 text-foreground",
											children: fmtSigned(breakdownStats.Finance.netConsolidated)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-3 text-foreground",
											children: fmtSigned(breakdownStats.Mobiles.netConsolidated)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-3 font-black text-primary bg-primary/10",
											children: fmtSigned(breakdownStats.Combined.netConsolidated)
										})
									]
								})
							]
						})]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
						title: "Consolidated Flows (Cash vs Bank)",
						description: "Daily cash inflow, bank deposits, and outflows tracking over time."
					})
				}), chartData.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "h-64 flex flex-col items-center justify-center text-muted-foreground border border-dashed border-border rounded-xl",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-8 text-muted-foreground/60 mb-2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm",
						children: "No transaction flow data available for this range"
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-80 w-full mt-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
							data: chartData,
							margin: {
								top: 10,
								right: 10,
								left: -10,
								bottom: 0
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									strokeDasharray: "3 3",
									vertical: false,
									stroke: "var(--border)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "name",
									stroke: "var(--muted-foreground)",
									fontSize: 11,
									tickLine: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									stroke: "var(--muted-foreground)",
									fontSize: 11,
									tickLine: false,
									tickFormatter: (val) => `₹${(val / 1e3).toFixed(0)}k`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
									formatter: (value) => [fmt(Number(value)), ""],
									contentStyle: {
										backgroundColor: "var(--background)",
										borderColor: "var(--border)",
										borderRadius: "0.75rem",
										fontSize: "12px"
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, {
									iconType: "circle",
									wrapperStyle: {
										fontSize: "11px",
										paddingTop: "10px"
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "Cash Inflow",
									fill: "var(--success)",
									radius: [
										4,
										4,
										0,
										0
									],
									maxBarSize: 30
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "Bank Inflow",
									fill: "var(--info)",
									radius: [
										4,
										4,
										0,
										0
									],
									maxBarSize: 30
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "Cash Outflow",
									fill: "var(--warning)",
									radius: [
										4,
										4,
										0,
										0
									],
									maxBarSize: 30
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "Bank Outflow",
									fill: "var(--danger)",
									radius: [
										4,
										4,
										0,
										0
									],
									maxBarSize: 30
								})
							]
						})
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
						title: "Consolidated Cash & Bank Ledger",
						description: `Displaying ${filteredTableItems.length} transactions match the selection`
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative min-w-[200px]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-2.5 size-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "text",
									placeholder: "Search ledger...",
									value: searchQuery,
									onChange: (e) => setSearchQuery(e.target.value),
									className: "pl-9 pr-4 h-9 w-full bg-surface border border-border rounded-lg text-xs focus:ring-2 focus:ring-ring/25 focus:outline-none"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex bg-muted/60 border border-border p-0.5 rounded-lg text-[10px] font-bold",
								children: [
									"All",
									"Inflow",
									"Outflow"
								].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setTypeFilter(t),
									className: `px-2.5 py-1.5 rounded-md ${typeFilter === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`,
									children: t
								}, t))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex bg-muted/60 border border-border p-0.5 rounded-lg text-[10px] font-bold",
								children: [
									"All",
									"Cash",
									"UPI"
								].map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setMethodFilter(m),
									className: `px-2.5 py-1.5 rounded-md ${methodFilter === m ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`,
									children: m === "UPI" ? "Bank/UPI" : m
								}, m))
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto rounded-xl border border-border",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-left text-xs table-fixed min-w-[700px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
							className: "bg-muted/40 border-b border-border text-[10px] uppercase font-extrabold tracking-wider text-muted-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-3 w-28",
									children: "Ref ID"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-3 w-24",
									children: "Date"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-3 w-28",
									children: "Module"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-3 w-32",
									children: "Category"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-3",
									children: "Description"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-3 w-24",
									children: "Method"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-3 w-24 text-right",
									children: "Amount"
								})
							] })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
							className: "divide-y divide-border/60",
							children: filteredTableItems.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								colSpan: 7,
								className: "p-8 text-center text-muted-foreground",
								children: "No ledger transactions match the selected filters."
							}) }) : filteredTableItems.map((item) => {
								const isInflow = item.type === "Inflow";
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "hover:bg-accent/25 transition-colors",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-3 font-mono font-bold text-muted-foreground select-all truncate",
											children: item.id
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-3 font-medium text-foreground truncate",
											children: item.date
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-3",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: `inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${item.module === "Finance" ? "bg-success/10 text-success border border-success/20" : "bg-info/10 text-info border border-info/20"}`,
												children: [item.module === "Finance" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building, { className: "size-2.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, { className: "size-2.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.module })]
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-3 font-semibold text-foreground truncate",
											children: item.category
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-3 text-muted-foreground truncate",
											title: item.description,
											children: item.description
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-3",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: `inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${item.method === "Cash" ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300" : "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300"}`,
												children: item.method === "UPI" ? "Bank/UPI" : "Cash"
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: `p-3 font-extrabold text-right text-sm ${isInflow ? "text-success" : "text-danger"}`,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "inline-flex items-center",
												children: [isInflow ? "+" : "-", fmt(item.amount)]
											})
										})
									]
								}, item.id);
							})
						})]
					})
				})]
			})
		]
	});
}
//#endregion
export { CashFlowDashboard as t };
