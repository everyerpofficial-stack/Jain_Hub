import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as CheckboxIndicator, t as Checkbox$1 } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { C as Search, M as MessageCircle, Z as Download, ct as ChevronDown, l as TriangleAlert, lt as Check, q as FileText } from "../_libs/lucide-react.mjs";
import { _ as useStore, c as cn, d as downloadExcel, f as isDateInRange, p as parseAppDate, v as useUi } from "./mobileStore-B8EWbC21.mjs";
import { a as SectionHeader, n as Badge, o as StatCard, r as Card, t as AppShell } from "./ui-kit-iW0nuj1I.mjs";
import { n as useDateFilter, t as FilterBar } from "./FilterBar-B1CYUr5_.mjs";
import { i as Trigger, n as Portal, r as Root2, t as Content2 } from "../_libs/@radix-ui/react-popover+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/collections-BO03xddv.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Popover = Root2;
var PopoverTrigger = Trigger;
var PopoverContent = import_react.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	align,
	sideOffset,
	className: cn("z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-popover-content-transform-origin)", className),
	...props
}) }));
PopoverContent.displayName = Content2.displayName;
var Checkbox = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox$1, {
	ref,
	className: cn("grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckboxIndicator, {
		className: cn("grid place-content-center text-current"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" })
	})
}));
Checkbox.displayName = Checkbox$1.displayName;
function MultiSelect({ title, options, selected, onChange, placeholder = "Select options" }) {
	const [search, setSearch] = import_react.useState("");
	const filteredOptions = options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()));
	const handleToggle = (value) => {
		if (selected.includes(value)) onChange(selected.filter((v) => v !== value));
		else onChange([...selected, value]);
	};
	const handleSelectAll = () => {
		onChange(options.map((o) => o.value));
	};
	const handleClearAll = () => {
		onChange([]);
	};
	const displayLabel = () => {
		if (selected.length === 0) return placeholder;
		if (selected.length === options.length) return `All ${title}`;
		if (selected.length <= 2) return selected.map((val) => options.find((o) => o.value === val)?.label || val).join(", ");
		return `${selected.length} Selected`;
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			className: "h-9 min-w-[145px] max-w-[220px] flex items-center justify-between gap-2 px-3 py-2 rounded-md border border-border bg-surface text-sm text-foreground/80 hover:bg-accent hover:text-foreground hover:border-accent-foreground/30 transition-all font-medium cursor-pointer shadow-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "truncate",
				children: displayLabel()
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-4 shrink-0 text-muted-foreground opacity-60" })]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PopoverContent, {
		className: "w-56 p-2 flex flex-col gap-2 bg-popover border border-border shadow-md rounded-md",
		align: "start",
		children: [
			options.length > 5 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "text",
				placeholder: "Search...",
				value: search,
				onChange: (e) => setSearch(e.target.value),
				className: "h-8 w-full rounded border border-border bg-background px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between text-[10px] px-1 font-semibold text-muted-foreground/80 border-b border-border/40 pb-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: handleSelectAll,
					className: "hover:text-foreground cursor-pointer",
					children: "Select All"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: handleClearAll,
					className: "hover:text-foreground cursor-pointer",
					children: "Clear"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "max-h-48 overflow-y-auto divide-y divide-border/30 flex flex-col",
				children: filteredOptions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "py-2 text-center text-xs text-muted-foreground",
					children: "No options found"
				}) : filteredOptions.map((o) => {
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						onClick: () => handleToggle(o.value),
						className: "flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-accent cursor-pointer transition-colors text-xs font-medium",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
							checked: selected.includes(o.value),
							onCheckedChange: () => handleToggle(o.value),
							onClick: (e) => e.stopPropagation()
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate",
							children: o.label
						})]
					}, o.value);
				})
			})
		]
	})] });
}
var generateDueListPdf = (list) => {
	const printWindow = window.open("", "_blank");
	if (!printWindow) {
		toast.error("Failed to open print window");
		return;
	}
	const safeFormatInr = (val) => {
		if (val === void 0 || val === null || val === "") return "—";
		const num = typeof val === "number" ? val : Number(String(val).replace(/[^\d.-]/g, ""));
		return isNaN(num) ? String(val) : `₹${num.toLocaleString("en-IN")}`;
	};
	const rowsHtml = list.map((c, i) => `
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 8px 10px; text-align: center;">${i + 1}</td>
      <td style="padding: 8px 10px;">${c.emiDate}</td>
      <td style="padding: 8px 10px;"><strong>${c.name}</strong></td>
      <td style="padding: 8px 10px;">${c.fatherName || "—"}</td>
      <td style="padding: 8px 10px;">${c.village}</td>
      <td style="padding: 8px 10px;">${c.mobile}</td>
      <td style="padding: 8px 10px; text-align: right;">${safeFormatInr(c.perMonthEmi)}</td>
      <td style="padding: 8px 10px; text-align: center;">${c.pendingEmis}</td>
      <td style="padding: 8px 10px; text-align: right; font-weight: 600; color: #b91c1c;">${safeFormatInr(c.pendingAmount)}</td>
    </tr>
  `).join("");
	const totalOutstanding = list.reduce((sum, c) => sum + c.pendingAmount, 0);
	const htmlContent = `
    <html>
      <head>
        <title>Jain Finance - EMI Due List</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
          body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; background: white; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 25px; }
          .header h1 { margin: 0; font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.02em; }
          .header p { margin: 4px 0 0 0; font-size: 12px; color: #64748b; }
          .meta { font-size: 11px; text-align: right; color: #64748b; line-height: 1.5; }
          
          .summary-bar { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; display: flex; justify-content: space-between; font-size: 12px; }
          .summary-bar span { font-weight: 600; }
          .summary-bar .outstanding { color: #b91c1c; font-size: 14px; }

          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th { padding: 8px 10px; border-bottom: 2px solid #cbd5e1; text-align: left; font-size: 10px; font-weight: 600; text-transform: uppercase; color: #475569; background-color: #f1f5f9; }
          td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 10px; color: #334155; vertical-align: middle; }
          tr:nth-child(even) { background-color: #f8fafc; }
          
          .footer { margin-top: 50px; font-size: 10px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px; }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>JAIN FINANCE</h1>
            <p>EMI Outstanding Due List Report</p>
          </div>
          <div class="meta">
            <p><strong>Report Date:</strong> ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-IN")}</p>
            <p><strong>Total Records:</strong> ${list.length}</p>
          </div>
        </div>

        <div class="summary-bar">
          <div>Report Scope: <span>Outstanding instalments</span></div>
          <div>Total Outstanding: <span class="outstanding">${safeFormatInr(totalOutstanding)}</span></div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th style="width: 5%; text-align: center;">Sno.</th>
              <th style="width: 10%">Date</th>
              <th style="width: 18%">Customer Name</th>
              <th style="width: 15%">Father Name</th>
              <th style="width: 10%">Village</th>
              <th style="width: 12%">Mobile No.</th>
              <th style="width: 10%; text-align: right;">EMI Amount</th>
              <th style="width: 10%; text-align: center;">Due No.EMI</th>
              <th style="width: 10%; text-align: right;">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
        
        <div class="footer">
          Jain Finance Mobile EMI Finance System · Confidential Internal Due List Report
        </div>
      </body>
    </html>
  `;
	printWindow.document.write(htmlContent);
	printWindow.document.close();
	printWindow.focus();
	setTimeout(() => {
		printWindow.print();
	}, 250);
};
function DueListPage() {
	const customers = useStore((s) => s.customers);
	useStore((s) => s.recordPayment);
	const sendWhatsapp = useStore((s) => s.sendWhatsapp);
	const { openDialog } = useUi();
	const [q, setQ] = (0, import_react.useState)("");
	const [villageFilter, setVillageFilter] = (0, import_react.useState)([]);
	const [statusFilter, setStatusFilter] = (0, import_react.useState)([]);
	const [pendingEmiFilter, setPendingEmiFilter] = (0, import_react.useState)([]);
	const { preset: filterPreset, setPreset: setFilterPreset, customStart, setCustomStart, customEnd, setCustomEnd, startDate, endDate } = useDateFilter();
	const pending = customers.filter((c) => c.pendingEmis > 0);
	const villages = Array.from(new Set(pending.map((c) => c.village)));
	const pendingEmiCounts = Array.from({ length: 24 }, (_, i) => i + 1);
	const sortedFiltered = [...pending.filter((c) => {
		if (villageFilter.length > 0 && !villageFilter.includes(c.village)) return false;
		if (statusFilter.length > 0 && !statusFilter.includes(c.status)) return false;
		if (pendingEmiFilter.length > 0 && !pendingEmiFilter.includes(String(c.missedEmis ?? 0))) return false;
		if (!isDateInRange(parseAppDate(c.emiDate), startDate, endDate)) return false;
		if (q) {
			const n = q.toLowerCase();
			return [
				c.name,
				c.id,
				c.mobile,
				c.village,
				c.mobileModel
			].some((v) => v?.toLowerCase().includes(n));
		}
		return true;
	})].sort((a, b) => {
		const aMobile = (a.mobile || "").replace(/[^\d]/g, "");
		const bMobile = (b.mobile || "").replace(/[^\d]/g, "");
		return aMobile.localeCompare(bMobile);
	});
	const totalPending = sortedFiltered.reduce((s, c) => s + c.pendingAmount, 0);
	const overdue = sortedFiltered.filter((c) => c.status === "Overdue" || c.status === "Defaulted").length;
	const overdueAmt = sortedFiltered.filter((c) => c.status === "Overdue" || c.status === "Defaulted").reduce((s, c) => s + c.pendingAmount, 0);
	const tone = (s) => s === "Active" ? "success" : s === "Overdue" ? "warning" : s === "Defaulted" ? "danger" : "neutral";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		breadcrumb: "Due List",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3 mb-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-[26px] font-semibold tracking-tight",
					children: "EMI Due List"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted-foreground mt-1",
					children: [
						sortedFiltered.length,
						" customers with pending EMIs · ₹",
						totalPending.toLocaleString("en-IN"),
						" outstanding"
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => {
								downloadExcel("due-list.xlsx", "Due List", sortedFiltered.map((c) => ({
									ID: c.id,
									Name: c.name,
									Father: c.fatherName,
									Mobile: c.mobile,
									Village: c.village,
									"Mobile Model": c.mobileModel,
									"Deposit Amount": c.deposit,
									"Finance Amount": c.price,
									"Monthly EMI": c.perMonthEmi,
									"EMI Date": c.emiDate,
									"Last Payment": c.lastPaymentDate,
									"Pending EMIs": c.pendingEmis,
									"Outstanding Amount": c.pendingAmount,
									Status: c.status
								})));
								toast.success(`Exported ${sortedFiltered.length} records`);
							},
							className: "h-9 px-3 rounded-md border border-border bg-surface text-sm inline-flex items-center gap-1.5 hover:bg-accent font-semibold transition-colors shadow-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-3.5" }), " Export"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => {
								generateDueListPdf(sortedFiltered);
							},
							className: "h-9 px-3 rounded-md border border-border bg-surface text-sm inline-flex items-center gap-1.5 hover:bg-accent font-semibold transition-colors shadow-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-3.5" }), " Print PDF"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => {
								sortedFiltered.forEach((c) => sendWhatsapp({
									to: c.mobile,
									kind: "EMI Due Reminder"
								}));
								toast.success(`Reminders sent to ${sortedFiltered.length} customers`);
							},
							className: "h-9 px-4 rounded-md bg-foreground text-background text-sm font-semibold inline-flex items-center gap-1.5 hover:opacity-90 shadow transition-opacity",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-3.5" }), " Send Reminders"]
						})
					]
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
						label: "Total Pending",
						value: `₹${Math.round(totalPending / 1e3)}K`,
						sub: `${sortedFiltered.length} customers`,
						trend: "warn"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Overdue / Defaulted",
						value: overdue.toString(),
						sub: `₹${overdueAmt.toLocaleString("en-IN")}`,
						trend: overdue > 0 ? "down" : void 0
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Active Pending",
						value: sortedFiltered.filter((c) => c.status === "Active").length.toString(),
						sub: "Next due soon"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Avg Pending",
						value: `₹${sortedFiltered.length ? Math.round(totalPending / sortedFiltered.length).toLocaleString("en-IN") : "0"}`,
						sub: "Per customer"
					})
				]
			}),
			overdue > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-5 flex items-start gap-3 rounded-xl border border-danger/30 bg-danger/5 px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-4 text-danger shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-semibold text-danger",
						children: [overdue, " customers are overdue or defaulted."]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-muted-foreground ml-1.5",
						children: [
							"Total exposure: ₹",
							overdueAmt.toLocaleString("en-IN"),
							". Send WhatsApp reminders or escalate."
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-4 border-b border-border flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative flex-1 min-w-[220px]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: q,
								onChange: (e) => setQ(e.target.value),
								placeholder: "Search by name, ID, mobile, village, model…",
								className: "h-9 w-full rounded-md border border-border bg-background pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MultiSelect, {
							title: "Villages",
							options: villages.map((v) => ({
								label: v,
								value: v
							})),
							selected: villageFilter,
							onChange: setVillageFilter,
							placeholder: "All villages"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MultiSelect, {
							title: "Statuses",
							options: [
								{
									label: "Active",
									value: "Active"
								},
								{
									label: "Overdue",
									value: "Overdue"
								},
								{
									label: "Defaulted",
									value: "Defaulted"
								}
							],
							selected: statusFilter,
							onChange: setStatusFilter,
							placeholder: "All Status"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MultiSelect, {
							title: "Missed Counts",
							options: pendingEmiCounts.map((count) => ({
								label: `${count} Missed`,
								value: count.toString()
							})),
							selected: pendingEmiFilter,
							onChange: setPendingEmiFilter,
							placeholder: "All Missed"
						}),
						(q || villageFilter.length > 0 || statusFilter.length > 0 || pendingEmiFilter.length > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => {
								setQ("");
								setVillageFilter([]);
								setStatusFilter([]);
								setPendingEmiFilter([]);
							},
							className: "h-9 px-3 rounded-md border border-border text-sm text-muted-foreground hover:bg-accent cursor-pointer",
							children: "Clear"
						})
					]
				}),
				sortedFiltered.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-5 py-2.5 border-b border-border bg-warning/5 flex items-center justify-between text-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-muted-foreground",
						children: [sortedFiltered.length, " customers"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-semibold text-warning",
						children: ["Total Pending: ₹", sortedFiltered.reduce((s, c) => s + c.pendingAmount, 0).toLocaleString("en-IN")]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
					title: "Due List",
					action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-xs text-muted-foreground",
						children: [sortedFiltered.length, " records"]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-sm table-fixed min-w-[1520px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left font-medium px-5 py-2.5 w-[80px]",
									children: "ID"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left font-medium px-4 py-2.5 w-[150px]",
									children: "Customer Name"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left font-medium px-4 py-2.5 w-[120px]",
									children: "Father's Name"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left font-medium px-4 py-2.5 w-[110px]",
									children: "Mobile No"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left font-medium px-4 py-2.5 w-[100px]",
									children: "Village Name"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-right font-medium px-4 py-2.5 w-[90px]",
									children: "Deposit Amount"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-right font-medium px-4 py-2.5 w-[90px]",
									children: "Finance Amount"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-right font-medium px-4 py-2.5 w-[90px]",
									children: "Total EMI Amt"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-right font-medium px-4 py-2.5 w-[90px]",
									children: "Monthly EMI"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-center font-medium px-4 py-2.5 w-[70px]",
									children: "No of EMI"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left font-medium px-4 py-2.5 w-[100px]",
									children: "EMI Date"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left font-medium px-4 py-2.5 w-[100px]",
									children: "Last Payment"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-right font-medium px-4 py-2.5 w-[100px]",
									children: "Outstanding Amount"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left font-medium px-4 py-2.5 w-[110px]",
									children: "Status"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-right font-medium px-5 py-2.5 w-[120px]",
									children: "Actions"
								})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: sortedFiltered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							colSpan: 15,
							className: "px-5 py-12 text-center text-muted-foreground",
							children: "No pending EMIs match the current filters. 🎉"
						}) }) : sortedFiltered.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-t border-border hover:bg-accent/30",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-5 py-3 font-mono text-xs text-muted-foreground w-[80px] truncate",
									children: c.id
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-4 py-3 w-[150px]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "font-medium truncate",
										children: c.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-xs text-muted-foreground truncate",
										children: [
											c.mobileBrand,
											" ",
											c.mobileModel
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 text-muted-foreground text-xs w-[120px] truncate",
									children: c.fatherName || "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 text-muted-foreground w-[110px] truncate",
									children: c.mobile
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 text-muted-foreground w-[100px] truncate",
									children: c.village
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-4 py-3 text-right font-medium text-muted-foreground w-[90px] truncate",
									children: ["₹", c.deposit.toLocaleString("en-IN")]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-4 py-3 text-right font-semibold text-foreground w-[90px] truncate",
									children: ["₹", c.price.toLocaleString("en-IN")]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-4 py-3 text-right font-medium text-muted-foreground w-[90px] truncate",
									children: ["₹", c.totalEmiAmount.toLocaleString("en-IN")]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-4 py-3 text-right font-semibold w-[90px] truncate",
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
									className: "px-4 py-3 text-muted-foreground text-xs w-[100px] truncate",
									children: c.lastPaymentDate
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-4 py-3 text-right font-semibold text-warning w-[100px] truncate",
									children: ["₹", c.pendingAmount.toLocaleString("en-IN")]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-4 py-3 w-[110px]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										tone: tone(c.status),
										children: c.status
									}), c.missedEmis !== void 0 && c.missedEmis > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-[10px] text-danger font-semibold mt-0.5 whitespace-nowrap",
										children: [c.missedEmis, " missed"]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-5 py-3 text-right w-[120px]",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "inline-flex gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											title: "Collect EMI",
											onClick: () => openDialog("collect", { customerId: c.id }),
											className: "h-7 px-2.5 rounded-md bg-success/10 text-success border border-success/20 text-xs font-medium hover:bg-success/20 transition-colors",
											children: "Collect"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											title: "WhatsApp",
											onClick: () => {
												sendWhatsapp({
													to: c.mobile,
													kind: "EMI Reminder"
												});
												toast.success(`Reminder sent to ${c.name}`);
											},
											className: "size-7 rounded-md border border-border grid place-items-center hover:bg-accent",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-3" })
										})]
									})
								})
							]
						}, c.id)) })]
					})
				})
			] })
		]
	});
}
//#endregion
export { DueListPage as component };
