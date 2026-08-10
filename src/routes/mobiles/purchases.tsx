import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Plus, Search, Receipt, CreditCard, Download, Calendar, ArrowUpRight, ArrowDownLeft, Users, Printer } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Badge, Card, SectionHeader, StatCard } from "@/components/ui-kit";
import { useMobileStore, MobilePurchase, MobileSupplier, MobileProduct, safeItems, getBrandsForCategory } from "@/lib/mobileStore";
import { parseAppDate, isDateInRange } from "@/lib/store";
import { FilterBar, useDateFilter } from "@/components/FilterBar";


export const Route = createFileRoute("/mobiles/purchases")({
  head: () => ({
    meta: [
      { title: "Purchases · Jain Mobiles ERP" },
      { name: "description", content: "Mobile shop vendor purchase logs & ledger." },
    ],
  }),
  component: PurchasesPage,
});

function PurchaseFormDialog({ onClose, onPurchaseLogged }: { onClose: () => void; onPurchaseLogged?: (purchase: MobilePurchase) => void }) {
  const suppliers = useMobileStore((s) => s.suppliers);
  const products = useMobileStore((s) => s.products);
  const recordPurchase = useMobileStore((s) => s.recordPurchase);
  const addProduct = useMobileStore((s) => s.addProduct);

  const [supplierId, setSupplierId] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  
  // Selection item
  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState("1");
  const [cost, setCost] = useState("");
  const [payNow, setPayNow] = useState(false);
  const [paymentMode, setPaymentMode] = useState<"Cash" | "UPI" | "Cash & UPI">("Cash");
  const [cashAmount, setCashAmount] = useState<number | "">("");
  const [bankAmount, setBankAmount] = useState<number | "">("");
  const [paymentRemark, setPaymentRemark] = useState("");

  // Draft items list
  const [items, setItems] = useState<{ productId: string; productName: string; quantity: number; cost: number }[]>([]);

  // Quick product add modal/form state
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickCategory, setQuickCategory] = useState("TV");
  const [quickName, setQuickName] = useState("");
  const [quickBrand, setQuickBrand] = useState("Samsung");
  const [quickModel, setQuickModel] = useState("");
  const [quickSpec, setQuickSpec] = useState("");
  const [quickColor, setQuickColor] = useState("");
  const [quickCost, setQuickCost] = useState("");
  const [quickRemark, setQuickRemark] = useState("");

  useEffect(() => {
    const brands = getBrandsForCategory(quickCategory);
    if (!brands.includes(quickBrand)) {
      setQuickBrand(brands[0] || "Samsung");
    }
  }, [quickCategory]);

  // Adjust cost when selected product changes
  useEffect(() => {
    if (!productId) {
      setCost("");
    } else {
      const p = products.find((prod) => prod.id === productId);
      if (p) setCost(p.purchasePrice.toString());
    }
  }, [productId, products]);

  const handleAddItem = () => {
    const p = products.find((prod) => prod.id === productId);
    if (!p) return;
    const qtyNum = Number(qty) || 0;
    const costNum = Number(cost) || 0;
    if (qtyNum <= 0 || costNum <= 0) {
      toast.error("Please enter valid quantity and unit cost");
      return;
    }
    
    // Check if item already exists in draft list
    const existingIndex = items.findIndex((item) => item.productId === productId);
    if (existingIndex > -1) {
      const updated = [...items];
      updated[existingIndex].quantity += qtyNum;
      updated[existingIndex].cost = costNum;
      setItems(updated);
    } else {
      setItems([...items, {
        productId,
        productName: `${p.brand} ${p.name} (${p.ramRom})`,
        quantity: qtyNum,
        cost: costNum
      }]);
    }
    toast.success(`Added ${qty}x ${p.name} to draft invoice list`);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleQuickAddProduct = () => {
    if (!quickName.trim() || !quickModel.trim() || !quickCost) {
      toast.error("Please fill required fields for quick register");
      return;
    }
    const specs = quickSpec.trim() || "Default Specs";
    const clr = quickColor.trim() || "Default";
    const rawCost = Number(quickCost);

    // Call store action
    addProduct({
      name: quickName.trim(),
      brand: quickBrand,
      model: quickModel.trim(),
      ramRom: specs,
      color: clr,
      category: quickCategory,
      purchasePrice: rawCost,
      remark: quickRemark.trim()
    });

    toast.success(`Successfully registered ${quickName} to catalog!`);
    
    // Reset quick add inputs
    setQuickName("");
    setQuickModel("");
    setQuickSpec("");
    setQuickColor("");
    setQuickCost("");
    setQuickRemark("");
    setShowQuickAdd(false);
  };

  const selectedSupplier = suppliers.find((s) => s.id === supplierId);
  const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.cost, 0);

  const handlePayNowToggle = (checked: boolean) => {
    setPayNow(checked);
    if (checked && paymentMode === "Cash & UPI") {
      const half = Math.floor(totalAmount / 2);
      setCashAmount(half);
      setBankAmount(totalAmount - half);
    }
  };

  const handleModeChange = (mode: "Cash" | "UPI" | "Cash & UPI") => {
    setPaymentMode(mode);
    if (mode === "Cash & UPI") {
      const half = Math.floor(totalAmount / 2);
      setCashAmount(half);
      setBankAmount(totalAmount - half);
    }
  };

  const canSubmit = supplierId && invoiceNo.trim() && date.trim() && items.length > 0;

  const handleSubmit = () => {
    if (!selectedSupplier) return;
    
    if (payNow && paymentMode === "Cash & UPI") {
      const c = Number(cashAmount) || 0;
      const b = Number(bankAmount) || 0;
      if (c + b !== totalAmount) {
        toast.error(`Cash (₹${c}) + UPI (₹${b}) must equal Total Invoice Value (₹${totalAmount})`);
        return;
      }
    }

    const newPur = recordPurchase({
      supplierId,
      supplierName: selectedSupplier.name,
      invoiceNo: invoiceNo.trim(),
      date: new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      quantity: totalQty,
      payNow,
      paymentMode: payNow ? paymentMode : undefined,
      cashAmount: payNow ? (paymentMode === "Cash & UPI" ? (Number(cashAmount) || 0) : paymentMode === "Cash" ? totalAmount : 0) : undefined,
      bankAmount: payNow ? (paymentMode === "Cash & UPI" ? (Number(bankAmount) || 0) : paymentMode === "UPI" ? totalAmount : 0) : undefined,
      paymentRemark: payNow ? (paymentRemark.trim() || undefined) : undefined,
      items
    });

    toast.success(`Purchase logged successfully for invoice ${invoiceNo} with ${items.length} items`);
    if (onPurchaseLogged) {
      onPurchaseLogged(newPur);
    }
    onClose();
  };

  return (
    <>
      <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-lg rounded-xl border border-border shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b border-border pb-3">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Plus className="size-5 text-primary" />
              <span>Record Vendor Purchase Order</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Log inward supplier invoices with one or more products.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4 text-sm">
            {/* Supplier Select */}
            <label className="block">
              <span className="text-xs font-semibold text-muted-foreground">Supplier</span>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 cursor-pointer"
              >
                <option value="">-- Select Supplier --</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-semibold text-muted-foreground">Invoice / Bill Number</span>
                <input
                  value={invoiceNo}
                  onChange={(e) => setInvoiceNo(e.target.value)}
                  placeholder="e.g. BILL/9903"
                  className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-muted-foreground">Purchase Date</span>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
                />
              </label>
            </div>

            {/* Invoiced items list */}
            <div className="border border-border/80 rounded-lg p-3 bg-muted/10">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block mb-2">Invoice Added Items ({items.length})</span>
              {items.length === 0 ? (
                <div className="text-center py-4 text-xs text-muted-foreground italic border border-dashed border-border/60 rounded">
                  No items added yet. Pick products below.
                </div>
              ) : (
                <div className="overflow-hidden border border-border/60 rounded bg-surface text-xs max-h-[160px] overflow-y-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-muted-foreground bg-muted/40 uppercase text-[9px] border-b border-border">
                        <th className="py-1.5 px-2 font-semibold">Product</th>
                        <th className="py-1.5 px-2 text-center font-semibold">Qty</th>
                        <th className="py-1.5 px-2 text-right font-semibold">Cost</th>
                        <th className="py-1.5 px-2 text-right font-semibold">Total</th>
                        <th className="py-1.5 px-2 text-right font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, idx) => (
                        <tr key={idx} className="border-b border-border last:border-0 hover:bg-accent/15">
                          <td className="py-1.5 px-2 font-medium truncate max-w-[150px]" title={item.productName}>{item.productName}</td>
                          <td className="py-1.5 px-2 text-center font-semibold">{item.quantity}</td>
                          <td className="py-1.5 px-2 text-right">₹{item.cost.toLocaleString("en-IN")}</td>
                          <td className="py-1.5 px-2 text-right font-bold">₹{(item.quantity * item.cost).toLocaleString("en-IN")}</td>
                          <td className="py-1.5 px-2 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="text-red-500 hover:text-red-700 font-bold px-1.5"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Add Item form panel */}
            <div className="border-t border-dashed border-border/80 pt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest font-bold">Add Product Item</span>
                <button
                  type="button"
                  onClick={() => setShowQuickAdd(true)}
                  className="text-xs text-primary font-bold hover:underline"
                >
                  + Quick Register Product
                </button>
              </div>
              
              <label className="block mb-2">
                <span className="text-xs font-semibold text-muted-foreground">Select Product Model</span>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 cursor-pointer"
                >
                  <option value="">-- Select Product --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.brand} {p.name} ({p.ramRom})</option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-3 items-end">
                <label className="block">
                  <span className="text-xs font-semibold text-muted-foreground">Quantity</span>
                  <input
                    type="number"
                    min="1"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-muted-foreground">Cost per Unit (₹)</span>
                  <input
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                className="mt-2.5 w-full h-8 rounded border border-primary/20 bg-primary/5 text-primary text-xs font-bold hover:bg-primary hover:text-white transition-all shadow-sm"
              >
                + Add Item to Order
              </button>
            </div>

            {/* Payment Terms */}
            <div className="space-y-2.5 border-t border-dashed border-border/80 pt-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="paynow"
                  checked={payNow}
                  onChange={(e) => handlePayNowToggle(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-0 cursor-pointer"
                />
                <label htmlFor="paynow" className="text-xs font-semibold text-foreground/80 cursor-pointer">
                  Mark invoice as fully paid immediately (Cash / UPI)
                </label>
              </div>

              {payNow && (
                <div className="bg-muted/20 p-3 rounded-lg border border-border/60 space-y-3 animate-in fade-in duration-200">
                  <label className="block">
                    <span className="text-xs font-semibold text-muted-foreground">Payment Mode</span>
                    <select
                      value={paymentMode}
                      onChange={(e) => handleModeChange(e.target.value as "Cash" | "UPI" | "Cash & UPI")}
                      className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-ring/20 cursor-pointer"
                    >
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI</option>
                      <option value="Cash & UPI">Cash & UPI</option>
                    </select>
                  </label>

                  {paymentMode === "Cash & UPI" && (
                    <div className="grid grid-cols-2 gap-3">
                      <label className="block">
                        <span className="text-xs font-semibold text-muted-foreground">Cash Portion (₹)</span>
                        <input
                          type="number"
                          value={cashAmount}
                          onChange={(e) => {
                            const c = Number(e.target.value) || 0;
                            setCashAmount(c);
                            setBankAmount(Math.max(0, totalAmount - c));
                          }}
                          className="mt-1 h-8 w-full rounded-md border border-border bg-surface px-2.5 text-xs font-semibold focus:outline-none"
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
                            setCashAmount(Math.max(0, totalAmount - b));
                          }}
                          className="mt-1 h-8 w-full rounded-md border border-border bg-surface px-2.5 text-xs font-semibold focus:outline-none"
                        />
                      </label>
                    </div>
                  )}

                  <label className="block">
                    <span className="text-xs font-semibold text-muted-foreground">Payment Remark / Ref (optional)</span>
                    <input
                      value={paymentRemark}
                      onChange={(e) => setPaymentRemark(e.target.value)}
                      placeholder="e.g. UPI Ref #9928"
                      className="mt-1 h-8 w-full rounded-md border border-border bg-surface px-2.5 text-xs focus:outline-none"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Invoice Summary */}
            <div className="rounded-lg border border-border bg-muted/20 px-4 py-3 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Added Quantity:</span>
                <span className="font-semibold text-foreground">{totalQty} units</span>
              </div>
              <div className="flex justify-between border-t border-border pt-1.5 mt-1.5 font-bold text-sm">
                <span className="text-foreground">Total Invoice Value:</span>
                <span className="text-success">₹{totalAmount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground italic mt-0.5">
                <span>Payment Terms:</span>
                <span className={payNow ? "text-success font-bold" : "text-warning font-bold"}>
                  {payNow ? "Paid Bill" : "Added to Outstanding Ledger"}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-border pt-4 flex gap-2">
            <button
              onClick={onClose}
              className="h-9 px-3.5 rounded-md border border-border bg-surface text-sm hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={!canSubmit}
              onClick={handleSubmit}
              className="h-9 px-5 rounded-md bg-foreground text-background text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all ml-auto"
            >
              Log Purchase Bill
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Quick Add Product Sub-Dialog */}
      {showQuickAdd && (
        <Dialog open={true} onOpenChange={(open) => !open && setShowQuickAdd(false)}>
          <DialogContent className="max-w-sm rounded-xl border border-border bg-background shadow-2xl p-5 max-h-[85vh] overflow-y-auto">
            <DialogHeader className="border-b border-border pb-2">
              <DialogTitle className="text-sm font-bold">Quick Register Product</DialogTitle>
              <DialogDescription className="text-[11px] text-muted-foreground">Register new model on the fly.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-3 text-xs">
              <label className="block">
                <span className="font-semibold text-muted-foreground">Category</span>
                <select
                  value={quickCategory}
                  onChange={(e) => setQuickCategory(e.target.value)}
                  className="mt-1 h-8 w-full rounded border border-border bg-surface px-2 focus:outline-none"
                >
                  {["TV", "Frize", "Waching Machine", "Smartphones", "Basic Phones", "Tablets"].map((cat) => (
                    <option key={cat} value={cat}>{cat === "Frize" ? "Fridge (Frize)" : cat === "Waching Machine" ? "Washing Machine" : cat}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="font-semibold text-muted-foreground">Name</span>
                <input
                  value={quickName}
                  onChange={(e) => setQuickName(e.target.value)}
                  placeholder="e.g. Redmi Smart TV"
                  className="mt-1 h-8 w-full rounded border border-border bg-surface px-2 focus:outline-none"
                />
              </label>

              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="font-semibold text-muted-foreground">Brand</span>
                  <select
                    value={quickBrand}
                    onChange={(e) => setQuickBrand(e.target.value)}
                    className="mt-1 h-8 w-full rounded border border-border bg-surface px-2 focus:outline-none"
                  >
                    {getBrandsForCategory(quickCategory).map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="font-semibold text-muted-foreground">Model Code</span>
                  <input
                    value={quickModel}
                    onChange={(e) => setQuickModel(e.target.value)}
                    placeholder="e.g. L32M6-RA"
                    className="mt-1 h-8 w-full rounded border border-border bg-surface px-2 focus:outline-none"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="font-semibold text-muted-foreground">Specs (RAM/Size)</span>
                  <input
                    value={quickSpec}
                    onChange={(e) => setQuickSpec(e.target.value)}
                    placeholder="e.g. 32 Inch or 8GB/128GB"
                    className="mt-1 h-8 w-full rounded border border-border bg-surface px-2 focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="font-semibold text-muted-foreground">Color / Type</span>
                  <input
                    value={quickColor}
                    onChange={(e) => setQuickColor(e.target.value)}
                    placeholder="e.g. Black, QLED"
                    className="mt-1 h-8 w-full rounded border border-border bg-surface px-2 focus:outline-none"
                  />
                </label>
              </div>

              <label className="block">
                <span className="font-semibold text-muted-foreground">Cost Price (₹)</span>
                <input
                  type="number"
                  value={quickCost}
                  onChange={(e) => setQuickCost(e.target.value)}
                  placeholder="12000"
                  className="mt-1 h-8 w-full rounded border border-border bg-surface px-2 focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="font-semibold text-muted-foreground">Remark</span>
                <input
                  value={quickRemark}
                  onChange={(e) => setQuickRemark(e.target.value)}
                  placeholder="Notes..."
                  className="mt-1 h-8 w-full rounded border border-border bg-surface px-2 focus:outline-none"
                />
              </label>
            </div>
            <DialogFooter className="border-t border-border pt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setShowQuickAdd(false)}
                className="h-8 px-3 rounded border border-border bg-surface text-xs hover:bg-accent"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleQuickAddProduct}
                className="h-8 px-4 rounded bg-foreground text-background text-xs font-semibold hover:opacity-90 ml-auto"
              >
                Register
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

function SupplierPayDialog({
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
            <span>Pay Supplier Balance</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Clear outstanding debt ledger for <strong>{supplier.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3 text-sm">
          <div className="flex justify-between items-center bg-muted/30 p-2.5 rounded border border-border/60 text-xs">
            <span className="text-muted-foreground font-medium">Outstanding Balance:</span>
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
              placeholder="e.g. 50000"
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
            Record Payment
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PurchasesPage() {
  const purchases = useMobileStore((s) => s.purchases) || [];
  const suppliers = useMobileStore((s) => s.suppliers) || [];
  const settings = useMobileStore((s) => s.settings);

  const [q, setQ] = useState("");
  const [selectedSupplierTab, setSelectedSupplierTab] = useState("All");
  const [isAdding, setIsAdding] = useState(false);
  const [payingSupplier, setPayingSupplier] = useState<MobileSupplier | null>(null);

  const handlePrint = (purchase: MobilePurchase) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Popup blocked! Enable popups to print invoices");
      return;
    }

    const supplier = suppliers.find((s) => s.id === purchase.supplierId);

    const itemHtml = safeItems(purchase?.items)
      .map(

        (item) => `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 12px; color: #334155;">
          <strong>${item.productName}</strong>
        </td>
        <td style="padding: 12px; text-align: center; color: #334155;">${item.quantity}</td>
        <td style="padding: 12px; text-align: right; font-weight: 500; color: #0f172a;">₹${item.cost.toLocaleString("en-IN")}</td>
        <td style="padding: 12px; text-align: right; font-weight: 700; color: #0f172a;">₹${(item.cost * item.quantity).toLocaleString("en-IN")}</td>
      </tr>
    `
      )
      .join("");

    const invoiceContent = `
      <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; padding: 40px; max-width: 800px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; background: white; color: #1e293b; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);">
        <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #f1f5f9; padding-bottom: 24px; margin-bottom: 24px;">
          <div>
            <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #0f172a; letter-spacing: -0.025em; text-transform: uppercase;">${supplier ? supplier.name : purchase.supplierName}</h1>
            <p style="margin: 6px 0 0 0; font-size: 13px; color: #64748b; font-weight: 500;">Purchase Invoice (Inward)</p>
            ${supplier && supplier.address ? `<p style="margin: 2px 0 0 0; font-size: 12px; color: #94a3b8;">${supplier.address}</p>` : ""}
            ${supplier && supplier.contact ? `<p style="margin: 2px 0 0 0; font-size: 11px; color: #94a3b8; font-family: monospace;">Contact: ${supplier.contact}</p>` : ""}
          </div>
          <div style="text-align: right;">
            <h2 style="margin: 0; font-size: 15px; font-weight: 700; color: #16a34a; text-transform: uppercase;">Inward Bill</h2>
            <p style="margin: 6px 0 0 0; font-size: 13px; font-weight: 600; color: #0f172a;">Bill ID: <strong>${purchase.id}</strong></p>
            <p style="margin: 2px 0 0 0; font-size: 12px; color: #64748b;">Invoice No: <strong>${purchase.invoiceNo}</strong></p>
            <p style="margin: 2px 0 0 0; font-size: 12px; color: #64748b;">Date: ${purchase.date}</p>
          </div>
        </div>

        <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 30px; font-size: 13px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div>
            <h3 style="margin: 0 0 8px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em;">Billed To (Store Details)</h3>
            <p style="margin: 3px 0;"><strong>Name:</strong> ${settings.storeName}</p>
            <p style="margin: 3px 0;"><strong>Address:</strong> ${settings.address}</p>
            <p style="margin: 3px 0;"><strong>Contact:</strong> ${settings.contact}</p>
          </div>
          <div style="border-left: 1px solid #e2e8f0; padding-left: 16px;">
            <h3 style="margin: 0 0 8px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em;">Payment Details</h3>
            <p style="margin: 3px 0;"><strong>Status:</strong> ${purchase.status}</p>
            <p style="margin: 3px 0;"><strong>Total Purchase Amount:</strong> ₹${purchase.amount.toLocaleString("en-IN")}</p>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 13px;">
          <thead>
            <tr style="border-bottom: 2px solid #e2e8f0; background: #f8fafc; text-align: left;">
              <th style="padding: 12px; font-weight: 600; color: #475569;">Description of Goods</th>
              <th style="padding: 12px; text-align: center; font-weight: 600; color: #475569;">Qty</th>
              <th style="padding: 12px; text-align: right; font-weight: 600; color: #475569;">Rate</th>
              <th style="padding: 12px; text-align: right; font-weight: 600; color: #475569;">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemHtml}
            <tr style="font-weight: 700; font-size: 15px; background: #f1f5f9; border-top: 2px solid #cbd5e1;">
              <td colspan="2" style="padding: 12px; border-radius: 0 0 0 8px;">Grand Total Value:</td>
              <td style="padding: 12px; text-align: right;">Total Amount:</td>
              <td style="padding: 12px; text-align: right; color: #16a34a; border-radius: 0 0 8px 0;">₹${purchase.amount.toLocaleString("en-IN")}</td>
            </tr>
          </tbody>
        </table>

        <div style="margin-top: 60px; display: flex; justify-content: space-between; font-size: 12px; color: #64748b;">
          <div style="text-align: center;">
            <div style="border-top: 1px solid #cbd5e1; width: 180px; padding-top: 8px; font-weight: 500;">Receiver's Acknowledgment</div>
          </div>
          <div style="text-align: center;">
            <div style="border-top: 1px solid #cbd5e1; width: 180px; padding-top: 8px; font-weight: 500; margin-left: auto;">Supplier's Signature</div>
          </div>
        </div>
      </div>
    `;

    printWindow.document.write(invoiceContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

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

  // Check URL triggers
  useEffect(() => {
    if (sessionStorage.getItem("mobiles_trigger_new_purchase") === "true") {
      setIsAdding(true);
      sessionStorage.removeItem("mobiles_trigger_new_purchase");
    }
  }, []);

  const filteredPurchases = (purchases || []).filter((p) => {
    if (!p) return false;
    const pDate = parseAppDate(p.date);
    if (!isDateInRange(pDate, startDate, endDate)) return false;
    
    if (selectedSupplierTab !== "All") {
      const tabLower = selectedSupplierTab.trim().toLowerCase();
      const matchName = (p.supplierName || "").trim().toLowerCase() === tabLower;
      const matchId = (p.supplierId || "") === selectedSupplierTab;
      if (!matchName && !matchId) return false;
    }
    
    if (q) {
      const text = q.toLowerCase();
      return [p.invoiceNo, p.supplierName, p.id].some((v) =>
        v ? String(v).toLowerCase().includes(text) : false
      );
    }
    return true;
  });

  const sortedPurchases = [...filteredPurchases].sort((a, b) => {
    const dateA = parseAppDate(a.date)?.getTime() || 0;
    const dateB = parseAppDate(b.date)?.getTime() || 0;
    if (dateB !== dateA) return dateB - dateA;
    const numA = parseInt((a.id || "").replace(/\D/g, ""), 10) || 0;
    const numB = parseInt((b.id || "").replace(/\D/g, ""), 10) || 0;
    return numB - numA;
  });

  const combinedSuppliersList: MobileSupplier[] = [...suppliers];
  (purchases || []).forEach((p) => {
    if (p.supplierName && !combinedSuppliersList.some((s) => s.name.trim().toLowerCase() === p.supplierName.trim().toLowerCase() || s.id === p.supplierId)) {
      combinedSuppliersList.push({
        id: p.supplierId || `MS-${combinedSuppliersList.length + 1}`,
        name: p.supplierName,
        contact: "—",
        address: "—",
        outstanding: p.status === "Outstanding" ? p.amount : 0,
      });
    }
  });

  const supplierTabs = Array.from(
    new Set(["All", ...combinedSuppliersList.map((s) => s.name)])
  );

  const totalOutstanding = suppliers.reduce((sum, s) => sum + s.outstanding, 0);
  const periodPurchaseVal = filteredPurchases.reduce((sum, p) => sum + p.amount, 0);
  const periodQtyVal = filteredPurchases.reduce((sum, p) => sum + p.quantity, 0);

  const formatInr = (num: number) => "₹" + Math.round(num).toLocaleString("en-IN");

  return (
    <AppShell breadcrumb="Purchases">
      {isAdding && <PurchaseFormDialog onClose={() => setIsAdding(false)} onPurchaseLogged={(p) => handlePrint(p)} />}
      {payingSupplier && <SupplierPayDialog supplier={payingSupplier} onClose={() => setPayingSupplier(null)} />}

      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight">Wholesale Purchase History</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track inward product bills and supplier ledgers.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => toast.success("Purchase report exported")}
            className="h-9 px-3 rounded-md border border-border bg-surface text-sm inline-flex items-center gap-1.5 hover:bg-accent font-semibold transition-colors shadow-sm"
          >
            <Download className="size-3.5" /> Export Logs
          </button>
          <button
            onClick={() => setIsAdding(true)}
            className="h-9 px-4 rounded-md bg-foreground text-background text-sm font-semibold inline-flex items-center gap-1.5 hover:opacity-90 shadow transition-opacity"
          >
            <Plus className="size-3.5" /> Record Purchase
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

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Outstanding Debt" value={formatInr(totalOutstanding)} sub="Sum of unpaid ledgers" icon={<CreditCard className="size-4" />} trend={totalOutstanding > 0 ? "warn" : "up"} />
        <StatCard label="Period Purchases Value" value={formatInr(periodPurchaseVal)} sub={`${filteredPurchases.length} invoices logged`} icon={<Receipt className="size-4" />} trend="up" />
        <StatCard label="Inward Stock Units" value={periodQtyVal.toString()} sub="Units received" icon={<Plus className="size-4" />} />
        <StatCard label="Total Suppliers" value={suppliers.length.toString()} sub="Wholesale vendors" icon={<Users className="size-4" />} />
      </div>

      {/* Purchase History Table */}
      <Card className="w-full mb-6 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-border flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="size-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search invoice number, supplier name..."
              className="h-9 w-full rounded-md border border-border bg-background pl-8 pr-3 text-sm focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Filter Supplier:</span>
            <select
              value={selectedSupplierTab}
              onChange={(e) => setSelectedSupplierTab(e.target.value)}
              className="h-9 min-w-[170px] rounded-md border border-border bg-surface px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ring/20 cursor-pointer"
            >
              <option value="All">All Suppliers ({combinedSuppliersList.length})</option>
              {combinedSuppliersList.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <SectionHeader
          title="Logged Inward Purchase Invoices"
          action={<span className="text-xs text-muted-foreground">Historical records list</span>}
        />

        <div className="w-full">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border bg-muted/10">
                <th className="py-2.5 px-3 font-semibold">Bill ID</th>
                <th className="py-2.5 px-3 font-semibold">Date</th>
                <th className="py-2.5 px-3 font-semibold">Supplier Name</th>
                <th className="py-2.5 px-3 font-semibold">Invoice No</th>
                <th className="py-2.5 px-3 text-center font-semibold">Qty</th>
                <th className="py-2.5 px-3 font-semibold text-right">Total Cost</th>
                <th className="py-2.5 px-3 font-semibold">Payment Details</th>
                <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedPurchases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-muted-foreground font-semibold">
                    No purchases found for selected criteria.
                  </td>
                </tr>
              ) : (
                sortedPurchases.map((p) => {
                  const sup = combinedSuppliersList.find(
                    (s) => s.id === p.supplierId || s.name.trim().toLowerCase() === (p.supplierName || "").trim().toLowerCase()
                  );
                  const modeText = p.paymentMode ? ` (${p.paymentMode})` : "";
                  return (
                    <tr key={p.id} className="border-b border-border hover:bg-accent/30 transition-colors last:border-0">
                      <td className="py-3 px-3 font-mono font-medium text-muted-foreground">{p.id}</td>
                      <td className="py-3 px-3 font-medium text-foreground/80 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1"><Calendar className="size-3 text-muted-foreground" /> {p.date}</span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-foreground">{p.supplierName}</td>
                      <td className="py-3 px-3 font-mono">{p.invoiceNo}</td>
                      <td className="py-3 px-3 text-center font-bold text-sm">{p.quantity}</td>
                      <td className="py-3 px-3 text-right font-bold text-foreground">{formatInr(p.amount)}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge tone={p.status === "Paid" ? "success" : "warning"}>
                            {p.status}{p.status === "Paid" ? modeText : ""}
                          </Badge>
                          {p.status === "Outstanding" && sup && (
                            <button
                              onClick={() => setPayingSupplier(sup)}
                              className="h-6 px-2.5 rounded border border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-white transition-colors text-[10px] font-bold shadow-sm cursor-pointer"
                            >
                              Pay Supplier
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          title="Print Purchase Invoice"
                          onClick={() => handlePrint(p)}
                          className="size-7 rounded border border-border bg-surface text-foreground grid place-items-center hover:bg-accent transition-colors ml-auto shadow-sm cursor-pointer"
                        >
                          <Printer className="size-3.5" />
                        </button>
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
