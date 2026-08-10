import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { CashFlowDashboard } from "@/components/CashFlowDashboard";

export const Route = createFileRoute("/cash-flow")({
  head: () => ({
    meta: [
      { title: "Cash & UPI Flow · Jain Finance ERP" },
      { name: "description", content: "Consolidated Cash and UPI Flow statements for Finance and Mobiles." },
    ],
  }),
  component: CashFlowPage,
});

function CashFlowPage() {
  return (
    <AppShell breadcrumb="Finance > Cash & UPI Flow">
      <CashFlowDashboard />
    </AppShell>
  );
}
