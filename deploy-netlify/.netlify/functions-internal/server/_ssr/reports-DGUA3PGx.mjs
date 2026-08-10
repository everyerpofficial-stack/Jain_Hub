import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { J as FileSpreadsheet, ct as ChevronDown, lt as Check, ot as ChevronUp, q as FileText } from "../_libs/lucide-react.mjs";
import { _ as useStore, c as cn, d as downloadExcel, f as isDateInRange, p as parseAppDate, u as downloadCustomerStatementExcel } from "./mobileStore-B8EWbC21.mjs";
import { r as Card, t as AppShell } from "./ui-kit-iW0nuj1I.mjs";
import { n as useDateFilter, t as FilterBar } from "./FilterBar-B1CYUr5_.mjs";
import { a as ItemText, c as Root2, d as Separator, f as Trigger, i as ItemIndicator, l as ScrollDownButton, m as Viewport, n as Icon, o as Label, p as Value, r as Item, s as Portal, t as Content2, u as ScrollUpButton } from "../_libs/@radix-ui/react-select+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reports-DGUA3PGx.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Select = Root2;
var SelectValue = Value;
var SelectTrigger = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Trigger, {
	ref,
	className: cn("flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background cursor-pointer data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-4 w-4 opacity-50" })
	})]
}));
SelectTrigger.displayName = Trigger.displayName;
var SelectScrollUpButton = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollUpButton, {
	ref,
	className: cn("flex cursor-default items-center justify-center py-1", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "h-4 w-4" })
}));
SelectScrollUpButton.displayName = ScrollUpButton.displayName;
var SelectScrollDownButton = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollDownButton, {
	ref,
	className: cn("flex cursor-default items-center justify-center py-1", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-4 w-4" })
}));
SelectScrollDownButton.displayName = ScrollDownButton.displayName;
var SelectContent = import_react.forwardRef(({ className, children, position = "popper", ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Content2, {
	ref,
	className: cn("relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-select-content-transform-origin)", position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", className),
	position,
	...props,
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollUpButton, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Viewport, {
			className: cn("p-1", position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"),
			children
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollDownButton, {})
	]
}) }));
SelectContent.displayName = Content2.displayName;
var SelectLabel = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
	ref,
	className: cn("px-2 py-1.5 text-sm font-semibold", className),
	...props
}));
SelectLabel.displayName = Label.displayName;
var SelectItem = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Item, {
	ref,
	className: cn("relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute right-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIndicator, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }) })
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemText, { children })]
}));
SelectItem.displayName = Item.displayName;
var SelectSeparator = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, {
	ref,
	className: cn("-mx-1 my-1 h-px bg-muted", className),
	...props
}));
SelectSeparator.displayName = Separator.displayName;
function ReportsPage() {
	const customers = useStore((s) => s.customers);
	const loans = useStore((s) => s.loans);
	const collections = useStore((s) => s.collections);
	const expenses = useStore((s) => s.expenses);
	const investments = useStore((s) => s.investments);
	const payments = useStore((s) => s.payments);
	const [selectedCustomerId, setSelectedCustomerId] = (0, import_react.useState)("");
	const { preset: filterPreset, setPreset: setFilterPreset, customStart, setCustomStart, customEnd, setCustomEnd, startDate, endDate } = useDateFilter();
	const filteredCustomers = customers.filter((c) => {
		return isDateInRange(parseAppDate(c.billDate), startDate, endDate);
	});
	const custMap = new Map(customers.map((c) => [c.name, c.billDate]));
	const filteredLoans = loans.filter((l) => {
		const bDateStr = custMap.get(l.customer);
		if (!bDateStr) return true;
		return isDateInRange(parseAppDate(bDateStr), startDate, endDate);
	});
	const custEmiMap = new Map(customers.map((c) => [c.id, c.emiDate]));
	const filteredCollections = collections.filter((col) => {
		const eDateStr = custEmiMap.get(col.customerId);
		if (!eDateStr) return true;
		return isDateInRange(parseAppDate(eDateStr), startDate, endDate);
	});
	const filteredPayments = payments.filter((p) => {
		return isDateInRange(parseAppDate(p.date), startDate, endDate);
	});
	const filteredExpenses = expenses.filter((e) => {
		return isDateInRange(parseAppDate(e.date), startDate, endDate);
	});
	const filteredInvestments = investments.filter((i) => {
		return isDateInRange(parseAppDate(i.maturity), startDate, endDate);
	});
	const safeFormatInr = (val) => {
		if (val === void 0 || val === null || val === "") return "—";
		const num = typeof val === "number" ? val : Number(String(val).replace(/[^\d.-]/g, ""));
		return isNaN(num) ? String(val) : `₹${num.toLocaleString("en-IN")}`;
	};
	const formattedCustomers = filteredCustomers.map((c) => ({
		"Customer ID": c.id || "—",
		"Full Name": c.name || "—",
		"Mobile No": c.mobile || "—",
		"Aadhaar Card": c.aadhaar || "—",
		"Guarantor": c.guarantyName ? `${c.guarantyName} (${c.guarantyMobile || "—"})` : "—",
		"Village": c.village || "—",
		"Device Purchased": c.mobileBrand && c.mobileModel ? `${c.mobileBrand} ${c.mobileModel} (${c.ramRom || "—"})` : "—",
		"Selling Price": safeFormatInr(c.price),
		"Down Payment": safeFormatInr(c.deposit),
		"Monthly EMI": safeFormatInr(c.perMonthEmi),
		"Instalment Progress": c.noOfEmi ? `${c.paidEmis || 0}/${c.noOfEmi} paid` : "—",
		"Pending Balance": safeFormatInr(c.pendingAmount),
		"Next EMI Date": c.emiDate || "—",
		"Account Status": c.status || "—"
	}));
	filteredLoans.map((l) => ({
		"Loan Reference": l.id || "—",
		"Customer Name": l.customer || "—",
		"Mobile Device": l.product || "—",
		"EMI Amount": l.emi || "—",
		"Deposit / Down Payment": l.deposit || "—",
		"Principal Financed": l.amount || "—",
		"Duration": l.duration || "—",
		"Monthly Interest": l.interest || "—",
		"Status": l.status || "—"
	}));
	const formattedCollections = filteredCollections.map((col) => ({
		"Collection ID": col.id || "—",
		"Customer ID": col.customerId || "—",
		"Customer Name": col.name || "—",
		"Village / Location": col.village || "—",
		"Due Amount": col.amount || "—",
		"Collection State": col.state || "—",
		"Assigned Collector": col.collector || "—",
		"Payment Mode": col.method || "—"
	}));
	const formattedPayments = filteredPayments.map((p) => ({
		"Transaction ID": p.id || "—",
		"Customer Name": p.customer || "—",
		"Customer ID": p.customerId || "—",
		"Payment Date": p.date || "—",
		"Amount Paid": p.amount || "—",
		"Remaining Balance": p.pending || "—",
		"Collected By": p.collector || "—",
		"Payment Mode": p.method || "—",
		"Status": p.status || "—",
		"Collector Remarks": p.remarks || "—"
	}));
	const formattedExpenses = filteredExpenses.map((e) => ({
		"Expense Reference": e.id || "—",
		"Expense Date": e.date || "—",
		"Category": e.cat || "—",
		"Description Details": e.desc || "—",
		"Total Spent": e.amount || "—"
	}));
	const formattedInvestments = filteredInvestments.map((i) => ({
		"Investment Reference": i.id || "—",
		"Investor Name": i.investor || "—",
		"Capital Deployed": i.amount || "—",
		"ROI Percentage": i.roi || "—",
		"Maturity Date": i.maturity || "—",
		"Account Status": i.status || "—"
	}));
	const reports = [
		{
			key: "customers",
			name: "Customer Report",
			desc: "All customer details with KYC and loan status",
			rows: formattedCustomers,
			filename: "customers"
		},
		{
			key: "single-customer",
			name: "Customer Ledger Statement",
			desc: "Select a customer to generate and export their detailed statement.",
			rows: [],
			filename: "single-customer"
		},
		{
			key: "emi",
			name: "EMI Schedule",
			desc: "Today's collection roster across all villages",
			rows: formattedCollections,
			filename: "emi-schedule"
		},
		{
			key: "collection",
			name: "Collection Report",
			desc: "All recorded payments and collectors",
			rows: formattedPayments,
			filename: "collections"
		},
		{
			key: "expense",
			name: "Expense Report",
			desc: "Categorised expenses with monthly breakdown",
			rows: formattedExpenses,
			filename: "expenses"
		},
		{
			key: "investment",
			name: "Investment Report",
			desc: "Investor portfolio, ROI and maturity tracking",
			rows: formattedInvestments,
			filename: "investments"
		}
	];
	const downloadSingleCustomerStatement = (format, customerId) => {
		const c = customers.find((cust) => cust.id === customerId);
		if (!c) {
			toast.error("Customer not found");
			return;
		}
		const custPayments = payments.filter((p) => p.customerId === customerId && p.status === "Success");
		const safeFormatInr = (val) => {
			if (val === void 0 || val === null || val === "") return "—";
			const num = typeof val === "number" ? val : Number(String(val).replace(/[^\d.-]/g, ""));
			return isNaN(num) ? String(val) : `₹${num.toLocaleString("en-IN")}`;
		};
		if (format === "Excel") downloadCustomerStatementExcel(`${c.name.replace(/\s+/g, "_")}_statement.xlsx`, c, custPayments);
		else if (format === "PDF") {
			const printWindow = window.open("", "_blank");
			if (!printWindow) {
				toast.error("Failed to open print window");
				return;
			}
			const statementHtml = `
        <html>
          <head>
            <title>${c.name} - Statement - Jain Finance</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
              body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; background: white; }
              .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 25px; }
              .header h1 { margin: 0; font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.02em; }
              .header p { margin: 4px 0 0 0; font-size: 12px; color: #64748b; }
              .meta { font-size: 11px; text-align: right; color: #64748b; line-height: 1.5; }
              
              .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; }
              .section-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; background-color: #f8fafc; }
              .section-card h2 { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #475569; margin: 0 0 12px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
              
              .row { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 6px; }
              .row span:first-child { color: #64748b; font-weight: 500; }
              .row span:last-child { color: #0f172a; font-weight: 600; }
              
              table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              th { padding: 10px; border-bottom: 2px solid #cbd5e1; text-align: left; font-size: 10px; font-weight: 600; text-transform: uppercase; color: #475569; background-color: #f1f5f9; }
              td { padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; color: #334155; }
              tr:nth-child(even) { background-color: #f8fafc; }
              
              .footer { margin-top: 50px; font-size: 10px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <h1>JAIN FINANCE</h1>
                <p>Customer Account Ledger Statement</p>
              </div>
              <div class="meta">
                <p><strong>Statement Date:</strong> ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-IN")}</p>
                <p><strong>Customer ID:</strong> ${c.id}</p>
              </div>
            </div>
            
            <div class="grid">
              <div class="section-card">
                <h2>Customer Profile</h2>
                <div class="row"><span>Full Name</span><span>${c.name}</span></div>
                <div class="row"><span>Mobile No</span><span>${c.mobile}</span></div>
                <div class="row"><span>Aadhaar Card</span><span>${c.aadhaar}</span></div>
                <div class="row"><span>Guarantor</span><span>${c.guarantyName || "—"} (${c.guarantyMobile || "—"})</span></div>
                <div class="row"><span>Village</span><span>${c.village}</span></div>
              </div>
              <div class="section-card">
                <h2>Device & Finance Details</h2>
                <div class="row"><span>Device Purchased</span><span>${c.mobileBrand} ${c.mobileModel}</span></div>
                <div class="row"><span>IMEI 1 / 2</span><span>${c.imei1} / ${c.imei2 || "—"}</span></div>
                <div class="row"><span>Selling Price</span><span>${safeFormatInr(c.price)}</span></div>
                <div class="row"><span>Down Payment</span><span>${safeFormatInr(c.deposit)}</span></div>
                <div class="row"><span>Monthly EMI</span><span>${safeFormatInr(c.perMonthEmi)}</span></div>
                <div class="row"><span>Installments</span><span>${c.paidEmis} / ${c.noOfEmi} Paid</span></div>
                <div class="row"><span>Outstanding Balance</span><span style="color: #ef4444;">${safeFormatInr(c.pendingAmount)}</span></div>
                <div class="row"><span>Status</span><span>${c.status}</span></div>
              </div>
            </div>

            <h3 style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #475569; margin: 20px 0 10px 0;">Transaction Ledger</h3>
            <table>
              <thead>
                <tr>
                  <th>Txn ID</th>
                  <th>Date</th>
                  <th>Payment Mode</th>
                  <th>Collector</th>
                  <th>Remarks</th>
                  <th style="text-align: right;">Amount Paid</th>
                </tr>
              </thead>
              <tbody>
                ${custPayments.length === 0 ? `<tr><td colspan="6" style="text-align:center; color:#94a3b8; padding: 20px;">No payments recorded yet.</td></tr>` : custPayments.map((p) => `
                    <tr>
                      <td><strong>${p.id}</strong></td>
                      <td>${p.date}</td>
                      <td>${p.method}</td>
                      <td>${p.collector}</td>
                      <td>${p.remarks || "—"}</td>
                      <td style="text-align: right; font-weight: 600; color: #16a34a;">${p.amount}</td>
                    </tr>
                  `).join("")}
              </tbody>
            </table>
            
            <div class="footer">
              Jain Finance Mobile EMI Finance System © ${(/* @__PURE__ */ new Date()).getFullYear()} · Confirmed Account Statement
            </div>
            <script>
              window.onload = function() {
                window.print();
              };
            <\/script>
          </body>
        </html>
      `;
			printWindow.document.write(statementHtml);
			printWindow.document.close();
			toast.success(`PDF statement print dialog opened for ${c.name}`);
		}
	};
	const download = (format, rows, filename, reportName) => {
		if (format === "Excel") {
			downloadExcel(`${filename}.xlsx`, reportName, rows);
			toast.success(`Excel statement downloaded: ${filename}.xlsx`);
		} else if (format === "PDF") {
			if (rows.length === 0) {
				toast.error("No data available to generate PDF");
				return;
			}
			const printWindow = window.open("", "_blank");
			if (!printWindow) {
				toast.error("Failed to open print window");
				return;
			}
			const headers = Object.keys(rows[0]);
			const tableRowsHtml = rows.map((row) => {
				return `<tr>${headers.map((h) => `<td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; text-align: left;">${row[h] !== void 0 ? String(row[h]) : "—"}</td>`).join("")}</tr>`;
			}).join("");
			const headersHtml = headers.map((h) => `<th style="padding: 12px 10px; border-bottom: 2px solid #cbd5e1; text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; color: #475569; background-color: #f8fafc;">${h}</th>`).join("");
			const reportHtml = `
        <html>
          <head>
            <title>${reportName} - Jain Finance</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
              body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; background: white; }
              .header { display: flex; justify-content: space-between; border-bottom: 2px solid #cbd5e1; padding-bottom: 20px; margin-bottom: 30px; }
              .header h1 { margin: 0; font-size: 24px; font-weight: 800; color: #0f172a; }
              .header p { margin: 4px 0 0 0; font-size: 12px; color: #64748b; }
              .meta-info { font-size: 12px; text-align: right; }
              table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              tr:nth-child(even) { background-color: #f8fafc; }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <h1>JAIN FINANCE</h1>
                <p>${reportName} Statement</p>
              </div>
              <div class="meta-info">
                <p><strong>Generated:</strong> ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-IN")} ${(/* @__PURE__ */ new Date()).toLocaleTimeString("en-IN")}</p>
                <p><strong>Format:</strong> PDF Statement</p>
              </div>
            </div>
            <table>
              <thead>
                <tr>${headersHtml}</tr>
              </thead>
              <tbody>
                ${tableRowsHtml}
              </tbody>
            </table>
            <div style="margin-top: 40px; font-size: 10px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px;">
              Jain Finance Mobile EMI Finance System © ${(/* @__PURE__ */ new Date()).getFullYear()} · Confidential Internal Report
            </div>
            <script>
              window.onload = function() {
                window.print();
              };
            <\/script>
          </body>
        </html>
      `;
			printWindow.document.write(reportHtml);
			printWindow.document.close();
			toast.success(`PDF print dialog opened for ${reportName}`);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		breadcrumb: "Reports",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-[26px] font-semibold tracking-tight",
					children: "Reports Center"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-1",
					children: "Generate and export operational reports across the business."
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
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
				children: reports.map((r) => {
					const isSingleCustomer = r.key === "single-customer";
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-5 hover:shadow-sm transition-shadow flex flex-col justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm font-semibold",
								children: r.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground mt-1.5 leading-relaxed",
								children: r.desc
							}),
							isSingleCustomer ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: selectedCustomerId,
									onValueChange: setSelectedCustomerId,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										className: "w-full h-9 rounded-md border border-border bg-background px-3 text-xs font-medium focus:outline-none cursor-pointer",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "-- Select Customer --" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: customers.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "p-2 text-xs text-muted-foreground text-center",
										children: "No customers available"
									}) : customers.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
										value: c.id,
										children: [
											c.name,
											" (",
											c.id,
											")"
										]
									}, c.id)) })]
								})
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-[11px] text-muted-foreground mt-2",
								children: [r.rows.length, " rows"]
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex gap-2 border-t border-border/40 pt-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => {
									if (isSingleCustomer) {
										if (!selectedCustomerId) {
											toast.error("Please select a customer first");
											return;
										}
										downloadSingleCustomerStatement("PDF", selectedCustomerId);
									} else download("PDF", r.rows, r.filename, r.name);
								},
								className: "flex-1 h-8 rounded-md bg-foreground text-background text-xs font-semibold inline-flex items-center justify-center gap-1.5 hover:opacity-90",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-3" }), " Generate PDF"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => {
									if (isSingleCustomer) {
										if (!selectedCustomerId) {
											toast.error("Please select a customer first");
											return;
										}
										downloadSingleCustomerStatement("Excel", selectedCustomerId);
									} else download("Excel", r.rows, r.filename, r.name);
								},
								className: "flex-1 h-8 rounded-md border border-border text-xs font-semibold inline-flex items-center justify-center gap-1.5 hover:bg-accent",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSpreadsheet, { className: "size-3" }), " Export Excel"]
							})]
						})]
					}, r.key);
				})
			})
		]
	});
}
//#endregion
export { ReportsPage as component };
