import { EditOrderScreen } from "../../../../components/order/edit-order-screen";
import { createMockOrders } from "../../../../data/mock/orders";

type EditOrderPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ returnTo?: string }>;
};

const EDIT_ORDERS_AS_OF = new Date("2026-10-06T05:00:00.000Z");

export default async function EditOrderPage({
  params,
  searchParams,
}: EditOrderPageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const orderId = decodeURIComponent(id);
  const orderDetailPath = `/orders/${encodeURIComponent(orderId)}`;
  const returnTo =
    query.returnTo === "/" ||
    query.returnTo === "/history" ||
    query.returnTo === orderDetailPath
      ? query.returnTo
      : "/history";

  return (
    <EditOrderScreen
      key={orderId}
      initialOrders={createMockOrders(EDIT_ORDERS_AS_OF)}
      orderId={orderId}
      returnTo={returnTo}
    />
  );
}