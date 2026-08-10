import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { C as Search, D as Plus, I as LogOut, N as Menu, O as PiggyBank, S as Settings, T as Receipt, U as History, W as HandCoins, dt as ChartColumn, g as Smartphone, i as Users, j as Moon, lt as Check, m as Sun, mt as Box, nt as Circle, q as FileText, r as Wallet, st as ChevronRight, t as X, u as TrendingUp, w as RefreshCw, y as Shield, z as LayoutDashboard } from "../_libs/lucide-react.mjs";
import { _ as useStore, c as cn, g as useMobileStore, v as useUi } from "./mobileStore-B8EWbC21.mjs";
import { d as Link, f as useNavigate, i as useRouterState } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Label2, c as Root2, d as SubTrigger2, f as Trigger, i as ItemIndicator2, l as Separator2, n as Content2, o as Portal2, r as Item2, s as RadioItem2, t as CheckboxItem2, u as SubContent2 } from "../_libs/@radix-ui/react-dropdown-menu+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ui-kit-iW0nuj1I.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var DropdownMenu = Root2;
var DropdownMenuTrigger = Trigger;
var DropdownMenuSubTrigger = import_react.forwardRef(({ className, inset, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SubTrigger2, {
	ref,
	className: cn("flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", inset && "pl-8", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "ml-auto" })]
}));
DropdownMenuSubTrigger.displayName = SubTrigger2.displayName;
var DropdownMenuSubContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SubContent2, {
	ref,
	className: cn("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)", className),
	...props
}));
DropdownMenuSubContent.displayName = SubContent2.displayName;
var DropdownMenuContent = import_react.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	sideOffset,
	className: cn("z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md", "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)", className),
	...props
}) }));
DropdownMenuContent.displayName = Content2.displayName;
var DropdownMenuItem = import_react.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item2, {
	ref,
	className: cn("relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0", inset && "pl-8", className),
	...props
}));
DropdownMenuItem.displayName = Item2.displayName;
var DropdownMenuCheckboxItem = import_react.forwardRef(({ className, children, checked, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CheckboxItem2, {
	ref,
	className: cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	checked,
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIndicator2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }) })
	}), children]
}));
DropdownMenuCheckboxItem.displayName = CheckboxItem2.displayName;
var DropdownMenuRadioItem = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RadioItem2, {
	ref,
	className: cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIndicator2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, { className: "h-2 w-2 fill-current" }) })
	}), children]
}));
DropdownMenuRadioItem.displayName = RadioItem2.displayName;
var DropdownMenuLabel = import_react.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label2, {
	ref,
	className: cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className),
	...props
}));
DropdownMenuLabel.displayName = Label2.displayName;
var DropdownMenuSeparator = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator2, {
	ref,
	className: cn("-mx-1 my-1 h-px bg-muted", className),
	...props
}));
DropdownMenuSeparator.displayName = Separator2.displayName;
var DropdownMenuShortcut = ({ className, ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("ml-auto text-xs tracking-widest opacity-60", className),
		...props
	});
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";
var financeNav = [
	{
		group: "Overview",
		items: [{
			to: "/",
			label: "Dashboard",
			icon: LayoutDashboard
		}]
	},
	{
		group: "Operations",
		items: [
			{
				to: "/customers",
				label: "Master Data",
				icon: Users
			},
			{
				to: "/collections",
				label: "Due List",
				icon: HandCoins
			},
			{
				to: "/payments",
				label: "Payment History",
				icon: Receipt
			},
			{
				to: "/documents",
				label: "Documents",
				icon: FileText
			}
		]
	},
	{
		group: "Finance",
		items: [
			{
				to: "/expenses",
				label: "Income / Expense",
				icon: TrendingUp
			},
			{
				to: "/investments",
				label: "Investments",
				icon: PiggyBank
			},
			{
				to: "/cash-flow",
				label: "Cash & Bank Flow",
				icon: Wallet
			},
			{
				to: "/profit-loss",
				label: "Profit & Loss",
				icon: ChartColumn
			},
			{
				to: "/reports",
				label: "Reports",
				icon: FileText
			}
		]
	},
	{
		group: "System",
		items: [
			{
				to: "/roles",
				label: "Roles",
				icon: Shield,
				adminOnly: true
			},
			{
				to: "/audit",
				label: "Audit Logs",
				icon: History,
				adminOnly: true
			},
			{
				to: "/settings",
				label: "Settings",
				icon: Settings
			}
		]
	}
];
var mobilesNav = [
	{
		group: "Overview",
		items: [{
			to: "/mobiles",
			label: "Dashboard",
			icon: LayoutDashboard
		}]
	},
	{
		group: "Operations",
		items: [
			{
				to: "/mobiles/products",
				label: "Products",
				icon: Smartphone
			},
			{
				to: "/mobiles/inventory",
				label: "Inventory",
				icon: Box
			},
			{
				to: "/mobiles/purchases",
				label: "Purchases",
				icon: Receipt
			},
			{
				to: "/mobiles/sales",
				label: "Sales",
				icon: ChartColumn
			},
			{
				to: "/mobiles/customers",
				label: "Customers",
				icon: Users
			},
			{
				to: "/mobiles/suppliers",
				label: "Suppliers",
				icon: Users
			},
			{
				to: "/mobiles/accessories",
				label: "Accessories",
				icon: Plus
			}
		]
	},
	{
		group: "Finance",
		items: [{
			to: "/mobiles/expenses",
			label: "Income & Expenses",
			icon: TrendingUp
		}, {
			to: "/mobiles/cash-flow",
			label: "Cash & Bank Flow",
			icon: Wallet
		}]
	},
	{
		group: "Analysis & Config",
		items: [{
			to: "/mobiles/reports",
			label: "Reports",
			icon: FileText
		}, {
			to: "/mobiles/settings",
			label: "Settings",
			icon: Settings
		}]
	}
];
function AppShell({ children, breadcrumb }) {
	const path = useRouterState({ select: (s) => s.location.pathname });
	const navigate = useNavigate();
	const { openDialog } = useUi();
	const darkMode = useStore((s) => s.darkMode);
	const toggleDarkMode = useStore((s) => s.toggleDarkMode);
	const customers = useStore((s) => s.customers);
	const loans = useStore((s) => s.loans);
	const payments = useStore((s) => s.payments);
	const mCustomers = useMobileStore((s) => s.customers);
	const mProducts = useMobileStore((s) => s.products);
	const mSales = useMobileStore((s) => s.sales);
	const mSuppliers = useMobileStore((s) => s.suppliers);
	const currentUser = useStore((s) => s.currentUser);
	const logout = useStore((s) => s.logout);
	const sheetsLastSync = useStore((s) => s.sheetsConfig.lastSync);
	const sheetsEnabled = useStore((s) => s.sheetsConfig.enabled);
	const sheetsUrl = useStore((s) => s.sheetsConfig.url);
	const isMobileModule = path.startsWith("/mobiles");
	const activeNav = isMobileModule ? mobilesNav : financeNav;
	const [q, setQ] = (0, import_react.useState)("");
	const [showSearch, setShowSearch] = (0, import_react.useState)(false);
	const [sidebarOpen, setSidebarOpen] = (0, import_react.useState)(false);
	const searchRef = (0, import_react.useRef)(null);
	const sidebarNavRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (sidebarNavRef.current) sidebarNavRef.current.scrollTop = 0;
	}, [path]);
	(0, import_react.useEffect)(() => {
		if (darkMode) document.documentElement.classList.add("dark");
		else document.documentElement.classList.remove("dark");
	}, [darkMode]);
	(0, import_react.useEffect)(() => {
		if (currentUser?.access === "Finance" && isMobileModule) {
			navigate({ to: "/" });
			toast.error("Access Denied", { description: "Your account only has access to the Jain Finance module." });
		} else if (currentUser?.access === "Mobiles" && !isMobileModule) {
			navigate({ to: "/mobiles" });
			toast.error("Access Denied", { description: "Your account only has access to the Jain Mobiles module." });
		}
	}, [
		currentUser,
		isMobileModule,
		navigate
	]);
	(0, import_react.useEffect)(() => {
		function onOutside(e) {
			if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearch(false);
		}
		document.addEventListener("mousedown", onOutside);
		return () => document.removeEventListener("mousedown", onOutside);
	}, []);
	const searchResults = q.trim().length >= 2 ? isMobileModule ? [
		...mCustomers.filter((c) => [c.name, c.mobile].some((v) => v.toLowerCase().includes(q.toLowerCase()))).slice(0, 3).map((c) => ({
			label: c.name,
			sub: `Customer · ${c.mobile}`,
			href: "/mobiles/customers",
			icon: "👤"
		})),
		...mProducts.filter((p) => [
			p.name,
			p.brand,
			p.model
		].some((v) => v.toLowerCase().includes(q.toLowerCase()))).slice(0, 3).map((p) => ({
			label: p.name,
			sub: `Product · ${p.brand} ${p.model}`,
			href: "/mobiles/products",
			icon: "📱"
		})),
		...mSales.filter((s) => [s.id, s.customerName].some((v) => v.toLowerCase().includes(q.toLowerCase()))).slice(0, 3).map((s) => ({
			label: s.id,
			sub: `Sale Bill · ${s.customerName}`,
			href: "/mobiles/sales",
			icon: "🧾"
		})),
		...mSuppliers.filter((s) => [s.name, s.gstNo].some((v) => v.toLowerCase().includes(q.toLowerCase()))).slice(0, 3).map((s) => ({
			label: s.name,
			sub: `Supplier · ${s.gstNo}`,
			href: "/mobiles/suppliers",
			icon: "🤝"
		}))
	] : [
		...customers.filter((c) => [
			c.name,
			c.id,
			c.village,
			c.mobile
		].some((v) => v.toLowerCase().includes(q.toLowerCase()))).slice(0, 4).map((c) => ({
			label: c.name,
			sub: `${c.id} · ${c.village}`,
			href: "/customers",
			icon: "👤"
		})),
		...(loans ?? []).filter((l) => [
			l.id,
			l.customer,
			l.product
		].some((v) => v.toLowerCase().includes(q.toLowerCase()))).slice(0, 3).map((l) => ({
			label: l.id,
			sub: `${l.customer} · ${l.amount}`,
			href: "/loans",
			icon: "💰"
		})),
		...payments.filter((p) => [p.id, p.customer].some((v) => v.toLowerCase().includes(q.toLowerCase()))).slice(0, 3).map((p) => ({
			label: p.id,
			sub: `${p.customer} · ${p.amount}`,
			href: "/payments",
			icon: "🧾"
		}))
	] : [];
	const SidebarContent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "px-4 py-3 flex items-center gap-3 border-b border-border",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: "/logo.png",
				alt: "Jain Mobile Logo",
				className: "h-11 sm:h-12 w-auto object-contain shrink-0 drop-shadow-sm"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col justify-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-sm font-bold tracking-tight text-foreground leading-tight",
					children: isMobileModule ? "Jain Mobiles" : "Jain Finance"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[11px] font-medium text-muted-foreground",
					children: "ERP Console"
				})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "px-4 py-3 border-b border-border bg-muted/20",
			children: currentUser?.access && currentUser.access !== "Both" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-border bg-surface text-xs font-semibold tracking-tight select-none",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2 rounded-full bg-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: currentUser.access === "Mobiles" ? "Jain Mobiles ERP" : "Jain Finance ERP" })]
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					className: "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-border bg-surface hover:bg-accent text-xs font-semibold tracking-tight transition-all",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2 rounded-full bg-primary animate-pulse" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: isMobileModule ? "Jain Mobiles ERP" : "Jain Finance ERP" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-3 text-muted-foreground rotate-90 shrink-0" })]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
				className: "w-56",
				align: "start",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuLabel, {
						className: "text-[11px] uppercase tracking-wider text-muted-foreground font-semibold",
						children: "Switch Business Module"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
						className: "flex items-center gap-2 py-2 cursor-pointer",
						onClick: () => {
							setSidebarOpen(false);
							navigate({ to: "/" });
						},
						children: ["💼 ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium",
							children: "Jain Finance ERP"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
						className: "flex items-center gap-2 py-2 cursor-pointer",
						onClick: () => {
							setSidebarOpen(false);
							navigate({ to: "/mobiles" });
						},
						children: ["📱 ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium",
							children: "Jain Mobiles ERP"
						})]
					})
				]
			})] })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
			ref: sidebarNavRef,
			className: "flex-1 overflow-y-auto px-3 py-2.5 space-y-3.5",
			children: activeNav.map((g) => {
				const visibleItems = g.items.filter((it) => !it.adminOnly || currentUser?.role?.toLowerCase() === "admin");
				if (visibleItems.length === 0) return null;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "px-2 mb-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-semibold",
					children: g.group
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-0.5",
					children: visibleItems.map((it) => {
						const active = path === it.to || it.to !== "/" && it.to !== "/mobiles" && path.startsWith(it.to);
						const Icon = it.icon;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: it.to,
							onClick: () => {
								setSidebarOpen(false);
								if (sidebarNavRef.current) sidebarNavRef.current.scrollTop = 0;
							},
							className: `flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm transition-colors ${active ? "bg-foreground text-background font-medium" : "text-foreground/70 hover:bg-accent hover:text-foreground"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
								className: "size-4",
								strokeWidth: 1.75
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: it.label })]
						}) }, it.to);
					})
				})] }, g.group);
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "border-t border-border p-3 flex items-center gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "size-8 rounded-full bg-foreground text-background grid place-items-center text-xs font-semibold",
					children: currentUser?.name ? currentUser.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "RJ"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-sm font-medium truncate",
						children: currentUser?.name || "Rajesh Jain"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[11px] text-muted-foreground truncate",
						children: currentUser?.role || "Administrator"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: toggleDarkMode,
					className: "size-7 rounded-md border border-border grid place-items-center hover:bg-accent transition-colors",
					title: darkMode ? "Switch to light mode" : "Switch to dark mode",
					"aria-label": "Toggle dark mode",
					children: darkMode ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, { className: "size-3.5" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => {
						logout();
						navigate({ to: "/" });
						toast.info("Logged out successfully");
					},
					className: "size-7 rounded-md border border-border grid place-items-center hover:bg-accent text-danger transition-colors",
					title: "Log out",
					"aria-label": "Log out",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-3.5" })
				})
			]
		})
	] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen flex bg-background",
		children: [
			sidebarOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "sidebar-overlay lg:hidden",
				onClick: () => setSidebarOpen(false)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
				className: "w-64 shrink-0 border-r border-border bg-surface/60 backdrop-blur sticky top-0 h-screen flex-col hidden lg:flex print:hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarContent, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: `fixed inset-y-0 left-0 z-50 w-[80vw] max-w-[280px] border-r border-border bg-surface flex flex-col lg:hidden transform transition-transform duration-200 print:hidden ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "absolute top-4 right-4 size-7 rounded-md border border-border grid place-items-center hover:bg-accent",
					onClick: () => setSidebarOpen(false),
					"aria-label": "Close sidebar",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarContent, {})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "flex-1 min-w-0 w-full",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "border-b border-border bg-surface/60 backdrop-blur sticky top-0 z-10 print:hidden",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "px-2 sm:px-4 lg:px-8 py-3 sm:py-3.5 flex items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "lg:hidden size-9 rounded-md border border-border grid place-items-center hover:bg-accent shrink-0",
								onClick: () => setSidebarOpen(true),
								"aria-label": "Open menu",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-4" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1.5 text-sm min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold tracking-tight truncate max-w-[100px] sm:max-w-none",
									children: isMobileModule ? "Jain Mobiles" : "Jain Finance"
								}), breadcrumb && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-3.5 text-muted-foreground shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground truncate max-w-[80px] sm:max-w-none",
									children: breadcrumb
								})] })]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-1.5 sm:gap-2",
							children: [
								sheetsUrl && sheetsEnabled && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									title: sheetsLastSync ? `Last synced: ${sheetsLastSync}` : "Waiting for first sync…",
									className: `hidden sm:flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold border transition-all ${sheetsLastSync ? "border-success/40 bg-success/10 text-success" : "border-border bg-muted/40 text-muted-foreground"}`,
									children: sheetsLastSync ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-success animate-pulse" }), "Live"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-2.5 animate-spin" }), "Syncing…"] })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative",
									ref: searchRef,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											value: q,
											onChange: (e) => {
												setQ(e.target.value);
												setShowSearch(true);
											},
											onFocus: () => setShowSearch(true),
											placeholder: isMobileModule ? "Search..." : "Search...",
											className: "h-9 w-28 sm:w-48 lg:w-80 rounded-md border border-border bg-background pl-8 pr-2 sm:pr-3 text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring/20 transition-all"
										}),
										showSearch && searchResults.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "absolute top-full mt-1 right-0 sm:left-0 w-[90vw] sm:w-80 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden",
											children: searchResults.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												className: "w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent text-left",
												onClick: () => {
													setQ("");
													setShowSearch(false);
													navigate({ to: r.href });
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-base",
													children: r.icon
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "min-w-0",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "text-sm font-medium truncate",
														children: r.label
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "text-[11px] text-muted-foreground truncate",
														children: r.sub
													})]
												})]
											}, i))
										}),
										showSearch && q.trim().length >= 2 && searchResults.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "absolute top-full mt-1 right-0 sm:left-0 w-64 sm:w-72 bg-popover border border-border rounded-lg shadow-lg z-50 px-4 py-3 text-sm text-muted-foreground",
											children: [
												"No results for \"",
												q,
												"\""
											]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: toggleDarkMode,
									className: "size-9 rounded-md border border-border grid place-items-center hover:bg-accent transition-colors hidden lg:grid",
									title: darkMode ? "Switch to light mode" : "Switch to dark mode",
									"aria-label": "Toggle dark mode",
									children: darkMode ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, { className: "size-4" })
								}),
								isMobileModule ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
									asChild: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										className: "h-9 px-2 sm:px-3 rounded-md bg-foreground text-background text-sm font-medium flex items-center gap-1 sm:gap-1.5 hover:opacity-90 shrink-0",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" }),
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "hidden xs:inline",
												children: "New"
											})
										]
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
									align: "end",
									className: "w-44",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
											onClick: () => navigate({ to: "/mobiles/sales" }),
											children: "Create Bill"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
											onClick: () => navigate({ to: "/mobiles/products" }),
											children: "Add Product"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
											onClick: () => navigate({ to: "/mobiles/purchases" }),
											children: "Record Purchase"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
											onClick: () => navigate({ to: "/mobiles/suppliers" }),
											children: "Add Supplier"
										})
									]
								})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
									asChild: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										className: "h-9 px-2 sm:px-3 rounded-md bg-foreground text-background text-sm font-medium flex items-center gap-1 sm:gap-1.5 hover:opacity-90 shrink-0",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" }),
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "hidden xs:inline",
												children: "New"
											})
										]
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
									align: "end",
									className: "w-44",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
											onClick: () => openDialog("customer"),
											children: "New customer"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
											onClick: () => openDialog("collect"),
											children: "Record payment"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
											onClick: () => openDialog("expense"),
											children: "Add expense"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
											onClick: () => openDialog("investment"),
											children: "Add investment"
										})
									]
								})] })
							]
						})]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "px-0 sm:px-4 lg:px-8 py-4 sm:py-7 bg-dotted",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "w-full max-w-[1400px] mx-auto px-3 sm:px-0",
						children
					})
				})]
			})
		]
	});
}
function Card({ children, className = "", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: `rounded-xl border border-border bg-surface ${className}`,
		...props,
		children
	});
}
function StatCard({ label, value, sub, icon, trend }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs text-muted-foreground",
					children: label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: trend === "up" ? "text-success" : trend === "down" ? "text-danger" : trend === "warn" ? "text-warning" : "text-muted-foreground",
					children: icon
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 text-[26px] font-semibold tracking-tight leading-none",
				children: value
			}),
			sub && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 text-xs text-muted-foreground",
				children: sub
			})
		]
	});
}
function SectionHeader({ title, action, description }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-0.5 w-full px-5 pt-4 pb-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between w-full",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-sm font-semibold tracking-tight",
				children: title
			}), action]
		}), description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted-foreground mt-0.5",
			children: description
		})]
	});
}
function Badge({ children, tone = "neutral", className = "", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: `inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${{
			success: "border-success/30 text-success bg-success/10",
			warning: "border-warning/40 text-warning bg-warning/10",
			danger: "border-danger/30 text-danger bg-danger/10",
			info: "border-info/30 text-info bg-info/10",
			neutral: "border-border text-foreground/70 bg-muted"
		}[tone]} ${className}`,
		...props,
		children
	});
}
function ProgressBar({ value, color }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-1.5 w-full rounded-full bg-muted overflow-hidden",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-full rounded-full",
			style: {
				width: `${value}%`,
				background: color
			}
		})
	});
}
//#endregion
export { SectionHeader as a, ProgressBar as i, Badge as n, StatCard as o, Card as r, AppShell as t };
