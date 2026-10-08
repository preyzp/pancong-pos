import { NewOrderScreen } from "@/components/order/new-order-screen";
import { MOCK_MENU } from "@/data/mock/menu";
import { createMockOrders } from "@/data/mock/orders";

export default function NewOrderPage() {
  return (
    <NewOrderScreen
      initialOrders={createMockOrders(new Date("2026-10-06T05:00:00.000Z"))}
      menu={MOCK_MENU}
    />
  );
}
