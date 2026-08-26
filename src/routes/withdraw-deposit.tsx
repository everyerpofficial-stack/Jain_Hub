import { createFileRoute } from "@tanstack/react-router";
import { Trash2, Download, ArrowUpRight, ArrowDownRight, ArrowLeftRight } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Badge, Card, SectionHeader, StatCard } from "@/components/ui-kit";
import { useStore, parseAppDate, isDateInRange, downloadExcel } from "@/lib/store";
import { useUi } from "@/components/AppDialogs";
import { FilterBar, useDateFilter } from "@/components/FilterBar";

export const Route = createFileRoute("/withdraw-deposit")({
  head: () => ({
    meta: [
      { title: "Withdraw / Deposit · Jain Finance ERP" },
      { name: "description", content: "Track profit withdrawals, redeposits, and net outstanding cash." },
    ],
  }),
  component: WithdrawDepositPage,
});

function WithdrawDepositPage() {
  const profitTransactions = useStore((s) => s.profitTransactions) || [];
  const deleteProfitTransaction = useStore((s) => s.deleteProfitTransaction);
  const currentUser = useStore((s) => s.currentUser);
  const { openDialog } = useUi();

  const isAdmin = currentUser?.role ? String(currentUser.role).toLowerCase() === "admin" : false;

  const {
    preset: filterPreset,
    setPreset: setFilterPreset,
    customStart,
    setCustomStart,
    customEnd,
    setCustomEnd,
    startDate,
    endDate,
  } = useDateFilter();

  // Filter transactions by date range
  const filteredTxs = profitTransactions.filter((tx) => {
    if (!tx) return false;
    const txDate = parseAppDate(tx.date);
    return isDateInRange(txDate, startDate, endDate);
  });

  const totalWithdrawn = filteredTxs
    .filter((t) => t.type === "Withdrawal")
    .reduce((s, t) => s + t.amount, 0);

  const totalRedeposited = filteredTxs
    .filter((t) => t.type === "Redeposit")
    .reduce((s, t) => s + t.amount, 0);

  const netTakenBalance = Math.max(0, totalWithdrawn - totalRedeposited);

  return (
    <AppShell breadcrumb="Withdraw / Deposit">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight">Withdraw / Deposit Ledger</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track business withdrawals and redeposits of profit funds.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => openDialog("withdrawProfit")}
            className="h-9 px-3.5 rounded-md bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold inline-flex items-center gap-1.5 shadow transition-colors cursor-pointer"
          >
            <ArrowUpRight className="size-4" /> Withdraw Profit
          </button>
          <button
            onClick={() => openDialog("depositProfit")}
            className="h-9 px-3.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold inline-flex items-center gap-1.5 shadow transition-colors cursor-pointer"
          >
            <ArrowDownRight className="size-4" /> Deposit Taken Money
          </button>
          <button
            onClick={() => {
              downloadExcel("withdrawals-deposits.xlsx", "Profit Transactions", filteredTxs.map((tx) => ({
                "Reference ID": tx.id,
                Date: tx.date,
                Type: tx.type,
                Method: tx.method,
                Amount: tx.amount,
                "Taken Balance After": tx.takenBalanceAfter,
                "Notes / Reason": tx.notes || "—",
                "Recorded By": tx.withdrawnBy || "Admin"
              })));
              toast.success("Transactions exported to Excel");
            }}
            className="h-9 px-3.5 rounded-md border border-border bg-surface text-sm inline-flex items-center gap-1.5 hover:bg-accent font-semibold transition-colors shadow-sm cursor-pointer"
          >
            <Download className="size-3.5" /> Export Excel
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        preset={filterPreset}
        onChangePreset={setFilterPreset}
        customStart={customStart}
        onChangeStart={setCustomStart}
        customEnd={customEnd}
        onChangeEnd={setCustomEnd}
        startDate={startDate}
        endDate={endDate}
      />

      {/* Quick Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <StatCard
          label="Total Withdrawn (In Period)"
          value={`₹${totalWithdrawn.toLocaleString("en-IN")}`}
          sub="Cumulative taken profit"
          trend="up"
        />
        <StatCard
          label="Total Redeposited (In Period)"
          value={`₹${totalRedeposited.toLocaleString("en-IN")}`}
          sub="Returned to business fund"
          trend="up"
        />
        <StatCard
          label="Outstanding Taken Money"
          value={`₹${netTakenBalance.toLocaleString("en-IN")}`}
          sub="Money yet to deposit back"
          trend={netTakenBalance > 0 ? "warn" : undefined}
        />
      </div>

      {/* History log card */}
      <Card className="mt-6 w-full overflow-hidden">
        <SectionHeader title="Transaction History" />
        <div className="w-full overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border bg-muted/10">
                <th className="py-2.5 px-3 font-semibold">Ref ID</th>
                <th className="py-2.5 px-3 font-semibold">Date</th>
                <th className="py-2.5 px-3 font-semibold">Type</th>
                <th className="py-2.5 px-3 font-semibold">Payment Mode</th>
                <th className="py-2.5 px-3 font-semibold text-right">Amount</th>
                <th className="py-2.5 px-3 font-semibold text-right">Taken Balance After</th>
                <th className="py-2.5 px-3 font-semibold">Notes / Reason</th>
                <th className="py-2.5 px-3 font-semibold">Recorded By</th>
                {isAdmin && <th className="py-2.5 px-3 text-right font-semibold">Action</th>}
              </tr>
            </thead>
            <tbody>
              {filteredTxs.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 9 : 8} className="px-3 py-8 text-center text-muted-foreground font-semibold">
                    No transactions match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredTxs.map((tx) => (
                  <tr key={tx.id} className="border-b border-border hover:bg-accent/40 last:border-0">
                    <td className="py-2.5 px-3 font-mono font-medium text-muted-foreground">{tx.id}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">{tx.date}</td>
                    <td className="py-2.5 px-3">
                      {tx.type === "Withdrawal" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                          <ArrowUpRight className="size-3" /> Withdrawal
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                          <ArrowDownRight className="size-3" /> Redeposit
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-foreground">{tx.method}</td>
                    <td className={`py-2.5 px-3 text-right font-bold ${tx.type === "Withdrawal" ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                      {tx.type === "Withdrawal" ? `- ₹${tx.amount.toLocaleString("en-IN")}` : `+ ₹${tx.amount.toLocaleString("en-IN")}`}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium text-muted-foreground">
                      ₹{tx.takenBalanceAfter.toLocaleString("en-IN")}
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground">{tx.notes || "—"}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">{tx.withdrawnBy || "Admin"}</td>
                    {isAdmin && (
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => {
                            if (confirm(`Delete transaction ${tx.id} for ₹${tx.amount.toLocaleString("en-IN")}?`)) {
                              deleteProfitTransaction(tx.id);
                              toast.success(`Deleted transaction ${tx.id}`);
                            }
                          }}
                          className="size-7 rounded border border-border inline-flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors text-muted-foreground cursor-pointer"
                          title="Delete entry"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </td>
                    )}
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
