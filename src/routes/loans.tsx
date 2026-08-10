import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Download, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Badge, Card, SectionHeader } from "@/components/ui-kit";
import { downloadExcel, useStore, parseAppDate, isDateInRange } from "@/lib/store";
import { useUi } from "@/components/AppDialogs";
import { FilterBar, useDateFilter } from "@/components/FilterBar";

export const Route = createFileRoute("/loans")({
  head: () => ({
    meta: [
      { title: "Loans · Jain Finance ERP" },
      { name: "description", content: "Create, track and manage customer loans with auto EMI calculation." },
    ],
  }),
  component: LoansPage,
});

const STATUS_FILTERS = ["All", "Active", "Overdue", "Completed", "Defaulted"] as const;
type StatusFilter = typeof STATUS_FILTERS[number];

function LoansPage() {
  const loans = useStore((s) => s.loans);
  const customers = useStore((s) => s.customers);
  const deleteLoan = useStore((s) => s.deleteLoan);
  const currentUser = useStore((s) => s.currentUser);
  const { openDialog } = useUi();
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");

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

  const custMap = new Map(customers.map((c) => [c.name, c.billDate]));

  const tone = (s: string) =>
    s === "Active" ? "success" : s === "Overdue" ? "warning" : s === "Defaulted" ? "danger" : "neutral";

  const filtered = loans.filter((l) => {
    if (statusFilter !== "All" && l.status !== statusFilter) return false;

    // Filter by customer bill date
    const bDateStr = custMap.get(l.customer);
    if (bDateStr) {
      const pDate = parseAppDate(bDateStr);
      if (!isDateInRange(pDate, startDate, endDate)) return false;
    }

    if (q) {
      const n = q.toLowerCase();
      return [l.id, l.customer, l.product].some((v) => v.toLowerCase().includes(n));
    }
    return true;
  });

  const outstanding = filtered
    .filter((l) => l.status === "Active" || l.status === "Overdue")
    .reduce((sum, l) => sum + Number(l.amount.replace(/[^\d]/g, "")), 0);
  const active = filtered.filter((l) => l.status === "Active").length;

  return (
    <AppShell breadcrumb="Loans">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight">Loan Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {active} active loans · ₹{outstanding.toLocaleString("en-IN")} outstanding
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { downloadExcel("loans.xlsx", "Loans", filtered); toast.success(`Exported ${filtered.length} loans`); }}
            className="h-9 px-3 rounded-md border border-border bg-surface text-sm inline-flex items-center gap-1.5 hover:bg-accent"
          >
            <Download className="size-3.5" /> Export
          </button>
          <button
            onClick={() => openDialog("loan")}
            className="h-9 px-3 rounded-md bg-foreground text-background text-sm font-medium inline-flex items-center gap-1.5"
          >
            <Plus className="size-3.5" /> New Loan
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

      <Card>
        <div className="p-4 border-b border-border flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="size-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by loan ID, customer, product…"
              className="h-9 w-full rounded-md border border-border bg-background pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
          </div>
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`h-9 px-3 rounded-md border text-sm transition-colors ${
                statusFilter === f ? "bg-foreground text-background border-foreground" : "border-border bg-surface hover:bg-accent"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <SectionHeader title={`${filtered.length} loan${filtered.length !== 1 ? "s" : ""}`} action={<span className="text-xs text-muted-foreground">Updated just now</span>} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-fixed min-w-[1020px]">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="text-left font-medium px-5 py-2.5 w-[100px]">Loan</th>
                <th className="text-left font-medium py-2.5 w-[160px]">Customer</th>
                <th className="text-left font-medium py-2.5 w-[160px]">Product</th>
                <th className="text-left font-medium py-2.5 w-[110px]">Amount</th>
                <th className="text-left font-medium py-2.5 w-[110px]">Deposit</th>
                <th className="text-left font-medium py-2.5 w-[110px]">EMI</th>
                <th className="text-left font-medium py-2.5 w-[90px]">Duration</th>
                <th className="text-left font-medium py-2.5 w-[90px]">Interest</th>
                <th className="text-left font-medium py-2.5 px-5 w-[110px]">Status</th>
                {currentUser?.role.toLowerCase() === "admin" && (
                  <th className="text-right font-medium px-5 py-2.5 w-[80px]">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={currentUser?.role.toLowerCase() === "admin" ? 10 : 9} className="px-5 py-10 text-center text-muted-foreground text-sm">No loans match these filters.</td></tr>
              ) : filtered.map((l) => (
                <tr key={l.id} className="border-t border-border hover:bg-accent/40 cursor-pointer" onClick={() => toast.message(l.id, { description: `${l.customer} · ${l.product} · ${l.amount} @ ${l.interest}` })}>
                  <td className="px-5 py-3 font-medium text-xs w-[100px] truncate">{l.id}</td>
                  <td className="py-3 w-[160px] truncate">{l.customer}</td>
                  <td className="py-3 text-muted-foreground w-[160px] truncate">{l.product}</td>
                  <td className="py-3 font-medium w-[110px] truncate">{l.amount}</td>
                  <td className="py-3 text-muted-foreground w-[110px] truncate">{l.deposit}</td>
                  <td className="py-3 w-[110px] truncate">{l.emi}</td>
                  <td className="py-3 text-muted-foreground w-[90px] truncate">{l.duration}</td>
                  <td className="py-3 w-[90px] truncate">{l.interest}</td>
                  <td className="px-5 py-3 w-[110px]"><Badge tone={tone(l.status)}>{l.status}</Badge></td>
                  {currentUser?.role.toLowerCase() === "admin" && (
                    <td className="px-5 py-3 text-right w-[80px]" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete loan ${l.id} for ${l.customer}?`)) {
                            deleteLoan(l.id);
                            toast.success(`Deleted loan ${l.id}`);
                          }
                        }}
                        className="size-7 rounded border border-border inline-flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors text-muted-foreground"
                        title="Delete Loan"
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
        <div className="px-5 py-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span>Showing {filtered.length} of {loans.length} loans</span>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        {(["Active", "Overdue", "Completed", "Defaulted"] as const).map((s) => {
          const filteredByStatus = loans.filter((l) => l.status === s);
          const total = filteredByStatus.reduce((sum, l) => sum + Number(l.amount.replace(/[^\d]/g, "")), 0);
          const toneVal = s === "Active" ? "success" : s === "Overdue" ? "warning" : s === "Defaulted" ? "danger" : "neutral";
          return (
            <Card key={s} className="p-5 cursor-pointer hover:shadow-sm transition-shadow" onClick={() => setStatusFilter(s)}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-muted-foreground">{s} loans</div>
                <Badge tone={toneVal}>{s}</Badge>
              </div>
              <div className="mt-1 text-2xl font-semibold tracking-tight">{filteredByStatus.length}</div>
              <div className="mt-1 text-xs text-muted-foreground">₹{total.toLocaleString("en-IN")} principal</div>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
