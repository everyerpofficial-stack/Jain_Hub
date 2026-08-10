import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Users, BarChart3, Box, Receipt, Clock, FileDown,
  AlertTriangle, CheckCircle2, ShoppingBag, Landmark,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Cell, PieChart, Pie
} from "recharts";
import { AppShell } from "@/components/AppShell";
import { Badge, Card, ProgressBar, SectionHeader, StatCard } from "@/components/ui-kit";
import { useMobileStore, MobileSale, safeItems } from "@/lib/mobileStore";
import { parseAppDate, isDateInRange } from "@/lib/store";
import { FilterBar, useDateFilter } from "@/components/FilterBar";
import { toast } from "sonner";

export const Route = createFileRoute("/mobiles/")({
  head: () => ({
    meta: [
      { title: "Dashboard · Jain Mobiles ERP" },
      { name: "description", content: "Jain Mobiles shop management dashboard — stock status, purchase details, sales ledger and reporting." },
    ],
  }),
  component: MobilesDashboard,
});

function MobilesDashboard() {
  const products = useMobileStore((s) => s.products);
  const inventory = useMobileStore((s) => s.inventory);
  const sales = useMobileStore((s) => s.sales);
  const purchases = useMobileStore((s) => s.purchases);
  const customers = useMobileStore((s) => s.customers);
  const suppliers = useMobileStore((s) => s.suppliers);

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

  // Filters
  const filteredSales = sales.filter((s) => {
    if (filterPreset === "all") return true;
    const date = parseAppDate(s.date);
    return isDateInRange(date, startDate, endDate);
  });

  const filteredPurchases = purchases.filter((p) => {
    if (filterPreset === "all") return true;
    const date = parseAppDate(p.date);
    return isDateInRange(date, startDate, endDate);
  });

  const filteredCustomers = customers.filter((c) => {
    if (filterPreset === "all") return true;
    const date = parseAppDate(c.registeredDate);
    return isDateInRange(date, startDate, endDate);
  });

  // Clock
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateStr = now.toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  // Computed metrics
  const totalProducts = products.length;
  const availableStock = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockProducts = inventory.filter((item) => item.status === "Low Stock").length;
  const outOfStockProducts = inventory.filter((item) => item.status === "Out of Stock").length;
  
  // Calculate sales amounts
  const todayStr = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  
  const todaySalesVal = sales
    .filter((s) => s.date === todayStr)
    .reduce((sum, s) => sum + s.totalAmount, 0);
    
  const periodSalesVal = filteredSales.reduce((sum, s) => sum + s.totalAmount, 0);
  
  // Profit calculations in period
  const periodProfitVal = filteredSales.reduce((profit, sale) => {
    const items = safeItems(sale?.items);
    const saleItemsProfit = items.reduce((itemProfit, item) => {
      // Find purchase price of product
      const invItem = (inventory || []).find((i) => i.productId === item?.productId);
      const cost = invItem ? Number(invItem.purchasePrice || 0) : 0;
      return itemProfit + (Number(item?.price || 0) - cost) * Number(item?.quantity || 1);
    }, 0);
    return profit + saleItemsProfit;
  }, 0);

  const totalCustomers = filteredCustomers.length;
  const totalSuppliers = (suppliers || []).length;

  // Sales & Revenue Trend
  const salesRevenueTrend = (() => {
    const trend = [];
    const isSmallRange = startDate && endDate && ((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) <= 35);
    
    if (isSmallRange && startDate && endDate) {
      const daysCount = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const monthsList = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      
      for (let d = 0; d < daysCount; d++) {
        const dayDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + d);
        const dayStr = `${dayDate.getDate()} ${monthsList[dayDate.getMonth()]}`;
        
        const saleAmt = (sales || [])
          .filter((s) => {
            const sDate = parseAppDate(s.date);
            return sDate && sDate.toDateString() === dayDate.toDateString();
          })
          .reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);

        const purchaseAmt = (purchases || [])
          .filter((p) => {
            const pDate = parseAppDate(p.date);
            return pDate && pDate.toDateString() === dayDate.toDateString();
          })
          .reduce((sum, p) => sum + Number(p.amount || 0), 0);
          
        trend.push({ label: dayStr, sales: saleAmt, revenue: saleAmt, purchases: purchaseAmt });
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
        
        const saleAmt = (sales || [])
          .filter((s) => {
            const sDate = parseAppDate(s.date);
            return sDate && sDate >= monthStart && sDate <= monthEnd && isDateInRange(sDate, startDate, endDate);
          })
          .reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);

        const purchaseAmt = (purchases || [])
          .filter((p) => {
            const pDate = parseAppDate(p.date);
            return pDate && pDate >= monthStart && pDate <= monthEnd && isDateInRange(pDate, startDate, endDate);
          })
          .reduce((sum, p) => sum + Number(p.amount || 0), 0);
          
        trend.push({ label: monthLabel, sales: saleAmt, revenue: saleAmt, purchases: purchaseAmt });
      }
    }
    return trend;
  })();

  // Brand-wise Sales
  const brandSales = (() => {
    const brandMap: Record<string, number> = {};
    (filteredSales || []).forEach((sale) => {
      const items = safeItems(sale?.items);
      items.forEach((item) => {
        const prod = (products || []).find((p) => p.id === item?.productId);
        const brand = prod ? prod.brand : (item?.brand || "Other");
        brandMap[brand] = (brandMap[brand] || 0) + (Number(item?.price || 0) * Number(item?.quantity || 1));
      });
    });
    return Object.keys(brandMap).map((brand) => ({
      brand,
      sales: brandMap[brand]
    }));
  })();

  // Stock distribution by brand
  const brandStockDistribution = (() => {
    const stockMap: Record<string, number> = {};
    (inventory || []).forEach((item) => {
      if (item && item.brand) {
        stockMap[item.brand] = (stockMap[item.brand] || 0) + Number(item.quantity || 0);
      }
    });
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#6b7280"];
    return Object.keys(stockMap).map((brand, idx) => ({
      name: brand,
      value: stockMap[brand],
      color: colors[idx % colors.length]
    }));
  })();

  // Top selling products
  const topSelling = (() => {
    const prodMap: Record<string, { name: string; brand: string; qty: number; value: number }> = {};
    (filteredSales || []).forEach((sale) => {
      const items = safeItems(sale?.items);
      items.forEach((item) => {
        if (!item || !item.productId) return;
        if (!prodMap[item.productId]) {
          const p = (products || []).find((prod) => prod.id === item.productId);
          prodMap[item.productId] = {
            name: item.productName || p?.name || "Product",
            brand: p ? p.brand : (item.brand || ""),
            qty: 0,
            value: 0
          };
        }
        prodMap[item.productId].qty += Number(item.quantity || 1);
        prodMap[item.productId].value += Number(item.price || 0) * Number(item.quantity || 1);
      });
    });
    return Object.values(prodMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  })();


  const fmt = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

  return (
    <AppShell breadcrumb="Dashboard">
      {/* Welcome Row */}
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight leading-tight">
            {greeting}, Rajesh
          </h1>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
            {dateStr} · Jain Mobiles ERP Console
            <span className="inline-flex items-center gap-1 text-muted-foreground/60">
              <Clock className="size-3" />{timeStr}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              toast.success("Mobiles Dashboard Report exported successfully");
            }}
            className="h-9 px-3.5 rounded-md border border-border bg-surface text-sm inline-flex items-center gap-1.5 hover:bg-accent font-semibold transition-colors shadow-sm"
          >
            <FileDown className="size-3.5" /> Export Report
          </button>
        </div>
      </div>

      {/* Date Filter Bar */}
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

      {/* Key stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Products"
          value={totalProducts.toString()}
          sub="Catalog items"
          icon={<ShoppingBag className="size-4" />}
          trend="up"
        />
        <StatCard
          label="Available Stock"
          value={availableStock.toString()}
          sub={`${outOfStockProducts} Out of stock`}
          icon={<Box className="size-4" />}
          trend={lowStockProducts > 0 ? "warn" : "up"}
        />
        <StatCard
          label={filterPreset === "all" ? "Total Sales" : "Sales in Period"}
          value={fmt(periodSalesVal)}
          sub={`Today: ${fmt(todaySalesVal)}`}
          icon={<Receipt className="size-4" />}
          trend="up"
        />
        <StatCard
          label="Monthly Profit"
          value={fmt(periodProfitVal)}
          sub="Realized margin"
          icon={<Landmark className="size-4" />}
          trend={periodProfitVal > 0 ? "up" : "down"}
        />
      </div>

      {/* Secondary stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Low Stock Models" value={lowStockProducts.toString()} sub="Threshold limit reached" trend={lowStockProducts > 0 ? "warn" : undefined} />
        <StatCard label="Total Purchases" value={fmt(filteredPurchases.reduce((s, p) => s + p.amount, 0))} sub={`${filteredPurchases.length} supplier orders`} />
        <StatCard label="Active Customers" value={totalCustomers.toString()} sub="Registered mobile buyers" />
        <StatCard label="Active Suppliers" value={totalSuppliers.toString()} sub="Wholesalers & Distributors" />
      </div>

      {/* Alert Row if low stock exists */}
      {lowStockProducts > 0 && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-warning/45 bg-warning/5 px-4 py-3">
          <AlertTriangle className="size-4 text-warning shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-semibold text-warning">{lowStockProducts} products are running low on stock.</span>
            <span className="text-muted-foreground ml-1.5">
              Please review the inventory levels and create purchase orders to restock immediately.
            </span>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Sales & Revenue Trend Chart */}
        <Card className="lg:col-span-2">
          <SectionHeader
            title="Sales Trend"
            action={
              <span className="text-xs text-muted-foreground font-semibold">
                {filterPreset === "all" ? "All Time Sales & Cost" : "Selected Period Trend"}
              </span>
            }
          />
          <div className="px-5 pb-5">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={salesRevenueTrend} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gsales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.62 0.15 160)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="oklch(0.62 0.15 160)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gpur" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.78 0.16 70)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="oklch(0.78 0.16 70)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(v: number) => [fmt(v), ""]} contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="sales" stroke="oklch(0.62 0.15 160)" strokeWidth={2} fill="url(#gsales)" name="Sales Revenue" />
                <Area type="monotone" dataKey="purchases" stroke="oklch(0.78 0.16 70)" strokeWidth={2} fill="url(#gpur)" name="Inventory Purchase" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Brand breakdown */}
        <Card>
          <SectionHeader title="Brand-wise Sales" />
          <div className="px-5 pb-5">
            {brandSales.length === 0 ? (
              <div className="h-[220px] flex items-center justify-center text-xs text-muted-foreground">
                No brand sales recorded in this period.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={brandSales} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="brand" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: number) => [fmt(v), "Sales"]} contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="sales" fill="oklch(0.22 0.012 60)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      {/* Bottom panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <Card>
          <SectionHeader title="Top Selling Products" action={
            <Badge tone="success">Fast Moving</Badge>
          } />
          <ul className="divide-y divide-border">
            {topSelling.length === 0 ? (
              <li className="px-5 py-8 text-center text-sm text-muted-foreground font-medium">
                No sales data recorded yet.
              </li>
            ) : (
              topSelling.map((ts, idx) => (
                <li key={idx} className="px-5 py-3 flex items-center gap-3">
                  <div className="size-9 rounded-lg bg-muted text-foreground font-bold text-xs grid place-items-center shrink-0">
                    #{idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{ts.name}</div>
                    <div className="text-xs text-muted-foreground">{ts.brand}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold">{ts.qty} units</div>
                    <div className="text-xs text-muted-foreground font-semibold">{fmt(ts.value)}</div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </Card>

        {/* Stock Distribution by Brand */}
        <Card>
          <SectionHeader title="Brand-wise Stock Distribution" />
          <div className="px-5 pb-4 space-y-4 pt-2">
            {brandStockDistribution.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No inventory stock recorded.
              </div>
            ) : (
              brandStockDistribution.map((row) => (
                <div key={row.name}>
                  <div className="flex items-center justify-between mb-1.5 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full" style={{ backgroundColor: row.color }} />
                      <span className="font-semibold text-xs text-foreground/80">{row.name}</span>
                    </div>
                    <span className="font-medium text-xs">{row.value} units</span>
                  </div>
                  <ProgressBar value={availableStock > 0 ? (row.value / availableStock) * 100 : 0} color={row.color} />
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
