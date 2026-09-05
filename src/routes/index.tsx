import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Users, TrendingUp, IndianRupee,
  FileDown, AlertTriangle, Clock, Smartphone, CheckCircle2,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar,
} from "recharts";
import { AppShell } from "@/components/AppShell";
import { Badge, Card, ProgressBar, SectionHeader, StatCard } from "@/components/ui-kit";
import { downloadExcel, useStore, parseAppDate, parseAmount, isDateInRange } from "@/lib/store";
import { useUi } from "@/components/AppDialogs";
import { toast } from "sonner";
import { FilterBar, useDateFilter } from "@/components/FilterBar";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · Jain Finance ERP" },
      { name: "description", content: "Jain Finance mobile phone EMI finance dashboard — daily collections, pending EMIs and P&L overview." },
    ],
  }),
  component: Dashboard,
})

function Dashboard() {
  const { openDialog } = useUi();
  const currentUser = useStore((s) => s.currentUser);
  const isAdmin = currentUser?.role ? String(currentUser.role).toLowerCase() === "admin" : false;
  const customers = useStore((s) => s.customers);
  const payments = useStore((s) => s.payments);
  const expenses = useStore((s) => s.expenses);
  const investments = useStore((s) => s.investments);

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

  // Filtered dataset subsets based on date range
  const filteredCustomers = customers.filter((c) => {
    if (filterPreset === "all") return true;
    const date = parseAppDate(c.billDate);
    return isDateInRange(date, startDate, endDate);
  });

  const filteredPayments = payments.filter((p) => {
    if (filterPreset === "all") return true;
    const date = parseAppDate(p.date);
    return isDateInRange(date, startDate, endDate);
  });

  const filteredExpenses = expenses.filter((e) => {
    if (filterPreset === "all") return true;
    const date = parseAppDate(e.date);
    return isDateInRange(date, startDate, endDate);
  });

  // Dynamic Collection Trend (Adjusts detail between days and months depending on range size)
  const collectionTrend = (() => {
    const trend = [];
    const isSmallRange = startDate && endDate && ((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) <= 35);
    
    if (isSmallRange && startDate && endDate) {
      const daysCount = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const monthsList = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      
      for (let d = 0; d < daysCount; d++) {
        const dayDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + d);
        const dayStr = `${dayDate.getDate()} ${monthsList[dayDate.getMonth()]}`;
        
        const collected = payments
          .filter((p) => {
            const pDate = parseAppDate(p.date);
            return pDate && pDate.toDateString() === dayDate.toDateString() && p.status === "Success";
          })
          .reduce((sum, p) => sum + parseAmount(p.amount), 0);
          
        const pending = customers
          .filter((c) => {
            if (c.status !== "Active" && c.status !== "Overdue") return false;
            const cDate = parseAppDate(c.emiDate);
            return cDate && cDate.toDateString() === dayDate.toDateString();
          })
          .reduce((sum, c) => sum + c.perMonthEmi, 0);
          
        trend.push({ label: dayStr, collected, pending });
      }
    } else {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const startYear = startDate ? startDate.getFullYear() : 2026;
      
      for (let i = 0; i < 12; i++) {
        const monthLabel = months[i];
        const monthStart = new Date(startYear, i, 1);
        const monthEnd = new Date(startYear, i + 1, 0);
        
        if (startDate && endDate && (monthEnd < startDate || monthStart > endDate)) {
          continue;
        }
        
        const collected = payments
          .filter((p) => {
            const pDate = parseAppDate(p.date);
            if (!pDate) return false;
            return pDate >= monthStart && pDate <= monthEnd && p.status === "Success" && isDateInRange(pDate, startDate, endDate);
          })
          .reduce((sum, p) => sum + parseAmount(p.amount), 0);
          
        const pending = customers
          .filter((c) => {
            if (c.status !== "Active" && c.status !== "Overdue") return false;
            const cDate = parseAppDate(c.emiDate);
            if (!cDate) return false;
            return cDate >= monthStart && cDate <= monthEnd && isDateInRange(cDate, startDate, endDate);
          })
          .reduce((sum, c) => sum + (c.perMonthEmi || 0), 0);
          
        trend.push({ label: monthLabel, collected, pending });
      }
    }
    return trend;
  })();

  // Dynamic Brand Performance (Cash collected by brand within selected date range)
  const brandPerf = (() => {
    const brandMap: Record<string, { customers: number; collected: number }> = {};
    
    filteredCustomers.forEach((c) => {
      const brand = c.mobileBrand || "Other";
      if (!brandMap[brand]) {
        brandMap[brand] = { customers: 0, collected: 0 };
      }
      brandMap[brand].customers += 1;
      
      const downpayment = isDateInRange(parseAppDate(c.billDate), startDate, endDate) ? c.deposit : 0;
      
      const paymentsInPeriod = payments
        .filter(p => p.customerId === c.id && p.status === "Success" && isDateInRange(parseAppDate(p.date), startDate, endDate))
        .reduce((sum, p) => sum + parseAmount(p.amount), 0);
        
      brandMap[brand].collected += downpayment + paymentsInPeriod;
    });

    return Object.keys(brandMap).map((brand) => ({
      brand,
      customers: brandMap[brand].customers,
      collected: brandMap[brand].collected,
    }));
  })();

  // Dynamic upcoming EMIs within the selected range
  const upcoming = customers
    .filter((c) => {
      if (c.status !== "Active" || c.pendingEmis <= 0) return false;
      const date = parseAppDate(c.emiDate);
      return isDateInRange(date, startDate, endDate);
    })
    .slice(0, 5)
    .map((c) => ({
      id: c.id,
      name: c.name,
      village: c.village,
      emi: `₹${c.perMonthEmi.toLocaleString("en-IN")}`,
      due: c.emiDate || "—",
      model: `${c.mobileBrand} ${c.mobileModel}`,
    }));

  // Live clock
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateStr = now.toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  // Computed stats
  const totalCustomers    = filteredCustomers.length;
  const activeCustomers   = filteredCustomers.filter((c) => c.status === "Active").length;
  const overdueCustomers  = filteredCustomers.filter((c) => c.status === "Overdue" || c.status === "Defaulted").length;
  const closedCustomers   = filteredCustomers.filter((c) => c.status === "Closed").length;

  const totalPending = filterPreset === "all"
    ? customers.reduce((s, c) => s + (c.pendingAmount || 0), 0)
    : customers.filter(c => isDateInRange(parseAppDate(c.emiDate), startDate, endDate)).reduce((s, c) => s + (c.perMonthEmi || 0), 0);

  const pendingCount = filterPreset === "all"
    ? customers.filter((c) => (c.pendingEmis || 0) > 0).length
    : customers.filter(c => isDateInRange(parseAppDate(c.emiDate), startDate, endDate) && (c.pendingEmis || 0) > 0).length;

  const totalFileCharge   = filteredCustomers.reduce((s, c) => s + (c.fileCharge || 0), 0);
  const collectedInterest = filteredPayments
    .filter((p) => p.status === "Success")
    .reduce((sum, p) => {
      const cust = customers.find((c) => c.id === p.customerId);
      return sum + (cust ? (cust.interestPerMonth || 0) : 0);
    }, 0);
  
  const grossProfit       = totalFileCharge + collectedInterest;
  const totalExpenses     = filteredExpenses.reduce((s, e) => s + parseAmount(e.amount), 0);
  const netProfit         = grossProfit - totalExpenses;
  const totalInvestment   = investments.filter((i) => {
    if (filterPreset === "all") return true;
    return isDateInRange(parseAppDate(i.maturity), startDate, endDate);
  }).reduce((s, i) => s + parseAmount(i.amount), 0);

  const periodPaymentCount = filteredPayments.length;
  const periodCollection  = filteredPayments
    .filter((p) => p.status === "Success")
    .reduce((s, p) => s + parseAmount(p.amount), 0);

  const fmt = (n?: number) => "₹" + Math.round(n || 0).toLocaleString("en-IN");

  return (
    <AppShell breadcrumb="Dashboard">
      {/* Greeting Row */}
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight leading-tight">
            {greeting}{currentUser?.name ? `, ${currentUser.name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
            {dateStr} · Jain Finance Mobile EMI
            <span className="inline-flex items-center gap-1 text-muted-foreground/60">
              <Clock className="size-3" />{timeStr}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const dataToExport = filteredCustomers.map((c) => ({
                ID: c.id,
                Name: c.name,
                Village: c.village,
                Mobile: c.mobile,
                Brand: c.mobileBrand,
                Model: c.mobileModel,
                "Monthly EMI": c.perMonthEmi,
                "Pending Amount": c.pendingAmount,
                Status: c.status
              }));
              downloadExcel("jain-finance-report.xlsx", "Dashboard Report", dataToExport);
              toast.success("Dashboard exported");
            }}
            className="h-9 px-3.5 rounded-md border border-border bg-surface text-sm inline-flex items-center gap-1.5 hover:bg-accent font-semibold transition-colors shadow-sm"
          >
            <FileDown className="size-3.5" /> Export Report
          </button>
          <button onClick={() => openDialog("customer")}
            className="h-9 px-4 rounded-md bg-foreground text-background text-sm font-semibold inline-flex items-center gap-1.5 hover:opacity-90 shadow transition-opacity">
            + New Customer
          </button>
        </div>
      </div>

      {/* Premium Dashboard Filter Bar */}
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

      {/* Key stats */}
      <div className={`grid grid-cols-2 ${isAdmin ? "md:grid-cols-4" : "md:grid-cols-3"} gap-4 mb-6`}>
        <StatCard
          label={filterPreset === "all" ? "Total Customers" : "New Customers"}
          value={totalCustomers.toString()}
          sub={`${activeCustomers} active · ${closedCustomers} closed`}
          icon={<Users className="size-4" />}
          trend="up"
        />
        <StatCard
          label={filterPreset === "all" ? "Total Pending EMI" : "Expected EMI Collection"}
          value={fmt(totalPending)}
          sub={`${pendingCount} customers`}
          icon={<IndianRupee className="size-4" />}
          trend={overdueCustomers > 0 ? "warn" : "up"}
        />
        {isAdmin && (
          <StatCard
            label="Net Profit"
            value={fmt(netProfit)}
            sub={`File Chg + Interest − Exp`}
            icon={<TrendingUp className="size-4" />}
            trend={netProfit > 0 ? "up" : "down"}
          />
        )}
        <StatCard
          label={filterPreset === "all" ? "Total Collection" : "Collection in Period"}
          value={fmt(periodCollection)}
          sub={`${periodPaymentCount} payments`}
          icon={<CheckCircle2 className="size-4" />}
          trend="up"
        />
      </div>

      {/* Secondary stats */}
      <div className={`grid grid-cols-2 ${isAdmin ? "md:grid-cols-4" : "md:grid-cols-2"} gap-4 mb-6`}>
        <StatCard label="File Charge Income" value={fmt(totalFileCharge)} sub="10% of selling price" />
        {isAdmin && (
          <StatCard label="Interest Income" value={fmt(collectedInterest)} sub="Realised in period" />
        )}
        <StatCard label="Total Expenses" value={fmt(totalExpenses)} sub={`${filteredExpenses.length} entries`} trend="warn" />
        {isAdmin && (
          <StatCard label="Total Investment" value={fmt(totalInvestment)} sub={`${investments.filter(i => filterPreset === "all" ? true : isDateInRange(parseAppDate(i.maturity), startDate, endDate)).length} investors`} />
        )}
      </div>

      {/* Overdue alert */}
      {overdueCustomers > 0 && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-danger/30 bg-danger/5 px-4 py-3">
          <AlertTriangle className="size-4 text-danger shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-semibold text-danger">{overdueCustomers} customers overdue or defaulted.</span>
            <span className="text-muted-foreground ml-1.5">
              Total at risk: {fmt(customers.filter((c) => c.status === "Overdue" || c.status === "Defaulted").reduce((s, c) => s + (c.pendingAmount || 0), 0))}.
            </span>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Collection trend */}
        <Card className="lg:col-span-2">
          <SectionHeader
            title="Collection Trend"
            action={
              <span className="text-xs text-muted-foreground font-semibold">
                {filterPreset === "all"
                  ? "All Time View"
                  : filterPreset === "this-month"
                  ? "This Month"
                  : filterPreset === "next-month"
                  ? "Next Month"
                  : `Custom Range (${startDate?.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) || "—"} to ${endDate?.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) || "—"})`}
              </span>
            }
          />
          <div className="px-5 pb-5">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={collectionTrend} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gcol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.62 0.15 160)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="oklch(0.62 0.15 160)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.78 0.16 70)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="oklch(0.78 0.16 70)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, ""]} contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="collected" stroke="oklch(0.62 0.15 160)" strokeWidth={2} fill="url(#gcol)" name="Collected" />
                <Area type="monotone" dataKey="pending" stroke="oklch(0.78 0.16 70)" strokeWidth={2} fill="url(#gpend)" name="Pending" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Brand breakdown */}
        <Card>
          <SectionHeader title="By Mobile Brand" />
          <div className="px-5 pb-5">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={brandPerf} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="brand" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Collected"]} contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="collected" fill="oklch(0.22 0.012 60)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Bottom two panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming EMIs */}
        <Card>
          <SectionHeader title="Upcoming EMIs" action={
            <Badge tone="warning">{upcoming.length} due in period</Badge>
          } />
          <ul className="divide-y divide-border">
            {upcoming.length === 0 ? (
              <li className="px-5 py-8 text-center text-sm text-muted-foreground font-medium">
                No upcoming EMIs due in this period.
              </li>
            ) : (
              upcoming.map((u) => (
                <li key={u.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="size-9 rounded-full bg-muted grid place-items-center shrink-0">
                    <Smartphone className="size-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{u.name}</div>
                    <div className="text-xs text-muted-foreground">{u.village} · {u.model}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-semibold">{u.emi}</div>
                    <div className="text-xs text-muted-foreground">{u.due}</div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </Card>

        {/* Customer status breakdown */}
        <Card>
          <SectionHeader title="Customer Portfolio" />
          <div className="px-5 pb-4 space-y-4 pt-2">
            {[
              { label: "Active", count: filteredCustomers.filter((c) => c.status === "Active").length, total: totalCustomers, color: "oklch(0.62 0.15 160)", tone: "success" as const },
              { label: "Overdue", count: filteredCustomers.filter((c) => c.status === "Overdue").length, total: totalCustomers, color: "oklch(0.78 0.16 70)", tone: "warning" as const },
              { label: "Defaulted", count: filteredCustomers.filter((c) => c.status === "Defaulted").length, total: totalCustomers, color: "oklch(0.6 0.22 25)", tone: "danger" as const },
              { label: "Closed", count: filteredCustomers.filter((c) => c.status === "Closed").length, total: totalCustomers, color: "oklch(0.6 0.012 60)", tone: "neutral" as const },
            ].map((row) => (
              <div key={row.label}>
                <div className="flex items-center justify-between mb-1.5 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge tone={row.tone}>{row.label}</Badge>
                  </div>
                  <span className="font-medium">{row.count} <span className="text-muted-foreground font-normal">/ {row.total}</span></span>
                </div>
                <ProgressBar value={row.total > 0 ? (row.count / row.total) * 100 : 0} color={row.color} />
              </div>
            ))}
            <div className="pt-2 border-t border-border">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-muted/30 p-3">
                  <div className="text-xs text-muted-foreground">Avg EMI / Customer</div>
                  <div className="font-semibold mt-0.5">
                    {fmt(totalCustomers ? filteredCustomers.reduce((s, c) => s + c.perMonthEmi, 0) / totalCustomers : 0)}
                  </div>
                </div>
                <div className="rounded-lg bg-muted/30 p-3">
                  <div className="text-xs text-muted-foreground">Avg Loan Ticket</div>
                  <div className="font-semibold mt-0.5">
                    {fmt(totalCustomers ? filteredCustomers.reduce((s, c) => s + c.price, 0) / totalCustomers : 0)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
