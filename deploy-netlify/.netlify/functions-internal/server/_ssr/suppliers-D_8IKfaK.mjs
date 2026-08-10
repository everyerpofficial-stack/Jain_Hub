import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { $ as CreditCard, C as Search, D as Plus, P as MapPin, T as Receipt, X as Eye, h as SquarePen, i as Users, k as Phone, p as Trash2 } from "../_libs/lucide-react.mjs";
import { a as DialogFooter, g as useMobileStore, i as DialogDescription, n as Dialog, o as DialogHeader, r as DialogContent, s as DialogTitle } from "./mobileStore-B8EWbC21.mjs";
import { a as SectionHeader, n as Badge, o as StatCard, r as Card, t as AppShell } from "./ui-kit-iW0nuj1I.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/suppliers-D_8IKfaK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SupplierDetailsDialog({ s: supplier, onClose }) {
	const supplierPurchases = useMobileStore((state) => state.purchases).filter((p) => p.supplierId === supplier.id);
	const formatInr = (num) => "₹" + Math.round(num).toLocaleString("en-IN");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: true,
		onOpenChange: (open) => !open && onClose(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-3xl max-h-[85vh] overflow-y-auto p-0 rounded-xl border border-border shadow-2xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between p-6 border-b border-border bg-foreground text-background",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-[10px] opacity-65 font-mono uppercase tracking-wider mb-1",
							children: ["Supplier ledger record · ", supplier.id]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
							className: "text-xl font-bold mt-0.5 text-background flex items-center gap-2",
							children: [supplier.name, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								tone: supplier.outstanding > 0 ? "warning" : "success",
								children: supplier.outstanding > 0 ? "Outstanding Debt" : "Settled Ledger"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, {
							className: "text-xs opacity-75 mt-1 text-background/85 font-mono",
							children: ["GSTIN: ", supplier.gstNo]
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onClose,
						className: "size-7 rounded-full border border-white/20 grid place-items-center hover:bg-white/10 transition-colors text-background",
						children: "✕"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-6 space-y-6 bg-background/50 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 md:grid-cols-3 gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
								className: "p-4 space-y-1.5 border-border/60 bg-surface",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-[10px] text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "size-3 text-primary" }), " Contact details"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-semibold text-foreground",
									children: supplier.contact
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
								className: "p-4 space-y-1.5 border-border/60 bg-surface col-span-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-[10px] text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-3.5 text-primary" }), " Warehouse Address"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-semibold text-foreground text-xs leading-relaxed",
									children: supplier.address
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
								className: "text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5 border-b border-border pb-1.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "size-4 text-primary" }),
									" Inward Orders & Purchases (",
									supplierPurchases.length,
									")"
								]
							}), supplierPurchases.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-center py-6 text-xs text-muted-foreground bg-surface border border-border/50 rounded-lg",
								children: "No purchase logs recorded for this supplier."
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "overflow-hidden border border-border/60 rounded-lg bg-surface text-xs",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
									className: "w-full text-left",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "text-muted-foreground uppercase border-b border-border bg-muted/20",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "py-2 px-3 font-semibold",
												children: "Bill ID"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "py-2 px-3 font-semibold",
												children: "Date"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "py-2 px-3 font-semibold",
												children: "Invoice No"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "py-2 px-3 text-center font-semibold",
												children: "Qty"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "py-2 px-3 text-right font-semibold",
												children: "Total Amount"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "py-2 px-3 text-right font-semibold",
												children: "Paid Amount"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "py-2 px-3 text-right font-semibold",
												children: "Due Amount"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "py-2 px-3 font-semibold",
												children: "Status"
											})
										]
									}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: supplierPurchases.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "border-b border-border hover:bg-accent/20 last:border-0",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2 px-3 font-mono font-semibold text-muted-foreground",
												children: p.id
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2 px-3 text-muted-foreground",
												children: p.date
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2 px-3 font-mono",
												children: p.invoiceNo
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2 px-3 text-center font-bold",
												children: p.quantity
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2 px-3 text-right font-bold",
												children: formatInr(p.amount)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2 px-3 text-right font-bold text-success",
												children: p.status === "Paid" ? formatInr(p.amount) : "—"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2 px-3 text-right font-bold text-danger",
												children: p.status === "Outstanding" ? formatInr(p.amount) : "—"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2 px-3",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													tone: p.status === "Paid" ? "success" : "warning",
													children: p.status
												})
											})
										]
									}, p.id)) })]
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2.5 pt-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
								className: "text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5 border-b border-border pb-1.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "size-4 text-primary" }),
									" Payment Ledger Details (",
									useMobileStore.getState().supplierPayments.filter((p) => p.supplierId === supplier.id).length,
									")"
								]
							}), useMobileStore.getState().supplierPayments.filter((p) => p.supplierId === supplier.id).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-center py-6 text-xs text-muted-foreground bg-surface border border-border/50 rounded-lg",
								children: "No payments logged for this supplier."
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "overflow-hidden border border-border/60 rounded-lg bg-surface text-xs",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
									className: "w-full text-left",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "text-muted-foreground uppercase border-b border-border bg-muted/20",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "py-2 px-3 font-semibold",
												children: "Payment ID"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "py-2 px-3 font-semibold",
												children: "Date"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "py-2 px-3 text-right font-semibold",
												children: "Amount Paid"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "py-2 px-3 font-semibold",
												children: "Remark / Ref"
											})
										]
									}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: useMobileStore.getState().supplierPayments.filter((pay) => pay.supplierId === supplier.id).map((pay) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "border-b border-border hover:bg-accent/20 last:border-0",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2 px-3 font-mono font-semibold text-muted-foreground",
												children: pay.id
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2 px-3 text-muted-foreground",
												children: pay.date
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2 px-3 text-right font-bold text-success",
												children: formatInr(pay.amount)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2 px-3 text-muted-foreground",
												children: pay.remark || "—"
											})
										]
									}, pay.id)) })]
								})
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-4 border-t border-border bg-surface flex justify-end",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onClose,
						className: "h-9 px-4 rounded-md border border-border bg-surface text-sm font-semibold hover:bg-accent transition-colors",
						children: "Close Profile"
					})
				})
			]
		})
	});
}
function SupplierFormDialog({ s: supplier, onClose }) {
	const addSupplier = useMobileStore((s) => s.addSupplier);
	const updateSupplier = useMobileStore((s) => s.updateSupplier);
	const [name, setName] = (0, import_react.useState)("");
	const [gstNo, setGstNo] = (0, import_react.useState)("");
	const [contact, setContact] = (0, import_react.useState)("");
	const [address, setAddress] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (supplier) {
			setName(supplier.name);
			setGstNo(supplier.gstNo);
			setContact(supplier.contact);
			setAddress(supplier.address);
		}
	}, [supplier]);
	const isContactValid = contact.trim().length >= 10;
	const canSubmit = name.trim() && isContactValid;
	const handleSave = () => {
		const data = {
			name: name.trim(),
			gstNo: gstNo.trim(),
			contact: contact.trim(),
			address: address.trim()
		};
		if (supplier) {
			updateSupplier(supplier.id, data);
			toast.success(`Supplier profile updated: ${name}`);
		} else {
			addSupplier(data);
			toast.success(`Supplier profile added: ${name}`);
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
						children: supplier ? "Edit Supplier Details" : "Add Wholesale Supplier"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
						className: "text-xs text-muted-foreground",
						children: "Save distributor details for stock procurement."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "py-4 space-y-3.5 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-semibold text-muted-foreground",
								children: "Supplier / Company Name"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: name,
								onChange: (e) => setName(e.target.value),
								placeholder: "e.g. Aarav Mobile Distributors",
								className: "mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-semibold text-muted-foreground",
								children: "Contact Number"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: contact,
								onChange: (e) => setContact(e.target.value),
								placeholder: "e.g. +91 98112 34567",
								className: "mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-semibold text-muted-foreground",
								children: "Warehouse / Office Address"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								value: address,
								onChange: (e) => setAddress(e.target.value),
								placeholder: "e.g. Street Address, City, Pincode",
								className: "mt-1 h-16 w-full rounded-md border border-border bg-surface p-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none resize-none font-sans"
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
						disabled: !canSubmit,
						onClick: handleSave,
						className: "h-9 px-4 rounded-md bg-foreground text-background text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all ml-auto",
						children: "Save Supplier"
					})]
				})
			]
		})
	});
}
function SupplierPayBalanceDialog({ supplier, onClose }) {
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
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "size-5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Record Supplier Payment" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, {
						className: "text-xs text-muted-foreground",
						children: ["Debit outstanding balance ledger for ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: supplier.name })]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "py-4 space-y-3.5 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between items-center bg-muted/30 p-2.5 rounded border border-border/60 text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground font-medium",
								children: "Outstanding Debt Balance:"
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
								placeholder: "e.g. 20000",
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
						children: "Confirm Payment"
					})]
				})
			]
		})
	});
}
function SuppliersPage() {
	const suppliers = useMobileStore((s) => s.suppliers);
	const deleteSupplier = useMobileStore((s) => s.deleteSupplier);
	const [q, setQ] = (0, import_react.useState)("");
	const [selected, setSelected] = (0, import_react.useState)(null);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [paying, setPaying] = (0, import_react.useState)(null);
	const [isAdding, setIsAdding] = (0, import_react.useState)(false);
	const filtered = suppliers.filter((s) => {
		if (q) {
			const text = q.toLowerCase();
			return [
				s.name,
				s.gstNo,
				s.contact
			].some((v) => v.toLowerCase().includes(text));
		}
		return true;
	});
	const formatInr = (num) => "₹" + Math.round(num).toLocaleString("en-IN");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		breadcrumb: "Suppliers",
		children: [
			selected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SupplierDetailsDialog, {
				s: selected,
				onClose: () => setSelected(null)
			}),
			(isAdding || editing) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SupplierFormDialog, {
				s: editing || void 0,
				onClose: () => {
					setIsAdding(false);
					setEditing(null);
				}
			}),
			paying && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SupplierPayBalanceDialog, {
				supplier: paying,
				onClose: () => setPaying(null)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3 mb-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-[26px] font-semibold tracking-tight",
					children: "Wholesale Supplier Directory"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted-foreground mt-1",
					children: [filtered.length, " suppliers registered in store databases"]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setIsAdding(true),
						className: "h-9 px-4 rounded-md bg-foreground text-background text-sm font-semibold inline-flex items-center gap-1.5 hover:opacity-90 shadow transition-opacity",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" }), " Add Supplier"]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 md:grid-cols-4 gap-4 mb-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Wholesale Vendors",
						value: suppliers.length.toString(),
						sub: "Procurement suppliers",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Ledger Debt outstanding",
						value: formatInr(suppliers.reduce((s, x) => s + x.outstanding, 0)),
						sub: "Total unpaid vendor balances",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "size-4" }),
						trend: suppliers.some((s) => s.outstanding > 0) ? "warn" : "up"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Distributor Partners",
						value: suppliers.length.toString(),
						sub: "Procurement partners"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Fully Cleared Ledgers",
						value: suppliers.filter((s) => s.outstanding === 0).length.toString(),
						sub: "Vendors with zero balance",
						trend: "up"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-4 border-b border-border",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative max-w-md",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: q,
							onChange: (e) => setQ(e.target.value),
							placeholder: "Search by supplier name, contact info...",
							className: "h-9 w-full rounded-md border border-border bg-background pl-8 pr-3 text-sm focus:outline-none"
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
					title: `${filtered.length} Supplier Accounts`,
					action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted-foreground",
						children: "Click row to open ledger statement history"
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
									children: "Vendor ID"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3 px-4 font-semibold",
									children: "Supplier Name"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3 px-4 font-semibold",
									children: "Contact No"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3 px-4 font-semibold",
									children: "Warehouse / Address"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3 px-4 text-right font-semibold",
									children: "Outstanding Debt"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3 px-5 text-right font-semibold",
									children: "Ledger Actions"
								})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							colSpan: 6,
							className: "py-12 text-center text-muted-foreground font-semibold",
							children: "No suppliers found matching the filters."
						}) }) : filtered.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							onClick: () => setSelected(s),
							className: "border-b border-border hover:bg-accent/40 cursor-pointer transition-colors last:border-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-3 px-5 font-mono text-xs text-muted-foreground",
									children: s.id
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-3 px-4 font-semibold text-foreground",
									children: s.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-3 px-4 font-mono text-xs",
									children: s.contact
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-3 px-4 text-muted-foreground truncate max-w-[180px]",
									title: s.address,
									children: s.address
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: `py-3 px-4 text-right font-bold ${s.outstanding > 0 ? "text-danger" : "text-success"}`,
									children: formatInr(s.outstanding)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-3 px-5 text-right",
									onClick: (e) => e.stopPropagation(),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "inline-flex gap-1.5",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												title: "Open Ledger History",
												onClick: () => setSelected(s),
												className: "size-8 rounded border border-primary/10 bg-primary/5 text-primary grid place-items-center hover:bg-primary hover:text-white transition-colors",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-3.5" })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												title: "Edit supplier specifications",
												onClick: () => setEditing(s),
												className: "size-8 rounded border border-border bg-surface text-foreground grid place-items-center hover:bg-accent transition-colors",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquarePen, { className: "size-3.5" })
											}),
											s.outstanding > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												title: "Record Payment",
												onClick: () => setPaying(s),
												className: "h-8 px-2.5 rounded border border-success/15 bg-success/5 text-success inline-flex items-center gap-1 hover:bg-success hover:text-white transition-colors text-xs font-semibold shadow-sm",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "size-3" }), " Pay"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												title: "Delete supplier record",
												onClick: () => {
													if (confirm(`Are you sure you want to delete supplier record ${s.name}?`)) {
														deleteSupplier(s.id);
														toast.success(`Deleted supplier ${s.name}`);
													}
												},
												className: "size-8 rounded border border-destructive/15 bg-destructive/5 text-destructive grid place-items-center hover:bg-destructive hover:text-white transition-colors",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" })
											})
										]
									})
								})
							]
						}, s.id)) })]
					})
				})
			] })
		]
	});
}
//#endregion
export { SuppliersPage as component };
