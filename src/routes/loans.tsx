import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Download, Search, Trash2, HandCoins } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Badge, Card, SectionHeader } from "@/components/ui-kit";
import { downloadExcel, useStore, parseAppDate, parseAmount, isDateInRange, type Loan } from "@/lib/store";
import { useUi } from "@/components/AppDialogs";
import { FilterBar, useDateFilter } from "@/components/FilterBar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/loans")({
  head: () => ({
    meta: [
      { title: "Loans · Jain Finance ERP" },
      { name: "description", content: "Create, track and manage standalone loans with EMI calculation and collection." },
    ],
  }),
  component: LoansPage,
});

const STATUS_FILTERS = ["All", "Active", "Overdue", "Completed", "Defaulted"] as const;
type StatusFilter = typeof STATUS_FILTERS[number];

function LoansPage() {
  const loans = useStore((s) => s.loans);
  const deleteLoan = useStore((s) => s.deleteLoan);
  const currentUser = useStore((s) => s.currentUser);
  const { openDialog } = useUi();
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [collectingLoan, setCollectingLoan] = useState<Loan | null>(null);

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

  const tone = (s: string) =>
    s === "Active" ? "success" : s === "Overdue" ? "warning" : s === "Completed" ? "neutral" : "danger";

  const filtered = loans.filter((l) => {
    if (statusFilter !== "All" && l.status !== statusFilter) return false;

    if (l.date) {
      const pDate = parseAppDate(l.date);
      if (!isDateInRange(pDate, startDate, endDate)) return false;
    }

    if (q) {
      const n = q.toLowerCase();
      return [l.id, l.customer].some((v) => String(v || "").toLowerCase().includes(n));
    }
    return true;
  });

  const outstanding = filtered
    .filter((l) => l.status === "Active" || l.status === "Overdue")
    .reduce((sum, l) => sum + parseAmount(l.amount), 0);
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {(["Active", "Overdue", "Completed", "Defaulted"] as const).map((s) => {
          const filteredByStatus = loans.filter((l) => l.status === s);
          const total = filteredByStatus.reduce((sum, l) => sum + parseAmount(l.amount), 0);
          const toneVal = s === "Active" ? "success" : s === "Overdue" ? "warning" : s === "Completed" ? "neutral" : "danger";
          const isActiveCard = statusFilter === s;
          return (
            <Card
              key={s}
              className={`p-5 cursor-pointer transition-shadow hover:shadow-sm ${
                isActiveCard ? "ring-2 ring-foreground/70 shadow-sm" : ""
              }`}
              onClick={() => setStatusFilter(isActiveCard ? "All" : s)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-muted-foreground">{s} loans</div>
                <Badge tone={toneVal}>{s}</Badge>
              </div>
              <div className="mt-1 text-2xl font-semibold tracking-tight">₹{total.toLocaleString("en-IN")}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {filteredByStatus.length} {filteredByStatus.length === 1 ? "loan" : "loans"} · principal
              </div>
              <div className="mt-2 text-[11px] font-medium text-muted-foreground/80">
                {isActiveCard ? "Filtering the list below · click to clear" : "Click to filter the list below"}
              </div>
            </Card>
          );
        })}
      </div>

      <Card>
        <div className="p-4 border-b border-border flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="size-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by loan ID, customer name…"
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
          <table className="w-full text-sm table-fixed min-w-[960px]">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="text-left font-medium px-5 py-2.5 w-[90px]">Loan</th>
                <th className="text-left font-medium py-2.5 w-[160px]">Customer</th>
                <th className="text-left font-medium py-2.5 w-[110px]">Amount</th>
                <th className="text-left font-medium py-2.5 w-[100px]">Deposit</th>
                <th className="text-left font-medium py-2.5 w-[100px]">EMI</th>
                <th className="text-left font-medium py-2.5 w-[90px]">Duration</th>
                <th className="text-left font-medium py-2.5 w-[80px]">Interest</th>
                <th className="text-left font-medium py-2.5 w-[110px]">Collected</th>
                <th className="text-left font-medium py-2.5 px-5 w-[100px]">Status</th>
                <th className="text-right font-medium px-5 py-2.5 w-[140px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={10} className="px-5 py-10 text-center text-muted-foreground text-sm">No loans match these filters.</td></tr>
              ) : filtered.map((l) => (
                <tr key={l.id} className="border-t border-border hover:bg-accent/40 cursor-pointer" onClick={() => toast.message(l.id, { description: `${l.customer} · ${l.amount} @ ${l.interest}` })}>
                  <td className="px-5 py-3 font-medium text-xs w-[90px] truncate">{l.id}</td>
                  <td className="py-3 w-[160px] truncate font-medium">{l.customer}</td>
                  <td className="py-3 font-medium w-[110px] truncate">{l.amount}</td>
                  <td className="py-3 text-muted-foreground w-[100px] truncate">{l.deposit}</td>
                  <td className="py-3 w-[100px] truncate">{l.emi}</td>
                  <td className="py-3 text-muted-foreground w-[90px] truncate">{l.duration}</td>
                  <td className="py-3 w-[80px] truncate">{l.interest}</td>
                  <td className="py-3 text-emerald-600 font-semibold w-[110px] truncate">
                    ₹{(l.collectedAmount || 0).toLocaleString("en-IN")}
                  </td>
                  <td className="px-5 py-3 w-[100px]"><Badge tone={tone(l.status)}>{l.status}</Badge></td>
                  <td className="px-5 py-3 text-right w-[140px]" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setCollectingLoan(l)}
                        className="h-7 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium inline-flex items-center gap-1 transition-colors"
                        title="Collect EMI / Payment"
                      >
                        <HandCoins className="size-3.5" /> Collect
                      </button>
                      {currentUser?.role?.toLowerCase() === "admin" && (
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
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span>Showing {filtered.length} of {loans.length} loans</span>
        </div>
      </Card>

      {collectingLoan && (
        <CollectLoanPaymentDialog loan={collectingLoan} onClose={() => setCollectingLoan(null)} />
      )}
    </AppShell>
  );
}

function CollectLoanPaymentDialog({ loan, onClose }: { loan: Loan; onClose: () => void }) {
  const collectLoanPayment = useStore((s) => s.collectLoanPayment);
  const currentUser = useStore((s) => s.currentUser);

  const totalAmountNum = parseAmount(loan.amount);
  const depositNum = parseAmount(loan.deposit);
  const emiNum = parseAmount(loan.emi);
  const durationMonths = parseInt(String(loan.duration ?? "").replace(/\D/g, ""), 10) || 0;
  const netPrincipal = Math.max(0, totalAmountNum - depositNum);
  const calculatedTotalPayable = emiNum > 0 && durationMonths > 0 ? Math.round(emiNum * durationMonths) : netPrincipal;
  const totalPayable = Math.max(netPrincipal, calculatedTotalPayable);
  const alreadyCollected = loan.collectedAmount || 0;
  const remainingBalance = Math.max(0, totalPayable - alreadyCollected);

  const defaultAmt = remainingBalance > 0 ? (emiNum > 0 && emiNum <= remainingBalance ? emiNum : remainingBalance) : 0;

  const [amt, setAmt] = useState<number | "">(defaultAmt || "");
  const [method, setMethod] = useState<"Cash" | "UPI" | "Bank" | "Cash & Bank">("Cash");
  const [collector, setCollector] = useState(currentUser?.name || "");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [remarks, setRemarks] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payAmt = Number(amt);
    if (!payAmt || payAmt <= 0) {
      toast.error("Please enter a valid collection amount");
      return;
    }

    const formattedDate = new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    collectLoanPayment({
      loanId: loan.id,
      amount: payAmt,
      method,
      collector: collector.trim() || currentUser?.name || "System",
      remarks: remarks.trim() || `Loan Collection for ${loan.id}`,
      date: formattedDate,
    });
    toast.success(`Collected ₹${payAmt.toLocaleString("en-IN")} (${method}) for Loan ${loan.id}`);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-xl border border-border shadow-2xl p-6">
        <DialogHeader className="border-b border-border pb-3">
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <HandCoins className="size-5 text-emerald-500" />
            <span>Collect Loan Payment</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Record collection for Loan {loan.id} ({loan.customer})
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          <div className="bg-muted/30 p-3 rounded-lg border border-border/60 text-xs space-y-1 font-medium">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Loan Principal:</span>
              <span className="font-bold">₹{netPrincipal.toLocaleString("en-IN")}</span>
            </div>
            {totalPayable !== netPrincipal && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Payable (incl. interest):</span>
                <span className="font-bold text-foreground">₹{totalPayable.toLocaleString("en-IN")}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Monthly EMI:</span>
              <span className="font-bold">{loan.emi}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Already Collected:</span>
              <span className="font-bold text-emerald-600">₹{alreadyCollected.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-border/50 text-sm">
              <span className="font-bold text-foreground">Remaining Balance:</span>
              <span className="font-extrabold text-amber-600">₹{remainingBalance.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Payment Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs focus:ring-2 focus:ring-ring/20 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Collector</label>
              <input
                type="text"
                value={collector}
                onChange={(e) => setCollector(e.target.value)}
                placeholder="Collector name"
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs focus:ring-2 focus:ring-ring/20 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Amount Collecting (₹)</label>
            <input
              type="number"
              min={1}
              value={amt}
              onChange={(e) => setAmt(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="e.g. 1000"
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm font-extrabold text-emerald-600 focus:ring-2 focus:ring-ring/20 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Payment Method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as any)}
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs focus:ring-2 focus:ring-ring/20 focus:outline-none"
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Bank">Bank Transfer</option>
              <option value="Cash & Bank">Cash & Bank</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Remarks (Optional)</label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. 1st EMI payment"
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs focus:ring-2 focus:ring-ring/20 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-md border border-border bg-surface text-xs font-medium hover:bg-accent"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-9 px-4 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
            >
              Save Collection
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

