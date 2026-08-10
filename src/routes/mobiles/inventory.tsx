import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Search, ArrowUpRight, ArrowDownLeft, ShieldAlert, Plus, Layers, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Badge, Card, SectionHeader, StatCard } from "@/components/ui-kit";
import { useMobileStore, MobileInventoryItem } from "@/lib/mobileStore";

export const Route = createFileRoute("/mobiles/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory · Jain Mobiles ERP" },
      { name: "description", content: "Mobile shop stock inventory management." },
    ],
  }),
  component: InventoryPage,
});



function InventoryPage() {
  const inventory = useMobileStore((s) => s.inventory) || [];
  const [q, setQ] = useState("");
  const [filterStatus, setFilterStatus] = useState<"All" | "In Stock" | "Low Stock">("All");

  const filtered = (inventory || []).filter((item) => {
    if (!item) return false;
    if (item.quantity <= 0) return false;
    if (filterStatus !== "All" && item.status !== filterStatus) return false;
    if (q) {
      const text = q.toLowerCase();
      return [item.productName, item.brand, item.status].some((v) =>
        v ? String(v).toLowerCase().includes(text) : false
      );
    }
    return true;
  });

  const totalQuantity = inventory.reduce((s, i) => s + i.quantity, 0);
  const totalValuationCost = inventory.reduce((s, i) => s + (i.purchasePrice * i.quantity), 0);

  const lowStockCount = inventory.filter((i) => i.status === "Low Stock").length;

  const formatInr = (num: number) => "₹" + Math.round(num).toLocaleString("en-IN");

  return (
    <AppShell breadcrumb="Inventory">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight">Inventory & Stock Levels</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time stock quantities and statuses.
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <StatCard label="Total Physical Stock" value={totalQuantity.toString()} sub="Units in store room" icon={<Layers className="size-4" />} />
        <StatCard label="Low Stock Models" value={lowStockCount.toString()} sub="Requires inward orders" icon={<AlertCircle className="size-4" />} trend={lowStockCount > 0 ? "warn" : undefined} />
      </div>

      {/* Low stock alert box */}
      {lowStockCount > 0 && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-warning/45 bg-warning/5 px-4 py-3">
          <ShieldAlert className="size-4 text-warning shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-semibold text-warning">{lowStockCount} models are low on stock.</span>
            <span className="text-muted-foreground ml-1.5">
              Review items marked with a <Badge tone="warning">Low Stock</Badge> badge in the listing.
            </span>
          </div>
        </div>
      )}

      <Card>
        {/* Search & filters */}
        <div className="p-4 border-b border-border flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="size-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search stock by product name, brand, model..."
              className="h-9 w-full rounded-md border border-border bg-background pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
          </div>
          {(["All", "In Stock", "Low Stock"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`h-9 px-3.5 rounded-md border text-xs font-bold transition-all duration-200 ${
                filterStatus === status
                  ? "bg-foreground text-background border-foreground shadow-sm"
                  : "border-border bg-surface hover:bg-accent text-muted-foreground hover:text-foreground"
              }`}
            >
              {status}
              {status !== "All" && (
                <span className="ml-1.5 opacity-60">
                  {inventory.filter((item) => item.status === status).length}
                </span>
              )}
            </button>
          ))}
        </div>

        <SectionHeader
          title={`${filtered.length} Stock Records`}
          action={<span className="text-xs text-muted-foreground">Active products inventory list</span>}
        />

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border bg-muted/10">
                <th className="py-3 px-5 font-semibold">SKU / Product ID</th>
                <th className="py-3 px-4 font-semibold">Brand & Product Name</th>
                <th className="py-3 px-4 text-center font-semibold">In Stock Qty</th>
                <th className="py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-muted-foreground font-medium">
                    No stock records found matching filters.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr
                     key={item.id}
                     className="border-b border-border hover:bg-accent/40 transition-colors last:border-0"
                  >
                    <td className="py-3 px-5 font-mono text-xs text-muted-foreground">{item.productId}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground">{item.productName}</div>
                      <div className="text-xs text-muted-foreground">{item.brand}</div>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-base text-foreground">{item.quantity}</td>
                    <td className="py-3 px-4">
                      <Badge tone={item.status === "In Stock" ? "success" : item.status === "Low Stock" ? "warning" : "danger"}>
                        {item.status}
                      </Badge>
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
