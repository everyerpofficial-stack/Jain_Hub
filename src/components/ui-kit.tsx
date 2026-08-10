import { type ReactNode, type HTMLAttributes } from "react";

export function Card({ children, className = "", ...props }: { children: ReactNode; className?: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`rounded-xl border border-border bg-surface ${className}`} {...props}>{children}</div>
  );
}

export function StatCard({
  label, value, sub, icon, trend,
}: {
  label: string; value: string; sub?: ReactNode;
  icon?: ReactNode; trend?: "up" | "down" | "warn";
}) {
  const trendColor =
    trend === "up" ? "text-success" :
    trend === "down" ? "text-danger" :
    trend === "warn" ? "text-warning" : "text-muted-foreground";
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className={trendColor}>{icon}</div>
      </div>
      <div className="mt-3 text-[26px] font-semibold tracking-tight leading-none">{value}</div>
      {sub && <div className="mt-2 text-xs text-muted-foreground">{sub}</div>}
    </Card>
  );
}

export function SectionHeader({
  title, action, description,
}: { title: string; action?: ReactNode; description?: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 w-full px-5 pt-4 pb-3">
      <div className="flex items-center justify-between w-full">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        {action}
      </div>
      {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
    </div>
  );
}

export function Badge({
  children, tone = "neutral", className = "", ...props
}: {
  children: ReactNode;
  tone?: "success" | "warning" | "danger" | "info" | "neutral";
} & HTMLAttributes<HTMLSpanElement>) {
  const map: Record<string, string> = {
    success: "border-success/30 text-success bg-success/10",
    warning: "border-warning/40 text-warning bg-warning/10",
    danger:  "border-danger/30 text-danger bg-danger/10",
    info:    "border-info/30 text-info bg-info/10",
    neutral: "border-border text-foreground/70 bg-muted",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${map[tone]} ${className}`} {...props}>
      {children}
    </span>
  );
}

export function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
    </div>
  );
}
