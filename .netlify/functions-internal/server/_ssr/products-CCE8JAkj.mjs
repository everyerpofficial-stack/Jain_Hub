import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { C as Search, D as Plus, X as Eye, Z as Download, h as SquarePen } from "../_libs/lucide-react.mjs";
import { a as DialogFooter, g as useMobileStore, i as DialogDescription, n as Dialog, o as DialogHeader, r as DialogContent, s as DialogTitle } from "./mobileStore-B8EWbC21.mjs";
import { a as SectionHeader, n as Badge, o as StatCard, r as Card, t as AppShell } from "./ui-kit-iW0nuj1I.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/products-CCE8JAkj.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ProductDetailDialog({ p: product, onClose, onEdit }) {
	const deleteProduct = useMobileStore((s) => s.deleteProduct);
	const formatInr = (num) => "₹" + Math.round(num).toLocaleString("en-IN");
	const getDynamicLabels = () => {
		if (product.category === "TV") return {
			spec: "Screen Size",
			type: "Resolution / Panel"
		};
		if (product.category === "Frize") return {
			spec: "Capacity",
			type: "Door & Rating"
		};
		if (product.category === "Waching Machine") return {
			spec: "Load Capacity",
			type: "Machine Type"
		};
		return {
			spec: "RAM / Storage",
			type: "Color"
		};
	};
	const labels = getDynamicLabels();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: true,
		onOpenChange: (open) => !open && onClose(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-md rounded-xl border border-border shadow-2xl p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
					className: "border-b border-border pb-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[10px] text-muted-foreground font-mono uppercase tracking-wider",
							children: "Product Catalog Folder"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
							className: "text-xl font-bold flex items-center gap-2 mt-1",
							children: [product.name, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								tone: product.status === "In Stock" ? "success" : product.status === "Low Stock" ? "warning" : "danger",
								children: product.status
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, {
							className: "text-xs text-muted-foreground",
							children: [
								product.brand,
								" · ",
								product.model
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "py-4 space-y-3.5 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-3 bg-muted/25 p-3 rounded-lg border border-border/40",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] text-muted-foreground font-semibold block uppercase tracking-wider",
									children: labels.type
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold text-foreground",
									children: product.color
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] text-muted-foreground font-semibold block uppercase tracking-wider",
									children: labels.spec
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold text-foreground",
									children: product.ramRom
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] text-muted-foreground font-semibold block uppercase tracking-wider",
										children: "Category"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold text-foreground",
										children: product.category
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "border-t border-b border-border/40 py-3.5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground font-medium block",
								children: "Purchase / Cost Price"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-lg font-bold text-foreground",
								children: formatInr(product.purchasePrice)
							})] })
						}),
						product.remark && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bg-muted/15 p-2.5 rounded border border-border/30 text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-bold text-muted-foreground uppercase tracking-wider text-[9px] block mb-1",
								children: "Remarks"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-foreground leading-relaxed",
								children: product.remark
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
					className: "border-t border-border pt-4 flex gap-2 justify-end",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							if (confirm(`Are you sure you want to delete ${product.name} from the catalog?`)) {
								deleteProduct(product.id);
								toast.success(`Deleted ${product.name}`);
								onClose();
							}
						},
						className: "h-9 px-3 rounded-md bg-destructive/10 text-destructive text-sm font-semibold hover:bg-destructive/20 transition-colors",
						children: "Delete Product"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onEdit,
						className: "h-9 px-4 rounded-md bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity ml-auto",
						children: "Edit Specifications"
					})]
				})
			]
		})
	});
}
function ProductFormDialog({ p: product, onClose }) {
	const addProduct = useMobileStore((s) => s.addProduct);
	const updateProduct = useMobileStore((s) => s.updateProduct);
	const [category, setCategory] = (0, import_react.useState)("TV");
	const [name, setName] = (0, import_react.useState)("");
	const [brand, setBrand] = (0, import_react.useState)("Samsung");
	const [model, setModel] = (0, import_react.useState)("");
	const [remark, setRemark] = (0, import_react.useState)("");
	const [colorVal, setColorVal] = (0, import_react.useState)("");
	const [ramRomVal, setRamRomVal] = (0, import_react.useState)("");
	const [purchasePrice, setPurchasePrice] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (product) {
			setCategory(product.category || "TV");
			setName(product.name);
			setBrand(product.brand);
			setModel(product.model);
			setRemark(product.remark || "");
			setColorVal(product.color);
			setRamRomVal(product.ramRom);
			setPurchasePrice(product.purchasePrice.toString());
		}
	}, [product]);
	(0, import_react.useEffect)(() => {
		if (!product) if (category === "TV") {
			setRamRomVal("43 Inch");
			setColorVal("4K UHD");
			setBrand("Samsung");
		} else if (category === "Frize") {
			setRamRomVal("190 Liters");
			setColorVal("Single Door - 3 Star");
			setBrand("LG");
		} else if (category === "Waching Machine") {
			setRamRomVal("7 kg");
			setColorVal("Top Load - Fully Automatic");
			setBrand("LG");
		} else {
			setRamRomVal("8GB/128GB");
			setColorVal("Default Color");
			setBrand("Apple");
		}
	}, [category, product]);
	const canSave = name.trim() && model.trim() && purchasePrice;
	const handleSave = () => {
		const pData = {
			name: name.trim(),
			brand,
			model: model.trim(),
			color: colorVal.trim() || "Default",
			ramRom: ramRomVal.trim() || "Default Specs",
			category,
			purchasePrice: Number(purchasePrice),
			remark: remark.trim()
		};
		if (product) {
			updateProduct(product.id, pData);
			toast.success(`Updated ${name}`);
		} else {
			addProduct(pData);
			toast.success(`Added new product ${name}`);
		}
		onClose();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: true,
		onOpenChange: (open) => !open && onClose(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-md rounded-xl border border-border shadow-2xl p-6 max-h-[90vh] overflow-y-auto",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
					className: "border-b border-border pb-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
						className: "text-lg font-bold",
						children: product ? "Edit Product Specifications" : "Register New Product Model"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
						className: "text-xs text-muted-foreground",
						children: product ? "Update parameters of the catalog item." : "Create new entries for sales and stock tracking."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "py-4 space-y-3 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-semibold text-muted-foreground",
								children: "Category"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								value: category,
								onChange: (e) => setCategory(e.target.value),
								className: "mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20",
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
								className: "text-xs font-semibold text-muted-foreground",
								children: "Product Name"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: name,
								onChange: (e) => setName(e.target.value),
								placeholder: "e.g. Samsung Neo QLED TV",
								className: "mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-semibold text-muted-foreground",
									children: "Brand"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									value: brand,
									onChange: (e) => setBrand(e.target.value),
									className: "mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20",
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
									className: "text-xs font-semibold text-muted-foreground",
									children: "Model Code"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: model,
									onChange: (e) => setModel(e.target.value),
									placeholder: "e.g. QA43QN90C",
									className: "mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
								})]
							})]
						}),
						category === "TV" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-semibold text-muted-foreground",
									children: "Screen Size"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									value: ramRomVal,
									onChange: (e) => setRamRomVal(e.target.value),
									className: "mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20",
									children: [
										"32 Inch",
										"43 Inch",
										"50 Inch",
										"55 Inch",
										"65 Inch",
										"75 Inch",
										"85 Inch"
									].map((sz) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: sz,
										children: sz
									}, sz))
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-semibold text-muted-foreground",
									children: "Resolution / Panel Type"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: colorVal,
									onChange: (e) => setColorVal(e.target.value),
									placeholder: "e.g. 4K UHD, QLED, OLED",
									className: "mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
								})]
							})]
						}),
						category === "Frize" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-semibold text-muted-foreground",
									children: "Capacity"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: ramRomVal,
									onChange: (e) => setRamRomVal(e.target.value),
									placeholder: "e.g. 190 Liters, 250L",
									className: "mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-semibold text-muted-foreground",
									children: "Door Type & Rating"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: colorVal,
									onChange: (e) => setColorVal(e.target.value),
									placeholder: "e.g. Single Door - 3 Star",
									className: "mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
								})]
							})]
						}),
						category === "Waching Machine" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-semibold text-muted-foreground",
									children: "Load Capacity"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: ramRomVal,
									onChange: (e) => setRamRomVal(e.target.value),
									placeholder: "e.g. 6.5 kg, 7.5 kg, 8 kg",
									className: "mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-semibold text-muted-foreground",
									children: "Machine Type"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: colorVal,
									onChange: (e) => setColorVal(e.target.value),
									placeholder: "e.g. Top Load - Fully Auto",
									className: "mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
								})]
							})]
						}),
						category !== "TV" && category !== "Frize" && category !== "Waching Machine" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-semibold text-muted-foreground",
									children: "Color"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: colorVal,
									onChange: (e) => setColorVal(e.target.value),
									placeholder: "e.g. Titanium Blue",
									className: "mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-semibold text-muted-foreground",
									children: "RAM / ROM Specs"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									value: ramRomVal,
									onChange: (e) => setRamRomVal(e.target.value),
									className: "mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20",
									children: [
										"4GB/64GB",
										"6GB/128GB",
										"8GB/128GB",
										"8GB/256GB",
										"12GB/256GB",
										"12GB/512GB",
										"16GB/512GB",
										"16GB/1TB"
									].map((rr) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: rr,
										children: rr
									}, rr))
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-1 gap-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-semibold text-muted-foreground",
									children: "Purchase Cost (₹)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "number",
									value: purchasePrice,
									onChange: (e) => setPurchasePrice(e.target.value),
									placeholder: "10000",
									className: "mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
								})]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-semibold text-muted-foreground",
								children: "Remark / Note"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								value: remark,
								onChange: (e) => setRemark(e.target.value),
								placeholder: "Add product catalog notes or remarks here...",
								className: "mt-1 min-h-[60px] w-full rounded-md border border-border bg-surface p-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
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
						disabled: !canSave,
						onClick: handleSave,
						className: "h-9 px-5 rounded-md bg-foreground text-background text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all ml-auto",
						children: "Save Specifications"
					})]
				})
			]
		})
	});
}
function ProductsPage() {
	const products = useMobileStore((s) => s.products);
	const inventory = useMobileStore((s) => s.inventory);
	const [q, setQ] = (0, import_react.useState)("");
	const [selectedBrand, setSelectedBrand] = (0, import_react.useState)("All");
	const [selected, setSelected] = (0, import_react.useState)(null);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [isAdding, setIsAdding] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (new URLSearchParams(window.location.search).get("action") === "new" || sessionStorage.getItem("mobiles_trigger_new_product") === "true") {
			setIsAdding(true);
			sessionStorage.removeItem("mobiles_trigger_new_product");
			window.history.replaceState({}, document.title, window.location.pathname);
		}
	}, []);
	const brandsList = ["All", ...Array.from(new Set(products.map((p) => p.brand)))];
	const getStockQty = (prodId) => {
		const item = inventory.find((inv) => inv.productId === prodId);
		return item ? item.quantity : 0;
	};
	const getStockStatus = (prodId) => {
		const item = inventory.find((inv) => inv.productId === prodId);
		return item ? item.status : "Out of Stock";
	};
	const filtered = products.filter((p) => {
		if (selectedBrand !== "All" && p.brand !== selectedBrand) return false;
		if (q) {
			const matchText = q.toLowerCase();
			return [
				p.name,
				p.brand,
				p.model,
				p.color,
				p.ramRom,
				p.remark
			].some((field) => field?.toLowerCase().includes(matchText));
		}
		return true;
	});
	const formatInr = (num) => "₹" + Math.round(num).toLocaleString("en-IN");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		breadcrumb: "Products",
		children: [
			selected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductDetailDialog, {
				p: selected,
				onClose: () => setSelected(null),
				onEdit: () => {
					setEditing(selected);
					setSelected(null);
				}
			}),
			(isAdding || editing) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductFormDialog, {
				p: editing || void 0,
				onClose: () => {
					setIsAdding(false);
					setEditing(null);
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3 mb-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-[26px] font-semibold tracking-tight",
					children: "Product Catalog Management"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted-foreground mt-1",
					children: [filtered.length, " products listed in active store database"]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => {
							toast.success("Excel sheet generated & downloading");
						},
						className: "h-9 px-3 rounded-md border border-border bg-surface text-sm inline-flex items-center gap-1.5 hover:bg-accent font-semibold transition-colors shadow-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-3.5" }), " Export Catalog"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setIsAdding(true),
						className: "h-9 px-4 rounded-md bg-foreground text-background text-sm font-semibold inline-flex items-center gap-1.5 hover:opacity-90 shadow transition-opacity",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" }), " Add Product"]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 md:grid-cols-4 gap-4 mb-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Total Catalog Models",
						value: products.length.toString(),
						sub: "Unique items registered"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Total Available Stock",
						value: inventory.reduce((sum, item) => sum + item.quantity, 0).toString(),
						sub: "Units in inventory",
						trend: "up"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Low Stock Models",
						value: inventory.filter((i) => i.status === "Low Stock").length.toString(),
						sub: "Nearing minimum limits",
						trend: inventory.some((i) => i.status === "Low Stock") ? "warn" : void 0
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Out of Stock Models",
						value: inventory.filter((i) => i.status === "Out of Stock").length.toString(),
						sub: "No stock available",
						trend: inventory.some((i) => i.status === "Out of Stock") ? "down" : void 0
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-4 border-b border-border flex flex-wrap items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative flex-1 min-w-[220px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: q,
							onChange: (e) => setQ(e.target.value),
							placeholder: "Search by name, model, specs, barcode...",
							className: "h-9 w-full rounded-md border border-border bg-background pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
						})]
					}), brandsList.map((brand) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setSelectedBrand(brand),
						className: `h-9 px-3.5 rounded-md border text-xs font-bold transition-all duration-200 ${selectedBrand === brand ? "bg-foreground text-background border-foreground shadow-sm" : "border-border bg-surface hover:bg-accent text-muted-foreground hover:text-foreground"}`,
						children: [brand, brand !== "All" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ml-1.5 opacity-60",
							children: products.filter((p) => p.brand === brand).length
						})]
					}, brand))]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
					title: `${filtered.length} Product Models`,
					action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted-foreground",
						children: "Click on any row to view full details"
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
									children: "Product ID"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3 px-4 font-semibold",
									children: "Brand & Name"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3 px-4 font-semibold",
									children: "Model & Type/Color"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3 px-4 font-semibold",
									children: "Specs / Capacity"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3 px-4 font-semibold",
									children: "Category"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3 px-4 font-semibold text-right",
									children: "Cost Price"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3 px-4 text-center font-semibold",
									children: "Qty"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3 px-4 font-semibold",
									children: "Stock Status"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3 px-5 text-right font-semibold",
									children: "Actions"
								})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							colSpan: 10,
							className: "py-12 text-center text-muted-foreground font-medium",
							children: "No product models found matching the filters."
						}) }) : filtered.map((p) => {
							const qty = getStockQty(p.id);
							const status = getStockStatus(p.id);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								onClick: () => setSelected(p),
								className: "border-b border-border hover:bg-accent/40 cursor-pointer transition-colors last:border-0",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-3 px-5 font-mono text-xs text-muted-foreground",
										children: p.id
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "py-3 px-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "font-semibold text-foreground",
											children: p.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-xs text-muted-foreground",
											children: p.brand
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "py-3 px-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-foreground",
											children: p.model
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-xs text-muted-foreground",
											children: p.color
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-3 px-4 font-medium text-foreground/80",
										children: p.ramRom
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-3 px-4 text-muted-foreground",
										children: p.category
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-3 px-4 text-right font-medium text-muted-foreground",
										children: formatInr(p.purchasePrice)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-3 px-4 text-center font-bold",
										children: qty
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-3 px-4",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											tone: status === "In Stock" ? "success" : status === "Low Stock" ? "warning" : "danger",
											children: status
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-3 px-5 text-right",
										onClick: (e) => e.stopPropagation(),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "inline-flex gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												title: "View specifications",
												onClick: () => setSelected(p),
												className: "size-8 rounded border border-primary/10 bg-primary/5 text-primary grid place-items-center hover:bg-primary hover:text-white transition-colors",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-3.5" })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												title: "Edit product specs",
												onClick: () => setEditing(p),
												className: "size-8 rounded border border-border bg-surface text-foreground grid place-items-center hover:bg-accent transition-colors",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquarePen, { className: "size-3.5" })
											})]
										})
									})
								]
							}, p.id);
						}) })]
					})
				})
			] })
		]
	});
}
//#endregion
export { ProductsPage as component };
