import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { et as Clock } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/FilterBar-B1CYUr5_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function FilterBar({ preset, onChangePreset, customStart, onChangeStart, customEnd, onChangeEnd, startDate, endDate }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "bg-surface/80 backdrop-blur-md border border-border/60 rounded-xl p-3 mb-6 flex flex-wrap items-center justify-between gap-4 shadow-sm transition-all duration-300",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-xs font-bold uppercase tracking-wider text-muted-foreground/75 mr-2 flex items-center gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-3.5 text-muted-foreground/70" }), " Date Scope:"]
				}), [
					{
						id: "all",
						label: "All Time"
					},
					{
						id: "today",
						label: "Today"
					},
					{
						id: "this-month",
						label: "This Month"
					},
					{
						id: "next-month",
						label: "Next Month"
					},
					{
						id: "custom",
						label: "Custom Range"
					}
				].map((p) => {
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => onChangePreset(p.id),
						className: `px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${preset === p.id ? "bg-foreground text-background shadow-md scale-[1.03]" : "text-muted-foreground hover:text-foreground hover:bg-accent/60 bg-transparent"}`,
						children: p.label
					}, p.id);
				})]
			}),
			preset === "custom" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 px-3 py-1 rounded-lg border border-border bg-background/60 shadow-inner animate-in fade-in slide-in-from-left-1 duration-200",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] uppercase font-extrabold text-muted-foreground/60",
							children: "From"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "date",
							value: customStart,
							onChange: (e) => onChangeStart(e.target.value),
							className: "bg-transparent border-0 text-xs font-bold focus:outline-none w-28 cursor-pointer dark:color-scheme-dark"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-4 w-px bg-border" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] uppercase font-extrabold text-muted-foreground/60",
							children: "To"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "date",
							value: customEnd,
							onChange: (e) => onChangeEnd(e.target.value),
							className: "bg-transparent border-0 text-xs font-bold focus:outline-none w-28 cursor-pointer dark:color-scheme-dark"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-[11px] font-bold text-muted-foreground bg-muted/50 border border-border/40 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 ml-auto md:ml-0 shadow-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2 rounded-full bg-success animate-pulse" }), preset === "all" ? "Showing All-Time Data" : `${startDate?.toLocaleDateString("en-IN", {
					day: "2-digit",
					month: "short",
					year: "numeric"
				}) || "—"} to ${endDate?.toLocaleDateString("en-IN", {
					day: "2-digit",
					month: "short",
					year: "numeric"
				}) || "—"}`]
			})
		]
	});
}
function useDateFilter() {
	const [filterPreset, setFilterPreset] = (0, import_react.useState)("all");
	const [customStart, setCustomStart] = (0, import_react.useState)("");
	const [customEnd, setCustomEnd] = (0, import_react.useState)("");
	const { startDate, endDate } = (() => {
		const today = /* @__PURE__ */ new Date();
		const now = today.getFullYear() < 2026 ? new Date(2026, 5, 19) : today;
		let start = null;
		let end = null;
		switch (filterPreset) {
			case "today":
				start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
				end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
				break;
			case "this-month":
				start = new Date(now.getFullYear(), now.getMonth(), 1);
				end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
				break;
			case "next-month":
				start = new Date(now.getFullYear(), now.getMonth() + 1, 1);
				end = new Date(now.getFullYear(), now.getMonth() + 2, 0);
				break;
			case "custom":
				if (customStart) start = new Date(customStart);
				if (customEnd) end = new Date(customEnd);
				break;
			default: break;
		}
		return {
			startDate: start,
			endDate: end
		};
	})();
	return {
		preset: filterPreset,
		setPreset: setFilterPreset,
		customStart,
		setCustomStart,
		customEnd,
		setCustomEnd,
		startDate,
		endDate
	};
}
//#endregion
export { useDateFilter as n, FilterBar as t };
