import { OrderHistoryScreen } from "../../components/history/order-history-screen";
import { createMockOrders } from "../../data/mock/orders";

const HISTORY_MOCK_AS_OF = new Date("2026-10-06T05:00:00.000Z");

export default function OrderHistoryPage() {
  return (
    <OrderHistoryScreen initialOrders={createMockOrders(HISTORY_MOCK_AS_OF)} />
  );
}
