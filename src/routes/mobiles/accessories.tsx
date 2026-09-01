import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Search, Plus, Edit, Trash2, ShoppingBag, Landmark, ArrowDownLeft, AlertCircle, RefreshCw, TrendingUp, Package, Wallet } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Card, SectionHeader, StatCard } from "@/components/ui-kit";
import { useMobileStore, MobileAccessory } from "@/lib/mobileStore";
import { triggerManualSync } from "@/lib/useRealtimeSync";
import { splitByMethod, toOptionalNumber } from "@/lib/ledger";
import { parseAmount } from "@/lib/store";

export const Route = createFileRoute("/mobiles/accessories")({
  head: () => ({
    meta: [
      { title: "Accessories · Jain Mobiles ERP" },
      { name: "description", content: "Mobile shop accessories inventory & sales management." },
    ],
  }),
  component: AccessoriesPage,
});

/**
 * Custom Hook: Calculate Mobiles Store Cash & UPI Balances
 */
function useStoreBalance() {
  const sales = useMobileStore((s) => s.sales);
  const expenses = useMobileStore((s) => s.expenses);
  const purchases = useMobileStore((s) => s.purchases);
  const supplierPayments = useMobileStore((s) => s.supplierPayments);

  return useMemo(() => {
    let cashIn = 0;
    let bankIn = 0;

    // 1. Inflows from Device Sales
    sales.forEach((s) => {
      const received = Number(s.amountPaid) || 0;
      const storedCash = toOptionalNumber(s.cashAmountPaid);
      const storedUpi = toOptionalNumber(s.upiAmountPaid);
      const hasStoredSplit = storedCash !== undefined || storedUpi !== undefined;
      const fallback = splitByMethod(s.paymentMethod, received);

      const c = hasStoredSplit ? (storedCash ?? Math.max(0, received - (storedUpi ?? 0))) : fallback.cash;
      const b = hasStoredSplit ? (storedUpi ?? Math.max(0, received - c)) : fallback.bank;

      if (c > 0) cashIn += c;
      if (b > 0) bankIn += b;
    });

    // 2. Inflows & Outflows from Expenses & Accessory Income
    expenses.forEach((e) => {
      const amt = parseAmount(e.amount);
      if (amt > 0) {
        const isInflow = e.type === "Income";
        const { cash, bank } = splitByMethod(e.paymentMode, amt, e.cashAmount, e.bankAmount);
        if (isInflow) {
          cashIn += cash;
          bankIn += bank;
        } else {
          cashIn -= cash;
          bankIn -= bank;
        }
      }
    });

    // 3. Outflows from Paid Purchases
    purchases.forEach((p) => {
      if (p.status === "Paid") {
        const { cash, bank } = splitByMethod(p.paymentMode, p.amount, p.cashAmount, p.bankAmount);
        cashIn -= cash;
        bankIn -= bank;
      }
    });

    // 4. Outflows from Supplier Debt Payments
    supplierPayments.forEach((sp) => {
      const { cash, bank } = splitByMethod(sp.paymentMode, sp.amount, sp.cashAmount, sp.bankAmount);
      cashIn -= cash;
      bankIn -= bank;
    });

    const cashBalance = Math.max(0, cashIn);
    const upiBalance = Math.max(0, bankIn);

    return {
      cashBalance,
      upiBalance,
      totalBalance: cashBalance + upiBalance,
    };
  }, [sales, expenses, purchases, supplierPayments]);
}

