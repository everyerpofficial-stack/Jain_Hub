import { useState, useMemo } from "react";
import {
  TrendingUp, TrendingDown, Wallet, IndianRupee,
  Smartphone, Building, BarChart3, AlertCircle, ArrowUpRight, ArrowDownRight, Search, Activity, Download, FileText
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  AreaChart, Area
} from "recharts";
import { toast } from "sonner";
import { Card, SectionHeader, StatCard, Badge } from "@/components/ui-kit";
import { useStore, parseAppDate, parseAmount, isDateInRange, downloadExcel, downloadLedgerPDF } from "@/lib/store";
import { splitByMethod, toOptionalNumber } from "@/lib/ledger";
import { useMobileStore } from "@/lib/mobileStore";
import { FilterBar, useDateFilter } from "@/components/FilterBar";

// Format helper
const fmt = (num: number) => `₹${Math.round(num).toLocaleString("en-IN")}`;
const fmtSigned = (num: number) => {
  const rounded = Math.round(num);
  const absStr = Math.abs(rounded).toLocaleString("en-IN");
  return `${rounded < 0 ? "-" : rounded > 0 ? "+" : ""}₹${absStr}`;
};

interface CashFlowItem {
  id: string;
  date: string;
  dateObj: Date | null;
  module: "Finance" | "Mobiles";
  type: "Inflow" | "Outflow";
  category: string;
  description: string;
  amount: number;
  method: "Cash" | "UPI";
}


