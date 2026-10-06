import type { Order, OrderStatus } from "../../types/pos";

export type HistoryStatusFilter = "semua" | OrderStatus;

export function filterHistoryOrders(
  orders: Order[],
  query: string,
  status: HistoryStatusFilter,
): Order[] {
  const normalizedQuery = query.trim().toLocaleLowerCase("id-ID");

  return orders
    .filter((order) => status === "semua" || order.status === status)
    .filter((order) => {
      if (!normalizedQuery) return true;

      const searchableText = [
        order.id,
        order.customerName,
        ...order.items.map((item) => item.name),
      ]
        .join(" ")
        .toLocaleLowerCase("id-ID");

      return searchableText.includes(normalizedQuery);
    })
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() -
        new Date(left.createdAt).getTime(),
    );
}
