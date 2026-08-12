import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp, TrendingDown, Download } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Card, SectionHeader } from "@/components/ui-kit";
import { downloadExcel, useStore, parseAppDate, isDateInRange } from "@/lib/store";
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
  const totalExpenses = filteredExpenses.reduce((s, e) => s + Number(String(e.amount || 0).replace(/[^\d]/g, "")), 0);
  const netProfit = grossProfit - totalExpenses;

  // ---- Investment ----
  const totalInvestment = filteredInvestments.reduce((s, i) => s + Number(String(i.amount || 0).replace(/[^\d]/g, "")), 0);
  const balanceForEmi   = filteredCustomers.reduce((s, c) => s + (c.balanceForEmi || 0), 0);

  // ---- By category ----
  const expByCategory = filteredExpenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.cat] = (acc[e.cat] || 0) + Number(String(e.amount || 0).replace(/[^\d]/g, ""));
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
        .reduce((sum, e) => sum + Number(String(e.amount || 0).replace(/[^\d]/g, "")), 0);

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
        <button
          onClick={() => {
            downloadExcel("profit-loss.xlsx", "Profit & Loss", [
              { Item: "File Charge Income", Amount: fmt(totalFileCharge) },
              { Item: "Interest Income (Realised)", Amount: fmt(totalInterestIncome) },
              { Item: "Gross Profit", Amount: fmt(grossProfit) },
              { Item: "Total Expenses", Amount: fmt(totalExpenses) },
              { Item: "Net Profit", Amount: fmt(netProfit) },
            ]);
            toast.success("Profit & Loss exported");
          }}
          className="h-9 px-3 rounded-md border border-border bg-surface text-sm inline-flex items-center gap-1.5 hover:bg-accent"
        >
          <Download className="size-3.5" /> Export
        </button>
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

      {/* Monthly trend table */}
      <Card className="mt-6">
        <SectionHeader title="Monthly Profit Trend" />
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
      </Card>
    </AppShell>
  );
}