export function CashFlowDashboard() {
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

  const [activeTab, setActiveTab] = useState<"Combined" | "Finance" | "Mobiles">("Combined");
  const [methodFilter, setMethodFilter] = useState<"All" | "Cash" | "UPI">("All");
  const [typeFilter, setTypeFilter] = useState<"All" | "Inflow" | "Outflow">("All");
  const [searchQuery, setSearchQuery] = useState("");

  // --- 1. Load Stores ---
  // Finance store
  const fCustomers = useStore((s) => s.customers);
  const fPayments = useStore((s) => s.payments);
  const fExpenses = useStore((s) => s.expenses);
  const fInvestments = useStore((s) => s.investments);

  // Mobiles store
  const mSales = useMobileStore((s) => s.sales);
  const mExpenses = useMobileStore((s) => s.expenses);
  const mPurchases = useMobileStore((s) => s.purchases);
  const mSupplierPayments = useMobileStore((s) => s.supplierPayments);

  // --- 2. Calculate Finance Cash Flow Items ---
  const financeItems = useMemo(() => {
    const items: CashFlowItem[] = [];

    // Customer Down payments (Inflow)
    fCustomers.forEach((c) => {
      if (c.deposit > 0) {
        const dObj = parseAppDate(c.billDate);
        items.push({
          id: `F-DEP-${c.id}`,
          date: c.billDate,
          dateObj: dObj,
          module: "Finance",
          type: "Inflow",
          category: "Down Payment",
          description: `Down payment deposit for EMI scheme of ${c.name}`,
          amount: c.deposit,
          method: "Cash", // Down payments are Cash by default
        });
      }

      // Finance disbursement outflow: principal financed (c.price - c.deposit)
      const principal = c.price - c.deposit;
      if (principal > 0) {
        const dObj = parseAppDate(c.billDate);
        items.push({
          id: `F-DISB-${c.id}`,
          date: c.billDate,
          dateObj: dObj,
          module: "Finance",
          type: "Outflow",
          category: "Loan Disbursal",
          description: `Disbursement of micro-loan principal for ${c.name}`,
          amount: principal,
          method: "UPI", // Deployed via bank transfer
        });
      }
    });

    // EMI Collections (Inflow)
    // "Bank" behaves like "UPI" here (both are non-cash/bank-routed funds).
    // "Cash & Bank" is a genuine split and must contribute to BOTH buckets —
    // bucketing it entirely as Cash (as this used to do) overstated cash-in-hand
    // and understated bank balance for every split payment.
    fPayments.forEach((p) => {
      if (p.status === "Success") {
        const amt = parseAmount(p.amount);
        if (amt > 0) {
          const dObj = parseAppDate(p.date);
          if (p.method === "Cash & Bank") {
            const cashPart = p.cashAmount ?? Math.floor(amt / 2);
            const bankPart = p.bankAmount ?? (amt - cashPart);
            if (cashPart > 0) {
              items.push({
                id: `F-EMI-${p.id}-CASH`, date: p.date, dateObj: dObj, module: "Finance", type: "Inflow",
                category: "EMI Collection", description: `EMI Payment collection (Cash portion) - ${p.customer}`,
                amount: cashPart, method: "Cash",
              });
            }
            if (bankPart > 0) {
              items.push({
                id: `F-EMI-${p.id}-BANK`, date: p.date, dateObj: dObj, module: "Finance", type: "Inflow",
                category: "EMI Collection", description: `EMI Payment collection (Bank portion) - ${p.customer}`,
                amount: bankPart, method: "UPI",
              });
            }
          } else {
            items.push({
              id: `F-EMI-${p.id}`,
              date: p.date,
              dateObj: dObj,
              module: "Finance",
              type: "Inflow",
              category: "EMI Collection",
              description: `EMI Payment collection - ${p.customer}`,
              amount: amt,
              method: p.method === "Cash" ? "Cash" : "UPI",
            });
          }
        }
      }
    });

    // Income & Expenses (Inflow / Outflow)
    // "Bank" behaves like "UPI" (non-cash). Expenses don't capture a
    // cash/bank split the way EMI Payments do, so an unsplit "Cash & Bank"
    // entry is divided evenly between both buckets — the same 50/50
    // fallback the Mobiles module already uses for its own unsplit
    // "Cash & UPI" sales (see mobiles/sales.tsx) — rather than dumping the
    // full amount into one bucket, which would misstate cash-in-hand.
    fExpenses.forEach((e) => {
      const amt = parseAmount(e.amount);
      if (amt > 0) {
        const dObj = parseAppDate(e.date);
        const type = e.type === "Income" ? "Inflow" : "Outflow";
        if (e.method === "Cash & Bank") {
          const cashPart = Math.floor(amt / 2);
          const bankPart = amt - cashPart;
          if (cashPart > 0) {
            items.push({
              id: `F-EXP-${e.id}-CASH`, date: e.date, dateObj: dObj, module: "Finance", type,
              category: e.cat, description: `${e.desc} (Cash portion)`, amount: cashPart, method: "Cash",
            });
          }
          if (bankPart > 0) {
            items.push({
              id: `F-EXP-${e.id}-BANK`, date: e.date, dateObj: dObj, module: "Finance", type,
              category: e.cat, description: `${e.desc} (Bank portion)`, amount: bankPart, method: "UPI",
            });
          }
        } else {
          items.push({
            id: `F-EXP-${e.id}`,
            date: e.date,
            dateObj: dObj,
            module: "Finance",
            type,
            category: e.cat,
            description: e.desc,
            amount: amt,
            method: e.method === "Cash" || !e.method ? "Cash" : "UPI",
          });
        }
      }
    });

    // Investments (Inflow)
    fInvestments.forEach((i) => {
      const amt = parseAmount(i.amount);
      if (amt > 0) {
        const dObj = parseAppDate(i.date || "");
        const date = i.date || "01 Jun 2026";
        if (i.method === "Cash & Bank") {
          const cashPart = Math.floor(amt / 2);
          const bankPart = amt - cashPart;
          if (cashPart > 0) {
            items.push({
              id: `F-INV-${i.id}-CASH`, date, dateObj: dObj, module: "Finance", type: "Inflow",
              category: "Capital Investment", description: `Capital deployed by investor: ${i.investor} (Cash portion)`,
              amount: cashPart, method: "Cash",
            });
          }
          if (bankPart > 0) {
            items.push({
              id: `F-INV-${i.id}-BANK`, date, dateObj: dObj, module: "Finance", type: "Inflow",
              category: "Capital Investment", description: `Capital deployed by investor: ${i.investor} (Bank portion)`,
              amount: bankPart, method: "UPI",
            });
          }
        } else {
          items.push({
            id: `F-INV-${i.id}`,
            date,
            dateObj: dObj,
            module: "Finance",
            type: "Inflow",
            category: "Capital Investment",
            description: `Capital deployed by investor: ${i.investor}`,
            amount: amt,
            method: i.method === "Cash" ? "Cash" : "UPI",
          });
        }
      }
    });

    return items;
  }, [fCustomers, fPayments, fExpenses, fInvestments]);

  // --- 3. Calculate Mobiles Cash Flow Items ---
  const mobilesItems = useMemo(() => {
    const items: CashFlowItem[] = [];

    // Device sales bills (Inflow)
    mSales.forEach((s) => {
      const dObj = parseAppDate(s.date);
      
      // Only money actually RECEIVED is an inflow. The old fallback used
      // s.totalAmount, so a partly-paid bill booked its full value as cash;
      // and a blank cashAmountPaid coming back from Sheets ("") passed the
      // `!== undefined` test and then failed `> 0`, dropping the row entirely.
      const received = Number(s.amountPaid) || 0;
      const storedCash = toOptionalNumber(s.cashAmountPaid);
      const storedUpi = toOptionalNumber(s.upiAmountPaid);
      const hasStoredSplit = storedCash !== undefined || storedUpi !== undefined;
      const fallback = splitByMethod(s.paymentMethod, received);
      const cashAmt = hasStoredSplit
        ? (storedCash ?? Math.max(0, received - (storedUpi ?? 0)))
        : fallback.cash;
      
      if (cashAmt > 0) {
        items.push({
          id: `M-SALECASH-${s.id}`,
          date: s.date,
          dateObj: dObj,
          module: "Mobiles",
          type: "Inflow",
          category: "Device Sales (Cash)",
          description: `Cash sales bill ${s.id} - ${s.customerName}`,
          amount: cashAmt,
          method: "Cash",
        });
      }

      const upiAmt = hasStoredSplit
        ? (storedUpi ?? Math.max(0, received - cashAmt))
        : fallback.bank;
      
      if (upiAmt > 0) {
        items.push({
          id: `M-SALEUPI-${s.id}`,
          date: s.date,
          dateObj: dObj,
          module: "Mobiles",
          type: "Inflow",
          category: "Device Sales (UPI)",
          description: `UPI sales bill ${s.id} - ${s.customerName}`,
          amount: upiAmt,
          method: "UPI",
        });
      }
    });

    // Mobile Expenses & Accessory Income (Inflow / Outflow)
    mExpenses.forEach((e) => {
      const amt = parseAmount(e.amount);
      if (amt > 0) {
        const dObj = parseAppDate(e.date);
        const isInflow = e.type === "Income";
        const flowType = isInflow ? "Inflow" : "Outflow";

        if (e.paymentMode === "Cash & UPI" || e.paymentMode === "Cash & Bank") {
          const cashPart = e.cashAmount !== undefined ? e.cashAmount : Math.floor(amt / 2);
          const bankPart = e.bankAmount !== undefined ? e.bankAmount : (amt - cashPart);
          
          if (cashPart > 0) {
            items.push({
              id: `M-EXP-${e.id}-CASH`,
              date: e.date,
              dateObj: dObj,
              module: "Mobiles",
              type: flowType,
              category: e.cat,
              description: `${e.desc} (Cash portion)`,
              amount: cashPart,
              method: "Cash",
            });
          }
          if (bankPart > 0) {
            items.push({
              id: `M-EXP-${e.id}-BANK`,
              date: e.date,
              dateObj: dObj,
              module: "Mobiles",
              type: flowType,
              category: e.cat,
              description: `${e.desc} (UPI/Bank portion)`,
              amount: bankPart,
              method: "UPI",
            });
          }
        } else {
          items.push({
            id: `M-EXP-${e.id}`,
            date: e.date,
            dateObj: dObj,
            module: "Mobiles",
            type: flowType,
            category: e.cat,
            description: e.desc,
            amount: amt,
            method: e.paymentMode === "Cash" ? "Cash" : "UPI",
          });
        }
      }
    });

    // Mobile Purchases immediately paid (Outflow)
    mPurchases.forEach((p) => {
      if (p.status === "Paid") {
        const dObj = parseAppDate(p.date);
        const { cash, bank } = splitByMethod(p.paymentMode, p.amount, p.cashAmount, p.bankAmount);
        const split = cash > 0 && bank > 0;
        if (cash > 0) {
          items.push({
            id: `M-PUR-${p.id}-CASH`,
            date: p.date,
            dateObj: dObj,
            module: "Mobiles",
            type: "Outflow",
            category: "Stock Purchase",
            description: `Purchase Invoice ${p.invoiceNo} from ${p.supplierName}${split ? " (Cash portion)" : ""}`,
            amount: cash,
            method: "Cash",
          });
        }
        if (bank > 0) {
          items.push({
            id: `M-PUR-${p.id}-BANK`,
            date: p.date,
            dateObj: dObj,
            module: "Mobiles",
            type: "Outflow",
            category: "Stock Purchase",
            description: `Purchase Invoice ${p.invoiceNo} from ${p.supplierName}${split ? " (UPI/Bank portion)" : ""}`,
            amount: bank,
            method: "UPI",
          });
        }
      }
    });

    // Mobile Supplier payments for outstanding debt (Outflow)
    mSupplierPayments.forEach((sp) => {
      const dObj = parseAppDate(sp.date);
      const { cash, bank } = splitByMethod(sp.paymentMode, sp.amount, sp.cashAmount, sp.bankAmount);
      const split = cash > 0 && bank > 0;
      if (cash > 0) {
        items.push({
          id: `M-SUPP-${sp.id}-CASH`,
          date: sp.date,
          dateObj: dObj,
          module: "Mobiles",
          type: "Outflow",
          category: "Supplier Payment",
          description: `Paid outstanding balance to vendor: ${sp.supplierName}${split ? " (Cash portion)" : ""}`,
          amount: cash,
          method: "Cash",
        });
      }
      if (bank > 0) {
        items.push({
          id: `M-SUPP-${sp.id}-BANK`,
          date: sp.date,
          dateObj: dObj,
          module: "Mobiles",
          type: "Outflow",
          category: "Supplier Payment",
          description: `Paid outstanding balance to vendor: ${sp.supplierName}${split ? " (UPI/Bank portion)" : ""}`,
          amount: bank,
          method: "UPI",
        });
      }
    });

    return items;
  }, [mSales, mExpenses, mPurchases, mSupplierPayments]);

  // --- 4. Filtering by Date Range & Tab ---
  const activeRawItems = useMemo(() => {
    let list: CashFlowItem[] = [];
    if (activeTab === "Combined" || activeTab === "Finance") {
      list = list.concat(financeItems);
    }
    if (activeTab === "Combined" || activeTab === "Mobiles") {
      list = list.concat(mobilesItems);
    }

    // Filter by Date
    return list.filter((item) => {
      if (filterPreset === "all") return true;
      return isDateInRange(item.dateObj, startDate, endDate);
    });
  }, [activeTab, financeItems, mobilesItems, filterPreset, startDate, endDate]);

  // --- 5. Inflow/Outflow calculations & Breakdown ---
  const breakdownStats = useMemo(() => {
    const filterItems = (items: CashFlowItem[]) => {
      return items.filter((item) => {
        if (filterPreset === "all") return true;
        return isDateInRange(item.dateObj, startDate, endDate);
      });
    };

    const calc = (items: CashFlowItem[]) => {
      let cashIn = 0;
      let cashOut = 0;
      let bankIn = 0;
      let bankOut = 0;

      items.forEach((item) => {
        if (item.type === "Inflow") {
          if (item.method === "Cash") cashIn += item.amount;
          else bankIn += item.amount;
        } else {
          if (item.method === "Cash") cashOut += item.amount;
          else bankOut += item.amount;
        }
      });

      const netCash = cashIn - cashOut;
      const netBank = bankIn - bankOut;
      const totalInflow = cashIn + bankIn;
      const totalOutflow = cashOut + bankOut;
      const netConsolidated = totalInflow - totalOutflow;

      return {
        cashIn,
        cashOut,
        bankIn,
        bankOut,
        netCash,
        netBank,
        totalInflow,
        totalOutflow,
        netConsolidated,
      };
    };

    const finance = calc(filterItems(financeItems));
    const mobiles = calc(filterItems(mobilesItems));

    const combined = {
      cashIn: finance.cashIn + mobiles.cashIn,
      cashOut: finance.cashOut + mobiles.cashOut,
      bankIn: finance.bankIn + mobiles.bankIn,
      bankOut: finance.bankOut + mobiles.bankOut,
      netCash: finance.netCash + mobiles.netCash,
      netBank: finance.netBank + mobiles.netBank,
      totalInflow: finance.totalInflow + mobiles.totalInflow,
      totalOutflow: finance.totalOutflow + mobiles.totalOutflow,
      netConsolidated: finance.netConsolidated + mobiles.netConsolidated,
    };

    return {
      Finance: finance,
      Mobiles: mobiles,
      Combined: combined,
    };
  }, [financeItems, mobilesItems, filterPreset, startDate, endDate]);

  const stats = useMemo(() => {
    if (activeTab === "Finance") return breakdownStats.Finance;
    if (activeTab === "Mobiles") return breakdownStats.Mobiles;
    return breakdownStats.Combined;
  }, [activeTab, breakdownStats]);

  // --- 6. Table Search & Filtering ---
  const filteredTableItems = useMemo(() => {
    return activeRawItems.filter((item) => {
      const matchesSearch =
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesMethod = methodFilter === "All" || item.method === methodFilter;
      const matchesType = typeFilter === "All" || item.type === typeFilter;

      return matchesSearch && matchesMethod && matchesType;
    }).sort((a, b) => {
      const timeA = a.dateObj ? a.dateObj.getTime() : 0;
      const timeB = b.dateObj ? b.dateObj.getTime() : 0;
      return timeB - timeA; // Descending order of date
    });
  }, [activeRawItems, searchQuery, methodFilter, typeFilter]);

  // --- 7. Chart Data Calculation ---
  const chartData = useMemo(() => {
    const dailyMap: Record<string, { dateStr: string; cashIn: number; cashOut: number; bankIn: number; bankOut: number; dateObj: Date }> = {};
    
    activeRawItems.forEach((item) => {
      const dateLabel = item.date;
      if (!dailyMap[dateLabel]) {
        dailyMap[dateLabel] = {
          dateStr: dateLabel,
          cashIn: 0,
          cashOut: 0,
          bankIn: 0,
          bankOut: 0,
          dateObj: item.dateObj || new Date(),
        };
      }

      if (item.type === "Inflow") {
        if (item.method === "Cash") dailyMap[dateLabel].cashIn += item.amount;
        else dailyMap[dateLabel].bankIn += item.amount;
      } else {
        if (item.method === "Cash") dailyMap[dateLabel].cashOut += item.amount;
        else dailyMap[dateLabel].bankOut += item.amount;
      }
    });

    return Object.values(dailyMap)
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
      .map((d) => ({
        name: d.dateStr,
        "Cash Inflow": d.cashIn,
        "Cash Outflow": d.cashOut,
        "Bank Inflow": d.bankIn,
        "Bank Outflow": d.bankOut,
        "Net Cash": d.cashIn - d.cashOut,
        "Net Bank": d.bankIn - d.bankOut,
        "Total Net": (d.cashIn + d.bankIn) - (d.cashOut + d.bankOut),
      }));
  }, [activeRawItems]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Activity className="size-6 text-primary" />
            <span>Cash & Bank Flow Dashboard</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Consolidated cash drawer and bank account statements for Finance and Mobiles modules.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              downloadExcel(`cashflow-${activeTab.toLowerCase()}.xlsx`, `Cash Flow Ledger (${activeTab})`, activeRawItems.map((item) => ({
                Reference: item.id,
                Date: item.date,
                Module: item.module,
                Type: item.type,
                "Payment Method": item.method,
                Category: item.category,
                Description: item.description,
                "Amount (₹)": item.amount,
              })));
              toast.success(`Exported ${activeTab} cash flow ledger to Excel`);
            }}
            className="h-9 px-3.5 rounded-md border border-border bg-surface text-sm inline-flex items-center gap-1.5 hover:bg-accent font-semibold transition-colors shadow-sm cursor-pointer"
          >
            <Download className="size-3.5" /> Export Excel
          </button>

          <button
            onClick={() => {
              const totalInc = activeRawItems.filter((i) => i.type === "Inflow").reduce((sum, i) => sum + i.amount, 0);
              const totalExp = activeRawItems.filter((i) => i.type === "Outflow").reduce((sum, i) => sum + i.amount, 0);
              const presetLabels: Record<string, string> = {
                all: "All Time",
                today: "Today",
                "this-month": "This Month",
                "next-month": "Next Month",
                custom: "Custom Range",
              };
              downloadLedgerPDF({
                title: `Cash Flow Statement (${activeTab})`,
                companyName: "Jain Finance & Mobiles",
                totalIncome: totalInc,
                totalExpenses: totalExp,
                netBalance: totalInc - totalExp,
                periodLabel: presetLabels[filterPreset] || "All Time",
                entries: activeRawItems.map((item) => ({
                  id: item.id,
                  date: item.date,
                  type: item.type === "Inflow" ? "Income" : "Expense",
                  paymentMode: item.method,
                  cat: `[${item.module}] ${item.category}`,
                  desc: item.description,
                  amount: item.amount,
                })),
              });
            }}
            className="h-9 px-3.5 rounded-md border border-border bg-surface text-sm inline-flex items-center gap-1.5 hover:bg-accent font-semibold transition-colors shadow-sm cursor-pointer"
          >
            <FileText className="size-3.5 text-rose-500" /> Export PDF
          </button>

          {/* Tab Selector */}
          <div className="flex bg-muted/60 border border-border p-1 rounded-xl shadow-inner shrink-0">
            {(["Combined", "Finance", "Mobiles"] as const).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? "bg-background text-foreground shadow-md scale-[1.02]"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/20"
                  }`}
                >
                  {tab === "Combined" && <Activity className="size-3.5 text-primary" />}
                  {tab === "Finance" && <Building className="size-3.5 text-success" />}
                  {tab === "Mobiles" && <Smartphone className="size-3.5 text-info" />}
                  <span>{tab}</span>
                </button>
              );
            })}
          </div>
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

      {/* Overview Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="p-4 border-l-4 border-l-success flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Cash Inflow</span>
            <div className="bg-success/15 p-1 rounded">
              <TrendingUp className="size-4 text-success" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg font-extrabold text-foreground">{fmt(stats.cashIn)}</div>
            {activeTab === "Combined" && (
              <div className="text-[9px] font-mono text-muted-foreground/80 mt-0.5 truncate" title={`Jain Finance: ${fmt(breakdownStats.Finance.cashIn)} + Jain Mobiles: ${fmt(breakdownStats.Mobiles.cashIn)}`}>
                {fmt(breakdownStats.Finance.cashIn)} (Fin) + {fmt(breakdownStats.Mobiles.cashIn)} (Mob)
              </div>
            )}
            <p className="text-[10px] text-muted-foreground mt-0.5">Total physically received cash</p>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-info flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Bank Inflow (UPI)</span>
            <div className="bg-info/15 p-1 rounded">
              <TrendingUp className="size-4 text-info" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg font-extrabold text-foreground">{fmt(stats.bankIn)}</div>
            {activeTab === "Combined" && (
              <div className="text-[9px] font-mono text-muted-foreground/80 mt-0.5 truncate" title={`Jain Finance: ${fmt(breakdownStats.Finance.bankIn)} + Jain Mobiles: ${fmt(breakdownStats.Mobiles.bankIn)}`}>
                {fmt(breakdownStats.Finance.bankIn)} (Fin) + {fmt(breakdownStats.Mobiles.bankIn)} (Mob)
              </div>
            )}
            <p className="text-[10px] text-muted-foreground mt-0.5">UPI/Bank deposit entries</p>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-danger flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Outflows</span>
            <div className="bg-danger/15 p-1 rounded">
              <TrendingDown className="size-4 text-danger" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg font-extrabold text-foreground">{fmt(stats.totalOutflow)}</div>
            {activeTab === "Combined" && (
              <div className="text-[9px] font-mono text-muted-foreground/80 mt-0.5 truncate" title={`Jain Finance: ${fmt(breakdownStats.Finance.totalOutflow)} + Jain Mobiles: ${fmt(breakdownStats.Mobiles.totalOutflow)}`}>
                {fmt(breakdownStats.Finance.totalOutflow)} (Fin) + {fmt(breakdownStats.Mobiles.totalOutflow)} (Mob)
              </div>
            )}
            <p className="text-[10px] text-muted-foreground mt-0.5">Cash + bank payouts</p>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-warning flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Net Cash Flow</span>
            <div className="bg-warning/15 p-1 rounded">
              <Wallet className="size-4 text-warning" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-lg font-extrabold ${stats.netCash >= 0 ? "text-success" : "text-danger"}`}>
              {stats.netCash >= 0 ? "+" : ""}{fmt(stats.netCash)}
            </div>
            {activeTab === "Combined" && (
              <div className="text-[9px] font-mono text-muted-foreground/80 mt-0.5 truncate" title={`Jain Finance: ${fmtSigned(breakdownStats.Finance.netCash)} | Jain Mobiles: ${fmtSigned(breakdownStats.Mobiles.netCash)}`}>
                {fmtSigned(breakdownStats.Finance.netCash)} (Fin) | {fmtSigned(breakdownStats.Mobiles.netCash)} (Mob)
              </div>
            )}
            <p className="text-[10px] text-muted-foreground mt-0.5">Physical cash drawer balance</p>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-[oklch(0.62_0.14_250)] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Net Bank Flow</span>
            <div className="bg-info/15 p-1 rounded">
              <Wallet className="size-4 text-info" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-lg font-extrabold ${stats.netBank >= 0 ? "text-success" : "text-danger"}`}>
              {stats.netBank >= 0 ? "+" : ""}{fmt(stats.netBank)}
            </div>
            {activeTab === "Combined" && (
              <div className="text-[9px] font-mono text-muted-foreground/80 mt-0.5 truncate" title={`Jain Finance: ${fmtSigned(breakdownStats.Finance.netBank)} | Jain Mobiles: ${fmtSigned(breakdownStats.Mobiles.netBank)}`}>
                {fmtSigned(breakdownStats.Finance.netBank)} (Fin) | {fmtSigned(breakdownStats.Mobiles.netBank)} (Mob)
              </div>
            )}
            <p className="text-[10px] text-muted-foreground mt-0.5">Bank ledger balance change</p>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-primary flex flex-col justify-between bg-primary/[0.02]">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Net Consolidated</span>
            <div className="bg-primary/10 p-1.5 rounded-lg">
              <IndianRupee className="size-4 text-primary" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-xl font-black ${stats.netConsolidated >= 0 ? "text-success" : "text-danger"}`}>
              {stats.netConsolidated >= 0 ? "+" : ""}{fmt(stats.netConsolidated)}
            </div>
            {activeTab === "Combined" && (
              <div className="text-[9px] font-mono text-muted-foreground/80 mt-0.5 truncate" title={`Jain Finance: ${fmtSigned(breakdownStats.Finance.netConsolidated)} | Jain Mobiles: ${fmtSigned(breakdownStats.Mobiles.netConsolidated)}`}>
                {fmtSigned(breakdownStats.Finance.netConsolidated)} (Fin) | {fmtSigned(breakdownStats.Mobiles.netConsolidated)} (Mob)
              </div>
            )}
            <p className="text-[10px] text-muted-foreground mt-0.5">Grand total net balance flow</p>
          </div>
        </Card>
      </div>

      {/* Module-wise Flow Integration & Reconciliation Table */}
      {activeTab === "Combined" && (
        <Card className="p-5 border-l-4 border-l-primary bg-primary/[0.01]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <SectionHeader
              title="Module-wise Flow Integration & Reconciliation"
              description="Mathematical addition and audit checklist of Cash & Bank flows from Jain Finance and Jain Mobiles modules."
            />
          </div>

          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-xs min-w-[600px]">
              <thead className="bg-muted/40 border-b border-border text-[10px] uppercase font-extrabold tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-3 w-1/3">Transaction Flow Metric</th>
                  <th className="p-3 text-success">
                    <div className="flex items-center gap-1.5">
                      <Building className="size-3.5" />
                      <span>Jain Finance</span>
                    </div>
                  </th>
                  <th className="p-3 text-info">
                    <div className="flex items-center gap-1.5">
                      <Smartphone className="size-3.5" />
                      <span>Jain Mobiles</span>
                    </div>
                  </th>
                  <th className="p-3 text-primary">
                    <div className="flex items-center gap-1.5">
                      <Activity className="size-3.5" />
                      <span>Consolidated Sum (Addition)</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-medium">
                {/* Inflows */}
                <tr className="bg-muted/10 font-bold text-muted-foreground text-[10px] uppercase tracking-wider">
                  <td colSpan={4} className="p-2 pl-3">Inflows (Receipts)</td>
                </tr>
                <tr className="hover:bg-accent/25 transition-colors">
                  <td className="p-3 text-foreground pl-6">Cash Inflow</td>
                  <td className="p-3 text-foreground">{fmt(breakdownStats.Finance.cashIn)}</td>
                  <td className="p-3 text-foreground">{fmt(breakdownStats.Mobiles.cashIn)}</td>
                  <td className="p-3 font-bold text-success bg-success/5">{fmt(breakdownStats.Combined.cashIn)}</td>
                </tr>
                <tr className="hover:bg-accent/25 transition-colors">
                  <td className="p-3 text-foreground pl-6">Bank Inflow (UPI)</td>
                  <td className="p-3 text-foreground">{fmt(breakdownStats.Finance.bankIn)}</td>
                  <td className="p-3 text-foreground">{fmt(breakdownStats.Mobiles.bankIn)}</td>
                  <td className="p-3 font-bold text-success bg-success/5">{fmt(breakdownStats.Combined.bankIn)}</td>
                </tr>
                <tr className="bg-success/5 font-semibold">
                  <td className="p-3 text-foreground pl-6">Total Inflow</td>
                  <td className="p-3 text-foreground">{fmt(breakdownStats.Finance.totalInflow)}</td>
                  <td className="p-3 text-foreground">{fmt(breakdownStats.Mobiles.totalInflow)}</td>
                  <td className="p-3 font-extrabold text-success bg-success/10">{fmt(breakdownStats.Combined.totalInflow)}</td>
                </tr>

                {/* Outflows */}
                <tr className="bg-muted/10 font-bold text-muted-foreground text-[10px] uppercase tracking-wider">
                  <td colSpan={4} className="p-2 pl-3">Outflows (Payments)</td>
                </tr>
                <tr className="hover:bg-accent/25 transition-colors">
                  <td className="p-3 text-foreground pl-6">Cash Outflow</td>
                  <td className="p-3 text-foreground">{fmt(breakdownStats.Finance.cashOut)}</td>
                  <td className="p-3 text-foreground">{fmt(breakdownStats.Mobiles.cashOut)}</td>
                  <td className="p-3 font-bold text-danger bg-danger/5">{fmt(breakdownStats.Combined.cashOut)}</td>
                </tr>
                <tr className="hover:bg-accent/25 transition-colors">
                  <td className="p-3 text-foreground pl-6">Bank Outflow (UPI)</td>
                  <td className="p-3 text-foreground">{fmt(breakdownStats.Finance.bankOut)}</td>
                  <td className="p-3 text-foreground">{fmt(breakdownStats.Mobiles.bankOut)}</td>
                  <td className="p-3 font-bold text-danger bg-danger/5">{fmt(breakdownStats.Combined.bankOut)}</td>
                </tr>
                <tr className="bg-danger/5 font-semibold">
                  <td className="p-3 text-foreground pl-6">Total Outflow</td>
                  <td className="p-3 text-foreground">{fmt(breakdownStats.Finance.totalOutflow)}</td>
                  <td className="p-3 text-foreground">{fmt(breakdownStats.Mobiles.totalOutflow)}</td>
                  <td className="p-3 font-extrabold text-danger bg-danger/10">{fmt(breakdownStats.Combined.totalOutflow)}</td>
                </tr>

                {/* Net Balances */}
                <tr className="bg-muted/10 font-bold text-muted-foreground text-[10px] uppercase tracking-wider">
                  <td colSpan={4} className="p-2 pl-3">Net Balance Flow (Inflow − Outflow)</td>
                </tr>
                <tr className="hover:bg-accent/25 transition-colors">
                  <td className="p-3 text-foreground pl-6">Net Cash Flow (Drawer)</td>
                  <td className="p-3 text-foreground">{fmtSigned(breakdownStats.Finance.netCash)}</td>
                  <td className="p-3 text-foreground">{fmtSigned(breakdownStats.Mobiles.netCash)}</td>
                  <td className="p-3 font-bold text-foreground bg-muted/40">{fmtSigned(breakdownStats.Combined.netCash)}</td>
                </tr>
                <tr className="hover:bg-accent/25 transition-colors">
                  <td className="p-3 text-foreground pl-6">Net Bank Flow (Account)</td>
                  <td className="p-3 text-foreground">{fmtSigned(breakdownStats.Finance.netBank)}</td>
                  <td className="p-3 text-foreground">{fmtSigned(breakdownStats.Mobiles.netBank)}</td>
                  <td className="p-3 font-bold text-foreground bg-muted/40">{fmtSigned(breakdownStats.Combined.netBank)}</td>
                </tr>
                <tr className="bg-primary/5 font-bold text-sm">
                  <td className="p-3 text-primary uppercase tracking-wide">Net Consolidated (Grand Total)</td>
                  <td className="p-3 text-foreground">{fmtSigned(breakdownStats.Finance.netConsolidated)}</td>
                  <td className="p-3 text-foreground">{fmtSigned(breakdownStats.Mobiles.netConsolidated)}</td>
                  <td className="p-3 font-black text-primary bg-primary/10">{fmtSigned(breakdownStats.Combined.netConsolidated)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Chart Section */}
      <Card className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <SectionHeader
            title="Consolidated Flows (Cash vs Bank)"
            description="Daily cash inflow, bank deposits, and outflows tracking over time."
          />
        </div>
        
        {chartData.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-muted-foreground border border-dashed border-border rounded-xl">
            <AlertCircle className="size-8 text-muted-foreground/60 mb-2" />
            <p className="text-sm">No transaction flow data available for this range</p>
          </div>
        ) : (
          <div className="h-80 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: any) => [fmt(Number(value)), ""]}
                  contentStyle={{
                    backgroundColor: "var(--background)",
                    borderColor: "var(--border)",
                    borderRadius: "0.75rem",
                    fontSize: "12px",
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                <Bar dataKey="Cash Inflow" fill="var(--success)" radius={[4, 4, 0, 0]} maxBarSize={30} />
                <Bar dataKey="Bank Inflow" fill="var(--info)" radius={[4, 4, 0, 0]} maxBarSize={30} />
                <Bar dataKey="Cash Outflow" fill="var(--warning)" radius={[4, 4, 0, 0]} maxBarSize={30} />
                <Bar dataKey="Bank Outflow" fill="var(--danger)" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Ledger Log Section */}
      <Card className="p-5">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-4">
          <SectionHeader
            title="Consolidated Cash & Bank Ledger"
            description={`Displaying ${filteredTableItems.length} transactions match the selection`}
          />

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative min-w-[200px]">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search ledger..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 h-9 w-full bg-surface border border-border rounded-lg text-xs focus:ring-2 focus:ring-ring/25 focus:outline-none"
              />
            </div>

            {/* Type Filter */}
            <div className="flex bg-muted/60 border border-border p-0.5 rounded-lg text-[10px] font-bold">
              {(["All", "Inflow", "Outflow"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-2.5 py-1.5 rounded-md ${
                    typeFilter === t
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Method Filter */}
            <div className="flex bg-muted/60 border border-border p-0.5 rounded-lg text-[10px] font-bold">
              {(["All", "Cash", "UPI"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMethodFilter(m)}
                  className={`px-2.5 py-1.5 rounded-md ${
                    methodFilter === m
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m === "UPI" ? "Bank/UPI" : m}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-xs table-fixed min-w-[700px]">
            <thead className="bg-muted/40 border-b border-border text-[10px] uppercase font-extrabold tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3 w-28">Ref ID</th>
                <th className="p-3 w-24">Date</th>
                <th className="p-3 w-28">Module</th>
                <th className="p-3 w-32">Category</th>
                <th className="p-3">Description</th>
                <th className="p-3 w-24">Method</th>
                <th className="p-3 w-24 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredTableItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No ledger transactions match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredTableItems.map((item) => {
                  const isInflow = item.type === "Inflow";
                  return (
                    <tr key={item.id} className="hover:bg-accent/25 transition-colors">
                      <td className="p-3 font-mono font-bold text-muted-foreground select-all truncate">{item.id}</td>
                      <td className="p-3 font-medium text-foreground truncate">{item.date}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          item.module === "Finance"
                            ? "bg-success/10 text-success border border-success/20"
                            : "bg-info/10 text-info border border-info/20"
                        }`}>
                          {item.module === "Finance" ? <Building className="size-2.5" /> : <Smartphone className="size-2.5" />}
                          <span>{item.module}</span>
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-foreground truncate">{item.category}</td>
                      <td className="p-3 text-muted-foreground truncate" title={item.description}>{item.description}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          item.method === "Cash"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                            : "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300"
                        }`}>
                          {item.method === "UPI" ? "Bank/UPI" : "Cash"}
                        </span>
                      </td>
                      <td className={`p-3 font-extrabold text-right text-sm ${isInflow ? "text-success" : "text-danger"}`}>
                        <span className="inline-flex items-center">
                          {isInflow ? "+" : "-"}
                          {fmt(item.amount)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
