import { AppShell } from "@/components/layout/app-shell";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { MOCK_MENU } from "@/data/mock/menu";
import { createMockOrders } from "@/data/mock/orders";

const DASHBOARD_AS_OF = new Date("2026-10-06T02:25:00.000Z");

const dashboardDate = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  timeZone: "Asia/Jakarta",
  year: "numeric",
}).format(DASHBOARD_AS_OF);

export default function Home() {
  const orders = createMockOrders(DASHBOARD_AS_OF);

  return (
    <AppShell
      active="beranda"
      title="Beranda"
      subtitle={`Ringkasan hari ini · ${dashboardDate}`}
    >
      <DashboardContent
        asOf={DASHBOARD_AS_OF.toISOString()}
        initialOrders={orders}
        menu={MOCK_MENU}
      />
    </AppShell>
  );
}
