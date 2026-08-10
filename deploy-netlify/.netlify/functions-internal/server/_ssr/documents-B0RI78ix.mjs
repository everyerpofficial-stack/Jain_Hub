import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { E as Printer, K as FolderOpen, X as Eye, Z as Download, b as ShieldCheck, p as Trash2, q as FileText } from "../_libs/lucide-react.mjs";
import { _ as useStore, f as isDateInRange, i as DialogDescription, n as Dialog, o as DialogHeader, p as parseAppDate, r as DialogContent, s as DialogTitle } from "./mobileStore-B8EWbC21.mjs";
import { a as SectionHeader, n as Badge, r as Card, t as AppShell } from "./ui-kit-iW0nuj1I.mjs";
import { n as useDateFilter, t as FilterBar } from "./FilterBar-B1CYUr5_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/documents-B0RI78ix.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function DocumentsPage() {
	const documents = useStore((s) => s.documents);
	const deleteDocument = useStore((s) => s.deleteDocument);
	const currentUser = useStore((s) => s.currentUser);
	const [previewDoc, setPreviewDoc] = (0, import_react.useState)(null);
	const [selectedFolder, setSelectedFolder] = (0, import_react.useState)(null);
	const { preset: filterPreset, setPreset: setFilterPreset, customStart, setCustomStart, customEnd, setCustomEnd, startDate, endDate } = useDateFilter();
	const filteredDocs = documents.filter((d) => {
		return isDateInRange(parseAppDate(d.date), startDate, endDate);
	});
	const aadhaarCount = filteredDocs.filter((d) => d.type === "Aadhaar Card").length;
	const photoCount = filteredDocs.filter((d) => d.type === "Customer Photo").length;
	const invoiceCount = filteredDocs.filter((d) => d.type === "Invoice").length;
	const agreementCount = filteredDocs.filter((d) => d.type === "Loan Agreement").length;
	const panCount = filteredDocs.filter((d) => d.type === "PAN Card").length;
	const handlePrint = () => {
		const iframe = document.getElementById("invoice-iframe");
		if (iframe && iframe.contentWindow) {
			iframe.contentWindow.focus();
			iframe.contentWindow.print();
		} else window.print();
	};
	const getSrcDoc = (url) => {
		if (!url) return "";
		try {
			return decodeURIComponent(url.replace("data:text/html;charset=utf-8,", ""));
		} catch {
			return "";
		}
	};
	const groupedFolders = (() => {
		const map = {};
		filteredDocs.forEach((d) => {
			const key = d.customerId || d.customerName;
			if (!map[key]) map[key] = {
				customerId: d.customerId,
				customerName: d.customerName,
				documents: []
			};
			map[key].documents.push(d);
		});
		return Object.values(map);
	})();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		breadcrumb: "Documents",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap items-end justify-between gap-3 mb-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-[26px] font-semibold tracking-tight",
					children: "Document Vault"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted-foreground mt-1 inline-flex items-center gap-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-3.5 text-success" }),
						" ",
						filteredDocs.length,
						" documents · Encrypted client storage"
					]
				})] })
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
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 md:grid-cols-5 gap-4",
				children: [
					{
						label: "Aadhaar",
						count: aadhaarCount,
						tone: "info"
					},
					{
						label: "Photos",
						count: photoCount,
						tone: "info"
					},
					{
						label: "Invoices",
						count: invoiceCount,
						tone: "success"
					},
					{
						label: "Agreements",
						count: agreementCount,
						tone: "success"
					},
					{
						label: "PAN",
						count: panCount,
						tone: "warning"
					}
				].map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 text-xs text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-3.5" }),
							" ",
							c.label
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex items-end justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-2xl font-semibold tracking-tight",
							children: c.count
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: c.tone,
							children: "files"
						})]
					})]
				}, c.label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "mt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, { title: "All Customer Folders" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left font-medium px-5 py-2.5",
									children: "Customer Name"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left font-medium px-4 py-2.5",
									children: "Customer ID"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left font-medium px-4 py-2.5",
									children: "KYC Documents Available"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-center font-medium px-4 py-2.5",
									children: "Total Files"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left font-medium px-4 py-2.5",
									children: "Last Updated"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-right font-medium px-5 py-2.5",
									children: "Actions"
								})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: groupedFolders.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							colSpan: 6,
							className: "px-5 py-12 text-center text-muted-foreground",
							children: "No documents found. New invoices and uploaded KYC files appear here automatically when customer accounts are created."
						}) }) : groupedFolders.map((folder) => {
							const docTypes = Array.from(new Set(folder.documents.map((d) => d.type)));
							const latestDate = folder.documents.reduce((latest, d) => {
								return d.date > latest ? d.date : latest;
							}, "");
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-t border-border hover:bg-accent/40 cursor-pointer",
								onClick: () => setSelectedFolder(folder),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-5 py-3 font-semibold text-foreground",
										children: folder.customerName
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3 font-mono text-xs text-muted-foreground",
										children: folder.customerId
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "flex flex-wrap gap-1",
											children: docTypes.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												tone: t === "Invoice" ? "success" : t === "Customer Photo" || t === "Aadhaar Card" ? "info" : "warning",
												children: t
											}, t))
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "px-4 py-3 text-center font-medium text-foreground",
										children: [folder.documents.length, " files"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3 text-muted-foreground text-xs",
										children: latestDate
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-5 py-3 text-right",
										onClick: (e) => e.stopPropagation(),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											onClick: () => setSelectedFolder(folder),
											className: "h-8 px-3 rounded-md bg-accent text-foreground text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-accent/80 transition-colors",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderOpen, { className: "size-3.5" }), " View Folder"]
										})
									})
								]
							}, folder.customerId);
						}) })]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!selectedFolder,
				onOpenChange: (open) => !open && setSelectedFolder(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
					className: "max-w-3xl max-h-[85vh] overflow-y-auto p-6",
					children: selectedFolder && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
						className: "border-b border-border pb-4 mb-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
							className: "text-base font-bold uppercase tracking-wider text-primary",
							children: ["Documents Folder: ", selectedFolder.customerName]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, {
							className: "text-xs text-muted-foreground mt-1",
							children: [
								"Customer ID: ",
								selectedFolder.customerId,
								" · Total ",
								selectedFolder.documents.length,
								" files stored"
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-1 md:grid-cols-2 gap-4 mt-2",
						children: selectedFolder.documents.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "p-4 flex flex-col justify-between border border-border bg-surface hover:shadow-md transition-shadow",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider",
										children: d.type
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										tone: d.status === "Verified" ? "success" : d.status === "Signed" ? "info" : "warning",
										children: d.status
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-sm font-bold text-foreground mt-2 truncate",
									title: d.fileName,
									children: d.fileName
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xs text-muted-foreground mt-1",
									children: [
										d.fileSize,
										" · Uploaded ",
										d.date
									]
								})
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2 mt-4 pt-3 border-t border-t-border/50",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: () => setPreviewDoc(d),
										className: "flex-1 h-8 rounded-md bg-accent text-foreground text-xs font-semibold inline-flex items-center justify-center gap-1.5 hover:bg-accent/80",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-3.5" }), " Preview"]
									}),
									d.fileUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
										href: d.fileUrl,
										download: d.fileName,
										className: "flex-1 h-8 rounded-md border border-border text-foreground text-xs font-semibold inline-flex items-center justify-center gap-1.5 hover:bg-accent text-center text-decoration-none",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-3.5" }), " Download"]
									}),
									currentUser?.role.toLowerCase() === "admin" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => {
											if (confirm(`Are you sure you want to delete document ${d.fileName}?`)) {
												deleteDocument(d.id);
												toast.success(`Deleted document ${d.fileName}`);
												const updatedDocs = selectedFolder.documents.filter((doc) => doc.id !== d.id);
												if (updatedDocs.length === 0) setSelectedFolder(null);
												else setSelectedFolder({
													...selectedFolder,
													documents: updatedDocs
												});
											}
										},
										className: "size-8 rounded-md border border-border inline-flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors text-muted-foreground shrink-0",
										title: "Delete Document",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" })
									})
								]
							})]
						}, d.id))
					})] })
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!previewDoc,
				onOpenChange: (open) => !open && setPreviewDoc(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
					className: "max-w-4xl max-h-[92vh] overflow-y-auto p-6",
					children: previewDoc && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, {
						className: "border-b border-border pb-4 mb-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
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
							})] }), previewDoc.type === "Invoice" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: handlePrint,
								className: "h-8 px-3 rounded-md bg-foreground text-background text-xs font-semibold inline-flex items-center gap-1.5 hover:opacity-90 mr-6",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Printer, { className: "size-3.5" }), " Print Invoice"]
							})]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-lg border border-border overflow-hidden bg-white dark:bg-zinc-950 p-2 flex items-center justify-center min-h-[300px]",
						children: previewDoc.type === "Invoice" && previewDoc.fileUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
							id: "invoice-iframe",
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
					})] })
				})
			})
		]
	});
}
//#endregion
export { DocumentsPage as component };
