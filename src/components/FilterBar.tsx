import { useState } from "react";
import { Clock } from "lucide-react";

export type DateFilterPreset = "all" | "today" | "this-month" | "next-month" | "custom";

interface FilterBarProps {
  preset: DateFilterPreset;
  onChangePreset: (preset: DateFilterPreset) => void;
  customStart: string;
  onChangeStart: (start: string) => void;
  customEnd: string;
  onChangeEnd: (end: string) => void;
  startDate: Date | null;
  endDate: Date | null;
}

export function FilterBar({
  preset,
  onChangePreset,
  customStart,
  onChangeStart,
  customEnd,
  onChangeEnd,
  startDate,
  endDate,
}: FilterBarProps) {
  return (
    <div className="bg-surface/80 backdrop-blur-md border border-border/60 rounded-xl p-3 mb-6 flex flex-wrap items-center justify-between gap-4 shadow-sm transition-all duration-300">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/75 mr-2 flex items-center gap-1">
          <Clock className="size-3.5 text-muted-foreground/70" /> Date Scope:
        </span>
        {[
          { id: "all", label: "All Time" },
          { id: "today", label: "Today" },
          { id: "this-month", label: "This Month" },
          { id: "next-month", label: "Next Month" },
          { id: "custom", label: "Custom Range" },
        ].map((p) => {
          const isActive = preset === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onChangePreset(p.id as DateFilterPreset)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                isActive
                  ? "bg-foreground text-background shadow-md scale-[1.03]"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/60 bg-transparent"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {preset === "custom" && (
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg border border-border bg-background/60 shadow-inner animate-in fade-in slide-in-from-left-1 duration-200">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-extrabold text-muted-foreground/60">From</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => onChangeStart(e.target.value)}
              className="bg-transparent border-0 text-xs font-bold focus:outline-none w-28 cursor-pointer dark:color-scheme-dark"
            />
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-extrabold text-muted-foreground/60">To</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => onChangeEnd(e.target.value)}
              className="bg-transparent border-0 text-xs font-bold focus:outline-none w-28 cursor-pointer dark:color-scheme-dark"
            />
          </div>
        </div>
      )}

      <div className="text-[11px] font-bold text-muted-foreground bg-muted/50 border border-border/40 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 ml-auto md:ml-0 shadow-sm">
        <span className="size-2 rounded-full bg-success animate-pulse" />
        {preset === "all"
          ? "Showing All-Time Data"
          : `${startDate?.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) || "—"} to ${endDate?.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) || "—"}`}
      </div>
    </div>
  );
}

export function useDateFilter() {
  const [filterPreset, setFilterPreset] = useState<DateFilterPreset>("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const { startDate, endDate } = (() => {
    const today = new Date();
    const now = today.getFullYear() < 2026 ? new Date(2026, 5, 19) : today;
    
    let start: Date | null = null;
    let end: Date | null = null;

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
      case "all":
      default:
        break;
    }
    return { startDate: start, endDate: end };
  })();

  return {
    preset: filterPreset,
    setPreset: setFilterPreset,
    customStart,
    setCustomStart,
    customEnd,
    setCustomEnd,
    startDate,
    endDate,
  };
}
