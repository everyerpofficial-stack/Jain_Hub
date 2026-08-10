import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { B as Layers, C as Search, at as CircleAlert, x as ShieldAlert } from "../_libs/lucide-react.mjs";
import { g as useMobileStore } from "./mobileStore-B8EWbC21.mjs";
import { a as SectionHeader, n as Badge, o as StatCard, r as Card, t as AppShell } from "./ui-kit-iW0nuj1I.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/inventory-CX0QTwas.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function InventoryPage() {
	const inventory = useMobileStore((s) => s.inventory);
	const [q, setQ] = (0, import_react.useState)("");
	const [filterStatus, setFilterStatus] = (0, import_react.useState)("All");
	const filtered = inventory.filter((item) => {
		if (item.quantity <= 0) return false;
		if (filterStatus !== "All" && item.status !== filterStatus) return false;
		if (q) {
			const text = q.toLowerCase();
			return [
				item.productName,
				item.brand,
				item.status
			].some((v) => v.toLowerCase().includes(text));
		}
		return true;
	});
	const totalQuantity = inventory.reduce((s, i) => s + i.quantity, 0);
	inventory.reduce((s, i) => s + i.purchasePrice * i.quantity, 0);
	const lowStockCount = inventory.filter((i) => i.status === "Low Stock").length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		breadcrumb: "Inventory",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap items-end justify-between gap-3 mb-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-[26px] font-semibold tracking-tight",
					children: "Inventory & Stock Levels"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-1",
					children: "Real-time stock quantities and statuses."
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
					label: "Total Physical Stock",
					value: totalQuantity.toString(),
					sub: "Units in store room",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "size-4" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
					label: "Low Stock Models",
					value: lowStockCount.toString(),
					sub: "Requires inward orders",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-4" }),
					trend: lowStockCount > 0 ? "warn" : void 0
				})]
			}),
			lowStockCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6 flex items-start gap-3 rounded-xl border border-warning/45 bg-warning/5 px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "size-4 text-warning shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-semibold text-warning",
						children: [lowStockCount, " models are low on stock."]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-muted-foreground ml-1.5",
						children: [
							"Review items marked with a ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								tone: "warning",
								children: "Low Stock"
							}),
							" badge in the listing."
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-4 border-b border-border flex flex-wrap items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative flex-1 min-w-[220px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: q,
							onChange: (e) => setQ(e.target.value),
							placeholder: "Search stock by product name, brand, model...",
							className: "h-9 w-full rounded-md border border-border bg-background pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
						})]
					}), [
						"All",
						"In Stock",
						"Low Stock"
					].map((status) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setFilterStatus(status),
						className: `h-9 px-3.5 rounded-md border text-xs font-bold transition-all duration-200 ${filterStatus === status ? "bg-foreground text-background border-foreground shadow-sm" : "border-border bg-surface hover:bg-accent text-muted-foreground hover:text-foreground"}`,
						children: [status, status !== "All" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ml-1.5 opacity-60",
							children: inventory.filter((item) => item.status === status).length
						})]
					}, status))]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
					title: `${filtered.length} Stock Records`,
					action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted-foreground",
						children: "Active products inventory list"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-sm text-left",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border bg-muted/10",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3 px-5 font-semibold",
									children: "SKU / Product ID"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3 px-4 font-semibold",
									children: "Brand & Product Name"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3 px-4 text-center font-semibold",
									children: "In Stock Qty"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3 px-4 font-semibold",
									children: "Status"
								})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							colSpan: 4,
							className: "py-12 text-center text-muted-foreground font-medium",
							children: "No stock records found matching filters."
						}) }) : filtered.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border hover:bg-accent/40 transition-colors last:border-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-3 px-5 font-mono text-xs text-muted-foreground",
									children: item.productId
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "py-3 px-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "font-semibold text-foreground",
										children: item.productName
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-xs text-muted-foreground",
										children: item.brand
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-3 px-4 text-center font-bold text-base text-foreground",
									children: item.quantity
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-3 px-4",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										tone: item.status === "In Stock" ? "success" : item.status === "Low Stock" ? "warning" : "danger",
										children: item.status
									})
								})
							]
						}, item.id)) })]
					})
				})
			] })
		]
	});
}
//#endregion
export { InventoryPage as component };
