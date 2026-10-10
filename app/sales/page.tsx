import { SalesScreen } from "@/components/sales/sales-screen";
import { MOCK_MENU } from "@/data/mock/menu";
import { createMockOrders } from "@/data/mock/orders";

export const dynamic = "force-dynamic";

export default function SalesPage() {
  const asOf = new Date();

  return (
    <SalesScreen
      asOf={asOf.toISOString()}
      initialMenu={MOCK_MENU}
      initialOrders={createMockOrders(asOf)}
    />
  );
}
