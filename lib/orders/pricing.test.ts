import { describe, expect, it } from "vitest";
import type { OrderItemAddon, MenuItem } from "../../types/pos";
import { calculateCartSubtotal, calculateLineSubtotal } from "./pricing";

const pancongCoklat: MenuItem = {
  id: "pancong-coklat",
  name: "Pancong Coklat",
  category: "pancong",
  price: 8000,
};

const extraKeju: OrderItemAddon = { name: "Extra Keju", price: 3000 };

describe("pricing pesanan", () => {
  it("menghitung subtotal satu menu dari harga menu", () => {
    expect(calculateLineSubtotal(pancongCoklat, 1, [])).toBe(8000);
  });

  it("memberi error eksplisit jika menu untuk menghitung subtotal tidak tersedia", () => {
    expect(() => calculateLineSubtotal(undefined, 1, [])).toThrow(
      "Menu item tidak tersedia untuk menghitung subtotal.",
    );
  });

  it("mengalikan harga menu dengan kuantitas", () => {
    expect(calculateLineSubtotal(pancongCoklat, 3, [])).toBe(24000);
  });

  it("menerapkan harga add-on pada setiap kuantitas menu", () => {
    expect(calculateLineSubtotal(pancongCoklat, 2, [extraKeju])).toBe(22000);
  });

  it("menghitung subtotal keranjang menggunakan snapshot harga item", () => {
    expect(
      calculateCartSubtotal([
        {
          menuId: pancongCoklat.id,
          name: pancongCoklat.name,
          category: pancongCoklat.category,
          unitPrice: 8000,
          qty: 2,
          addons: [extraKeju],
        },
      ]),
    ).toBe(22000);
  });

  it("menghitung total dari unit price snapshot tanpa mengubahnya saat harga menu berubah", () => {
    const orderItem = {
      menuId: pancongCoklat.id,
      name: pancongCoklat.name,
      category: pancongCoklat.category,
      unitPrice: 8000,
      qty: 2,
      addons: [extraKeju],
    };

    expect(calculateCartSubtotal([orderItem])).toBe(22000);
  });

  it("menghitung subtotal dari snapshot jika menu item sudah tidak tersedia", () => {
    const staleOrderItem = {
      menuId: "menu-yang-sudah-dihapus",
      name: "Pancong Cokelat",
      category: "pancong",
      unitPrice: 8000,
      qty: 2,
      addons: [extraKeju],
    };

    expect(calculateCartSubtotal([staleOrderItem])).toBe(22000);
  });

  it("menghitung Add-on per unit menu memakai jumlah snapshot dan default 1 untuk data lama", () => {
    const meses: OrderItemAddon = { addonId: "meses", name: "Meses", price: 2000, qty: 2 };

    expect(calculateLineSubtotal(pancongCoklat, 3, [meses, extraKeju])).toBe(
      (8000 + 2000 * 2 + 3000) * 3,
    );
    expect(
      calculateCartSubtotal([
        {
          menuId: pancongCoklat.id,
          name: pancongCoklat.name,
          category: pancongCoklat.category,
          unitPrice: 8000,
          qty: 2,
          addons: [{ addonId: "keju", name: "Keju", price: 3000, qty: 1 }],
        },
      ]),
    ).toBe(22000);
  });
});
