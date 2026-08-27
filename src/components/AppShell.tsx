import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, Users, HandCoins, Receipt, FileText,
  TrendingUp, PiggyBank, BarChart3, Settings, Shield,
  History, Search, Box, ChevronRight, Plus, Moon, Sun, Menu, X, LogOut,
  Smartphone, Wallet, RefreshCw, ArrowLeftRight
} from "lucide-react";
import { toast } from "sonner";
import { type ReactNode, useState, useEffect, useRef } from "react";
import { useUi } from "@/components/AppDialogs";
import { useStore } from "@/lib/store";
import { useMobileStore } from "@/lib/mobileStore";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const financeNav = [
  { group: "Overview", items: [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
  ]},
  { group: "Operations", items: [
    { to: "/customers", label: "Master Data", icon: Users },
    { to: "/loans", label: "Loans", icon: HandCoins },
    { to: "/collections", label: "Due List", icon: HandCoins },
    { to: "/payments", label: "Payment History", icon: Receipt },
    { to: "/documents", label: "Documents", icon: FileText },
  ]},
  { group: "Finance", items: [
    { to: "/expenses", label: "Income / Expense", icon: TrendingUp },
    { to: "/investments", label: "Investments", icon: PiggyBank },
    { to: "/cash-flow", label: "Cash & UPI Flow", icon: Wallet },
    { to: "/profit-loss", label: "Profit & Loss", icon: BarChart3 },
    { to: "/withdraw-deposit", label: "Withdraw / Deposit", icon: ArrowLeftRight },
    { to: "/reports", label: "Reports", icon: FileText },
  ]},
  { group: "System", items: [
    { to: "/roles", label: "Roles", icon: Shield, adminOnly: true },
    { to: "/audit", label: "Audit Logs", icon: History, adminOnly: true },
    { to: "/settings", label: "Settings", icon: Settings },
  ]},
];

const mobilesNav = [
  { group: "Overview", items: [
    { to: "/mobiles", label: "Dashboard", icon: LayoutDashboard },
  ]},
  { group: "Operations", items: [
    { to: "/mobiles/products", label: "Products", icon: Smartphone },
    { to: "/mobiles/inventory", label: "Inventory", icon: Box },
    { to: "/mobiles/purchases", label: "Purchases", icon: Receipt },
    { to: "/mobiles/sales", label: "Sales", icon: BarChart3 },
    { to: "/mobiles/customers", label: "Customers", icon: Users },
    { to: "/mobiles/suppliers", label: "Suppliers", icon: Users },
    { to: "/mobiles/accessories", label: "Accessories", icon: Plus },
  ]},
  { group: "Finance", items: [
    { to: "/mobiles/expenses", label: "Income & Expenses", icon: TrendingUp },
    { to: "/mobiles/cash-flow", label: "Cash & UPI Flow", icon: Wallet },
  ]},
  { group: "Analysis & Config", items: [
    { to: "/mobiles/reports", label: "Reports", icon: FileText },
    { to: "/mobiles/audit", label: "Audit Logs", icon: History, adminOnly: true },
    { to: "/mobiles/settings", label: "Settings", icon: Settings },
  ]},
];


