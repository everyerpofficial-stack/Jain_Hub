import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Plus, Download, Search, Eye, Edit, Trash2, Smartphone, Shield, Tag, Barcode, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Badge, Card, SectionHeader, StatCard } from "@/components/ui-kit";
import { useMobileStore, MobileProduct, getBrandsForCategory } from "@/lib/mobileStore";

export const Route = createFileRoute("/mobiles/products")({
  head: () => ({
    meta: [
      { title: "Products · Jain Mobiles ERP" },
      { name: "description", content: "Mobile shop product catalog management." },
    ],
  }),
  component: ProductsPage,
});

function ProductDetailDialog({ p: product, onClose, onEdit }: { p: MobileProduct; onClose: () => void; onEdit: () => void }) {
  const deleteProduct = useMobileStore((s) => s.deleteProduct);

  const formatInr = (num: number) => "₹" + Math.round(num).toLocaleString("en-IN");

  const getDynamicLabels = () => {
    if (product.category === "TV") {
      return { spec: "Screen Size", type: "Resolution / Panel" };
    }
    if (product.category === "Frize") {
      return { spec: "Capacity", type: "Door & Rating" };
    }
    if (product.category === "Waching Machine") {
      return { spec: "Load Capacity", type: "Machine Type" };
    }
    return { spec: "RAM / Storage", type: "Color" };
  };

  const labels = getDynamicLabels();

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-xl border border-border shadow-2xl p-6">
        <DialogHeader className="border-b border-border pb-4">
          <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Product Catalog Folder</div>
          <DialogTitle className="text-xl font-bold flex items-center gap-2 mt-1">
            {product.name}
            <Badge tone={product.status === "In Stock" ? "success" : product.status === "Low Stock" ? "warning" : "danger"}>
              {product.status}
            </Badge>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {product.brand} · {product.model}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3.5 text-sm">
          {/* Specifications */}
          <div className="grid grid-cols-2 gap-3 bg-muted/25 p-3 rounded-lg border border-border/40">
            <div>
              <span className="text-[10px] text-muted-foreground font-semibold block uppercase tracking-wider">{labels.type}</span>
              <span className="font-semibold text-foreground">{product.color}</span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground font-semibold block uppercase tracking-wider">{labels.spec}</span>
              <span className="font-semibold text-foreground">{product.ramRom}</span>
            </div>
            <div className="mt-1">
              <span className="text-[10px] text-muted-foreground font-semibold block uppercase tracking-wider">Category</span>
              <span className="font-semibold text-foreground">{product.category}</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="border-t border-b border-border/40 py-3.5">
            <div>
              <span className="text-xs text-muted-foreground font-medium block">Purchase / Cost Price</span>
              <span className="text-lg font-bold text-foreground">{formatInr(product.purchasePrice)}</span>
            </div>
          </div>

          {/* Remarks */}
          {product.remark && (
            <div className="bg-muted/15 p-2.5 rounded border border-border/30 text-xs">
              <span className="font-bold text-muted-foreground uppercase tracking-wider text-[9px] block mb-1">Remarks</span>
              <span className="text-foreground leading-relaxed">{product.remark}</span>
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-border pt-4 flex gap-2 justify-end">
          <button
            onClick={() => {
              if (confirm(`Are you sure you want to delete ${product.name} from the catalog?`)) {
                deleteProduct(product.id);
                toast.success(`Deleted ${product.name}`);
                onClose();
              }
            }}
            className="h-9 px-3 rounded-md bg-destructive/10 text-destructive text-sm font-semibold hover:bg-destructive/20 transition-colors"
          >
            Delete Product
          </button>
          <button
            onClick={onEdit}
            className="h-9 px-4 rounded-md bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity ml-auto"
          >
            Edit Specifications
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ProductFormDialog({
  p: product,
  onClose
}: {
  p?: MobileProduct;
  onClose: () => void;
}) {
  const addProduct = useMobileStore((s) => s.addProduct);
  const updateProduct = useMobileStore((s) => s.updateProduct);

  const [category, setCategory] = useState("TV");
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("Samsung");
  const [model, setModel] = useState("");
  const [remark, setRemark] = useState("");

  const [colorVal, setColorVal] = useState("");
  const [ramRomVal, setRamRomVal] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");

  useEffect(() => {
    if (product) {
      setCategory(product.category || "TV");
      setName(product.name);
      setBrand(product.brand);
      setModel(product.model);
      setRemark(product.remark || "");
      setColorVal(product.color);
      setRamRomVal(product.ramRom);
      setPurchasePrice(product.purchasePrice.toString());
    }
  }, [product]);

  useEffect(() => {
    const categoryBrands = getBrandsForCategory(category);
    if (!categoryBrands.includes(brand)) {
      setBrand(categoryBrands[0] || "Samsung");
    }
    if (!product) {
      if (category === "TV") {
        setRamRomVal("43 Inch");
        setColorVal("4K UHD");
      } else if (category === "Frize") {
        setRamRomVal("190 Liters");
        setColorVal("Single Door - 3 Star");
      } else if (category === "Waching Machine") {
        setRamRomVal("7 kg");
        setColorVal("Top Load - Fully Automatic");
      } else {
        setRamRomVal("8GB/128GB");
        setColorVal("Default Color");
      }
    }
  }, [category, product]);

  const canSave = name.trim() && model.trim() && purchasePrice;

  const handleSave = () => {
    const pData = {
      name: name.trim(),
      brand,
      model: model.trim(),
      color: colorVal.trim() || "Default",
      ramRom: ramRomVal.trim() || "Default Specs",
      category,
      purchasePrice: Number(purchasePrice),
      remark: remark.trim()
    };

    if (product) {
      updateProduct(product.id, pData);
      toast.success(`Updated ${name}`);
    } else {
      addProduct(pData);
      toast.success(`Added new product ${name}`);
    }
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-xl border border-border shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-border pb-4">
          <DialogTitle className="text-lg font-bold">
            {product ? "Edit Product Specifications" : "Register New Product Model"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {product ? "Update parameters of the catalog item." : "Create new entries for sales and stock tracking."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3 text-sm">
          {/* Category SELECT FIRST */}
          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
            >
              {["TV", "Frize", "Waching Machine", "Smartphones", "Basic Phones", "Tablets"].map((cat) => (
                <option key={cat} value={cat}>{cat === "Frize" ? "Fridge (Frize)" : cat === "Waching Machine" ? "Washing Machine" : cat}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">Product Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Samsung Neo QLED TV"
              className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-semibold text-muted-foreground">Brand</span>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
              >
                {getBrandsForCategory(category).map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-muted-foreground">Model Code</span>
              <input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. QA43QN90C"
                className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
              />
            </label>
          </div>

          {/* Conditional Specs */}
          {category === "TV" && (
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-semibold text-muted-foreground">Screen Size</span>
                <select
                  value={ramRomVal}
                  onChange={(e) => setRamRomVal(e.target.value)}
                  className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
                >
                  {["32 Inch", "43 Inch", "50 Inch", "55 Inch", "65 Inch", "75 Inch", "85 Inch"].map((sz) => (
                    <option key={sz} value={sz}>{sz}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-muted-foreground">Resolution / Panel Type</span>
                <input
                  value={colorVal}
                  onChange={(e) => setColorVal(e.target.value)}
                  placeholder="e.g. 4K UHD, QLED, OLED"
                  className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
                />
              </label>
            </div>
          )}

          {category === "Frize" && (
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-semibold text-muted-foreground">Capacity</span>
                <input
                  value={ramRomVal}
                  onChange={(e) => setRamRomVal(e.target.value)}
                  placeholder="e.g. 190 Liters, 250L"
                  className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-muted-foreground">Door Type & Rating</span>
                <input
                  value={colorVal}
                  onChange={(e) => setColorVal(e.target.value)}
                  placeholder="e.g. Single Door - 3 Star"
                  className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
                />
              </label>
            </div>
          )}

          {category === "Waching Machine" && (
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-semibold text-muted-foreground">Load Capacity</span>
                <input
                  value={ramRomVal}
                  onChange={(e) => setRamRomVal(e.target.value)}
                  placeholder="e.g. 6.5 kg, 7.5 kg, 8 kg"
                  className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-muted-foreground">Machine Type</span>
                <input
                  value={colorVal}
                  onChange={(e) => setColorVal(e.target.value)}
                  placeholder="e.g. Top Load - Fully Auto"
                  className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
                />
              </label>
            </div>
          )}

          {category !== "TV" && category !== "Frize" && category !== "Waching Machine" && (
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-semibold text-muted-foreground">Color</span>
                <input
                  value={colorVal}
                  onChange={(e) => setColorVal(e.target.value)}
                  placeholder="e.g. Titanium Blue"
                  className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-muted-foreground">RAM / ROM Specs</span>
                <select
                  value={ramRomVal}
                  onChange={(e) => setRamRomVal(e.target.value)}
                  className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
                >
                  {["4GB/64GB", "6GB/128GB", "8GB/128GB", "8GB/256GB", "12GB/256GB", "12GB/512GB", "16GB/512GB", "16GB/1TB"].map((rr) => (
                    <option key={rr} value={rr}>{rr}</option>
                  ))}
                </select>
              </label>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3">
            <label className="block">
              <span className="text-xs font-semibold text-muted-foreground">Purchase Cost (₹)</span>
              <input
                type="number"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                placeholder="10000"
                className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">Remark / Note</span>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="Add product catalog notes or remarks here..."
              className="mt-1 min-h-[60px] w-full rounded-md border border-border bg-surface p-3 text-sm focus:ring-2 focus:ring-ring/20 focus:outline-none"
            />
          </label>
        </div>

        <DialogFooter className="border-t border-border pt-4 flex gap-2">
          <button
            onClick={onClose}
            className="h-9 px-3.5 rounded-md border border-border bg-surface text-sm hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!canSave}
            onClick={handleSave}
            className="h-9 px-5 rounded-md bg-foreground text-background text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all ml-auto"
          >
            Save Specifications
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ProductsPage() {
  const products = useMobileStore((s) => s.products);
  const inventory = useMobileStore((s) => s.inventory);

  const [q, setQ] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [selected, setSelected] = useState<MobileProduct | null>(null);
  const [editing, setEditing] = useState<MobileProduct | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Check URL params for action
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get("action") === "new" || sessionStorage.getItem("mobiles_trigger_new_product") === "true") {
      setIsAdding(true);
      sessionStorage.removeItem("mobiles_trigger_new_product");
      // Clean query params
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const brandsList = ["All", ...Array.from(new Set(products.map((p) => p.brand)))];

  const getStockQty = (prodId: string) => {
    const item = inventory.find((inv) => inv.productId === prodId);
    return item ? item.quantity : 0;
  };

  const getStockStatus = (prodId: string) => {
    const item = inventory.find((inv) => inv.productId === prodId);
    return item ? item.status : "Out of Stock";
  };

  const filtered = products.filter((p) => {
    if (selectedBrand !== "All" && p.brand !== selectedBrand) return false;
    if (q) {
      const matchText = q.toLowerCase();
      // Coerced, not optional-chained: Sheets hands back a numeric model or
      // spec as a NUMBER, and .toLowerCase() on it threw mid-render — typing
      // in this box blanked the whole page.
      return [p.name, p.brand, p.model, p.color, p.ramRom, p.remark].some((field) =>
        String(field ?? "").toLowerCase().includes(matchText)
      );
    }
    return true;
  });

  const formatInr = (num: number) => "₹" + Math.round(num).toLocaleString("en-IN");

  return (
    <AppShell breadcrumb="Products">
      {/* Dialogs */}
      {selected && (
        <ProductDetailDialog
          p={selected}
          onClose={() => setSelected(null)}
          onEdit={() => {
            setEditing(selected);
            setSelected(null);
          }}
        />
      )}
      {(isAdding || editing) && (
        <ProductFormDialog
          p={editing || undefined}
          onClose={() => {
            setIsAdding(false);
            setEditing(null);
          }}
        />
      )}

      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight">Product Catalog Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filtered.length} products listed in active store database
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              toast.success("Excel sheet generated & downloading");
            }}
            className="h-9 px-3 rounded-md border border-border bg-surface text-sm inline-flex items-center gap-1.5 hover:bg-accent font-semibold transition-colors shadow-sm"
          >
            <Download className="size-3.5" /> Export Catalog
          </button>
          <button
            onClick={() => setIsAdding(true)}
            className="h-9 px-4 rounded-md bg-foreground text-background text-sm font-semibold inline-flex items-center gap-1.5 hover:opacity-90 shadow transition-opacity"
          >
            <Plus className="size-3.5" /> Add Product
          </button>
        </div>
      </div>

      {/* Quick metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Catalog Models" value={products.length.toString()} sub="Unique items registered" />
        <StatCard label="Total Available Stock" value={inventory.reduce((sum, item) => sum + item.quantity, 0).toString()} sub="Units in inventory" trend="up" />
        <StatCard label="Low Stock Models" value={inventory.filter(i => i.status === "Low Stock").length.toString()} sub="Nearing minimum limits" trend={inventory.some(i => i.status === "Low Stock") ? "warn" : undefined} />
        <StatCard label="Out of Stock Models" value={inventory.filter(i => i.status === "Out of Stock").length.toString()} sub="No stock available" trend={inventory.some(i => i.status === "Out of Stock") ? "down" : undefined} />
      </div>

      {/* Product List Table */}
      <Card>
        {/* Search and Brand Filters */}
        <div className="p-4 border-b border-border flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="size-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, model, specs, barcode..."
              className="h-9 w-full rounded-md border border-border bg-background pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Filter Brand:</span>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="h-9 min-w-[160px] rounded-md border border-border bg-surface px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ring/20 cursor-pointer"
            >
              <option value="All">All Brands ({products.length})</option>
              {brandsList.filter((b) => b !== "All").map((brand) => (
                <option key={brand} value={brand}>
                  {brand} ({products.filter((p) => p.brand === brand).length})
                </option>
              ))}
            </select>
          </div>
        </div>

        <SectionHeader
          title={`${filtered.length} Product Models`}
          action={<span className="text-xs text-muted-foreground">Click on any row to view full details</span>}
        />

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border bg-muted/10">
                <th className="py-3 px-5 font-semibold">Product ID</th>
                <th className="py-3 px-4 font-semibold">Brand & Name</th>
                <th className="py-3 px-4 font-semibold">Model & Type/Color</th>
                <th className="py-3 px-4 font-semibold">Specs / Capacity</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold text-right">Cost Price</th>
                <th className="py-3 px-4 text-center font-semibold">Qty</th>
                <th className="py-3 px-4 font-semibold">Stock Status</th>
                <th className="py-3 px-5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-muted-foreground font-medium">
                    No product models found matching the filters.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const qty = getStockQty(p.id);
                  const status = getStockStatus(p.id);
                  return (
                    <tr
                      key={p.id}
                      onClick={() => setSelected(p)}
                      className="border-b border-border hover:bg-accent/40 cursor-pointer transition-colors last:border-0"
                    >
                      <td className="py-3 px-5 font-mono text-xs text-muted-foreground">{p.id}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-foreground">{p.name}</div>
                        <div className="text-xs text-muted-foreground">{p.brand}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-foreground">{p.model}</div>
                        <div className="text-xs text-muted-foreground">{p.color}</div>
                      </td>
                      <td className="py-3 px-4 font-medium text-foreground/80">{p.ramRom}</td>
                      <td className="py-3 px-4 text-muted-foreground">{p.category}</td>
                      <td className="py-3 px-4 text-right font-medium text-muted-foreground">{formatInr(p.purchasePrice)}</td>
                      <td className="py-3 px-4 text-center font-bold">{qty}</td>
                      <td className="py-3 px-4">
                        <Badge tone={status === "In Stock" ? "success" : status === "Low Stock" ? "warning" : "danger"}>
                          {status}
                        </Badge>
                      </td>
                      <td className="py-3 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex gap-1.5">
                          <button
                            title="View specifications"
                            onClick={() => setSelected(p)}
                            className="size-8 rounded border border-primary/10 bg-primary/5 text-primary grid place-items-center hover:bg-primary hover:text-white transition-colors"
                          >
                            <Eye className="size-3.5" />
                          </button>
                          <button
                            title="Edit product specs"
                            onClick={() => setEditing(p)}
                            className="size-8 rounded border border-border bg-surface text-foreground grid place-items-center hover:bg-accent transition-colors"
                          >
                            <Edit className="size-3.5" />
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
