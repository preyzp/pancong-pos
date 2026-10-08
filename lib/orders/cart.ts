import type { Addon, MenuItem, OrderItem } from "../../types/pos";
import { getCartLineKey } from "./pricing";

function normalizeAddons(addons: Addon[]): Addon[] {
  if (addons.some((addon) => !Number.isFinite(addon.price) || addon.price < 0)) {
    throw new RangeError("Harga add-on harus berupa angka non-negatif.");
  }

  return [...addons].sort(
    (left, right) =>
      left.name.localeCompare(right.name, "id") || left.price - right.price,
  );
}

function assertQuantity(quantity: number, allowZero: boolean): void {
  if (
    !Number.isSafeInteger(quantity) ||
    quantity < (allowZero ? 0 : 1)
  ) {
    throw new RangeError(
      `Kuantitas harus berupa bilangan bulat ${allowZero ? "non-negatif" : "positif"}.`,
    );
  }
}

export function addOrMergeOrderItem(
  items: OrderItem[],
  menuItem: MenuItem,
  quantity: number,
  addons: Addon[] = [],
): OrderItem[] {
  assertQuantity(quantity, false);
  if (!Number.isFinite(menuItem.price) || menuItem.price < 0) {
    throw new RangeError("Harga menu harus berupa angka non-negatif.");
  }

  const normalizedAddons = normalizeAddons(addons);
  const lineKey = getCartLineKey(menuItem.id, normalizedAddons);
  const existingIndex = items.findIndex(
    (item) => getCartLineKey(item.menuId, item.addons) === lineKey,
  );

  if (existingIndex >= 0) {
    const nextQuantity = items[existingIndex].qty + quantity;
    assertQuantity(nextQuantity, false);

    return items.map((item, index) =>
      index === existingIndex ? { ...item, qty: nextQuantity } : item,
    );
  }

  return [
    ...items,
    {
      menuId: menuItem.id,
      name: menuItem.name,
      category: menuItem.category,
      unitPrice: menuItem.price,
      qty: quantity,
      addons: normalizedAddons,
      note: "",
    },
  ];
}

export function setOrderItemNote(
  items: OrderItem[],
  lineKey: string,
  note: string,
): OrderItem[] {
  if (note.length > 200) {
    throw new RangeError("Catatan item maksimal 200 karakter.");
  }

  return items.map((item) =>
    getCartLineKey(item.menuId, item.addons) === lineKey
      ? { ...item, note }
      : item,
  );
}

export function setOrderItemQuantity(
  items: OrderItem[],
  lineKey: string,
  quantity: number,
): OrderItem[] {
  assertQuantity(quantity, true);

  return quantity <= 0
    ? items.filter((item) => getCartLineKey(item.menuId, item.addons) !== lineKey)
    : items.map((item) =>
        getCartLineKey(item.menuId, item.addons) === lineKey
          ? { ...item, qty: quantity }
          : item,
      );
}

export function replaceOrderItemConfiguration(
  items: OrderItem[],
  lineKey: string,
  menuItem: MenuItem,
  quantity: number,
  addons: Addon[],
  note = "",
): OrderItem[] {
  assertQuantity(quantity, true);
  const remainingItems = items.filter(
    (item) => getCartLineKey(item.menuId, item.addons) !== lineKey,
  );

  return quantity <= 0
    ? remainingItems
    : addOrMergeOrderItem(remainingItems, menuItem, quantity, addons).map(
        (item) =>
          getCartLineKey(item.menuId, item.addons) ===
          getCartLineKey(menuItem.id, addons)
            ? { ...item, note }
            : item,
      );
}