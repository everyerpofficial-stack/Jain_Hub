import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { T as Receipt, V as Landmark, Y as FileDown, et as Clock, l as TriangleAlert, mt as Box, v as ShoppingBag } from "../_libs/lucide-react.mjs";
import { f as isDateInRange, g as useMobileStore, p as parseAppDate } from "./mobileStore-B8EWbC21.mjs";
import { a as SectionHeader, i as ProgressBar, n as Badge, o as StatCard, r as Card, t as AppShell } from "./ui-kit-iW0nuj1I.mjs";
import { n as useDateFilter, t as FilterBar } from "./FilterBar-B1CYUr5_.mjs";
import { a as XAxis, c as CartesianGrid, d as Tooltip, i as YAxis, l as Bar, n as BarChart, o as Area, t as AreaChart, u as ResponsiveContainer } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/mobiles-UJmkJ15P.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function MobilesDashboard() {
	const products = useMobileStore((s) => s.products);
	const inventory = useMobileStore((s) => s.inventory);
	const sales = useMobileStore((s) => s.sales);
	const purchases = useMobileStore((s) => s.purchases);
	const customers = useMobileStore((s) => s.customers);
	const suppliers = useMobileStore((s) => s.suppliers);
	const { preset: filterPreset, setPreset: setFilterPreset, customStart, setCustomStart, customEnd, setCustomEnd, startDate, endDate } = useDateFilter();
	const filteredSales = sales.filter((s) => {
		if (filterPreset === "all") return true;
		return isDateInRange(parseAppDate(s.date), startDate, endDate);
	});
	const filteredPurchases = purchases.filter((p) => {
		if (filterPreset === "all") return true;
		return isDateInRange(parseAppDate(p.date), startDate, endDate);
	});
	const filteredCustomers = customers.filter((c) => {
		if (filterPreset === "all") return true;
		return isDateInRange(parseAppDate(c.registeredDate), startDate, endDate);
	});
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
	const totalProducts = products.length;
	const availableStock = inventory.reduce((sum, item) => sum + item.quantity, 0);
	const lowStockProducts = inventory.filter((item) => item.status === "Low Stock").length;
	const outOfStockProducts = inventory.filter((item) => item.status === "Out of Stock").length;
	const todayStr = (/* @__PURE__ */ new Date()).toLocaleDateString("en-IN", {
		day: "2-digit",
		month: "short",
		year: "numeric"
	});
	const todaySalesVal = sales.filter((s) => s.date === todayStr).reduce((sum, s) => sum + s.totalAmount, 0);
	const periodSalesVal = filteredSales.reduce((sum, s) => sum + s.totalAmount, 0);
	const periodProfitVal = filteredSales.reduce((profit, sale) => {
		return profit + sale.items.reduce((itemProfit, item) => {
			const invItem = inventory.find((i) => i.productId === item.productId);
			const cost = invItem ? invItem.purchasePrice : 0;
			return itemProfit + (item.price - cost) * item.quantity;
		}, 0);
	}, 0);
	const totalCustomers = filteredCustomers.length;
	const totalSuppliers = suppliers.length;
	const salesRevenueTrend = (() => {
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
				const saleAmt = sales.filter((s) => {
					const sDate = parseAppDate(s.date);
					return sDate && sDate.toDateString() === dayDate.toDateString();
				}).reduce((sum, s) => sum + s.totalAmount, 0);
				const purchaseAmt = purchases.filter((p) => {
					const pDate = parseAppDate(p.date);
					return pDate && pDate.toDateString() === dayDate.toDateString();
				}).reduce((sum, p) => sum + p.amount, 0);
				trend.push({
					label: dayStr,
					sales: saleAmt,
					revenue: saleAmt,
					purchases: purchaseAmt
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
				const saleAmt = sales.filter((s) => {
					const sDate = parseAppDate(s.date);
					return sDate && sDate >= monthStart && sDate <= monthEnd && isDateInRange(sDate, startDate, endDate);
				}).reduce((sum, s) => sum + s.totalAmount, 0);
				const purchaseAmt = purchases.filter((p) => {
					const pDate = parseAppDate(p.date);
					return pDate && pDate >= monthStart && pDate <= monthEnd && isDateInRange(pDate, startDate, endDate);
				}).reduce((sum, p) => sum + p.amount, 0);
				trend.push({
					label: monthLabel,
					sales: saleAmt,
					revenue: saleAmt,
					purchases: purchaseAmt
				});
			}
		}
		return trend;
	})();
	const brandSales = (() => {
		const brandMap = {};
		filteredSales.forEach((sale) => {
			sale.items.forEach((item) => {
				const prod = products.find((p) => p.id === item.productId);
				const brand = prod ? prod.brand : "Other";
				brandMap[brand] = (brandMap[brand] || 0) + item.price * item.quantity;
			});
		});
		return Object.keys(brandMap).map((brand) => ({
			brand,
			sales: brandMap[brand]
		}));
	})();
	const brandStockDistribution = (() => {
		const stockMap = {};
		inventory.forEach((item) => {
			stockMap[item.brand] = (stockMap[item.brand] || 0) + item.quantity;
		});
		const colors = [
			"#3b82f6",
			"#10b981",
			"#f59e0b",
			"#ef4444",
			"#8b5cf6",
			"#ec4899",
			"#6b7280"
		];
		return Object.keys(stockMap).map((brand, idx) => ({
			name: brand,
			value: stockMap[brand],
			color: colors[idx % colors.length]
		}));
	})();
	const topSelling = (() => {
		const prodMap = {};
		filteredSales.forEach((sale) => {
			sale.items.forEach((item) => {
				if (!prodMap[item.productId]) {
					const p = products.find((prod) => prod.id === item.productId);
					prodMap[item.productId] = {
						name: item.productName,
						brand: p ? p.brand : "",
						qty: 0,
						value: 0
					};
				}
				prodMap[item.productId].qty += item.quantity;
				prodMap[item.productId].value += item.price * item.quantity;
			});
		});
		return Object.values(prodMap).sort((a, b) => b.qty - a.qty).slice(0, 5);
	})();
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
						" · Jain Mobiles ERP Console",
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1 text-muted-foreground/60",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-3" }), timeStr]
						})
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center gap-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => {
							toast.success("Mobiles Dashboard Report exported successfully");
						},
						className: "h-9 px-3.5 rounded-md border border-border bg-surface text-sm inline-flex items-center gap-1.5 hover:bg-accent font-semibold transition-colors shadow-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileDown, { className: "size-3.5" }), " Export Report"]
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
				className: "grid grid-cols-2 md:grid-cols-4 gap-4 mb-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Total Products",
						value: totalProducts.toString(),
						sub: "Catalog items",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, { className: "size-4" }),
						trend: "up"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Available Stock",
						value: availableStock.toString(),
						sub: `${outOfStockProducts} Out of stock`,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, { className: "size-4" }),
						trend: lowStockProducts > 0 ? "warn" : "up"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: filterPreset === "all" ? "Total Sales" : "Sales in Period",
						value: fmt(periodSalesVal),
						sub: `Today: ${fmt(todaySalesVal)}`,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "size-4" }),
						trend: "up"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Monthly Profit",
						value: fmt(periodProfitVal),
						sub: "Realized margin",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landmark, { className: "size-4" }),
						trend: periodProfitVal > 0 ? "up" : "down"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 md:grid-cols-4 gap-4 mb-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Low Stock Models",
						value: lowStockProducts.toString(),
						sub: "Threshold limit reached",
						trend: lowStockProducts > 0 ? "warn" : void 0
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Total Purchases",
						value: fmt(filteredPurchases.reduce((s, p) => s + p.amount, 0)),
						sub: `${filteredPurchases.length} supplier orders`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Active Customers",
						value: totalCustomers.toString(),
						sub: "Registered mobile buyers"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Active Suppliers",
						value: totalSuppliers.toString(),
						sub: "Wholesalers & Distributors"
					})
				]
			}),
			lowStockProducts > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6 flex items-start gap-3 rounded-xl border border-warning/45 bg-warning/5 px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-4 text-warning shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-semibold text-warning",
						children: [lowStockProducts, " products are running low on stock."]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted-foreground ml-1.5",
						children: "Please review the inventory levels and create purchase orders to restock immediately."
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "lg:col-span-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
						title: "Sales Trend",
						action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted-foreground font-semibold",
							children: filterPreset === "all" ? "All Time Sales & Cost" : "Selected Period Trend"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "px-5 pb-5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: 220,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
								data: salesRevenueTrend,
								margin: {
									top: 4,
									right: 0,
									left: -20,
									bottom: 0
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("defs", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
										id: "gsales",
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
										id: "gpur",
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
										formatter: (v) => [fmt(v), ""],
										contentStyle: {
											background: "var(--color-popover)",
											border: "1px solid var(--color-border)",
											borderRadius: 8,
											fontSize: 12
										}
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
										type: "monotone",
										dataKey: "sales",
										stroke: "oklch(0.62 0.15 160)",
										strokeWidth: 2,
										fill: "url(#gsales)",
										name: "Sales Revenue"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
										type: "monotone",
										dataKey: "purchases",
										stroke: "oklch(0.78 0.16 70)",
										strokeWidth: 2,
										fill: "url(#gpur)",
										name: "Inventory Purchase"
									})
								]
							})
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, { title: "Brand-wise Sales" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "px-5 pb-5",
					children: brandSales.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-[220px] flex items-center justify-center text-xs text-muted-foreground",
						children: "No brand sales recorded in this period."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: 220,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
							data: brandSales,
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
									formatter: (v) => [fmt(v), "Sales"],
									contentStyle: {
										background: "var(--color-popover)",
										border: "1px solid var(--color-border)",
										borderRadius: 8,
										fontSize: 12
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "sales",
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
					title: "Top Selling Products",
					action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: "success",
						children: "Fast Moving"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "divide-y divide-border",
					children: topSelling.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "px-5 py-8 text-center text-sm text-muted-foreground font-medium",
						children: "No sales data recorded yet."
					}) : topSelling.map((ts, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "px-5 py-3 flex items-center gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "size-9 rounded-lg bg-muted text-foreground font-bold text-xs grid place-items-center shrink-0",
								children: ["#", idx + 1]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-1 min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-sm font-semibold truncate",
									children: ts.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-muted-foreground",
									children: ts.brand
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-right shrink-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-sm font-bold",
									children: [ts.qty, " units"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-muted-foreground font-semibold",
									children: fmt(ts.value)
								})]
							})
						]
					}, idx))
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, { title: "Brand-wise Stock Distribution" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "px-5 pb-4 space-y-4 pt-2",
					children: brandStockDistribution.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "py-12 text-center text-sm text-muted-foreground",
						children: "No inventory stock recorded."
					}) : brandStockDistribution.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between mb-1.5 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "size-2.5 rounded-full",
								style: { backgroundColor: row.color }
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold text-xs text-foreground/80",
								children: row.name
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-medium text-xs",
							children: [row.value, " units"]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProgressBar, {
						value: availableStock > 0 ? row.value / availableStock * 100 : 0,
						color: row.color
					})] }, row.name))
				})] })]
			})
		]
	});
}
//#endregion
export { MobilesDashboard as component };
