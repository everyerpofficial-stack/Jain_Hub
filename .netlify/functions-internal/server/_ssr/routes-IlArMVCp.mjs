import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { H as IndianRupee, Y as FileDown, et as Clock, g as Smartphone, i as Users, it as CircleCheck, l as TriangleAlert, u as TrendingUp } from "../_libs/lucide-react.mjs";
import { _ as useStore, d as downloadExcel, f as isDateInRange, p as parseAppDate, v as useUi } from "./mobileStore-B8EWbC21.mjs";
import { a as SectionHeader, i as ProgressBar, n as Badge, o as StatCard, r as Card, t as AppShell } from "./ui-kit-iW0nuj1I.mjs";
import { n as useDateFilter, t as FilterBar } from "./FilterBar-B1CYUr5_.mjs";
import { a as XAxis, c as CartesianGrid, d as Tooltip, i as YAxis, l as Bar, n as BarChart, o as Area, t as AreaChart, u as ResponsiveContainer } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-IlArMVCp.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Dashboard() {
	const { openDialog } = useUi();
	const customers = useStore((s) => s.customers);
	const payments = useStore((s) => s.payments);
	const expenses = useStore((s) => s.expenses);
	const investments = useStore((s) => s.investments);
	const { preset: filterPreset, setPreset: setFilterPreset, customStart, setCustomStart, customEnd, setCustomEnd, startDate, endDate } = useDateFilter();
	const filteredCustomers = customers.filter((c) => {
		if (filterPreset === "all") return true;
		return isDateInRange(parseAppDate(c.billDate), startDate, endDate);
	});
	const filteredPayments = payments.filter((p) => {
		if (filterPreset === "all") return true;
		return isDateInRange(parseAppDate(p.date), startDate, endDate);
	});
	const filteredExpenses = expenses.filter((e) => {
		if (filterPreset === "all") return true;
		return isDateInRange(parseAppDate(e.date), startDate, endDate);
	});
	const collectionTrend = (() => {
		const trend = [];
		if (startDate && endDate && (endDate.getTime() - startDate.getTime()) / (1e3 * 60 * 60 * 24) <= 35 && startDate && endDate) {
			const daysCount = Math.round((endDate.getTime() - startDate.getTime()) / (1e3 * 60 * 60 * 24)) + 1;
			const monthsList = [
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
			for (let d = 0; d < daysCount; d++) {
				const dayDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + d);
				const dayStr = `${dayDate.getDate()} ${monthsList[dayDate.getMonth()]}`;
				const collected = payments.filter((p) => {
					const pDate = parseAppDate(p.date);
					return pDate && pDate.toDateString() === dayDate.toDateString() && p.status === "Success";
				}).reduce((sum, p) => sum + Number(p.amount.replace(/[^\d]/g, "")), 0);
				const pending = customers.filter((c) => {
					if (c.status !== "Active" && c.status !== "Overdue") return false;
					const cDate = parseAppDate(c.emiDate);
					return cDate && cDate.toDateString() === dayDate.toDateString();
				}).reduce((sum, c) => sum + c.perMonthEmi, 0);
				trend.push({
					label: dayStr,
					collected,
					pending
				});
			}
		} else {
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
			const startYear = startDate ? startDate.getFullYear() : 2026;
			for (let i = 0; i < 12; i++) {
				const monthLabel = months[i];
				const monthStart = new Date(startYear, i, 1);
				const monthEnd = new Date(startYear, i + 1, 0);
				if (startDate && endDate && (monthEnd < startDate || monthStart > endDate)) continue;
				const collected = payments.filter((p) => {
					const pDate = parseAppDate(p.date);
					if (!pDate) return false;
					return pDate >= monthStart && pDate <= monthEnd && p.status === "Success" && isDateInRange(pDate, startDate, endDate);
				}).reduce((sum, p) => sum + Number(p.amount.replace(/[^\d]/g, "")), 0);
				const pending = customers.filter((c) => {
					if (c.status !== "Active" && c.status !== "Overdue") return false;
					const cDate = parseAppDate(c.emiDate);
					if (!cDate) return false;
					return cDate >= monthStart && cDate <= monthEnd && isDateInRange(cDate, startDate, endDate);
				}).reduce((sum, c) => sum + c.perMonthEmi, 0);
				trend.push({
					label: monthLabel,
					collected,
					pending
				});
			}
		}
		return trend;
	})();
	const brandPerf = (() => {
		const brandMap = {};
		filteredCustomers.forEach((c) => {
			const brand = c.mobileBrand || "Other";
			if (!brandMap[brand]) brandMap[brand] = {
				customers: 0,
				collected: 0
			};
			brandMap[brand].customers += 1;
			const downpayment = isDateInRange(parseAppDate(c.billDate), startDate, endDate) ? c.deposit : 0;
			const paymentsInPeriod = payments.filter((p) => p.customerId === c.id && p.status === "Success" && isDateInRange(parseAppDate(p.date), startDate, endDate)).reduce((sum, p) => sum + Number(p.amount.replace(/[^\d]/g, "")), 0);
			brandMap[brand].collected += downpayment + paymentsInPeriod;
		});
		return Object.keys(brandMap).map((brand) => ({
			brand,
			customers: brandMap[brand].customers,
			collected: brandMap[brand].collected
		}));
	})();
	const upcoming = customers.filter((c) => {
		if (c.status !== "Active" || c.pendingEmis <= 0) return false;
		return isDateInRange(parseAppDate(c.emiDate), startDate, endDate);
	}).slice(0, 5).map((c) => ({
		id: c.id,
		name: c.name,
		village: c.village,
		emi: `₹${c.perMonthEmi.toLocaleString("en-IN")}`,
		due: c.emiDate || "—",
		model: `${c.mobileBrand} ${c.mobileModel}`
	}));
	const [now, setNow] = (0, import_react.useState)(() => /* @__PURE__ */ new Date());
	(0, import_react.useEffect)(() => {
		const t = setInterval(() => setNow(/* @__PURE__ */ new Date()), 6e4);
		return () => clearInterval(t);
	}, []);
	const hour = now.getHours();
	const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
	const dateStr = now.toLocaleDateString("en-IN", {
		weekday: "long",
		day: "numeric",
		month: "long",
		year: "numeric"
	});
	const timeStr = now.toLocaleTimeString("en-IN", {
		hour: "2-digit",
		minute: "2-digit"
	});
	const totalCustomers = filteredCustomers.length;
	const activeCustomers = filteredCustomers.filter((c) => c.status === "Active").length;
	const overdueCustomers = filteredCustomers.filter((c) => c.status === "Overdue" || c.status === "Defaulted").length;
	const closedCustomers = filteredCustomers.filter((c) => c.status === "Closed").length;
	const totalPending = filterPreset === "all" ? customers.reduce((s, c) => s + c.pendingAmount, 0) : customers.filter((c) => isDateInRange(parseAppDate(c.emiDate), startDate, endDate)).reduce((s, c) => s + c.perMonthEmi, 0);
	const pendingCount = filterPreset === "all" ? customers.filter((c) => c.pendingEmis > 0).length : customers.filter((c) => isDateInRange(parseAppDate(c.emiDate), startDate, endDate) && c.pendingEmis > 0).length;
	const totalFileCharge = filteredCustomers.reduce((s, c) => s + c.fileCharge, 0);
	const collectedInterest = filteredPayments.filter((p) => p.status === "Success").reduce((sum, p) => {
		const cust = customers.find((c) => c.id === p.customerId);
		return sum + (cust ? cust.interestPerMonth : 0);
	}, 0);
	const grossProfit = totalFileCharge + collectedInterest;
	const totalExpenses = filteredExpenses.reduce((s, e) => s + Number(e.amount.replace(/[^\d]/g, "")), 0);
	const netProfit = grossProfit - totalExpenses;
	const totalInvestment = investments.filter((i) => {
		if (filterPreset === "all") return true;
		return isDateInRange(parseAppDate(i.maturity), startDate, endDate);
	}).reduce((s, i) => s + Number(i.amount.replace(/[^\d]/g, "")), 0);
	const periodPaymentCount = filteredPayments.length;
	const periodCollection = filteredPayments.filter((p) => p.status === "Success").reduce((s, p) => s + Number(p.amount.replace(/[^\d]/g, "")), 0);
	const fmt = (n) => "₹" + Math.round(n).toLocaleString("en-IN");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		breadcrumb: "Dashboard",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3 mb-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
					className: "text-[26px] font-semibold tracking-tight leading-tight",
					children: [greeting, ", Rajesh"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted-foreground mt-1 flex items-center gap-2",
					children: [
						dateStr,
						" · Jain Finance Mobile EMI",
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1 text-muted-foreground/60",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-3" }), timeStr]
						})
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => {
							downloadExcel("jain-finance-report.xlsx", "Dashboard Report", filteredCustomers.map((c) => ({
								ID: c.id,
								Name: c.name,
								Village: c.village,
								Mobile: c.mobile,
								Brand: c.mobileBrand,
								Model: c.mobileModel,
								"Monthly EMI": c.perMonthEmi,
								"Pending Amount": c.pendingAmount,
								Status: c.status
							})));
							toast.success("Dashboard exported");
						},
						className: "h-9 px-3.5 rounded-md border border-border bg-surface text-sm inline-flex items-center gap-1.5 hover:bg-accent font-semibold transition-colors shadow-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileDown, { className: "size-3.5" }), " Export Report"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => openDialog("customer"),
						className: "h-9 px-4 rounded-md bg-foreground text-background text-sm font-semibold inline-flex items-center gap-1.5 hover:opacity-90 shadow transition-opacity",
						children: "+ New Customer"
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
				className: "grid grid-cols-2 md:grid-cols-4 gap-4 mb-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: filterPreset === "all" ? "Total Customers" : "New Customers",
						value: totalCustomers.toString(),
						sub: `${activeCustomers} active · ${closedCustomers} closed`,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-4" }),
						trend: "up"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: filterPreset === "all" ? "Total Pending EMI" : "Expected EMI Collection",
						value: fmt(totalPending),
						sub: `${pendingCount} customers`,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IndianRupee, { className: "size-4" }),
						trend: overdueCustomers > 0 ? "warn" : "up"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Net Profit",
						value: fmt(netProfit),
						sub: `File Chg + Interest − Exp`,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "size-4" }),
						trend: netProfit > 0 ? "up" : "down"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: filterPreset === "all" ? "Total Collection" : "Collection in Period",
						value: fmt(periodCollection),
						sub: `${periodPaymentCount} payments`,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4" }),
						trend: "up"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 md:grid-cols-4 gap-4 mb-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "File Charge Income",
						value: fmt(totalFileCharge),
						sub: "10% of selling price"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Interest Income",
						value: fmt(collectedInterest),
						sub: "Realised in period"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Total Expenses",
						value: fmt(totalExpenses),
						sub: `${filteredExpenses.length} entries`,
						trend: "warn"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Total Investment",
						value: fmt(totalInvestment),
						sub: `${investments.filter((i) => filterPreset === "all" ? true : isDateInRange(parseAppDate(i.maturity), startDate, endDate)).length} investors`
					})
				]
			}),
			overdueCustomers > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6 flex items-start gap-3 rounded-xl border border-danger/30 bg-danger/5 px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-4 text-danger shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-semibold text-danger",
						children: [overdueCustomers, " customers overdue or defaulted."]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-muted-foreground ml-1.5",
						children: [
							"Total at risk: ",
							fmt(customers.filter((c) => c.status === "Overdue" || c.status === "Defaulted").reduce((s, c) => s + c.pendingAmount, 0)),
							"."
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "lg:col-span-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
						title: "Collection Trend",
						action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted-foreground font-semibold",
							children: filterPreset === "all" ? "All Time View" : filterPreset === "this-month" ? "This Month" : filterPreset === "next-month" ? "Next Month" : `Custom Range (${startDate?.toLocaleDateString("en-IN", {
								day: "2-digit",
								month: "short"
							}) || "—"} to ${endDate?.toLocaleDateString("en-IN", {
								day: "2-digit",
								month: "short"
							}) || "—"})`
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "px-5 pb-5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: 200,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
								data: collectionTrend,
								margin: {
									top: 4,
									right: 0,
									left: -20,
									bottom: 0
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("defs", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
										id: "gcol",
										x1: "0",
										y1: "0",
										x2: "0",
										y2: "1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
											offset: "5%",
											stopColor: "oklch(0.62 0.15 160)",
											stopOpacity: .2
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
											offset: "95%",
											stopColor: "oklch(0.62 0.15 160)",
											stopOpacity: 0
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
										id: "gpend",
										x1: "0",
										y1: "0",
										x2: "0",
										y2: "1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
											offset: "5%",
											stopColor: "oklch(0.78 0.16 70)",
											stopOpacity: .15
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
											offset: "95%",
											stopColor: "oklch(0.78 0.16 70)",
											stopOpacity: 0
										})]
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
										strokeDasharray: "3 3",
										stroke: "var(--color-border)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
										dataKey: "label",
										tick: {
											fontSize: 11,
											fill: "var(--color-muted-foreground)"
										},
										axisLine: false,
										tickLine: false
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
										tick: {
											fontSize: 11,
											fill: "var(--color-muted-foreground)"
										},
										axisLine: false,
										tickLine: false,
										tickFormatter: (v) => `₹${(v / 1e3).toFixed(0)}K`
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
										formatter: (v) => [`₹${v.toLocaleString("en-IN")}`, ""],
										contentStyle: {
											background: "var(--color-popover)",
											border: "1px solid var(--color-border)",
											borderRadius: 8,
											fontSize: 12
										}
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
										type: "monotone",
										dataKey: "collected",
										stroke: "oklch(0.62 0.15 160)",
										strokeWidth: 2,
										fill: "url(#gcol)",
										name: "Collected"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
										type: "monotone",
										dataKey: "pending",
										stroke: "oklch(0.78 0.16 70)",
										strokeWidth: 2,
										fill: "url(#gpend)",
										name: "Pending"
									})
								]
							})
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, { title: "By Mobile Brand" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "px-5 pb-5",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: 200,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
							data: brandPerf,
							margin: {
								top: 4,
								right: 0,
								left: -20,
								bottom: 0
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									strokeDasharray: "3 3",
									stroke: "var(--color-border)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "brand",
									tick: {
										fontSize: 10,
										fill: "var(--color-muted-foreground)"
									},
									axisLine: false,
									tickLine: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									tick: {
										fontSize: 10,
										fill: "var(--color-muted-foreground)"
									},
									axisLine: false,
									tickLine: false,
									tickFormatter: (v) => `₹${(v / 1e3).toFixed(0)}K`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
									formatter: (v) => [`₹${v.toLocaleString("en-IN")}`, "Collected"],
									contentStyle: {
										background: "var(--color-popover)",
										border: "1px solid var(--color-border)",
										borderRadius: 8,
										fontSize: 12
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "collected",
									fill: "oklch(0.22 0.012 60)",
									radius: [
										4,
										4,
										0,
										0
									]
								})
							]
						})
					})
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 lg:grid-cols-2 gap-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
					title: "Upcoming EMIs",
					action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						tone: "warning",
						children: [upcoming.length, " due in period"]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "divide-y divide-border",
					children: upcoming.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "px-5 py-8 text-center text-sm text-muted-foreground font-medium",
						children: "No upcoming EMIs due in this period."
					}) : upcoming.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "px-5 py-3 flex items-center gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "size-9 rounded-full bg-muted grid place-items-center shrink-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, { className: "size-4 text-muted-foreground" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-1 min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-sm font-medium truncate",
									children: u.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xs text-muted-foreground",
									children: [
										u.village,
										" · ",
										u.model
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-right shrink-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-sm font-semibold",
									children: u.emi
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-muted-foreground",
									children: u.due
								})]
							})
						]
					}, u.id))
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, { title: "Customer Portfolio" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-5 pb-4 space-y-4 pt-2",
					children: [[
						{
							label: "Active",
							count: filteredCustomers.filter((c) => c.status === "Active").length,
							total: totalCustomers,
							color: "oklch(0.62 0.15 160)",
							tone: "success"
						},
						{
							label: "Overdue",
							count: filteredCustomers.filter((c) => c.status === "Overdue").length,
							total: totalCustomers,
							color: "oklch(0.78 0.16 70)",
							tone: "warning"
						},
						{
							label: "Defaulted",
							count: filteredCustomers.filter((c) => c.status === "Defaulted").length,
							total: totalCustomers,
							color: "oklch(0.6 0.22 25)",
							tone: "danger"
						},
						{
							label: "Closed",
							count: filteredCustomers.filter((c) => c.status === "Closed").length,
							total: totalCustomers,
							color: "oklch(0.6 0.012 60)",
							tone: "neutral"
						}
					].map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between mb-1.5 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex items-center gap-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								tone: row.tone,
								children: row.label
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-medium",
							children: [
								row.count,
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-muted-foreground font-normal",
									children: ["/ ", row.total]
								})
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProgressBar, {
						value: row.total > 0 ? row.count / row.total * 100 : 0,
						color: row.color
					})] }, row.label)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "pt-2 border-t border-border",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-3 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-lg bg-muted/30 p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-muted-foreground",
									children: "Avg EMI / Customer"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-semibold mt-0.5",
									children: fmt(totalCustomers ? filteredCustomers.reduce((s, c) => s + c.perMonthEmi, 0) / totalCustomers : 0)
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-lg bg-muted/30 p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-muted-foreground",
									children: "Avg Loan Ticket"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-semibold mt-0.5",
									children: fmt(totalCustomers ? filteredCustomers.reduce((s, c) => s + c.price, 0) / totalCustomers : 0)
								})]
							})]
						})
					})]
				})] })]
			})
		]
	});
}
//#endregion
export { Dashboard as component };
