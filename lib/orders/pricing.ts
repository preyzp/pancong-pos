import type { Addon, MenuItem, OrderItem } from "../../types/pos";

function sortAddons(addons: Addon[]): Addon[] {
  return [...addons].sort(
    (left, right) =>
      left.name.localeCompare(right.name, "id") || left.price - right.price,
  );
}

export function getCartLineKey(menuId: string, addons: Addon[]): string {
  return JSON.stringify({ menuId, addons: sortAddons(addons) });
}

export function calculateLineSubtotal(
  menuItem: MenuItem,
  quantity: number,
  addons: Addon[],
): number {
  const addonUnitPrice = addons.reduce(
    (total, addon) => total + addon.price,
    0,
  );
  return (menuItem.price + addonUnitPrice) * quantity;
}

export function calculateOrderItemSubtotal(item: OrderItem): number {
  const addonUnitPrice = item.addons.reduce(
    (total, addon) => total + addon.price,
    0,
  );
  return (item.unitPrice + addonUnitPrice) * item.qty;
}

export function calculateCartSubtotal(
  items: OrderItem[],
  menu: MenuItem[],
): number {
  return items.reduce((total, item) => {
    const menuItem = menu.find((candidate) => candidate.id === item.menuId);

    if (!menuItem) {
      throw new Error(`Menu item tidak ditemukan: ${item.menuId}`);
    }

    return total + calculateOrderItemSubtotal(item);
  }, 0);
}

export function calculatePriceSummary(
  items: OrderItem[],
  menu: MenuItem[],
): { subtotal: number; total: number } {
  const subtotal = calculateCartSubtotal(items, menu);
  return { subtotal, total: subtotal };
}