export function AppShell({ children, breadcrumb }: { children: ReactNode; breadcrumb?: string }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { openDialog } = useUi();
  const darkMode = useStore((s) => s.darkMode);
  const toggleDarkMode = useStore((s) => s.toggleDarkMode);
  
  // Finance store queries
  const customers = useStore((s) => s.customers);
  const loans = useStore((s) => s.loans);
  const payments = useStore((s) => s.payments);
  
  // Mobiles store queries
  const mCustomers = useMobileStore((s) => s.customers);
  const mProducts = useMobileStore((s) => s.products);
  const mSales = useMobileStore((s) => s.sales);
  const mSuppliers = useMobileStore((s) => s.suppliers);

  const currentUser = useStore((s) => s.currentUser);
  const logout = useStore((s) => s.logout);
  const sheetsLastSync = useStore((s) => s.sheetsConfig.lastSync);
  const sheetsEnabled  = useStore((s) => s.sheetsConfig.enabled);
  const sheetsUrl      = useStore((s) => s.sheetsConfig.url);

  const isMobileModule = path.startsWith("/mobiles");
  const activeNav = isMobileModule ? mobilesNav : financeNav;

  const [q, setQ] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const sidebarNavRef = useRef<HTMLElement>(null);

  // Apply dark mode class on mount from persisted state
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Redirect based on module access permissions
  useEffect(() => {
    if (currentUser?.access === "Finance" && isMobileModule) {
      navigate({ to: "/" });
      toast.error("Access Denied", { description: "Your account only has access to the Jain Finance module." });
    } else if (currentUser?.access === "Mobiles" && !isMobileModule) {
      navigate({ to: "/mobiles" });
      toast.error("Access Denied", { description: "Your account only has access to the Jain Mobiles module." });
    }
  }, [currentUser, isMobileModule, navigate]);

  // Close search dropdown on outside click
  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false);
      }
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  // Records reconciled from Google Sheets can carry undefined/blank fields
  // (missing column, empty cell), so every candidate is coerced before
  // matching — an unguarded .toLowerCase() here threw and took down the
  // whole AppShell, i.e. every page in the app, not just the search box.
  const nq = q.trim().toLowerCase();
  const S = (v: unknown) => String(v ?? "").toLowerCase();

  // Build search results across either Finance or Mobiles datasets
  const searchResults = q.trim().length >= 2
    ? isMobileModule
      ? [
          ...mCustomers
            .filter((c) => [c.name, c.mobile].some((v) => S(v).includes(nq)))
            .slice(0, 3)
            .map((c) => ({ label: c.name, sub: `Customer · ${c.mobile}`, href: "/mobiles/customers", icon: "👤" })),
          ...mProducts
            .filter((p) => [p.name, p.brand, p.model].some((v) => S(v).includes(nq)))
            .slice(0, 3)
            .map((p) => ({ label: p.name, sub: `Product · ${p.brand} ${p.model}`, href: "/mobiles/products", icon: "📱" })),
          ...mSales
            .filter((s) => [s.id, s.customerName].some((v) => S(v).includes(nq)))
            .slice(0, 3)
            .map((s) => ({ label: s.id, sub: `Sale Bill · ${s.customerName}`, href: "/mobiles/sales", icon: "🧾" })),
          ...mSuppliers
            .filter((s) => [s.name, s.gstNo].some((v) => S(v).includes(nq)))
            .slice(0, 3)
            .map((s) => ({ label: s.name, sub: `Supplier · ${s.gstNo || "—"}`, href: "/mobiles/suppliers", icon: "🤝" })),
        ]
      : [
          ...customers
            .filter((c) => [c.name, c.id, c.village, c.mobile].some((v) => S(v).includes(nq)))
            .slice(0, 4)
            .map((c) => ({ label: c.name, sub: `${c.id} · ${c.village}`, href: "/customers", icon: "👤" })),
          ...(loans ?? [])
            .filter((l) => [l.id, l.customer, l.product].some((v) => S(v).includes(nq)))
            .slice(0, 3)
            .map((l) => ({ label: l.id, sub: `${l.customer} · ${l.amount}`, href: "/loans", icon: "💰" })),
          ...payments
            .filter((p) => [p.id, p.customer].some((v) => S(v).includes(nq)))
            .slice(0, 3)
            .map((p) => ({ label: p.id, sub: `${p.customer} · ${p.amount}`, href: "/payments", icon: "🧾" })),
        ]
    : [];

  const SidebarContent = () => (
    <>
      <div className="px-4 py-3 flex items-center gap-3 border-b border-border">
        <img src="/logo.png" alt="Jain Mobile Logo" className="h-11 sm:h-12 w-auto object-contain shrink-0 drop-shadow-sm" />
        <div className="flex flex-col justify-center">
          <div className="text-sm font-bold tracking-tight text-foreground leading-tight">{isMobileModule ? "Jain Mobiles" : "Jain Finance"}</div>
          <div className="text-[11px] font-medium text-muted-foreground">ERP Console</div>
        </div>
      </div>

      {/* Module Switcher Dropdown / Static Label */}
      <div className="px-4 py-3 border-b border-border bg-muted/20">
        {currentUser?.access && currentUser.access !== "Both" ? (
          <div className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-border bg-surface text-xs font-semibold tracking-tight select-none">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-primary" />
              <span>{currentUser.access === "Mobiles" ? "Jain Mobiles ERP" : "Jain Finance ERP"}</span>
            </div>
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-border bg-surface hover:bg-accent text-xs font-semibold tracking-tight transition-all">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-primary animate-pulse" />
                  <span>{isMobileModule ? "Jain Mobiles ERP" : "Jain Finance ERP"}</span>
                </div>
                <ChevronRight className="size-3 text-muted-foreground rotate-90 shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              <DropdownMenuLabel className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Switch Business Module</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center gap-2 py-2 cursor-pointer" onClick={() => { setSidebarOpen(false); navigate({ to: "/" }); }}>
                💼 <span className="font-medium">Jain Finance ERP</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 py-2 cursor-pointer" onClick={() => { setSidebarOpen(false); navigate({ to: "/mobiles" }); }}>
                📱 <span className="font-medium">Jain Mobiles ERP</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <nav ref={sidebarNavRef} className="flex-1 overflow-y-auto px-3 py-2.5 space-y-3.5">
        {activeNav.map((g) => {
          const visibleItems = g.items.filter(
            (it: any) => !it.adminOnly || currentUser?.role?.toLowerCase() === "admin"
          );
          if (visibleItems.length === 0) return null;
          return (
          <div key={g.group}>
            <div className="px-2 mb-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-semibold">
              {g.group}
            </div>
            <ul className="space-y-0.5">
              {visibleItems.map((it: any) => {
                const active = path === it.to || (it.to !== "/" && it.to !== "/mobiles" && path.startsWith(it.to));
                const Icon = it.icon;
                return (
                  <li key={it.to}>
                    <Link
                      to={it.to}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm transition-colors ${
                        active
                          ? "bg-foreground text-background font-medium"
                          : "text-foreground/70 hover:bg-accent hover:text-foreground"
                      }`}
                    >
                      <Icon className="size-4" strokeWidth={1.75} />
                      <span>{it.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          );
        })}
      </nav>
      <div className="border-t border-border p-3 flex items-center gap-2">
        <div className="size-8 rounded-full bg-foreground text-background grid place-items-center text-xs font-semibold">
          {currentUser?.name
            ? currentUser.name.split(" ").filter(Boolean).map((n) => n[0]).join("").toUpperCase().slice(0, 2)
            : "AG"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{currentUser?.name || "Avinash G"}</div>
          <div className="text-[11px] text-muted-foreground truncate">{currentUser?.role || "Administrator"}</div>
        </div>
        <button
          onClick={toggleDarkMode}
          className="size-7 rounded-md border border-border grid place-items-center hover:bg-accent transition-colors"
          title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
        </button>
        <button
          onClick={() => {
            logout();
            navigate({ to: "/" });
            toast.info("Logged out successfully");
          }}
          className="size-7 rounded-md border border-border grid place-items-center hover:bg-accent text-danger transition-colors"
          title="Log out"
          aria-label="Log out"
        >
          <LogOut className="size-3.5" />
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside className="fixed top-0 left-0 bottom-0 h-screen w-64 border-r border-border bg-surface/90 backdrop-blur z-30 flex-col hidden lg:flex print:hidden">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[80vw] max-w-[280px] border-r border-border bg-surface flex flex-col lg:hidden transform transition-transform duration-200 print:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          className="absolute top-4 right-4 size-7 rounded-md border border-border grid place-items-center hover:bg-accent"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        >
          <X className="size-3.5" />
        </button>
        <SidebarContent />
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 w-full lg:pl-64 flex flex-col min-h-screen">
        <div className="border-b border-border bg-surface/60 backdrop-blur sticky top-0 z-10 print:hidden">
          <div className="px-2 sm:px-4 lg:px-8 py-3 sm:py-3.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {/* Mobile hamburger */}
              <button
                className="lg:hidden size-9 rounded-md border border-border grid place-items-center hover:bg-accent shrink-0"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="size-4" />
              </button>
              <div className="flex items-center gap-1.5 text-sm min-w-0">
                <span className="font-semibold tracking-tight truncate max-w-[100px] sm:max-w-none">{isMobileModule ? "Jain Mobiles" : "Jain Finance"}</span>
                {breadcrumb && (
                  <>
                    <ChevronRight className="size-3.5 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground truncate max-w-[80px] sm:max-w-none">{breadcrumb}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Live Sync Status Pill */}
              {sheetsUrl && sheetsEnabled && (
                <div
                  title={sheetsLastSync ? `Last synced: ${sheetsLastSync}` : "Waiting for first sync…"}
                  className={`hidden sm:flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold border transition-all ${
                    sheetsLastSync
                      ? "border-success/40 bg-success/10 text-success"
                      : "border-border bg-muted/40 text-muted-foreground"
                  }`}
                >
                  {sheetsLastSync ? (
                    <>
                      <span className="size-1.5 rounded-full bg-success animate-pulse" />
                      Live
                    </>
                  ) : (
                    <>
                      <RefreshCw className="size-2.5 animate-spin" />
                      Syncing…
                    </>
                  )}
                </div>
              )}
              {/* Global Search */}
              <div className="relative" ref={searchRef}>
                <Search className="size-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  value={q}
                  onChange={(e) => { setQ(e.target.value); setShowSearch(true); }}
                  onFocus={() => setShowSearch(true)}
                  placeholder={isMobileModule ? "Search..." : "Search..."}
                  className="h-9 w-28 sm:w-48 lg:w-80 rounded-md border border-border bg-background pl-8 pr-2 sm:pr-3 text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring/20 transition-all"
                />
                {showSearch && searchResults.length > 0 && (
                  <div className="absolute top-full mt-1 right-0 sm:left-0 w-[90vw] sm:w-80 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                    {searchResults.map((r, i) => (
                      <button
                        key={i}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent text-left"
                        onClick={() => {
                          setQ("");
                          setShowSearch(false);
                          navigate({ to: r.href });
                        }}
                      >
                        <span className="text-base">{r.icon}</span>
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{r.label}</div>
                          <div className="text-[11px] text-muted-foreground truncate">{r.sub}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {showSearch && q.trim().length >= 2 && searchResults.length === 0 && (
                  <div className="absolute top-full mt-1 right-0 sm:left-0 w-64 sm:w-72 bg-popover border border-border rounded-lg shadow-lg z-50 px-4 py-3 text-sm text-muted-foreground">
                    No results for "{q}"
                  </div>
                )}
              </div>

              {/* Dark mode toggle (desktop) */}
              <button
                onClick={toggleDarkMode}
                className="size-9 rounded-md border border-border grid place-items-center hover:bg-accent transition-colors hidden lg:grid"
                title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </button>

              {/* New Button */}
              {isMobileModule ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="h-9 px-2 sm:px-3 rounded-md bg-foreground text-background text-sm font-medium flex items-center gap-1 sm:gap-1.5 hover:opacity-90 shrink-0">
                      <Plus className="size-3.5" /> <span className="hidden xs:inline">New</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem onClick={() => navigate({ to: "/mobiles/sales" })}>Create Bill</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate({ to: "/mobiles/products" })}>Add Product</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate({ to: "/mobiles/purchases" })}>Record Purchase</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate({ to: "/mobiles/suppliers" })}>Add Supplier</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="h-9 px-2 sm:px-3 rounded-md bg-foreground text-background text-sm font-medium flex items-center gap-1 sm:gap-1.5 hover:opacity-90 shrink-0">
                      <Plus className="size-3.5" /> <span className="hidden xs:inline">New</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem onClick={() => openDialog("customer")}>New customer</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openDialog("collect")}>Record payment</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openDialog("expense")}>Add expense</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openDialog("investment")}>Add investment</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
        <div className="px-0 sm:px-4 lg:px-8 py-4 sm:py-7 bg-dotted">
          <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-0">{children}</div>
        </div>
      </main>
    </div>
  );
}

