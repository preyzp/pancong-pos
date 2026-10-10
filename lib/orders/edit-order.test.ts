import { describe, expect, it } from "vitest";
import { createMockOrders } from "../../data/mock/orders";
import { buildEditedOrder, createEditableOrder } from "./edit-order";

const orders = createMockOrders(new Date("2026-10-06T05:00:00.000Z"));
const pendingOrder = orders.find((order) => order.id === "#012")!;

describe("edit pesanan", () => {
  it("memuat nama dan baris item dari order yang dipilih", () => {
    const editable = createEditableOrder(pendingOrder);

    expect(editable.customerName).toBe("Andi");
    expect(editable.items.map((item) => item.menuId)).toEqual([
      "pancong-coklat",
      "ketan-susu-original",
    ]);
  });

  it("mempertahankan add-on awal pada data edit", () => {
    const orderWithAddon = {
      ...pendingOrder,
      items: [{ ...pendingOrder.items[0], addons: [{ name: "Extra Keju", price: 3000 }] }],
    };

    expect(createEditableOrder(orderWithAddon).items[0].addons).toEqual([
      { name: "Extra Keju", price: 3000 },
    ]);
  });

  it("mengubah nama, kuantitas, add-on, dan menghitung ulang total", () => {
    const editable = createEditableOrder(pendingOrder);
    editable.customerName = "Andi Baru";
    editable.items[0].qty = 3;
    editable.items[0].addons = [{ name: "Extra Keju", price: 3000 }];

    const updatedOrder = buildEditedOrder(pendingOrder, editable);

    expect(updatedOrder.customerName).toBe("Andi Baru");
    expect(updatedOrder.items[0].qty).toBe(3);
    expect(updatedOrder.subtotal).toBe(39000);
    expect(updatedOrder.total).toBe(39000);
    expect(updatedOrder.status).toBe("belum_bayar");
    expect(pendingOrder.total).toBe(22000);
  });

  it("membiarkan order asli utuh saat draft edit dibatalkan atau diubah berulang", () => {
    const originalItems = pendingOrder.items.map((item) => ({
      ...item,
      addons: item.addons.map((addon) => ({ ...addon })),
    }));
    const editable = createEditableOrder(pendingOrder);
    editable.items[0].qty = 3;

    const firstSave = buildEditedOrder(pendingOrder, editable);
    const secondDraft = createEditableOrder(firstSave);
    secondDraft.items[0].qty = 4;
    const secondSave = buildEditedOrder(firstSave, secondDraft);

    expect(pendingOrder.items).toEqual(originalItems);
    expect(pendingOrder.total).toBe(22000);
    expect(firstSave.id).toBe(pendingOrder.id);
    expect(secondSave.id).toBe(pendingOrder.id);
    expect(secondSave.total).toBe(38000);
  });

  it("mempertahankan harga snapshot order dan menghitung ulang saat add-on diedit", () => {
    const editable = createEditableOrder(pendingOrder);
    editable.items[0].addons = [{ name: "Keju", price: 3000 }];

    const updatedOrder = buildEditedOrder(pendingOrder, editable);

    expect(updatedOrder.items[0].unitPrice).toBe(8000);
    expect(updatedOrder.subtotal).toBe(28000);
  });
});