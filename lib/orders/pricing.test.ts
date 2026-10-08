import { describe, expect, it } from "vitest";
import type { Addon, MenuItem } from "../../types/pos";
import { calculateCartSubtotal, calculateLineSubtotal } from "./pricing";

const pancongCoklat: MenuItem = {
  id: "pancong-coklat",
  name: "Pancong Coklat",
  category: "pancong",
  price: 8000,
  hasToppings: true,
};

const extraKeju: Addon = { name: "Extra Keju", price: 3000 };

describe("pricing pesanan", () => {
  it("menghitung subtotal satu menu dari harga menu", () => {
    expect(calculateLineSubtotal(pancongCoklat, 1, [])).toBe(8000);
  });

  it("mengalikan harga menu dengan kuantitas", () => {
    expect(calculateLineSubtotal(pancongCoklat, 3, [])).toBe(24000);
  });

  it("menerapkan harga add-on pada setiap kuantitas menu", () => {
    expect(calculateLineSubtotal(pancongCoklat, 2, [extraKeju])).toBe(22000);
  });

  it("menghitung subtotal keranjang menggunakan snapshot harga item", () => {
    expect(
      calculateCartSubtotal(
        [
          {
            menuId: pancongCoklat.id,
            name: pancongCoklat.name,
            category: pancongCoklat.category,
            unitPrice: 8000,
            qty: 2,
            addons: [extraKeju],
          },
        ],
        [{ ...pancongCoklat, price: 10000 }],
      ),
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

    expect(calculateCartSubtotal([orderItem], [{ ...pancongCoklat, price: 10000 }]))
      .toBe(22000);
  });
});
