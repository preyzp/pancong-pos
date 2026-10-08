import { createStore } from "zustand/vanilla";
import type {
  Addon,
  MenuItem,
  Order,
  OrderItem,
  PaymentMethod,
} from "../types/pos";
import {
  addOrMergeOrderItem,
  setOrderItemNote,
  setOrderItemQuantity,
} from "../lib/orders/cart";
import { buildUnpaidOrder, type CreateOrderResult } from "../lib/orders/create-order";
import { calculatePriceSummary } from "../lib/orders/pricing";
import { validateDraftOrder } from "../lib/orders/validation";
import {
  orderPersistence,
  type OrderPersistence,
} from "../lib/orders/order-persistence";

export type OrderDraftState = {
  customerName: string;
  items: OrderItem[];
  draftId: string | null;
  orders: Order[];
  ordersInitialized: boolean;
  persistenceError: string | null;
  setCustomerName: (customerName: string) => void;
  addItem: (menuItem: MenuItem, quantity: number, addons?: Addon[]) => void;
  setItemNote: (lineKey: string, note: string) => void;
  setItemQuantity: (lineKey: string, quantity: number) => void;
  setDraftId: (draftId: string) => void;
  initializeOrders: (orders: Order[]) => void;
  setOrders: (orders: Order[]) => void;
  createOrderFromDraft: (
    menu: MenuItem[],
    cashier: string,
  ) => CreateOrderResult;
  updateUnpaidOrder: (updatedOrder: Order, menu: MenuItem[]) => boolean;
  markOrderPaid: (
    orderId: string,
    paymentMethod: PaymentMethod,
    paidAt?: Date,
  ) => boolean;
  clearDraft: () => void;
};

export function createOrderStore(persistence: OrderPersistence = orderPersistence) {
  const store = createStore<OrderDraftState>()((set) => ({
    customerName: "",
    items: [],
    draftId: null,
    orders: [],
    ordersInitialized: false,
    persistenceError: null,
    setCustomerName: (customerName) => set({ customerName }),
    addItem: (menuItem, quantity, addons = []) =>
      set((state) => {
        return { items: addOrMergeOrderItem(state.items, menuItem, quantity, addons) };
      }),
    setItemNote: (lineKey, note) =>
      set((state) => ({ items: setOrderItemNote(state.items, lineKey, note) })),
    setItemQuantity: (lineKey, quantity) =>
      set((state) => ({ items: setOrderItemQuantity(state.items, lineKey, quantity) })),
    setDraftId: (draftId) => set({ draftId }),
    initializeOrders: (orders) =>
      set((state) => {
        if (state.ordersInitialized) return state;

        return {
          orders: persistence.load() ?? orders,
          ordersInitialized: true,
        };
      }),
    setOrders: (orders) => set({ orders }),
    createOrderFromDraft: (menu, cashier) => {
      let result: CreateOrderResult = { ok: false, reason: "invalid_draft" };

      set((state) => {
        if (!state.draftId) return state;

        result = buildUnpaidOrder(
          state.customerName,
          state.items,
          menu,
          state.orders,
          cashier,
        );
        if (!result.ok) return state;

        return {
          orders: [result.order, ...state.orders],
          customerName: "",
          items: [],
          draftId: null,
        };
      });

      return result;
    },
    updateUnpaidOrder: (updatedOrder, menu) => {
      let didUpdate = false;

      set((state) => {
        const currentOrder = state.orders.find(
          (order) => order.id === updatedOrder.id,
        );
        const validationErrors = validateDraftOrder(
          updatedOrder.customerName,
          updatedOrder.items,
          menu,
        );

        if (
          !currentOrder ||
          currentOrder.status !== "belum_bayar" ||
          Object.keys(validationErrors).length > 0
        ) {
          return state;
        }

        const expectedSummary = calculatePriceSummary(updatedOrder.items, menu);
        if (
          updatedOrder.subtotal !== expectedSummary.subtotal ||
          updatedOrder.total !== expectedSummary.total
        ) {
          return state;
        }

        didUpdate = true;
        return {
          orders: state.orders.map((order) =>
            order.id === updatedOrder.id && order.status === "belum_bayar"
              ? {
                  ...updatedOrder,
                  id: currentOrder.id,
                  status: currentOrder.status,
                  createdAt: currentOrder.createdAt,
                  cashier: currentOrder.cashier,
                  paymentMethod: currentOrder.paymentMethod,
                  paidAt: currentOrder.paidAt,
                  cashReceived: currentOrder.cashReceived,
                  change: currentOrder.change,
                }
              : order,
          ),
        };
      });

      return didUpdate;
    },
    markOrderPaid: (orderId, paymentMethod, paidAt = new Date()) => {
      if (paymentMethod !== "tunai" && paymentMethod !== "qris") return false;

      let didUpdate = false;
      set((state) => {
        if (!state.ordersInitialized) return state;

        const currentOrder = state.orders.find(
          (order) => order.id === orderId,
        );
        if (!currentOrder || currentOrder.status !== "belum_bayar") {
          return state;
        }

        didUpdate = true;
        return {
          orders: state.orders.map((order) =>
            order.id === orderId && order.status === "belum_bayar"
              ? {
                  ...order,
                  status: "lunas",
                  paymentMethod,
                  paidAt: paidAt.toISOString(),
                }
              : order,
          ),
        };
      });

      return didUpdate;
    },
    clearDraft: () => set({ customerName: "", items: [], draftId: null }),
  }));

  store.subscribe((state, previousState) => {
    if (
      !state.ordersInitialized ||
      state.orders === previousState.orders
    ) {
      return;
    }

    try {
      persistence.save(state.orders);
      if (state.persistenceError) {
        store.setState({ persistenceError: null });
      }
    } catch {
      store.setState({
        persistenceError:
          "Perubahan pesanan belum tersimpan di perangkat ini.",
      });
    }
  });

  return store;
}

export const orderStore = createOrderStore();
