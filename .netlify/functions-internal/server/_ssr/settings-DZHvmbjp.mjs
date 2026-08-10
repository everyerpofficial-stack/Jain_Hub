import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { $ as CreditCard, A as Package, G as Globe, M as MessageCircle, Q as Database, R as LoaderCircle, Z as Download, _ as ShoppingCart, c as Truck, i as Users, it as CircleCheck, l as TriangleAlert, n as Wifi, p as Trash2, rt as CircleX, s as Upload, u as TrendingUp, ut as ChartNoAxesColumn } from "../_libs/lucide-react.mjs";
import { _ as useStore, g as useMobileStore, m as pingScript } from "./mobileStore-B8EWbC21.mjs";
import { a as SectionHeader, r as Card, t as AppShell } from "./ui-kit-iW0nuj1I.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-DZHvmbjp.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SettingsPage() {
	const resetSeed = useStore((s) => s.resetSeed);
	const sendWhatsapp = useStore((s) => s.sendWhatsapp);
	const sheetsConfig = useStore((s) => s.sheetsConfig);
	const updateSheetsConfig = useStore((s) => s.updateSheetsConfig);
	const syncToSheets = useStore((s) => s.syncToSheets);
	const loadFromSheets = useStore((s) => s.loadFromSheets);
	const isAdmin = useStore((s) => s.currentUser)?.role?.toLowerCase() === "admin";
	const finCustomers = useStore((s) => s.customers);
	const finPayments = useStore((s) => s.payments);
	const finExpenses = useStore((s) => s.expenses);
	const finInvestments = useStore((s) => s.investments);
	const finStaff = useStore((s) => s.staff);
	const mobSales = useMobileStore((s) => s.sales);
	const mobPurchases = useMobileStore((s) => s.purchases);
	const mobProducts = useMobileStore((s) => s.products);
	const mobSuppliers = useMobileStore((s) => s.suppliers);
	const mobCustomers = useMobileStore((s) => s.customers);
	const mobExpenses = useMobileStore((s) => s.expenses);
	const mobAccessories = useMobileStore((s) => s.accessories);
	const mobWarranties = useMobileStore((s) => s.warranties);
	const resetMobiles = useMobileStore((s) => s.resetAll);
	const [urlInput, setUrlInput] = (0, import_react.useState)(sheetsConfig.url || "");
	(0, import_react.useEffect)(() => {
		if (sheetsConfig.url && !urlInput) setUrlInput(sheetsConfig.url);
	}, [sheetsConfig.url]);
	const [syncing, setSyncing] = (0, import_react.useState)(false);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [clearing, setClearing] = (0, import_react.useState)(false);
	const [syncingBoth, setSyncingBoth] = (0, import_react.useState)(false);
	const [testing, setTesting] = (0, import_react.useState)(false);
	const [testResult, setTestResult] = (0, import_react.useState)(null);
	const handleTestConnection = async () => {
		const url = urlInput.trim() || sheetsConfig.url;
		if (!url) {
			toast.error("Enter the Apps Script URL first");
			return;
		}
		setTesting(true);
		setTestResult(null);
		const result = await pingScript(url);
		setTesting(false);
		if (result.ok) {
			setTestResult("ok");
			toast.success("✅ Connection successful! Apps Script is reachable.");
		} else {
			setTestResult("error");
			toast.error("❌ Connection failed: " + (result.error || "Unknown error") + ". Check your URL and deployment settings.");
		}
	};
	const handleSaveSheets = () => {
		const trimmed = urlInput.trim();
		updateSheetsConfig({
			url: trimmed,
			enabled: !!trimmed
		});
		useMobileStore.getState().updateSheetsConfig({
			url: trimmed,
			enabled: !!trimmed
		});
		toast.success("Apps Script URL saved for both Finance & Mobiles modules!");
	};
	const handleSyncNow = async () => {
		if (!sheetsConfig.url && !urlInput.trim()) {
			toast.error("Please enter and save the Apps Script URL first");
			return;
		}
		if (urlInput.trim() && urlInput.trim() !== sheetsConfig.url) updateSheetsConfig({ url: urlInput.trim() });
		setSyncing(true);
		const result = await syncToSheets();
		setSyncing(false);
		if (result.ok) toast.success("All Finance data synced to Google Sheets ✅");
		else toast.error(`Sync failed: ${result.error}`);
	};
	const handleLoadFromSheets = async () => {
		setLoading(true);
		const result = await loadFromSheets();
		setLoading(false);
		if (result.ok) toast.success("Data loaded from Google Sheets ✅");
		else toast.error(`Load failed: ${result.error}`);
	};
	const handleSyncBoth = async () => {
		if (!sheetsConfig.url && !urlInput.trim()) {
			toast.error("Please enter and save the Apps Script URL first");
			return;
		}
		setSyncingBoth(true);
		try {
			const [finResult, mobResult] = await Promise.all([useStore.getState().syncToSheets(), useMobileStore.getState().syncToSheets()]);
			if (finResult.ok && mobResult.ok) toast.success("Both Finance & Mobiles data synced to Google Sheets ✅");
			else {
				const errs = [finResult.error, mobResult.error].filter(Boolean).join("; ");
				toast.error(`Partial sync failure: ${errs}`);
			}
		} catch (e) {
			toast.error(`Sync error: ${e?.message || e}`);
		} finally {
			setSyncingBoth(false);
		}
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
	const handleClearFinance = () => {
		if (!confirm("Delete all Jain Finance data (customers, payments, expenses, investments)?")) return;
		resetSeed();
		toast.success("Finance module data cleared");
	};
	const handleClearMobiles = () => {
		if (!confirm("Delete all Jain Mobiles data (sales, products, suppliers, purchases)?")) return;
		resetMobiles();
		toast.success("Mobiles module data cleared");
	};
	const totalFinanceRecords = finCustomers.length + finPayments.length + finExpenses.length + finInvestments.length;
	const totalMobilesRecords = mobSales.length + mobPurchases.length + mobProducts.length + mobSuppliers.length + mobCustomers.length + mobExpenses.length;
	const grandTotal = totalFinanceRecords + totalMobilesRecords;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		breadcrumb: "Settings",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-wrap items-end justify-between gap-3 mb-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-[26px] font-semibold tracking-tight",
				children: "Configuration Settings"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground mt-1",
				children: "Manage organisation, database sync, and data for both Finance & Mobiles."
			})] })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
							title: "Database Overview — Finance & Mobiles Combined",
							action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Database, { className: "size-3.5 text-success" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-5 flex items-center gap-4 p-4 rounded-xl border border-border bg-muted/20",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "size-12 rounded-xl bg-foreground text-background flex items-center justify-center shrink-0",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Database, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-2xl font-bold tracking-tight",
									children: grandTotal.toLocaleString("en-IN")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-muted-foreground font-medium",
									children: "Total records across all modules"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "ml-auto flex gap-6 text-center",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-lg font-bold text-blue-600 dark:text-blue-400",
										children: totalFinanceRecords
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[10px] text-muted-foreground font-medium uppercase tracking-wider",
										children: "Finance"
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-lg font-bold text-emerald-600 dark:text-emerald-400",
										children: totalMobilesRecords
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[10px] text-muted-foreground font-medium uppercase tracking-wider",
										children: "Mobiles"
									})] })]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 md:grid-cols-2 gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl border border-blue-200/60 dark:border-blue-900/40 overflow-hidden",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "px-4 py-2.5 bg-blue-50 dark:bg-blue-950/30 border-b border-blue-200/60 dark:border-blue-900/40",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400",
										children: "📘 Jain Finance Module"
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "divide-y divide-border/60",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatRow, {
											icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-3.5 text-blue-500" }),
											label: "Customers",
											count: finCustomers.length
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatRow, {
											icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "size-3.5 text-blue-500" }),
											label: "EMI Payments",
											count: finPayments.length
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatRow, {
											icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartNoAxesColumn, { className: "size-3.5 text-blue-500" }),
											label: "Expenses / Income",
											count: finExpenses.length
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatRow, {
											icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "size-3.5 text-blue-500" }),
											label: "Investments",
											count: finInvestments.length
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatRow, {
											icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-3.5 text-blue-500" }),
											label: "Staff Members",
											count: finStaff.length
										})
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl border border-emerald-200/60 dark:border-emerald-900/40 overflow-hidden",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "px-4 py-2.5 bg-emerald-50 dark:bg-emerald-950/30 border-b border-emerald-200/60 dark:border-emerald-900/40",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400",
										children: "📱 Jain Mobiles Module"
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "divide-y divide-border/60",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatRow, {
											icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingCart, { className: "size-3.5 text-emerald-500" }),
											label: "Sales Bills",
											count: mobSales.length
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatRow, {
											icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "size-3.5 text-emerald-500" }),
											label: "Products",
											count: mobProducts.length
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatRow, {
											icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Truck, { className: "size-3.5 text-emerald-500" }),
											label: "Suppliers",
											count: mobSuppliers.length
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatRow, {
											icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-3.5 text-emerald-500" }),
											label: "Purchases",
											count: mobPurchases.length
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatRow, {
											icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-3.5 text-emerald-500" }),
											label: "Customers",
											count: mobCustomers.length
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatRow, {
											icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartNoAxesColumn, { className: "size-3.5 text-emerald-500" }),
											label: "Expenses / Income",
											count: mobExpenses.length
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatRow, {
											icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "size-3.5 text-emerald-500" }),
											label: "Accessories",
											count: mobAccessories.length
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatRow, {
											icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-3.5 text-emerald-500" }),
											label: "Warranty Claims",
											count: mobWarranties.length
										})
									]
								})]
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-1 lg:grid-cols-3 gap-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "lg:col-span-2 space-y-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "p-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
								title: "Google Sheets Database Sync",
								action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Database, { className: "size-3.5 text-success" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border text-sm",
										children: [
											sheetsConfig.enabled ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4 text-success shrink-0" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "size-4 text-muted-foreground shrink-0" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex-1 min-w-0",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "font-medium text-sm",
													children: sheetsConfig.enabled ? "Sync Enabled — Finance & Mobiles" : "Sync Disabled"
												}), sheetsConfig.lastSync && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "text-xs text-muted-foreground mt-0.5",
													children: ["Last synced: ", sheetsConfig.lastSync]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												onClick: () => {
													updateSheetsConfig({ enabled: !sheetsConfig.enabled });
													useMobileStore.getState().updateSheetsConfig({ enabled: !sheetsConfig.enabled });
													toast.message(`Sheets sync ${!sheetsConfig.enabled ? "enabled" : "disabled"} for both modules`);
												},
												className: `relative h-5 w-9 rounded-full transition-colors shrink-0 ${sheetsConfig.enabled ? "bg-success" : "bg-muted border border-border"}`,
												"aria-pressed": sheetsConfig.enabled,
												"aria-label": "Toggle Google Sheets sync",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `absolute top-0.5 size-4 rounded-full bg-background shadow transition-all ${sheetsConfig.enabled ? "left-[18px]" : "left-0.5"}` })
											})
										]
									}),
									isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "block",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs font-semibold text-muted-foreground",
												children: "Apps Script Web App URL (shared for both Finance & Mobiles)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mt-1.5 flex gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "url",
													value: urlInput,
													onChange: (e) => {
														setUrlInput(e.target.value);
														setTestResult(null);
													},
													placeholder: "https://script.google.com/macros/s/AKfycb.../exec",
													className: "flex-1 h-9 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 font-mono text-[11px]"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													onClick: handleSaveSheets,
													className: "h-9 px-3 rounded-md bg-foreground text-background text-xs font-medium whitespace-nowrap",
													children: "Save URL"
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "mt-1.5 text-[11px] text-muted-foreground",
												children: [
													"See ",
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
														className: "bg-muted px-1 py-0.5 rounded text-[10px]",
														children: "GOOGLE_SHEETS_SETUP.md"
													}),
													" for step-by-step setup."
												]
											})
										]
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border text-xs text-muted-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "🔒" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Only administrators can configure the sync URL. Current URL: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
											className: "font-mono",
											children: sheetsConfig.url ? sheetsConfig.url.slice(0, 40) + "…" : "(not set)"
										})] })]
									}),
									isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												onClick: handleTestConnection,
												disabled: testing,
												className: `h-8 px-3 rounded-md text-xs font-medium flex items-center gap-1.5 disabled:opacity-60 transition-all border ${testResult === "ok" ? "border-success/60 bg-success/10 text-success" : testResult === "error" ? "border-danger/60 bg-danger/10 text-danger" : "border-border bg-surface hover:bg-accent"}`,
												children: [testing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wifi, { className: "size-3.5" }), testing ? "Testing…" : testResult === "ok" ? "Connected ✓" : testResult === "error" ? "Failed ✗" : "Test Connection"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												onClick: handleSyncBoth,
												disabled: syncingBoth,
												className: "h-8 px-3 rounded-md bg-foreground text-background text-xs font-semibold flex items-center gap-1.5 disabled:opacity-60 hover:opacity-90 transition-opacity",
												children: [syncingBoth ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-3.5" }), syncingBoth ? "Syncing Both…" : "Sync Both Modules"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												onClick: handleSyncNow,
												disabled: syncing,
												className: "h-8 px-3 rounded-md bg-success text-white text-xs font-medium flex items-center gap-1.5 disabled:opacity-60 hover:opacity-90 transition-opacity",
												children: [syncing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-3.5" }), syncing ? "Syncing…" : "Sync Finance Only"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												onClick: handleLoadFromSheets,
												disabled: loading,
												className: "h-8 px-3 rounded-md border border-border bg-surface text-xs font-medium flex items-center gap-1.5 disabled:opacity-60 hover:bg-accent transition-colors",
												children: [loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-3.5" }), loading ? "Loading…" : "Load from Sheets"]
											})
										]
									}),
									testResult === "error" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-start gap-2.5 rounded-lg border border-danger/30 bg-danger/5 p-3 text-xs",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "size-4 text-danger shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "font-semibold text-danger",
												children: "Connection Failed — Checklist"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
												className: "list-decimal ml-4 space-y-0.5 text-muted-foreground",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
														"In Apps Script: ",
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Deploy → Manage deployments" }),
														" → check it's Active"
													] }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
														"\"Execute as\" must be ",
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Me" }),
														", \"Who has access\" must be ",
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Anyone" })
													] }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
														"Replace ",
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
															className: "bg-muted px-1 rounded",
															children: "YOUR_SPREADSHEET_ID_HERE"
														}),
														" in Code.gs and redeploy"
													] }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
														"After code changes, create a ",
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "New deployment" }),
														" (not update) and copy the new URL"
													] })
												]
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "rounded-lg border border-border overflow-hidden",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
											className: "w-full text-[11px]",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
												className: "bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
														className: "p-2 text-left",
														children: "Sheet Tab"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
														className: "p-2 text-left",
														children: "Module"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
														className: "p-2 text-left",
														children: "Data"
													})
												] })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
												className: "divide-y divide-border/60",
												children: [
													[
														"Finance_Customers",
														"Finance",
														"Customer EMI master records"
													],
													[
														"Finance_Payments",
														"Finance",
														"EMI payment history"
													],
													[
														"Finance_Expenses",
														"Finance",
														"Income & expense entries"
													],
													[
														"Finance_Investments",
														"Finance",
														"Investment records"
													],
													[
														"Mobiles_Sales",
														"Mobiles",
														"Sales bills & invoices"
													],
													[
														"Mobiles_Purchases",
														"Mobiles",
														"Purchase orders"
													],
													[
														"Mobiles_Expenses",
														"Mobiles",
														"Store income/expenses"
													],
													[
														"Mobiles_Suppliers",
														"Mobiles",
														"Supplier directory"
													],
													[
														"Mobiles_SupplierPayments",
														"Mobiles",
														"Supplier payments"
													],
													[
														"Mobiles_Customers",
														"Mobiles",
														"Mobile store customers"
													],
													[
														"Mobiles_Products",
														"Mobiles",
														"Product catalog"
													]
												].map(([tab, module, desc]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
													className: "hover:bg-accent/20",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
															className: "p-2 font-mono",
															children: tab
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
															className: "p-2",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: `text-[10px] font-semibold px-1.5 py-0.5 rounded ${module === "Finance" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"}`,
																children: module
															})
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
															className: "p-2 text-muted-foreground",
															children: desc
														})
													]
												}, tab))
											})]
										})
									})
								]
							})]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "p-5 space-y-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
								title: "WhatsApp Integration",
								action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-3.5 text-success" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-3 text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
										label: "Connected number",
										value: "+91 99000 11122",
										tone: "success"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
										label: "Provider",
										value: "WhatsApp Business API"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
										label: "EMI reminders",
										value: "Auto · 1 day before due"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
										label: "Payment receipts",
										value: "Auto on collection"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
										label: "Follow-up cadence",
										value: "Day 1 · Day 3 · Day 7"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "pt-2 flex justify-end",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											onClick: () => {
												sendWhatsapp({
													to: "+91 99000 11122",
													kind: "Test message"
												});
												toast.success("Test WhatsApp sent");
											},
											className: "h-8 px-3 rounded border border-border text-xs font-semibold hover:bg-accent transition-colors flex items-center gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-3.5" }), " Send test message"]
										})
									})
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-3 rounded-xl border border-success/30 bg-success/5 p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, { className: "size-4 text-success shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-xs space-y-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-semibold text-foreground",
									children: "One URL, Both Modules 🎉"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-muted-foreground leading-relaxed",
									children: [
										"The same Apps Script URL works for ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "both Finance and Mobiles" }),
										". Paste it once and it applies to both modules automatically."
									]
								})]
							})]
						})]
					})]
				}),
				isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-5 border-danger/30 bg-danger/5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
							title: "Danger Zone — Clear Database",
							action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5 text-danger" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground mb-5",
							children: [
								"Permanently delete data from one or both modules. This action is ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "irreversible" }),
								" and cannot be undone. Make sure to ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Sync to Sheets first" }),
								" if you want a backup."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 sm:grid-cols-3 gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: handleClearFinance,
									className: "h-10 px-4 rounded-md border border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-blue-100 dark:hover:bg-blue-950/60 transition-colors",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" }), " Clear Finance Data"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: handleClearMobiles,
									className: "h-10 px-4 rounded-md border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 transition-colors",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" }), " Clear Mobiles Data"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: handleClearAll,
									disabled: clearing,
									className: "h-10 px-4 rounded-md bg-danger text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-danger/90 transition-colors disabled:opacity-60",
									children: [clearing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" }), clearing ? "Clearing…" : "Clear ALL Data (Both Modules)"]
								})
							]
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3 p-4 rounded-xl border border-danger/20 bg-danger/5 text-xs text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-danger text-base",
						children: "🔒"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "The Danger Zone (clear database) is restricted to Administrators only." })]
				})
			]
		})]
	});
}
function StatRow({ icon, label, count }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between px-4 py-2.5 text-xs",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 text-muted-foreground",
			children: [icon, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-bold text-foreground tabular-nums",
			children: count.toLocaleString("en-IN")
		})]
	});
}
function Row({ label, value, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex justify-between text-sm py-1.5 border-b border-border last:border-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: `font-medium ${tone === "success" ? "text-success" : ""}`,
			children: value
		})]
	});
}
//#endregion
export { SettingsPage as component };
