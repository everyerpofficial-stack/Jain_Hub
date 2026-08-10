import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { C as Search, D as Plus, gt as ArrowDownLeft, h as SquarePen, p as Trash2, v as ShoppingBag } from "../_libs/lucide-react.mjs";
import { a as DialogFooter, g as useMobileStore, i as DialogDescription, n as Dialog, o as DialogHeader, r as DialogContent, s as DialogTitle } from "./mobileStore-B8EWbC21.mjs";
import { a as SectionHeader, o as StatCard, r as Card, t as AppShell } from "./ui-kit-iW0nuj1I.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/accessories-BQF6GFDE.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AccessoryFormDialog({ a: accessory, onClose }) {
	const addAccessory = useMobileStore((s) => s.addAccessory);
	const updateAccessory = useMobileStore((s) => s.updateAccessory);
	const [name, setName] = (0, import_react.useState)("");
	const [category, setCategory] = (0, import_react.useState)("Other");
	const [stock, setStock] = (0, import_react.useState)("");
	const [purchasePrice, setPurchasePrice] = (0, import_react.useState)("");
	(0, import_react.useState)(() => {
		if (accessory) {
			setName(accessory.name);
			setCategory(accessory.category);
			setStock(accessory.stock.toString());
			setPurchasePrice(accessory.purchasePrice.toString());
		}
	});
	const canSubmit = name.trim() && stock && purchasePrice;
	const handleSave = () => {
		const data = {
			name: name.trim(),
			category: category.trim() || "Other",
			stock: Number(stock),
			minLimit: 0,
			purchasePrice: Number(purchasePrice),
			sellingPrice: 0
		};
		if (accessory) {
			updateAccessory(accessory.id, data);
			toast.success(`Accessory updated: ${name}`);
		} else {
			addAccessory(data);
			toast.success(`Accessory registered: ${name}`);
		}
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
						children: accessory ? "Edit Accessory Details" : "Add Accessory Stock"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
						className: "text-xs text-muted-foreground",
						children: "Save accessories parameters in inventory registry."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "py-4 space-y-3.5 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-semibold text-muted-foreground",
								children: "Accessory Item Name"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: name,
								onChange: (e) => setName(e.target.value),
								placeholder: "e.g. Apple 20W Power Adapter",
								className: "mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-semibold text-muted-foreground",
								children: "Category Name (Manual)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: category,
								onChange: (e) => setCategory(e.target.value),
								placeholder: "e.g. Charger, Case, Screen Guard",
								className: "mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-semibold text-muted-foreground",
									children: "Initial Stock"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "number",
									value: stock,
									onChange: (e) => setStock(e.target.value),
									placeholder: "10",
									className: "mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-semibold text-muted-foreground",
									children: "Cost Price (₹)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "number",
									value: purchasePrice,
									onChange: (e) => setPurchasePrice(e.target.value),
									placeholder: "1000",
									className: "mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
								})]
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
						children: "Save Accessory"
					})]
				})
			]
		})
	});
}
function SellAccessoryDialog({ accessory, onClose }) {
	const sellAccessory = useMobileStore((s) => s.sellAccessory);
	const [qty, setQty] = (0, import_react.useState)("1");
	const [price, setPrice] = (0, import_react.useState)("");
	const handleCheckout = () => {
		const sellQty = Number(qty);
		const sellPrice = Number(price);
		if (sellQty > accessory.stock) {
			toast.error(`Cannot sell more than available stock (${accessory.stock})`);
			return;
		}
		if (sellPrice <= 0) {
			toast.error("Please enter a valid selling price");
			return;
		}
		sellAccessory(accessory.id, sellQty);
		toast.success(`Sold ${sellQty} unit(s) of ${accessory.name} for ₹${sellPrice * sellQty}`);
		onClose();
	};
	const cost = (Number(price) || 0) * (Number(qty) || 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: true,
		onOpenChange: (open) => !open && onClose(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-sm rounded-xl border border-border shadow-2xl p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
					className: "border-b border-border pb-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
						className: "text-base font-bold flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDownLeft, { className: "size-5 text-success" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Sell Accessory Item" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
						className: "text-xs text-muted-foreground",
						children: "Quick invoice checkout for accessory item."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "py-4 space-y-3.5 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bg-muted/30 p-2.5 rounded border border-border/60 text-xs flex justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Available Stock:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
								className: "text-foreground",
								children: [accessory.stock, " units"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-semibold text-muted-foreground",
								children: "Sales Quantity"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "number",
								min: "1",
								max: accessory.stock,
								value: qty,
								onChange: (e) => setQty(e.target.value),
								className: "mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-semibold text-muted-foreground",
								children: "Selling Price (₹)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "number",
								value: price,
								onChange: (e) => setPrice(e.target.value),
								placeholder: "e.g. 1200",
								className: "mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between items-center text-xs border-t border-border pt-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground font-semibold",
								children: "Total Price:"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-base font-extrabold text-success",
								children: ["₹", cost.toLocaleString("en-IN")]
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
						disabled: !qty || Number(qty) <= 0 || Number(qty) > accessory.stock || !price || Number(price) <= 0,
						onClick: handleCheckout,
						className: "h-9 px-4 rounded-md bg-foreground text-background text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all ml-auto animate-pulse",
						children: "Record Sale"
					})]
				})
			]
		})
	});
}
function AccessoriesPage() {
	const accessories = useMobileStore((s) => s.accessories);
	const deleteAccessory = useMobileStore((s) => s.deleteAccessory);
	const [q, setQ] = (0, import_react.useState)("");
	const [selectedCategoryTab, setSelectedCategoryTab] = (0, import_react.useState)("All");
	const [isAdding, setIsAdding] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [selling, setSelling] = (0, import_react.useState)(null);
	const filtered = accessories.filter((a) => {
		if (selectedCategoryTab !== "All" && a.category !== selectedCategoryTab) return false;
		if (q) {
			const text = q.toLowerCase();
			return [
				a.name,
				a.category,
				a.status
			].some((v) => v.toLowerCase().includes(text));
		}
		return true;
	});
	const totalQuantity = accessories.reduce((sum, item) => sum + item.stock, 0);
	accessories.reduce((sum, item) => sum + item.purchasePrice * item.stock, 0);
	accessories.filter((item) => item.status === "Low Stock").length;
	const categories = ["All", ...Array.from(new Set(accessories.map((a) => a.category)))];
	const formatInr = (num) => "₹" + Math.round(num).toLocaleString("en-IN");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		breadcrumb: "Accessories",
		children: [
			(isAdding || editing) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccessoryFormDialog, {
				a: editing || void 0,
				onClose: () => {
					setIsAdding(false);
					setEditing(null);
				}
			}),
			selling && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SellAccessoryDialog, {
				accessory: selling,
				onClose: () => setSelling(null)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3 mb-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-[26px] font-semibold tracking-tight",
					children: "Accessories Inventory"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-1",
					children: "Procure, stock and track chargers, covers, screen guards, and earbuds."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setIsAdding(true),
						className: "h-9 px-4 rounded-md bg-foreground text-background text-sm font-semibold inline-flex items-center gap-1.5 hover:opacity-90 shadow transition-opacity",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" }), " Add Accessory"]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
					label: "Catalog Items",
					value: accessories.length.toString(),
					sub: "Unique items registered",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, { className: "size-4" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
					label: "Physical Stock Units",
					value: totalQuantity.toString(),
					sub: "Total item stock",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, { className: "size-4" }),
					trend: "up"
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
							placeholder: "Search accessory name, category, status...",
							className: "h-9 w-full rounded-md border border-border bg-background pl-8 pr-3 text-sm focus:outline-none"
						})]
					}), categories.map((cat) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setSelectedCategoryTab(cat),
						className: `h-9 px-3.5 rounded-md border text-xs font-bold transition-all duration-200 ${selectedCategoryTab === cat ? "bg-foreground text-background border-foreground shadow-sm" : "border-border bg-surface hover:bg-accent text-muted-foreground hover:text-foreground"}`,
						children: [cat, cat !== "All" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ml-1.5 opacity-60",
							children: accessories.filter((a) => a.category === cat).length
						})]
					}, cat))]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
					title: `${filtered.length} Accessory Types`,
					action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted-foreground",
						children: "Perform direct cash sales using sell button"
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
									children: "Accessory ID"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3 px-4 font-semibold",
									children: "Item Description"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3 px-4 font-semibold",
									children: "Category Type"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3 px-4 text-center font-semibold",
									children: "Stock Qty"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3 px-4 text-right font-semibold",
									children: "Purchase Price (Cost)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3 px-5 text-right font-semibold",
									children: "Ledger Actions"
								})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							colSpan: 6,
							className: "py-12 text-center text-muted-foreground font-semibold",
							children: "No accessory items match selection filters."
						}) }) : filtered.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border hover:bg-accent/40 transition-colors last:border-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-3 px-5 font-mono text-xs text-muted-foreground",
									children: item.id
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-3 px-4 font-semibold text-foreground",
									children: item.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-3 px-4 text-muted-foreground",
									children: item.category
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-3 px-4 text-center font-bold text-base text-foreground",
									children: item.stock
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-3 px-4 text-right font-medium text-muted-foreground",
									children: formatInr(item.purchasePrice)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-3 px-5 text-right",
									onClick: (e) => e.stopPropagation(),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "inline-flex gap-1.5",
										children: [
											item.stock > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												title: "Quick Cash Sale",
												onClick: () => setSelling(item),
												className: "h-7 px-2.5 rounded border border-success/15 bg-success/5 text-success inline-flex items-center gap-1 hover:bg-success hover:text-white transition-all text-xs font-semibold shadow-sm",
												children: "Sell"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												title: "Edit accessory specifications",
												onClick: () => setEditing(item),
												className: "size-8 rounded border border-border bg-surface text-foreground grid place-items-center hover:bg-accent transition-colors shadow-sm",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquarePen, { className: "size-3.5" })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												title: "Delete accessory",
												onClick: () => {
													if (confirm(`Are you sure you want to delete accessory ${item.name}?`)) {
														deleteAccessory(item.id);
														toast.success(`Deleted ${item.name}`);
													}
												},
												className: "size-8 rounded border border-destructive/15 bg-destructive/5 text-destructive grid place-items-center hover:bg-destructive hover:text-white transition-colors",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" })
											})
										]
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
export { AccessoriesPage as component };
