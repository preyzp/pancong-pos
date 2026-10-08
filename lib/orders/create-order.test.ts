import { describe, expect, it } from "vitest";
import { MOCK_MENU } from "../../data/mock/menu";
import { createMockOrders } from "../../data/mock/orders";
import type { OrderItem } from "../../types/pos";
import { buildUnpaidOrder } from "./create-order";

const item: OrderItem = {
  menuId: "pancong-coklat",
  name: "Nama lama",
  category: "pancong",
  unitPrice: 10000,
  qty: 2,
  addons: [{ name: "Extra Keju", price: 3000 }],
};

describe("pembuatan order belum bayar", () => {
  it("membuat order berikutnya dari snapshot harga item dan topping per unit", () => {
    const existingOrders = createMockOrders(
      new Date("2026-10-06T05:00:00.000Z"),
    );
    const result = buildUnpaidOrder(
      "  Andi  ",
      [item],
      MOCK_MENU,
      existingOrders,
      "Budi",
      new Date("2026-10-07T03:00:00.000Z"),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.order.id).toBe("#013");
    expect(result.order.customerName).toBe("Andi");
    expect(result.order.items[0]).toMatchObject({
      name: "Pancong Cokelat",
      unitPrice: 10000,
      qty: 2,
      addons: [{ name: "Extra Keju", price: 3000 }],
    });
    expect(result.order.subtotal).toBe(26000);
    expect(result.order.total).toBe(26000);
    expect(result.order.status).toBe("belum_bayar");
  });

  it("menolak order kosong atau dengan total nol", () => {
    const zeroPricedMenu = MOCK_MENU.map((menuItem) =>
      menuItem.id === item.menuId ? { ...menuItem, price: 0 } : menuItem,
    );
    const zeroPriceItem = {
      ...item,
      qty: 1,
      unitPrice: 0,
      addons: [],
    };

    expect(
      buildUnpaidOrder("Andi", [], MOCK_MENU, [], "Budi").ok,
    ).toBe(false);
    expect(
      buildUnpaidOrder(
        "Andi",
        [zeroPriceItem],
        zeroPricedMenu,
        [],
        "Budi",
      ).ok,
    ).toBe(false);
  });

  it("mempertahankan harga snapshot draft jika harga menu berubah sebelum order disimpan", () => {
    const changedMenu = MOCK_MENU.map((menuItem) =>
      menuItem.id === item.menuId ? { ...menuItem, price: 10000 } : menuItem,
    );
    const draftItem = { ...item, unitPrice: 8000 };
    const result = buildUnpaidOrder(
      "Andi",
      [draftItem],
      changedMenu,
      [],
      "Budi",
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.order.items[0].unitPrice).toBe(8000);
    expect(result.order.total).toBe(22000);
  });
});
