import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Download, History, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Card, SectionHeader, StatCard } from "@/components/ui-kit";
import { useMobileStore } from "@/lib/mobileStore";
import { downloadExcel, useStore } from "@/lib/store";

export const Route = createFileRoute("/mobiles/audit")({
  head: () => ({
    meta: [
      { title: "Audit Logs · Jain Mobiles ERP" },
      { name: "description", content: "Tamper-proof audit trail of user activity across Jain Mobiles ERP." },
    ],
  }),
  component: MobileAuditPage,
});

function MobileAuditPage() {
  const all = useMobileStore((s) => s.audit);
  const currentUser = useStore((s) => s.currentUser);
  const [q, setQ] = useState("");
  const [actionFilter, setActionFilter] = useState("All actions");
  const [userFilter, setUserFilter] = useState("All users");

  const isAdmin = currentUser?.role?.toLowerCase() === "admin";

  if (!isAdmin) {
    return (
      <AppShell breadcrumb="Audit Logs">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="size-16 rounded-full bg-danger/10 text-danger flex items-center justify-center">
            <ShieldAlert className="size-7" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Access Denied</h1>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Audit logs are restricted to Administrators only. Please contact your admin for access.
          </p>
        </div>
      </AppShell>
    );
  }

  const users = ["All users", ...Array.from(new Set(all.map((l) => l.user)))];

  const filtered = all.filter((l) => {
    if (actionFilter !== "All actions" && !l.action.toLowerCase().includes(actionFilter.toLowerCase())) return false;
    if (userFilter !== "All users" && l.user !== userFilter) return false;
    if (q) {
      const n = q.toLowerCase();
      return [l.user, l.action, l.target].some((v) => v.toLowerCase().includes(n));
    }
    return true;
  });

  // Stats by user
  const byUser = Array.from(new Set(all.map((l) => l.user)))
    .map((u) => ({
      user: u,
      count: all.filter((l) => l.user === u).length,
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <AppShell breadcrumb="Audit Logs">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight">Jain Mobiles Audit Logs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Immutable activity log of sales, purchases, stock changes, and system operations in Jain Mobiles.
          </p>
        </div>
        <button
          onClick={() => {
            downloadExcel("audit-logs-jain-mobiles.xlsx", "Mobiles Audit Logs", filtered);
            toast.success("Mobiles audit log exported");
          }}
          className="h-9 px-3 rounded-md border border-border bg-surface text-sm font-medium inline-flex items-center gap-1.5 hover:bg-accent cursor-pointer transition-colors shadow-sm"
        >
          <Download className="size-3.5" /> Export Excel
        </button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {byUser.slice(0, 3).map((u) => (
          <StatCard
            key={u.user}
            label={u.user}
            value={u.count.toString()}
            sub="recorded activity actions"
          />
        ))}
        {byUser.length === 0 && (
          <StatCard label="Total Audit Logs" value={all.length.toString()} sub="recorded actions" />
        )}
      </div>

      <Card>
        <div className="p-4 border-b border-border flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="size-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by user, action, target…"
              className="h-9 w-full rounded-md border border-border bg-background pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
          </div>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="h-9 rounded-md border border-border bg-surface px-3 text-sm font-medium"
          >
            <option>All actions</option>
            <option>Created</option>
            <option>Stock</option>
            <option>Purchase</option>
            <option>Product</option>
            <option>Supplier</option>
            <option>Expense</option>
          </select>
          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="h-9 rounded-md border border-border bg-surface px-3 text-sm font-medium"
          >
            {users.map((u) => (
              <option key={u}>{u}</option>
            ))}
          </select>
          {(q || actionFilter !== "All actions" || userFilter !== "All users") && (
            <button
              onClick={() => {
                setQ("");
                setActionFilter("All actions");
                setUserFilter("All users");
              }}
              className="h-9 px-3 rounded-md border border-border text-sm text-muted-foreground hover:bg-accent"
            >
              Clear
            </button>
          )}
        </div>

        <SectionHeader
          title="Mobiles Activity History"
          action={<span className="text-xs text-muted-foreground font-medium">{filtered.length} entries</span>}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border bg-muted/10">
                <th className="text-left font-medium px-5 py-2.5">Timestamp</th>
                <th className="text-left font-medium py-2.5">User</th>
                <th className="text-left font-medium py-2.5">Action</th>
                <th className="text-left font-medium px-5 py-2.5">Target &amp; Details</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-muted-foreground text-sm">
                    No matching audit entries found.
                  </td>
                </tr>
              ) : (
                filtered.map((l, i) => (
                  <tr key={i} className="border-t border-border hover:bg-accent/30 transition-colors">
                    <td className="px-5 py-3 text-muted-foreground font-mono text-[12px]">{l.ts}</td>
                    <td className="py-3 font-semibold text-foreground">{l.user}</td>
                    <td className="py-3 font-medium text-foreground/90">{l.action}</td>
                    <td className="px-5 py-3 text-muted-foreground">{l.target}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
