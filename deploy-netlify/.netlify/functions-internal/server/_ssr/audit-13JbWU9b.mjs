import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { C as Search, Z as Download } from "../_libs/lucide-react.mjs";
import { _ as useStore, d as downloadExcel } from "./mobileStore-B8EWbC21.mjs";
import { a as SectionHeader, o as StatCard, r as Card, t as AppShell } from "./ui-kit-iW0nuj1I.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/audit-13JbWU9b.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AuditPage() {
	const all = useStore((s) => s.audit);
	const currentUser = useStore((s) => s.currentUser);
	const [q, setQ] = (0, import_react.useState)("");
	const [actionFilter, setActionFilter] = (0, import_react.useState)("All actions");
	const [userFilter, setUserFilter] = (0, import_react.useState)("All users");
	if (!(currentUser?.role?.toLowerCase() === "admin")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		breadcrumb: "Audit Logs",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col items-center justify-center min-h-[60vh] gap-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "size-16 rounded-full bg-danger/10 text-danger flex items-center justify-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-7" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-bold text-foreground",
					children: "Access Denied"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground text-center max-w-sm",
					children: "Audit logs are restricted to Administrators only. Please contact your admin for access."
				})
			]
		})
	});
	const users = ["All users", ...Array.from(new Set(all.map((l) => l.user)))];
	const filtered = all.filter((l) => {
		if (actionFilter !== "All actions" && !l.action.toLowerCase().includes(actionFilter.toLowerCase())) return false;
		if (userFilter !== "All users" && l.user !== userFilter) return false;
		if (q) {
			const n = q.toLowerCase();
			return [
				l.user,
				l.action,
				l.target
			].some((v) => v.toLowerCase().includes(n));
		}
		return true;
	});
	const byUser = Array.from(new Set(all.map((l) => l.user))).map((u) => ({
		user: u,
		count: all.filter((l) => l.user === u).length
	})).sort((a, b) => b.count - a.count);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		breadcrumb: "Audit Logs",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3 mb-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-[26px] font-semibold tracking-tight",
					children: "Audit Logs"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-1",
					children: "Immutable history of every action across the ERP."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => {
						downloadExcel("audit-logs.xlsx", "Audit Logs", filtered);
						toast.success("Audit log exported");
					},
					className: "h-9 px-3 rounded-md border border-border bg-surface text-sm inline-flex items-center gap-1.5 hover:bg-accent",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-3.5" }), " Export"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6",
				children: byUser.slice(0, 3).map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
					label: u.user,
					value: u.count.toString(),
					sub: "total actions"
				}, u.user))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-4 border-b border-border flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative flex-1 min-w-[240px]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: q,
								onChange: (e) => setQ(e.target.value),
								placeholder: "Search by user, action, target…",
								className: "h-9 w-full rounded-md border border-border bg-background pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: actionFilter,
							onChange: (e) => setActionFilter(e.target.value),
							className: "h-9 rounded-md border border-border bg-surface px-3 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "All actions" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Logged" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Created" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Updated" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Recorded" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Sent" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Added" })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							value: userFilter,
							onChange: (e) => setUserFilter(e.target.value),
							className: "h-9 rounded-md border border-border bg-surface px-3 text-sm",
							children: users.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: u }, u))
						}),
						(q || actionFilter !== "All actions" || userFilter !== "All users") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => {
								setQ("");
								setActionFilter("All actions");
								setUserFilter("All users");
							},
							className: "h-9 px-3 rounded-md border border-border text-sm text-muted-foreground hover:bg-accent",
							children: "Clear"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
					title: "Activity",
					action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-xs text-muted-foreground",
						children: [filtered.length, " entries"]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "text-[11px] uppercase tracking-wider text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left font-medium px-5 py-2.5",
								children: "Timestamp"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left font-medium py-2.5",
								children: "User"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left font-medium py-2.5",
								children: "Action"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left font-medium px-5 py-2.5",
								children: "Target"
							})
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						colSpan: 4,
						className: "px-5 py-10 text-center text-muted-foreground text-sm",
						children: "No audit entries match."
					}) }) : filtered.map((l, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-t border-border hover:bg-accent/30",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-5 py-3 text-muted-foreground font-mono text-[12px]",
								children: l.ts
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-3 font-medium",
								children: l.user
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-3",
								children: l.action
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-5 py-3 text-muted-foreground",
								children: l.target
							})
						]
					}, i)) })]
				})
			] })
		]
	});
}
//#endregion
export { AuditPage as component };
