import { AppShell } from "@/components/layout/app-shell";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { MOCK_MENU } from "@/data/mock/menu";
import { createMockOrders } from "@/data/mock/orders";

export const dynamic = "force-dynamic";

export default function Home() {
  const dashboardAsOf = new Date();
  const dashboardDate = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Jakarta",
    year: "numeric",
  }).format(dashboardAsOf);
  const orders = createMockOrders(dashboardAsOf);

  return (
    <AppShell
      active="beranda"
      title="Beranda"
    >
      <DashboardContent
        asOf={dashboardAsOf.toISOString()}
        dashboardDate={dashboardDate}
        initialOrders={orders}
        menu={MOCK_MENU}
      />
    </AppShell>
  );
}
