import type { Order, OrderItem } from "../../types/pos";
import { calculatePriceSummary } from "./pricing";

export type EditableOrder = {
  customerName: string;
  items: OrderItem[];
};

export function createEditableOrder(order: Order): EditableOrder {
  return {
    customerName: order.customerName,
    items: order.items.map((item) => ({
      ...item,
      addons: item.addons.map((addon) => ({ ...addon })),
    })),
  };
}

export function buildEditedOrder(order: Order, editable: EditableOrder): Order {
  const items = editable.items.map((item) => ({
    ...item,
    addons: item.addons.map((addon) => ({ ...addon })),
  }));
  const priceSummary = calculatePriceSummary(items);

  return {
    ...order,
    customerName: editable.customerName.trim(),
    items,
    ...priceSummary,
  };
}
