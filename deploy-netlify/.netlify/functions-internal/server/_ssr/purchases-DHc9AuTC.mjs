import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { $ as CreditCard, C as Search, D as Plus, E as Printer, T as Receipt, Z as Download, ft as Calendar, i as Users } from "../_libs/lucide-react.mjs";
import { a as DialogFooter, f as isDateInRange, g as useMobileStore, i as DialogDescription, n as Dialog, o as DialogHeader, p as parseAppDate, r as DialogContent, s as DialogTitle } from "./mobileStore-B8EWbC21.mjs";
import { a as SectionHeader, n as Badge, o as StatCard, r as Card, t as AppShell } from "./ui-kit-iW0nuj1I.mjs";
import { n as useDateFilter, t as FilterBar } from "./FilterBar-B1CYUr5_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/purchases-DHc9AuTC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PurchaseFormDialog({ onClose, onPurchaseLogged }) {
	const suppliers = useMobileStore((s) => s.suppliers);
	const products = useMobileStore((s) => s.products);
	const recordPurchase = useMobileStore((s) => s.recordPurchase);
	const addProduct = useMobileStore((s) => s.addProduct);
	const [supplierId, setSupplierId] = (0, import_react.useState)("");
	const [invoiceNo, setInvoiceNo] = (0, import_react.useState)("");
	const [date, setDate] = (0, import_react.useState)((/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
	const [productId, setProductId] = (0, import_react.useState)("");
	const [qty, setQty] = (0, import_react.useState)("1");
	const [cost, setCost] = (0, import_react.useState)("");
	const [payNow, setPayNow] = (0, import_react.useState)(false);
	const [items, setItems] = (0, import_react.useState)([]);
	const [showQuickAdd, setShowQuickAdd] = (0, import_react.useState)(false);
	const [quickCategory, setQuickCategory] = (0, import_react.useState)("TV");
	const [quickName, setQuickName] = (0, import_react.useState)("");
	const [quickBrand, setQuickBrand] = (0, import_react.useState)("Samsung");
	const [quickModel, setQuickModel] = (0, import_react.useState)("");
	const [quickSpec, setQuickSpec] = (0, import_react.useState)("");
	const [quickColor, setQuickColor] = (0, import_react.useState)("");
	const [quickCost, setQuickCost] = (0, import_react.useState)("");
	const [quickRemark, setQuickRemark] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (suppliers.length > 0 && !supplierId) setSupplierId(suppliers[0].id);
		if (products.length > 0 && !productId) {
			setProductId(products[0].id);
			setCost(products[0].purchasePrice.toString());
		}
	}, [suppliers, products]);
	(0, import_react.useEffect)(() => {
		const p = products.find((prod) => prod.id === productId);
		if (p) setCost(p.purchasePrice.toString());
	}, [productId, products]);
	const handleAddItem = () => {
		const p = products.find((prod) => prod.id === productId);
		if (!p) return;
		const qtyNum = Number(qty) || 0;
		const costNum = Number(cost) || 0;
		if (qtyNum <= 0 || costNum <= 0) {
			toast.error("Please enter valid quantity and unit cost");
			return;
		}
		const existingIndex = items.findIndex((item) => item.productId === productId);
		if (existingIndex > -1) {
			const updated = [...items];
			updated[existingIndex].quantity += qtyNum;
			updated[existingIndex].cost = costNum;
			setItems(updated);
		} else setItems([...items, {
			productId,
			productName: `${p.brand} ${p.name} (${p.ramRom})`,
			quantity: qtyNum,
			cost: costNum
		}]);
		toast.success(`Added ${qty}x ${p.name} to draft invoice list`);
	};
	const handleRemoveItem = (index) => {
		setItems(items.filter((_, i) => i !== index));
	};
	const handleQuickAddProduct = () => {
		if (!quickName.trim() || !quickModel.trim() || !quickCost) {
			toast.error("Please fill required fields for quick register");
			return;
		}
		const specs = quickSpec.trim() || "Default Specs";
		const clr = quickColor.trim() || "Default";
		const rawCost = Number(quickCost);
		addProduct({
			name: quickName.trim(),
			brand: quickBrand,
			model: quickModel.trim(),
			ramRom: specs,
			color: clr,
			category: quickCategory,
			purchasePrice: rawCost,
			remark: quickRemark.trim()
		});
		toast.success(`Successfully registered ${quickName} to catalog!`);
		setQuickName("");
		setQuickModel("");
		setQuickSpec("");
		setQuickColor("");
		setQuickCost("");
		setQuickRemark("");
		setShowQuickAdd(false);
	};
	const selectedSupplier = suppliers.find((s) => s.id === supplierId);
	const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
	const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.cost, 0);
	const canSubmit = supplierId && invoiceNo.trim() && date.trim() && items.length > 0;
	const handleSubmit = () => {
		if (!selectedSupplier) return;
		const newPur = recordPurchase({
			supplierId,
			supplierName: selectedSupplier.name,
			invoiceNo: invoiceNo.trim(),
			date: new Date(date).toLocaleDateString("en-IN", {
				day: "2-digit",
				month: "short",
				year: "numeric"
			}),
			quantity: totalQty,
			payNow,
			items
		});
		toast.success(`Purchase logged successfully for invoice ${invoiceNo} with ${items.length} items`);
		if (onPurchaseLogged) onPurchaseLogged(newPur);
		onClose();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: true,
		onOpenChange: (open) => !open && onClose(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-lg rounded-xl border border-border shadow-2xl p-6 max-h-[90vh] overflow-y-auto",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
					className: "border-b border-border pb-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
						className: "text-base font-bold flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Record Vendor Purchase Order" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
						className: "text-xs text-muted-foreground",
						children: "Log inward supplier invoices with one or more products."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "py-4 space-y-4 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-semibold text-muted-foreground",
								children: "Supplier"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								value: supplierId,
								onChange: (e) => setSupplierId(e.target.value),
								className: "mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20",
								children: suppliers.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
									value: s.id,
									children: [
										s.name,
										" (",
										s.gstNo || "No GST",
										")"
									]
								}, s.id))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-semibold text-muted-foreground",
									children: "Invoice / Bill Number"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: invoiceNo,
									onChange: (e) => setInvoiceNo(e.target.value),
									placeholder: "e.g. BILL/9903",
									className: "mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-semibold text-muted-foreground",
									children: "Purchase Date"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "date",
									value: date,
									onChange: (e) => setDate(e.target.value),
									className: "mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "border border-border/80 rounded-lg p-3 bg-muted/10",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-[10px] text-muted-foreground uppercase font-bold tracking-wider block mb-2",
								children: [
									"Invoice Added Items (",
									items.length,
									")"
								]
							}), items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-center py-4 text-xs text-muted-foreground italic border border-dashed border-border/60 rounded",
								children: "No items added yet. Pick products below."
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "overflow-hidden border border-border/60 rounded bg-surface text-xs max-h-[160px] overflow-y-auto",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
									className: "w-full text-left",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "text-muted-foreground bg-muted/40 uppercase text-[9px] border-b border-border",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "py-1.5 px-2 font-semibold",
												children: "Product"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "py-1.5 px-2 text-center font-semibold",
												children: "Qty"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "py-1.5 px-2 text-right font-semibold",
												children: "Cost"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "py-1.5 px-2 text-right font-semibold",
												children: "Total"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "py-1.5 px-2 text-right font-semibold",
												children: "Action"
											})
										]
									}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: items.map((item, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "border-b border-border last:border-0 hover:bg-accent/15",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-1.5 px-2 font-medium truncate max-w-[150px]",
												title: item.productName,
												children: item.productName
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-1.5 px-2 text-center font-semibold",
												children: item.quantity
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "py-1.5 px-2 text-right",
												children: ["₹", item.cost.toLocaleString("en-IN")]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "py-1.5 px-2 text-right font-bold",
												children: ["₹", (item.quantity * item.cost).toLocaleString("en-IN")]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-1.5 px-2 text-right",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													onClick: () => handleRemoveItem(idx),
													className: "text-red-500 hover:text-red-700 font-bold px-1.5",
													children: "✕"
												})
											})
										]
									}, idx)) })]
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "border-t border-dashed border-border/80 pt-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between mb-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] text-muted-foreground font-mono uppercase tracking-widest font-bold",
										children: "Add Product Item"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setShowQuickAdd(true),
										className: "text-xs text-primary font-bold hover:underline",
										children: "+ Quick Register Product"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "block mb-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs font-semibold text-muted-foreground",
										children: "Select Product Model"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
										value: productId,
										onChange: (e) => setProductId(e.target.value),
										className: "mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20",
										children: products.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
											value: p.id,
											children: [
												p.brand,
												" ",
												p.name,
												" (",
												p.ramRom,
												")"
											]
										}, p.id))
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3 items-end",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "block",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs font-semibold text-muted-foreground",
											children: "Quantity"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "number",
											min: "1",
											value: qty,
											onChange: (e) => setQty(e.target.value),
											className: "mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "block",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs font-semibold text-muted-foreground",
											children: "Cost per Unit (₹)"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "number",
											value: cost,
											onChange: (e) => setCost(e.target.value),
											className: "mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: handleAddItem,
									className: "mt-2.5 w-full h-8 rounded border border-primary/20 bg-primary/5 text-primary text-xs font-bold hover:bg-primary hover:text-white transition-all shadow-sm",
									children: "+ Add Item to Order"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 py-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								id: "paynow",
								checked: payNow,
								onChange: (e) => setPayNow(e.target.checked),
								className: "rounded border-border text-primary focus:ring-0 cursor-pointer"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								htmlFor: "paynow",
								className: "text-xs font-semibold text-foreground/80 cursor-pointer",
								children: "Mark invoice as fully paid immediately (Cash / Bank)"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg border border-border bg-muted/20 px-4 py-3 space-y-1 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: "Total Added Quantity:"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-semibold text-foreground",
										children: [totalQty, " units"]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between border-t border-border pt-1.5 mt-1.5 font-bold text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-foreground",
										children: "Total Invoice Value:"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-success",
										children: ["₹", totalAmount.toLocaleString("en-IN")]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between text-[10px] text-muted-foreground italic mt-0.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Payment Terms:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: payNow ? "text-success font-bold" : "text-warning font-bold",
										children: payNow ? "Paid Bill" : "Added to Outstanding Ledger"
									})]
								})
							]
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
						onClick: handleSubmit,
						className: "h-9 px-5 rounded-md bg-foreground text-background text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all ml-auto",
						children: "Log Purchase Bill"
					})]
				})
			]
		})
	}), showQuickAdd && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: true,
		onOpenChange: (open) => !open && setShowQuickAdd(false),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-sm rounded-xl border border-border bg-background shadow-2xl p-5 max-h-[85vh] overflow-y-auto",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
					className: "border-b border-border pb-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
						className: "text-sm font-bold",
						children: "Quick Register Product"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
						className: "text-[11px] text-muted-foreground",
						children: "Register new model on the fly."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3 py-3 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold text-muted-foreground",
								children: "Category"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								value: quickCategory,
								onChange: (e) => setQuickCategory(e.target.value),
								className: "mt-1 h-8 w-full rounded border border-border bg-surface px-2 focus:outline-none",
								children: [
									"TV",
									"Frize",
									"Waching Machine",
									"Smartphones",
									"Basic Phones",
									"Tablets"
								].map((cat) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: cat,
									children: cat === "Frize" ? "Fridge (Frize)" : cat === "Waching Machine" ? "Washing Machine" : cat
								}, cat))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold text-muted-foreground",
								children: "Name"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: quickName,
								onChange: (e) => setQuickName(e.target.value),
								placeholder: "e.g. Redmi Smart TV",
								className: "mt-1 h-8 w-full rounded border border-border bg-surface px-2 focus:outline-none"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold text-muted-foreground",
									children: "Brand"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									value: quickBrand,
									onChange: (e) => setQuickBrand(e.target.value),
									className: "mt-1 h-8 w-full rounded border border-border bg-surface px-2 focus:outline-none",
									children: [
										"Samsung",
										"LG",
										"Sony",
										"Haier",
										"Whirlpool",
										"Godrej",
										"Apple",
										"OnePlus",
										"Vivo",
										"Oppo",
										"Xiaomi",
										"Realme",
										"Nokia"
									].map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: b,
										children: b
									}, b))
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold text-muted-foreground",
									children: "Model Code"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: quickModel,
									onChange: (e) => setQuickModel(e.target.value),
									placeholder: "e.g. L32M6-RA",
									className: "mt-1 h-8 w-full rounded border border-border bg-surface px-2 focus:outline-none"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold text-muted-foreground",
									children: "Specs (RAM/Size)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: quickSpec,
									onChange: (e) => setQuickSpec(e.target.value),
									placeholder: "e.g. 32 Inch or 8GB/128GB",
									className: "mt-1 h-8 w-full rounded border border-border bg-surface px-2 focus:outline-none"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold text-muted-foreground",
									children: "Color / Type"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: quickColor,
									onChange: (e) => setQuickColor(e.target.value),
									placeholder: "e.g. Black, QLED",
									className: "mt-1 h-8 w-full rounded border border-border bg-surface px-2 focus:outline-none"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold text-muted-foreground",
								children: "Cost Price (₹)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "number",
								value: quickCost,
								onChange: (e) => setQuickCost(e.target.value),
								placeholder: "12000",
								className: "mt-1 h-8 w-full rounded border border-border bg-surface px-2 focus:outline-none"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold text-muted-foreground",
								children: "Remark"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: quickRemark,
								onChange: (e) => setQuickRemark(e.target.value),
								placeholder: "Notes...",
								className: "mt-1 h-8 w-full rounded border border-border bg-surface px-2 focus:outline-none"
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
					className: "border-t border-border pt-3 flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setShowQuickAdd(false),
						className: "h-8 px-3 rounded border border-border bg-surface text-xs hover:bg-accent",
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: handleQuickAddProduct,
						className: "h-8 px-4 rounded bg-foreground text-background text-xs font-semibold hover:opacity-90 ml-auto",
						children: "Register"
					})]
				})
			]
		})
	})] });
}
function SupplierPayDialog({ supplier, onClose }) {
	const paySupplier = useMobileStore((s) => s.paySupplier);
	const [amount, setAmount] = (0, import_react.useState)("");
	const [date, setDate] = (0, import_react.useState)((/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
	const [remark, setRemark] = (0, import_react.useState)("");
	const handleSave = () => {
		const amt = Number(amount);
		if (amt > supplier.outstanding) {
			toast.error("Cannot record payment larger than total outstanding balance");
			return;
		}
		const formattedDate = new Date(date).toLocaleDateString("en-IN", {
			day: "2-digit",
			month: "short",
			year: "numeric"
		});
		paySupplier(supplier.id, amt, formattedDate, remark.trim());
		toast.success(`Payment of ₹${amt.toLocaleString("en-IN")} recorded for ${supplier.name}`);
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
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
						className: "text-base font-bold flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "size-5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Pay Supplier Balance" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, {
						className: "text-xs text-muted-foreground",
						children: ["Clear outstanding debt ledger for ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: supplier.name })]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "py-4 space-y-3 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between items-center bg-muted/30 p-2.5 rounded border border-border/60 text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground font-medium",
								children: "Outstanding Balance:"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-bold text-danger text-sm",
								children: ["₹", supplier.outstanding.toLocaleString("en-IN")]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-semibold text-muted-foreground",
								children: "Payment Date"
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
								children: "Payment Amount Paid (₹)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "number",
								max: supplier.outstanding,
								value: amount,
								onChange: (e) => setAmount(e.target.value),
								placeholder: "e.g. 50000",
								className: "mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-semibold text-muted-foreground",
								children: "Remark / Ref (optional)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: remark,
								onChange: (e) => setRemark(e.target.value),
								placeholder: "e.g. Bank Ref #9928",
								className: "mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
					className: "border-t border-border pt-4 flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onClose,
						className: "h-9 px-3 rounded-md border border-border bg-surface text-sm hover:bg-accent transition-colors",
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						disabled: !amount || Number(amount) <= 0,
						onClick: handleSave,
						className: "h-9 px-4 rounded-md bg-foreground text-background text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all ml-auto",
						children: "Record Payment"
					})]
				})
			]
		})
	});
}
function PurchasesPage() {
	const purchases = useMobileStore((s) => s.purchases);
	const suppliers = useMobileStore((s) => s.suppliers);
	const settings = useMobileStore((s) => s.settings);
	const [q, setQ] = (0, import_react.useState)("");
	const [selectedSupplierTab, setSelectedSupplierTab] = (0, import_react.useState)("All");
	const [isAdding, setIsAdding] = (0, import_react.useState)(false);
	const [payingSupplier, setPayingSupplier] = (0, import_react.useState)(null);
	const handlePrint = (purchase) => {
		const printWindow = window.open("", "_blank");
		if (!printWindow) {
			toast.error("Popup blocked! Enable popups to print invoices");
			return;
		}
		const supplier = suppliers.find((s) => s.id === purchase.supplierId);
		const itemHtml = purchase.items.map((item) => `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 12px; color: #334155;">
          <strong>${item.productName}</strong>
        </td>
        <td style="padding: 12px; text-align: center; color: #334155;">${item.quantity}</td>
        <td style="padding: 12px; text-align: right; font-weight: 500; color: #0f172a;">₹${item.cost.toLocaleString("en-IN")}</td>
        <td style="padding: 12px; text-align: right; font-weight: 700; color: #0f172a;">₹${(item.cost * item.quantity).toLocaleString("en-IN")}</td>
      </tr>
    `).join("");
		const invoiceContent = `
      <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; padding: 40px; max-width: 800px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; background: white; color: #1e293b; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);">
        <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #f1f5f9; padding-bottom: 24px; margin-bottom: 24px;">
          <div>
            <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #0f172a; letter-spacing: -0.025em; text-transform: uppercase;">${supplier ? supplier.name : purchase.supplierName}</h1>
            <p style="margin: 6px 0 0 0; font-size: 13px; color: #64748b; font-weight: 500;">Purchase Invoice (Inward)</p>
            ${supplier && supplier.gstNo ? `<p style="margin: 2px 0 0 0; font-size: 12px; color: #94a3b8;">GSTIN: ${supplier.gstNo}</p>` : ""}
            ${supplier && supplier.address ? `<p style="margin: 2px 0 0 0; font-size: 12px; color: #94a3b8;">${supplier.address}</p>` : ""}
            ${supplier && supplier.contact ? `<p style="margin: 2px 0 0 0; font-size: 11px; color: #94a3b8; font-family: monospace;">Contact: ${supplier.contact}</p>` : ""}
          </div>
          <div style="text-align: right;">
            <h2 style="margin: 0; font-size: 15px; font-weight: 700; color: #16a34a; text-transform: uppercase;">Inward Bill</h2>
            <p style="margin: 6px 0 0 0; font-size: 13px; font-weight: 600; color: #0f172a;">Bill ID: <strong>${purchase.id}</strong></p>
            <p style="margin: 2px 0 0 0; font-size: 12px; color: #64748b;">Invoice No: <strong>${purchase.invoiceNo}</strong></p>
            <p style="margin: 2px 0 0 0; font-size: 12px; color: #64748b;">Date: ${purchase.date}</p>
          </div>
        </div>

        <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 30px; font-size: 13px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div>
            <h3 style="margin: 0 0 8px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em;">Billed To (Store Details)</h3>
            <p style="margin: 3px 0;"><strong>Name:</strong> ${settings.storeName}</p>
            ${settings.gstNo ? `<p style="margin: 3px 0;"><strong>GSTIN:</strong> ${settings.gstNo}</p>` : ""}
            <p style="margin: 3px 0;"><strong>Address:</strong> ${settings.address}</p>
            <p style="margin: 3px 0;"><strong>Contact:</strong> ${settings.contact}</p>
          </div>
          <div style="border-left: 1px solid #e2e8f0; padding-left: 16px;">
            <h3 style="margin: 0 0 8px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em;">Payment Details</h3>
            <p style="margin: 3px 0;"><strong>Status:</strong> ${purchase.status}</p>
            <p style="margin: 3px 0;"><strong>Total Purchase Amount:</strong> ₹${purchase.amount.toLocaleString("en-IN")}</p>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 13px;">
          <thead>
            <tr style="border-bottom: 2px solid #e2e8f0; background: #f8fafc; text-align: left;">
              <th style="padding: 12px; font-weight: 600; color: #475569;">Description of Goods</th>
              <th style="padding: 12px; text-align: center; font-weight: 600; color: #475569;">Qty</th>
              <th style="padding: 12px; text-align: right; font-weight: 600; color: #475569;">Rate</th>
              <th style="padding: 12px; text-align: right; font-weight: 600; color: #475569;">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemHtml}
            <tr style="font-weight: 700; font-size: 15px; background: #f1f5f9; border-top: 2px solid #cbd5e1;">
              <td colspan="2" style="padding: 12px; border-radius: 0 0 0 8px;">Grand Total Value:</td>
              <td style="padding: 12px; text-align: right;">Total Amount:</td>
              <td style="padding: 12px; text-align: right; color: #16a34a; border-radius: 0 0 8px 0;">₹${purchase.amount.toLocaleString("en-IN")}</td>
            </tr>
          </tbody>
        </table>

        <div style="margin-top: 60px; display: flex; justify-content: space-between; font-size: 12px; color: #64748b;">
          <div style="text-align: center;">
            <div style="border-top: 1px solid #cbd5e1; width: 180px; padding-top: 8px; font-weight: 500;">Receiver's Acknowledgment</div>
          </div>
          <div style="text-align: center;">
            <div style="border-top: 1px solid #cbd5e1; width: 180px; padding-top: 8px; font-weight: 500; margin-left: auto;">Supplier's Signature</div>
          </div>
        </div>
      </div>
    `;
		printWindow.document.write(invoiceContent);
		printWindow.document.close();
		printWindow.focus();
		setTimeout(() => {
			printWindow.print();
		}, 250);
	};
	const { preset: filterPreset, setPreset: setFilterPreset, customStart, setCustomStart, customEnd, setCustomEnd, startDate, endDate } = useDateFilter();
	(0, import_react.useEffect)(() => {
		if (sessionStorage.getItem("mobiles_trigger_new_purchase") === "true") {
			setIsAdding(true);
			sessionStorage.removeItem("mobiles_trigger_new_purchase");
		}
	}, []);
	const filteredPurchases = purchases.filter((p) => {
		if (!isDateInRange(parseAppDate(p.date), startDate, endDate)) return false;
		if (selectedSupplierTab !== "All" && p.supplierName !== selectedSupplierTab) return false;
		if (q) {
			const text = q.toLowerCase();
			return [
				p.invoiceNo,
				p.supplierName,
				p.id
			].some((v) => v.toLowerCase().includes(text));
		}
		return true;
	});
	const totalOutstanding = suppliers.reduce((sum, s) => sum + s.outstanding, 0);
	const periodPurchaseVal = filteredPurchases.reduce((sum, p) => sum + p.amount, 0);
	const periodQtyVal = filteredPurchases.reduce((sum, p) => sum + p.quantity, 0);
	const formatInr = (num) => "₹" + Math.round(num).toLocaleString("en-IN");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		breadcrumb: "Purchases",
		children: [
			isAdding && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PurchaseFormDialog, {
				onClose: () => setIsAdding(false),
				onPurchaseLogged: (p) => handlePrint(p)
			}),
			payingSupplier && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SupplierPayDialog, {
				supplier: payingSupplier,
				onClose: () => setPayingSupplier(null)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3 mb-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-[26px] font-semibold tracking-tight",
					children: "Wholesale Purchase History"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-1",
					children: "Track inward product bills, GST invoices, and supplier ledgers."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => toast.success("Purchase report exported"),
						className: "h-9 px-3 rounded-md border border-border bg-surface text-sm inline-flex items-center gap-1.5 hover:bg-accent font-semibold transition-colors shadow-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-3.5" }), " Export Logs"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setIsAdding(true),
						className: "h-9 px-4 rounded-md bg-foreground text-background text-sm font-semibold inline-flex items-center gap-1.5 hover:opacity-90 shadow transition-opacity",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" }), " Record Purchase"]
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
						label: "Total Outstanding Debt",
						value: formatInr(totalOutstanding),
						sub: "Sum of unpaid ledgers",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "size-4" }),
						trend: totalOutstanding > 0 ? "warn" : "up"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Period Purchases Value",
						value: formatInr(periodPurchaseVal),
						sub: `${filteredPurchases.length} invoices logged`,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "size-4" }),
						trend: "up"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Inward Stock Units",
						value: periodQtyVal.toString(),
						sub: "Units received",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Total Suppliers",
						value: suppliers.length.toString(),
						sub: "Wholesale vendors",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-4" })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "lg:col-span-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, { title: "Supplier Outstanding Balances" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "divide-y divide-border",
						children: suppliers.map((sup) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "p-4 flex items-center justify-between text-sm hover:bg-accent/20 transition-colors",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-semibold text-foreground",
								children: sup.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-muted-foreground mt-0.5",
								children: sup.contact
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-right",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: `font-bold ${sup.outstanding > 0 ? "text-danger" : "text-success"}`,
									children: formatInr(sup.outstanding)
								}), sup.outstanding > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setPayingSupplier(sup),
									className: "mt-1 h-6 px-2 rounded border border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-white transition-colors text-[10px] font-bold shadow-sm",
									children: "Clear Balance"
								})]
							})]
						}, sup.id))
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "lg:col-span-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-4 border-b border-border flex flex-wrap items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative flex-1 min-w-[200px]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: q,
									onChange: (e) => setQ(e.target.value),
									placeholder: "Search invoice number, supplier name...",
									className: "h-9 w-full rounded-md border border-border bg-background pl-8 pr-3 text-sm focus:outline-none"
								})]
							}), ["All", ...suppliers.map((s) => s.name)].map((tab) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setSelectedSupplierTab(tab),
								className: `h-9 px-3 rounded-md border text-xs font-bold transition-all duration-200 ${selectedSupplierTab === tab ? "bg-foreground text-background border-foreground shadow-sm" : "border-border bg-surface hover:bg-accent text-muted-foreground"}`,
								children: tab
							}, tab))]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
							title: "Logged Inward Purchase Invoices",
							action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground",
								children: "Historical records list"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "overflow-x-auto",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "w-full text-xs text-left",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border bg-muted/10",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2.5 px-4 font-semibold",
											children: "Bill ID"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2.5 px-4 font-semibold",
											children: "Date"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2.5 px-4 font-semibold",
											children: "Supplier Name"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2.5 px-4 font-semibold",
											children: "Invoice No"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2.5 px-4 text-center font-semibold",
											children: "Items Qty"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2.5 px-4 font-semibold",
											children: "Total Cost"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2.5 px-4 font-semibold",
											children: "Payment"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2.5 px-4 font-semibold text-right",
											children: "Actions"
										})
									]
								}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: filteredPurchases.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									colSpan: 8,
									className: "py-10 text-center text-muted-foreground font-semibold",
									children: "No purchases found for selected criteria."
								}) }) : filteredPurchases.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-b border-border hover:bg-accent/30 transition-colors last:border-0",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3 px-4 font-mono font-medium text-muted-foreground",
											children: p.id
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "py-3 px-4 font-medium text-foreground/80 flex items-center gap-1",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "size-3 text-muted-foreground" }),
												" ",
												p.date
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3 px-4 font-semibold text-foreground",
											children: p.supplierName
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3 px-4 font-mono",
											children: p.invoiceNo
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3 px-4 text-center font-bold text-sm",
											children: p.quantity
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3 px-4 text-right font-bold text-foreground",
											children: formatInr(p.amount)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3 px-4",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												tone: p.status === "Paid" ? "success" : "warning",
												children: p.status
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3 px-4 text-right",
											onClick: (e) => e.stopPropagation(),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												title: "Print Purchase Invoice",
												onClick: () => handlePrint(p),
												className: "size-7 rounded border border-border bg-surface text-foreground grid place-items-center hover:bg-accent transition-colors ml-auto shadow-sm",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Printer, { className: "size-3.5" })
											})
										})
									]
								}, p.id)) })]
							})
						})
					]
				})]
			})
		]
	});
}
//#endregion
export { PurchasesPage as component };
