import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MessageCircle, Download, Search, AlertTriangle, FileText } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Badge, Card, SectionHeader, StatCard } from "@/components/ui-kit";
import { downloadExcel, useStore, parseAppDate, isDateInRange } from "@/lib/store";
import { useUi } from "@/components/AppDialogs";
import { FilterBar, useDateFilter } from "@/components/FilterBar";
import { MultiSelect } from "@/components/ui/multi-select";

/** Escape HTML special chars to prevent XSS when inserting user data into innerHTML */
function escapeHtml(str: unknown): string {
  if (str === undefined || str === null || str === "") return "—";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const generateDueListPdf = (list: any[]) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    toast.error("Failed to open print window");
    return;
  }

  const safeFormatInr = (val: any) => {
    if (val === undefined || val === null || val === "") return "—";
    const num = typeof val === "number" ? val : Number(String(val).replace(/[^\d.-]/g, ""));
    return isNaN(num) ? String(val) : `₹${num.toLocaleString("en-IN")}`;
  };

  const rowsHtml = list.map((c, i) => `
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 8px 10px; text-align: center;">${i + 1}</td>
      <td style="padding: 8px 10px;">${escapeHtml(c.emiDate)}</td>
      <td style="padding: 8px 10px;"><strong>${escapeHtml(c.name)}</strong></td>
      <td style="padding: 8px 10px;">${escapeHtml(c.fatherName)}</td>
      <td style="padding: 8px 10px;">${escapeHtml(c.village)}</td>
      <td style="padding: 8px 10px;">${escapeHtml(c.mobile)}</td>
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
            <p><strong>Report Date:</strong> ${new Date().toLocaleDateString("en-IN")}</p>
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

export const Route = createFileRoute("/collections")({
  head: () => ({
    meta: [
      { title: "Due List · Jain Finance ERP" },
      { name: "description", content: "Pending EMI due list — customers with outstanding instalments." },
    ],
  }),
  component: DueListPage,
});

function DueListPage() {
  const customers = useStore((s) => s.customers);
  const recordPayment = useStore((s) => s.recordPayment);
  const sendWhatsapp = useStore((s) => s.sendWhatsapp);
  const { openDialog } = useUi();

  const [q, setQ] = useState("");
  const [villageFilter, setVillageFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [pendingEmiFilter, setPendingEmiFilter] = useState<string[]>([]);

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

  // Only customers with pending EMIs
  const pending = customers.filter((c) => c.pendingEmis > 0);

  const villages = Array.from(new Set(pending.map((c) => c.village)));
  const pendingEmiCounts = Array.from({ length: 24 }, (_, i) => i + 1);

  const filtered = pending.filter((c) => {
    if (villageFilter.length > 0 && !villageFilter.includes(c.village)) return false;
    if (statusFilter.length > 0 && !statusFilter.includes(c.status)) return false;
    if (pendingEmiFilter.length > 0 && !pendingEmiFilter.includes(String(c.missedEmis ?? 0))) return false;
    const cDate = parseAppDate(c.emiDate);
    if (!isDateInRange(cDate, startDate, endDate)) return false;
    if (q) {
      const n = q.toLowerCase();
      return [c.name, c.id, c.mobile, c.village, c.mobileModel].some((v) =>
        String(v ?? "").toLowerCase().includes(n)
      );
    }
    return true;
  });

  // Sort by mobile number sequentially
  const sortedFiltered = [...filtered].sort((a, b) => {
    const aMobile = String(a.mobile ?? "").replace(/[^\d]/g, "");
    const bMobile = String(b.mobile ?? "").replace(/[^\d]/g, "");
    return aMobile.localeCompare(bMobile);
  });

  const totalPending = sortedFiltered.reduce((s, c) => s + c.pendingAmount, 0);
  const overdue = sortedFiltered.filter((c) => c.status === "Overdue" || c.status === "Defaulted").length;
  const overdueAmt = sortedFiltered.filter((c) => c.status === "Overdue" || c.status === "Defaulted")
    .reduce((s, c) => s + c.pendingAmount, 0);

  const tone = (s: string) =>
    s === "Active" ? "success" : s === "Overdue" ? "warning" : s === "Defaulted" ? "danger" : "neutral";

  return (
    <AppShell breadcrumb="Due List">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight">EMI Due List</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {sortedFiltered.length} customers with pending EMIs · ₹{totalPending.toLocaleString("en-IN")} outstanding
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              downloadExcel("due-list.xlsx", "Due List", sortedFiltered.map((c) => ({
                ID: c.id, Name: c.name, Father: c.fatherName, Mobile: c.mobile, Village: c.village,
                "Mobile Model": c.mobileModel, "Deposit Amount": c.deposit, "Finance Amount": c.price, "Monthly EMI": c.perMonthEmi,
                "EMI Date": c.emiDate, "Last Payment": c.lastPaymentDate,
                "Pending EMIs": c.pendingEmis, "Outstanding Amount": c.pendingAmount, Status: c.status,
              })));
              toast.success(`Exported ${sortedFiltered.length} records`);
            }}
            className="h-9 px-3 rounded-md border border-border bg-surface text-sm inline-flex items-center gap-1.5 hover:bg-accent font-semibold transition-colors shadow-sm"
          >
            <Download className="size-3.5" /> Export
          </button>
          <button
            onClick={() => {
              generateDueListPdf(sortedFiltered);
            }}
            className="h-9 px-3 rounded-md border border-border bg-surface text-sm inline-flex items-center gap-1.5 hover:bg-accent font-semibold transition-colors shadow-sm"
          >
            <FileText className="size-3.5" /> Print PDF
          </button>
          <button
            onClick={() => {
              sortedFiltered.forEach((c) => sendWhatsapp({ to: c.mobile, kind: "EMI Due Reminder" }));
              toast.success(`Reminders sent to ${sortedFiltered.length} customers`);
            }}
            className="h-9 px-4 rounded-md bg-foreground text-background text-sm font-semibold inline-flex items-center gap-1.5 hover:opacity-90 shadow transition-opacity"
          >
            <MessageCircle className="size-3.5" /> Send Reminders
          </button>
        </div>
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

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Pending" value={`₹${Math.round(totalPending / 1000)}K`} sub={`${sortedFiltered.length} customers`} trend="warn" />
        <StatCard label="Overdue / Defaulted" value={overdue.toString()} sub={`₹${overdueAmt.toLocaleString("en-IN")}`} trend={overdue > 0 ? "down" : undefined} />
        <StatCard label="Active Pending" value={sortedFiltered.filter((c) => c.status === "Active").length.toString()} sub="Next due soon" />
        <StatCard label="Avg Pending" value={`₹${sortedFiltered.length ? Math.round(totalPending / sortedFiltered.length).toLocaleString("en-IN") : "0"}`} sub="Per customer" />
      </div>

      {/* Overdue banner */}
      {overdue > 0 && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-danger/30 bg-danger/5 px-4 py-3">
          <AlertTriangle className="size-4 text-danger shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-semibold text-danger">{overdue} customers are overdue or defaulted.</span>
            <span className="text-muted-foreground ml-1.5">Total exposure: ₹{overdueAmt.toLocaleString("en-IN")}. Send WhatsApp reminders or escalate.</span>
          </div>
        </div>
      )}

      <Card>
        <div className="p-4 border-b border-border flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="size-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, ID, mobile, village, model…"
              className="h-9 w-full rounded-md border border-border bg-background pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
          </div>
          <MultiSelect
            title="Villages"
            options={villages.map((v) => ({ label: v, value: v }))}
            selected={villageFilter}
            onChange={setVillageFilter}
            placeholder="All villages"
          />
          <MultiSelect
            title="Statuses"
            options={[
              { label: "Active", value: "Active" },
              { label: "Overdue", value: "Overdue" },
              { label: "Defaulted", value: "Defaulted" },
            ]}
            selected={statusFilter}
            onChange={setStatusFilter}
            placeholder="All Status"
          />
          <MultiSelect
            title="Missed Counts"
            options={pendingEmiCounts.map((count) => ({ label: `${count} Missed`, value: count.toString() }))}
            selected={pendingEmiFilter}
            onChange={setPendingEmiFilter}
            placeholder="All Missed"
          />
          {(q || villageFilter.length > 0 || statusFilter.length > 0 || pendingEmiFilter.length > 0) && (
            <button onClick={() => { setQ(""); setVillageFilter([]); setStatusFilter([]); setPendingEmiFilter([]); }}
              className="h-9 px-3 rounded-md border border-border text-sm text-muted-foreground hover:bg-accent cursor-pointer">
              Clear
            </button>
          )}
        </div>

        {/* Total bar */}
        {sortedFiltered.length > 0 && (
          <div className="px-5 py-2.5 border-b border-border bg-warning/5 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{sortedFiltered.length} customers</span>
            <span className="font-semibold text-warning">Total Pending: ₹{sortedFiltered.reduce((s, c) => s + c.pendingAmount, 0).toLocaleString("en-IN")}</span>
          </div>
        )}

        <SectionHeader title="Due List" action={<span className="text-xs text-muted-foreground">{sortedFiltered.length} records</span>} />

        <div className="overflow-x-auto">
          <table className="w-full text-sm table-fixed min-w-[1520px]">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="text-left font-medium px-5 py-2.5 w-[80px]">ID</th>
                <th className="text-left font-medium px-4 py-2.5 w-[150px]">Customer Name</th>
                <th className="text-left font-medium px-4 py-2.5 w-[120px]">Father's Name</th>
                <th className="text-left font-medium px-4 py-2.5 w-[110px]">Mobile No</th>
                <th className="text-left font-medium px-4 py-2.5 w-[100px]">Village Name</th>
                <th className="text-right font-medium px-4 py-2.5 w-[90px]">Deposit Amount</th>
                <th className="text-right font-medium px-4 py-2.5 w-[90px]">Finance Amount</th>
                <th className="text-right font-medium px-4 py-2.5 w-[90px]">Total EMI Amt</th>
                <th className="text-right font-medium px-4 py-2.5 w-[90px]">Monthly EMI</th>
                <th className="text-center font-medium px-4 py-2.5 w-[70px]">No of EMI</th>
                <th className="text-left font-medium px-4 py-2.5 w-[100px]">EMI Date</th>
                <th className="text-left font-medium px-4 py-2.5 w-[100px]">Last Payment</th>
                <th className="text-right font-medium px-4 py-2.5 w-[100px]">Outstanding Amount</th>
                <th className="text-left font-medium px-4 py-2.5 w-[110px]">Status</th>
                <th className="text-right font-medium px-5 py-2.5 w-[120px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedFiltered.length === 0 ? (
                <tr>
                  <td colSpan={15} className="px-5 py-12 text-center text-muted-foreground">
                    No pending EMIs match the current filters. 🎉
                  </td>
                </tr>
              ) : sortedFiltered.map((c) => (
                <tr key={c.id} className="border-t border-border hover:bg-accent/30">
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground w-[80px] truncate">{c.id}</td>
                  <td className="px-4 py-3 w-[150px]">
                    <div className="font-medium truncate">{c.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{c.mobileBrand} {c.mobileModel}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs w-[120px] truncate">{c.fatherName || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground w-[110px] truncate">{c.mobile}</td>
                  <td className="px-4 py-3 text-muted-foreground w-[100px] truncate">{c.village}</td>
                  <td className="px-4 py-3 text-right font-medium text-muted-foreground w-[90px] truncate">₹{c.deposit.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-right font-semibold text-foreground w-[90px] truncate">₹{c.price.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-right font-medium text-muted-foreground w-[90px] truncate">₹{c.totalEmiAmount.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-right font-semibold w-[90px] truncate">₹{c.perMonthEmi.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-center w-[70px]">
                    <span className="text-xs">{c.paidEmis}/{c.noOfEmi}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs w-[100px] truncate">{c.emiDate}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs w-[100px] truncate">{c.lastPaymentDate}</td>
                  <td className="px-4 py-3 text-right font-semibold text-warning w-[100px] truncate">₹{c.pendingAmount.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 w-[110px]">
                    <Badge tone={tone(c.status)}>{c.status}</Badge>
                    {c.missedEmis !== undefined && c.missedEmis > 0 && (
                      <div className="text-[10px] text-danger font-semibold mt-0.5 whitespace-nowrap">
                        {c.missedEmis} missed
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right w-[120px]">
                    <div className="inline-flex gap-1">
                      <button
                        title="Collect EMI"
                        onClick={() => openDialog("collect", { customerId: c.id })}
                        className="h-7 px-2.5 rounded-md bg-success/10 text-success border border-success/20 text-xs font-medium hover:bg-success/20 transition-colors"
                      >
                        Collect
                      </button>
                      <button
                        title="WhatsApp"
                        onClick={() => { sendWhatsapp({ to: c.mobile, kind: "EMI Reminder" }); toast.success(`Reminder sent to ${c.name}`); }}
                        className="size-7 rounded-md border border-border grid place-items-center hover:bg-accent"
                      >
                        <MessageCircle className="size-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
