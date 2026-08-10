import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { CashFlowDashboard } from "@/components/CashFlowDashboard";

export const Route = createFileRoute("/mobiles/cash-flow")({
  head: () => ({
    meta: [
      { title: "Cash & UPI Flow · Jain Mobiles ERP" },
      { name: "description", content: "Consolidated Cash and UPI Flow statements for Mobiles and Finance." },
    ],
  }),
  component: MobileCashFlowPage,
});

function MobileCashFlowPage() {
  return (
    <AppShell breadcrumb="Finance > Cash & UPI Flow">
      <CashFlowDashboard />
    </AppShell>
  );
}
