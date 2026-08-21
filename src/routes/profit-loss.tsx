import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp, TrendingDown, Download, ArrowUpRight, ArrowDownRight, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Card, SectionHeader } from "@/components/ui-kit";
import { downloadExcel, useStore, parseAppDate, parseAmount, isDateInRange } from "@/lib/store";
import { useUi } from "@/components/AppDialogs";
import { FilterBar, useDateFilter } from "@/components/FilterBar";

export const Route = createFileRoute("/profit-loss")({
  head: () => ({
    meta: [
      { title: "Profit & Loss · Jain Finance ERP" },
      { name: "description", content: "Mobile finance profit and loss — file charges, interest income, expenses and net profit." },
    ],
  }),
  component: ProfitLossPage,
});

function FigureBox({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: "profit" | "loss" | "neutral" }) {
  const color =
    accent === "profit" ? "text-success" :
    accent === "loss"   ? "text-danger"  :
    "text-foreground";
  return (
    <div className="flex-1 min-w-[150px] rounded-xl border border-border bg-surface p-5 text-center">
      <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">{label}</div>
      <div className={`text-2xl font-bold tracking-tight ${color}`}>{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </div>
  );
}

function Row({ label, value, bold, tone }: { label: string; value: string; bold?: boolean; tone?: "success" | "danger" | "warning" }) {
  const color = tone === "success" ? "text-success" : tone === "danger" ? "text-danger" : tone === "warning" ? "text-warning" : "";
  return (
    <div className={`flex items-center justify-between px-5 py-3 text-sm border-t border-border ${bold ? "bg-muted/20" : ""}`}>
      <span className={bold ? "font-semibold" : "text-muted-foreground"}>{label}</span>
      <span className={`font-medium ${bold ? "text-base font-bold" : ""} ${color}`}>{value}</span>
    </div>
  );
}

function ProfitLossPage() {
  const customers = useStore((s) => s.customers);
  const expenses = useStore((s) => s.expenses);
  const investments = useStore((s) => s.investments);
  const payments = useStore((s) => s.payments);
  const profitTransactions = useStore((s) => s.profitTransactions) || [];
  const deleteProfitTransaction = useStore((s) => s.deleteProfitTransaction);
  const currentUser = useStore((s) => s.currentUser);
  const { openDialog } = useUi();
  const isAdmin = currentUser?.role ? String(currentUser.role).toLowerCase() === "admin" : false;

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

  const filteredExpenses = expenses.filter((e) => {
    const eDate = parseAppDate(e.date);
    return isDateInRange(eDate, startDate, endDate);
  });

  const filteredInvestments = investments.filter((i) => {
    const iDate = parseAppDate(i.maturity);
    return isDateInRange(iDate, startDate, endDate);
  });

  const filteredPayments = payments.filter((p) => {
    const pDate = parseAppDate(p.date);
    return isDateInRange(pDate, startDate, endDate);
  });

  // ---- Revenue calculations (from customer records) ----
  const totalFileCharge = filteredCustomers.reduce((s, c) => s + (c.fileCharge || 0), 0);

  const custInterestMap = new Map(customers.map((c) => [c.id, c.interestPerMonth || 0]));
  
  // Realised interest in selected period (from successful payments in period)
  const totalInterestIncome = filteredPayments
    .filter((p) => p.status === "Success")
    .reduce((sum, p) => sum + (custInterestMap.get(p.customerId) || 0), 0);

  const collectedInterest = totalInterestIncome;
  const pendingInterest   = filteredCustomers.reduce((s, c) => s + ((c.pendingEmis || 0) * (c.interestPerMonth || 0)), 0);
  const grossProfit = totalFileCharge + totalInterestIncome;

  // ---- Expenses ----
  const totalExpenses = filteredExpenses.reduce((s, e) => s + parseAmount(e.amount), 0);
  const netProfit = grossProfit - totalExpenses;

  // ---- Profit Withdrawal & Redeposit Stats ----
  const totalWithdrawn = profitTransactions.filter((t) => t.type === "Withdrawal").reduce((s, t) => s + t.amount, 0);
  const totalRedeposited = profitTransactions.filter((t) => t.type === "Redeposit").reduce((s, t) => s + t.amount, 0);
  const netTakenBalance = Math.max(0, totalWithdrawn - totalRedeposited);

  // ---- Investment ----
  const totalInvestment = filteredInvestments.reduce((s, i) => s + parseAmount(i.amount), 0);
  const balanceForEmi   = filteredCustomers.reduce((s, c) => s + (c.balanceForEmi || 0), 0);

  // ---- By category ----
  const expByCategory = filteredExpenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.cat] = (acc[e.cat] || 0) + parseAmount(e.amount);
    return acc;
  }, {});

  const today = new Date();
  const referenceYear = startDate ? startDate.getFullYear() : today.getFullYear();

  // ---- Per-month breakdown (Jan to Dec of referenceYear) ----
  const monthlyData = (() => {
    const data = [];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const yearStr = referenceYear.toString();

    for (let i = 0; i < 12; i++) {
      const monthLabel = months[i];

      // 1. File charges of customers registered in this month
      const fileCharges = customers
        .filter((c) => {
          const dateLower = c.billDate.toLowerCase();
          const pDate = parseAppDate(c.billDate);
          return dateLower.includes(monthLabel.toLowerCase()) && dateLower.includes(yearStr) && isDateInRange(pDate, startDate, endDate);
        })
        .reduce((sum, c) => sum + (c.fileCharge || 0), 0);

      // 2. Realised interest from successful payments in this month
      const interestRealised = payments
        .filter((p) => {
          const dateLower = p.date.toLowerCase();
          const pDate = parseAppDate(p.date);
          return dateLower.includes(monthLabel.toLowerCase()) && dateLower.includes(yearStr) && p.status === "Success" && isDateInRange(pDate, startDate, endDate);
        })
        .reduce((sum, p) => {
          const interestVal = custInterestMap.get(p.customerId) || 0;
          return sum + interestVal;
        }, 0);

      const revenue = fileCharges + interestRealised;

      // 3. Expenses recorded in this month
      const expense = expenses
        .filter((e) => {
          const dateLower = e.date.toLowerCase();
          const pDate = parseAppDate(e.date);
          return dateLower.includes(monthLabel.toLowerCase()) && dateLower.includes(yearStr) && isDateInRange(pDate, startDate, endDate);
        })
        .reduce((sum, e) => sum + parseAmount(e.amount), 0);

      data.push({
        month: `${monthLabel} ${yearStr}`,
        revenue,
        expense,
        profit: revenue - expense,
      });
    }
    return data;
  })();

  const fmt = (n?: number) => "₹" + Math.round(n || 0).toLocaleString("en-IN");

  return (
    <AppShell breadcrumb="Profit & Loss">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight">Profit & Loss Report</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Mobile phone EMI finance · {filteredCustomers.length} customers · {filteredCustomers.filter((c) => c.status === "Active").length} active
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => openDialog("withdrawProfit")}
            className="h-9 px-3.5 rounded-md bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold inline-flex items-center gap-1.5 shadow transition-colors cursor-pointer"
          >
            <ArrowUpRight className="size-4" /> Withdraw Profit
          </button>
          <button
            onClick={() => openDialog("depositProfit")}
            className="h-9 px-3.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold inline-flex items-center gap-1.5 shadow transition-colors cursor-pointer"
          >
            <ArrowDownRight className="size-4" /> Deposit Taken Money
          </button>
          <button
            onClick={() => {
              downloadExcel("profit-loss.xlsx", "Profit & Loss", [
                { Item: "File Charge Income", Amount: fmt(totalFileCharge) },
                { Item: "Interest Income (Realised)", Amount: fmt(totalInterestIncome) },
                { Item: "Gross Profit", Amount: fmt(grossProfit) },
                { Item: "Total Expenses", Amount: fmt(totalExpenses) },
                { Item: "Net Profit", Amount: fmt(netProfit) },
                { Item: "Total Profit Withdrawn", Amount: fmt(totalWithdrawn) },
                { Item: "Total Profit Redeposited", Amount: fmt(totalRedeposited) },
                { Item: "Outstanding Taken Money Balance", Amount: fmt(netTakenBalance) },
              ]);
              toast.success("Profit & Loss exported");
            }}
            className="h-9 px-3 text-sm rounded-md border border-border bg-surface text-foreground font-semibold inline-flex items-center gap-1.5 hover:bg-accent transition-colors shadow-sm cursor-pointer"
          >
            <Download className="size-3.5" /> Export
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

      {/* Main P&L Summary (matching original layout) */}
      <div className="flex flex-wrap gap-4 mb-6">
        <FigureBox label="File Charge" value={fmt(totalFileCharge)} sub="10% of all phone prices" />
        <FigureBox label="Interest Amount" value={fmt(totalInterestIncome)} sub="Realised interest" />
        <FigureBox label="Gross Profit" value={fmt(grossProfit)} accent="profit" />
        <FigureBox label="Expenses" value={fmt(totalExpenses)} accent="loss" />
        <FigureBox label="Net Profit" value={fmt(netProfit)} sub={netProfit >= 0 ? "▲ Profitable" : "▼ Loss"} accent={netProfit >= 0 ? "profit" : "loss"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income breakdown */}
        <Card>
          <SectionHeader title="Income Breakdown" />
          <Row label="File Charge Income (10% of price)" value={fmt(totalFileCharge)} />
          <Row label="Interest Collected (realised)" value={fmt(collectedInterest)} />
          <Row label="Interest Pending (unrealised)" value={fmt(pendingInterest)} />
          <Row label="Gross Profit" value={fmt(grossProfit)} bold tone="success" />
        </Card>

        {/* Expense breakdown */}
        <Card>
          <SectionHeader title="Expense Breakdown" action={
            <span className="text-xs text-muted-foreground">{filteredExpenses.length} entries</span>
          } />
          {Object.entries(expByCategory).map(([cat, amt]) => (
            <Row key={cat} label={cat} value={fmt(amt)} />
          ))}
          <Row label="Total Expenses" value={fmt(totalExpenses)} bold tone="danger" />
        </Card>

        {/* Net summary */}
        <Card>
          <SectionHeader title="Net Summary" />
          <Row label="Gross Profit" value={fmt(grossProfit)} />
          <Row label="Less: Expenses" value={`− ${fmt(totalExpenses)}`} />
          <Row label="Net Profit" value={fmt(netProfit)} bold tone={netProfit >= 0 ? "success" : "danger"} />
          <div className="px-5 py-4 border-t border-border">
            <div className="flex items-center gap-2">
              {netProfit >= 0
                ? <TrendingUp className="size-4 text-success" />
                : <TrendingDown className="size-4 text-danger" />}
              <span className="text-sm font-medium">
                {netProfit >= 0 ? "Business is profitable" : "Business is in loss"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Profit margin: {grossProfit > 0 ? ((netProfit / grossProfit) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </Card>
      </div>

      {/* Profit Withdrawal & Redeposit Management Card */}
      <Card className="mt-6">
        <SectionHeader
          title="Profit Withdrawal & Deposit Tracker"
          action={
            <div className="flex items-center gap-2">
              <button
                onClick={() => openDialog("withdrawProfit")}
                className="h-8 px-3 rounded-md bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ArrowUpRight className="size-3.5" /> Withdraw
              </button>
              <button
                onClick={() => openDialog("depositProfit")}
                className="h-8 px-3 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ArrowDownRight className="size-3.5" /> Deposit Back
              </button>
            </div>
          }
        />

        {/* Quick Stat Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 border-b border-border bg-muted/10">
          <div className="rounded-lg border border-border bg-surface p-3 text-center">
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Net Profit Available</div>
            <div className={`text-xl font-bold mt-1 ${netProfit >= 0 ? "text-success" : "text-danger"}`}>{fmt(netProfit)}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">Calculated net income</div>
          </div>
          <div className="rounded-lg border border-border bg-surface p-3 text-center">
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Withdrawn</div>
            <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">{fmt(totalWithdrawn)}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">Cumulative taken money</div>
          </div>
          <div className="rounded-lg border border-border bg-surface p-3 text-center">
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Redeposited</div>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{fmt(totalRedeposited)}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">Returned to business fund</div>
          </div>
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-center">
            <div className="text-xs text-amber-700 dark:text-amber-300 font-medium uppercase tracking-wider">Outstanding Taken Money</div>
            <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">{fmt(netTakenBalance)}</div>
            <div className="text-[11px] text-amber-700/80 dark:text-amber-300/80 mt-0.5">Money yet to deposit back</div>
          </div>
        </div>

        {/* History Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border bg-muted/20">
                <th className="py-2.5 px-4 font-semibold">Ref ID</th>
                <th className="py-2.5 px-4 font-semibold">Date</th>
                <th className="py-2.5 px-4 font-semibold">Type</th>
                <th className="py-2.5 px-4 font-semibold">Payment Mode</th>
                <th className="py-2.5 px-4 font-semibold text-right">Amount</th>
                <th className="py-2.5 px-4 font-semibold text-right">Taken Balance After</th>
                <th className="py-2.5 px-4 font-semibold">Notes / Reason</th>
                <th className="py-2.5 px-4 font-semibold">Recorded By</th>
                {isAdmin && <th className="py-2.5 px-4 text-right font-semibold">Action</th>}
              </tr>
            </thead>
            <tbody>
              {profitTransactions.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 9 : 8} className="px-4 py-8 text-center text-muted-foreground font-semibold">
                    No profit withdrawals or redeposits recorded yet. Use the buttons above to record a withdrawal or deposit.
                  </td>
                </tr>
              ) : (
                profitTransactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-border hover:bg-accent/40 last:border-0">
                    <td className="py-2.5 px-4 font-mono font-medium text-muted-foreground">{tx.id}</td>
                    <td className="py-2.5 px-4 text-muted-foreground">{tx.date}</td>
                    <td className="py-2.5 px-4">
                      {tx.type === "Withdrawal" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                          <ArrowUpRight className="size-3" /> Withdrawal
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                          <ArrowDownRight className="size-3" /> Redeposit
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 font-medium text-foreground">{tx.method}</td>
                    <td className={`py-2.5 px-4 text-right font-bold ${tx.type === "Withdrawal" ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                      {tx.type === "Withdrawal" ? `- ₹${tx.amount.toLocaleString("en-IN")}` : `+ ₹${tx.amount.toLocaleString("en-IN")}`}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-medium text-muted-foreground">
                      ₹{tx.takenBalanceAfter.toLocaleString("en-IN")}
                    </td>
                    <td className="py-2.5 px-4 text-muted-foreground">{tx.notes || "—"}</td>
                    <td className="py-2.5 px-4 text-muted-foreground">{tx.withdrawnBy || "Admin"}</td>
                    {isAdmin && (
                      <td className="py-2.5 px-4 text-right">
                        <button
                          onClick={() => {
                            if (confirm(`Delete profit transaction ${tx.id} for ₹${tx.amount.toLocaleString("en-IN")}?`)) {
                              deleteProfitTransaction(tx.id);
                              toast.success(`Deleted transaction ${tx.id}`);
                            }
                          }}
                          className="size-7 rounded border border-border inline-flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors text-muted-foreground cursor-pointer"
                          title="Delete entry"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Monthly trend table */}
      <Card className="mt-6">
        <SectionHeader title="Monthly Profit Trend" />
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="text-left font-medium px-5 py-2.5">Month</th>
                <th className="text-right font-medium px-4 py-2.5">Revenue</th>
                <th className="text-right font-medium px-4 py-2.5">Expenses</th>
                <th className="text-right font-medium px-5 py-2.5">Net Profit</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((row) => (
                <tr key={row.month} className="border-t border-border hover:bg-accent/30">
                  <td className="px-5 py-3 font-medium">{row.month}</td>
                  <td className="px-4 py-3 text-right">₹{row.revenue.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-right text-danger">₹{row.expense.toLocaleString("en-IN")}</td>
                  <td className="px-5 py-3 text-right font-semibold text-success">
                    {row.profit >= 0 ? "+" : "−"}₹{Math.abs(row.profit).toLocaleString("en-IN")}
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

