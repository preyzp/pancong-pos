import type { MenuItem, Order } from "../../types/pos";

const jakartaDateFormatter = new Intl.DateTimeFormat("en-CA", {
  day: "2-digit",
  month: "2-digit",
  timeZone: "Asia/Jakarta",
  year: "numeric",
});

export type DashboardKpis = {
  salesToday: number;
  ordersToday: number;
  paidToday: number;
  unpaidToday: number;
};

export type BestSellingMenuItem = Pick<MenuItem, "id" | "name" | "category"> & {
  qtySold: number;
};

export function getJakartaDateKey(date: Date): string {
  const parts = jakartaDateFormatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("Tidak dapat menentukan tanggal Asia/Jakarta.");
  }

  return `${year}-${month}-${day}`;
}

function isToday(order: Order, jakartaToday: string): boolean {
  return getJakartaDateKey(new Date(order.createdAt)) === jakartaToday;
}

export function calculateDashboardKpis(
  orders: Order[],
  asOf: Date,
): DashboardKpis {
  const jakartaToday = getJakartaDateKey(asOf);
  const todaysOrders = orders.filter((order) => isToday(order, jakartaToday));

  return {
    salesToday: todaysOrders.reduce(
      (total, order) => total + (order.status === "lunas" ? order.total : 0),
      0,
    ),
    ordersToday: todaysOrders.filter((order) => order.status !== "dibatalkan")
      .length,
    paidToday: todaysOrders.filter((order) => order.status === "lunas").length,
    unpaidToday: todaysOrders.filter((order) => order.status === "belum_bayar")
      .length,
  };
}

export function calculateBestSellersToday(
  orders: Order[],
  menu: MenuItem[],
  asOf: Date,
): BestSellingMenuItem[] {
  const jakartaToday = getJakartaDateKey(asOf);
  const quantitiesByMenuId = new Map<string, number>();

  for (const order of orders) {
    if (order.status !== "lunas" || !isToday(order, jakartaToday)) {
      continue;
    }

    for (const item of order.items) {
      quantitiesByMenuId.set(
        item.menuId,
        (quantitiesByMenuId.get(item.menuId) ?? 0) + item.qty,
      );
    }
  }

  return menu
    .map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      qtySold: quantitiesByMenuId.get(item.id) ?? 0,
    }))
    .filter((item) => item.qtySold > 0)
    .sort((left, right) => right.qtySold - left.qtySold);
}

export function getRecentOrdersToday(orders: Order[], asOf: Date): Order[] {
  const jakartaToday = getJakartaDateKey(asOf);

  return orders
    .filter(
      (order) => order.status !== "dibatalkan" && isToday(order, jakartaToday),
    )
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() -
        new Date(left.createdAt).getTime(),
    );
}
