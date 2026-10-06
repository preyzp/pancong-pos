import type { Order } from "../../types/pos";

export function cancelUnpaidOrder(orders: Order[], orderId: string): Order[] {
  return orders.map((order) =>
    order.id === orderId && order.status === "belum_bayar"
      ? { ...order, status: "dibatalkan" }
      : order,
  );
}
