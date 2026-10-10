import { describe, expect, it } from "vitest";
import type { OrderItemAddon, MenuItem } from "../../types/pos";
import {
  addOrMergeOrderItem,
  replaceOrderItemConfiguration,
  setOrderItemNote,
  setOrderItemQuantity,
} from "./cart";
import { getCartLineKey } from "./pricing";

const menuItem: MenuItem = {
  id: "pancong-coklat",
  name: "Pancong Coklat",
  category: "pancong",
  price: 8000,
};

const extraKeju: OrderItemAddon = { name: "Extra Keju", price: 3000 };

describe("perubahan baris keranjang", () => {
  it("menggabungkan baris dengan konfigurasi add-on yang sama", () => {
    const first = addOrMergeOrderItem([], menuItem, 2, [extraKeju]);
    const merged = addOrMergeOrderItem(first, menuItem, 3, [extraKeju]);

    expect(merged).toHaveLength(1);
    expect(merged[0].qty).toBe(5);
  });

  it("memisahkan konfigurasi add-on yang berbeda", () => {
    const items = addOrMergeOrderItem([], menuItem, 2);
    const separate = addOrMergeOrderItem(items, menuItem, 1, [extraKeju]);

    expect(separate).toHaveLength(2);
  });

  it("mengubah kuantitas dan menghapus baris pada nol", () => {
    const items = addOrMergeOrderItem([], menuItem, 2);
    const lineKey = getCartLineKey(menuItem.id, []);

    expect(setOrderItemQuantity(items, lineKey, 4)[0].qty).toBe(4);
    expect(setOrderItemQuantity(items, lineKey, 0)).toEqual([]);
  });

  it("menyimpan catatan pada baris keranjang dan membatasi panjangnya", () => {
    const items = addOrMergeOrderItem([], menuItem, 2);
    const lineKey = getCartLineKey(menuItem.id, []);

    expect(setOrderItemNote(items, lineKey, "Jangan terlalu manis")[0].note).toBe(
      "Jangan terlalu manis",
    );
    expect(() => setOrderItemNote(items, lineKey, "a".repeat(201))).toThrow(
      RangeError,
    );
  });

  it("menghapus item pada kuantitas satu dan menolak kuantitas negatif atau pecahan", () => {
    const items = addOrMergeOrderItem([], menuItem, 1);
    const lineKey = getCartLineKey(menuItem.id, []);

    expect(setOrderItemQuantity(items, lineKey, 0)).toEqual([]);
    expect(() => setOrderItemQuantity(items, lineKey, -1)).toThrow(RangeError);
    expect(() => addOrMergeOrderItem([], menuItem, 0)).toThrow(RangeError);
    expect(() => addOrMergeOrderItem([], menuItem, 1.5)).toThrow(RangeError);
  });

  it("mengganti konfigurasi add-on dan menggabungkan jika cocok dengan baris lain", () => {
    const items = setOrderItemNote(
      addOrMergeOrderItem([], menuItem, 2),
      getCartLineKey(menuItem.id, []),
      "Potong kecil",
    );
    const customized = replaceOrderItemConfiguration(
      items,
      getCartLineKey(menuItem.id, []),
      menuItem,
      2,
      [extraKeju],
      "Potong kecil",
    );

    expect(customized).toHaveLength(1);
    expect(customized[0].addons).toEqual([extraKeju]);
    expect(customized[0].note).toBe("Potong kecil");
  });
});