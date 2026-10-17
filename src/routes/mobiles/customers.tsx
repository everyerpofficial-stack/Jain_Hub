import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import {
  Search,
  Eye,
  Plus,
  Edit,
  Mail,
  Phone,
  MapPin,
  History,
  ShieldAlert,
  Users,
  Trash2,
  HandCoins,
  User,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Receipt,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Badge, Card, SectionHeader, StatCard } from "@/components/ui-kit";
import { useMobileStore, MobileCustomer, MobileSale, safeItems } from "@/lib/mobileStore";
import { VILLAGES } from "@/lib/store";
import { CollectSalePaymentDialog } from "./sales";

export const Route = createFileRoute("/mobiles/customers")({
  head: () => ({
    meta: [
      { title: "Customers · Jain Mobiles ERP" },
      { name: "description", content: "Mobile shop customer registry, dues, and transaction logs." },
    ],
  }),
  component: CustomersPage,
});

function formatInr(num?: number) {
  return "₹" + Math.round(num || 0).toLocaleString("en-IN");
}

function CustomerDetailsDialog({
  c: customer,
  onClose,
}: {
  c: MobileCustomer;
  onClose: () => void;
}) {
  const sales = useMobileStore((s) => s.sales) || [];
  const audit = useMobileStore((s) => s.audit) || [];
  const [payingSale, setPayingSale] = useState<MobileSale | null>(null);

  // Match sales belonging to this customer by id, clean mobile number, or exact customer name
  const custCleanMob = String(customer.mobile || "").replace(/[^\d]/g, "");
  const custSales = useMemo(() => {
    return sales.filter((s) => {
      if (s.customerId && s.customerId === customer.id) return true;
      const sCleanMob = String(s.customerMobile || "").replace(/[^\d]/g, "");
      if (custCleanMob && sCleanMob && custCleanMob === sCleanMob) return true;
      if (customer.name && s.customerName && s.customerName.trim().toLowerCase() === customer.name.trim().toLowerCase()) return true;
      return false;
    });
  }, [sales, customer, custCleanMob]);

  // Sort newest first
  const sortedCustSales = useMemo(() => {
    return [...custSales].sort((a, b) => {
      const dateA = new Date(a.date || "").getTime() || 0;
      const dateB = new Date(b.date || "").getTime() || 0;
      if (dateB !== dateA) return dateB - dateA;
      const numA = parseInt(String(a.id || "").replace(/\D/g, ""), 10) || 0;
      const numB = parseInt(String(b.id || "").replace(/\D/g, ""), 10) || 0;
      return numB - numA;
    });
  }, [custSales]);

  // Fallback to sale records if fatherName or village were recorded during billing
  const fatherName = customer.fatherName || custSales.find((s) => s.fatherName)?.fatherName || "";
  const village = customer.village || custSales.find((s) => s.village)?.village || "";

  // Summary financials
  const totalInvoiced = useMemo(
    () => sortedCustSales.reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0),
    [sortedCustSales]
  );
  const totalDue = useMemo(
    () => sortedCustSales.reduce((sum, s) => sum + (Number(s.dueAmount) || 0), 0),
    [sortedCustSales]
  );
  const totalPaid = useMemo(
    () =>
      sortedCustSales.reduce(
        (sum, s) =>
          sum +
          (s.paymentStatus === "Full Paid"
            ? Number(s.totalAmount) || 0
            : Number(s.amountPaid) || 0),
        0
      ),
    [sortedCustSales]
  );

  // Filter payment collection & audit actions related to this customer
  const relatedAudit = useMemo(() => {
    return audit
      .filter((a) => {
        const target = (a.target || "").toLowerCase();
        if (customer.name && target.includes(customer.name.toLowerCase())) return true;
        if (customer.id && target.includes(customer.id.toLowerCase())) return true;
        if (custSales.some((s) => target.includes(s.id.toLowerCase()))) return true;
        return false;
      })
      .slice(0, 10);
  }, [audit, customer, custSales]);

  return (
    <>
      {payingSale && (
        <CollectSalePaymentDialog
          sale={payingSale}
          onClose={() => setPayingSale(null)}
        />
      )}

      <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-0 rounded-xl border border-border shadow-2xl">
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-border bg-foreground text-background">
            <div>
              <div className="text-[10px] opacity-75 font-mono uppercase tracking-wider mb-1">
                Customer Profile Record · {customer.id}
              </div>
              <DialogTitle className="text-xl font-bold mt-0.5 text-background flex flex-wrap items-center gap-2">
                <span>{customer.name}</span>
                {fatherName && (
                  <span className="text-xs font-normal opacity-80">(S/O {fatherName})</span>
                )}
                <Badge tone="info">Registered Buyer</Badge>
                {customer.isBlacklisted && <Badge tone="danger">Blacklisted</Badge>}
                {totalDue > 0 ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white animate-pulse">
                    <AlertTriangle className="size-3" /> Due: {formatInr(totalDue)}
                  </span>
                ) : sortedCustSales.length > 0 ? (
                  <Badge tone="success">✓ All Dues Cleared</Badge>
                ) : null}
              </DialogTitle>
              <DialogDescription className="text-xs opacity-75 mt-1 text-background/85">
                Client database entry since {customer.registeredDate}
              </DialogDescription>
            </div>
            <button
              onClick={onClose}
              className="size-7 rounded-full border border-white/20 grid place-items-center hover:bg-white/10 transition-colors text-background"
            >
              ✕
            </button>
          </div>

          <div className="p-6 space-y-6 bg-background/50 text-sm">
            {/* Top Customer Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 space-y-2 border-border/60 bg-surface">
                <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-1">
                  <Phone className="size-3 text-primary" /> Contact Details
                </div>
                <div className="font-semibold text-foreground">{customer.mobile || "—"}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Mail className="size-3 text-muted-foreground/70" />
                  <span>{customer.email || "No email address"}</span>
                </div>
              </Card>

              <Card className="p-4 space-y-2 border-border/60 bg-surface">
                <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-1">
                  <User className="size-3 text-primary" /> Family & Origin
                </div>
                <div className="text-xs">
                  <span className="text-muted-foreground">Father's Name: </span>
                  <span className="font-semibold text-foreground">{fatherName || "—"}</span>
                </div>
                <div className="text-xs">
                  <span className="text-muted-foreground">Village / Town: </span>
                  <span className="font-semibold text-foreground">{village || "—"}</span>
                </div>
              </Card>

              <Card className="p-4 space-y-2 border-border/60 bg-surface">
                <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="size-3 text-primary" /> Billing Address
                </div>
                <div className="font-semibold text-foreground text-xs leading-relaxed">
                  {customer.address || "No billing address details"}
                </div>
              </Card>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-lg border border-border/70 bg-surface">
                <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                  <span>Total Purchases</span>
                  <Receipt className="size-3.5 text-muted-foreground" />
                </div>
                <div className="text-xl font-bold text-foreground mt-1.5">{formatInr(totalInvoiced)}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{sortedCustSales.length} bills generated</div>
              </div>

              <div className="p-3.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
                <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Total Paid</span>
                  <CheckCircle2 className="size-3.5 text-emerald-600" />
                </div>
                <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-1.5">{formatInr(totalPaid)}</div>
                <div className="text-[11px] text-emerald-600/80 mt-0.5">Verified receipts collected</div>
              </div>

              <div className={`p-3.5 rounded-lg border ${totalDue > 0 ? "border-red-500/40 bg-red-500/10" : "border-border/70 bg-surface"}`}>
                <div className="text-[11px] font-bold uppercase tracking-wider flex items-center justify-between text-muted-foreground">
                  <span className={totalDue > 0 ? "text-red-700 dark:text-red-400 font-bold" : ""}>Outstanding Due</span>
                  <AlertTriangle className={`size-3.5 ${totalDue > 0 ? "text-red-600 animate-pulse" : "text-muted-foreground"}`} />
                </div>
                <div className={`text-xl font-extrabold mt-1.5 ${totalDue > 0 ? "text-red-600 dark:text-red-400" : "text-foreground"}`}>
                  {formatInr(totalDue)}
                </div>
                <div className="text-[11px] mt-0.5 text-muted-foreground">
                  {totalDue > 0 ? "Remaining customer debt" : "Zero pending balance"}
                </div>
              </div>
            </div>

            {/* Purchases & Invoices History Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <History className="size-4 text-primary" /> Purchases & Transaction History ({sortedCustSales.length})
                </h3>
                {totalDue > 0 && (
                  <span className="text-xs text-red-600 font-semibold flex items-center gap-1">
                    <AlertTriangle className="size-3.5" />
                    Pending dues: {formatInr(totalDue)}
                  </span>
                )}
              </div>

              {sortedCustSales.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground bg-surface border border-border/50 rounded-lg">
                  No purchases recorded for this customer in mobiles ledger.
                </div>
              ) : (
                <div className="overflow-x-auto border border-border/60 rounded-lg bg-surface text-xs">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border bg-muted/20">
                        <th className="py-2.5 px-3 font-semibold">Bill ID</th>
                        <th className="py-2.5 px-3 font-semibold">Date & Dues</th>
                        <th className="py-2.5 px-3 font-semibold">Product & IMEI</th>
                        <th className="py-2.5 px-3 font-semibold">Mode</th>
                        <th className="py-2.5 px-3 text-right font-semibold">Total Bill</th>
                        <th className="py-2.5 px-3 text-right font-semibold">Amount Paid</th>
                        <th className="py-2.5 px-3 text-right font-semibold">Due Balance</th>
                        <th className="py-2.5 px-3 text-center font-semibold">Status</th>
                        <th className="py-2.5 px-3 text-right font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedCustSales.map((s) => {
                        const billDue = Number(s.dueAmount) || 0;
                        const billPaid = s.paymentStatus === "Full Paid"
                          ? Number(s.totalAmount) || 0
                          : Number(s.amountPaid) || 0;

                        return (
                          <tr key={s.id} className="border-b border-border hover:bg-accent/20 last:border-0 transition-colors">
                            <td className="py-2.5 px-3 font-mono font-semibold text-foreground">
                              {s.id}
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <div className="font-medium text-foreground">{s.date}</div>
                              {billDue > 0 ? (
                                <div className="text-[10px] font-bold text-red-600 flex items-center gap-0.5 mt-0.5">
                                  <Clock className="size-2.5" /> Due: {s.dueDate || "Pending"}
                                </div>
                              ) : (
                                <div className="text-[10px] text-emerald-600 font-medium mt-0.5">
                                  ✓ Cleared
                                </div>
                              )}
                            </td>
                            <td className="py-2.5 px-3 font-medium max-w-[200px]">
                              {safeItems(s.items).map((it, idx) => (
                                <div key={idx} className="truncate" title={`${it.productName || "Product"} ${it.imei1 ? `(IMEI: ${it.imei1})` : ""}`}>
                                  {it.productName || "Product"}{" "}
                                  {it.imei1 ? (
                                    <span className="text-[10px] text-muted-foreground font-mono">
                                      ({it.imei1})
                                    </span>
                                  ) : null}
                                </div>
                              ))}
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <Badge tone="neutral">{s.paymentMethod || "Cash"}</Badge>
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-foreground whitespace-nowrap">
                              {formatInr(s.totalAmount)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                              {formatInr(billPaid)}
                            </td>
                            <td className="py-2.5 px-3 text-right whitespace-nowrap">
                              {billDue > 0 ? (
                                <span className="font-extrabold text-red-600 dark:text-red-400">
                                  {formatInr(billDue)}
                                </span>
                              ) : (
                                <span className="text-muted-foreground font-medium">₹0</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-center whitespace-nowrap">
                              {s.paymentStatus === "Full Paid" || billDue === 0 ? (
                                <Badge tone="success">Full Paid</Badge>
                              ) : s.paymentStatus === "Partial Paid" ? (
                                <Badge tone="warning">Partial Paid</Badge>
                              ) : (
                                <Badge tone="danger">Not Paid</Badge>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right whitespace-nowrap">
                              {billDue > 0 ? (
                                <button
                                  onClick={() => setPayingSale(s)}
                                  className="h-7 px-2.5 rounded bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold inline-flex items-center gap-1 shadow-sm transition-colors"
                                  title="Collect due payment from customer"
                                >
                                  <HandCoins className="size-3" />
                                  <span>Pay Due</span>
                                </button>
                              ) : (
                                <span className="text-xs text-muted-foreground/60 italic">
                                  No dues
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Audit / Collection Logs */}
            {relatedAudit.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Clock className="size-3 text-primary" /> Recent Activity & Payment Logs
                </h4>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {relatedAudit.map((log, i) => (
                    <div
                      key={i}
                      className="p-2 rounded bg-muted/20 border border-border/50 text-[11px] flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-foreground">{log.action}: </span>
                        <span className="text-muted-foreground">{log.target}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                        {log.ts}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-border bg-surface flex justify-between items-center">
            <div className="text-xs text-muted-foreground">
              Total Outstanding: <strong className={totalDue > 0 ? "text-red-600 font-extrabold" : "text-foreground"}>{formatInr(totalDue)}</strong>
            </div>
            <button
              onClick={onClose}
              className="h-9 px-4 rounded-md border border-border bg-surface text-sm font-semibold hover:bg-accent transition-colors"
            >
              Close Folder
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function CustomerFormDialog({
  c: customer,
  onClose,
}: {
  c?: MobileCustomer;
  onClose: () => void;
}) {
  const addCustomer = useMobileStore((s) => s.addCustomer);
  const updateCustomer = useMobileStore((s) => s.updateCustomer);

  const [name, setName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [village, setVillage] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [isBlacklisted, setIsBlacklisted] = useState(false);

  useEffect(() => {
    if (customer) {
      setName(customer.name || "");
      setFatherName(customer.fatherName || "");
      setVillage(customer.village || "");
      setMobile(customer.mobile || "");
      setEmail(customer.email || "");
      setAddress(customer.address || "");
      setIsBlacklisted(customer.isBlacklisted || false);
    }
  }, [customer]);

  const isMobileValid = /^\d{10}$/.test(mobile.trim().replace(/[^\d]/g, ""));
  const canSubmit = name.trim() && isMobileValid;

  const handleSave = () => {
    const data = {
      name: name.trim(),
      fatherName: fatherName.trim(),
      village: village.trim(),
      mobile: mobile.trim(),
      email: email.trim(),
      address: address.trim(),
      isBlacklisted,
    };

    if (customer) {
      updateCustomer(customer.id, data);
      toast.success(`Customer profile updated: ${name}`);
    } else {
      addCustomer(data);
      toast.success(`Customer profile registered: ${name}`);
    }
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-xl border border-border shadow-2xl p-6">
        <DialogHeader className="border-b border-border pb-3">
          <DialogTitle className="text-base font-bold">
            {customer ? "Edit Customer Details" : "Register Mobile Customer"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Save complete client and family details in store database.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block sm:col-span-2">
              <span className="text-xs font-semibold text-muted-foreground">Full Name *</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Suresh Patil"
                className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-muted-foreground">Father's Name</span>
              <input
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                placeholder="e.g. Ramesh Patil"
                className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-muted-foreground">Village / Town</span>
              <input
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                placeholder="e.g. Katriya"
                className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
                list="customer-village-options"
              />
              <datalist id="customer-village-options">
                {VILLAGES.map((v) => (
                  <option key={v} value={v} />
                ))}
              </datalist>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-semibold text-muted-foreground">Mobile Number (10 digits) *</span>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="e.g. 9822011223"
                className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-muted-foreground">Email Address</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. suresh@gmail.com"
                className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">Billing Address</span>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Main Street, Near Shivaji Chowk"
              rows={2}
              className="mt-1 w-full rounded-md border border-border bg-surface p-2.5 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none resize-none"
            />
          </label>

          <label className="flex items-center gap-2 mt-1 cursor-pointer border border-border/40 bg-surface rounded-md p-2.5">
            <input
              type="checkbox"
              checked={isBlacklisted}
              onChange={(e) => setIsBlacklisted(e.target.checked)}
              className="size-4 rounded border-border text-danger focus:ring-danger"
            />
            <span className="text-xs font-bold text-danger">Blacklist Customer (Blocked from Credit / Purchases)</span>
          </label>
        </div>

        <DialogFooter className="border-t border-border pt-4 flex gap-2">
          <button
            onClick={onClose}
            className="h-9 px-3 rounded-md border border-border bg-surface text-sm hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!canSubmit}
            onClick={handleSave}
            className="h-9 px-4 rounded-md bg-foreground text-background text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all ml-auto"
          >
            Save Client Profile
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CustomersPage() {
  const customers = useMobileStore((s) => s.customers);
  const sales = useMobileStore((s) => s.sales);

  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<MobileCustomer | null>(null);
  const [editing, setEditing] = useState<MobileCustomer | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const updateCustomer = useMobileStore((s) => s.updateCustomer);
  const deleteCustomer = useMobileStore((s) => s.deleteCustomer);

  // Helper to match sales per customer
  const getCustSales = (c: MobileCustomer) => {
    const custCleanMob = String(c.mobile || "").replace(/[^\d]/g, "");
    return sales.filter((s) => {
      if (s.customerId && s.customerId === c.id) return true;
      const sCleanMob = String(s.customerMobile || "").replace(/[^\d]/g, "");
      if (custCleanMob && sCleanMob && custCleanMob === sCleanMob) return true;
      if (c.name && s.customerName && s.customerName.trim().toLowerCase() === c.name.trim().toLowerCase()) return true;
      return false;
    });
  };

  const filtered = customers.filter((c) => {
    if (q) {
      const matchText = q.toLowerCase();
      return [c.name, c.mobile, c.email, c.address, c.fatherName, c.village].some((field) =>
        String(field || "").toLowerCase().includes(matchText)
      );
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const nA = parseInt((a.id || "").replace(/\D/g, ""), 10) || 0;
    const nB = parseInt((b.id || "").replace(/\D/g, ""), 10) || 0;
    return nB - nA;
  });

  const totalStoreDues = useMemo(
    () => sales.reduce((sum, s) => sum + (Number(s.dueAmount) || 0), 0),
    [sales]
  );
  const totalStoreTurnover = useMemo(
    () => sales.reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0),
    [sales]
  );

  return (
    <AppShell breadcrumb="Customers">
      {selected && <CustomerDetailsDialog c={selected} onClose={() => setSelected(null)} />}
      {(isAdding || editing) && (
        <CustomerFormDialog
          c={editing || undefined}
          onClose={() => {
            setIsAdding(false);
            setEditing(null);
          }}
        />
      )}

      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight">Customer Database Registry</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filtered.length} customers registered with purchase logs and dues management
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsAdding(true)}
            className="h-9 px-4 rounded-md bg-foreground text-background text-sm font-semibold inline-flex items-center gap-1.5 hover:opacity-90 shadow transition-opacity"
          >
            <Plus className="size-3.5" /> Register Customer
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Registered"
          value={customers.length.toString()}
          sub="Unique client profiles"
          icon={<Users className="size-4" />}
        />
        <StatCard
          label="Total Invoices Billed"
          value={sales.length.toString()}
          sub="Sales transactions"
          icon={<History className="size-4" />}
        />
        <StatCard
          label="Mobiles Turnover"
          value={formatInr(totalStoreTurnover)}
          sub="Gross billed revenue"
          trend="up"
        />
        <StatCard
          label="Total Customer Dues"
          value={formatInr(totalStoreDues)}
          sub={totalStoreDues > 0 ? "Pending customer balances" : "All customer dues cleared"}
          trend={totalStoreDues > 0 ? "down" : undefined}
          icon={<HandCoins className={`size-4 ${totalStoreDues > 0 ? "text-red-600" : "text-emerald-600"}`} />}
        />
      </div>

      <Card className="w-full overflow-hidden">
        {/* Search */}
        <div className="p-4 border-b border-border">
          <div className="relative max-w-md">
            <Search className="size-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by customer name, father name, village, mobile, address..."
              className="h-9 w-full rounded-md border border-border bg-background pl-8 pr-3 text-sm focus:outline-none"
            />
          </div>
        </div>

        <SectionHeader
          title={`${filtered.length} Registered Customers`}
          action={<span className="text-xs text-muted-foreground">Click row to open customer profile folder & dues</span>}
        />

        <div className="w-full overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border bg-muted/10">
                <th className="py-2.5 px-3 font-semibold">Customer ID</th>
                <th className="py-2.5 px-3 font-semibold">Customer Name & Father</th>
                <th className="py-2.5 px-3 font-semibold">Mobile Number</th>
                <th className="py-2.5 px-3 font-semibold">Village / Address</th>
                <th className="py-2.5 px-3 text-center font-semibold">Bills</th>
                <th className="py-2.5 px-3 text-right font-semibold">Total Spent</th>
                <th className="py-2.5 px-3 text-right font-semibold">Total Due</th>
                <th className="py-2.5 px-3 font-semibold">Since</th>
                <th className="py-2.5 px-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-muted-foreground font-semibold">
                    No customers found in database.
                  </td>
                </tr>
              ) : (
                sorted.map((c) => {
                  const custSalesList = getCustSales(c);
                  const sCount = custSalesList.length;
                  const totalSpent = custSalesList.reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0);
                  const custDue = custSalesList.reduce((sum, s) => sum + (Number(s.dueAmount) || 0), 0);
                  const displayFather = c.fatherName || custSalesList.find((s) => s.fatherName)?.fatherName;
                  const displayVillage = c.village || custSalesList.find((s) => s.village)?.village;

                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelected(c)}
                      className="border-b border-border hover:bg-accent/40 cursor-pointer transition-colors last:border-0"
                    >
                      <td className="py-2.5 px-3 font-mono text-xs text-muted-foreground">{c.id}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-foreground flex items-center gap-1.5">
                          <span>{c.name}</span>
                          {c.isBlacklisted && <Badge tone="danger">Blacklisted</Badge>}
                        </div>
                        {displayFather && (
                          <div className="text-[10px] text-muted-foreground">
                            S/O {displayFather}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-xs">{c.mobile}</td>
                      <td className="py-2.5 px-3 text-muted-foreground max-w-[180px] truncate" title={c.address || displayVillage}>
                        {displayVillage ? (
                          <span className="font-medium text-foreground">{displayVillage}</span>
                        ) : c.address ? (
                          <span>{c.address}</span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold">{sCount}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-success">{formatInr(totalSpent)}</td>
                      <td className="py-2.5 px-3 text-right">
                        {custDue > 0 ? (
                          <span className="inline-block px-2 py-0.5 rounded font-extrabold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900">
                            {formatInr(custDue)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground font-medium">₹0</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-xs text-muted-foreground whitespace-nowrap">{c.registeredDate}</td>
                      <td className="py-2.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex gap-1">
                          <button
                            title="Open Profile Folder & Dues"
                            onClick={() => setSelected(c)}
                            className="size-7 rounded border border-primary/10 bg-primary/5 text-primary grid place-items-center hover:bg-primary hover:text-white transition-colors"
                          >
                            <Eye className="size-3" />
                          </button>
                          <button
                            title="Edit customer profile"
                            onClick={() => setEditing(c)}
                            className="size-7 rounded border border-border bg-surface text-foreground grid place-items-center hover:bg-accent transition-colors"
                          >
                            <Edit className="size-3" />
                          </button>
                          <button
                            title={c.isBlacklisted ? "Whitelist customer" : "Blacklist customer"}
                            onClick={() => {
                              updateCustomer(c.id, { isBlacklisted: !c.isBlacklisted });
                              toast.info(c.isBlacklisted ? `Whitelisted ${c.name}` : `Blacklisted ${c.name}`);
                            }}
                            className={`size-7 rounded border grid place-items-center transition-colors ${
                              c.isBlacklisted
                                ? "border-success/15 bg-success/5 text-success hover:bg-success hover:text-white"
                                : "border-danger/15 bg-danger/5 text-danger hover:bg-danger hover:text-white"
                            }`}
                          >
                            <ShieldAlert className="size-3" />
                          </button>
                          <button
                            title="Delete customer profile"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete customer ${c.name}?`)) {
                                deleteCustomer(c.id);
                                toast.success(`Deleted ${c.name}`);
                              }
                            }}
                            className="size-7 rounded border border-destructive/15 bg-destructive/5 text-destructive grid place-items-center hover:bg-destructive hover:text-white transition-colors"
                          >
                            <Trash2 className="size-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
