import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { C as Search, D as Plus, E as Printer, M as MessageCircle, P as MapPin, U as History, V as Landmark, X as Eye, Z as Download, a as User, b as ShieldCheck, g as Smartphone, k as Phone, p as Trash2, q as FileText, t as X } from "../_libs/lucide-react.mjs";
import { _ as useStore, d as downloadExcel, f as isDateInRange, i as DialogDescription, n as Dialog, p as parseAppDate, r as DialogContent, s as DialogTitle, v as useUi } from "./mobileStore-B8EWbC21.mjs";
import { a as SectionHeader, n as Badge, o as StatCard, r as Card, t as AppShell } from "./ui-kit-iW0nuj1I.mjs";
import { n as useDateFilter, t as FilterBar } from "./FilterBar-B1CYUr5_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/customers-Ctf6G2ph.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STATUS_TABS = [
	"All",
	"Active",
	"Overdue",
	"Defaulted",
	"Closed"
];
function statusTone(s) {
	return s === "Active" ? "success" : s === "Overdue" ? "warning" : s === "Defaulted" ? "danger" : s === "Closed" ? "neutral" : "neutral";
}
function CustomerDetailPanel({ c: customer, onClose }) {
	const allPayments = useStore((s) => s.payments);
	const documents = useStore((s) => s.documents);
	const sendWhatsapp = useStore((s) => s.sendWhatsapp);
	const deleteCustomer = useStore((s) => s.deleteCustomer);
	const deleteDocument = useStore((s) => s.deleteDocument);
	const currentUser = useStore((s) => s.currentUser);
	const { openDialog } = useUi();
	const [previewDoc, setPreviewDoc] = (0, import_react.useState)(null);
	const cPayments = allPayments.filter((p) => p.customerId === customer.id);
	const customerDocs = documents.filter((d) => d.customerId === customer.id);
	const handlePrintInvoice = (doc) => {
		if (!doc.fileUrl) return;
		const printWindow = window.open("", "_blank");
		if (printWindow) try {
			const decoded = decodeURIComponent(doc.fileUrl.replace("data:text/html;charset=utf-8,", ""));
			printWindow.document.write(decoded);
			printWindow.document.close();
			printWindow.focus();
			printWindow.print();
		} catch (err) {
			toast.error("Failed to print invoice");
		}
	};
	const getSrcDoc = (url) => {
		if (!url) return "";
		try {
			return decodeURIComponent(url.replace("data:text/html;charset=utf-8,", ""));
		} catch {
			return "";
		}
	};
	const formatInr = (num) => {
		return "₹" + Math.round(num).toLocaleString("en-IN");
	};
	const paidAmount = customer.paidEmis * customer.perMonthEmi;
	const progressPercent = customer.noOfEmi > 0 ? Math.round(customer.paidEmis / customer.noOfEmi * 100) : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open: true,
		onOpenChange: (open) => !open && onClose(),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-5xl max-h-[92vh] overflow-y-auto p-0 rounded-xl border border-border shadow-2xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between p-6 border-b border-border bg-foreground text-background",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-xs opacity-60 font-mono tracking-wider uppercase mb-1",
							children: ["Customer Profile Folder · ", customer.id]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
							className: "text-2xl font-bold mt-0.5 text-background flex items-center gap-3",
							children: [
								customer.firstName,
								" ",
								customer.surname,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: customer.status === "Active" ? "success" : customer.status === "Overdue" ? "warning" : customer.status === "Defaulted" ? "danger" : "neutral",
									children: customer.status
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, {
							className: "text-xs opacity-75 mt-1 text-background/85",
							children: [
								"Account created on ",
								customer.billDate,
								" · Son/Daughter of ",
								customer.fatherName
							]
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onClose,
						className: "size-8 rounded-full border border-white/20 grid place-items-center hover:bg-white/10 transition-colors text-background",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-6 space-y-6 bg-background/50",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 md:grid-cols-3 gap-6",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
									className: "p-5 flex flex-col justify-between border border-border/60 bg-surface",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border pb-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-4 text-primary" }), " Personal & Contact Info"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-3",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "text-xs text-muted-foreground font-medium",
													children: "Customer Name"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "text-sm font-semibold text-foreground mt-0.5",
													children: [
														customer.firstName,
														" ",
														customer.surname
													]
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "text-xs text-muted-foreground font-medium",
													children: "Father's Name"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "text-sm font-semibold text-foreground mt-0.5",
													children: customer.fatherName
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "text-xs text-muted-foreground font-medium",
													children: "Mobile No"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center justify-between mt-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-sm font-mono font-semibold text-foreground",
														children: customer.mobile
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex gap-1.5",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
															onClick: () => toast.message(`Calling ${customer.name}`, { description: customer.mobile }),
															className: "size-7 rounded-md border border-border grid place-items-center hover:bg-accent text-foreground transition-colors",
															title: "Call Customer",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "size-3.5" })
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
															onClick: () => {
																sendWhatsapp({
																	to: customer.mobile,
																	kind: "General"
																});
																toast.success(`WhatsApp chat opened for ${customer.name}`);
															},
															className: "size-7 rounded-md border border-border grid place-items-center hover:bg-accent text-foreground transition-colors",
															title: "WhatsApp Message",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-3.5" })
														})]
													})]
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "text-xs text-muted-foreground font-medium",
													children: "Aadhaar Card No"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "text-sm font-mono font-semibold text-foreground mt-0.5",
													children: customer.aadhaar || "—"
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "text-xs text-muted-foreground font-medium",
													children: "Address & Location"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-1 text-sm font-semibold text-foreground mt-0.5",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-3.5 text-muted-foreground" }),
														customer.village,
														", ",
														customer.region
													]
												})] })
											]
										})]
									}), customer.guarantyName && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-6 pt-5 border-t border-dashed border-border space-y-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4 text-success" }), " Guarantor Details"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-xs text-muted-foreground font-medium",
												children: "Guarantor Name"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-sm font-semibold text-foreground mt-0.5",
												children: customer.guarantyName
											})] }),
											customer.guarantyMobile && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-xs text-muted-foreground font-medium",
												children: "Guarantor Mobile"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center justify-between mt-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-sm font-mono font-semibold text-foreground",
													children: customer.guarantyMobile
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													onClick: () => toast.message(`Calling guarantor ${customer.guarantyName}`, { description: customer.guarantyMobile }),
													className: "size-7 rounded-md border border-border grid place-items-center hover:bg-accent text-foreground transition-colors",
													title: "Call Guarantor",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "size-3.5" })
												})]
											})] })
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
									className: "p-5 space-y-4 border border-border/60 bg-surface",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border pb-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, { className: "size-4 text-primary" }), " Purchase & Mobile Details"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-xs text-muted-foreground font-medium",
												children: "Mobile Brand & Model"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "text-sm font-semibold text-foreground mt-0.5",
												children: [
													customer.mobileBrand,
													" ",
													customer.mobileModel
												]
											})] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-xs text-muted-foreground font-medium",
												children: "RAM / ROM Configuration"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-sm font-semibold text-foreground mt-0.5",
												children: customer.ramRom
											})] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-xs text-muted-foreground font-medium",
												children: "IMEI Number 1"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-sm font-mono font-semibold text-foreground mt-0.5 bg-muted/30 px-2 py-1 rounded border border-border/40 inline-block text-xs",
												children: customer.imei1 || "—"
											})] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-xs text-muted-foreground font-medium",
												children: "IMEI Number 2"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-sm font-mono font-semibold text-foreground mt-0.5 bg-muted/30 px-2 py-1 rounded border border-border/40 inline-block text-xs",
												children: customer.imei2 || "—"
											})] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-xs text-muted-foreground font-medium",
												children: "Bill Date"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-sm font-semibold text-foreground mt-0.5",
												children: customer.billDate
											})] })
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
									className: "p-5 space-y-4 border border-border/60 bg-surface",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border pb-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landmark, { className: "size-4 text-primary" }), " Finance & EMI Summary"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "grid grid-cols-2 gap-3 pb-2 border-b border-border/40",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "text-xs text-muted-foreground font-medium",
													children: "Selling Price"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "text-base font-bold text-foreground mt-0.5",
													children: formatInr(customer.price)
												})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "text-xs text-muted-foreground font-medium",
													children: "Down Payment"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "text-base font-bold text-danger mt-0.5",
													children: formatInr(customer.deposit)
												})] })]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "grid grid-cols-2 gap-3 py-1 text-xs",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground block",
														children: "Principal Loan:"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-semibold text-foreground text-sm",
														children: formatInr(customer.balanceForEmi)
													})] }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground block",
														children: "File Charge (10%):"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-semibold text-foreground text-sm",
														children: formatInr(customer.fileCharge)
													})] }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground block",
														children: "Interest Rate:"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "font-semibold text-foreground text-sm",
														children: [customer.interestRate, "% / month"]
													})] }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground block",
														children: "Total Interest:"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-semibold text-foreground text-sm",
														children: formatInr(customer.totalInterest)
													})] })
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "pt-2 border-t border-border/40",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center justify-between bg-success/5 p-2 rounded border border-success/10",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "text-[10px] text-success font-bold uppercase tracking-wider",
														children: "Per Month EMI"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "text-lg font-black text-success",
														children: formatInr(customer.perMonthEmi)
													})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "text-right",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															className: "text-[10px] text-muted-foreground uppercase tracking-wider",
															children: "EMI Start Date"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															className: "text-xs font-semibold text-foreground",
															children: customer.emiDate
														})]
													})]
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "space-y-1.5 pt-1",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex justify-between text-xs text-muted-foreground",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Instalment Progress:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: "font-semibold text-foreground",
															children: [
																customer.paidEmis,
																" / ",
																customer.noOfEmi,
																" Paid"
															]
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "w-full bg-muted rounded-full h-1.5 overflow-hidden",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															className: "bg-success h-full transition-all duration-300",
															style: { width: `${progressPercent}%` }
														})
													}),
													customer.missedEmis !== void 0 && customer.missedEmis > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex justify-between text-xs text-danger font-medium pt-1",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Missed Instalments:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [customer.missedEmis, " Missed"] })]
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "grid grid-cols-2 gap-3 pt-2 text-xs border-t border-border/40",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-muted-foreground block",
													children: "Total Collected:"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-bold text-success text-sm",
													children: formatInr(paidAmount)
												})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-muted-foreground block",
													children: "Outstanding Balance:"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-bold text-warning text-sm",
													children: formatInr(customer.pendingAmount)
												})] })]
											}),
											customer.pendingEmis > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												onClick: () => {
													openDialog("collect", { customerId: customer.id });
												},
												className: "w-full mt-4 h-9 rounded-md bg-success text-white text-xs font-bold hover:bg-success/90 transition-all flex items-center justify-center gap-1.5 shadow",
												children: "Collect EMI Payment"
											})
										]
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
								className: "text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5 border-b border-border pb-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-4 text-primary" }),
									" KYC Documents & Invoices (",
									customerDocs.length,
									")"
								]
							}), customerDocs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-center py-6 text-sm text-muted-foreground bg-surface border border-border/50 rounded-lg",
								children: "No KYC documents uploaded yet."
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid grid-cols-1 sm:grid-cols-3 gap-4",
								children: customerDocs.map((doc) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
									className: "p-4 flex flex-col justify-between border border-border/60 bg-surface hover:shadow-md transition-shadow",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												tone: doc.type === "Invoice" ? "success" : "info",
												children: doc.type
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[10px] text-muted-foreground font-mono",
												children: doc.fileSize
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-xs font-bold text-foreground mt-2 truncate",
											title: doc.fileName,
											children: doc.fileName
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-[10px] text-muted-foreground mt-0.5",
											children: ["Uploaded on ", doc.date]
										})
									] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex gap-2 mt-4 pt-3 border-t border-t-border/40",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												onClick: () => setPreviewDoc(doc),
												className: "flex-1 h-7 rounded bg-accent text-foreground text-xs font-semibold inline-flex items-center justify-center gap-1 hover:bg-accent/80 transition-colors",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-3" }), " View"]
											}),
											doc.type === "Invoice" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												onClick: () => handlePrintInvoice(doc),
												className: "flex-1 h-7 rounded bg-foreground text-background text-xs font-semibold inline-flex items-center justify-center gap-1 hover:opacity-90 transition-opacity",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Printer, { className: "size-3" }), " Print"]
											}),
											currentUser?.role.toLowerCase() === "admin" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												onClick: () => {
													if (confirm(`Are you sure you want to delete document ${doc.fileName}?`)) {
														deleteDocument(doc.id);
														toast.success(`Deleted document ${doc.fileName}`);
													}
												},
												className: "size-7 rounded border border-border inline-flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors text-muted-foreground shrink-0",
												title: "Delete Document",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3" })
											})
										]
									})]
								}, doc.id))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
								className: "text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5 border-b border-border pb-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "size-4 text-primary" }),
									" Instalment Payment History (",
									cPayments.length,
									")"
								]
							}), cPayments.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-center py-10 text-sm text-muted-foreground bg-surface border border-border/50 rounded-lg",
								children: "No instalments collected for this customer yet."
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "overflow-hidden border border-border/60 rounded-lg bg-surface",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
									className: "w-full text-xs text-left",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "text-muted-foreground uppercase border-b border-border bg-muted/20",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "py-2.5 px-4 font-semibold",
												children: "Transaction ID"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "py-2.5 px-4 font-semibold",
												children: "Payment Date"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "py-2.5 px-4 font-semibold",
												children: "Collector"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "py-2.5 px-4 font-semibold",
												children: "Method"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "py-2.5 px-4 font-semibold",
												children: "Remarks"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "py-2.5 px-4 font-semibold text-right",
												children: "Amount Paid"
											})
										]
									}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: cPayments.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "border-b border-border hover:bg-accent/35 last:border-0 transition-colors",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2.5 px-4 font-mono font-medium text-foreground",
												children: p.id
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2.5 px-4 text-muted-foreground",
												children: p.date
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2.5 px-4 text-muted-foreground",
												children: p.collector
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2.5 px-4",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													tone: "info",
													children: p.method
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2.5 px-4 text-muted-foreground italic truncate max-w-[150px]",
												title: p.remarks,
												children: p.remarks || "—"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2.5 px-4 text-right font-bold text-success",
												children: p.amount
											})
										]
									}, p.id)) })]
								})
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-4 border-t border-border bg-surface flex justify-between gap-2",
					children: [currentUser?.role.toLowerCase() === "admin" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							if (confirm(`Are you sure you want to delete ${customer.name}? This will also delete all associated loans, payments, and documents.`)) {
								deleteCustomer(customer.id);
								toast.success(`Deleted customer ${customer.name}`);
								onClose();
							}
						},
						className: "h-9 px-4 rounded-md bg-destructive text-destructive-foreground text-sm font-semibold hover:bg-destructive/90 transition-colors",
						children: "Delete Customer"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onClose,
						className: "h-9 px-4 rounded-md border border-border bg-surface text-sm font-semibold hover:bg-accent transition-colors ml-auto",
						children: "Close Profile"
					})]
				})
			]
		}), previewDoc && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: true,
			onOpenChange: (open) => !open && setPreviewDoc(null),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
				className: "max-w-4xl max-h-[92vh] overflow-y-auto p-6 z-[70]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between border-b border-border pb-4 mb-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
						className: "text-base font-bold uppercase tracking-wider text-primary",
						children: "Document Preview"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground mt-1",
						children: [
							previewDoc.customerName,
							" · ",
							previewDoc.type,
							" (",
							previewDoc.fileSize,
							")"
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [previewDoc.type === "Invoice" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => handlePrintInvoice(previewDoc),
							className: "h-8 px-3 rounded-md bg-foreground text-background text-xs font-semibold inline-flex items-center gap-1.5 hover:opacity-90 mr-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Printer, { className: "size-3.5" }), " Print"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setPreviewDoc(null),
							className: "size-8 rounded-full border border-border grid place-items-center hover:bg-accent transition-colors",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-lg border border-border overflow-hidden bg-white dark:bg-zinc-950 p-2 flex items-center justify-center min-h-[300px]",
					children: previewDoc.type === "Invoice" && previewDoc.fileUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
						title: "Invoice Preview",
						srcDoc: getSrcDoc(previewDoc.fileUrl),
						className: "w-full h-[60vh] border-0 bg-white"
					}) : previewDoc.fileUrl && previewDoc.fileUrl.startsWith("data:image/") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: previewDoc.fileUrl,
						alt: previewDoc.type,
						className: "max-h-[60vh] object-contain max-w-full rounded"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-center py-12 text-sm text-muted-foreground flex flex-col items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-12 text-muted-foreground/60" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-semibold text-foreground",
							children: previewDoc.fileName
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground mt-1",
							children: [previewDoc.type, " vault record"]
						})] })]
					})
				})]
			})
		})]
	});
}
function CustomersPage() {
	const customers = useStore((s) => s.customers);
	const { openDialog } = useUi();
	const sendWhatsapp = useStore((s) => s.sendWhatsapp);
	const deleteCustomer = useStore((s) => s.deleteCustomer);
	const currentUser = useStore((s) => s.currentUser);
	const [q, setQ] = (0, import_react.useState)("");
	const [statusTab, setStatusTab] = (0, import_react.useState)("All");
	const [selected, setSelected] = (0, import_react.useState)(null);
	const { preset: filterPreset, setPreset: setFilterPreset, customStart, setCustomStart, customEnd, setCustomEnd, startDate, endDate } = useDateFilter();
	const filtered = customers.filter((c) => {
		if (statusTab !== "All" && c.status !== statusTab) return false;
		if (!isDateInRange(parseAppDate(c.billDate), startDate, endDate)) return false;
		if (q) {
			const n = q.toLowerCase();
			return [
				c.name,
				c.id,
				c.mobile,
				c.village,
				c.mobileBrand,
				c.mobileModel,
				c.aadhaar
			].some((v) => v?.toLowerCase().includes(n));
		}
		return true;
	});
	const totalPending = filtered.reduce((s, c) => s + c.pendingAmount, 0);
	const totalCollected = filtered.reduce((s, c) => s + c.paidEmis * c.perMonthEmi, 0);
	const overdue = filtered.filter((c) => c.status === "Overdue" || c.status === "Defaulted").length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		breadcrumb: "Customers",
		children: [
			selected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CustomerDetailPanel, {
				c: selected,
				onClose: () => setSelected(null)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3 mb-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-[26px] font-semibold tracking-tight",
					children: "Master Customer List"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted-foreground mt-1",
					children: [
						filtered.length,
						" customers · ₹",
						totalPending.toLocaleString("en-IN"),
						" pending"
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => {
							downloadExcel("customers.xlsx", "Customers", filtered.map((c) => ({
								ID: c.id,
								Name: c.name,
								Father: c.fatherName,
								Mobile: c.mobile,
								Village: c.village,
								Brand: c.mobileBrand,
								Model: c.mobileModel,
								Price: c.price,
								"Monthly EMI": c.perMonthEmi,
								"No of EMI": c.noOfEmi,
								"Paid EMIs": c.paidEmis,
								"Pending EMIs": c.pendingEmis,
								"Pending Amount": c.pendingAmount,
								"EMI Date": c.emiDate,
								Status: c.status
							})));
							toast.success(`Exported ${filtered.length} customers`);
						},
						className: "h-9 px-3 rounded-md border border-border bg-surface text-sm inline-flex items-center gap-1.5 hover:bg-accent font-semibold transition-colors shadow-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-3.5" }), " Export"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => openDialog("customer"),
						className: "h-9 px-4 rounded-md bg-foreground text-background text-sm font-semibold inline-flex items-center gap-1.5 hover:opacity-90 shadow transition-opacity",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" }), " New Customer"]
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
						label: "Total Customers",
						value: filtered.length.toString(),
						sub: "In selected period"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Active",
						value: filtered.filter((c) => c.status === "Active").length.toString(),
						sub: "On track",
						trend: "up"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Overdue / Defaulted",
						value: overdue.toString(),
						sub: "Need follow-up",
						trend: overdue > 0 ? "down" : void 0
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Total Collected",
						value: `₹${Math.round(totalCollected / 1e3)}K`,
						sub: "In selected period",
						trend: "up"
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
							placeholder: "Search name, ID, mobile, brand, village…",
							className: "h-9 w-full rounded-md border border-border bg-background pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
						})]
					}), STATUS_TABS.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setStatusTab(t),
						className: `h-9 px-3 rounded-md border text-sm transition-colors ${statusTab === t ? "bg-foreground text-background border-foreground" : "border-border bg-surface hover:bg-accent"}`,
						children: [t, t !== "All" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ml-1.5 text-[10px] opacity-60",
							children: customers.filter((c) => c.status === t).length
						})]
					}, t))]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
					title: `${filtered.length} customer${filtered.length !== 1 ? "s" : ""}`,
					action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted-foreground",
						children: "Click any row to view full details"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-sm table-fixed min-w-[1400px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left font-medium px-5 py-2.5 w-[80px]",
									children: "ID"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left font-medium px-4 py-2.5 w-[180px]",
									children: "Customer Name"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left font-medium px-4 py-2.5 w-[120px]",
									children: "Mobile No"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left font-medium px-4 py-2.5 w-[110px]",
									children: "Village"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left font-medium px-4 py-2.5 w-[170px]",
									children: "Mobile (Brand · Model)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-right font-medium px-4 py-2.5 w-[100px]",
									children: "Price"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-right font-medium px-4 py-2.5 w-[110px]",
									children: "Monthly EMI"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-center font-medium px-4 py-2.5 w-[70px]",
									children: "EMI"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left font-medium px-4 py-2.5 w-[100px]",
									children: "EMI Date"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-right font-medium px-4 py-2.5 w-[120px]",
									children: "Pending Amt"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left font-medium px-4 py-2.5 w-[120px]",
									children: "Status"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-right font-medium px-5 py-2.5 w-[220px]",
									children: "Actions"
								})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							colSpan: 12,
							className: "px-5 py-12 text-center text-muted-foreground",
							children: "No customers match."
						}) }) : filtered.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-t border-border hover:bg-accent/40 cursor-pointer",
							onClick: () => setSelected(c),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-5 py-3 font-mono text-xs text-muted-foreground w-[80px] truncate",
									children: c.id
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-4 py-3 w-[180px]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "font-medium truncate",
										children: [
											c.firstName,
											" ",
											c.surname
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-xs text-muted-foreground truncate",
										children: c.fatherName
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 text-muted-foreground w-[120px] truncate",
									children: c.mobile
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 text-muted-foreground w-[110px] truncate",
									children: c.village
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-4 py-3 w-[170px]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "font-medium truncate",
										children: c.mobileModel
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-xs text-muted-foreground truncate",
										children: [
											c.mobileBrand,
											" · ",
											c.ramRom
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-4 py-3 text-right font-medium w-[100px] truncate",
									children: ["₹", c.price.toLocaleString("en-IN")]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-4 py-3 text-right font-semibold w-[110px] truncate",
									children: ["₹", c.perMonthEmi.toLocaleString("en-IN")]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 text-center w-[70px]",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-xs",
										children: [
											c.paidEmis,
											"/",
											c.noOfEmi
										]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 text-muted-foreground text-xs w-[100px] truncate",
									children: c.emiDate
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: `px-4 py-3 text-right font-medium w-[120px] truncate ${c.pendingEmis > 0 ? "text-warning" : "text-success"}`,
									children: c.pendingEmis > 0 ? `₹${c.pendingAmount.toLocaleString("en-IN")}` : "Closed"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-4 py-3 w-[120px]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										tone: statusTone(c.status),
										children: c.status
									}), c.missedEmis !== void 0 && c.missedEmis > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-[10px] text-danger font-semibold mt-0.5 whitespace-nowrap",
										children: [c.missedEmis, " missed"]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-5 py-3 text-right w-[220px]",
									onClick: (e) => e.stopPropagation(),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "inline-flex gap-1",
										children: [
											c.pendingEmis > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												title: "Collect Payment",
												onClick: () => openDialog("collect", { customerId: c.id }),
												className: "h-8 px-2.5 rounded-md bg-success/10 text-success border border-success/20 text-xs font-bold hover:bg-success/20 transition-all duration-200 shadow-sm",
												children: "Collect"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												title: "View details",
												onClick: () => setSelected(c),
												className: "size-8 rounded-md border border-primary/10 bg-primary/5 text-primary grid place-items-center hover:bg-primary hover:text-primary-foreground transition-all duration-200 shadow-sm",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-3.5" })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												title: "WhatsApp reminder",
												onClick: () => {
													sendWhatsapp({
														to: c.mobile,
														kind: "EMI Reminder"
													});
													toast.success(`Reminder sent to ${c.name}`);
												},
												className: "size-8 rounded-md border border-success/10 bg-success/5 text-success grid place-items-center hover:bg-success hover:text-white transition-all duration-200 shadow-sm",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-3.5" })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												title: "Call",
												onClick: () => toast.message(`Calling ${c.name}`, { description: c.mobile }),
												className: "size-8 rounded-md border border-info/10 bg-info/5 text-info grid place-items-center hover:bg-info hover:text-white transition-all duration-200 shadow-sm",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "size-3.5" })
											}),
											currentUser?.role.toLowerCase() === "admin" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												title: "Delete customer",
												onClick: () => {
													if (confirm(`Are you sure you want to delete ${c.name}? This will also delete all associated loans, payments, and documents.`)) {
														deleteCustomer(c.id);
														toast.success(`Deleted customer ${c.name}`);
													}
												},
												className: "size-8 rounded-md border border-destructive/10 bg-destructive/5 text-destructive grid place-items-center hover:bg-destructive hover:text-white transition-all duration-200 shadow-sm",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" })
											})
										]
									})
								})
							]
						}, c.id)) })]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-5 py-3 border-t border-border flex flex-wrap gap-6 text-xs text-muted-foreground bg-muted/20",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							"Showing ",
							filtered.length,
							" of ",
							customers.length
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Total Pending: ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
							className: "text-warning",
							children: ["₹", filtered.reduce((s, c) => s + c.pendingAmount, 0).toLocaleString("en-IN")]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Total EMI Value: ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: ["₹", filtered.reduce((s, c) => s + c.totalEmiAmount, 0).toLocaleString("en-IN")] })] })
					]
				})
			] })
		]
	});
}
//#endregion
export { CustomersPage as component };
