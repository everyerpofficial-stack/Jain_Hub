import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Printer, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Badge, Card, StatCard } from "@/components/ui-kit";
import { downloadExcel, useStore, parseAppDate, isDateInRange } from "@/lib/store";
import { FilterBar, useDateFilter } from "@/components/FilterBar";

export const Route = createFileRoute("/payments")({
  head: () => ({
    meta: [
      { title: "Payments · Jain Finance ERP" },
      { name: "description", content: "Complete payment history across all customers, collectors and methods." },
    ],
  }),
  component: PaymentsPage,
});

function PaymentsPage() {
  const payments = useStore((s) => s.payments);
  const deletePayment = useStore((s) => s.deletePayment);
  const currentUser = useStore((s) => s.currentUser);
  const [q, setQ] = useState("");
  const [method, setMethod] = useState("All methods");
  const [collector, setCollector] = useState("All collectors");
  const [status, setStatus] = useState("All status");

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

  const collectors = ["All collectors", ...Array.from(new Set(payments.map((p) => p.collector)))];

  const filtered = payments.filter((p) => {
    if (method !== "All methods" && p.method !== method) return false;
    if (collector !== "All collectors" && p.collector !== collector) return false;
    if (status !== "All status" && p.status !== status) return false;
    const pDate = parseAppDate(p.date);
    if (!isDateInRange(pDate, startDate, endDate)) return false;
    if (q) {
      const needle = q.toLowerCase();
      return [p.id, p.customer, p.collector].some((v) => v.toLowerCase().includes(needle));
    }
    return true;
  });

  const totalCollected = payments
    .filter((p) => p.status === "Success")
    .reduce((sum, p) => sum + Number(p.amount.replace(/[^\d]/g, "")), 0);

  const filteredTotal = filtered
    .filter((p) => p.status === "Success")
    .reduce((sum, p) => sum + Number(p.amount.replace(/[^\d]/g, "")), 0);

  const byMethod = ["Cash", "UPI"].map((m) => ({
    method: m,
    count: filtered.filter((p) => p.method === m && p.status === "Success").length,
    amount: filtered.filter((p) => p.method === m && p.status === "Success")
      .reduce((s, p) => s + Number(p.amount.replace(/[^\d]/g, "")), 0),
  }));

  return (
    <AppShell breadcrumb="Payments">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight">Payment History</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filtered.length} payments · ₹{filteredTotal.toLocaleString("en-IN")} collected
          </p>
        </div>
        <div className="flex gap-2 print:hidden">
          <button
            onClick={() => { window.print(); toast.success("Print dialog opened"); }}
            className="h-9 px-3.5 rounded-md border border-border bg-surface text-sm inline-flex items-center gap-1.5 hover:bg-accent font-semibold transition-colors shadow-sm"
          >
            <Printer className="size-3.5" /> Print
          </button>
          <button
            onClick={() => { downloadExcel("payments.xlsx", "Payments", filtered); toast.success(`Exported ${filtered.length} payments`); }}
            className="h-9 px-4 rounded-md bg-foreground text-background text-sm font-semibold inline-flex items-center gap-1.5 hover:opacity-90 shadow transition-opacity"
          >
            <Download className="size-3.5" /> Export Excel
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="print:hidden">
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
      </div>

      {/* Quick stats by method */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 print:hidden">
        {byMethod.map((b) => (
          <StatCard
            key={b.method}
            label={`${b.method} payments`}
            value={`₹${b.amount.toLocaleString("en-IN")}`}
            sub={`${b.count} transactions`}
          />
        ))}
      </div>

      <Card>
        <div className="p-4 border-b border-border flex flex-wrap items-center gap-2 print:hidden">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="size-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by customer, txn id, collector…"
              className="h-9 w-full rounded-md border border-border bg-background pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
          </div>
          <select value={method} onChange={(e) => setMethod(e.target.value)} className="h-9 rounded-md border border-border bg-surface px-3 text-sm">
            <option>All methods</option><option>Cash</option><option>UPI</option>
          </select>
          <select value={collector} onChange={(e) => setCollector(e.target.value)} className="h-9 rounded-md border border-border bg-surface px-3 text-sm">
            {collectors.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-9 rounded-md border border-border bg-surface px-3 text-sm">
            <option>All status</option><option>Success</option><option>Refunded</option>
          </select>
          {(q || method !== "All methods" || collector !== "All collectors" || status !== "All status") && (
            <button
              onClick={() => { setQ(""); setMethod("All methods"); setCollector("All collectors"); setStatus("All status"); }}
              className="h-9 px-3 rounded-md border border-border text-sm text-muted-foreground hover:bg-accent"
            >
              Clear filters
            </button>
          )}
        </div>

        {filtered.length > 0 && (
          <div className="px-5 py-2.5 border-b border-border flex items-center justify-between text-xs text-muted-foreground bg-muted/30 print:hidden">
            <span>{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
            <span className="font-medium text-foreground">₹{filteredTotal.toLocaleString("en-IN")} total</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm table-fixed min-w-[1000px]">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="text-left font-medium px-5 py-2.5 w-[100px]">Txn</th>
                <th className="text-left font-medium px-4 py-2.5 w-[200px]">Customer</th>
                <th className="text-left font-medium px-4 py-2.5 w-[130px]">Date</th>
                <th className="text-left font-medium px-4 py-2.5 w-[110px]">Method</th>
                <th className="text-left font-medium px-4 py-2.5 w-[130px]">Collector</th>
                <th className="text-right font-medium px-4 py-2.5 w-[120px]">Amount paid</th>
                <th className="text-right font-medium px-4 py-2.5 w-[120px]">Pending</th>
                <th className="text-left font-medium px-5 py-2.5 w-[110px]">Status</th>
                {currentUser?.role.toLowerCase() === "admin" && (
                  <th className="text-right font-medium px-5 py-2.5 w-[80px] print:hidden">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={currentUser?.role.toLowerCase() === "admin" ? 9 : 8} className="px-5 py-10 text-center text-muted-foreground">No payments match.</td></tr>
              ) : filtered.map((p) => (
                <tr key={p.id} className="border-t border-border hover:bg-accent/40">
                  <td className="px-5 py-3 font-medium text-xs w-[100px] truncate">{p.id}</td>
                  <td className="px-4 py-3 w-[200px] truncate">{p.customer}</td>
                  <td className="px-4 py-3 text-muted-foreground w-[130px] truncate">{p.date}</td>
                  <td className="px-4 py-3 w-[110px] truncate">{p.method}</td>
                  <td className="px-4 py-3 text-muted-foreground w-[130px] truncate">{p.collector}</td>
                  <td className="px-4 py-3 text-right font-medium w-[120px] truncate">{p.amount}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground w-[120px] truncate">{p.pending}</td>
                  <td className="px-5 py-3 w-[110px]"><Badge tone={p.status === "Success" ? "success" : "danger"}>{p.status}</Badge></td>
                  {currentUser?.role.toLowerCase() === "admin" && (
                    <td className="px-5 py-3 text-right w-[80px] print:hidden">
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete payment ${p.id} of ${p.amount} from ${p.customer}? This will revert the payment EMI count for this customer.`)) {
                            deletePayment(p.id);
                            toast.success(`Deleted payment ${p.id}`);
                          }
                        }}
                        className="size-7 rounded border border-border inline-flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors text-muted-foreground"
                        title="Delete Payment"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