function AccessoryFormDialog({
  a: accessory,
  onClose
}: {
  a?: MobileAccessory;
  onClose: () => void;
}) {
  const accessories = useMobileStore((s) => s.accessories);
  const addAccessory = useMobileStore((s) => s.addAccessory);
  const updateAccessory = useMobileStore((s) => s.updateAccessory);
  const addExpense = useMobileStore((s) => s.addExpense);
  const storeBalance = useStoreBalance();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Other");
  const [stock, setStock] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [paymentMode, setPaymentMode] = useState<"Cash" | "UPI" | "Cash & UPI">("Cash");
  const [cashAmount, setCashAmount] = useState<number | "">("");
  const [bankAmount, setBankAmount] = useState<number | "">("");

  useState(() => {
    if (accessory) {
      setName(accessory.name);
      setCategory(accessory.category);
      setStock(accessory.stock.toString());
      setPurchasePrice(accessory.purchasePrice.toString());
      setSellingPrice(accessory.sellingPrice ? accessory.sellingPrice.toString() : "");
    }
  });

  const totalCost = (Number(stock) || 0) * (Number(purchasePrice) || 0);

  const handleModeChange = (mode: "Cash" | "UPI" | "Cash & UPI") => {
    setPaymentMode(mode);
    if (mode === "Cash & UPI") {
      const half = Math.floor(totalCost / 2);
      setCashAmount(half);
      setBankAmount(totalCost - half);
    }
  };

  const handleStockOrPriceChange = (newStockStr: string, newPriceStr: string) => {
    const sVal = Number(newStockStr) || 0;
    const pVal = Number(newPriceStr) || 0;
    const tot = sVal * pVal;
    if (paymentMode === "Cash & UPI") {
      const half = Math.floor(tot / 2);
      setCashAmount(half);
      setBankAmount(tot - half);
    }
  };

  const requiredCash = paymentMode === "Cash" ? totalCost : paymentMode === "Cash & UPI" ? (Number(cashAmount) || 0) : 0;
  const requiredUpi = paymentMode === "UPI" ? totalCost : paymentMode === "Cash & UPI" ? (Number(bankAmount) || 0) : 0;

  const isStoreMoneyInsufficient = !accessory && totalCost > 0 && (
    requiredCash > storeBalance.cashBalance || requiredUpi > storeBalance.upiBalance
  );

  const canSubmit = name.trim() && stock && purchasePrice && Number(stock) > 0 && Number(purchasePrice) >= 0 && !isStoreMoneyInsufficient;

  const handleSave = () => {
    const stockNum = Math.min(999999, Math.max(0, Number(stock)));
    const costPriceNum = Math.min(99999999, Math.max(0, Number(purchasePrice)));
    const sellPriceNum = Math.min(99999999, Math.max(0, Number(sellingPrice) || 0));
    const cost = stockNum * costPriceNum;

    if (!accessory && paymentMode === "Cash & UPI" && cost > 0) {
      const c = Number(cashAmount) || 0;
      const b = Number(bankAmount) || 0;
      if (c + b !== cost) {
        toast.error(`Cash (₹${c}) + UPI (₹${b}) must equal Total Cost (₹${cost})`);
        return;
      }
    }

    if (!accessory && isStoreMoneyInsufficient) {
      toast.error("Cannot complete purchase: Insufficient money in store!");
      return;
    }

    if (accessory) {
      updateAccessory(accessory.id, {
        name: name.trim(),
        category: category.trim() || "Other",
        stock: stockNum,
        purchasePrice: costPriceNum,
        sellingPrice: sellPriceNum,
      });
      toast.success(`Accessory updated: ${name}`);
    } else {
      const existing = accessories.find((item) => item.name.toLowerCase().trim() === name.toLowerCase().trim());

      if (existing) {
        const newStock = existing.stock + stockNum;
        updateAccessory(existing.id, {
          stock: newStock,
          purchasePrice: costPriceNum,
          sellingPrice: sellPriceNum > 0 ? sellPriceNum : existing.sellingPrice,
        });
      } else {
        addAccessory({
          name: name.trim(),
          category: category.trim() || "Other",
          stock: stockNum,
          minLimit: 0,
          purchasePrice: costPriceNum,
          sellingPrice: sellPriceNum,
        });
      }

      if (cost > 0) {
        addExpense({
          cat: "Stock Purchase",
          desc: `Procurement: ${stockNum} units of ${name.trim()} (${category.trim() || "Other"})`,
          amount: String(cost),
          type: "Expense",
          paymentMode,
          cashAmount: paymentMode === "Cash & UPI" ? Number(cashAmount) || 0 : undefined,
          bankAmount: paymentMode === "Cash & UPI" ? Number(bankAmount) || 0 : undefined,
        });
        toast.success(`Bought ${stockNum} units of ${name.trim()} for ₹${cost.toLocaleString("en-IN")} via ${paymentMode}`);
      } else {
        toast.success(`Accessory registered: ${name}`);
      }
    }
    onClose();
  };

  const fmtInr = (num: number) => "₹" + Math.round(num).toLocaleString("en-IN");

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-xl border border-border shadow-2xl p-6">
        <DialogHeader className="border-b border-border pb-3">
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <ShoppingBag className="size-5 text-primary" />
            <span>{accessory ? "Edit Accessory Specifications" : "Buy Accessories"}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {accessory ? "Update accessory details and stock pricing parameters." : "Procure accessory inventory stock using store Cash or UPI funds."}
          </DialogDescription>
        </DialogHeader>

        {!accessory && (
          <div className="mt-3 bg-muted/40 p-3 rounded-lg border border-border text-xs space-y-1">
            <div className="flex justify-between font-semibold text-foreground">
              <span className="flex items-center gap-1"><Wallet className="size-3.5 text-emerald-500" /> Current Store Balance:</span>
              <span className="text-success font-extrabold">{fmtInr(storeBalance.totalBalance)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground text-[11px] pt-1 border-t border-border/50">
              <span>Available Cash: <strong className="text-foreground">{fmtInr(storeBalance.cashBalance)}</strong></span>
              <span>Available UPI: <strong className="text-foreground">{fmtInr(storeBalance.upiBalance)}</strong></span>
            </div>
          </div>
        )}

        <div className="py-4 space-y-3.5 text-sm">
          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">Product / Item Name *</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 100))}
              placeholder="e.g. Apple 20W Fast Charger"
              className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none font-medium"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">Category Type</span>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value.slice(0, 50))}
              placeholder="e.g. Charger, Case, Screen Guard, Earbuds"
              className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
            />
          </label>

          <div className="grid grid-cols-3 gap-2.5">
            <label className="block">
              <span className="text-xs font-semibold text-muted-foreground">{accessory ? "Stock Qty" : "Buy Qty *"}</span>
              <input
                type="number"
                min="1"
                max="999999"
                value={stock}
                onChange={(e) => {
                  const val = e.target.value.slice(0, 6);
                  setStock(val);
                  handleStockOrPriceChange(val, purchasePrice);
                }}
                placeholder="10"
                className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none font-semibold"
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-muted-foreground">Cost Price (₹) *</span>
              <input
                type="number"
                min="0"
                max="99999999"
                value={purchasePrice}
                onChange={(e) => {
                  const val = e.target.value.slice(0, 8);
                  setPurchasePrice(val);
                  handleStockOrPriceChange(stock, val);
                }}
                placeholder="200"
                className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-muted-foreground">Sell Price (₹)</span>
              <input
                type="number"
                min="0"
                max="99999999"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value.slice(0, 8))}
                placeholder="400"
                className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none font-medium"
              />
            </label>
          </div>

          {!accessory && totalCost > 0 && (
            <>
              <label className="block">
                <span className="text-xs font-semibold text-muted-foreground">Buy Option (Payment Account)</span>
                <select
                  value={paymentMode}
                  onChange={(e) => handleModeChange(e.target.value as "Cash" | "UPI" | "Cash & UPI")}
                  className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm font-semibold focus:ring-2 focus:ring-ring/20 focus:outline-none cursor-pointer"
                >
                  <option value="Cash">Cash (Store Cash)</option>
                  <option value="UPI">UPI (Store UPI / Bank)</option>
                  <option value="Cash & UPI">Cash & UPI Split</option>
                </select>
              </label>

              {paymentMode === "Cash & UPI" && (
                <div className="grid grid-cols-2 gap-3 bg-muted/20 p-2.5 rounded-lg border border-border">
                  <label className="block">
                    <span className="text-xs font-semibold text-muted-foreground">Cash Portion (₹)</span>
                    <input
                      type="number"
                      min="0"
                      value={cashAmount}
                      onChange={(e) => {
                        const c = Math.max(0, Number(e.target.value) || 0);
                        setCashAmount(c);
                        setBankAmount(Math.max(0, totalCost - c));
                      }}
                      className="mt-1 h-9 w-full rounded-md border border-border bg-background px-3 text-sm focus:outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-muted-foreground">UPI Portion (₹)</span>
                    <input
                      type="number"
                      min="0"
                      value={bankAmount}
                      onChange={(e) => {
                        const b = Math.max(0, Number(e.target.value) || 0);
                        setBankAmount(b);
                        setCashAmount(Math.max(0, totalCost - b));
                      }}
                      className="mt-1 h-9 w-full rounded-md border border-border bg-background px-3 text-sm focus:outline-none"
                    />
                  </label>
                </div>
              )}

              <div className="flex justify-between items-center text-xs border-t border-border pt-3">
                <span className="text-muted-foreground font-semibold">Total Buy Cost:</span>
                <span className="text-base font-extrabold text-foreground">
                  {fmtInr(totalCost)}
                </span>
              </div>
            </>
          )}

          {isStoreMoneyInsufficient && (
            <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertCircle className="size-4 shrink-0" />
                <span>Insufficient Store Money!</span>
              </div>
              <p className="text-[11px] leading-tight">
                You do not have enough funds in store to complete this procurement.
                {requiredCash > storeBalance.cashBalance && ` Required Cash: ${fmtInr(requiredCash)} (Available: ${fmtInr(storeBalance.cashBalance)}).`}
                {requiredUpi > storeBalance.upiBalance && ` Required UPI: ${fmtInr(requiredUpi)} (Available: ${fmtInr(storeBalance.upiBalance)}).`}
              </p>
            </div>
          )}
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
            onClick={handleSave}
            className="h-9 px-4 rounded-md bg-foreground text-background text-sm font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all ml-auto"
          >
            {accessory ? "Save Changes" : "Buy Accessory"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SellAccessoryDialog({
  accessory,
  onClose
}: {
  accessory: MobileAccessory;
  onClose: () => void;
}) {
  const sellAccessory = useMobileStore((s) => s.sellAccessory);
  const updateAccessory = useMobileStore((s) => s.updateAccessory);
  const addExpense = useMobileStore((s) => s.addExpense);

  const [qty, setQty] = useState("1");
  const [price, setPrice] = useState(accessory.sellingPrice > 0 ? accessory.sellingPrice.toString() : "");
  const [paymentMode, setPaymentMode] = useState<"Cash" | "UPI" | "Cash & UPI">("Cash");
  const [cashAmount, setCashAmount] = useState<number | "">("");
  const [bankAmount, setBankAmount] = useState<number | "">("");

  const rawCost = (Number(price) || 0) * (Number(qty) || 0);
  const cost = isFinite(rawCost) && rawCost >= 0 && rawCost < 1e12 ? rawCost : 0;

  const handleModeChange = (mode: "Cash" | "UPI" | "Cash & UPI") => {
    setPaymentMode(mode);
    if (mode === "Cash & UPI") {
      const half = Math.floor(cost / 2);
      setCashAmount(half);
      setBankAmount(cost - half);
    }
  };

  const handlePriceOrQtyChange = (newQtyStr: string, newPriceStr: string) => {
    const qVal = Number(newQtyStr) || 0;
    const pVal = Number(newPriceStr) || 0;
    const tot = qVal * pVal;
    if (paymentMode === "Cash & UPI") {
      const half = Math.floor(tot / 2);
      setCashAmount(half);
      setBankAmount(tot - half);
    }
  };

  const handleCheckout = () => {
    const sellQty = Number(qty);
    const sellPrice = Number(price);
    if (sellQty > accessory.stock) {
      toast.error(`Cannot sell more than available stock (${accessory.stock})`);
      return;
    }
    if (sellPrice <= 0) {
      toast.error("Please enter a valid selling price");
      return;
    }
    const totalCalc = sellPrice * sellQty;

    if (paymentMode === "Cash & UPI") {
      const c = Number(cashAmount) || 0;
      const b = Number(bankAmount) || 0;
      if (c + b !== totalCalc) {
        toast.error(`Cash (₹${c}) + UPI (₹${b}) must equal Total Price (₹${totalCalc})`);
        return;
      }
    }

    sellAccessory(accessory.id, sellQty);
    updateAccessory(accessory.id, { sellingPrice: sellPrice });

    addExpense({
      cat: "Accessories Income",
      desc: `Sale: ${sellQty} unit(s) of ${accessory.name} @ ₹${sellPrice}/unit`,
      amount: String(totalCalc),
      type: "Income",
      paymentMode,
      cashAmount: paymentMode === "Cash & UPI" ? Number(cashAmount) || 0 : undefined,
      bankAmount: paymentMode === "Cash & UPI" ? Number(bankAmount) || 0 : undefined,
    });

    toast.success(`Sold ${sellQty} unit(s) of ${accessory.name} for ₹${isFinite(totalCalc) ? totalCalc.toLocaleString("en-IN") : totalCalc} (${paymentMode})`);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm rounded-xl border border-border shadow-2xl p-6">
        <DialogHeader className="border-b border-border pb-3">
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <ArrowDownLeft className="size-5 text-success" />
            <span>Sell Accessory Item</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Invoice sale checkout for accessory item.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3.5 text-sm">
          <div className="bg-muted/30 p-2.5 rounded border border-border/60 text-xs flex justify-between">
            <span>Available Stock:</span>
            <strong className="text-foreground">{accessory.stock} units</strong>
          </div>

          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">Sales Quantity</span>
            <input
              type="number"
              min="1"
              max={accessory.stock}
              value={qty}
              onChange={(e) => {
                const val = e.target.value.slice(0, 6);
                setQty(val);
                handlePriceOrQtyChange(val, price);
              }}
              className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">Selling Price (₹)</span>
            <input
              type="number"
              min="0"
              max="99999999"
              value={price}
              onChange={(e) => {
                const val = e.target.value.slice(0, 8);
                setPrice(val);
                handlePriceOrQtyChange(qty, val);
              }}
              placeholder="e.g. 400"
              className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">Payment Account (Cash / UPI)</span>
            <select
              value={paymentMode}
              onChange={(e) => handleModeChange(e.target.value as "Cash" | "UPI" | "Cash & UPI")}
              className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm font-semibold focus:ring-2 focus:ring-ring/20 focus:outline-none cursor-pointer"
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Cash & UPI">Cash and UPI</option>
            </select>
          </label>

          {paymentMode === "Cash & UPI" && (
            <div className="grid grid-cols-2 gap-3 bg-muted/20 p-2.5 rounded-lg border border-border">
              <label className="block">
                <span className="text-xs font-semibold text-muted-foreground">Cash Received (₹)</span>
                <input
                  type="number"
                  min="0"
                  value={cashAmount}
                  onChange={(e) => {
                    const c = Math.max(0, Number(e.target.value) || 0);
                    setCashAmount(c);
                    setBankAmount(Math.max(0, cost - c));
                  }}
                  className="mt-1 h-9 w-full rounded-md border border-border bg-background px-3 text-sm focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-muted-foreground">UPI Received (₹)</span>
                <input
                  type="number"
                  min="0"
                  value={bankAmount}
                  onChange={(e) => {
                    const b = Math.max(0, Number(e.target.value) || 0);
                    setBankAmount(b);
                    setCashAmount(Math.max(0, cost - b));
                  }}
                  className="mt-1 h-9 w-full rounded-md border border-border bg-background px-3 text-sm focus:outline-none"
                />
              </label>
            </div>
          )}

          <div className="flex justify-between items-center text-xs border-t border-border pt-3">
            <span className="text-muted-foreground font-semibold">Total Price:</span>
            <span className="text-base font-extrabold text-success truncate max-w-[200px] inline-block text-right" title={`₹${cost.toLocaleString("en-IN")}`}>
              ₹{cost.toLocaleString("en-IN")}
            </span>
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
            disabled={!qty || Number(qty) <= 0 || Number(qty) > accessory.stock || !price || Number(price) <= 0}
            onClick={handleCheckout}
            className="h-9 px-4 rounded-md bg-foreground text-background text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all ml-auto"
          >
            Record Sale
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AccessoriesPage() {
  const accessories = useMobileStore((s) => s.accessories);
  const deleteAccessory = useMobileStore((s) => s.deleteAccessory);

  const [q, setQ] = useState("");
  const [selectedCategoryTab, setSelectedCategoryTab] = useState("All");
  const [isBuying, setIsBuying] = useState(false);
  const [editing, setEditing] = useState<MobileAccessory | null>(null);
  const [selling, setSelling] = useState<MobileAccessory | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleManualSync = async () => {
    setIsSyncing(true);
    toast.info("Syncing accessories from Google Sheets...");
    try {
      const ok = await triggerManualSync(true);
      if (ok) {
        toast.success("Accessories inventory updated");
      } else {
        toast.error("Could not sync with Google Sheets.");
      }
    } catch {
      toast.error("Failed to sync accessories");
    } finally {
      setIsSyncing(false);
    }
  };

  const filtered = accessories.filter((a) => {
    if (selectedCategoryTab !== "All" && a.category !== selectedCategoryTab) return false;
    if (q) {
      const text = q.toLowerCase();
      return [a.name, a.category, a.status].some((v) => String(v || "").toLowerCase().includes(text));
    }
    return true;
  });

  const totalQuantity = accessories.reduce((sum, item) => sum + item.stock, 0);
  const totalCostValuation = accessories.reduce((sum, item) => sum + (item.purchasePrice * item.stock), 0);
  const totalSellValuation = accessories.reduce((sum, item) => sum + ((item.sellingPrice || 0) * item.stock), 0);

  const categories = ["All", ...Array.from(new Set(accessories.map((a) => a.category)))];

  const formatInr = (num: number) => "₹" + Math.round(num).toLocaleString("en-IN");

  return (
    <AppShell breadcrumb="Accessories">
      {(isBuying || editing) && (
        <AccessoryFormDialog
          a={editing || undefined}
          onClose={() => {
            setIsBuying(false);
            setEditing(null);
          }}
        />
      )}
      {selling && <SellAccessoryDialog accessory={selling} onClose={() => setSelling(null)} />}

      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight">Accessories Inventory</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Procure, stock, and track chargers, covers, screen guards, and earbuds.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="h-9 px-3.5 rounded-md border border-border text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-accent transition-colors shadow-sm disabled:opacity-50"
            title="Refresh accessories from Google Sheets"
          >
            <RefreshCw className={`size-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Syncing..." : "Sync Inventory"}
          </button>
          <button
            onClick={() => setIsBuying(true)}
            className="h-9 px-4 rounded-md bg-foreground text-background text-sm font-semibold inline-flex items-center gap-1.5 hover:opacity-90 shadow transition-opacity"
          >
            <ShoppingBag className="size-3.5" /> Buy Accessories
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Catalog Items"
          value={accessories.length.toString()}
          sub="Unique items registered"
          icon={<ShoppingBag className="size-4" />}
        />
        <StatCard
          label="Physical Stock Units"
          value={totalQuantity.toString()}
          sub="Total item stock"
          icon={<Package className="size-4" />}
          trend="up"
        />
        <StatCard
          label="Product Stock Sell Value"
          value={formatInr(totalSellValuation)}
          sub="Potential stock sell value"
          icon={<TrendingUp className="size-4 text-success" />}
          trend="up"
        />
        <StatCard
          label="Stock Purchase Cost"
          value={formatInr(totalCostValuation)}
          sub="Total procurement investment"
          icon={<Landmark className="size-4" />}
        />
      </div>

      <Card>
        <div className="p-4 border-b border-border flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="size-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search accessory name, category, status..."
              className="h-9 w-full rounded-md border border-border bg-background pl-8 pr-3 text-sm focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Filter Category:</span>
            <select
              value={selectedCategoryTab}
              onChange={(e) => setSelectedCategoryTab(e.target.value)}
              className="h-9 min-w-[160px] rounded-md border border-border bg-surface px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ring/20 cursor-pointer"
            >
              <option value="All">All Categories ({accessories.length})</option>
              {categories.filter((c) => c !== "All").map((cat) => (
                <option key={cat} value={cat}>
                  {cat} ({accessories.filter((a) => a.category === cat).length})
                </option>
              ))}
            </select>
          </div>
        </div>

        <SectionHeader
          title={`${filtered.length} Accessory Types`}
          action={<span className="text-xs text-muted-foreground">Perform direct cash or UPI sales using sell button</span>}
        />

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border bg-muted/10">
                <th className="py-3 px-5 font-semibold">Accessory ID</th>
                <th className="py-3 px-4 font-semibold">Item Description</th>
                <th className="py-3 px-4 font-semibold">Category Type</th>
                <th className="py-3 px-4 text-center font-semibold">Stock Qty</th>
                <th className="py-3 px-4 text-right font-semibold">Cost Price</th>
                <th className="py-3 px-4 text-right font-semibold">Sell Price</th>
                <th className="py-3 px-4 text-right font-semibold">Total Sell Value</th>
                <th className="py-3 px-5 text-right font-semibold">Ledger Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground font-semibold">
                    No accessory items match selection filters.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="border-b border-border hover:bg-accent/40 transition-colors last:border-0">
                    <td className="py-3 px-5 font-mono text-xs text-muted-foreground">{item.id}</td>
                    <td className="py-3 px-4 font-semibold text-foreground">{item.name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{item.category}</td>
                    <td className="py-3 px-4 text-center font-bold text-base text-foreground">{item.stock}</td>
                    <td className="py-3 px-4 text-right font-medium text-muted-foreground">{formatInr(item.purchasePrice)}</td>
                    <td className="py-3 px-4 text-right font-semibold text-foreground">{formatInr(item.sellingPrice || 0)}</td>
                    <td className="py-3 px-4 text-right font-bold text-success">{formatInr((item.sellingPrice || 0) * item.stock)}</td>
                    <td className="py-3 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex gap-1.5">
                        {item.stock > 0 && (
                          <button
                            title="Quick Sale Checkout"
                            onClick={() => setSelling(item)}
                            className="h-7 px-2.5 rounded border border-success/15 bg-success/5 text-success inline-flex items-center gap-1 hover:bg-success hover:text-white transition-all text-xs font-semibold shadow-sm"
                          >
                            Sell
                          </button>
                        )}
                        <button
                          title="Edit accessory specifications"
                          onClick={() => setEditing(item)}
                          className="size-8 rounded border border-border bg-surface text-foreground grid place-items-center hover:bg-accent transition-colors shadow-sm"
                        >
                          <Edit className="size-3.5" />
                        </button>
                        <button
                          title="Delete accessory"
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete accessory ${item.name}?`)) {
                              deleteAccessory(item.id);
                              toast.success(`Deleted ${item.name}`);
                            }
                          }}
                          className="size-8 rounded border border-destructive/15 bg-destructive/5 text-destructive grid place-items-center hover:bg-destructive hover:text-white transition-colors"
                        >
                          <Trash2 className="size-3.5" />
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
    </AppShell>
  );
}
