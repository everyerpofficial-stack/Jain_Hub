import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Search, Eye, Plus, Edit, Mail, Phone, MapPin, History, ShieldAlert, Users, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Badge, Card, SectionHeader, StatCard } from "@/components/ui-kit";
import { useMobileStore, MobileCustomer, safeItems } from "@/lib/mobileStore";

export const Route = createFileRoute("/mobiles/customers")({
  head: () => ({
    meta: [
      { title: "Customers · Jain Mobiles ERP" },
      { name: "description", content: "Mobile shop customer registry and transaction logs." },
    ],
  }),
  component: CustomersPage,
});


function CustomerDetailsDialog({
  c: customer,
  onClose
}: {
  c: MobileCustomer;
  onClose: () => void;
}) {
  const sales = useMobileStore((s) => s.sales) || [];
  const custSales = sales.filter(
    (s) => String(s.customerMobile || "").replace(/[^\d]/g, "") === String(customer.mobile || "").replace(/[^\d]/g, "")
  );

  const formatInr = (num?: number) => "₹" + Math.round(num || 0).toLocaleString("en-IN");

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 rounded-xl border border-border shadow-2xl">
        <div className="flex items-start justify-between p-6 border-b border-border bg-foreground text-background">
          <div>
            <div className="text-[10px] opacity-65 font-mono uppercase tracking-wider mb-1">
              Customer profile record · {customer.id}
            </div>
            <DialogTitle className="text-xl font-bold mt-0.5 text-background flex items-center gap-2">
              {customer.name}
              <Badge tone="info">Registered Buyer</Badge>
              {customer.isBlacklisted && <Badge tone="danger">Blacklisted</Badge>}
            </DialogTitle>
            <DialogDescription className="text-xs opacity-75 mt-1 text-background/85">
              Client database entry since {customer.registeredDate}
            </DialogDescription>
          </div>
          <button onClick={onClose} className="size-7 rounded-full border border-white/20 grid place-items-center hover:bg-white/10 transition-colors text-background">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6 bg-background/50 text-sm">
          {/* Top Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 space-y-2 border-border/60 bg-surface">
              <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-1">
                <Phone className="size-3 text-primary" /> Contact Details
              </div>
              <div className="font-semibold text-foreground">{customer.mobile}</div>
              <div className="text-xs text-muted-foreground">{customer.email || "No email address"}</div>
            </Card>

            <Card className="p-4 space-y-2 border-border/60 bg-surface col-span-2">
              <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-1">
                <MapPin className="size-3.5 text-primary" /> Address Location
              </div>
              <div className="font-semibold text-foreground">{customer.address || "No billing address details"}</div>
            </Card>
          </div>

          {/* Sales History */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5 border-b border-border pb-1.5">
              <History className="size-4 text-primary" /> Purchases History ({custSales.length})
            </h3>
            {custSales.length === 0 ? (
              <div className="text-center py-6 text-xs text-muted-foreground bg-surface border border-border/50 rounded-lg">
                No purchases recorded for this customer in mobiles ledger.
              </div>
            ) : (
              <div className="overflow-hidden border border-border/60 rounded-lg bg-surface text-xs">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-muted-foreground uppercase border-b border-border bg-muted/20">
                      <th className="py-2 px-3 font-semibold">Bill ID</th>
                      <th className="py-2 px-3 font-semibold">Date</th>
                      <th className="py-2 px-3 font-semibold">Product Name</th>
                      <th className="py-2 px-3 font-semibold">Payment Method</th>
                      <th className="py-2 px-3 text-right font-semibold">Amount Paid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {custSales.map((s) => (
                      <tr key={s.id} className="border-b border-border hover:bg-accent/20 last:border-0">
                        <td className="py-2 px-3 font-mono font-semibold text-muted-foreground">{s.id}</td>
                        <td className="py-2 px-3">{s.date}</td>
                        <td className="py-2 px-3 font-medium">
                          {safeItems(s.items).map(it => `${it.productName || "Product"} (S/N: ${it.imei1 || "N/A"})`).join(", ")}
                        </td>

                        <td className="py-2 px-3">
                          <Badge tone="info">{s.paymentMethod}</Badge>
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-success">{formatInr(s.totalAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Sales History */}
        </div>

        <div className="p-4 border-t border-border bg-surface flex justify-end gap-2">
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-md border border-border bg-surface text-sm font-semibold hover:bg-accent transition-colors"
          >
            Close Folder
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CustomerFormDialog({
  c: customer,
  onClose
}: {
  c?: MobileCustomer;
  onClose: () => void;
}) {
  const addCustomer = useMobileStore((s) => s.addCustomer);
  const updateCustomer = useMobileStore((s) => s.updateCustomer);

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [isBlacklisted, setIsBlacklisted] = useState(false);

  useEffect(() => {
    if (customer) {
      setName(customer.name);
      setMobile(customer.mobile);
      setEmail(customer.email);
      setAddress(customer.address);
      setIsBlacklisted(customer.isBlacklisted || false);
    }
  }, [customer]);

  const isMobileValid = /^\d{10}$/.test(mobile.trim().replace(/[^\d]/g, ""));
  const canSubmit = name.trim() && isMobileValid;

  const handleSave = () => {
    const data = {
      name: name.trim(),
      mobile: mobile.trim(),
      email: email.trim(),
      address: address.trim(),
      isBlacklisted
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
      <DialogContent className="max-w-sm rounded-xl border border-border shadow-2xl p-6">
        <DialogHeader className="border-b border-border pb-3">
          <DialogTitle className="text-base font-bold">
            {customer ? "Edit Customer Details" : "Register Mobile Customer"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Save client details in store database.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3.5 text-sm">
          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">Full Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Suresh Patil"
              className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">Mobile Number</span>
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

          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">Billing Address</span>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Main Street, Shirwal"
              className="mt-1 h-16 w-full rounded-md border border-border bg-surface p-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none resize-none"
            />
          </label>

          <label className="flex items-center gap-2 mt-2 cursor-pointer border border-border/40 bg-surface rounded-md p-2.5">
            <input
              type="checkbox"
              checked={isBlacklisted}
              onChange={(e) => setIsBlacklisted(e.target.checked)}
              className="size-4 rounded border-border text-danger focus:ring-danger"
            />
            <span className="text-xs font-bold text-danger">Blacklist Customer (Blocked from Purchases)</span>
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

  const filtered = customers.filter((c) => {
    if (q) {
      const matchText = q.toLowerCase();
      return [c.name, c.mobile, c.email, c.address].some((field) =>
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

  const getCustSalesCount = (mobile: string) => {
    return sales.filter((s) => String(s.customerMobile || "").replace(/[^\d]/g, "") === String(mobile || "").replace(/[^\d]/g, "")).length;
  };

  const getCustTotalSales = (mobile: string) => {
    return sales
      .filter((s) => String(s.customerMobile || "").replace(/[^\d]/g, "") === String(mobile || "").replace(/[^\d]/g, ""))
      .reduce((sum, s) => sum + (s.totalAmount || 0), 0);
  };

  const formatInr = (num?: number) => "₹" + Math.round(num || 0).toLocaleString("en-IN");

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
            {filtered.length} customers registered in active mobiles database
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
        <StatCard label="Total Registered Customers" value={customers.length.toString()} sub="Unique client profiles" icon={<Users className="size-4" />} />
        <StatCard label="Customer Purchases" value={sales.length.toString()} sub="Completed invoices logged" icon={<History className="size-4" />} />
        <StatCard label="Total Spent Value" value={formatInr(sales.reduce((s, x) => s + x.totalAmount, 0))} sub="Mobiles shop turnover" trend="up" />
        <StatCard label="Avg Spend / Customer" value={formatInr(customers.length ? sales.reduce((s, x) => s + x.totalAmount, 0) / customers.length : 0)} sub="Average ticket value" />
      </div>

      <Card className="w-full overflow-hidden">
        {/* Search */}
        <div className="p-4 border-b border-border">
          <div className="relative max-w-md">
            <Search className="size-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by customer name, mobile number, address..."
              className="h-9 w-full rounded-md border border-border bg-background pl-8 pr-3 text-sm focus:outline-none"
            />
          </div>
        </div>

        <SectionHeader
          title={`${filtered.length} Registered Customers`}
          action={<span className="text-xs text-muted-foreground">Click row to open client folder statement</span>}
        />

        <div className="w-full overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border bg-muted/10">
                <th className="py-2.5 px-3 font-semibold">Customer ID</th>
                <th className="py-2.5 px-3 font-semibold">Full Name</th>
                <th className="py-2.5 px-3 font-semibold">Mobile Number</th>
                <th className="py-2.5 px-3 font-semibold">Email</th>
                <th className="py-2.5 px-3 font-semibold">Address / Location</th>
                <th className="py-2.5 px-3 text-center font-semibold">Orders</th>
                <th className="py-2.5 px-3 text-right font-semibold">Total Spent</th>
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
                  const sCount = getCustSalesCount(c.mobile);
                  const totalSpent = getCustTotalSales(c.mobile);
                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelected(c)}
                      className="border-b border-border hover:bg-accent/40 cursor-pointer transition-colors last:border-0"
                    >
                      <td className="py-2.5 px-3 font-mono text-xs text-muted-foreground">{c.id}</td>
                      <td className="py-2.5 px-3 font-semibold text-foreground flex items-center gap-1.5">
                        <span>{c.name}</span>
                        {c.isBlacklisted && <Badge tone="danger">Blacklisted</Badge>}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-xs">{c.mobile}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{c.email || "—"}</td>
                      <td className="py-2.5 px-3 text-muted-foreground max-w-[180px] truncate" title={c.address}>{c.address || "—"}</td>
                      <td className="py-2.5 px-3 text-center font-bold">{sCount}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-success">{formatInr(totalSpent)}</td>
                      <td className="py-2.5 px-3 text-xs text-muted-foreground whitespace-nowrap">{c.registeredDate}</td>
                      <td className="py-2.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex gap-1">
                          <button
                            title="Open Profile Folder"
                            onClick={() => setSelected(c)}
                            className="size-7 rounded border border-primary/10 bg-primary/5 text-primary grid place-items-center hover:bg-primary hover:text-white transition-colors"
                          >
                            <Eye className="size-3" />
                          </button>
                          <button
                            title="Edit customer profiles"
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

