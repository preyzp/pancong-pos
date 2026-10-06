import { createStore } from "zustand/vanilla";
import type { Addon, MenuItem, OrderItem } from "../types/pos";
import { getCartLineKey } from "../lib/orders/pricing";

export type OrderDraftState = {
  customerName: string;
  items: OrderItem[];
  draftId: string | null;
  setCustomerName: (customerName: string) => void;
  addItem: (menuItem: MenuItem, quantity: number, addons?: Addon[]) => void;
  setItemQuantity: (lineKey: string, quantity: number) => void;
  setDraftId: (draftId: string) => void;
  clearDraft: () => void;
};

export function createOrderStore() {
  return createStore<OrderDraftState>()((set) => ({
    customerName: "",
    items: [],
    draftId: null,
    setCustomerName: (customerName) => set({ customerName }),
    addItem: (menuItem, quantity, addons = []) =>
      set((state) => {
        const normalizedAddons = [...addons].sort(
          (left, right) =>
            left.name.localeCompare(right.name, "id") ||
            left.price - right.price,
        );
        const lineKey = getCartLineKey(menuItem.id, normalizedAddons);
        const existingIndex = state.items.findIndex(
          (item) => getCartLineKey(item.menuId, item.addons) === lineKey,
        );

        if (existingIndex >= 0) {
          return {
            items: state.items.map((item, index) =>
              index === existingIndex
                ? { ...item, qty: item.qty + quantity }
                : item,
            ),
          };
        }

        return {
          items: [
            ...state.items,
            {
              menuId: menuItem.id,
              name: menuItem.name,
              category: menuItem.category,
              unitPrice: menuItem.price,
              qty: quantity,
              addons: normalizedAddons,
            },
          ],
        };
      }),
    setItemQuantity: (lineKey, quantity) =>
      set((state) => ({
        items:
          quantity <= 0
            ? state.items.filter(
                (item) => getCartLineKey(item.menuId, item.addons) !== lineKey,
              )
            : state.items.map((item) =>
                getCartLineKey(item.menuId, item.addons) === lineKey
                  ? { ...item, qty: quantity }
                  : item,
              ),
      })),
    setDraftId: (draftId) => set({ draftId }),
    clearDraft: () => set({ customerName: "", items: [], draftId: null }),
  }));
}

export const orderStore = createOrderStore();
