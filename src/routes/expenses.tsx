import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2, Download, FileText } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Badge, Card, ProgressBar, SectionHeader, StatCard } from "@/components/ui-kit";
import { useStore, parseAppDate, parseAmount, isDateInRange, downloadExcel, downloadLedgerPDF } from "@/lib/store";
import { useUi } from "@/components/AppDialogs";
import { FilterBar, useDateFilter } from "@/components/FilterBar";

export const Route = createFileRoute("/expenses")({
  head: () => ({
    meta: [
      { title: "Income / Expense · Jain Finance ERP" },
      { name: "description", content: "Track office expenses and cash income streams." },
    ],
  }),
  component: ExpensesPage,
});

const CATEGORY_COLORS: Record<string, string> = {
  // Expenses
  "Office Expense": "var(--info)",
  "Ashish Expense": "var(--warning)",
  Salary: "var(--foreground)",
  Travel: "var(--warning)",
  Utilities: "var(--success)",
  Maintenance: "var(--danger)",
  Marketing: "var(--info)",
  // Income
  "Interest Collection": "var(--success)",
  "File Charge Income": "var(--info)",
  "Capital Inflow": "var(--foreground)",
  "Other Income": "var(--warning)",
};

function ExpensesPage() {
  const expenses = useStore((s) => s.expenses);
  const deleteExpense = useStore((s) => s.deleteExpense);
  const currentUser = useStore((s) => s.currentUser);
  const { openDialog } = useUi();

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

  const filteredEntries = expenses.filter((e) => {
    const eDate = parseAppDate(e.date);
    return isDateInRange(eDate, startDate, endDate);
  });

  const isIncome = (e: any) => e.type === "Income";

  // Period sums
  const totalIncome = filteredEntries.filter(isIncome).reduce((sum, e) => sum + parseAmount(e.amount), 0);
  const totalExpenses = filteredEntries.filter(e => !isIncome(e)).reduce((sum, e) => sum + parseAmount(e.amount), 0);
  const netBalance = totalIncome - totalExpenses;

  // Breakdown by category
  const incomeByCat = Object.entries(
    filteredEntries.filter(isIncome).reduce<Record<string, number>>((acc, e) => {
      acc[e.cat] = (acc[e.cat] || 0) + parseAmount(e.amount);
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);

  const expenseByCat = Object.entries(
    filteredEntries.filter(e => !isIncome(e)).reduce<Record<string, number>>((acc, e) => {
      acc[e.cat] = (acc[e.cat] || 0) + parseAmount(e.amount);
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
          const dateLower = String(e.date || "").toLowerCase();
          const pDate = parseAppDate(e.date);
          return isIncome(e) && dateLower.includes(monthLabel.toLowerCase()) && dateLower.includes(yearStr) && isDateInRange(pDate, startDate, endDate);
        })
        .reduce((sum, e) => sum + parseAmount(e.amount), 0);

      const monthExpense = expenses
        .filter((e) => {
          const dateLower = String(e.date || "").toLowerCase();
          const pDate = parseAppDate(e.date);
          return !isIncome(e) && dateLower.includes(monthLabel.toLowerCase()) && dateLower.includes(yearStr) && isDateInRange(pDate, startDate, endDate);
        })
        .reduce((sum, e) => sum + parseAmount(e.amount), 0);

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
      const dateLower = String(e.date || "").toLowerCase();
      const pDate = parseAppDate(e.date);
      return isIncome(e) && dateLower.includes(yearStr) && isDateInRange(pDate, startDate, endDate);
    })
    .reduce((sum, e) => sum + parseAmount(e.amount), 0);

  const ytdExpenses = expenses
    .filter((e) => {
      const dateLower = String(e.date || "").toLowerCase();
      const pDate = parseAppDate(e.date);
      return !isIncome(e) && dateLower.includes(yearStr) && isDateInRange(pDate, startDate, endDate);
    })
    .reduce((sum, e) => sum + parseAmount(e.amount), 0);

  const ytdNet = ytdIncome - ytdExpenses;
  const ytdNetStr = `${ytdNet >= 0 ? "+" : "-"}₹${Math.abs(ytdNet) >= 100000 
    ? `${(Math.abs(ytdNet) / 100000).toFixed(2)} L` 
    : Math.abs(ytdNet).toLocaleString("en-IN")}`;

  return (
    <AppShell breadcrumb="Income / Expense">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight">Ledger Cash Flow</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {incomeByCat.length + expenseByCat.length} categories · {filteredEntries.length} transaction entries
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              downloadExcel("finance-ledger-cashflow.xlsx", "Income & Expense Ledger", filteredEntries.map((e) => ({
                Reference: e.id,
                Date: e.date,
                Type: e.type || (isIncome(e) ? "Income" : "Expense"),
                "Payment Method": e.method || "Cash",
                Category: e.cat,
                Description: e.desc,
                Amount: e.amount,
              })));
              toast.success("Income & Expense ledger exported to Excel");
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
                title: "Income & Expense Ledger Statement",
                companyName: "Jain Finance ERP",
                totalIncome,
                totalExpenses,
                netBalance,
                periodLabel: presetLabels[filterPreset] || "All Time",
                entries: filteredEntries.map((e) => ({
                  id: e.id,
                  date: e.date,
                  type: e.type || (isIncome(e) ? "Income" : "Expense"),
                  paymentMode: e.method || "Cash",
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
          <button onClick={() => openDialog("expense")} className="h-9 px-4 rounded-md bg-foreground text-background text-sm font-semibold inline-flex items-center gap-1.5 hover:opacity-90 shadow transition-opacity cursor-pointer">
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
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="text-left font-medium px-5 py-2.5">Reference</th>
                <th className="text-left font-medium px-4 py-2.5">Date</th>
                <th className="text-left font-medium px-4 py-2.5">Type</th>
                <th className="text-left font-medium px-4 py-2.5">Category</th>
                <th className="text-left font-medium px-4 py-2.5">Description</th>
                <th className="text-right font-medium px-5 py-2.5">Amount</th>
                {currentUser?.role?.toLowerCase() === "admin" && (
                  <th className="text-right font-medium px-5 py-2.5">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredEntries.length === 0 ? (
                <tr><td colSpan={currentUser?.role?.toLowerCase() === "admin" ? 7 : 6} className="px-5 py-10 text-center text-muted-foreground">No entries match these filters.</td></tr>
              ) : filteredEntries.map((e) => {
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
                    <td className="px-4 py-3">{e.cat}</td>
                    <td className="px-4 py-3 text-muted-foreground">{e.desc}</td>
                    <td className={`px-5 py-3 text-right font-semibold ${entryIsIncome ? "text-success font-bold" : "text-foreground"}`}>
                      {entryIsIncome ? `+ ₹${parseAmount(e.amount).toLocaleString("en-IN")}` : `- ₹${parseAmount(e.amount).toLocaleString("en-IN")}`}
                    </td>
                    {currentUser?.role?.toLowerCase() === "admin" && (
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete entry ${e.id} for ${e.amount}?`)) {
                              deleteExpense(e.id);
                              toast.success(`Deleted ledger entry ${e.id}`);
                            }
                          }}
                          className="size-7 rounded border border-border inline-flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors text-muted-foreground"
                          title="Delete Entry"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
