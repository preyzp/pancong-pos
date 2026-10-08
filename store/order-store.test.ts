import { describe, expect, it } from "vitest";
import { createMockOrders } from "../data/mock/orders";
import { MOCK_MENU } from "../data/mock/menu";
import type { Addon, MenuItem } from "../types/pos";
import { createOrderPersistence } from "../lib/orders/order-persistence";
import { createOrderStore } from "./order-store";

const pancongCoklat: MenuItem = {
  id: "pancong-coklat",
  name: "Pancong Coklat",
  category: "pancong",
  price: 8000,
  hasToppings: true,
};

const extraKeju: Addon = { name: "Extra Keju", price: 3000 };

class MemoryStorage {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

describe("keranjang draft pesanan", () => {
  it("menggabungkan menu dengan konfigurasi add-on identik tanpa bergantung urutan", () => {
    const store = createOrderStore();
    const kacang: Addon = { name: "Kacang", price: 2000 };

    store.getState().addItem(pancongCoklat, 1, [extraKeju, kacang]);
    store.getState().addItem(pancongCoklat, 2, [kacang, extraKeju]);

    expect(store.getState().items).toHaveLength(1);
    expect(store.getState().items[0].qty).toBe(3);
  });

  it("memisahkan konfigurasi add-on yang berbeda", () => {
    const store = createOrderStore();

    store.getState().addItem(pancongCoklat, 2);
    store.getState().addItem(pancongCoklat, 1, [extraKeju]);

    expect(store.getState().items).toHaveLength(2);
    expect(store.getState().items.map((item) => item.qty)).toEqual([2, 1]);
  });

  it("menghapus baris saat kuantitas diturunkan menjadi nol", () => {
    const store = createOrderStore();
    store.getState().addItem(pancongCoklat, 1);

    store
      .getState()
      .setItemQuantity(
        JSON.stringify({ menuId: pancongCoklat.id, addons: [] }),
        0,
      );

    expect(store.getState().items).toEqual([]);
  });

  it("membuat order belum bayar satu kali dan mengosongkan draft setelah konfirmasi", () => {
    const store = createOrderStore();
    const orders = createMockOrders(new Date("2026-10-06T05:00:00.000Z"));
    store.getState().initializeOrders(orders);
    store.getState().setCustomerName("  Andi Baru  ");
    store.getState().setDraftId("draft-1");
    store.getState().addItem(pancongCoklat, 2, [extraKeju]);
    store
      .getState()
      .setItemNote(
        JSON.stringify({
          menuId: pancongCoklat.id,
          addons: [extraKeju],
        }),
        "Jangan terlalu manis",
      );

    const result = store.getState().createOrderFromDraft(MOCK_MENU, "Budi");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.order.id).toBe("#013");
    expect(result.order.customerName).toBe("Andi Baru");
    expect(result.order.status).toBe("belum_bayar");
    expect(result.order.total).toBe(22000);
    expect(result.order.items[0].note).toBe("Jangan terlalu manis");
    expect(store.getState().orders[0]).toEqual(result.order);
    expect(store.getState().draftId).toBeNull();
    expect(store.getState().items).toEqual([]);
    expect(store.getState().customerName).toBe("");

    const secondAttempt = store.getState().createOrderFromDraft(
      MOCK_MENU,
      "Budi",
    );
    expect(secondAttempt).toEqual({ ok: false, reason: "invalid_draft" });
    expect(store.getState().orders.filter((order) => order.id === "#013"))
      .toHaveLength(1);
  });

  it("memperbarui order belum bayar dan menolak perubahan order lunas", () => {
    const store = createOrderStore();
    const orders = createMockOrders(new Date("2026-10-06T05:00:00.000Z"));
    store.getState().initializeOrders(orders);
    const unpaidOrder = orders.find((order) => order.id === "#012")!;
    const paidOrder = orders.find((order) => order.id === "#011")!;

    expect(
      store.getState().updateUnpaidOrder({
        ...unpaidOrder,
        customerName: "Andi Diperbarui",
      }, MOCK_MENU),
    ).toBe(true);
    expect(
      store.getState().orders.find((order) => order.id === "#012")?.customerName,
    ).toBe("Andi Diperbarui");
    expect(
      store.getState().updateUnpaidOrder({
        ...paidOrder,
        customerName: "Tidak Boleh Diubah",
      }, MOCK_MENU),
    ).toBe(false);
    expect(
      store.getState().orders.find((order) => order.id === "#011")?.customerName,
    ).toBe("Siti");
  });

  it.each(["tunai", "qris"] as const)(
    "menandai order lunas dengan metode %s",
    (method) => {
      const store = createOrderStore();
      const orders = createMockOrders(new Date("2026-10-06T05:00:00.000Z"));
      store.getState().initializeOrders(orders);
      const unpaidOrder = orders.find((order) => order.id === "#012")!;
      const paidAt = new Date("2026-10-07T04:00:00.000Z");

      expect(store.getState().markOrderPaid(unpaidOrder.id, method, paidAt)).toBe(
        true,
      );
      expect(
        store.getState().orders.find((order) => order.id === unpaidOrder.id),
      ).toMatchObject({
        status: "lunas",
        paymentMethod: method,
        paidAt: paidAt.toISOString(),
        total: unpaidOrder.total,
      });
    },
  );

  it("menolak pembayaran order lunas, order hilang, state belum hydrate, dan metode invalid", () => {
    const store = createOrderStore();
    expect(store.getState().markOrderPaid("#012", "tunai")).toBe(false);

    const orders = createMockOrders(new Date("2026-10-06T05:00:00.000Z"));
    store.getState().initializeOrders(orders);
    expect(store.getState().markOrderPaid("#404", "tunai")).toBe(false);
    expect(
      store.getState().markOrderPaid("#012", "invalid" as "tunai"),
    ).toBe(false);
    expect(store.getState().markOrderPaid("#011", "qris")).toBe(false);
    expect(store.getState().markOrderPaid("#012", "qris")).toBe(true);
    expect(store.getState().markOrderPaid("#012", "tunai")).toBe(false);
  });

  it("menolak update dengan subtotal palsu dan mempertahankan order lama", () => {
    const store = createOrderStore();
    const orders = createMockOrders(new Date("2026-10-06T05:00:00.000Z"));
    store.getState().initializeOrders(orders);
    const unpaidOrder = orders.find((order) => order.id === "#012")!;

    expect(
      store.getState().updateUnpaidOrder(
        { ...unpaidOrder, total: 1 },
        MOCK_MENU,
      ),
    ).toBe(false);
    expect(store.getState().orders[0]).toEqual(unpaidOrder);
  });

  it("memuat ulang order tersimpan dan mempertahankan edit untuk history", () => {
    const storage = new MemoryStorage();
    const persistence = createOrderPersistence(() => storage);
    const initialOrders = createMockOrders(
      new Date("2026-10-06T05:00:00.000Z"),
    );
    const firstStore = createOrderStore(persistence);
    firstStore.getState().initializeOrders(initialOrders);
    firstStore.getState().setCustomerName("Order Lokal");
    firstStore.getState().setDraftId("draft-lokal");
    firstStore.getState().addItem(pancongCoklat, 2, [extraKeju]);
    firstStore
      .getState()
      .setItemNote(
        JSON.stringify({
          menuId: pancongCoklat.id,
          addons: [extraKeju],
        }),
        "Potong lebih kecil",
      );
    const created = firstStore
      .getState()
      .createOrderFromDraft(MOCK_MENU, "Budi");
    expect(created.ok).toBe(true);

    const reloadedStore = createOrderStore(persistence);
    reloadedStore.getState().initializeOrders(initialOrders);
    expect(reloadedStore.getState().orders).toEqual(firstStore.getState().orders);
    expect(reloadedStore.getState().orders[0].items[0].note).toBe(
      "Potong lebih kecil",
    );

    const order = reloadedStore.getState().orders[0];
    const updated = {
      ...order,
      customerName: "Order Lokal Diedit",
      items: order.items.map((item) => ({ ...item, qty: item.qty + 1 })),
      subtotal: 33000,
      total: 33000,
    };
    expect(reloadedStore.getState().updateUnpaidOrder(updated, MOCK_MENU)).toBe(
      true,
    );

    const afterRefreshStore = createOrderStore(persistence);
    afterRefreshStore.getState().initializeOrders(initialOrders);
    expect(afterRefreshStore.getState().orders[0]).toMatchObject({
      id: order.id,
      customerName: "Order Lokal Diedit",
      total: 33000,
    });

    expect(afterRefreshStore.getState().orders).toHaveLength(
      initialOrders.length + 1,
    );
  });

  it("memuat kembali pembayaran sebagai lunas setelah store dibuat ulang", () => {
    const storage = new MemoryStorage();
    const persistence = createOrderPersistence(() => storage);
    const initialOrders = createMockOrders(
      new Date("2026-10-06T05:00:00.000Z"),
    );
    const store = createOrderStore(persistence);
    store.getState().initializeOrders(initialOrders);
    expect(store.getState().markOrderPaid("#012", "qris")).toBe(true);

    const afterRefresh = createOrderStore(persistence);
    afterRefresh.getState().initializeOrders(initialOrders);

    expect(afterRefresh.getState().orders[0]).toMatchObject({
      id: "#012",
      status: "lunas",
      paymentMethod: "qris",
    });
    expect(afterRefresh.getState().orders[0].paidAt).toBeTruthy();
    expect(afterRefresh.getState().markOrderPaid("#012", "tunai")).toBe(false);
  });

  it("menginisialisasi empty storage dengan state awal yang tersedia", () => {
    const persistence = createOrderPersistence(() => new MemoryStorage());
    const store = createOrderStore(persistence);

    store.getState().initializeOrders([]);

    expect(store.getState().orders).toEqual([]);
    expect(store.getState().ordersInitialized).toBe(true);
  });

  it("menggunakan data awal jika storage berisi JSON korup", () => {
    const storage = new MemoryStorage();
    storage.setItem("pancong-pos/orders", "{broken");
    const store = createOrderStore(createOrderPersistence(() => storage));
    const initialOrders = createMockOrders(
      new Date("2026-10-06T05:00:00.000Z"),
    );

    expect(() => store.getState().initializeOrders(initialOrders)).not.toThrow();
    expect(store.getState().orders).toEqual(initialOrders);
  });

  it("mempertahankan update di store dan melaporkan kegagalan saat save storage", () => {
    let storageUnavailable = true;
    const store = createOrderStore({
      load: () => null,
      save: () => {
        if (storageUnavailable) throw new Error("Storage unavailable");
      },
    });
    const orders = createMockOrders(new Date("2026-10-06T05:00:00.000Z"));

    store.getState().initializeOrders(orders);
    expect(store.getState().orders).toEqual(orders);
    expect(store.getState().persistenceError).toBeTruthy();

    storageUnavailable = false;
    store.getState().setOrders(orders.slice(1));
    expect(store.getState().persistenceError).toBeNull();
  });
});
