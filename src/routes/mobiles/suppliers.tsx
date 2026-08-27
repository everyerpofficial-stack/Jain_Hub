import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Search, Eye, Plus, Edit, Trash2, Phone, Mail, MapPin, Receipt, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Badge, Card, SectionHeader, StatCard } from "@/components/ui-kit";
import { useMobileStore, MobileSupplier } from "@/lib/mobileStore";
import { settleSupplier } from "@/lib/ledger";

/**
 * Case/whitespace-insensitive key for matching a supplier by name.
 * Coerces first: a supplier whose name is all digits comes back from Google
 * Sheets as a NUMBER, and .trim() on it threw while rendering this page.
 */
const norm = (v: unknown) => String(v ?? "").trim().toLowerCase();

export const Route = createFileRoute("/mobiles/suppliers")({
  head: () => ({
    meta: [
      { title: "Suppliers · Jain Mobiles ERP" },
      { name: "description", content: "Mobile shop wholesale suppliers management." },
    ],
  }),
  component: SuppliersPage,
});

function SupplierDetailsDialog({
  s: supplier,
  onClose
}: {
  s: MobileSupplier;
  onClose: () => void;
}) {
  const purchases = useMobileStore((state) => state.purchases) || [];
  const supplierPayments = useMobileStore((state) => state.supplierPayments) || [];

  const supplierPurchases = purchases.filter(
    (p) =>
      p.supplierId === supplier.id ||
      (!!p.supplierName && norm(p.supplierName) === norm(supplier.name))
  ).sort((a, b) => {
    const da = new Date(a.date).getTime();
    const db = new Date(b.date).getTime();
    if (Number.isNaN(da) || Number.isNaN(db) || da === db) return b.id.localeCompare(a.id);
    return db - da;
  });

  const matchedPayments = supplierPayments.filter(
    (pay) =>
      pay.supplierId === supplier.id ||
      (!!pay.supplierName && norm(pay.supplierName) === norm(supplier.name))
  ).sort((a, b) => {
    const da = new Date(a.date).getTime();
    const db = new Date(b.date).getTime();
    if (Number.isNaN(da) || Number.isNaN(db) || da === db) return b.id.localeCompare(a.id);
    return db - da;
  });

  const allPayments = matchedPayments.reduce((sum, pay) => sum + (pay.amount || 0), 0);
  const settlement = settleSupplier(supplierPurchases, allPayments);
  const { totalPurchases, totalPaid } = settlement;
  const currentOutstanding = supplierPurchases.length > 0 ? settlement.outstanding : supplier.outstanding;

  /** Per-row settlement, including the Partial state the stored status can't express. */
  const settlementFor = (p: { id: string; amount: number }) =>
    settlement.byPurchaseId.get(p.id) ?? { paid: 0, due: p.amount || 0, label: "Outstanding" as const };

  const formatInr = (num: number) => "₹" + Math.round(num).toLocaleString("en-IN");

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-0 rounded-xl border border-border shadow-2xl">
        <div className="flex items-start justify-between p-6 border-b border-border bg-foreground text-background">
          <div>
            <div className="text-[10px] opacity-65 font-mono uppercase tracking-wider mb-1">
              Supplier ledger record · {supplier.id}
            </div>
            <DialogTitle className="text-xl font-bold mt-0.5 text-background flex items-center gap-2">
              {supplier.name}
              <Badge tone={currentOutstanding > 0 ? "warning" : "success"}>
                {currentOutstanding > 0 ? "Outstanding Debt" : "Settled Ledger"}
              </Badge>
            </DialogTitle>
          </div>
          <button onClick={onClose} className="size-7 rounded-full border border-white/20 grid place-items-center hover:bg-white/10 transition-colors text-background cursor-pointer">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6 bg-background/50 text-sm">
          {/* Contacts & Address */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 space-y-1.5 border-border/60 bg-surface">
              <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-1">
                <Phone className="size-3 text-primary" /> Contact details
              </div>
              <div className="font-semibold text-foreground">{supplier.contact || "—"}</div>
            </Card>

            <Card className="p-4 space-y-1.5 border-border/60 bg-surface col-span-2">
              <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-1">
                <MapPin className="size-3.5 text-primary" /> Warehouse Address
              </div>
              <div className="font-semibold text-foreground text-xs leading-relaxed">{supplier.address || "—"}</div>
            </Card>
          </div>

          {/* Ledger Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Card className="p-3 bg-muted/20 border-border/60">
              <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Total Purchases</div>
              <div className="text-base font-extrabold text-foreground mt-1">{formatInr(totalPurchases)}</div>
              <div className="text-[10px] text-muted-foreground">{supplierPurchases.length} bills logged</div>
            </Card>
            <Card className="p-3 bg-emerald-500/10 border-emerald-500/20">
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Total Amount Paid</div>
              <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{formatInr(totalPaid)}</div>
              <div className="text-[10px] text-muted-foreground">{matchedPayments.length} payment txns</div>
            </Card>
            <Card className="p-3 bg-red-500/10 border-red-500/20">
              <div className="text-[10px] text-red-600 dark:text-red-400 font-bold uppercase tracking-wider">Outstanding Debt</div>
              <div className="text-base font-extrabold text-red-600 dark:text-red-400 mt-1">{formatInr(currentOutstanding)}</div>
              <div className="text-[10px] text-muted-foreground">Remaining balance</div>
            </Card>
          </div>

          {/* Ledger / Purchases from this supplier */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5 border-b border-border pb-1.5">
              <Receipt className="size-4 text-primary" /> Inward Orders & Purchases ({supplierPurchases.length})
            </h3>
            {supplierPurchases.length === 0 ? (
              <div className="text-center py-6 text-xs text-muted-foreground bg-surface border border-border/50 rounded-lg">
                No purchase logs recorded for this supplier.
              </div>
            ) : (
              <div className="overflow-hidden border border-border/60 rounded-lg bg-surface text-xs">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-muted-foreground uppercase border-b border-border bg-muted/20">
                      <th className="py-2 px-3 font-semibold">Bill ID</th>
                      <th className="py-2 px-3 font-semibold">Date</th>
                      <th className="py-2 px-3 font-semibold">Invoice No</th>
                      <th className="py-2 px-3 text-center font-semibold">Qty</th>
                      <th className="py-2 px-3 text-right font-semibold">Total Amount</th>
                      <th className="py-2 px-3 text-right font-semibold">Paid Amount</th>
                      <th className="py-2 px-3 text-right font-semibold">Due Amount</th>
                      <th className="py-2 px-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supplierPurchases.map((p) => {
                      const { paid, due, label } = settlementFor(p);
                      return (
                        <tr key={p.id} className="border-b border-border hover:bg-accent/20 last:border-0">
                          <td className="py-2 px-3 font-mono font-semibold text-muted-foreground">{p.id}</td>
                          <td className="py-2 px-3 text-muted-foreground">{p.date}</td>
                          <td className="py-2 px-3 font-mono">{p.invoiceNo}</td>
                          <td className="py-2 px-3 text-center font-bold">{p.quantity}</td>
                          <td className="py-2 px-3 text-right font-bold">{formatInr(p.amount)}</td>
                          <td className="py-2 px-3 text-right font-bold text-emerald-600">
                            {paid > 0 ? formatInr(paid) : "—"}
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-red-500">
                            {due > 0 ? formatInr(due) : "—"}
                          </td>
                          <td className="py-2 px-3">
                            <Badge tone={label === "Paid" ? "success" : label === "Partial" ? "info" : "warning"}>
                              {label}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Payment History */}
          <div className="space-y-2.5 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5 border-b border-border pb-1.5">
              <CreditCard className="size-4 text-primary" /> Payment Ledger Details ({matchedPayments.length})
            </h3>
            {matchedPayments.length === 0 ? (
              <div className="text-center py-6 text-xs text-muted-foreground bg-surface border border-border/50 rounded-lg">
                No payments logged for this supplier.
              </div>
            ) : (
              <div className="overflow-hidden border border-border/60 rounded-lg bg-surface text-xs">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-muted-foreground uppercase border-b border-border bg-muted/20">
                      <th className="py-2 px-3 font-semibold">Payment ID</th>
                      <th className="py-2 px-3 font-semibold">Date</th>
                      <th className="py-2 px-3 text-right font-semibold">Amount Paid</th>
                      <th className="py-2 px-3 font-semibold">Remark / Ref</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matchedPayments.map((pay) => (
                      <tr key={pay.id} className="border-b border-border hover:bg-accent/20 last:border-0">
                        <td className="py-2 px-3 font-mono font-semibold text-muted-foreground">{pay.id}</td>
                        <td className="py-2 px-3 text-muted-foreground">{pay.date}</td>
                        <td className="py-2 px-3 text-right font-bold text-emerald-600">{formatInr(pay.amount)}</td>
                        <td className="py-2 px-3 text-muted-foreground">{pay.remark || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-border bg-surface flex justify-end">
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-md border border-border bg-surface text-sm font-semibold hover:bg-accent transition-colors cursor-pointer"
          >
            Close Profile
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SupplierFormDialog({
  s: supplier,
  onClose
}: {
  s?: MobileSupplier;
  onClose: () => void;
}) {
  const addSupplier = useMobileStore((s) => s.addSupplier);
  const updateSupplier = useMobileStore((s) => s.updateSupplier);

  const [name, setName] = useState("");
  const [gstNo, setGstNo] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (supplier) {
      setName(supplier.name);
      setGstNo(supplier.gstNo || "");
      setContact(supplier.contact);
      setAddress(supplier.address);
    }
  }, [supplier]);

  const isContactValid = contact.trim().length >= 10;
  const canSubmit = name.trim() && isContactValid;

  const handleSave = () => {
    const data = {
      name: name.trim(),
      gstNo: gstNo.trim(),
      contact: contact.trim(),
      address: address.trim()
    };

    if (supplier) {
      updateSupplier(supplier.id, data);
      toast.success(`Supplier profile updated: ${name}`);
    } else {
      addSupplier(data);
      toast.success(`Supplier profile added: ${name}`);
    }
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm rounded-xl border border-border shadow-2xl p-6">
        <DialogHeader className="border-b border-border pb-3">
          <DialogTitle className="text-base font-bold">
            {supplier ? "Edit Supplier Details" : "Add Wholesale Supplier"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Save distributor details for stock procurement.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3.5 text-sm">
          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">Supplier / Company Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aarav Mobile Distributors"
              className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
            />
          </label>



          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">Contact Number</span>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={contact}
              onChange={(e) => setContact(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="e.g. 9811234567"
              className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">Warehouse / Office Address</span>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Street Address, City, Pincode"
              className="mt-1 h-16 w-full rounded-md border border-border bg-surface p-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none resize-none font-sans"
            />
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
            Save Supplier
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SupplierPayBalanceDialog({
  supplier,
  onClose
}: {
  supplier: MobileSupplier;
  onClose: () => void;
}) {
  const paySupplier = useMobileStore((s) => s.paySupplier);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMode, setPaymentMode] = useState<"Cash" | "UPI" | "Cash & UPI">("Cash");
  const [cashAmount, setCashAmount] = useState<number | "">("");
  const [bankAmount, setBankAmount] = useState<number | "">("");
  const [remark, setRemark] = useState("");

  const handleAmountChange = (valStr: string) => {
    setAmount(valStr);
    const total = Number(valStr) || 0;
    if (paymentMode === "Cash & UPI") {
      const half = Math.floor(total / 2);
      setCashAmount(half);
      setBankAmount(total - half);
    }
  };

  const handleModeChange = (mode: "Cash" | "UPI" | "Cash & UPI") => {
    setPaymentMode(mode);
    const total = Number(amount) || 0;
    if (mode === "Cash & UPI") {
      const half = Math.floor(total / 2);
      setCashAmount(half);
      setBankAmount(total - half);
    }
  };

  const handleSave = () => {
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }
    if (amt > supplier.outstanding) {
      toast.error("Cannot record payment larger than total outstanding balance");
      return;
    }
    if (paymentMode === "Cash & UPI") {
      const c = Number(cashAmount) || 0;
      const b = Number(bankAmount) || 0;
      if (c + b !== amt) {
        toast.error(`Cash (₹${c}) + UPI (₹${b}) must equal Total Amount (₹${amt})`);
        return;
      }
    }

    const formattedDate = new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    const finalRemark = remark.trim()
      ? `${remark.trim()} (${paymentMode === "Cash & UPI" ? `Cash: ₹${cashAmount}, UPI: ₹${bankAmount}` : paymentMode})`
      : `Paid via ${paymentMode === "Cash & UPI" ? `Cash (₹${cashAmount}) & UPI (₹${bankAmount})` : paymentMode}`;

    paySupplier(
      supplier.id,
      amt,
      formattedDate,
      finalRemark,
      paymentMode,
      paymentMode === "Cash & UPI" ? (Number(cashAmount) || 0) : paymentMode === "Cash" ? amt : 0,
      paymentMode === "Cash & UPI" ? (Number(bankAmount) || 0) : paymentMode === "UPI" ? amt : 0
    );
    toast.success(`Payment of ₹${amt.toLocaleString("en-IN")} (${paymentMode}) recorded for ${supplier.name}`);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm rounded-xl border border-border shadow-2xl p-6">
        <DialogHeader className="border-b border-border pb-3">
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <CreditCard className="size-5 text-primary" />
            <span>Record Supplier Payment</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Debit outstanding balance ledger for <strong>{supplier.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3.5 text-sm">
          <div className="flex justify-between items-center bg-muted/30 p-2.5 rounded border border-border/60 text-xs">
            <span className="text-muted-foreground font-medium">Outstanding Debt Balance:</span>
            <span className="font-bold text-danger text-sm">₹{supplier.outstanding.toLocaleString("en-IN")}</span>
          </div>

          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">Payment Date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">Payment Amount Paid (₹)</span>
            <input
              type="number"
              max={supplier.outstanding}
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="e.g. 20000"
              className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">Payment Mode</span>
            <select
              value={paymentMode}
              onChange={(e) => handleModeChange(e.target.value as "Cash" | "UPI" | "Cash & UPI")}
              className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none font-semibold"
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Cash & UPI">Cash & UPI</option>
            </select>
          </label>

          {paymentMode === "Cash & UPI" && (
            <div className="grid grid-cols-2 gap-3 bg-muted/20 p-3 rounded-lg border border-border/50 animate-in fade-in duration-200">
              <label className="block">
                <span className="text-xs font-semibold text-muted-foreground">Cash Portion (₹)</span>
                <input
                  type="number"
                  value={cashAmount}
                  onChange={(e) => {
                    const c = Number(e.target.value) || 0;
                    setCashAmount(c);
                    const total = Number(amount) || 0;
                    setBankAmount(Math.max(0, total - c));
                  }}
                  className="mt-1 h-8 w-full rounded-md border border-border bg-surface px-2.5 text-xs focus:outline-none font-semibold"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-muted-foreground">UPI Portion (₹)</span>
                <input
                  type="number"
                  value={bankAmount}
                  onChange={(e) => {
                    const b = Number(e.target.value) || 0;
                    setBankAmount(b);
                    const total = Number(amount) || 0;
                    setCashAmount(Math.max(0, total - b));
                  }}
                  className="mt-1 h-8 w-full rounded-md border border-border bg-surface px-2.5 text-xs focus:outline-none font-semibold"
                />
              </label>
            </div>
          )}

          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">Remark / Ref (optional)</span>
            <input
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="e.g. UPI Ref #9928"
              className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
            />
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
            disabled={!amount || Number(amount) <= 0}
            onClick={handleSave}
            className="h-9 px-4 rounded-md bg-foreground text-background text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all ml-auto"
          >
            Confirm Payment
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SuppliersPage() {
  const suppliers = useMobileStore((s) => s.suppliers) || [];
  const purchases = useMobileStore((s) => s.purchases) || [];
  const supplierPayments = useMobileStore((s) => s.supplierPayments) || [];
  const deleteSupplier = useMobileStore((s) => s.deleteSupplier);

  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<MobileSupplier | null>(null);
  const [editing, setEditing] = useState<MobileSupplier | null>(null);
  const [paying, setPaying] = useState<MobileSupplier | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const combinedSuppliersList: MobileSupplier[] = [...suppliers];
  (purchases || []).forEach((p) => {
    if (p.supplierName && !combinedSuppliersList.some((s) => norm(s.name) === norm(p.supplierName) || s.id === p.supplierId)) {
      combinedSuppliersList.push({
        id: p.supplierId || `MS-${combinedSuppliersList.length + 1}`,
        name: p.supplierName,
        contact: "—",
        address: "—",
        outstanding: p.status === "Outstanding" ? p.amount : 0,
      });
    }
  });

  const getSupplierStats = (s: MobileSupplier) => {
    const sPurchases = purchases.filter(
      (p) => p.supplierId === s.id || (!!p.supplierName && norm(p.supplierName) === norm(s.name))
    );
    const sPayments = supplierPayments.filter(
      (pay) => pay.supplierId === s.id || (!!pay.supplierName && norm(pay.supplierName) === norm(s.name))
    );

    // Same rule as the profile dialog. Summing "Paid" purchases AND supplier
    // payments counted every pay-now purchase twice (recordPurchase writes
    // both records), which inflated Total Paid and understated the debt shown
    // in this list and in the total-debt card.
    const paymentTotal = sPayments.reduce((sum, pay) => sum + (pay.amount || 0), 0);
    const settled = settleSupplier(sPurchases, paymentTotal);

    return {
      totalPurchases: settled.totalPurchases,
      totalPaid: settled.totalPaid,
      outstanding: sPurchases.length > 0 ? settled.outstanding : s.outstanding,
    };
  };

  const filtered = combinedSuppliersList.filter((s) => {
    if (q) {
      const text = q.toLowerCase();
      return [s.name, s.contact, s.id].some((v) => String(v ?? "").toLowerCase().includes(text));
    }
    return true;
  });

  const formatInr = (num: number) => "₹" + Math.round(num).toLocaleString("en-IN");

  const totalStoreDebt = combinedSuppliersList.reduce((sum, s) => sum + getSupplierStats(s).outstanding, 0);

  return (
    <AppShell breadcrumb="Suppliers">
      {selected && <SupplierDetailsDialog s={selected} onClose={() => setSelected(null)} />}
      {(isAdding || editing) && (
        <SupplierFormDialog
          s={editing || undefined}
          onClose={() => {
            setIsAdding(false);
            setEditing(null);
          }}
        />
      )}
      {paying && <SupplierPayBalanceDialog supplier={paying} onClose={() => setPaying(null)} />}

      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight">Wholesale Supplier Directory</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filtered.length} suppliers registered in store databases
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsAdding(true)}
            className="h-9 px-4 rounded-md bg-foreground text-background text-sm font-semibold inline-flex items-center gap-1.5 hover:opacity-90 shadow transition-opacity cursor-pointer"
          >
            <Plus className="size-3.5" /> Add Supplier
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Wholesale Vendors" value={combinedSuppliersList.length.toString()} sub="Procurement suppliers" icon={<Users className="size-4" />} />
        <StatCard label="Ledger Debt outstanding" value={formatInr(totalStoreDebt)} sub="Total unpaid vendor balances" icon={<CreditCard className="size-4" />} trend={totalStoreDebt > 0 ? "warn" : "up"} />
        <StatCard label="Distributor Partners" value={combinedSuppliersList.length.toString()} sub="Procurement partners" />
        <StatCard label="Fully Cleared Ledgers" value={combinedSuppliersList.filter(s => getSupplierStats(s).outstanding === 0).length.toString()} sub="Vendors with zero balance" trend="up" />
      </div>

      <Card>
        {/* Search */}
        <div className="p-4 border-b border-border">
          <div className="relative max-w-md">
            <Search className="size-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by supplier name, contact info..."
              className="h-9 w-full rounded-md border border-border bg-background pl-8 pr-3 text-sm focus:outline-none"
            />
          </div>
        </div>

        <SectionHeader
          title={`${filtered.length} Supplier Accounts`}
          action={<span className="text-xs text-muted-foreground">Click row to open ledger statement history</span>}
        />

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border bg-muted/10">
                <th className="py-3 px-5 font-semibold">Vendor ID</th>
                <th className="py-3 px-4 font-semibold">Supplier Name</th>
                <th className="py-3 px-4 font-semibold">Contact No</th>
                <th className="py-3 px-4 text-right font-semibold">Total Purchases</th>
                <th className="py-3 px-4 text-right font-semibold">Total Paid</th>
                <th className="py-3 px-4 text-right font-semibold">Outstanding Debt</th>
                <th className="py-3 px-5 text-right font-semibold">Ledger Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground font-semibold">
                    No suppliers found matching the filters.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => {
                  const stats = getSupplierStats(s);
                  return (
                    <tr
                      key={s.id}
                      onClick={() => setSelected(s)}
                      className="border-b border-border hover:bg-accent/40 cursor-pointer transition-colors last:border-0"
                    >
                      <td className="py-3 px-5 font-mono text-xs text-muted-foreground">{s.id}</td>
                      <td className="py-3 px-4 font-semibold text-foreground">{s.name}</td>
                      <td className="py-3 px-4 font-mono text-xs">{s.contact}</td>
                      <td className="py-3 px-4 text-right font-bold text-foreground">{formatInr(stats.totalPurchases)}</td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-600">{formatInr(stats.totalPaid)}</td>
                      <td className={`py-3 px-4 text-right font-extrabold ${stats.outstanding > 0 ? "text-danger" : "text-success"}`}>
                        {formatInr(stats.outstanding)}
                      </td>
                      <td className="py-3 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex gap-1.5">
                          <button
                            title="Open Ledger History"
                            onClick={() => setSelected(s)}
                            className="size-8 rounded border border-primary/10 bg-primary/5 text-primary grid place-items-center hover:bg-primary hover:text-white transition-colors cursor-pointer"
                          >
                            <Eye className="size-3.5" />
                          </button>
                          {stats.outstanding > 0 && (
                            <button
                              title="Record Payment"
                              onClick={() => setPaying(s)}
                              className="h-8 px-2.5 rounded border border-success/15 bg-success/5 text-success inline-flex items-center gap-1 hover:bg-success hover:text-white transition-colors text-xs font-semibold shadow-sm cursor-pointer"
                            >
                              <CreditCard className="size-3" /> Pay
                            </button>
                          )}
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
// Stub inputs to prevent TS compilation warnings if needed
import { Users } from "lucide-react";
