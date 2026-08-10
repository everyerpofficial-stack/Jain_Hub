import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Globe, Database, Download, Upload, CheckCircle2, XCircle, Loader2, Trash2, Users, CreditCard, TrendingUp, Package, ShoppingCart, BarChart2, Truck, AlertTriangle, Landmark, Mail, Phone, MapPin, ClipboardList, Wifi } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Card, SectionHeader } from "@/components/ui-kit";
import { useMobileStore } from "@/lib/mobileStore";
import { useStore } from "@/lib/store";
import { pingScript } from "@/lib/googleSheets";

export const Route = createFileRoute("/mobiles/settings")({
  head: () => ({
    meta: [
      { title: "Settings · Jain Mobiles ERP" },
      { name: "description", content: "Mobile shop configuration, database sync, and data management for Finance & Mobiles." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const settings       = useMobileStore((s) => s.settings);
  const updateSettings = useMobileStore((s) => s.updateSettings);
  const resetMobiles   = useMobileStore((s) => s.resetAll);
  const resetSeed      = useStore((s) => s.resetSeed);

  // Store profile fields
  const [storeName,     setStoreName]     = useState(settings.storeName);
  const [gstNo,         setGstNo]         = useState(settings.gstNo);
  const [contact,       setContact]       = useState(settings.contact);
  const [email,         setEmail]         = useState(settings.email);
  const [address,       setAddress]       = useState(settings.address);
  const [invoicePrefix, setInvoicePrefix] = useState(settings.invoicePrefix);

  // Finance data counts
  const finCustomers   = useStore((s) => s.customers);
  const finPayments    = useStore((s) => s.payments);
  const finExpenses    = useStore((s) => s.expenses);
  const finInvestments = useStore((s) => s.investments);
  const finStaff       = useStore((s) => s.staff);

  // Mobiles data counts
  const mobSales       = useMobileStore((s) => s.sales);
  const mobPurchases   = useMobileStore((s) => s.purchases);
  const mobProducts    = useMobileStore((s) => s.products);
  const mobSuppliers   = useMobileStore((s) => s.suppliers);
  const mobCustomers   = useMobileStore((s) => s.customers);
  const mobExpenses    = useMobileStore((s) => s.expenses);
  const mobAccessories = useMobileStore((s) => s.accessories);
  const mobWarranties  = useMobileStore((s) => s.warranties);

  // Sync state
  const sheetsConfig       = useMobileStore((s) => s.sheetsConfig);
  const updateSheetsConfig = useMobileStore((s) => s.updateSheetsConfig);
  const syncToSheets       = useMobileStore((s) => s.syncToSheets);
  const loadFromSheets     = useMobileStore((s) => s.loadFromSheets);
  const [urlInput,    setUrlInput]    = useState(sheetsConfig.url || "");

  useEffect(() => {
    if (sheetsConfig.url && !urlInput) {
      setUrlInput(sheetsConfig.url);
    }
  }, [sheetsConfig.url]);

  const [syncing,     setSyncing]     = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [syncingBoth, setSyncingBoth] = useState(false);
  const [clearing,    setClearing]    = useState(false);
  const [testing,     setTesting]     = useState(false);
  const [testResult,  setTestResult]  = useState<"ok" | "error" | null>(null);

  const handleTestConnection = async () => {
    const url = urlInput.trim() || sheetsConfig.url;
    if (!url) { toast.error("Enter the Apps Script URL first"); return; }
    setTesting(true);
    setTestResult(null);
    const result = await pingScript(url);
    setTesting(false);
    if (result.ok) {
      setTestResult("ok");
      toast.success("✅ Connection successful! Apps Script is reachable.");
    } else {
      setTestResult("error");
      toast.error("❌ Connection failed: " + (result.error || "Unknown") + ". Check your URL and deployment settings.");
    }
  };

  const handleSaveProfile = () => {
    updateSettings({ storeName, gstNo, contact, email, address, invoicePrefix });
    toast.success("Store profile saved");
  };

  const handleSaveUrl = () => {
    const trimmed = urlInput.trim();
    updateSheetsConfig({ url: trimmed, enabled: !!trimmed });
    useStore.getState().updateSheetsConfig({ url: trimmed, enabled: !!trimmed });
    toast.success("Apps Script URL saved for both Finance & Mobiles modules!");
  };

  const handleSyncMobiles = async () => {
    if (!sheetsConfig.url && !urlInput.trim()) {
      toast.error("Please enter and save the Apps Script URL first");
      return;
    }
    setSyncing(true);
    const result = await syncToSheets();
    setSyncing(false);
    result.ok ? toast.success("All Mobiles data synced to Google Sheets ✅") : toast.error(`Sync failed: ${result.error}`);
  };

  const handleSyncBoth = async () => {
    if (!sheetsConfig.url && !urlInput.trim()) {
      toast.error("Please enter and save the Apps Script URL first");
      return;
    }
    setSyncingBoth(true);
    try {
      const [finResult, mobResult] = await Promise.all([
        useStore.getState().syncToSheets(),
        useMobileStore.getState().syncToSheets(),
      ]);
      if (finResult.ok && mobResult.ok) {
        toast.success("Both Finance & Mobiles data synced to Google Sheets ✅");
      } else {
        const errs = [finResult.error, mobResult.error].filter(Boolean).join("; ");
        toast.error(`Partial sync failure: ${errs}`);
      }
    } catch (e: any) {
      toast.error(`Sync error: ${e?.message || e}`);
    } finally {
      setSyncingBoth(false);
    }
  };

  const handleLoadFromSheets = async () => {
    setLoading(true);
    const result = await loadFromSheets();
    setLoading(false);
    result.ok ? toast.success("Mobiles data loaded from Google Sheets ✅") : toast.error(`Load failed: ${result.error}`);
  };

  const handleClearMobiles = () => {
    if (!confirm("Delete all Jain Mobiles data (sales, products, suppliers, purchases)?")) return;
    resetMobiles();
    toast.success("Mobiles module data cleared");
  };

  const handleClearFinance = () => {
    if (!confirm("Delete all Jain Finance data (customers, payments, expenses, investments)?")) return;
    resetSeed();
    toast.success("Finance module data cleared");
  };

  const handleClearAll = () => {
    if (!confirm("⚠️ WARNING: This will permanently delete ALL data from both Jain Finance AND Jain Mobiles modules.\n\nThis action cannot be undone.\n\nAre you absolutely sure?")) return;
    if (!confirm("Final confirmation: Delete ALL Finance AND Mobiles data now?")) return;
    setClearing(true);
    setTimeout(() => {
      resetSeed();
      resetMobiles();
      setClearing(false);
      toast.success("All data cleared for both Finance & Mobiles modules");
    }, 600);
  };

  const totalFinanceRecords = finCustomers.length + finPayments.length + finExpenses.length + finInvestments.length;
  const totalMobilesRecords = mobSales.length + mobPurchases.length + mobProducts.length + mobSuppliers.length + mobCustomers.length + mobExpenses.length;
  const grandTotal = totalFinanceRecords + totalMobilesRecords;

  return (
    <AppShell breadcrumb="Settings">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight">Store Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure your store profile, database sync, and manage all data.</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* ── Store Profile ────────────────────────────────────────────────── */}
        <Card className="p-5">
          <SectionHeader title="Store Profile" action={<Landmark className="size-3.5 text-muted-foreground" />} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1"><ClipboardList className="size-3" /> Store Name</label>
              <input value={storeName} onChange={(e) => setStoreName(e.target.value)}
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Phone className="size-3" /> Contact Number</label>
              <input value={contact} onChange={(e) => setContact(e.target.value)}
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Mail className="size-3" /> Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)}
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1"><MapPin className="size-3" /> Address</label>
              <input value={address} onChange={(e) => setAddress(e.target.value)}
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Invoice Prefix</label>
              <input value={invoicePrefix} onChange={(e) => setInvoicePrefix(e.target.value)}
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
            </div>
          </div>
          <div className="pt-4 flex justify-end">
            <button onClick={handleSaveProfile}
              className="h-9 px-5 rounded-md bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-all shadow-sm">
              Save Profile
            </button>
          </div>
        </Card>

        {/* ── Database Stats Panel ─────────────────────────────────────────── */}
        <Card className="p-5">
          <SectionHeader title="Database Overview — Finance & Mobiles Combined" action={<Database className="size-3.5 text-success" />} />

          {/* Grand total */}
          <div className="mb-5 flex items-center gap-4 p-4 rounded-xl border border-border bg-muted/20 mt-4">
            <div className="size-12 rounded-xl bg-foreground text-background flex items-center justify-center shrink-0">
              <Database className="size-5" />
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight">{grandTotal.toLocaleString("en-IN")}</div>
              <div className="text-xs text-muted-foreground font-medium">Total records across all modules</div>
            </div>
            <div className="ml-auto flex gap-6 text-center">
              <div>
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{totalFinanceRecords}</div>
                <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Finance</div>
              </div>
              <div>
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{totalMobilesRecords}</div>
                <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Mobiles</div>
              </div>
            </div>
          </div>

          {/* Two-column breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Finance breakdown */}
            <div className="rounded-xl border border-blue-200/60 dark:border-blue-900/40 overflow-hidden">
              <div className="px-4 py-2.5 bg-blue-50 dark:bg-blue-950/30 border-b border-blue-200/60 dark:border-blue-900/40">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">📘 Jain Finance Module</span>
              </div>
              <div className="divide-y divide-border/60">
                <StatRow icon={<Users className="size-3.5 text-blue-500" />} label="Customers" count={finCustomers.length} />
                <StatRow icon={<CreditCard className="size-3.5 text-blue-500" />} label="EMI Payments" count={finPayments.length} />
                <StatRow icon={<BarChart2 className="size-3.5 text-blue-500" />} label="Expenses / Income" count={finExpenses.length} />
                <StatRow icon={<TrendingUp className="size-3.5 text-blue-500" />} label="Investments" count={finInvestments.length} />
                <StatRow icon={<Users className="size-3.5 text-blue-500" />} label="Staff Members" count={finStaff.length} />
              </div>
            </div>

            {/* Mobiles breakdown */}
            <div className="rounded-xl border border-emerald-200/60 dark:border-emerald-900/40 overflow-hidden">
              <div className="px-4 py-2.5 bg-emerald-50 dark:bg-emerald-950/30 border-b border-emerald-200/60 dark:border-emerald-900/40">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">📱 Jain Mobiles Module</span>
              </div>
              <div className="divide-y divide-border/60">
                <StatRow icon={<ShoppingCart className="size-3.5 text-emerald-500" />} label="Sales Bills" count={mobSales.length} />
                <StatRow icon={<Package className="size-3.5 text-emerald-500" />} label="Products" count={mobProducts.length} />
                <StatRow icon={<Truck className="size-3.5 text-emerald-500" />} label="Suppliers" count={mobSuppliers.length} />
                <StatRow icon={<Download className="size-3.5 text-emerald-500" />} label="Purchases" count={mobPurchases.length} />
                <StatRow icon={<Users className="size-3.5 text-emerald-500" />} label="Customers" count={mobCustomers.length} />
                <StatRow icon={<BarChart2 className="size-3.5 text-emerald-500" />} label="Expenses / Income" count={mobExpenses.length} />
                <StatRow icon={<Package className="size-3.5 text-emerald-500" />} label="Accessories" count={mobAccessories.length} />
                <StatRow icon={<AlertTriangle className="size-3.5 text-emerald-500" />} label="Warranty Claims" count={mobWarranties.length} />
              </div>
            </div>
          </div>
        </Card>

        {/* ── Google Sheets Sync ───────────────────────────────────────────── */}
        <Card className="p-5">
          <SectionHeader
            title="Google Sheets Database Sync"
            action={<Database className="size-3.5 text-success" />}
          />
          <div className="space-y-4 mt-4">
            {/* Status bar */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border text-sm">
              {sheetsConfig.enabled ? (
                <CheckCircle2 className="size-4 text-success shrink-0" />
              ) : (
                <XCircle className="size-4 text-muted-foreground shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">
                  {sheetsConfig.enabled ? "Sync Enabled — Finance & Mobiles" : "Sync Disabled"}
                </div>
                {sheetsConfig.lastSync && (
                  <div className="text-xs text-muted-foreground mt-0.5">Last synced: {sheetsConfig.lastSync}</div>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  updateSheetsConfig({ enabled: !sheetsConfig.enabled });
                  useStore.getState().updateSheetsConfig({ enabled: !sheetsConfig.enabled });
                  toast.message(`Sheets sync ${!sheetsConfig.enabled ? "enabled" : "disabled"} for both modules`);
                }}
                className={`relative h-5 w-9 rounded-full transition-colors shrink-0 ${sheetsConfig.enabled ? "bg-success" : "bg-muted border border-border"}`}
                aria-pressed={sheetsConfig.enabled}
                aria-label="Toggle Google Sheets sync"
              >
                <span className={`absolute top-0.5 size-4 rounded-full bg-background shadow transition-all ${sheetsConfig.enabled ? "left-[18px]" : "left-0.5"}`} />
              </button>
            </div>

            {/* URL Input */}
            <label className="block">
              <span className="text-xs font-semibold text-muted-foreground">Apps Script Web App URL (shared for both Finance & Mobiles)</span>
              <div className="mt-1.5 flex gap-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => { setUrlInput(e.target.value); setTestResult(null); }}
                  placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                  className="flex-1 h-9 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 font-mono text-[11px]"
                />
                <button
                  onClick={handleSaveUrl}
                  className="h-9 px-3 rounded-md bg-foreground text-background text-xs font-medium whitespace-nowrap"
                >
                  Save URL
                </button>
              </div>
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                See <code className="bg-muted px-1 py-0.5 rounded text-[10px]">GOOGLE_SHEETS_SETUP.md</code> for step-by-step setup.
              </p>
            </label>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleTestConnection}
                disabled={testing}
                className={`h-8 px-3 rounded-md text-xs font-medium flex items-center gap-1.5 disabled:opacity-60 transition-all border ${
                  testResult === "ok"
                    ? "border-success/60 bg-success/10 text-success"
                    : testResult === "error"
                    ? "border-danger/60 bg-danger/10 text-danger"
                    : "border-border bg-surface hover:bg-accent"
                }`}
              >
                {testing ? <Loader2 className="size-3.5 animate-spin" /> : <Wifi className="size-3.5" />}
                {testing ? "Testing…" : testResult === "ok" ? "Connected ✓" : testResult === "error" ? "Failed ✗" : "Test Connection"}
              </button>
              <button
                onClick={handleSyncBoth}
                disabled={syncingBoth}
                className="h-8 px-3 rounded-md bg-foreground text-background text-xs font-semibold flex items-center gap-1.5 disabled:opacity-60 hover:opacity-90 transition-opacity"
              >
                {syncingBoth ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
                {syncingBoth ? "Syncing Both…" : "Sync Both Modules"}
              </button>
              <button
                onClick={handleSyncMobiles}
                disabled={syncing}
                className="h-8 px-3 rounded-md bg-success text-white text-xs font-medium flex items-center gap-1.5 disabled:opacity-60 hover:opacity-90 transition-opacity"
              >
                {syncing ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
                {syncing ? "Syncing…" : "Sync Mobiles Only"}
              </button>
              <button
                onClick={handleLoadFromSheets}
                disabled={loading}
                className="h-8 px-3 rounded-md border border-border bg-surface text-xs font-medium flex items-center gap-1.5 disabled:opacity-60 hover:bg-accent transition-colors"
              >
                {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
                {loading ? "Loading…" : "Load from Sheets"}
              </button>
            </div>

            {/* Troubleshooting callout when test fails */}
            {testResult === "error" && (
              <div className="flex items-start gap-2.5 rounded-lg border border-danger/30 bg-danger/5 p-3 text-xs">
                <XCircle className="size-4 text-danger shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-semibold text-danger">Connection Failed — Checklist</div>
                  <ol className="list-decimal ml-4 space-y-0.5 text-muted-foreground">
                    <li>In Apps Script: <strong>Deploy → Manage deployments</strong> → check it's Active</li>
                    <li>"Execute as" must be <strong>Me</strong>, "Who has access" must be <strong>Anyone</strong></li>
                    <li>Replace <code className="bg-muted px-1 rounded">YOUR_SPREADSHEET_ID_HERE</code> in Code.gs and redeploy</li>
                    <li>After code changes, create a <strong>New deployment</strong> and copy the new URL</li>
                  </ol>
                </div>
              </div>
            )}

            {/* Sheet tab structure preview */}
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-[11px]">
                <thead className="bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="p-2 text-left">Sheet Tab</th>
                    <th className="p-2 text-left">Module</th>
                    <th className="p-2 text-left">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {([
                    ["Finance_Customers",        "Finance",  "Customer EMI master records"],
                    ["Finance_Payments",         "Finance",  "EMI payment history"],
                    ["Finance_Expenses",         "Finance",  "Income & expense entries"],
                    ["Finance_Investments",      "Finance",  "Investment records"],
                    ["Mobiles_Sales",            "Mobiles",  "Sales bills & invoices"],
                    ["Mobiles_Purchases",        "Mobiles",  "Purchase orders"],
                    ["Mobiles_Expenses",         "Mobiles",  "Store income/expenses"],
                    ["Mobiles_Suppliers",        "Mobiles",  "Supplier directory"],
                    ["Mobiles_SupplierPayments", "Mobiles",  "Supplier payments"],
                    ["Mobiles_Customers",        "Mobiles",  "Mobile store customers"],
                    ["Mobiles_Products",         "Mobiles",  "Product catalog"],
                  ] as [string, string, string][]).map(([tab, module, desc]) => (
                    <tr key={tab} className="hover:bg-accent/20">
                      <td className="p-2 font-mono">{tab}</td>
                      <td className="p-2">
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          module === "Finance" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        }`}>{module}</span>
                      </td>
                      <td className="p-2 text-muted-foreground">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-success/30 bg-success/5 p-4">
              <Globe className="size-4 text-success shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <div className="font-semibold text-foreground">One URL, Both Modules 🎉</div>
                <p className="text-muted-foreground leading-relaxed">
                  The same Apps Script URL works for <strong>both Finance and Mobiles</strong>.
                  Paste it once and it applies to both modules automatically.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* ── Danger Zone ─────────────────────────────────────────────────── */}
        <Card className="p-5 border-danger/30 bg-danger/5">
          <SectionHeader title="Danger Zone — Clear Database" action={<Trash2 className="size-3.5 text-danger" />} />
          <p className="text-xs text-muted-foreground mb-5 mt-1">
            Permanently delete data from one or both modules. This action is <strong>irreversible</strong>.
            Make sure to <strong>Sync to Sheets first</strong> if you want a backup.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={handleClearFinance}
              className="h-10 px-4 rounded-md border border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-blue-100 dark:hover:bg-blue-950/60 transition-colors"
            >
              <Trash2 className="size-3.5" /> Clear Finance Data
            </button>
            <button
              onClick={handleClearMobiles}
              className="h-10 px-4 rounded-md border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 transition-colors"
            >
              <Trash2 className="size-3.5" /> Clear Mobiles Data
            </button>
            <button
              onClick={handleClearAll}
              disabled={clearing}
              className="h-10 px-4 rounded-md bg-danger text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-danger/90 transition-colors disabled:opacity-60"
            >
              {clearing ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
              {clearing ? "Clearing…" : "Clear ALL Data (Both Modules)"}
            </button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

function StatRow({ icon, label, count }: { icon: React.ReactNode; label: string; count: number }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 text-xs">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <span className="font-bold text-foreground tabular-nums">{count.toLocaleString("en-IN")}</span>
    </div>
  );
}
