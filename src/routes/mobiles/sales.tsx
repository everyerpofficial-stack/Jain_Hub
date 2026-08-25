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
  // Check every customer record sharing this mobile number, not just the
  // first match — if a duplicate profile exists and only one copy is
  // flagged blacklisted, .find() could return the non-flagged copy and
  // silently let a blacklisted customer check out.
  const isBlacklisted = customers.some(
    (c) => String(c?.mobile ?? "").replace(/[^\d]/g, "") === cleanedTypedMobile && c?.isBlacklisted
  );

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
      .map((item: any, idx: number) => {
        if (!item) return "";
        const brand = escapeHtml(item.brand || (item.productName ? String(item.productName).split(" ")[0] : "—"));
        const pName = escapeHtml(item.productName || item.name || "—");
        const imei1 = escapeHtml(item.imei1 || "—");
        const imei2 = escapeHtml(item.imei2 || "—");
        const qty = Number(item.quantity) || 0;
        const price = Number(item.price) || 0;
        return `
        <tr style="background: #ffffff;">
          <td style="padding: 10px 8px; border: 1px solid #e2e8f0; text-align: center; font-weight: 700; color: #1e293b; vertical-align: top;">${idx + 1}</td>
          <td style="padding: 10px 12px; border: 1px solid #e2e8f0; vertical-align: top;">
            <div style="margin-bottom: 3px; font-size: 13px;"><strong style="color: #0f172a; width: 100px; display: inline-block;">Company</strong>: ${brand}</div>
            <div style="margin-bottom: 3px; font-size: 13px;"><strong style="color: #0f172a; width: 100px; display: inline-block;">Model No.</strong>: ${pName}</div>
            <div style="margin-bottom: 3px; font-size: 13px;"><strong style="color: #0f172a; width: 100px; display: inline-block;">IMEI No.</strong>: ${imei1}</div>
            <div style="font-size: 13px;"><strong style="color: #0f172a; width: 100px; display: inline-block;">IMEI No.</strong>: ${imei2}</div>
          </td>
          <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center; font-weight: 700; font-size: 14px; vertical-align: top; color: #1e293b;">${qty}</td>
          <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: right; font-weight: 600; font-size: 13px; vertical-align: top; color: #1e293b;">₹${price.toLocaleString("en-IN")}</td>
          <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: right; font-weight: 700; font-size: 14px; vertical-align: top; color: #0f172a;">₹${(price * qty).toLocaleString("en-IN")}</td>
        </tr>
      `;
      })
      .join("");

    const invoiceContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Invoice - Jain Mobile</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Tiro+Devanagari+Hindi&family=Inter:wght@400;500;600;700;800&family=Great+Vibes&display=swap" rel="stylesheet">
        <style>
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          @media print {
            body { margin: 0; padding: 0; background: white; }
            .no-print { display: none !important; }
            .bill-container { border: 1.5px solid #d4af37 !important; box-shadow: none !important; }
          }
          body {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            margin: 0;
            padding: 16px;
            background: #f8fafc;
            color: #0f172a;
          }
          .bill-container {
            max-width: 780px;
            margin: 0 auto;
            background: #ffffff;
            border: 1.5px solid #d4af37;
            border-radius: 14px;
            padding: 16px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.06);
            position: relative;
            overflow: hidden;
          }

          /* Header Section */
          .header-wrapper {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            position: relative;
            margin-bottom: 12px;
          }
          
          /* Dark Curve Top Left Header */
          .logo-dark-curve {
            background: #09090d;
            border-radius: 0 0 120px 0;
            padding: 14px 45px 18px 20px;
            margin-top: -16px;
            margin-left: -16px;
            position: relative;
            border-bottom: 3px solid #d4af37;
            border-right: 3px solid #d4af37;
            box-shadow: 2px 4px 12px rgba(0,0,0,0.2);
          }
          .logo-dark-curve img {
            height: 68px;
            width: auto;
            object-fit: contain;
            filter: drop-shadow(0 2px 8px rgba(212,175,55,0.3));
          }

          /* Center Title */
          .title-area {
            text-align: center;
            flex: 1;
            padding: 0 10px;
          }
          .shop-title {
            font-family: 'Tiro Devanagari Hindi', 'Rozha One', serif;
            font-size: 32px;
            font-weight: 800;
            margin: 0;
            color: #09090d;
            letter-spacing: 0.5px;
            line-height: 1.1;
          }
          .title-flourish {
            color: #d4af37;
            font-size: 14px;
            margin: 2px 0;
          }
          .address-line {
            font-family: 'Tiro Devanagari Hindi', serif;
            font-size: 13px;
            font-weight: 700;
            color: #a17316;
            margin: 2px 0 0 0;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
          }

          /* Right Contacts Box */
          .contacts-box {
            text-align: right;
            font-size: 12px;
            font-weight: 600;
            color: #1e293b;
            padding-top: 4px;
          }
          .insta-link {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            color: #09090d;
            font-weight: 700;
            margin-bottom: 6px;
            text-decoration: none;
            background: #fafaf5;
            padding: 3px 8px;
            border-radius: 6px;
            border: 1px solid #e5c158;
          }
          .phone-num {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 4px;
            color: #1e293b;
            margin-top: 2px;
            font-weight: 700;
          }

          /* Tax Invoice Pill Header */
          .pill-header {
            text-align: center;
            margin: 10px 0 14px 0;
          }
          .pill-badge {
            background: #09090d;
            border: 1.5px solid #d4af37;
            color: #f5d77f;
            padding: 6px 32px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 800;
            letter-spacing: 1.5px;
            display: inline-block;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          }

          /* Customer Info Card */
          .cust-card {
            border: 1.5px solid #e5c158;
            border-radius: 12px;
            background: #fafaf5;
            padding: 12px 16px;
            margin-bottom: 14px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            position: relative;
          }
          .cust-left {
            border-right: 1px solid #e5c158;
            padding-right: 16px;
          }
          .cust-row {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 8px;
            font-size: 13px;
            color: #1e293b;
          }
          .cust-row:last-child {
            margin-bottom: 0;
          }
          .icon-badge {
            width: 26px;
            height: 26px;
            border-radius: 50%;
            border: 1px solid #d4af37;
            background: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #b45309;
            font-size: 12px;
            flex-shrink: 0;
          }

          /* Table Styling */
          .particulars-table {
            width: 100%;
            border-collapse: collapse;
            border: 1.5px solid #09090d;
            border-radius: 8px;
            overflow: hidden;
            margin-bottom: 14px;
          }
          .particulars-table th {
            background: #09090d !important;
            color: #ffffff !important;
            font-weight: 800;
            font-size: 11.5px;
            letter-spacing: 0.5px;
            padding: 10px 8px;
            text-align: center;
            border-right: 1px solid #334155;
          }
          .particulars-table th:last-child {
            border-right: none;
          }
          .particulars-table td {
            border-right: 1px solid #e2e8f0;
          }
          .total-row-label {
            text-align: right;
            padding: 10px 14px;
            font-weight: 800;
            font-size: 13px;
            color: #09090d;
            letter-spacing: 1px;
            border-top: 1.5px solid #09090d;
          }
          .total-amount-box {
            background: #d4af37 !important;
            color: #ffffff !important;
            text-align: right;
            padding: 10px 14px;
            font-size: 16px;
            font-weight: 800;
            border-top: 1.5px solid #09090d;
          }

          /* Terms Box */
          .terms-container {
            border: 1.5px solid #e5c158;
            border-radius: 12px;
            background: #ffffff;
            padding: 10px 14px;
            margin-top: 14px;
            position: relative;
          }
          .terms-header-pill {
            text-align: center;
            margin-top: -20px;
            margin-bottom: 8px;
          }
          .terms-header-pill span {
            background: #fffdf5;
            border: 1.5px solid #d4af37;
            padding: 3px 20px;
            border-radius: 16px;
            font-weight: 800;
            font-size: 12px;
            color: #855700;
            font-family: 'Tiro Devanagari Hindi', serif;
            box-shadow: 0 2px 4px rgba(0,0,0,0.04);
          }
          .terms-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6px 16px;
            font-family: 'Tiro Devanagari Hindi', 'Mangal', sans-serif;
            font-size: 11px;
            line-height: 1.45;
            color: #334155;
          }
          .term-item {
            display: flex;
            align-items: flex-start;
            gap: 6px;
          }
          .num-badge {
            background: #d4af37;
            color: #ffffff;
            font-weight: 800;
            font-size: 10px;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            margin-top: 2px;
          }

          /* Declaration Pill */
          .declaration-pill {
            text-align: center;
            margin: 12px 0 10px 0;
          }
          .declaration-pill span {
            border: 1px solid #d4af37;
            background: #fffdf5;
            padding: 4px 20px;
            border-radius: 20px;
            font-size: 11.5px;
            font-weight: 700;
            color: #0f172a;
            font-family: 'Tiro Devanagari Hindi', serif;
            display: inline-flex;
            align-items: center;
            gap: 6px;
          }

          /* Signatures Row */
          .signatures-container {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 24px;
            padding: 0 10px;
            font-family: 'Tiro Devanagari Hindi', serif;
            font-size: 12px;
          }
          .sig-left, .sig-right {
            text-align: center;
            font-weight: 700;
            color: #09090d;
          }
          .sig-line {
            border-bottom: 1px stroke #94a3b8;
            border-style: dotted;
            width: 160px;
            margin-bottom: 6px;
          }
          .thankyou-center {
            text-align: center;
          }
          .thankyou-title {
            font-size: 18px;
            font-weight: 800;
            color: #09090d;
            margin: 0;
          }
          .thankyou-sub {
            font-size: 11px;
            color: #64748b;
            margin-top: 2px;
          }

          /* Dark Footer Bar */
          .dark-footer-bar {
            background: #09090d;
            border-radius: 0 0 10px 10px;
            color: #ffffff;
            padding: 10px 16px;
            margin: 16px -16px -16px -16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 10.5px;
          }
          .footer-feat {
            display: flex;
            align-items: center;
            gap: 8px;
            border-right: 1px solid #334155;
            padding-right: 12px;
          }
          .footer-feat:last-of-type {
            border-right: none;
          }
          .footer-feat-title {
            font-weight: 800;
            color: #ffffff;
            letter-spacing: 0.5px;
          }
          .footer-feat-sub {
            color: #94a3b8;
            font-size: 9.5px;
          }
          .ribbon-badge {
            background: #d4af37;
            color: #09090d;
            padding: 6px 14px;
            border-radius: 4px;
            font-weight: 800;
            text-align: center;
            line-height: 1.1;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }

          .visit-again {
            text-align: center;
            font-family: 'Great Vibes', 'Brush Script MT', cursive;
            font-size: 20px;
            color: #d4af37;
            margin-top: 10px;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
          }
          .visit-again::before, .visit-again::after {
            content: '';
            height: 1px;
            width: 80px;
            background: #d4af37;
          }
        </style>
      </head>
      <body>
        <div class="bill-container">
          
          <!-- Header Wrapper -->
          <div class="header-wrapper">
            <!-- Left Logo Dark Curve -->
            <div class="logo-dark-curve">
              <img src="${JAIN_LOGO_BASE64}" alt="Jain Logo" />
            </div>

            <!-- Center Title (Removed "गैलरी" as requested!) -->
            <div class="title-area">
              <h1 class="shop-title">जैन मोबाईल</h1>
              <div class="title-flourish">❖ ─── ❖ ─── ❖</div>
              <div class="address-line">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>बामंदी रोड, बस स्टैण्ड, बलकवाड़ा</span>
              </div>
            </div>

            <!-- Right Contacts -->
            <div class="contacts-box">
              <div>
                <span class="insta-link">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                  Jain__Mobiles
                </span>
              </div>
              <div class="phone-num">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                9669410999
              </div>
              <div class="phone-num">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                8839766477
              </div>
            </div>
          </div>

          <!-- Tax Invoice Pill Header -->
          <div class="pill-header">
            <div class="pill-badge">TAX INVOICE / BILL</div>
          </div>

          <!-- Customer Info Card -->
          <div class="cust-card">
            <!-- Customer Details (Left) -->
            <div class="cust-left">
              <div class="cust-row">
                <div class="icon-badge">👤</div>
                <div><strong>M/s.</strong> &nbsp;${escapeHtml(sale.customerName)}</div>
              </div>
              <div class="cust-row">
                <div class="icon-badge">🏠</div>
                <div><strong>Address</strong> &nbsp;${escapeHtml(sale.village || "—")}</div>
              </div>
              <div class="cust-row">
                <div class="icon-badge">📞</div>
                <div><strong>Mob.No.</strong> &nbsp;${escapeHtml(sale.customerMobile)}</div>
              </div>
            </div>

            <!-- Invoice Details (Right) -->
            <div>
              <div class="cust-row">
                <div class="icon-badge">📄</div>
                <div><strong>Invoice No.</strong> &nbsp;<span style="font-weight: 800; color: #09090d;">${escapeHtml(sale.id)}</span></div>
              </div>
              <div class="cust-row">
                <div class="icon-badge">📅</div>
                <div><strong>Date</strong> &nbsp;${escapeHtml(sale.date)}</div>
              </div>
            </div>
          </div>

          <!-- Particulars Items Table -->
          <table class="particulars-table">
            <thead>
              <tr>
                <th style="width: 8%;">SR. NO.</th>
                <th style="width: 48%;">PARTICULARS</th>
                <th style="width: 12%;">QTY.</th>
                <th style="width: 16%;">RATE</th>
                <th style="width: 16%;">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              ${itemRowsHtml}
              <tr>
                <td colspan="4" class="total-row-label">TOTAL</td>
                <td class="total-amount-box">₹${(Number(sale?.totalAmount) || 0).toLocaleString("en-IN")}</td>
              </tr>
            </tbody>
          </table>

          <!-- Terms & Conditions Box (Hindi Script) -->
          <div class="terms-container">
            <div class="terms-header-pill">
              <span>नियम एवं शर्तें :-</span>
            </div>
            <div class="terms-grid">
              <div class="term-item">
                <div class="num-badge">1</div>
                <div>बेचा हुआ माल वापस नहीं होगा।</div>
              </div>
              <div class="term-item">
                <div class="num-badge">6</div>
                <div>हेडफोन की कोई वारंटी नहीं होगी।</div>
              </div>
              <div class="term-item">
                <div class="num-badge">2</div>
                <div>हम विक्रेता है निर्माता नहीं।</div>
              </div>
              <div class="term-item">
                <div class="num-badge">7</div>
                <div>मोबाईल या किसी भी इलेक्ट्रॉनिक सामान खराब होने पर ग्राहक को स्वयं मोबाईल सर्विस सेंटर ले जाना होगा।</div>
              </div>
              <div class="term-item">
                <div class="num-badge">3</div>
                <div>मोबाईल फोन में सर्विस वारंटी 1 वर्ष की कंपनी की ओर से रहती है।</div>
              </div>
              <div class="term-item">
                <div class="num-badge">8</div>
                <div>किसी भी प्रकार का चार्ज आइटम खरीदने से पहले एक बार सोच ले दुकान से नीचे उतरने के बाद हमारी कोई गारंटी नहीं रहेगी।</div>
              </div>
              <div class="term-item">
                <div class="num-badge">4</div>
                <div>पानी में भीगी हुए, नीचे गिरें हुए अथवा मैकेनिक द्वारा छेड़े गये हुए मोबाईल की कोई वारंटी मान्य नहीं होगी।</div>
              </div>
              <div class="term-item">
                <div class="num-badge">9</div>
                <div>भूल-चुक लेनी देनी।</div>
              </div>
              <div class="term-item">
                <div class="num-badge">5</div>
                <div>मोबाईल फोन की सर्विस के लिए 20 से 45 दिन लगेंगे।</div>
              </div>
            </div>
          </div>

          <!-- Declaration Pill -->
          <div class="declaration-pill">
            <span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
              उपरोक्त सामग्री सही/चालू स्थिति में प्राप्त हुई ।
            </span>
          </div>

          <!-- Signatures (Removed "गैलरी" as requested!) -->
          <div class="signatures-container">
            <div class="sig-left">
              <div class="sig-line"></div>
              <div>ग्राहक के हस्ताक्षर</div>
            </div>
            <div class="thankyou-center">
              <div class="thankyou-title">धन्यवाद !</div>
              <div class="thankyou-sub">आपकी संतुष्टि, हमारी प्राथमिकता</div>
            </div>
            <div class="sig-right">
              <div class="sig-line"></div>
              <div>फ़ॉर- जैन मोबाईल</div>
            </div>
          </div>

          <!-- Dark Footer Bar -->
          <div class="dark-footer-bar">
            <div class="footer-feat">
              <span style="font-size: 14px;">👤</span>
              <div>
                <div class="footer-feat-title">BEST PRODUCTS</div>
                <div class="footer-feat-sub">100% Original</div>
              </div>
            </div>
            <div class="footer-feat">
              <span style="font-size: 14px;">😃</span>
              <div>
                <div class="footer-feat-title">CUSTOMER SATISFACTION</div>
                <div class="footer-feat-sub">Our First Priority</div>
              </div>
            </div>
            <div class="footer-feat">
              <span style="font-size: 14px;">🎧</span>
              <div>
                <div class="footer-feat-title">AFTER SALES SUPPORT</div>
                <div class="footer-feat-sub">Always Here For You</div>
              </div>
            </div>
            <div class="ribbon-badge">
              THANK YOU
            </div>
          </div>

          <!-- Visit Again Cursive -->
          <div class="visit-again">
            Visit Again!
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

        <div className="w-full overflow-x-auto">
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
