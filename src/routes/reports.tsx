import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FileSpreadsheet, FileText, FileCode2, Download } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Badge, Card, SectionHeader } from "@/components/ui-kit";
import { downloadExcel, downloadCustomerStatementExcel, useStore, parseAppDate, isDateInRange, buildCollections } from "@/lib/store";
import { FilterBar, useDateFilter } from "@/components/FilterBar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports · Jain Finance ERP" },
      { name: "description", content: "Generate customer, EMI, collection, expense, investment and profit reports." },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const customers = useStore((s) => s.customers);
  const loans = useStore((s) => s.loans);
  // Derived from the (synced) customer book rather than read from the stored
  // `collections` slice — that slice has no sheet, so this report was empty on
  // any device that didn't personally register the customers. See buildCollections.
  const storeCustomers = useStore((s) => s.customers);
  const storePayments = useStore((s) => s.payments);
  const collections = buildCollections(storeCustomers, storePayments);
  const expenses = useStore((s) => s.expenses);
  const investments = useStore((s) => s.investments);
  const payments = useStore((s) => s.payments);

  const [selectedCustomerId, setSelectedCustomerId] = useState("");

  const {
    preset: filterPreset,
    setPreset: setFilterPreset,
    customStart,
    setCustomStart,
    customEnd,
    setCustomEnd,
    startDate,
    endDate,
  } = useDateFilter();

  const filteredCustomers = customers.filter((c) => {
    const cDate = parseAppDate(c.billDate);
    return isDateInRange(cDate, startDate, endDate);
  });

  const filteredLoans = loans.filter((l) => {
    if (!l.date) return true;
    const pDate = parseAppDate(l.date);
    return isDateInRange(pDate, startDate, endDate);
  });

  const custEmiMap = new Map(customers.map((c) => [c.id, c.emiDate]));
  const filteredCollections = collections.filter((col) => {
    const eDateStr = custEmiMap.get(col.customerId);
    if (!eDateStr) return true;
    const pDate = parseAppDate(eDateStr);
    return isDateInRange(pDate, startDate, endDate);
  });

  const filteredPayments = payments.filter((p) => {
    const pDate = parseAppDate(p.date);
    return isDateInRange(pDate, startDate, endDate);
  });

  const filteredExpenses = expenses.filter((e) => {
    const eDate = parseAppDate(e.date);
    return isDateInRange(eDate, startDate, endDate);
  });

  const filteredInvestments = investments.filter((i) => {
    const iDate = parseAppDate(i.maturity);
    return isDateInRange(iDate, startDate, endDate);
  });

  // Beautifully format data tables for professional report layout
  // Helper to safely format currency values even with legacy/missing data
  const safeFormatInr = (val: any) => {
    if (val === undefined || val === null || val === "") return "—";
    const num = typeof val === "number" ? val : Number(String(val).replace(/[^\d.-]/g, ""));
    return isNaN(num) ? String(val) : `₹${num.toLocaleString("en-IN")}`;
  };

  // Beautifully format data tables for professional report layout
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
    "Account Status": c.status || "—",
  }));

  const formattedLoans = filteredLoans.map((l) => ({
    "Loan Reference": l.id || "—",
    "Customer Name": l.customer || "—",
    "EMI Amount": l.emi || "—",
    "Deposit / Down Payment": l.deposit || "—",
    "Principal Financed": l.amount || "—",
    "Duration": l.duration || "—",
    "Monthly Interest": l.interest || "—",
    "Collected Amount": safeFormatInr(l.collectedAmount || 0),
    "Status": l.status || "—",
  }));

  const formattedCollections = filteredCollections.map((col) => ({
    "Collection ID": col.id || "—",
    "Customer ID": col.customerId || "—",
    "Customer Name": col.name || "—",
    "Village / Location": col.village || "—",
    "Due Amount": col.amount || "—",
    "Collection State": col.state || "—",
    "Assigned Collector": col.collector || "—",
    "Payment Mode": col.method || "—",
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
    "Collector Remarks": p.remarks || "—",
  }));

  const formattedExpenses = filteredExpenses.map((e) => ({
    "Expense Reference": e.id || "—",
    "Expense Date": e.date || "—",
    "Category": e.cat || "—",
    "Description Details": e.desc || "—",
    "Total Spent": e.amount || "—",
  }));

  const formattedInvestments = filteredInvestments.map((i) => ({
    "Investment Reference": i.id || "—",
    "Investor Name": i.investor || "—",
    "Capital Deployed": i.amount || "—",
    "ROI Percentage": i.roi || "—",
    "Maturity Date": i.maturity || "—",
    "Account Status": i.status || "—",
  }));

  const reports = [
    { key: "customers",   name: "Customer Report",   desc: "All customer details with KYC and loan status", rows: formattedCustomers,   filename: "customers" },
    { key: "single-customer", name: "Customer Ledger Statement", desc: "Select a customer to generate and export their detailed statement.", rows: [], filename: "single-customer" },
    { key: "emi",         name: "EMI Schedule",      desc: "Today's collection roster across all villages", rows: formattedCollections, filename: "emi-schedule" },
    { key: "collection",  name: "Collection Report", desc: "All recorded payments and collectors",          rows: formattedPayments,    filename: "collections" },
    { key: "expense",     name: "Expense Report",    desc: "Categorised expenses with monthly breakdown",   rows: formattedExpenses,    filename: "expenses" },
    { key: "investment",  name: "Investment Report", desc: "Investor portfolio, ROI and maturity tracking", rows: formattedInvestments, filename: "investments" },
  ];

  const downloadSingleCustomerStatement = (format: "PDF" | "Excel", customerId: string) => {
    const c = customers.find((cust) => cust.id === customerId);
    if (!c) {
      toast.error("Customer not found");
      return;
    }

    const custPayments = payments.filter((p) => p.customerId === customerId && p.status === "Success");

    const safeFormatInr = (val: any) => {
      if (val === undefined || val === null || val === "") return "—";
      const num = typeof val === "number" ? val : Number(String(val).replace(/[^\d.-]/g, ""));
      return isNaN(num) ? String(val) : `₹${num.toLocaleString("en-IN")}`;
    };

    if (format === "Excel") {
      downloadCustomerStatementExcel(`${c.name.replace(/\s+/g, "_")}_statement.xlsx`, c, custPayments);
    } else if (format === "PDF") {
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
                <p><strong>Statement Date:</strong> ${new Date().toLocaleDateString("en-IN")}</p>
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
                ${custPayments.length === 0 
                  ? `<tr><td colspan="6" style="text-align:center; color:#94a3b8; padding: 20px;">No payments recorded yet.</td></tr>`
                  : custPayments.map((p) => `
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
              Jain Finance Mobile EMI Finance System © ${new Date().getFullYear()} · Confirmed Account Statement
            </div>
            <script>
              window.onload = function() {
                window.print();
              };
            </script>
          </body>
        </html>
      `;

      printWindow.document.write(statementHtml);
      printWindow.document.close();
      toast.success(`PDF statement print dialog opened for ${c.name}`);
    }
  };

  const download = (format: "PDF" | "Excel", rows: Record<string, unknown>[], filename: string, reportName: string) => {
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
        return `<tr>${headers.map((h) => `<td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; text-align: left;">${row[h] !== undefined ? String(row[h]) : "—"}</td>`).join("")}</tr>`;
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
                <p><strong>Generated:</strong> ${new Date().toLocaleDateString("en-IN")} ${new Date().toLocaleTimeString("en-IN")}</p>
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
              Jain Finance Mobile EMI Finance System © ${new Date().getFullYear()} · Confidential Internal Report
            </div>
            <script>
              window.onload = function() {
                window.print();
              };
            </script>
          </body>
        </html>
      `;

      printWindow.document.write(reportHtml);
      printWindow.document.close();
      toast.success(`PDF print dialog opened for ${reportName}`);
    }
  };

  return (
    <AppShell breadcrumb="Reports">
      <div className="mb-6">
        <h1 className="text-[26px] font-semibold tracking-tight">Reports Center</h1>
        <p className="text-sm text-muted-foreground mt-1">Generate and export operational reports across the business.</p>
      </div>

      {/* Filter Bar */}
      <FilterBar
        preset={filterPreset}
        onChangePreset={setFilterPreset}
        customStart={customStart}
        onChangeStart={setCustomStart}
        customEnd={customEnd}
        onChangeEnd={setCustomEnd}
        startDate={startDate}
        endDate={endDate}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((r) => {
          const isSingleCustomer = r.key === "single-customer";
          return (
            <Card key={r.key} className="p-5 hover:shadow-sm transition-shadow flex flex-col justify-between">
              <div>
                <div className="text-sm font-semibold">{r.name}</div>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{r.desc}</p>
                {isSingleCustomer ? (
                  <div className="mt-3">
                    <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                      <SelectTrigger className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs font-medium focus:outline-none cursor-pointer">
                        <SelectValue placeholder="-- Select Customer --" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.length === 0 ? (
                          <div className="p-2 text-xs text-muted-foreground text-center">No customers available</div>
                        ) : (
                          customers.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name} ({c.id})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="text-[11px] text-muted-foreground mt-2">{r.rows.length} rows</div>
                )}
              </div>
              <div className="mt-4 flex gap-2 border-t border-border/40 pt-3">
                <button
                  onClick={() => {
                    if (isSingleCustomer) {
                      if (!selectedCustomerId) {
                        toast.error("Please select a customer first");
                        return;
                      }
                      downloadSingleCustomerStatement("PDF", selectedCustomerId);
                    } else {
                      download("PDF", r.rows, r.filename, r.name);
                    }
                  }}
                  className="flex-1 h-8 rounded-md bg-foreground text-background text-xs font-semibold inline-flex items-center justify-center gap-1.5 hover:opacity-90"
                >
                  <FileText className="size-3" /> Generate PDF
                </button>
                <button
                  onClick={() => {
                    if (isSingleCustomer) {
                      if (!selectedCustomerId) {
                        toast.error("Please select a customer first");
                        return;
                      }
                      downloadSingleCustomerStatement("Excel", selectedCustomerId);
                    } else {
                      download("Excel", r.rows, r.filename, r.name);
                    }
                  }}
                  className="flex-1 h-8 rounded-md border border-border text-xs font-semibold inline-flex items-center justify-center gap-1.5 hover:bg-accent"
                >
                  <FileSpreadsheet className="size-3" /> Export Excel
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
