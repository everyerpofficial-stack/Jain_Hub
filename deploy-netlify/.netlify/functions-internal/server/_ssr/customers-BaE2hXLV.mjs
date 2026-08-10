import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { C as Search, D as Plus, P as MapPin, U as History, X as Eye, h as SquarePen, i as Users, k as Phone, p as Trash2, x as ShieldAlert } from "../_libs/lucide-react.mjs";
import { a as DialogFooter, g as useMobileStore, i as DialogDescription, n as Dialog, o as DialogHeader, r as DialogContent, s as DialogTitle } from "./mobileStore-B8EWbC21.mjs";
import { a as SectionHeader, n as Badge, o as StatCard, r as Card, t as AppShell } from "./ui-kit-iW0nuj1I.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/customers-BaE2hXLV.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CustomerDetailsDialog({ c: customer, onClose }) {
	const sales = useMobileStore((s) => s.sales);
	const warranties = useMobileStore((s) => s.warranties);
	const custSales = sales.filter((s) => s.customerMobile.replace(/[^\d]/g, "") === customer.mobile.replace(/[^\d]/g, ""));
	const custWarranties = warranties.filter((w) => w.customerMobile.replace(/[^\d]/g, "") === customer.mobile.replace(/[^\d]/g, ""));
	const formatInr = (num) => "₹" + Math.round(num).toLocaleString("en-IN");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: true,
		onOpenChange: (open) => !open && onClose(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-4xl max-h-[90vh] overflow-y-auto p-0 rounded-xl border border-border shadow-2xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between p-6 border-b border-border bg-foreground text-background",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-[10px] opacity-65 font-mono uppercase tracking-wider mb-1",
							children: ["Customer profile record · ", customer.id]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
							className: "text-xl font-bold mt-0.5 text-background flex items-center gap-2",
							children: [
								customer.name,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: "info",
									children: "Registered Buyer"
								}),
								customer.isBlacklisted && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: "danger",
									children: "Blacklisted"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, {
							className: "text-xs opacity-75 mt-1 text-background/85",
							children: ["Client database entry since ", customer.registeredDate]
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
								className: "p-4 space-y-2 border-border/60 bg-surface",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-[10px] text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "size-3 text-primary" }), " Contact Details"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "font-semibold text-foreground",
										children: customer.mobile
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-xs text-muted-foreground",
										children: customer.email || "No email address"
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
								className: "p-4 space-y-2 border-border/60 bg-surface col-span-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-[10px] text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-3.5 text-primary" }), " Address Location"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-semibold text-foreground",
									children: customer.address || "No billing address details"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
								className: "text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5 border-b border-border pb-1.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "size-4 text-primary" }),
									" Purchases History (",
									custSales.length,
									")"
								]
							}), custSales.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-center py-6 text-xs text-muted-foreground bg-surface border border-border/50 rounded-lg",
								children: "No purchases recorded for this customer in mobiles ledger."
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
												children: "Product Name"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "py-2 px-3 font-semibold",
												children: "Payment Method"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "py-2 px-3 text-right font-semibold",
												children: "Amount Paid"
											})
										]
									}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: custSales.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "border-b border-border hover:bg-accent/20 last:border-0",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2 px-3 font-mono font-semibold text-muted-foreground",
												children: s.id
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2 px-3",
												children: s.date
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2 px-3 font-medium",
												children: s.items.map((it) => `${it.productName} (S/N: ${it.imei1 || "N/A"})`).join(", ")
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2 px-3",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													tone: "info",
													children: s.paymentMethod
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2 px-3 text-right font-bold text-success",
												children: formatInr(s.totalAmount)
											})
										]
									}, s.id)) })]
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
								className: "text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5 border-b border-border pb-1.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "size-4 text-primary" }),
									" Warranty claims (",
									custWarranties.length,
									")"
								]
							}), custWarranties.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-center py-6 text-xs text-muted-foreground bg-surface border border-border/50 rounded-lg",
								children: "No warranty claims registered under this customer folder."
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "overflow-hidden border border-border/60 rounded-lg bg-surface text-xs",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
									className: "w-full text-left",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "text-muted-foreground uppercase border-b border-border bg-muted/20",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "py-2 px-3 font-semibold",
												children: "Claim ID"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "py-2 px-3 font-semibold",
												children: "Date"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "py-2 px-3 font-semibold",
												children: "Product & IMEI"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "py-2 px-3 font-semibold",
												children: "Issue / Diagnosis"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "py-2 px-3 font-semibold",
												children: "Status"
											})
										]
									}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: custWarranties.map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "border-b border-border hover:bg-accent/20 last:border-0",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2 px-3 font-mono font-semibold text-muted-foreground",
												children: w.id
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2 px-3",
												children: w.claimDate
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "py-2 px-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "font-semibold",
													children: w.productName
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "text-[10px] text-muted-foreground font-mono",
													children: ["IMEI: ", w.imei]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2 px-3 italic text-muted-foreground",
												children: w.issue
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2 px-3",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													tone: w.status === "Resolved" ? "success" : w.status === "Pending" ? "warning" : w.status === "Rejected" ? "danger" : "info",
													children: w.status
												})
											})
										]
									}, w.id)) })]
								})
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-4 border-t border-border bg-surface flex justify-end gap-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onClose,
						className: "h-9 px-4 rounded-md border border-border bg-surface text-sm font-semibold hover:bg-accent transition-colors",
						children: "Close Folder"
					})
				})
			]
		})
	});
}
function CustomerFormDialog({ c: customer, onClose }) {
	const addCustomer = useMobileStore((s) => s.addCustomer);
	const updateCustomer = useMobileStore((s) => s.updateCustomer);
	const [name, setName] = (0, import_react.useState)("");
	const [mobile, setMobile] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [address, setAddress] = (0, import_react.useState)("");
	const [isBlacklisted, setIsBlacklisted] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (customer) {
			setName(customer.name);
			setMobile(customer.mobile);
			setEmail(customer.email);
			setAddress(customer.address);
			setIsBlacklisted(customer.isBlacklisted || false);
		}
	}, [customer]);
	const isMobileValid = /^\d{10}$/.test(mobile.trim().replace(/[^\d]/g, ""));
	const canSubmit = name.trim() && isMobileValid;
	const handleSave = () => {
		const data = {
			name: name.trim(),
			mobile: mobile.trim(),
			email: email.trim(),
			address: address.trim(),
			isBlacklisted
		};
		if (customer) {
			updateCustomer(customer.id, data);
			toast.success(`Customer profile updated: ${name}`);
		} else {
			addCustomer(data);
			toast.success(`Customer profile registered: ${name}`);
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
						children: customer ? "Edit Customer Details" : "Register Mobile Customer"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
						className: "text-xs text-muted-foreground",
						children: "Save client details in store database."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "py-4 space-y-3.5 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-semibold text-muted-foreground",
								children: "Full Name"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: name,
								onChange: (e) => setName(e.target.value),
								placeholder: "e.g. Suresh Patil",
								className: "mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-semibold text-muted-foreground",
								children: "Mobile Number"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: mobile,
								onChange: (e) => setMobile(e.target.value),
								placeholder: "e.g. 9822011223",
								className: "mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-semibold text-muted-foreground",
								children: "Email Address"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "email",
								value: email,
								onChange: (e) => setEmail(e.target.value),
								placeholder: "e.g. suresh@gmail.com",
								className: "mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-semibold text-muted-foreground",
								children: "Billing Address"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								value: address,
								onChange: (e) => setAddress(e.target.value),
								placeholder: "e.g. Main Street, Shirwal",
								className: "mt-1 h-16 w-full rounded-md border border-border bg-surface p-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none resize-none"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex items-center gap-2 mt-2 cursor-pointer border border-border/40 bg-surface rounded-md p-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: isBlacklisted,
								onChange: (e) => setIsBlacklisted(e.target.checked),
								className: "size-4 rounded border-border text-danger focus:ring-danger"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-bold text-danger",
								children: "Blacklist Customer (Blocked from Purchases)"
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
						children: "Save Client Profile"
					})]
				})
			]
		})
	});
}
function CustomersPage() {
	const customers = useMobileStore((s) => s.customers);
	const sales = useMobileStore((s) => s.sales);
	const [q, setQ] = (0, import_react.useState)("");
	const [selected, setSelected] = (0, import_react.useState)(null);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [isAdding, setIsAdding] = (0, import_react.useState)(false);
	const updateCustomer = useMobileStore((s) => s.updateCustomer);
	const deleteCustomer = useMobileStore((s) => s.deleteCustomer);
	const filtered = customers.filter((c) => {
		if (q) {
			const matchText = q.toLowerCase();
			return [
				c.name,
				c.mobile,
				c.email,
				c.address
			].some((field) => field.toLowerCase().includes(matchText));
		}
		return true;
	});
	const getCustSalesCount = (mobile) => {
		return sales.filter((s) => s.customerMobile.replace(/[^\d]/g, "") === mobile.replace(/[^\d]/g, "")).length;
	};
	const getCustTotalSales = (mobile) => {
		return sales.filter((s) => s.customerMobile.replace(/[^\d]/g, "") === mobile.replace(/[^\d]/g, "")).reduce((sum, s) => sum + s.totalAmount, 0);
	};
	const formatInr = (num) => "₹" + Math.round(num).toLocaleString("en-IN");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		breadcrumb: "Customers",
		children: [
			selected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CustomerDetailsDialog, {
				c: selected,
				onClose: () => setSelected(null)
			}),
			(isAdding || editing) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CustomerFormDialog, {
				c: editing || void 0,
				onClose: () => {
					setIsAdding(false);
					setEditing(null);
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3 mb-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-[26px] font-semibold tracking-tight",
					children: "Customer Database Registry"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted-foreground mt-1",
					children: [filtered.length, " customers registered in active mobiles database"]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setIsAdding(true),
						className: "h-9 px-4 rounded-md bg-foreground text-background text-sm font-semibold inline-flex items-center gap-1.5 hover:opacity-90 shadow transition-opacity",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" }), " Register Customer"]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 md:grid-cols-4 gap-4 mb-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Total Registered Customers",
						value: customers.length.toString(),
						sub: "Unique client profiles",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Customer Purchases",
						value: sales.length.toString(),
						sub: "Completed invoices logged",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "size-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Total Spent Value",
						value: formatInr(sales.reduce((s, x) => s + x.totalAmount, 0)),
						sub: "Mobiles shop turnover",
						trend: "up"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Avg Spend / Customer",
						value: formatInr(customers.length ? sales.reduce((s, x) => s + x.totalAmount, 0) / customers.length : 0),
						sub: "Average ticket value"
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
							placeholder: "Search by customer name, mobile number, address...",
							className: "h-9 w-full rounded-md border border-border bg-background pl-8 pr-3 text-sm focus:outline-none"
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
					title: `${filtered.length} Registered Customers`,
					action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted-foreground",
						children: "Click row to open client folder statement"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-sm text-left table-fixed min-w-[1220px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border bg-muted/10",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3 px-5 font-semibold w-[110px]",
									children: "Customer ID"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3 px-4 font-semibold w-[180px]",
									children: "Full Name"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3 px-4 font-semibold w-[130px]",
									children: "Mobile Number"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3 px-4 font-semibold w-[180px]",
									children: "Email Address"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3 px-4 font-semibold w-[220px]",
									children: "Address / Location"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3 px-4 text-center font-semibold w-[110px]",
									children: "Orders Count"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3 px-4 text-right font-semibold w-[120px]",
									children: "Total Spent"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3 px-4 font-semibold w-[110px]",
									children: "Since"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3 px-5 text-right font-semibold w-[160px]",
									children: "Actions"
								})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							colSpan: 9,
							className: "py-12 text-center text-muted-foreground font-semibold",
							children: "No customers found in database."
						}) }) : filtered.map((c) => {
							const sCount = getCustSalesCount(c.mobile);
							const totalSpent = getCustTotalSales(c.mobile);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								onClick: () => setSelected(c),
								className: "border-b border-border hover:bg-accent/40 cursor-pointer transition-colors last:border-0",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-3 px-5 font-mono text-xs text-muted-foreground w-[110px] truncate",
										children: c.id
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "py-3 px-4 font-semibold text-foreground w-[180px] flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "truncate",
											children: c.name
										}), c.isBlacklisted && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											tone: "danger",
											children: "Blacklisted"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-3 px-4 font-mono text-xs w-[130px] truncate",
										children: c.mobile
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-3 px-4 text-muted-foreground w-[180px] truncate",
										children: c.email || "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-3 px-4 text-muted-foreground w-[220px] truncate",
										title: c.address,
										children: c.address || "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-3 px-4 text-center font-bold w-[110px]",
										children: sCount
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-3 px-4 text-right font-bold text-success w-[120px] truncate",
										children: formatInr(totalSpent)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-3 px-4 text-xs text-muted-foreground w-[110px] truncate",
										children: c.registeredDate
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-3 px-5 text-right w-[160px]",
										onClick: (e) => e.stopPropagation(),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "inline-flex gap-1.5",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													title: "Open Profile Folder",
													onClick: () => setSelected(c),
													className: "size-8 rounded border border-primary/10 bg-primary/5 text-primary grid place-items-center hover:bg-primary hover:text-white transition-colors",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-3.5" })
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													title: "Edit customer profiles",
													onClick: () => setEditing(c),
													className: "size-8 rounded border border-border bg-surface text-foreground grid place-items-center hover:bg-accent transition-colors",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquarePen, { className: "size-3.5" })
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													title: c.isBlacklisted ? "Whitelist customer" : "Blacklist customer",
													onClick: () => {
														updateCustomer(c.id, { isBlacklisted: !c.isBlacklisted });
														toast.info(c.isBlacklisted ? `Whitelisted ${c.name}` : `Blacklisted ${c.name}`);
													},
													className: `size-8 rounded border grid place-items-center transition-colors ${c.isBlacklisted ? "border-success/15 bg-success/5 text-success hover:bg-success hover:text-white" : "border-danger/15 bg-danger/5 text-danger hover:bg-danger hover:text-white"}`,
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "size-3.5" })
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													title: "Delete customer profile",
													onClick: () => {
														if (confirm(`Are you sure you want to delete customer ${c.name}?`)) {
															deleteCustomer(c.id);
															toast.success(`Deleted ${c.name}`);
														}
													},
													className: "size-8 rounded border border-destructive/15 bg-destructive/5 text-destructive grid place-items-center hover:bg-destructive hover:text-white transition-colors",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" })
												})
											]
										})
									})
								]
							}, c.id);
						}) })]
					})
				})
			] })
		]
	});
}
//#endregion
export { CustomersPage as component };
