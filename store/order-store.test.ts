import { describe, expect, it } from "vitest";
import type { Addon, MenuItem } from "../types/pos";
import { createOrderStore } from "./order-store";

const pancongCoklat: MenuItem = {
  id: "pancong-coklat",
  name: "Pancong Coklat",
  category: "pancong",
  price: 8000,
  hasToppings: true,
};

const extraKeju: Addon = { name: "Extra Keju", price: 3000 };

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
});
