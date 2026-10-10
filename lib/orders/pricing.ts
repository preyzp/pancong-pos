import type { OrderItemAddon, MenuItem, OrderItem } from "../../types/pos";
import { getAddonQuantity } from "../addons/addons";

function sortAddons(addons: OrderItemAddon[]): OrderItemAddon[] {
  return addons
    .map(({ addonId, name, price, qty }) => ({ addonId, name, price, qty }))
    .sort(
      (left, right) =>
        left.name.localeCompare(right.name, "id") ||
        left.price - right.price ||
        (left.addonId ?? "").localeCompare(right.addonId ?? ""),
    );
}

export function getCartLineKey(menuId: string, addons: OrderItemAddon[]): string {
  return JSON.stringify({ menuId, addons: sortAddons(addons) });
}

/** Total Add-on untuk satu unit menu: Σ harga snapshot × jumlah Add-on. */
export function calculateAddonUnitPrice(addons: OrderItemAddon[]): number {
  return addons.reduce(
    (total, addon) => total + addon.price * getAddonQuantity(addon),
    0,
  );
}

export function calculateLineSubtotal(
  menuItem: MenuItem | undefined,
  quantity: number,
  addons: OrderItemAddon[],
): number {
  if (!menuItem) {
    throw new Error("Menu item tidak tersedia untuk menghitung subtotal.");
  }

  return (menuItem.price + calculateAddonUnitPrice(addons)) * quantity;
}

export function calculateOrderItemSubtotal(item: OrderItem): number {
  return (item.unitPrice + calculateAddonUnitPrice(item.addons)) * item.qty;
}

export function calculateCartSubtotal(
  items: OrderItem[],
): number {
  return items.reduce(
    (total, item) => total + calculateOrderItemSubtotal(item),
    0,
  );
}

export function calculatePriceSummary(
  items: OrderItem[],
): { subtotal: number; total: number } {
  const subtotal = calculateCartSubtotal(items);
  return { subtotal, total: subtotal };
}
