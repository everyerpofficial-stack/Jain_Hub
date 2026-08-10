import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Download, FileText, Calendar, TrendingUp, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Badge, Card, SectionHeader, StatCard } from "@/components/ui-kit";
import { useMobileStore, safeItems } from "@/lib/mobileStore";
import { downloadExcel, parseAppDate, isDateInRange } from "@/lib/store";
import { FilterBar, useDateFilter } from "@/components/FilterBar";


export const Route = createFileRoute("/mobiles/reports")({
  head: () => ({
    meta: [
      { title: "Reports · Jain Mobiles ERP" },
      { name: "description", content: "Mobile shop sales, profit, stock and purchase analytics." },
    ],
  }),
  component: ReportsPage,
});

type ReportType = "sales" | "stock" | "profit" | "purchases" | "customers" | "suppliers";

function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>("sales");
  const [q, setQ] = useState("");

  const products = useMobileStore((s) => s.products) || [];
  const inventory = useMobileStore((s) => s.inventory) || [];
  const sales = useMobileStore((s) => s.sales) || [];
  const purchases = useMobileStore((s) => s.purchases) || [];
  const customers = useMobileStore((s) => s.customers) || [];
  const suppliers = useMobileStore((s) => s.suppliers) || [];

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

  const formatInr = (num: number) => "₹" + Math.round(num).toLocaleString("en-IN");

  // ---- Generation logic for different reports ----
  const reportData = (() => {
    let rawRows: any[] = [];
    let headers: string[] = [];
    let title = "";

    switch (reportType) {
      case "sales":
        title = "Sales Invoice Report";
        headers = ["Invoice ID", "Date", "Customer Name", "Customer Mobile", "Payment Mode", "Total Revenue"];
        rawRows = sales
          .filter((s) => isDateInRange(parseAppDate(s.date), startDate, endDate))
          .map((s) => ({
            "Invoice ID": s.id,
            "Date": s.date,
            "Customer Name": s.customerName,
            "Customer Mobile": s.customerMobile,
            "Payment Mode": s.paymentMethod,
            "Total Revenue": formatInr(s.totalAmount),
            _rawTotal: s.totalAmount
          }));
        break;

      case "stock":
        title = "Stock Inventory Valuation Report";
        headers = ["Product ID", "Brand & Model", "RAM / ROM", "Stock Quantity", "Purchase Price (Cost)", "Valuation Cost", "Status"];
        rawRows = inventory.map((item) => {
          const prod = products.find((p) => p.id === item.productId);
          return {
            "Product ID": item.productId,
            "Brand & Model": `${item.brand} ${item.productName}`,
            "RAM / ROM": prod ? prod.ramRom : "—",
            "Stock Quantity": item.quantity,
            "Purchase Price (Cost)": formatInr(item.purchasePrice),
            "Valuation Cost": formatInr(item.purchasePrice * item.quantity),
            "Status": item.status,
            _rawQty: item.quantity,
            _rawCostVal: item.purchasePrice * item.quantity
          };
        });
        break;

      case "profit":
        title = "Profitability Margin Analysis";
        headers = ["Product Model", "Brand", "Units Sold", "Retail Price", "Cost Price", "Margin / Unit", "Total Profit"];
        
        // Sum up sold quantities by product in the date range
        const salesInPeriod = sales.filter((s) => isDateInRange(parseAppDate(s.date), startDate, endDate));
        const marginsMap: Record<string, number> = {};
        
        salesInPeriod.forEach((sale) => {
          safeItems(sale.items).forEach((item: any) => {
            marginsMap[item.productId] = (marginsMap[item.productId] || 0) + item.quantity;
          });
        });


        rawRows = products.map((p) => {
          const unitsSold = marginsMap[p.id] || 0;
          const sellingPrice = p.sellingPrice ?? 0;
          const unitProfit = sellingPrice - p.purchasePrice;
          const totalProfit = unitProfit * unitsSold;
          return {
            "Product Model": p.name,
            "Brand": p.brand,
            "Units Sold": unitsSold,
            "Retail Price": formatInr(sellingPrice),
            "Cost Price": formatInr(p.purchasePrice),
            "Margin / Unit": formatInr(unitProfit),
            "Total Profit": formatInr(totalProfit),
            _rawUnits: unitsSold,
            _rawProfit: totalProfit
          };
        }).filter(row => row._rawUnits > 0 || q === ""); // hide 0 sold unless search is empty
        break;

      case "purchases":
        title = "Purchases procurement Invoice Logs";
        headers = ["Purchase ID", "Date", "Supplier", "Invoice No", "Quantity Received", "Total Cost", "Payment Status"];
        rawRows = purchases
          .filter((p) => isDateInRange(parseAppDate(p.date), startDate, endDate))
          .map((p) => ({
            "Purchase ID": p.id,
            "Date": p.date,
            "Supplier": p.supplierName,
            "Invoice No": p.invoiceNo,
            "Quantity Received": p.quantity,
            "Total Cost": formatInr(p.amount),
            "Payment Status": p.status,
            _rawQty: p.quantity,
            _rawCost: p.amount
          }));
        break;

      case "customers":
        title = "Mobile Shop Customer Registry Report";
        headers = ["Customer ID", "Name", "Mobile Number", "Registered Date", "Email", "Billing Address"];
        rawRows = customers
          .filter((c) => isDateInRange(parseAppDate(c.registeredDate), startDate, endDate))
          .map((c) => ({
            "Customer ID": c.id,
            "Name": c.name,
            "Mobile Number": c.mobile,
            "Registered Date": c.registeredDate,
            "Email": c.email || "—",
            "Billing Address": c.address || "—"
          }));
        break;

      case "suppliers":
        title = "Supplier outstanding ledger accounts";
        headers = ["Supplier ID", "Supplier Name", "Contact Info", "Outstanding Debt"];
        rawRows = suppliers.map((s) => ({
          "Supplier ID": s.id,
          "Supplier Name": s.name,
          "Contact Info": s.contact,
          "Outstanding Debt": formatInr(s.outstanding),
          _rawOutstanding: s.outstanding
        }));
        break;
    }

    // Apply general search query filtering
    if (q) {
      const matchText = q.toLowerCase();
      rawRows = rawRows.filter((row) =>
        Object.values(row).some((val) =>
          String(val).toLowerCase().includes(matchText)
        )
      );
    }

    return { title, headers, rows: rawRows };
  })();

  const handleExportExcel = () => {
    // Strip raw calculations helper properties
    const exportRows = reportData.rows.map((row) => {
      const cleanRow = { ...row };
      Object.keys(cleanRow).forEach((k) => {
        if (k.startsWith("_")) delete cleanRow[k];
      });
      return cleanRow;
    });

    downloadExcel(`${reportType}-report.xlsx`, reportData.title, exportRows);
    toast.success(`${reportData.title} exported to Excel`);
  };

  // Stats summaries
  const renderStats = () => {
    switch (reportType) {
      case "sales":
        const totalSales = reportData.rows.reduce((sum, r) => sum + r._rawTotal, 0);
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5">
            <StatCard label="Total Sales Value" value={formatInr(totalSales)} sub="Retail turnover" />
            <StatCard label="Avg Sales Price" value={formatInr(reportData.rows.length ? totalSales / reportData.rows.length : 0)} sub="Average transaction value" />
            <StatCard label="Sales Transactions Count" value={reportData.rows.length.toString()} sub="Invoices generated" />
          </div>
        );
      case "stock":
        const totalQty = reportData.rows.reduce((sum, r) => sum + r._rawQty, 0);
        const costVal = reportData.rows.reduce((sum, r) => sum + r._rawCostVal, 0);
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5">
            <StatCard label="Total Units in stock" value={totalQty.toString()} sub="Physical inventory" />
            <StatCard label="Asset Valuation (Cost)" value={formatInr(costVal)} sub="Purchase valuation" />
            <StatCard label="Total Stock Records" value={reportData.rows.length.toString()} sub="Unique catalog items" />
          </div>
        );
      case "profit":
        const netProfit = reportData.rows.reduce((sum, r) => sum + r._rawProfit, 0);
        const unitsSold = reportData.rows.reduce((sum, r) => sum + r._rawUnits, 0);
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5">
            <StatCard label="Estimated Net Profit" value={formatInr(netProfit)} sub="Total margin value" trend="up" />
            <StatCard label="Units Sold" value={unitsSold.toString()} sub="Smartphones cleared" />
            <StatCard label="Avg Profit Margin" value={formatInr(unitsSold ? netProfit / unitsSold : 0)} sub="Margin yield per phone" />
          </div>
        );
      case "purchases":
        const totalCost = reportData.rows.reduce((sum, r) => sum + r._rawCost, 0);
        const totalPItems = reportData.rows.reduce((sum, r) => sum + r._rawQty, 0);
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5">
            <StatCard label="Total Procurement Cost" value={formatInr(totalCost)} sub="Wholesale expenses paid/debt" />
            <StatCard label="Quantity Procured" value={totalPItems.toString()} sub="Devices delivered" />
            <StatCard label="Purchases Invoices" value={reportData.rows.length.toString()} sub="Logged bills" />
          </div>
        );
      case "customers":
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5">
            <StatCard label="New Registrations" value={reportData.rows.length.toString()} sub="Clients in period" />
            <StatCard label="Total Registrations" value={customers.length.toString()} sub="Total database size" />
          </div>
        );
      case "suppliers":
        const outstanding = reportData.rows.reduce((sum, r) => sum + r._rawOutstanding, 0);
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5">
            <StatCard label="Outstanding Ledger Debt" value={formatInr(outstanding)} sub="Total unpaid vendor bills" trend={outstanding > 0 ? "warn" : "up"} />
            <StatCard label="Registered Wholesalers" value={reportData.rows.length.toString()} sub="Supplier accounts" />
          </div>
        );
    }
  };

  return (
    <AppShell breadcrumb="Reports">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight">Business Reports & Statements</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Analyze sales performance, cost margins, purchase orders and tax collections.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportExcel}
            className="h-9 px-4 rounded-md bg-foreground text-background text-sm font-semibold inline-flex items-center gap-1.5 hover:opacity-90 shadow transition-opacity"
          >
            <Download className="size-3.5" /> Export Report (Excel)
          </button>
        </div>
      </div>

      {/* Date filter bar */}
      {reportType !== "stock" && reportType !== "suppliers" && (
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
      )}

      {/* Report selectors */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-6">
        {[
          { id: "sales", label: "Sales Report" },
          { id: "stock", label: "Stock Report" },
          { id: "profit", label: "Profit Report" },
          { id: "purchases", label: "Purchase Report" },
          { id: "customers", label: "Customer Report" },
          { id: "suppliers", label: "Supplier Report" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setReportType(item.id as ReportType)}
            className={`h-10 rounded-lg border text-xs font-bold flex items-center justify-center transition-all ${
              reportType === item.id
                ? "bg-foreground text-background border-foreground shadow"
                : "border-border bg-surface hover:bg-accent text-muted-foreground hover:text-foreground"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Live Calculated Stats */}
      {renderStats()}

      <Card>
        {/* Search */}
        <div className="p-4 border-b border-border flex items-center justify-between gap-4">
          <div className="relative max-w-sm flex-1">
            <Search className="size-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search parameters in preview below..."
              className="h-9 w-full rounded-md border border-border bg-background pl-8 pr-3 text-sm focus:outline-none"
            />
          </div>
          <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
            <FileText className="size-3.5 text-muted-foreground" /> {reportData.rows.length} rows generated
          </span>
        </div>

        <SectionHeader
          title={reportData.title}
          action={<span className="text-xs text-muted-foreground">Preview grid</span>}
        />

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border bg-muted/10">
                {reportData.headers.map((h) => (
                  <th key={h} className="py-2.5 px-4 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reportData.rows.length === 0 ? (
                <tr>
                  <td colSpan={reportData.headers.length} className="py-12 text-center text-muted-foreground font-semibold">
                    No records found matching report search scope.
                  </td>
                </tr>
              ) : (
                reportData.rows.map((row, idx) => (
                  <tr key={idx} className="border-b border-border hover:bg-accent/30 transition-colors last:border-0">
                    {reportData.headers.map((h) => {
                      const val = row[h];
                      const isBoldCol = h === "Invoice ID" || h === "Total Revenue" || h === "Total Profit" || h === "Outstanding Debt" || h === "Valuation Cost";
                      return (
                        <td
                          key={h}
                          className={`py-3 px-4 ${isBoldCol ? "font-bold text-foreground" : "text-foreground/80"} ${
                            h.includes("Price") || h.includes("Cost") || h.includes("Revenue") || h.includes("Total") || h.includes("Debt") || h.includes("Margin")
                              ? "text-right"
                              : "text-left"
                          }`}
                        >
                          {h === "Status" || h === "Payment Status" ? (
                            <Badge tone={val === "In Stock" || val === "Paid" || val === "Resolved" ? "success" : val === "Low Stock" || val === "Outstanding" || val === "Pending" ? "warning" : "danger"}>
                              {val}
                            </Badge>
                          ) : (
                            val
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
