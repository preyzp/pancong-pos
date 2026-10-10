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

export type DailySales = {
  date: string;
  label: string;
  total: number;
  orderCount: number;
};

export type MenuSales = {
  menuId: string;
  name: string;
  category: string;
  qtySold: number;
  total: number;
};

export type SalesOverview = {
  salesToday: number;
  paidOrdersToday: number;
  averageOrderValue: number;
  menuSalesToday: MenuSales[];
  lastSevenDays: DailySales[];
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

function dateFromJakartaKey(dateKey: string): Date {
  return new Date(`${dateKey}T12:00:00+07:00`);
}

function addDaysToDateKey(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function isToday(order: Order, jakartaToday: string): boolean {
  return getJakartaDateKey(new Date(order.createdAt)) === jakartaToday;
}

export function calculateSalesOverview(
  orders: Order[],
  menu: MenuItem[],
  asOf: Date,
): SalesOverview {
  const today = getJakartaDateKey(asOf);
  const paidOrdersToday = orders.filter(
    (order) => order.status === "lunas" && isToday(order, today),
  );
  const salesToday = paidOrdersToday.reduce(
    (total, order) => total + order.total,
    0,
  );
  const menuItems = new Map(menu.map((item) => [item.id, item]));
  const menuSalesById = new Map<string, MenuSales>();

  for (const order of paidOrdersToday) {
    let remainingOrderTotal = Math.max(0, order.total);

    for (const item of order.items) {
      const addonsTotal = item.addons.reduce(
        (total, addon) => total + addon.price,
        0,
      );
      const lineTotal = Math.max(
        0,
        Math.min(
          (item.unitPrice + addonsTotal) * item.qty,
          remainingOrderTotal,
        ),
      );
      remainingOrderTotal -= lineTotal;

      const menuItem = menuItems.get(item.menuId);
      const existing = menuSalesById.get(item.menuId);
      if (existing) {
        existing.qtySold += item.qty;
        existing.total += lineTotal;
      } else {
        menuSalesById.set(item.menuId, {
          menuId: item.menuId,
          name: menuItem?.name ?? item.name,
          category: menuItem?.category ?? item.category,
          qtySold: item.qty,
          total: lineTotal,
        });
      }
    }
  }

  const menuSalesToday = [...menuSalesById.values()]
    .filter((item) => item.qtySold > 0)
    .sort(
      (left, right) =>
        right.total - left.total ||
        left.name.localeCompare(right.name, "id"),
    );

  const dateFormatter = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Jakarta",
  });
  const lastSevenDays = Array.from({ length: 7 }, (_, index) => {
    const date = addDaysToDateKey(today, index - 6);
    const dateOrders = orders.filter(
      (order) => order.status === "lunas" && isToday(order, date),
    );

    return {
      date,
      label: dateFormatter.format(dateFromJakartaKey(date)),
      total: dateOrders.reduce((total, order) => total + order.total, 0),
      orderCount: dateOrders.length,
    };
  });

  return {
    salesToday,
    paidOrdersToday: paidOrdersToday.length,
    averageOrderValue:
      paidOrdersToday.length === 0
        ? 0
        : Math.round(salesToday / paidOrdersToday.length),
    menuSalesToday,
    lastSevenDays,
  };
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
