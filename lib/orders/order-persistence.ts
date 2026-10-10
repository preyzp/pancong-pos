import type { OrderItemAddon, Order, OrderItem, OrderStatus } from "../../types/pos";

const STORAGE_KEY = "pancong-pos/orders";
const STORAGE_VERSION = 1;

export type OrderPersistence = {
  load: () => Order[] | null;
  save: (orders: Order[]) => void;
};

type StorageLike = Pick<Storage, "getItem" | "setItem">;

type StoredOrders = {
  version: number;
  data: Order[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isOrderItemAddon(value: unknown): value is OrderItemAddon {
  return (
    isRecord(value) &&
    typeof value.name === "string" &&
    typeof value.price === "number" &&
    Number.isFinite(value.price) &&
    value.price >= 0 &&
    (value.addonId === undefined ||
      (typeof value.addonId === "string" && value.addonId.length > 0)) &&
    (value.qty === undefined ||
      (typeof value.qty === "number" &&
        Number.isSafeInteger(value.qty) &&
        value.qty > 0))
  );
}

function isOrderItem(value: unknown): value is OrderItem {
  return (
    isRecord(value) &&
    typeof value.menuId === "string" &&
    typeof value.name === "string" &&
    typeof value.category === "string" &&
    value.category.length > 0 &&
    typeof value.unitPrice === "number" &&
    Number.isFinite(value.unitPrice) &&
    value.unitPrice >= 0 &&
    typeof value.qty === "number" &&
    Number.isSafeInteger(value.qty) &&
    value.qty > 0 &&
    Array.isArray(value.addons) &&
    value.addons.every(isOrderItemAddon) &&
    (value.note === undefined ||
      (typeof value.note === "string" && value.note.length <= 200))
  );
}

function isOrderStatus(value: unknown): value is OrderStatus {
  return (
    value === "baru" ||
    value === "belum_bayar" ||
    value === "lunas" ||
    value === "dibatalkan"
  );
}

function isOrder(value: unknown): value is Order {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.customerName !== "string" ||
    !Array.isArray(value.items) ||
    value.items.length === 0 ||
    !value.items.every(isOrderItem) ||
    typeof value.subtotal !== "number" ||
    !Number.isFinite(value.subtotal) ||
    value.subtotal < 0 ||
    typeof value.total !== "number" ||
    !Number.isFinite(value.total) ||
    value.total <= 0 ||
    !isOrderStatus(value.status) ||
    typeof value.cashier !== "string" ||
    typeof value.createdAt !== "string" ||
    !Number.isFinite(Date.parse(value.createdAt))
  ) {
    return false;
  }

  return (
    (value.paymentMethod === undefined ||
      value.paymentMethod === "tunai" ||
      value.paymentMethod === "qris") &&
    (value.paidAt === undefined ||
      (typeof value.paidAt === "string" &&
        Number.isFinite(Date.parse(value.paidAt)))) &&
    (value.cashReceived === undefined ||
      (typeof value.cashReceived === "number" &&
        Number.isFinite(value.cashReceived) &&
        value.cashReceived >= 0)) &&
    (value.change === undefined ||
      (typeof value.change === "number" &&
        Number.isFinite(value.change) &&
        value.change >= 0))
  );
}

function isStoredOrders(value: unknown): value is StoredOrders {
  return (
    isRecord(value) &&
    value.version === STORAGE_VERSION &&
    Array.isArray(value.data) &&
    value.data.every(isOrder)
  );
}

function getBrowserStorage(): StorageLike | null {
  return typeof window === "undefined" ? null : window.localStorage;
}

export function createOrderPersistence(
  getStorage: () => StorageLike | null = getBrowserStorage,
): OrderPersistence {
  return {
    load() {
      try {
        const serialized = getStorage()?.getItem(STORAGE_KEY);
        if (!serialized) return null;

        const parsed: unknown = JSON.parse(serialized);
        return isStoredOrders(parsed) ? parsed.data : null;
      } catch {
        return null;
      }
    },
    save(orders) {
      const storage = getStorage();
      if (!storage) return;

      storage.setItem(
        STORAGE_KEY,
        JSON.stringify({ version: STORAGE_VERSION, data: orders }),
      );
    },
  };
}

export const orderPersistence = createOrderPersistence();
