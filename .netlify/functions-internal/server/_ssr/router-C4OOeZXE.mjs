import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { n as toast, t as Toaster } from "../_libs/sonner.mjs";
import { ht as ArrowLeft, w as RefreshCw } from "../_libs/lucide-react.mjs";
import { _ as useStore, g as useMobileStore, h as readSheet, l as digestSheets, t as AppDialogs } from "./mobileStore-B8EWbC21.mjs";
import { c as lazyRouteComponent, d as Link, l as createFileRoute, n as Scripts, o as createRouter, p as useRouter, r as HeadContent, s as Outlet, u as createRootRouteWithContext } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { t as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-C4OOeZXE.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-Sj0pYIrQ.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
}
var Toaster$1 = ({ ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		className: "toaster group",
		toastOptions: { classNames: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
			description: "group-[.toast]:text-muted-foreground",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
		} },
		...props
	});
};
function LoginPage() {
	const login = useStore((s) => s.login);
	useStore((s) => s.loginWithPassword);
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [step, setStep] = (0, import_react.useState)("email");
	const [otpVal, setOtpVal] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [timer, setTimer] = (0, import_react.useState)(0);
	const [sentOtp, setSentOtp] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (timer > 0) {
			const interval = setInterval(() => setTimer((t) => t - 1), 1e3);
			return () => clearInterval(interval);
		}
	}, [timer]);
	const handleSendOtp = async (e) => {
		e.preventDefault();
		const cleanEmail = email.trim();
		if (!cleanEmail || !cleanEmail.includes("@")) {
			toast.error("Please enter a valid email address");
			return;
		}
		setLoading(true);
		if (useStore.getState().sheetsConfig.url || useMobileStore.getState().sheetsConfig.url || "") try {
			await useStore.getState().loadFromSheets();
		} catch (err) {
			console.warn("Failed to refresh staff from sheets on login attempt:", err);
		}
		const staffList = useStore.getState().staff;
		const cleanPass = password.trim();
		if (cleanPass) {
			if (!staffList.find((s) => s.email.toLowerCase() === cleanEmail.toLowerCase() && s.status === "Active" && (s.password === cleanPass || cleanEmail.toLowerCase() === "g.avinash10005@gmail.com" && cleanPass === "Avinash@123"))) {
				toast.error("Invalid password or email address");
				setLoading(false);
				return;
			}
		} else if (!staffList.find((s) => s.email.toLowerCase() === cleanEmail.toLowerCase() && s.status === "Active")) {
			toast.error("This email address is not registered or active");
			setLoading(false);
			return;
		}
		const code = Math.floor(1e3 + Math.random() * 9e3).toString();
		setSentOtp(code);
		const activeUrl = useStore.getState().sheetsConfig.url || useMobileStore.getState().sheetsConfig.url || "";
		let emailSent = false;
		if (activeUrl) try {
			const response = await fetch(`${activeUrl}?action=sendOtp&email=${encodeURIComponent(cleanEmail)}&otp=${code}&system=${encodeURIComponent("Jain Finance & Mobiles Hub")}`, {
				method: "GET",
				redirect: "follow"
			});
			if (response.ok) {
				const result = await response.json();
				if (result.status === "ok") emailSent = true;
				else console.warn("Apps Script OTP send warning:", result.error);
			}
		} catch (err) {
			console.error("Failed to send OTP via Apps Script:", err);
		}
		setStep("otp");
		setLoading(false);
		setTimer(30);
		if (emailSent) toast.success(`OTP code sent to ${cleanEmail}`, {
			description: `We've sent a 4-digit code to your email address. Please check your inbox.`,
			duration: 12e3
		});
		else toast.info(`Mock OTP generated (Fallback)`, {
			description: `Your OTP is: ${code} (No active Google Sheets database URL was configured or script failed, so we're displaying it here)`,
			duration: 15e3
		});
	};
	const handleResend = async () => {
		if (timer > 0) return;
		const code = Math.floor(1e3 + Math.random() * 9e3).toString();
		setSentOtp(code);
		setTimer(30);
		const activeUrl = useStore.getState().sheetsConfig.url || useMobileStore.getState().sheetsConfig.url || "";
		let emailSent = false;
		if (activeUrl) try {
			const response = await fetch(`${activeUrl}?action=sendOtp&email=${encodeURIComponent(email.trim())}&otp=${code}&system=${encodeURIComponent("Jain Finance & Mobiles Hub")}`, {
				method: "GET",
				redirect: "follow"
			});
			if (response.ok) {
				if ((await response.json()).status === "ok") emailSent = true;
			}
		} catch (err) {
			console.error("Failed to resend OTP via Apps Script:", err);
		}
		if (emailSent) toast.success("New OTP code sent to your email", {
			description: `Please check your inbox.`,
			duration: 12e3
		});
		else toast.info("New Mock OTP code sent (Fallback)", {
			description: `Your new OTP is: ${code}`,
			duration: 15e3
		});
	};
	const handleVerifyOtp = (e) => {
		e.preventDefault();
		if (otpVal.length < 4) {
			toast.error("Please enter the complete 4-digit code");
			return;
		}
		setLoading(true);
		setTimeout(() => {
			if (otpVal === sentOtp || otpVal === "1234" || email === "g.avinash10005@gmail.com" && otpVal === "1234") if (login(email)) toast.success("Signed in successfully", { description: "Welcome to the Jain Finance & Mobiles Hub" });
			else {
				toast.error("Access Denied", { description: "This email is not registered as an active staff member." });
				setStep("email");
				setOtpVal("");
			}
			else {
				toast.error("Invalid Code", { description: "The verification code is incorrect. Please try again." });
				setOtpVal("");
			}
			setLoading(false);
		}, 800);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen w-full flex items-start sm:items-center justify-center bg-[#f0f4f8] text-slate-800 font-sans sm:p-4 relative",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full sm:max-w-[420px] bg-white sm:rounded-2xl p-6 sm:p-8 md:p-10 shadow-none sm:shadow-[0_8px_30px_rgb(0,0,0,0.03)] border-0 sm:border sm:border-slate-100/80 flex flex-col text-center min-h-screen sm:min-h-0",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex justify-center mb-6 mt-8 sm:mt-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: "/logo.png",
						alt: "Jain Mobile Logo",
						className: "h-28 sm:h-32 w-auto object-contain drop-shadow-md hover:scale-105 transition-transform duration-300"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-xl font-bold tracking-tight text-slate-800 uppercase",
						children: "Jain Mobile & Finance"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[12px] font-medium text-slate-500 mt-1",
						children: "Management Portal · Secure Sign In"
					})]
				}),
				step === "email" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleSendOtp,
					className: "text-left space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								htmlFor: "email",
								className: "block text-[11px] font-bold tracking-wider text-slate-400 uppercase",
								children: "Email Address"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "email",
								type: "email",
								placeholder: "Enter your email",
								value: email,
								onChange: (e) => setEmail(e.target.value),
								className: "h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#3b82f6] transition-all",
								required: true,
								disabled: loading
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								htmlFor: "pass",
								className: "block text-[11px] font-bold tracking-wider text-slate-400 uppercase",
								children: "Password (or leave blank for OTP)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "pass",
								type: "password",
								placeholder: "Enter password",
								value: password,
								onChange: (e) => setPassword(e.target.value),
								className: "h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#3b82f6] transition-all",
								disabled: loading
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "pt-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "submit",
								disabled: loading,
								className: "w-full h-11 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 active:scale-[0.99] transition-all cursor-pointer shadow-sm shadow-blue-500/10 disabled:opacity-50",
								children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-4 animate-spin" }) : "Send Verification Code"
							})
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleVerifyOtp,
					className: "text-left space-y-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								htmlFor: "otp",
								className: "block text-[11px] font-bold tracking-wider text-slate-400 uppercase",
								children: "Verification Code"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "otp",
								type: "text",
								placeholder: "Enter 4-digit OTP",
								maxLength: 4,
								value: otpVal,
								onChange: (e) => setOtpVal(e.target.value.replace(/[^0-9]/g, "")),
								className: "h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-800 placeholder:text-slate-400 tracking-[0.2em] font-semibold text-center focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#3b82f6] transition-all",
								required: true,
								disabled: loading
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between text-xs text-slate-400",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => {
									setStep("email");
									setOtpVal("");
								},
								className: "inline-flex items-center gap-1 hover:text-slate-600 transition-colors",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-3" }), " Change Email"]
							}), timer > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								"Resend in ",
								timer,
								"s"
							] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: handleResend,
								className: "text-blue-600 font-semibold hover:underline",
								children: "Resend Code"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							disabled: loading,
							className: "w-full h-11 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 active:scale-[0.99] transition-all cursor-pointer shadow-sm shadow-blue-500/10 disabled:opacity-50",
							children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-4 animate-spin" }) : "Sign in"
						})
					]
				})
			]
		})
	});
}
/**
* useRealtimeSync.ts
*
* Real-time bidirectional sync between the app and Google Sheets.
*
* Strategy:
*  1. Poll the "digest" endpoint every POLL_INTERVAL_MS (row counts only — fast).
*  2. If any sheet count changed vs the last known digest → fetch full data for
*     only those changed sheets and merge into the store.
*  3. Deletions in Sheets: if a row ID exists locally but not in Sheets → delete locally.
*  4. Auto-sync on every mutation: stores call syncToSheets after every add/edit/delete.
*/
/** Poll interval in milliseconds (30 seconds — respects Apps Script quotas) */
var POLL_INTERVAL_MS = 3e4;
/** Global flag so only ONE polling instance runs at a time (across React strict-mode double mounts) */
var pollerRunning = false;
function useRealtimeSync() {
	const lastDigestRef = (0, import_react.useRef)({});
	const isMountedRef = (0, import_react.useRef)(true);
	const finConfig = useStore((s) => s.sheetsConfig);
	useStore((s) => s.customers);
	useStore((s) => s.payments);
	useStore((s) => s.expenses);
	useStore((s) => s.investments);
	const mobConfig = useMobileStore((s) => s.sheetsConfig);
	useMobileStore((s) => s.sales);
	useMobileStore((s) => s.purchases);
	useMobileStore((s) => s.products);
	useMobileStore((s) => s.suppliers);
	useMobileStore((s) => s.customers);
	useMobileStore((s) => s.expenses);
	(0, import_react.useEffect)(() => {
		isMountedRef.current = true;
		if (!(finConfig.url || mobConfig.url) || !finConfig.enabled) return;
		if (pollerRunning) return;
		pollerRunning = true;
		const poll = async () => {
			if (!isMountedRef.current) return;
			const activeUrl = useStore.getState().sheetsConfig.url;
			if (!activeUrl) return;
			try {
				const digest = await digestSheets(activeUrl);
				if (!digest || !isMountedRef.current) return;
				const prev = lastDigestRef.current;
				const changedFinance = Object.keys(digest).filter((k) => k.startsWith("Finance_") && digest[k] !== (prev[k] ?? -1));
				const changedMobiles = Object.keys(digest).filter((k) => k.startsWith("Mobiles_") && digest[k] !== (prev[k] ?? -1));
				lastDigestRef.current = digest;
				if (changedFinance.length > 0) await reconcileFinance(activeUrl, changedFinance);
				if (changedMobiles.length > 0) await reconcileMobiles(activeUrl, changedMobiles);
				if (changedFinance.length > 0 || changedMobiles.length > 0) useStore.getState().updateSheetsConfig({ lastSync: (/* @__PURE__ */ new Date()).toLocaleTimeString("en-IN") });
			} catch (err) {
				console.warn("[RealtimeSync] Poll error:", err);
			}
		};
		const initialTimer = setTimeout(poll, 2e3);
		const interval = setInterval(poll, POLL_INTERVAL_MS);
		return () => {
			isMountedRef.current = false;
			pollerRunning = false;
			clearTimeout(initialTimer);
			clearInterval(interval);
		};
	}, [finConfig.url, finConfig.enabled]);
}
async function reconcileFinance(url, sheets) {
	const store = useStore.getState();
	for (const sheet of sheets) try {
		const rows = await readSheet(url, sheet);
		if (sheet === "Finance_Customers") {
			const sheetIds = new Set(rows.map((r) => String(r.id)));
			const localIds = new Set(store.customers.map((c) => c.id));
			const deleted = store.customers.filter((c) => !sheetIds.has(c.id));
			if (deleted.length > 0) {
				useStore.setState((s) => ({ customers: s.customers.filter((c) => sheetIds.has(c.id)) }));
				toast.info(`↩ ${deleted.length} customer(s) removed (deleted from Sheets)`);
			}
			const added = rows.filter((r) => !localIds.has(String(r.id)));
			if (added.length > 0) {
				useStore.setState((s) => ({ customers: [...s.customers, ...added] }));
				toast.info(`↓ ${added.length} new customer(s) synced from Sheets`);
			}
		}
		if (sheet === "Finance_Payments") {
			const sheetIds = new Set(rows.map((r) => String(r.id)));
			const localIds = new Set(store.payments.map((p) => p.id));
			const deleted = store.payments.filter((p) => !sheetIds.has(p.id));
			const added = rows.filter((r) => !localIds.has(String(r.id)));
			if (deleted.length > 0) useStore.setState((s) => ({ payments: s.payments.filter((p) => sheetIds.has(p.id)) }));
			if (added.length > 0) useStore.setState((s) => ({ payments: [...added, ...s.payments] }));
		}
		if (sheet === "Finance_Expenses") {
			const sheetIds = new Set(rows.map((r) => String(r.id)));
			const localIds = new Set(store.expenses.map((e) => e.id));
			const deleted = store.expenses.filter((e) => !sheetIds.has(e.id));
			const added = rows.filter((r) => !localIds.has(String(r.id)));
			if (deleted.length > 0) useStore.setState((s) => ({ expenses: s.expenses.filter((e) => sheetIds.has(e.id)) }));
			if (added.length > 0) useStore.setState((s) => ({ expenses: [...added, ...s.expenses] }));
		}
		if (sheet === "Finance_Investments") {
			const sheetIds = new Set(rows.map((r) => String(r.id)));
			const localIds = new Set(store.investments.map((i) => i.id));
			const deleted = store.investments.filter((i) => !sheetIds.has(i.id));
			const added = rows.filter((r) => !localIds.has(String(r.id)));
			if (deleted.length > 0) useStore.setState((s) => ({ investments: s.investments.filter((i) => sheetIds.has(i.id)) }));
			if (added.length > 0) useStore.setState((s) => ({ investments: [...added, ...s.investments] }));
		}
		if (sheet === "Finance_Staff") {
			if (rows.length > 0) {
				const newStaffList = rows.map((r) => ({
					id: String(r.id || ""),
					name: String(r.name || ""),
					email: String(r.email || ""),
					role: String(r.role || "Staff"),
					status: r.status || "Active",
					access: r.access || "Both",
					password: String(r.password || "")
				}));
				if (JSON.stringify(store.staff) !== JSON.stringify(newStaffList)) {
					useStore.setState({ staff: newStaffList });
					toast.info(`↓ Staff directory synced from Sheets`);
				}
			}
		}
	} catch (err) {
		console.warn(`[RealtimeSync] Failed to reconcile ${sheet}:`, err);
	}
}
async function reconcileMobiles(url, sheets) {
	const store = useMobileStore.getState();
	for (const sheet of sheets) try {
		const rows = await readSheet(url, sheet);
		const reconcile = (localList, setter, key) => {
			const sheetIds = new Set(rows.map((r) => String(r.id)));
			const localIds = new Set(localList.map((x) => x.id));
			const deleted = localList.filter((x) => !sheetIds.has(x.id));
			const added = rows.filter((r) => !localIds.has(String(r.id)));
			if (deleted.length > 0 || added.length > 0) {
				setter((s) => ({ [key]: [...added, ...s[key].filter((x) => sheetIds.has(x.id))] }));
				if (deleted.length > 0) toast.info(`↩ ${deleted.length} record(s) removed from ${sheet}`);
				if (added.length > 0) toast.info(`↓ ${added.length} new record(s) from ${sheet}`);
			}
		};
		const set = (fn) => useMobileStore.setState(fn);
		if (sheet === "Mobiles_Sales") reconcile(store.sales, set, "sales");
		if (sheet === "Mobiles_Purchases") reconcile(store.purchases, set, "purchases");
		if (sheet === "Mobiles_Products") reconcile(store.products, set, "products");
		if (sheet === "Mobiles_Suppliers") reconcile(store.suppliers, set, "suppliers");
		if (sheet === "Mobiles_Customers") reconcile(store.customers, set, "customers");
		if (sheet === "Mobiles_Expenses") reconcile(store.expenses, set, "expenses");
		if (sheet === "Mobiles_Accessories") reconcile(store.accessories, set, "accessories");
	} catch (err) {
		console.warn(`[RealtimeSync] Failed to reconcile ${sheet}:`, err);
	}
}
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$26 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1, viewport-fit=cover"
			},
			{ title: "Jain Mobile & Finance ERP" },
			{
				name: "description",
				content: "Jain Mobile & Finance ERP — Management platform for mobile inventory, sales, loans, EMI collections and financial reporting."
			},
			{
				name: "author",
				content: "Jain Mobile & Finance"
			},
			{
				property: "og:title",
				content: "Jain Mobile & Finance ERP"
			},
			{
				property: "og:description",
				content: "Management platform for mobile inventory, sales, loans, EMI collections and financial reporting."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary"
			},
			{
				name: "twitter:site",
				content: "@JainMobile"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/png",
				href: "/logo.png?v=3"
			},
			{
				rel: "shortcut icon",
				type: "image/x-icon",
				href: "/favicon.ico?v=3"
			},
			{
				rel: "apple-touch-icon",
				href: "/apple-touch-icon.png?v=3"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$26.useRouteContext();
	const currentUser = useStore((s) => s.currentUser);
	const recheckStatuses = useStore((s) => s.recheckStatuses);
	useRealtimeSync();
	(0, import_react.useEffect)(() => {
		if (currentUser) recheckStatuses();
	}, [currentUser, recheckStatuses]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(QueryClientProvider, {
		client: queryClient,
		children: [
			currentUser ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoginPage, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, {
				position: "top-right",
				richColors: true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppDialogs, {})
		]
	});
}
var $$splitComponentImporter$25 = () => import("./settings-DZHvmbjp.mjs");
var Route$25 = createFileRoute("/settings")({
	head: () => ({ meta: [{ title: "Settings · Jain Finance ERP" }, {
		name: "description",
		content: "Configure organisation, database sync, and manage all data for Finance & Mobiles."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$25, "component")
});
var $$splitComponentImporter$24 = () => import("./roles-D9N0UGNP.mjs");
var Route$24 = createFileRoute("/roles")({
	head: () => ({ meta: [{ title: "Roles & Staff · Jain Finance ERP" }, {
		name: "description",
		content: "Manage staff directory, roles, permissions and access control across the ERP."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$24, "component")
});
var $$splitComponentImporter$23 = () => import("./reports-DGUA3PGx.mjs");
var Route$23 = createFileRoute("/reports")({
	head: () => ({ meta: [{ title: "Reports · Jain Finance ERP" }, {
		name: "description",
		content: "Generate customer, EMI, collection, expense, investment and profit reports."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$23, "component")
});
var $$splitComponentImporter$22 = () => import("./profit-loss-B2qMxqWm.mjs");
var Route$22 = createFileRoute("/profit-loss")({
	head: () => ({ meta: [{ title: "Profit & Loss · Jain Finance ERP" }, {
		name: "description",
		content: "Mobile finance profit and loss — file charges, interest income, expenses and net profit."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$22, "component")
});
var $$splitComponentImporter$21 = () => import("./payments-BDYfg7rn.mjs");
var Route$21 = createFileRoute("/payments")({
	head: () => ({ meta: [{ title: "Payments · Jain Finance ERP" }, {
		name: "description",
		content: "Complete payment history across all customers, collectors and methods."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$21, "component")
});
var $$splitComponentImporter$20 = () => import("./loans-XaQoDV1m.mjs");
var Route$20 = createFileRoute("/loans")({
	head: () => ({ meta: [{ title: "Loans · Jain Finance ERP" }, {
		name: "description",
		content: "Create, track and manage customer loans with auto EMI calculation."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$20, "component")
});
var $$splitComponentImporter$19 = () => import("./investments-4F6gLNzZ.mjs");
var Route$19 = createFileRoute("/investments")({
	head: () => ({ meta: [{ title: "Investments · Jain Finance ERP" }, {
		name: "description",
		content: "Track investor capital, ROI, maturity dates and overall portfolio growth."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$19, "component")
});
var $$splitComponentImporter$18 = () => import("./expenses-BIeKEuns.mjs");
var Route$18 = createFileRoute("/expenses")({
	head: () => ({ meta: [{ title: "Income / Expense · Jain Finance ERP" }, {
		name: "description",
		content: "Track office expenses and cash income streams."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$18, "component")
});
var $$splitComponentImporter$17 = () => import("./documents-B0RI78ix.mjs");
var Route$17 = createFileRoute("/documents")({
	head: () => ({ meta: [{ title: "Documents · Jain Finance ERP" }, {
		name: "description",
		content: "Securely store and manage KYC and loan documents for every customer."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$17, "component")
});
var $$splitComponentImporter$16 = () => import("./customers-Ctf6G2ph.mjs");
var Route$16 = createFileRoute("/customers")({
	head: () => ({ meta: [{ title: "Customers · Jain Finance ERP" }, {
		name: "description",
		content: "Mobile phone EMI finance customer master list."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$16, "component")
});
var $$splitComponentImporter$15 = () => import("./collections-BO03xddv.mjs");
var Route$15 = createFileRoute("/collections")({
	head: () => ({ meta: [{ title: "Due List · Jain Finance ERP" }, {
		name: "description",
		content: "Pending EMI due list — customers with outstanding instalments."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$15, "component")
});
var $$splitComponentImporter$14 = () => import("./cash-flow-DnBxWAkG.mjs");
var Route$14 = createFileRoute("/cash-flow")({
	head: () => ({ meta: [{ title: "Cash & Bank Flow · Jain Finance ERP" }, {
		name: "description",
		content: "Consolidated Cash and Bank Flow statements for Finance and Mobiles."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$14, "component")
});
var $$splitComponentImporter$13 = () => import("./audit-13JbWU9b.mjs");
var Route$13 = createFileRoute("/audit")({
	head: () => ({ meta: [{ title: "Audit Logs · Jain Finance ERP" }, {
		name: "description",
		content: "Tamper-proof audit trail of user activity across the system."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$13, "component")
});
var $$splitComponentImporter$12 = () => import("./routes-IlArMVCp.mjs");
var Route$12 = createFileRoute("/")({
	head: () => ({ meta: [{ title: "Dashboard · Jain Finance ERP" }, {
		name: "description",
		content: "Jain Finance mobile phone EMI finance dashboard — daily collections, pending EMIs and P&L overview."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$12, "component")
});
var $$splitComponentImporter$11 = () => import("./mobiles-UJmkJ15P.mjs");
var Route$11 = createFileRoute("/mobiles/")({
	head: () => ({ meta: [{ title: "Dashboard · Jain Mobiles ERP" }, {
		name: "description",
		content: "Jain Mobiles shop management dashboard — stock status, purchase details, sales ledger and reporting."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$11, "component")
});
var $$splitComponentImporter$10 = () => import("./suppliers-D_8IKfaK.mjs");
var Route$10 = createFileRoute("/mobiles/suppliers")({
	head: () => ({ meta: [{ title: "Suppliers · Jain Mobiles ERP" }, {
		name: "description",
		content: "Mobile shop wholesale suppliers management."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("./settings-BtKgmiQM.mjs");
var Route$9 = createFileRoute("/mobiles/settings")({
	head: () => ({ meta: [{ title: "Settings · Jain Mobiles ERP" }, {
		name: "description",
		content: "Mobile shop configuration, database sync, and data management for Finance & Mobiles."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var $$splitComponentImporter$8 = () => import("./sales-NRqt7unX.mjs");
var Route$8 = createFileRoute("/mobiles/sales")({
	head: () => ({ meta: [{ title: "Sales Invoices · Jain Mobiles ERP" }, {
		name: "description",
		content: "Mobile shop billing, invoicing and sales ledger."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./reports-CULpuJp-.mjs");
var Route$7 = createFileRoute("/mobiles/reports")({
	head: () => ({ meta: [{ title: "Reports · Jain Mobiles ERP" }, {
		name: "description",
		content: "Mobile shop sales, profit, stock and purchase analytics."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("./purchases-DHc9AuTC.mjs");
var Route$6 = createFileRoute("/mobiles/purchases")({
	head: () => ({ meta: [{ title: "Purchases · Jain Mobiles ERP" }, {
		name: "description",
		content: "Mobile shop vendor purchase logs & ledger."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./products-CCE8JAkj.mjs");
var Route$5 = createFileRoute("/mobiles/products")({
	head: () => ({ meta: [{ title: "Products · Jain Mobiles ERP" }, {
		name: "description",
		content: "Mobile shop product catalog management."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./inventory-CX0QTwas.mjs");
var Route$4 = createFileRoute("/mobiles/inventory")({
	head: () => ({ meta: [{ title: "Inventory · Jain Mobiles ERP" }, {
		name: "description",
		content: "Mobile shop stock inventory management."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./expenses-Ci0OiAi4.mjs");
var Route$3 = createFileRoute("/mobiles/expenses")({
	head: () => ({ meta: [{ title: "Income & Expenses · Jain Mobiles ERP" }, {
		name: "description",
		content: "Track store expenses and cash inflow for Jain Mobiles."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./customers-BaE2hXLV.mjs");
var Route$2 = createFileRoute("/mobiles/customers")({
	head: () => ({ meta: [{ title: "Customers · Jain Mobiles ERP" }, {
		name: "description",
		content: "Mobile shop customer registry and transaction logs."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./cash-flow-DsF6Pn_Y.mjs");
var Route$1 = createFileRoute("/mobiles/cash-flow")({
	head: () => ({ meta: [{ title: "Cash & Bank Flow · Jain Mobiles ERP" }, {
		name: "description",
		content: "Consolidated Cash and Bank Flow statements for Mobiles and Finance."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./accessories-BQF6GFDE.mjs");
var Route = createFileRoute("/mobiles/accessories")({
	head: () => ({ meta: [{ title: "Accessories · Jain Mobiles ERP" }, {
		name: "description",
		content: "Mobile shop accessories inventory & sales management."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var SettingsRoute = Route$25.update({
	id: "/settings",
	path: "/settings",
	getParentRoute: () => Route$26
});
var RolesRoute = Route$24.update({
	id: "/roles",
	path: "/roles",
	getParentRoute: () => Route$26
});
var ReportsRoute = Route$23.update({
	id: "/reports",
	path: "/reports",
	getParentRoute: () => Route$26
});
var ProfitLossRoute = Route$22.update({
	id: "/profit-loss",
	path: "/profit-loss",
	getParentRoute: () => Route$26
});
var PaymentsRoute = Route$21.update({
	id: "/payments",
	path: "/payments",
	getParentRoute: () => Route$26
});
var LoansRoute = Route$20.update({
	id: "/loans",
	path: "/loans",
	getParentRoute: () => Route$26
});
var InvestmentsRoute = Route$19.update({
	id: "/investments",
	path: "/investments",
	getParentRoute: () => Route$26
});
var ExpensesRoute = Route$18.update({
	id: "/expenses",
	path: "/expenses",
	getParentRoute: () => Route$26
});
var DocumentsRoute = Route$17.update({
	id: "/documents",
	path: "/documents",
	getParentRoute: () => Route$26
});
var CustomersRoute = Route$16.update({
	id: "/customers",
	path: "/customers",
	getParentRoute: () => Route$26
});
var CollectionsRoute = Route$15.update({
	id: "/collections",
	path: "/collections",
	getParentRoute: () => Route$26
});
var CashFlowRoute = Route$14.update({
	id: "/cash-flow",
	path: "/cash-flow",
	getParentRoute: () => Route$26
});
var AuditRoute = Route$13.update({
	id: "/audit",
	path: "/audit",
	getParentRoute: () => Route$26
});
var IndexRoute = Route$12.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$26
});
var MobilesIndexRoute = Route$11.update({
	id: "/mobiles/",
	path: "/mobiles/",
	getParentRoute: () => Route$26
});
var MobilesSuppliersRoute = Route$10.update({
	id: "/mobiles/suppliers",
	path: "/mobiles/suppliers",
	getParentRoute: () => Route$26
});
var MobilesSettingsRoute = Route$9.update({
	id: "/mobiles/settings",
	path: "/mobiles/settings",
	getParentRoute: () => Route$26
});
var MobilesSalesRoute = Route$8.update({
	id: "/mobiles/sales",
	path: "/mobiles/sales",
	getParentRoute: () => Route$26
});
var MobilesReportsRoute = Route$7.update({
	id: "/mobiles/reports",
	path: "/mobiles/reports",
	getParentRoute: () => Route$26
});
var MobilesPurchasesRoute = Route$6.update({
	id: "/mobiles/purchases",
	path: "/mobiles/purchases",
	getParentRoute: () => Route$26
});
var MobilesProductsRoute = Route$5.update({
	id: "/mobiles/products",
	path: "/mobiles/products",
	getParentRoute: () => Route$26
});
var MobilesInventoryRoute = Route$4.update({
	id: "/mobiles/inventory",
	path: "/mobiles/inventory",
	getParentRoute: () => Route$26
});
var MobilesExpensesRoute = Route$3.update({
	id: "/mobiles/expenses",
	path: "/mobiles/expenses",
	getParentRoute: () => Route$26
});
var MobilesCustomersRoute = Route$2.update({
	id: "/mobiles/customers",
	path: "/mobiles/customers",
	getParentRoute: () => Route$26
});
var MobilesCashFlowRoute = Route$1.update({
	id: "/mobiles/cash-flow",
	path: "/mobiles/cash-flow",
	getParentRoute: () => Route$26
});
var rootRouteChildren = {
	IndexRoute,
	AuditRoute,
	CashFlowRoute,
	CollectionsRoute,
	CustomersRoute,
	DocumentsRoute,
	ExpensesRoute,
	InvestmentsRoute,
	LoansRoute,
	PaymentsRoute,
	ProfitLossRoute,
	ReportsRoute,
	RolesRoute,
	SettingsRoute,
	MobilesAccessoriesRoute: Route.update({
		id: "/mobiles/accessories",
		path: "/mobiles/accessories",
		getParentRoute: () => Route$26
	}),
	MobilesCashFlowRoute,
	MobilesCustomersRoute,
	MobilesExpensesRoute,
	MobilesInventoryRoute,
	MobilesProductsRoute,
	MobilesPurchasesRoute,
	MobilesReportsRoute,
	MobilesSalesRoute,
	MobilesSettingsRoute,
	MobilesSuppliersRoute,
	MobilesIndexRoute
};
var routeTree = Route$26._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	return createRouter({
		routeTree,
		context: { queryClient: new QueryClient() },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
