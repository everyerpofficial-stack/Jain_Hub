import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2, Download, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Badge, Card, SectionHeader, StatCard } from "@/components/ui-kit";
import { useStore, parseAppDate, isDateInRange, downloadExcel } from "@/lib/store";
import { useUi } from "@/components/AppDialogs";
import { FilterBar, useDateFilter } from "@/components/FilterBar";

export const Route = createFileRoute("/investments")({
  head: () => ({
    meta: [
      { title: "Investments · Jain Finance ERP" },
      { name: "description", content: "Track investor capital, ROI, maturity dates and overall portfolio growth." },
    ],
  }),
  component: InvestmentsPage,
});

function parseMaturity(mat?: string) {
  if (!mat || typeof mat !== "string") return new Date();
  const parts = mat.split(" ");
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months.indexOf(parts[1]);
    const year = parseInt(parts[2], 10);
    if (month !== -1 && !isNaN(day) && !isNaN(year)) {
      return new Date(year, month, day);
    }
  }
  return new Date(mat);
}

function parseNumVal(val: any): number {
  if (typeof val === "number") return val;
  if (!val) return 0;
  return Number(String(val).replace(/[^\d.]/g, "")) || 0;
}

function InvestmentsPage() {
  const investments = useStore((s) => s.investments) || [];
  const customers = useStore((s) => s.customers) || [];
  const payments = useStore((s) => s.payments) || [];
  const profitTransactions = useStore((s) => s.profitTransactions) || [];
  const deleteInvestment = useStore((s) => s.deleteInvestment);
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

  const filteredInvestments = investments.filter((i) => {
    if (!i) return false;
    const matDate = parseAppDate(i.maturity || i.date);
    return isDateInRange(matDate, startDate, endDate);
  });

  const sortedInvestments = [...filteredInvestments].sort((a, b) => {
    const numA = parseInt((a.id || "").replace(/\D/g, ""), 10) || 0;
    const numB = parseInt((b.id || "").replace(/\D/g, ""), 10) || 0;
    return numB - numA;
  });

  const filteredCustomers = customers.filter((c) => {
    if (!c) return false;
    const cDate = parseAppDate(c.billDate);
    return isDateInRange(cDate, startDate, endDate);
  });

  const total = filteredInvestments.reduce((sum, i) => sum + parseNumVal(i?.amount), 0);
  const balanceForEmi = filteredCustomers.reduce((s, c) => s + (c?.balanceForEmi || 0), 0);

  const avgRoi = filteredInvestments.length
    ? (filteredInvestments.reduce((sum, i) => sum + parseNumVal(i?.roi), 0) / filteredInvestments.length).toFixed(1)
    : "0";

  const today = new Date();
  const referenceYear = startDate ? startDate.getFullYear() : today.getFullYear();

  // Dynamic customer finance growth trend
  const growth = (() => {
    const data = [];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const yearNum = referenceYear;
    for (let i = 0; i < 12; i++) {
      const monthLabel = months[i];
      const d = new Date(yearNum, i + 1, 0); // End of month

      const activeTotal = customers
        .filter((c) => {
          if (!c) return false;
          const cDate = parseAppDate(c.billDate);
          return !!cDate && cDate <= d && isDateInRange(cDate, startDate, endDate);
        })
        .reduce((sum, c) => sum + (c?.balanceForEmi || 0), 0);

      data.push({ m: monthLabel, v: Math.round(activeTotal / 1000) });
    }
    return data;
  })();

  // Capital Deployment & Returns calculations
  const totalDownpayments = customers.reduce((sum, c) => sum + (c?.deposit || 0), 0);
  const totalFileCharges = customers.reduce((sum, c) => sum + (c?.fileCharge || 0), 0);
  const custInterestMap = new Map(customers.map((c) => [c?.id, c?.interestPerMonth || 0]));
  const totalInterestCollected = payments
    .filter((p) => p && p.status === "Success")
    .reduce((sum, p) => sum + (custInterestMap.get(p.customerId) || 0), 0);
  const totalPaymentsCollected = payments
    .filter((p) => p && p.status === "Success")
    .reduce((sum, p) => sum + parseNumVal(p?.amount), 0);

  const totalReceived = totalDownpayments + totalPaymentsCollected;
  const netEarnings = totalFileCharges + totalInterestCollected;

  const totalWithdrawn = profitTransactions.filter((t) => t.type === "Withdrawal").reduce((s, t) => s + t.amount, 0);
  const totalRedeposited = profitTransactions.filter((t) => t.type === "Redeposit").reduce((s, t) => s + t.amount, 0);
  const netTakenBalance = Math.max(0, totalWithdrawn - totalRedeposited);

  return (
    <AppShell breadcrumb="Investments">
      {/* Main UI Header block */}
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight">Investment Portfolio</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredInvestments.length} investors · ₹{total.toLocaleString("en-IN")} deployed
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
              downloadExcel("investments-portfolio.xlsx", "Investment Portfolio", filteredInvestments.map((inv) => ({
                "Investor ID": inv.id,
                Investor: inv.investor,
                "Capital Amount": inv.amount,
                "ROI Rate": inv.roi,
                "Investment Date": inv.date || "—",
                "Maturity Date": inv.maturity,
                "Payment Mode": inv.method || "Cash",
                Status: inv.status,
              })));
              toast.success("Investment portfolio exported to Excel");
            }}
            className="h-9 px-3.5 rounded-md border border-border bg-surface text-sm inline-flex items-center gap-1.5 hover:bg-accent font-semibold transition-colors shadow-sm cursor-pointer"
          >
            <Download className="size-3.5" /> Export Excel
          </button>
          <button onClick={() => openDialog("investment")} className="h-9 px-4 rounded-md bg-foreground text-background text-sm font-semibold inline-flex items-center gap-1.5 hover:opacity-90 shadow transition-opacity cursor-pointer">
            <Plus className="size-3.5" /> Add Investment
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

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard label="Financed Principal" value={`₹${balanceForEmi.toLocaleString("en-IN")}`} sub={`${filteredCustomers.length} active customer loans`} trend="up" />
        <StatCard label="Total Received (Returns)" value={`₹${totalReceived.toLocaleString("en-IN")}`} sub="Downpayments & collections" trend="up" />
        <StatCard label="Net Financing Profit" value={`₹${netEarnings.toLocaleString("en-IN")}`} sub="File charges & interest" trend="up" />
        <StatCard label="Outstanding Taken Profit" value={`₹${netTakenBalance.toLocaleString("en-IN")}`} sub="Taken money to redeposit" trend={netTakenBalance > 0 ? "warn" : undefined} />
      </div>

      <div className="mt-6">
        <Card>
          <SectionHeader title="Financing portfolio growth" action={<span className="text-xs text-muted-foreground">Full Year (₹ in thousands)</span>} />
          <div className="px-2 pb-4 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growth} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="m" tickLine={false} axisLine={false} fontSize={11} stroke="var(--muted-foreground)" />
                <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", fontSize: 12 }} />
                <Line type="monotone" dataKey="v" stroke="var(--success)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--success)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="mt-6 w-full overflow-hidden">
        <SectionHeader title="Active investments" />
        <div className="w-full overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border bg-muted/10">
                <th className="py-2.5 px-3 font-semibold">Ref</th>
                <th className="py-2.5 px-3 font-semibold">Date</th>
                <th className="py-2.5 px-3 font-semibold">Investor</th>
                <th className="py-2.5 px-3 font-semibold">Amount</th>
                <th className="py-2.5 px-3 font-semibold">ROI</th>
                <th className="py-2.5 px-3 font-semibold">Maturity</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                {isAdmin && (
                  <th className="py-2.5 px-3 text-right font-semibold">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {sortedInvestments.length === 0 ? (
                <tr><td colSpan={isAdmin ? 8 : 7} className="px-3 py-10 text-center text-muted-foreground font-semibold">No investments match these filters.</td></tr>
              ) : sortedInvestments.map((i) => (
                <tr key={i.id} className="border-b border-border hover:bg-accent/40 last:border-0">
                  <td className="py-2.5 px-3 font-mono font-medium text-muted-foreground">{i.id}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{i.date || "—"}</td>
                  <td className="py-2.5 px-3 font-semibold text-foreground">{i.investor}</td>
                  <td className="py-2.5 px-3 font-bold text-foreground">{i.amount}</td>
                  <td className="py-2.5 px-3 text-success font-bold">{i.roi}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{i.maturity}</td>
                  <td className="py-2.5 px-3"><Badge tone={i.status === "Active" ? "success" : i.status === "Maturing" ? "warning" : "neutral"}>{i.status}</Badge></td>
                  {isAdmin && (
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete investment ${i.id} for ${i.investor}?`)) {
                            deleteInvestment(i.id);
                            toast.success(`Deleted investment ${i.id}`);
                          }
                        }}
                        className="size-7 rounded border border-border inline-flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors text-muted-foreground cursor-pointer"
                        title="Delete Investment"
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

      <Card className="mt-6 w-full overflow-hidden">
        <SectionHeader title="Capital Deployment (Financed Customers)" action={<span className="text-xs text-muted-foreground">{filteredCustomers.length} active customer loans</span>} />
        <div className="w-full overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border bg-muted/10">
                <th className="py-2.5 px-3 font-semibold">Cust ID</th>
                <th className="py-2.5 px-3 font-semibold">Customer Name</th>
                <th className="py-2.5 px-3 font-semibold">Village</th>
                <th className="py-2.5 px-3 font-semibold">Device Model</th>
                <th className="py-2.5 px-3 font-semibold text-right">Financed Principal</th>
                <th className="py-2.5 px-3 font-semibold text-right">Interest to Collect</th>
                <th className="py-2.5 px-3 font-semibold text-right">Interest Collected</th>
                <th className="py-2.5 px-3 font-semibold text-right">Outstanding Balance</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr><td colSpan={9} className="py-10 text-center text-muted-foreground font-semibold">No customer loans match the current filters.</td></tr>
              ) : filteredCustomers.map((c) => {
                const interestCollected = (c.paidEmis || 0) * (c.interestPerMonth || 0);
                const interestRemaining = (c.totalInterest || 0) - interestCollected;
                return (
                  <tr key={c.id} className="border-b border-border hover:bg-accent/40 cursor-pointer transition-colors last:border-0">
                    <td className="py-2.5 px-3 font-mono text-xs text-muted-foreground">{c.id}</td>
                    <td className="py-2.5 px-3 font-semibold text-foreground">{c.name}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">{c.village}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">{c.mobileBrand} {c.mobileModel}</td>
                    <td className="py-2.5 px-3 text-right font-semibold text-foreground">₹{(c.balanceForEmi || 0).toLocaleString("en-IN")}</td>
                    <td className="py-2.5 px-3 text-right font-medium text-warning">₹{Math.max(0, interestRemaining).toLocaleString("en-IN")}</td>
                    <td className="py-2.5 px-3 text-right font-medium text-success">₹{interestCollected.toLocaleString("en-IN")}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-danger">₹{(c.pendingAmount || 0).toLocaleString("en-IN")}</td>
                    <td className="py-2.5 px-3">
                      <Badge tone={c.status === "Active" ? "success" : c.status === "Overdue" ? "warning" : c.status === "Defaulted" ? "danger" : "neutral"}>
                        {c.status}
                      </Badge>
                    </td>
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
