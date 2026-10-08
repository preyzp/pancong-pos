import type { MenuItem, Order, OrderItem } from "../../types/pos";
import { calculatePriceSummary } from "./pricing";
import { validateDraftOrder } from "./validation";

export type CreateOrderResult =
  | { ok: true; order: Order }
  | { ok: false; reason: "invalid_draft" };

function getNextOrderId(orders: Order[]): string {
  const existingIds = new Set(orders.map((order) => order.id));
  const highestNumber = orders.reduce((highest, order) => {
    const match = /^#(\d+)$/.exec(order.id);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);
  let nextNumber = highestNumber + 1;
  let nextId = `#${String(nextNumber).padStart(3, "0")}`;

  while (existingIds.has(nextId)) {
    nextNumber += 1;
    nextId = `#${String(nextNumber).padStart(3, "0")}`;
  }

  return nextId;
}

export function buildUnpaidOrder(
  customerName: string,
  items: OrderItem[],
  menu: MenuItem[],
  existingOrders: Order[],
  cashier: string,
  createdAt: Date = new Date(),
): CreateOrderResult {
  if (Object.keys(validateDraftOrder(customerName, items, menu)).length > 0) {
    return { ok: false, reason: "invalid_draft" };
  }

  const orderItems = items.map((item) => {
    const menuItem = menu.find((candidate) => candidate.id === item.menuId);

    if (!menuItem) {
      throw new Error(`Menu item tidak ditemukan: ${item.menuId}`);
    }

    return {
      ...item,
      name: menuItem.name,
      category: menuItem.category,
      addons: item.addons.map((addon) => ({ ...addon })),
    };
  });
  const priceSummary = calculatePriceSummary(orderItems, menu);

  return {
    ok: true,
    order: {
      id: getNextOrderId(existingOrders),
      customerName: customerName.trim(),
      items: orderItems,
      ...priceSummary,
      status: "belum_bayar",
      cashier,
      createdAt: createdAt.toISOString(),
    },
  };
}
