import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Search, Plus, Calendar, Printer, FileText, Smartphone, CreditCard, ChevronRight, User, Receipt, AlertCircle, HandCoins, Clock } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { AppShell } from "@/components/AppShell";
import { Badge, Card, SectionHeader, StatCard } from "@/components/ui-kit";
import { useMobileStore, MobileSale, safeItems } from "@/lib/mobileStore";
import { parseAppDate, isDateInRange } from "@/lib/store";
import { FilterBar, useDateFilter } from "@/components/FilterBar";
import { JAIN_LOGO_BASE64 } from "./-logoBase64";

/** Escape HTML special chars to prevent XSS when inserting user data into innerHTML */
function escapeHtml(str: string | undefined | null): string {
  if (str === undefined || str === null) return "—";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


export const Route = createFileRoute("/mobiles/sales")({
  head: () => ({
    meta: [
      { title: "Sales Invoices · Jain Mobiles ERP" },
      { name: "description", content: "Mobile shop billing, invoicing and sales ledger." },
    ],
  }),
  component: SalesPage,
});

function SalesPage() {
  const sales = useMobileStore((s) => s.sales) || [];
  const products = useMobileStore((s) => s.products) || [];
  const imeis = useMobileStore((s) => s.imeis) || [];
  const inventory = useMobileStore((s) => s.inventory) || [];
  const settings = useMobileStore((s) => s.settings);
  const createBill = useMobileStore((s) => s.createBill);
  const customers = useMobileStore((s) => s.customers) || [];

  const [activeTab, setActiveTab] = useState<"history" | "new">("history");
  const [q, setQ] = useState("");
  const [selectedSale, setSelectedSale] = useState<MobileSale | null>(null);
  const [collectingSale, setCollectingSale] = useState<MobileSale | null>(null);

  // New bill states
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [cName, setCName] = useState("");
  const [cMobile, setCMobile] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [village, setVillage] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<MobileSale["paymentStatus"]>("Full Paid");
  const [productId, setProductId] = useState("");
  const [manualPrice, setManualPrice] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<MobileSale["paymentMethod"]>("Cash");
  const [splitCash, setSplitCash] = useState<number | null>(null);
  const [splitUpi, setSplitUpi] = useState<number | null>(null);

  // Auto-calculated pricing for new bill
  const priceNum = Number(manualPrice) || 0;
  const finalTotal = priceNum;

  const autoAmountPaid = 
    paymentStatus === "Full Paid" 
      ? finalTotal 
      : paymentStatus === "Not Paid" 
        ? 0 
        : Number(amountPaid) || 0;

  const autoDueAmount = Math.max(0, finalTotal - autoAmountPaid);

  // Sync split values when autoAmountPaid or finalTotal changes
  useEffect(() => {
    if (paymentMethod === "Cash & UPI") {
      const targetTotal = autoAmountPaid;
      setSplitCash(Math.round(targetTotal / 2));
      setSplitUpi(targetTotal - Math.round(targetTotal / 2));
    } else {
      setSplitCash(null);
      setSplitUpi(null);
    }
  }, [paymentMethod, autoAmountPaid]);

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

  // Auto price fetch from catalog when a product is explicitly selected
  useEffect(() => {
    if (!productId) {
      setManualPrice("");
    } else {
      const p = products.find((prod) => prod?.id === productId);
      if (p) {
        setManualPrice((p.sellingPrice || p.purchasePrice).toString());
      }
    }
  }, [productId, products]);

  const selectedProduct = products.find((p) => p?.id === productId);

  // Check if customer is blacklisted
  const cleanedTypedMobile = cMobile.trim().replace(/[^\d]/g, "");
  const existingCustomer = customers.find(
    (c) => String(c?.mobile ?? "").replace(/[^\d]/g, "") === cleanedTypedMobile
  );
  const isBlacklisted = existingCustomer?.isBlacklisted ?? false;

  const isMobileValid = /^\d{10}$/.test(cMobile.trim());
  const canCheckout = cName.trim() && isMobileValid && productId && !isBlacklisted && manualPrice;

  // Filter Sales History
  const filteredSales = (sales || []).filter((s) => {
    if (!s) return false;
    const sDate = parseAppDate(s.date);
    // When no date filter is active (All Time), include even unparseable dates
    if (startDate !== null || endDate !== null) {
      if (!isDateInRange(sDate, startDate, endDate)) return false;
    }

    if (q) {
      const matchText = q.toLowerCase();
      return [s.id, s.customerName, s.customerMobile].some((field) =>
        field ? String(field).toLowerCase().includes(matchText) : false
      );
    }
    return true;
  });

  const sortedSales = [...filteredSales].sort((a, b) => {
    if (!a || !b) return 0;
    const dateA = parseAppDate(a.date)?.getTime() || 0;
    const dateB = parseAppDate(b.date)?.getTime() || 0;
    if (dateB !== dateA) return dateB - dateA;
    const numA = parseInt(String(a.id || "").replace(/\D/g, ""), 10) || 0;
    const numB = parseInt(String(b.id || "").replace(/\D/g, ""), 10) || 0;
    return numB - numA;
  });

  const periodSalesTotal = filteredSales.reduce((sum, s) => sum + (Number(s?.totalAmount) || 0), 0);
  const periodSalesCount = filteredSales.length;

  const handlePrint = (sale: MobileSale) => {
    if (!sale) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Popup blocked! Enable popups to print invoices");
      return;
    }

    const itemRowsHtml = safeItems(sale?.items)
      .map((item: any) => {
        if (!item) return "";
        const brand = escapeHtml(item.brand || (item.productName ? String(item.productName).split(" ")[0] : "—"));
        const pName = escapeHtml(item.productName || item.name || "—");
        const imei1 = escapeHtml(item.imei1 || "—");
        const imei2 = escapeHtml(item.imei2 || "—");
        const qty = Number(item.quantity) || 0;
        const price = Number(item.price) || 0;
        return `
        <tr style="background: #ffffff;">
          <td style="padding: 8px 10px; border: 1px solid #bfdbfe; vertical-align: top; width: 55%;">
            <div style="margin-bottom: 3px;"><strong style="color: #1e3a8a;">Company:</strong> ${brand}</div>
            <div style="margin-bottom: 3px;"><strong style="color: #1e3a8a;">Model No.:</strong> ${pName}</div>
            <div style="margin-bottom: 3px;"><strong style="color: #1e3a8a;">IMEI No.:</strong> ${imei1}</div>
            <div><strong style="color: #1e3a8a;">IMEI No.:</strong> ${imei2}</div>
          </td>
          <td style="padding: 8px; border: 1px solid #bfdbfe; text-align: center; font-weight: 700; width: 10%; vertical-align: top; color: #1e293b;">${qty}</td>
          <td style="padding: 8px; border: 1px solid #bfdbfe; text-align: right; font-weight: 600; width: 17.5%; vertical-align: top; color: #1e293b;">₹${price.toLocaleString("en-IN")}</td>
          <td style="padding: 8px; border: 1px solid #bfdbfe; text-align: right; font-weight: 700; width: 17.5%; vertical-align: top; color: #1e3a8a;">₹${(price * qty).toLocaleString("en-IN")}</td>
        </tr>
      `;
      })
      .join("");

    const invoiceContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Receipt - Jain Mobile Gallery</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Tiro+Devanagari+Hindi&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
        <style>
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          @media print {
            body { margin: 0; padding: 0; background: white; }
            .no-print { display: none !important; }
          }
          body {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f8fafc;
            color: #0f172a;
          }
          .bill-container {
            max-width: 720px;
            margin: 0 auto;
            background: #fff;
            border: 2.5px solid #1e3a8a;
            border-radius: 10px;
            padding: 18px;
            box-sizing: border-box;
            box-shadow: 0 4px 20px rgba(30, 58, 138, 0.08);
          }
          .top-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 13px;
            font-weight: 700;
            padding-bottom: 6px;
            border-bottom: 2px solid #2563eb;
            margin-bottom: 8px;
          }
          .header-left {
            display: flex;
            align-items: center;
            gap: 6px;
            color: #e1306c;
          }
          .header-right {
            display: flex;
            align-items: center;
            gap: 6px;
            color: #15803d;
          }
          .shop-title-section {
            text-align: center;
            margin: 6px 0 10px 0;
            background: linear-gradient(180deg, #eff6ff 0%, #ffffff 100%);
            padding: 10px 8px;
            border-radius: 8px;
            border: 1px solid #dbeafe;
          }
          .shop-name-hindi {
            font-family: 'Tiro Devanagari Hindi', 'Rozha One', 'Mangal', serif;
            font-size: 34px;
            font-weight: 800;
            margin: 0;
            letter-spacing: 0.5px;
            color: #1e3a8a;
            line-height: 1.15;
          }
          .shop-address-hindi {
            font-family: 'Tiro Devanagari Hindi', 'Mangal', serif;
            font-size: 14px;
            font-weight: 700;
            margin: 4px 0 0 0;
            color: #b45309;
          }
          .info-table {
            width: 100%;
            border-collapse: collapse;
            border: 1.5px solid #2563eb;
            font-size: 13px;
            margin-bottom: -1.5px;
            background: #f8fafc;
          }
          .info-table td {
            border: 1px solid #bfdbfe;
            padding: 7px 10px;
            vertical-align: middle;
            color: #1e293b;
          }
          .info-table td strong {
            color: #1e3a8a;
          }
          .particulars-table {
            width: 100%;
            border-collapse: collapse;
            border: 1.5px solid #2563eb;
            font-size: 13px;
          }
          .particulars-table th {
            border: 1px solid #1e3a8a;
            padding: 8px;
            background: #1e40af !important;
            font-weight: 800;
            text-align: center;
            color: #ffffff !important;
          }
          .terms-box {
            border: 1.5px solid #d97706;
            border-top: none;
            padding: 10px 12px;
            font-size: 11px;
            line-height: 1.45;
            font-family: 'Tiro Devanagari Hindi', 'Mangal', sans-serif;
            background: #fffbeb !important;
            color: #78350f;
          }
          .terms-header {
            font-weight: 800;
            font-size: 12px;
            margin-bottom: 3px;
            color: #b45309;
          }
          .terms-subtext {
            margin-top: 8px;
            font-weight: 700;
            font-size: 11.5px;
            color: #1e3a8a;
          }
          .signatures-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 30px;
            padding: 0 10px;
            font-size: 13px;
            font-weight: 700;
            font-family: 'Tiro Devanagari Hindi', 'Mangal', sans-serif;
            color: #1e3a8a;
          }
        </style>
      </head>
      <body>
        <div class="bill-container">
          
          <!-- Top Contact Bar -->
          <div class="top-header">
            <div class="header-left">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              <span>Jain__Mobiles</span>
            </div>
            <div class="header-right">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <span>मो.: 9669410999, 8839766477</span>
            </div>
          </div>

          <!-- Shop Title Section -->
          <div class="shop-title-section">
            <div style="display: flex; align-items: center; justify-content: center; gap: 14px;">
              <img src="${JAIN_LOGO_BASE64}" alt="Jain Logo" style="height: 56px; width: auto; object-fit: contain; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));" />
              <h1 class="shop-name-hindi">जैन मोबाईल गैलरी</h1>
            </div>
            <p class="shop-address-hindi">बामंदी रोड, बस स्टेण्ड, बलकवाड़ा</p>
          </div>

          <!-- Customer Info Sub-Table -->
          <table class="info-table">
            <tr>
              <td style="width: 65%;"><strong>M/s.</strong> ${sale.customerName}</td>
              <td style="width: 35%;"><strong>No.</strong> <span style="font-weight: 700; color: #1e40af;">${sale.id}</span></td>
            </tr>
            <tr>
              <td><strong>Address</strong> ${sale.village || "—"}</td>
              <td><strong>Date :</strong> ${sale.date}</td>
            </tr>
            <tr>
              <td colspan="2"><strong>Mob.No.</strong> ${sale.customerMobile}</td>
            </tr>
          </table>

          <!-- Particulars Table -->
          <table class="particulars-table">
            <thead>
              <tr>
                <th style="width: 55%;">Particulars</th>
                <th style="width: 10%;">Qty.</th>
                <th style="width: 17.5%;">Rate</th>
                <th style="width: 17.5%;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemRowsHtml}
              <tr style="font-weight: 800; font-size: 14px; background: #eff6ff !important;">
                <td colspan="3" style="text-align: right; padding: 8px 12px; border: 1.5px solid #2563eb; color: #1e3a8a;">TOTAL</td>
                <td style="text-align: right; padding: 8px 12px; font-size: 16px; border: 1.5px solid #2563eb; color: #16a34a; font-weight: 800;">₹${(Number(sale?.totalAmount) || 0).toLocaleString("en-IN")}</td>
              </tr>
            </tbody>
          </table>

          <!-- Terms & Conditions Box (Hindi Script) -->
          <div class="terms-box">
            <div class="terms-header">नियम एवं शर्तें:-</div>
            <div>
              1). बेचा हुआ माल वापस नही होगा । 
              2). हम विक्रेता है निर्माता नही 
              3). मोबाईल फोन में सर्विस वारंटी 1 वर्ष की कम्पनी की ओर से रहती है 
              4). पानी में भीगे हुए, नीचे गिरे हुए अथवा मेकेनिक द्वारा छेड़े गये हुए मोबाईल की कोई वारंटी मान्य नही होगी 
              5). मोबाईल फोन की सर्विस के लिए 20 से 45 दिन लगेगें 
              6). हेडफोन की कोई वारंटी नही रहेगी 
              7). मोबाईल या किसी भी इलेक्टानिक सामान खराब होने पर ग्राहक को स्वयं मोबाईल सर्विस सेन्टर ले जाना होगा । 
              8). किसी भी प्रकार का चाइना आइटम खरीदने से पहले एक बार सोच ले दुकान से नीचे उतरने के बाद हमारी कोई गारंटी नहीं रहेगी । 
              9). भूल-चुक लेनी देनी ।
            </div>
            <div class="terms-subtext">उपरोक्त सामग्री सही/चालु स्थिति में प्राप्त हुई ।</div>
          </div>

          <!-- Signatures -->
          <div class="signatures-row">
            <div>ग्राहक के हस्ताक्षर</div>
            <div>फॉर- जैन मोबाईल गैलरी</div>
          </div>

        </div>
      </body>
      </html>
    `;

    printWindow.document.write(invoiceContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 300);
  };

  const handleCheckoutSubmit = () => {
    if (!selectedProduct) return;

    const sale = createBill({
      customerId: "",
      customerName: cName.trim(),
      customerMobile: cMobile.trim(),
      fatherName: fatherName.trim(),
      village: village.trim(),
      paymentMethod,
      paymentStatus,
      amountPaid: autoAmountPaid,
      dueAmount: autoDueAmount,
      cashAmountPaid: paymentMethod === "Cash & UPI" ? (splitCash ?? 0) : undefined,
      upiAmountPaid: paymentMethod === "Cash & UPI" ? (splitUpi ?? 0) : undefined,
      date: new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      dueDate: paymentStatus !== "Full Paid" && dueDate ? new Date(dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : undefined,
      items: [
        {
          productId,
          productName: selectedProduct.name,
          quantity: 1,
          price: priceNum,
        }
      ]
    });

    toast.success(`Tax Bill generated for ${cName}`);
    handlePrint(sale);

    // Reset checkout states
    setCName("");
    setCMobile("");
    setFatherName("");
    setVillage("");
    setManualPrice("");
    setAmountPaid("");
    setSplitCash(null);
    setSplitUpi(null);
    setPaymentStatus("Full Paid");
    setDate(new Date().toISOString().split("T")[0]);
    setDueDate("");
    setActiveTab("history");
  };

  const formatInr = (num: any) => {
    const val = Number(num);
    if (isNaN(val)) return "₹0";
    return "₹" + Math.round(val).toLocaleString("en-IN");
  };

  return (
    <AppShell breadcrumb="Sales">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight">Sales & Invoices</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Perform barcode checkouts, generate invoices and view sales history.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("history")}
            className={`h-9 px-4 rounded-md border text-sm font-semibold transition-all duration-150 ${
              activeTab === "history"
                ? "bg-foreground text-background border-foreground shadow"
                : "border-border bg-surface hover:bg-accent text-muted-foreground"
            }`}
          >
            Invoice Logs
          </button>
          <button
            onClick={() => setActiveTab("new")}
            className={`h-9 px-4 rounded-md border text-sm font-semibold transition-all duration-150 inline-flex items-center gap-1.5 ${
              activeTab === "new"
                ? "bg-foreground text-background border-foreground shadow"
                : "border-border bg-surface hover:bg-accent text-muted-foreground"
            }`}
          >
            <Plus className="size-3.5" /> Create Bill
          </button>
        </div>
      </div>

      {activeTab === "history" ? (
        <>
          {/* Date Filter */}
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

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard label="Period Revenue" value={formatInr(periodSalesTotal)} sub="Total sales value" icon={<Receipt className="size-4" />} trend="up" />
            <StatCard label="Invoices Billed" value={periodSalesCount.toString()} sub="Billed invoices" icon={<Smartphone className="size-4" />} />
            <StatCard label="Avg Bill Value" value={formatInr(periodSalesCount ? periodSalesTotal / periodSalesCount : 0)} sub="Per transaction" />
            <StatCard label="UPI & Split Sales Share" value={`${periodSalesTotal > 0 ? Math.round((filteredSales.filter(s => s?.paymentMethod === "UPI" || s?.paymentMethod === "Cash & UPI").reduce((sum, s) => sum + (Number(s?.totalAmount) || 0), 0) / periodSalesTotal) * 100) : 0}%`} sub="Of total turnover" icon={<CreditCard className="size-4" />} />
          </div>

          <Card>
            {/* Search Input */}
            <div className="p-4 border-b border-border">
              <div className="relative max-w-md">
                <Search className="size-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search invoice ID, customer name, mobile..."
                  className="h-9 w-full rounded-md border border-border bg-background pl-8 pr-3 text-sm focus:outline-none"
                />
              </div>
            </div>

            <SectionHeader
              title={`${filteredSales.length} Invoiced Bills`}
              action={<span className="text-xs text-muted-foreground">Click print icon to reprint original receipt</span>}
            />

        <div className="w-full">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border bg-muted/10">
                <th className="py-2.5 px-3 font-semibold">Invoice ID</th>
                <th className="py-2.5 px-3 font-semibold">Date</th>
                <th className="py-2.5 px-3 font-semibold">Customer Details</th>
                <th className="py-2.5 px-3 font-semibold">Billed Goods</th>
                <th className="py-2.5 px-3 font-semibold text-center">Qty</th>
                <th className="py-2.5 px-3 font-semibold">Payment Mode</th>
                <th className="py-2.5 px-3 text-right font-semibold">Grand Total</th>
                <th className="py-2.5 px-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedSales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-muted-foreground font-semibold">
                    No sales bills matched the filter guidelines.
                  </td>
                </tr>
              ) : (
                sortedSales.map((sale) => (
                      <tr key={sale.id} className="border-b border-border hover:bg-accent/30 transition-colors last:border-0">
                        <td className="py-3 px-4 font-mono font-bold text-muted-foreground">{sale.id}</td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-foreground/80 flex items-center gap-1">
                            <Calendar className="size-3 text-muted-foreground" /> {sale.date}
                          </div>
                          {sale.dueDate && (
                            <div className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1 bg-amber-500/10 px-1.5 py-0.5 rounded w-fit">
                              <Clock className="size-3" /> Due: {sale.dueDate}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-foreground">{sale.customerName}</div>
                          <div className="text-[10px] text-muted-foreground">{sale.customerMobile}</div>
                          {(sale.fatherName || sale.village) && (
                            <div className="text-[9px] text-muted-foreground/80 italic mt-0.5">
                              Father: {sale.fatherName || "—"} | Village: {sale.village || "—"}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {safeItems(sale?.items).map((it: any, idx) => (
                            <div key={idx}>
                              <div className="font-medium">{it?.productName || it?.name || "—"}</div>
                            </div>
                          ))}
                        </td>
                        <td className="py-3 px-4 text-center font-bold">{safeItems(sale?.items).reduce((s, x: any) => s + (Number(x?.quantity) || 0), 0)}</td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-1">
                            <Badge tone={sale.paymentMethod === "Cash" ? "neutral" : sale.paymentMethod === "UPI" ? "success" : "info"}>
                              {sale.paymentMethod}
                            </Badge>
                            <Badge tone={sale.paymentStatus === "Full Paid" ? "success" : sale.paymentStatus === "Partial Paid" ? "warning" : "danger"}>
                              {sale.paymentStatus} {Number(sale.dueAmount) > 0 && `(Due: ₹${Number(sale.dueAmount).toLocaleString("en-IN")})`}
                            </Badge>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-success text-sm">{formatInr(sale.totalAmount)}</td>
                        <td className="py-3 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {sale.paymentStatus !== "Full Paid" && sale.dueAmount > 0 && (
                              <button
                                title="Receive Payment"
                                onClick={() => setCollectingSale(sale)}
                                className="h-7 px-2 rounded border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 text-[11px] font-bold flex items-center gap-1 transition-colors shadow-sm cursor-pointer"
                              >
                                <HandCoins className="size-3.5" />
                                <span>Pay</span>
                              </button>
                            )}
                            <button
                              title="Reprint Invoice"
                              onClick={() => handlePrint(sale)}
                              className="size-7 rounded border border-border bg-surface text-muted-foreground hover:text-foreground grid place-items-center hover:bg-accent transition-colors shadow-sm cursor-pointer"
                            >
                              <Printer className="size-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : (
        /* Create New Bill */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Billing Form */}
          <Card className="lg:col-span-2 p-5 space-y-4">
            <SectionHeader title="Billing Checkout Form" />
            
            {/* Customer Section */}
            <div className="space-y-3">
              <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/80 flex items-center gap-1">
                <User className="size-3 text-primary" /> Customer Info
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="block col-span-2">
                  <span className="text-xs text-muted-foreground font-medium">Invoice Date</span>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="block col-span-2">
                  <span className="text-xs font-bold text-primary flex items-center gap-1">
                    <User className="size-3.5" /> Select Existing Customer (Auto-fill)
                  </span>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => {
                      const custId = e.target.value;
                      setSelectedCustomerId(custId);
                      if (!custId) {
                        setCName("");
                        setCMobile("");
                        setFatherName("");
                        setVillage("");
                      } else {
                        const found = customers.find((c) => c.id === custId);
                        if (found) {
                          setCName(found.name);
                          setCMobile(found.mobile);
                          setFatherName(found.fatherName || "");
                          setVillage(found.village || found.address || "");
                        }
                      }
                    }}
                    className="mt-1 h-9 w-full rounded-md border border-primary/40 bg-surface px-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:outline-none cursor-pointer"
                  >
                    <option value="">➕ Create New Customer / Manual Entry</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        👤 {c.name} ({c.mobile}) {c.address ? `— ${c.address}` : ""}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs text-muted-foreground font-medium">Customer Full Name</span>
                  <input
                    value={cName}
                    onChange={(e) => {
                      setCName(e.target.value);
                      setSelectedCustomerId("");
                    }}
                    placeholder="e.g. Suresh Patil"
                    className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-xs text-muted-foreground font-medium">Mobile Number</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={cMobile}
                    onChange={(e) => {
                      setCMobile(e.target.value.replace(/\D/g, "").slice(0, 10));
                      setSelectedCustomerId("");
                    }}
                    placeholder="e.g. 9876543210"
                    className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs text-muted-foreground font-medium">Father's Name</span>
                  <input
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    placeholder="e.g. Ramrao Patil"
                    className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-xs text-muted-foreground font-medium">Village</span>
                  <input
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder="e.g. Shirwal"
                    className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
                  />
                </label>
              </div>

              {cMobile.trim() && !/^\d{10}$/.test(cMobile.trim()) && (
                <span className="text-[10px] text-red-500 font-semibold mt-0.5 block">Phone number must be exactly 10 digits</span>
              )}
              {isBlacklisted && (
                <div className="flex items-center gap-2 rounded bg-danger/10 text-danger p-2.5 text-xs font-semibold mt-1">
                  <AlertCircle className="size-4 shrink-0 animate-bounce" />
                  <span>⚠️ Customer is blacklisted and blocked from purchases!</span>
                </div>
              )}
            </div>

            {/* Products Section */}
            <div className="space-y-3 border-t border-dashed border-border pt-4">
              <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/80 flex items-center gap-1">
                <Smartphone className="size-3.5 text-primary" /> Item Selection & Price Entry
              </div>
              
              <label className="block">
                <span className="text-xs text-muted-foreground font-medium">Select Product Model</span>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:outline-none cursor-pointer"
                >
                  <option value="">-- Select Product Model --</option>
                  {products.map((p) => {
                    const invItem = inventory.find((inv) => inv.productId === p.id);
                    const qty = invItem ? invItem.quantity : 0;
                    return (
                      <option key={p.id} value={p.id} disabled={qty === 0}>
                        {p.brand} {p.name} ({p.ramRom}) — {qty} in stock
                      </option>
                    );
                  })}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs text-muted-foreground font-medium">Manual Price (₹)</span>
                  <input
                    type="number"
                    value={manualPrice}
                    onChange={(e) => setManualPrice(e.target.value)}
                    placeholder="Enter manual selling price"
                    className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
                  />
                </label>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-3 border-t border-dashed border-border pt-4">
              <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/80 flex items-center gap-1">
                <CreditCard className="size-3.5 text-primary" /> Payment Method & Status
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs text-muted-foreground font-medium">Payment Mode</span>
                  <select
                    disabled={paymentStatus === "Not Paid"}
                    value={paymentStatus === "Not Paid" ? "Cash" : paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as MobileSale["paymentMethod"])}
                    className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 font-semibold disabled:opacity-50 cursor-pointer"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    {paymentStatus !== "Not Paid" && <option value="Cash & UPI">Cash & UPI</option>}
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs text-muted-foreground font-medium">Payment Status</span>
                  <select
                    value={paymentStatus}
                    onChange={(e) => {
                      const newStatus = e.target.value as MobileSale["paymentStatus"];
                      setPaymentStatus(newStatus);
                      if (newStatus === "Not Paid" && paymentMethod === "Cash & UPI") {
                        setPaymentMethod("Cash");
                      }
                    }}
                    className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 font-semibold"
                  >
                    <option value="Full Paid">Full Paid</option>
                    <option value="Partial Paid">Partial Paid</option>
                    <option value="Not Paid">Not Paid</option>
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs text-muted-foreground font-medium">Amount Paid (₹)</span>
                  <input
                    type="number"
                    disabled={paymentStatus === "Full Paid" || paymentStatus === "Not Paid"}
                    value={paymentStatus === "Full Paid" ? finalTotal : paymentStatus === "Not Paid" ? 0 : amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    placeholder="e.g. 5000"
                    className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none disabled:opacity-60 font-semibold"
                  />
                </label>
                {paymentStatus !== "Full Paid" && (
                  <label className="block">
                    <span className="text-xs text-muted-foreground font-medium">Due Date</span>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none font-semibold"
                    />
                  </label>
                )}
              </div>

              {paymentMethod === "Cash & UPI" && paymentStatus !== "Not Paid" && (
                <div className="grid grid-cols-2 gap-3 bg-muted/20 p-3 rounded-lg border border-border/50 animate-in fade-in duration-200">
                  <label className="block">
                    <span className="text-xs text-muted-foreground font-medium">Cash Paid Portion (₹)</span>
                    <input
                      type="number"
                      value={splitCash !== null ? splitCash : ""}
                      onChange={(e) => {
                        const val = Number(e.target.value) || 0;
                        setSplitCash(val);
                        setSplitUpi(Math.max(0, autoAmountPaid - val));
                      }}
                      className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none font-semibold"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs text-muted-foreground font-medium font-semibold">UPI Paid Portion (₹)</span>
                    <input
                      type="number"
                      value={splitUpi !== null ? splitUpi : ""}
                      onChange={(e) => {
                        const val = Number(e.target.value) || 0;
                        setSplitUpi(val);
                        setSplitCash(Math.max(0, autoAmountPaid - val));
                      }}
                      className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none font-semibold"
                    />
                  </label>
                </div>
              )}
            </div>
          </Card>

          {/* Invoicing Summary */}
          <Card className="p-5 flex flex-col justify-between border border-border/80 bg-surface">
            <div>
              <SectionHeader title="Invoice Summary" />
              
              <div className="divide-y divide-border/60 text-xs py-3">
                <div className="flex justify-between py-2.5">
                  <span className="text-muted-foreground font-semibold">Customer Name:</span>
                  <span className="text-foreground font-bold">{cName || "—"}</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-muted-foreground font-semibold">Subtotal Price:</span>
                  <span className="text-foreground font-bold">{formatInr(priceNum)}</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-muted-foreground font-semibold">Amount Paid:</span>
                  <span className="text-foreground font-semibold">{formatInr(autoAmountPaid)}</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-muted-foreground font-semibold">Outstanding Due:</span>
                  <span className="text-red-500 font-bold">{formatInr(autoDueAmount)}</span>
                </div>
                <div className="flex justify-between py-3 border-t border-border font-bold text-sm">
                  <span className="text-foreground">Total Bill Value:</span>
                  <span className="text-success text-base">{formatInr(finalTotal)}</span>
                </div>
              </div>

              {selectedProduct && (
                <div className="mt-3 p-3 bg-muted/30 border border-border rounded-lg text-xs space-y-1">
                  <div className="font-semibold text-foreground">Selected Item:</div>
                  <div className="text-muted-foreground">{selectedProduct.brand} {selectedProduct.name}</div>
                  <div className="text-muted-foreground font-mono mt-1 text-[10px]">
                    RAM/ROM: {selectedProduct.ramRom}
                  </div>
                </div>
              )}
            </div>

            <button
              disabled={!canCheckout}
              onClick={handleCheckoutSubmit}
              className="mt-6 w-full h-10 rounded-md bg-success text-white font-bold hover:opacity-90 disabled:opacity-40 shadow transition-all text-sm inline-flex items-center justify-center gap-1.5"
            >
              <Printer className="size-4" /> Generate & Print Invoice
            </button>
          </Card>
        </div>
      )}

      {collectingSale && (
        <CollectSalePaymentDialog
          sale={collectingSale}
          onClose={() => setCollectingSale(null)}
        />
      )}
    </AppShell>
  );
}

function CollectSalePaymentDialog({ sale, onClose }: { sale: MobileSale; onClose: () => void }) {
  const collectSalePayment = useMobileStore((s) => s.collectSalePayment);
  const dueAmt = Number(sale?.dueAmount) || 0;
  const totalAmt = Number(sale?.totalAmount) || 0;
  const paidAmt = Number(sale?.amountPaid) || 0;
  const [amt, setAmt] = useState(dueAmt > 0 ? dueAmt : 0);
  const [method, setMethod] = useState<"Cash" | "UPI">("Cash");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payAmt = Number(amt);
    if (!payAmt || payAmt <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }
    if (payAmt > dueAmt) {
      toast.error(`Payment amount (₹${payAmt.toLocaleString("en-IN")}) cannot exceed due amount (₹${dueAmt.toLocaleString("en-IN")})`);
      return;
    }

    const formattedDate = new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    collectSalePayment(sale.id, payAmt, method, formattedDate);
    toast.success(`Collected ₹${payAmt.toLocaleString("en-IN")} (${method}) for Bill ${sale.id}`);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm rounded-xl border border-border shadow-2xl p-6">
        <DialogHeader className="border-b border-border pb-3">
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <HandCoins className="size-5 text-emerald-500" />
            <span>Receive Customer Payment</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Record payment collection for Bill {sale.id} ({sale.customerName})
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          <div className="bg-muted/30 p-3 rounded-lg border border-border/60 text-xs space-y-1 font-medium">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Bill Value:</span>
              <span className="font-bold">₹{totalAmt.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Already Paid:</span>
              <span className="font-bold text-emerald-600">₹{paidAmt.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-border/50 text-sm">
              <span className="font-bold text-foreground">Outstanding Due:</span>
              <span className="font-extrabold text-red-600">₹{dueAmt.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <label className="block">
            <span className="text-xs font-semibold text-foreground">Payment Date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-xs focus:ring-2 focus:ring-ring/20 focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-foreground">Amount Collecting (₹)</span>
            <input
              type="number"
              min={1}
              max={sale.dueAmount}
              value={amt || ""}
              onChange={(e) => setAmt(Number(e.target.value))}
              placeholder="e.g. 5000"
              className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm font-extrabold text-emerald-600 focus:ring-2 focus:ring-ring/20 focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-foreground">Payment Mode</span>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as "Cash" | "UPI")}
              className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-xs font-semibold focus:ring-2 focus:ring-ring/20 focus:outline-none cursor-pointer"
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
            </select>
          </label>

          <DialogFooter className="border-t border-border pt-4 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-9 flex-1 rounded-md border border-border bg-surface text-xs font-semibold hover:bg-accent transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-9 flex-1 rounded-md bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer"
            >
              Confirm Payment
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
