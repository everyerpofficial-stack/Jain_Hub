import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2, Download, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Badge, Card, ProgressBar, SectionHeader, StatCard } from "@/components/ui-kit";
import { useMobileStore } from "@/lib/mobileStore";
import { parseAppDate, isDateInRange, downloadExcel, downloadLedgerPDF } from "@/lib/store";
import { FilterBar, useDateFilter } from "@/components/FilterBar";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter, DialogHeader } from "@/components/ui/dialog";

export const Route = createFileRoute("/mobiles/expenses")({
  head: () => ({
    meta: [
      { title: "Income & Expenses · Jain Mobiles ERP" },
      { name: "description", content: "Track store expenses and cash inflow for Jain Mobiles." },
    ],
  }),
  component: MobilesExpensesPage,
});

function ExpenseFormDialog({ onClose }: { onClose: () => void }) {
  const addExpense = useMobileStore((s) => s.addExpense);
  const [type, setType] = useState<"Expense" | "Income">("Expense");
  
  const EXPENSE_CATEGORIES = ["Shop Rent", "Electricity", "Salary", "Tea & Snacks", "Utilities", "Marketing", "Other Expense"];
  const INCOME_CATEGORIES = ["Accessories Income", "Repair Income", "Device Sales Income", "Other Income"];

  const getTodayYmd = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [cat, setCat] = useState("Shop Rent");
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState<"Cash" | "UPI" | "Cash & UPI">("Cash");
  const [cashAmount, setCashAmount] = useState<number | "">("");
  const [bankAmount, setBankAmount] = useState<number | "">("");
  const [date, setDate] = useState(getTodayYmd());

  // Reset category when entry type changes
  useEffect(() => {
    setCat(type === "Expense" ? "Shop Rent" : "Accessories Income");
  }, [type]);

  const canSubmit = cat && amount && desc.trim() && date;

  const handleAmountChange = (valStr: string) => {
    setAmount(valStr);
    const total = Number(valStr) || 0;
    if (paymentMode === "Cash & UPI") {
      const half = Math.floor(total / 2);
      setCashAmount(half);
      setBankAmount(total - half);
    }
  };

  const handleModeChange = (mode: "Cash" | "UPI" | "Cash & UPI") => {
    setPaymentMode(mode);
    const total = Number(amount) || 0;
    if (mode === "Cash & UPI") {
      const half = Math.floor(total / 2);
      setCashAmount(half);
      setBankAmount(total - half);
    }
  };

  const handleSave = () => {
    const amt = Number(amount) || 0;
    if (paymentMode === "Cash & UPI") {
      const c = Number(cashAmount) || 0;
      const b = Number(bankAmount) || 0;
      if (c + b !== amt) {
        toast.error(`Cash (₹${c}) + UPI (₹${b}) must equal Total Amount (₹${amt})`);
        return;
      }
    }

    addExpense({
      cat,
      desc: paymentMode === "Cash & UPI" ? `${desc.trim()} [Cash: ₹${cashAmount} | UPI: ₹${bankAmount}]` : desc.trim(),
      amount: amount,
      type,
      paymentMode,
      date
    });
    toast.success(`${type} entry recorded successfully (${paymentMode})`);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm rounded-xl border border-border shadow-2xl p-6">
        <DialogHeader className="border-b border-border pb-3">
          <DialogTitle className="text-base font-bold">
            Add Income / Expense Entry
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Record a cash/UPI transaction against the mobile shop.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3.5 text-sm">
          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">Entry Date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">Entry Type</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "Expense" | "Income")}
              className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
            >
              <option value="Expense">Expense</option>
              <option value="Income">Income</option>
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">Category</span>
            <select
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
            >
              {(type === "Expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">Payment Mode</span>
            <select
              value={paymentMode}
              onChange={(e) => handleModeChange(e.target.value as "Cash" | "UPI" | "Cash & UPI")}
              className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none font-semibold"
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Cash & UPI">Cash and UPI</option>
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">Amount (₹)</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="1000"
              className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
            />
          </label>

          {paymentMode === "Cash & UPI" && (
            <div className="grid grid-cols-2 gap-3 bg-muted/20 p-3 rounded-lg border border-border/50 animate-in fade-in duration-200">
              <label className="block">
                <span className="text-xs font-semibold text-muted-foreground">Cash Portion (₹)</span>
                <input
                  type="number"
                  value={cashAmount}
                  onChange={(e) => {
                    const c = Number(e.target.value) || 0;
                    setCashAmount(c);
                    const total = Number(amount) || 0;
                    setBankAmount(Math.max(0, total - c));
                  }}
                  className="mt-1 h-8 w-full rounded-md border border-border bg-surface px-2.5 text-xs focus:outline-none font-semibold"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-muted-foreground">UPI Portion (₹)</span>
                <input
                  type="number"
                  value={bankAmount}
                  onChange={(e) => {
                    const b = Number(e.target.value) || 0;
                    setBankAmount(b);
                    const total = Number(amount) || 0;
                    setCashAmount(Math.max(0, total - b));
                  }}
                  className="mt-1 h-8 w-full rounded-md border border-border bg-surface px-2.5 text-xs focus:outline-none font-semibold"
                />
              </label>
            </div>
          )}

          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">Description</span>
            <input
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="e.g. Shop assistant boy tea bill, counter accessories sale..."
              className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
            />
          </label>
        </div>

        <DialogFooter className="border-t border-border pt-4 flex gap-2">
          <button
            onClick={onClose}
            className="h-9 px-3.5 rounded-md border border-border bg-surface text-sm hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!canSubmit}
            onClick={handleSave}
            className="h-9 px-4 rounded-md bg-foreground text-background text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all ml-auto"
          >
            Save Entry
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const CATEGORY_COLORS: Record<string, string> = {
  // Expenses
  "Shop Rent": "var(--danger)",
  "Electricity": "var(--info)",
  "Salary": "var(--foreground)",
  "Tea & Snacks": "var(--warning)",
  "Utilities": "var(--success)",
  // Income
  "Accessories Income": "var(--success)",
  "Repair Income": "var(--info)",
};

function MobilesExpensesPage() {
  const expenses = useMobileStore((s) => s.expenses) || [];
  const deleteExpense = useMobileStore((s) => s.deleteExpense);
  const [showAddDialog, setShowAddDialog] = useState(false);

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

  const filteredEntries = (expenses || []).filter((e) => {
    if (!e) return false;
    const eDate = parseAppDate(e.date);
    return isDateInRange(eDate, startDate, endDate);
  });

  const isIncome = (e: any) => e.type === "Income";

  // Period sums
  const totalIncome = filteredEntries.filter(isIncome).reduce((sum, e) => sum + Number(e.amount.replace(/[^\d]/g, "")), 0);
  const totalExpenses = filteredEntries.filter(e => !isIncome(e)).reduce((sum, e) => sum + Number(e.amount.replace(/[^\d]/g, "")), 0);
  const netBalance = totalIncome - totalExpenses;

  // Breakdown by category
  const incomeByCat = Object.entries(
    filteredEntries.filter(isIncome).reduce<Record<string, number>>((acc, e) => {
      acc[e.cat] = (acc[e.cat] || 0) + Number(e.amount.replace(/[^\d]/g, ""));
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);

  const expenseByCat = Object.entries(
    filteredEntries.filter(e => !isIncome(e)).reduce<Record<string, number>>((acc, e) => {
      acc[e.cat] = (acc[e.cat] || 0) + Number(e.amount.replace(/[^\d]/g, ""));
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);

  const today = new Date();
  const referenceYear = startDate ? startDate.getFullYear() : today.getFullYear();

  // Dynamic monthly income/expense comparison for referenceYear
  const monthlyData = (() => {
    const data = [];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const yearStr = referenceYear.toString();
    for (let i = 0; i < 12; i++) {
      const monthLabel = months[i];

      const monthIncome = expenses
        .filter((e) => {
          const dateLower = e.date.toLowerCase();
          const pDate = parseAppDate(e.date);
          return isIncome(e) && dateLower.includes(monthLabel.toLowerCase()) && dateLower.includes(yearStr) && isDateInRange(pDate, startDate, endDate);
        })
        .reduce((sum, e) => sum + Number(e.amount.replace(/[^\d]/g, "")), 0);

      const monthExpense = expenses
        .filter((e) => {
          const dateLower = e.date.toLowerCase();
          const pDate = parseAppDate(e.date);
          return !isIncome(e) && dateLower.includes(monthLabel.toLowerCase()) && dateLower.includes(yearStr) && isDateInRange(pDate, startDate, endDate);
        })
        .reduce((sum, e) => sum + Number(e.amount.replace(/[^\d]/g, "")), 0);

      data.push({
        m: monthLabel,
        income: Math.round(monthIncome / 1000),
        expense: Math.round(monthExpense / 1000)
      });
    }
    return data;
  })();

  // YTD calculations for referenceYear
  const yearStr = referenceYear.toString();
  const ytdIncome = expenses
    .filter((e) => {
      const dateLower = e.date.toLowerCase();
      const pDate = parseAppDate(e.date);
      return isIncome(e) && dateLower.includes(yearStr) && isDateInRange(pDate, startDate, endDate);
    })
    .reduce((sum, e) => sum + Number(e.amount.replace(/[^\d]/g, "")), 0);

  const ytdExpenses = expenses
    .filter((e) => {
      const dateLower = e.date.toLowerCase();
      const pDate = parseAppDate(e.date);
      return !isIncome(e) && dateLower.includes(yearStr) && isDateInRange(pDate, startDate, endDate);
    })
    .reduce((sum, e) => sum + Number(e.amount.replace(/[^\d]/g, "")), 0);

  const ytdNet = ytdIncome - ytdExpenses;
  const ytdNetStr = `${ytdNet >= 0 ? "+" : "-"}₹${Math.abs(ytdNet) >= 100000 
    ? `${(Math.abs(ytdNet) / 100000).toFixed(2)} L` 
    : Math.abs(ytdNet).toLocaleString("en-IN")}`;

  return (
    <AppShell breadcrumb="Income & Expenses">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight">Income & Expenses Ledger</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {incomeByCat.length + expenseByCat.length} categories · {filteredEntries.length} transaction entries
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              downloadExcel("mobile-expenses.xlsx", "Income & Expenses", filteredEntries.map((e) => ({
                Reference: e.id,
                Date: e.date,
                Type: e.type || "Expense",
                "Payment Mode": e.paymentMode || "Cash",
                Category: e.cat,
                Description: e.desc,
                Amount: e.amount,
              })));
              toast.success("Income & Expenses exported to Excel");
            }}
            className="h-9 px-3.5 rounded-md border border-border bg-surface text-sm inline-flex items-center gap-1.5 hover:bg-accent font-semibold transition-colors shadow-sm cursor-pointer"
          >
            <Download className="size-3.5" /> Export Excel
          </button>
          <button
            onClick={() => {
              const presetLabels: Record<string, string> = {
                all: "All Time",
                today: "Today",
                "this-month": "This Month",
                "next-month": "Next Month",
                custom: "Custom Range",
              };
              downloadLedgerPDF({
                title: "Income & Expenses Ledger Statement",
                companyName: "Jain Mobiles ERP",
                totalIncome,
                totalExpenses,
                netBalance,
                periodLabel: presetLabels[filterPreset] || "All Time",
                entries: filteredEntries.map((e) => ({
                  id: e.id,
                  date: e.date,
                  type: e.type || (isIncome(e) ? "Income" : "Expense"),
                  paymentMode: e.paymentMode || "Cash",
                  cat: e.cat,
                  desc: e.desc,
                  amount: e.amount,
                })),
              });
            }}
            className="h-9 px-3.5 rounded-md border border-border bg-surface text-sm inline-flex items-center gap-1.5 hover:bg-accent font-semibold transition-colors shadow-sm cursor-pointer"
          >
            <FileText className="size-3.5 text-rose-500" /> Export PDF
          </button>
          <button onClick={() => setShowAddDialog(true)} className="h-9 px-4 rounded-md bg-foreground text-background text-sm font-semibold inline-flex items-center gap-1.5 hover:opacity-90 shadow transition-opacity cursor-pointer">
            <Plus className="size-3.5" /> Add Income / Expense
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Income" value={`₹${totalIncome.toLocaleString("en-IN")}`} sub="Period cash inflow" trend="up" />
        <StatCard label="Total Expenses" value={`₹${totalExpenses.toLocaleString("en-IN")}`} sub="Period cash outflow" trend={totalExpenses > 0 ? "warn" : undefined} />
        <StatCard label="Net Balance" value={`${netBalance >= 0 ? "+" : ""}₹${netBalance.toLocaleString("en-IN")}`} sub="Inflow - Outflow" trend={netBalance >= 0 ? "up" : "down"} />
        <StatCard label="YTD Net Cash" value={ytdNetStr} sub={`Net total for year ${referenceYear}`} trend={ytdNet >= 0 ? "up" : "down"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <Card className="lg:col-span-2">
          <SectionHeader title="Monthly income vs expense" action={<span className="text-xs text-muted-foreground">Full Year (₹ in thousands)</span>} />
          <div className="px-2 pb-4 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="m" tickLine={false} axisLine={false} fontSize={11} stroke="var(--muted-foreground)" />
                <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", fontSize: 12 }} />
                <Bar dataKey="income" fill="oklch(0.62 0.15 160)" radius={[4, 4, 0, 0]} name="Income" />
                <Bar dataKey="expense" fill="oklch(0.63 0.14 0)" radius={[4, 4, 0, 0]} name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <SectionHeader title="By category" />
            
            {incomeByCat.length > 0 && (
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-success mb-2">Income Streams</div>
                <div className="space-y-2.5">
                  {incomeByCat.map(([name, spent]) => (
                    <div key={name}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium">{name}</span>
                        <span className="text-muted-foreground">₹{spent.toLocaleString("en-IN")}</span>
                      </div>
                      <ProgressBar value={totalIncome ? Math.round((spent / totalIncome) * 100) : 0} color={CATEGORY_COLORS[name] ?? "var(--success)"} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {expenseByCat.length > 0 && (
              <div className={incomeByCat.length > 0 ? "pt-3 border-t border-border/60" : ""}>
                <div className="text-[10px] uppercase font-bold tracking-wider text-danger mb-2">Expenses Breakdown</div>
                <div className="space-y-2.5">
                  {expenseByCat.map(([name, spent]) => (
                    <div key={name}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium">{name}</span>
                        <span className="text-muted-foreground">₹{spent.toLocaleString("en-IN")}</span>
                      </div>
                      <ProgressBar value={totalExpenses ? Math.round((spent / totalExpenses) * 100) : 0} color={CATEGORY_COLORS[name] ?? "var(--danger)"} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {incomeByCat.length === 0 && expenseByCat.length === 0 && (
              <div className="text-xs text-muted-foreground text-center py-6">No data available for the period</div>
            )}
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <SectionHeader title="Recent entries" action={<span className="text-xs text-muted-foreground">All transactions</span>} />
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="text-left font-medium px-5 py-2.5">Reference</th>
              <th className="text-left font-medium px-4 py-2.5">Date</th>
              <th className="text-left font-medium px-4 py-2.5">Type</th>
              <th className="text-left font-medium px-4 py-2.5">Payment Mode</th>
              <th className="text-left font-medium px-4 py-2.5">Category</th>
              <th className="text-left font-medium px-4 py-2.5">Description</th>
              <th className="text-right font-medium px-5 py-2.5">Amount</th>
              <th className="text-right font-medium px-5 py-2.5">Running Balance</th>
              <th className="text-right font-medium px-5 py-2.5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.length === 0 ? (
              <tr><td colSpan={9} className="px-5 py-10 text-center text-muted-foreground">No entries match these filters.</td></tr>
            ) : (() => {
              // Calculate running balance in chronological order
              let runningSum = 0;
              const entriesWithBalance = filteredEntries.map((e) => {
                const amt = Number(e.amount.replace(/[^\d]/g, ""));
                if (e.type === "Income") {
                  runningSum += amt;
                } else {
                  runningSum -= amt;
                }
                return { ...e, runningBalance: runningSum };
              });

              return entriesWithBalance.slice().reverse().map((e) => {
                const entryIsIncome = isIncome(e);
                return (
                  <tr key={e.id} className="border-t border-border">
                    <td className="px-5 py-3 font-medium">{e.id}</td>
                    <td className="px-4 py-3 text-muted-foreground">{e.date}</td>
                    <td className="px-4 py-3">
                      <Badge tone={entryIsIncome ? "success" : "neutral"}>
                        {entryIsIncome ? "Income" : "Expense"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground font-semibold">
                      {e.paymentMode || "Cash"}
                    </td>
                    <td className="px-4 py-3">{e.cat}</td>
                    <td className="px-4 py-3 text-muted-foreground">{e.desc}</td>
                    <td className={`px-5 py-3 text-right font-semibold ${entryIsIncome ? "text-success font-bold" : "text-foreground"}`}>
                      {entryIsIncome ? `+ ₹${Number(e.amount.replace(/[^\d]/g, "")).toLocaleString("en-IN")}` : `- ₹${Number(e.amount.replace(/[^\d]/g, "")).toLocaleString("en-IN")}`}
                    </td>
                    <td className={`px-5 py-3 text-right font-semibold text-xs ${e.runningBalance >= 0 ? "text-success" : "text-danger"}`}>
                      {e.runningBalance >= 0 ? "+" : ""}₹{e.runningBalance.toLocaleString("en-IN")}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete entry ${e.id} for ${e.amount}?`)) {
                            deleteExpense(e.id);
                            toast.success(`Deleted ledger entry ${e.id}`);
                          }
                        }}
                        className="size-7 rounded border border-border inline-flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors text-muted-foreground cursor-pointer"
                        title="Delete Entry"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              });
            })()}
          </tbody>
        </table>
      </Card>

      {showAddDialog && (
        <ExpenseFormDialog onClose={() => setShowAddDialog(false)} />
      )}
    </AppShell>
  );
}
