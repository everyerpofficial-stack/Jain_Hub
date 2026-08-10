import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { C as Search, Z as Download, q as FileText } from "../_libs/lucide-react.mjs";
import { d as downloadExcel, f as isDateInRange, g as useMobileStore, p as parseAppDate } from "./mobileStore-B8EWbC21.mjs";
import { a as SectionHeader, n as Badge, o as StatCard, r as Card, t as AppShell } from "./ui-kit-iW0nuj1I.mjs";
import { n as useDateFilter, t as FilterBar } from "./FilterBar-B1CYUr5_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reports-CULpuJp-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ReportsPage() {
	const [reportType, setReportType] = (0, import_react.useState)("sales");
	const [q, setQ] = (0, import_react.useState)("");
	const products = useMobileStore((s) => s.products);
	const inventory = useMobileStore((s) => s.inventory);
	const sales = useMobileStore((s) => s.sales);
	const purchases = useMobileStore((s) => s.purchases);
	const customers = useMobileStore((s) => s.customers);
	const suppliers = useMobileStore((s) => s.suppliers);
	const { preset: filterPreset, setPreset: setFilterPreset, customStart, setCustomStart, customEnd, setCustomEnd, startDate, endDate } = useDateFilter();
	const formatInr = (num) => "₹" + Math.round(num).toLocaleString("en-IN");
	const reportData = (() => {
		let rawRows = [];
		let headers = [];
		let title = "";
		switch (reportType) {
			case "sales":
				title = "Sales Invoice Report";
				headers = [
					"Invoice ID",
					"Date",
					"Customer Name",
					"Customer Mobile",
					"Payment Mode",
					"Total Revenue"
				];
				rawRows = sales.filter((s) => isDateInRange(parseAppDate(s.date), startDate, endDate)).map((s) => ({
					"Invoice ID": s.id,
					"Date": s.date,
					"Customer Name": s.customerName,
					"Customer Mobile": s.customerMobile,
					"Payment Mode": s.paymentMethod,
					"Total Revenue": formatInr(s.totalAmount),
					_rawTotal: s.totalAmount
				}));
				break;
			case "stock":
				title = "Stock Inventory Valuation Report";
				headers = [
					"Product ID",
					"Brand & Model",
					"RAM / ROM",
					"Stock Quantity",
					"Purchase Price (Cost)",
					"Valuation Cost",
					"Status"
				];
				rawRows = inventory.map((item) => {
					const prod = products.find((p) => p.id === item.productId);
					return {
						"Product ID": item.productId,
						"Brand & Model": `${item.brand} ${item.productName}`,
						"RAM / ROM": prod ? prod.ramRom : "—",
						"Stock Quantity": item.quantity,
						"Purchase Price (Cost)": formatInr(item.purchasePrice),
						"Valuation Cost": formatInr(item.purchasePrice * item.quantity),
						"Status": item.status,
						_rawQty: item.quantity,
						_rawCostVal: item.purchasePrice * item.quantity
					};
				});
				break;
			case "profit":
				title = "Profitability Margin Analysis";
				headers = [
					"Product Model",
					"Brand",
					"Units Sold",
					"Retail Price",
					"Cost Price",
					"Margin / Unit",
					"Total Profit"
				];
				const salesInPeriod = sales.filter((s) => isDateInRange(parseAppDate(s.date), startDate, endDate));
				const marginsMap = {};
				salesInPeriod.forEach((sale) => {
					sale.items.forEach((item) => {
						marginsMap[item.productId] = (marginsMap[item.productId] || 0) + item.quantity;
					});
				});
				rawRows = products.map((p) => {
					const unitsSold = marginsMap[p.id] || 0;
					const sellingPrice = p.sellingPrice ?? 0;
					const unitProfit = sellingPrice - p.purchasePrice;
					const totalProfit = unitProfit * unitsSold;
					return {
						"Product Model": p.name,
						"Brand": p.brand,
						"Units Sold": unitsSold,
						"Retail Price": formatInr(sellingPrice),
						"Cost Price": formatInr(p.purchasePrice),
						"Margin / Unit": formatInr(unitProfit),
						"Total Profit": formatInr(totalProfit),
						_rawUnits: unitsSold,
						_rawProfit: totalProfit
					};
				}).filter((row) => row._rawUnits > 0 || q === "");
				break;
			case "purchases":
				title = "Purchases procurement Invoice Logs";
				headers = [
					"Purchase ID",
					"Date",
					"Supplier",
					"Invoice No",
					"Quantity Received",
					"Total Cost",
					"Payment Status"
				];
				rawRows = purchases.filter((p) => isDateInRange(parseAppDate(p.date), startDate, endDate)).map((p) => ({
					"Purchase ID": p.id,
					"Date": p.date,
					"Supplier": p.supplierName,
					"Invoice No": p.invoiceNo,
					"Quantity Received": p.quantity,
					"Total Cost": formatInr(p.amount),
					"Payment Status": p.status,
					_rawQty: p.quantity,
					_rawCost: p.amount
				}));
				break;
			case "customers":
				title = "Mobile Shop Customer Registry Report";
				headers = [
					"Customer ID",
					"Name",
					"Mobile Number",
					"Registered Date",
					"Email",
					"Billing Address"
				];
				rawRows = customers.filter((c) => isDateInRange(parseAppDate(c.registeredDate), startDate, endDate)).map((c) => ({
					"Customer ID": c.id,
					"Name": c.name,
					"Mobile Number": c.mobile,
					"Registered Date": c.registeredDate,
					"Email": c.email || "—",
					"Billing Address": c.address || "—"
				}));
				break;
			case "suppliers":
				title = "Supplier outstanding ledger accounts";
				headers = [
					"Supplier ID",
					"Supplier Name",
					"Contact Info",
					"Outstanding Debt"
				];
				rawRows = suppliers.map((s) => ({
					"Supplier ID": s.id,
					"Supplier Name": s.name,
					"Contact Info": s.contact,
					"Outstanding Debt": formatInr(s.outstanding),
					_rawOutstanding: s.outstanding
				}));
				break;
		}
		if (q) {
			const matchText = q.toLowerCase();
			rawRows = rawRows.filter((row) => Object.values(row).some((val) => String(val).toLowerCase().includes(matchText)));
		}
		return {
			title,
			headers,
			rows: rawRows
		};
	})();
	const handleExportExcel = () => {
		const exportRows = reportData.rows.map((row) => {
			const cleanRow = { ...row };
			Object.keys(cleanRow).forEach((k) => {
				if (k.startsWith("_")) delete cleanRow[k];
			});
			return cleanRow;
		});
		downloadExcel(`${reportType}-report.xlsx`, reportData.title, exportRows);
		toast.success(`${reportData.title} exported to Excel`);
	};
	const renderStats = () => {
		switch (reportType) {
			case "sales":
				const totalSales = reportData.rows.reduce((sum, r) => sum + r._rawTotal, 0);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 md:grid-cols-3 gap-4 mb-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							label: "Total Sales Value",
							value: formatInr(totalSales),
							sub: "Retail turnover"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							label: "Avg Sales Price",
							value: formatInr(reportData.rows.length ? totalSales / reportData.rows.length : 0),
							sub: "Average transaction value"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							label: "Sales Transactions Count",
							value: reportData.rows.length.toString(),
							sub: "Invoices generated"
						})
					]
				});
			case "stock":
				const totalQty = reportData.rows.reduce((sum, r) => sum + r._rawQty, 0);
				const costVal = reportData.rows.reduce((sum, r) => sum + r._rawCostVal, 0);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 md:grid-cols-3 gap-4 mb-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							label: "Total Units in stock",
							value: totalQty.toString(),
							sub: "Physical inventory"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							label: "Asset Valuation (Cost)",
							value: formatInr(costVal),
							sub: "Purchase valuation"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							label: "Total Stock Records",
							value: reportData.rows.length.toString(),
							sub: "Unique catalog items"
						})
					]
				});
			case "profit":
				const netProfit = reportData.rows.reduce((sum, r) => sum + r._rawProfit, 0);
				const unitsSold = reportData.rows.reduce((sum, r) => sum + r._rawUnits, 0);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 md:grid-cols-3 gap-4 mb-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							label: "Estimated Net Profit",
							value: formatInr(netProfit),
							sub: "Total margin value",
							trend: "up"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							label: "Units Sold",
							value: unitsSold.toString(),
							sub: "Smartphones cleared"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							label: "Avg Profit Margin",
							value: formatInr(unitsSold ? netProfit / unitsSold : 0),
							sub: "Margin yield per phone"
						})
					]
				});
			case "purchases":
				const totalCost = reportData.rows.reduce((sum, r) => sum + r._rawCost, 0);
				const totalPItems = reportData.rows.reduce((sum, r) => sum + r._rawQty, 0);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 md:grid-cols-3 gap-4 mb-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							label: "Total Procurement Cost",
							value: formatInr(totalCost),
							sub: "Wholesale expenses paid/debt"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							label: "Quantity Procured",
							value: totalPItems.toString(),
							sub: "Devices delivered"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							label: "Purchases Invoices",
							value: reportData.rows.length.toString(),
							sub: "Logged bills"
						})
					]
				});
			case "customers": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 md:grid-cols-3 gap-4 mb-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
					label: "New Registrations",
					value: reportData.rows.length.toString(),
					sub: "Clients in period"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
					label: "Total Registrations",
					value: customers.length.toString(),
					sub: "Total database size"
				})]
			});
			case "suppliers":
				const outstanding = reportData.rows.reduce((sum, r) => sum + r._rawOutstanding, 0);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 md:grid-cols-3 gap-4 mb-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Outstanding Ledger Debt",
						value: formatInr(outstanding),
						sub: "Total unpaid vendor bills",
						trend: outstanding > 0 ? "warn" : "up"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Registered Wholesalers",
						value: reportData.rows.length.toString(),
						sub: "Supplier accounts"
					})]
				});
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		breadcrumb: "Reports",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3 mb-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-[26px] font-semibold tracking-tight",
					children: "Business Reports & Statements"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-1",
					children: "Analyze sales performance, cost margins, purchase orders and tax collections."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: handleExportExcel,
						className: "h-9 px-4 rounded-md bg-foreground text-background text-sm font-semibold inline-flex items-center gap-1.5 hover:opacity-90 shadow transition-opacity",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-3.5" }), " Export Report (Excel)"]
					})
				})]
			}),
			reportType !== "stock" && reportType !== "suppliers" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterBar, {
				preset: filterPreset,
				onChangePreset: setFilterPreset,
				customStart,
				onChangeStart: setCustomStart,
				customEnd,
				onChangeEnd: setCustomEnd,
				startDate,
				endDate
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-3 md:grid-cols-6 gap-2 mb-6",
				children: [
					{
						id: "sales",
						label: "Sales Report"
					},
					{
						id: "stock",
						label: "Stock Report"
					},
					{
						id: "profit",
						label: "Profit Report"
					},
					{
						id: "purchases",
						label: "Purchase Report"
					},
					{
						id: "customers",
						label: "Customer Report"
					},
					{
						id: "suppliers",
						label: "Supplier Report"
					}
				].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setReportType(item.id),
					className: `h-10 rounded-lg border text-xs font-bold flex items-center justify-center transition-all ${reportType === item.id ? "bg-foreground text-background border-foreground shadow" : "border-border bg-surface hover:bg-accent text-muted-foreground hover:text-foreground"}`,
					children: item.label
				}, item.id))
			}),
			renderStats(),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-4 border-b border-border flex items-center justify-between gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative max-w-sm flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: q,
							onChange: (e) => setQ(e.target.value),
							placeholder: "Search parameters in preview below...",
							className: "h-9 w-full rounded-md border border-border bg-background pl-8 pr-3 text-sm focus:outline-none"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-xs text-muted-foreground font-semibold flex items-center gap-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-3.5 text-muted-foreground" }),
							" ",
							reportData.rows.length,
							" rows generated"
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
					title: reportData.title,
					action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted-foreground",
						children: "Preview grid"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-xs text-left",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
							className: "text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border bg-muted/10",
							children: reportData.headers.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2.5 px-4 font-semibold",
								children: h
							}, h))
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: reportData.rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							colSpan: reportData.headers.length,
							className: "py-12 text-center text-muted-foreground font-semibold",
							children: "No records found matching report search scope."
						}) }) : reportData.rows.map((row, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
							className: "border-b border-border hover:bg-accent/30 transition-colors last:border-0",
							children: reportData.headers.map((h) => {
								const val = row[h];
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: `py-3 px-4 ${h === "Invoice ID" || h === "Total Revenue" || h === "Total Profit" || h === "Outstanding Debt" || h === "Valuation Cost" ? "font-bold text-foreground" : "text-foreground/80"} ${h.includes("Price") || h.includes("Cost") || h.includes("Revenue") || h.includes("Total") || h.includes("Debt") || h.includes("Margin") || h.includes("GST") ? "text-right" : "text-left"}`,
									children: h === "Status" || h === "Payment Status" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										tone: val === "In Stock" || val === "Paid" || val === "Resolved" ? "success" : val === "Low Stock" || val === "Outstanding" || val === "Pending" ? "warning" : "danger",
										children: val
									}) : val
								}, h);
							})
						}, idx)) })]
					})
				})
			] })
		]
	});
}
//#endregion
export { ReportsPage as component };
