import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Download } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Card, SectionHeader, StatCard } from "@/components/ui-kit";
import { downloadExcel, useStore } from "@/lib/store";

export const Route = createFileRoute("/audit")({
  head: () => ({
    meta: [
      { title: "Audit Logs · Jain Finance ERP" },
      { name: "description", content: "Tamper-proof audit trail of user activity across the system." },
    ],
  }),
  component: AuditPage,
});

function AuditPage() {
  const all = useStore((s) => s.audit);
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
            <Search className="size-7" />
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
    if (actionFilter !== "All actions" && !String(l.action || "").toLowerCase().includes(actionFilter.toLowerCase())) return false;
    if (userFilter !== "All users" && l.user !== userFilter) return false;
    if (q) {
      const n = q.toLowerCase();
      return [l.user, l.action, l.target].some((v) => String(v || "").toLowerCase().includes(n));
    }
    return true;
  });

  // Stats
  const byUser = Array.from(new Set(all.map((l) => l.user))).map((u) => ({
    user: u,
    count: all.filter((l) => l.user === u).length,
  })).sort((a, b) => b.count - a.count);

  return (
    <AppShell breadcrumb="Audit Logs">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight">Audit Logs</h1>
          <p className="text-sm text-muted-foreground mt-1">Immutable history of every action across the ERP.</p>
        </div>
        <button
          onClick={() => { downloadExcel("audit-logs.xlsx", "Audit Logs", filtered); toast.success("Audit log exported"); }}
          className="h-9 px-3 rounded-md border border-border bg-surface text-sm inline-flex items-center gap-1.5 hover:bg-accent"
        >
          <Download className="size-3.5" /> Export
        </button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {byUser.slice(0, 3).map((u) => (
          <StatCard
            key={u.user}
            label={u.user}
            value={u.count.toString()}
            sub="total actions"
          />
        ))}
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
          <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="h-9 rounded-md border border-border bg-surface px-3 text-sm">
            <option>All actions</option><option>Logged</option><option>Created</option><option>Updated</option><option>Recorded</option><option>Sent</option><option>Added</option>
          </select>
          <select value={userFilter} onChange={(e) => setUserFilter(e.target.value)} className="h-9 rounded-md border border-border bg-surface px-3 text-sm">
            {users.map((u) => <option key={u}>{u}</option>)}
          </select>
          {(q || actionFilter !== "All actions" || userFilter !== "All users") && (
            <button
              onClick={() => { setQ(""); setActionFilter("All actions"); setUserFilter("All users"); }}
              className="h-9 px-3 rounded-md border border-border text-sm text-muted-foreground hover:bg-accent"
            >
              Clear
            </button>
          )}
        </div>

        <SectionHeader title="Activity" action={<span className="text-xs text-muted-foreground">{filtered.length} entries</span>} />
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="text-left font-medium px-5 py-2.5">Timestamp</th>
                <th className="text-left font-medium py-2.5">User</th>
                <th className="text-left font-medium py-2.5">Action</th>
                <th className="text-left font-medium px-5 py-2.5">Target</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-10 text-center text-muted-foreground text-sm">No audit entries match.</td></tr>
              ) : filtered.map((l, i) => (
                <tr key={i} className="border-t border-border hover:bg-accent/30">
                  <td className="px-5 py-3 text-muted-foreground font-mono text-[12px]">{l.ts}</td>
                  <td className="py-3 font-medium">{l.user}</td>
                  <td className="py-3">{l.action}</td>
                  <td className="px-5 py-3 text-muted-foreground">{l.target}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
