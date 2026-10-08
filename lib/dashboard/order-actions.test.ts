import { describe, expect, it } from "vitest";
import { createMockOrders } from "../../data/mock/orders";
import { cancelUnpaidOrder } from "./order-actions";

describe("aksi pesanan pada Dashboard", () => {
  it("membatalkan pesanan belum bayar saja tanpa mengubah data sumber", () => {
    const orders = createMockOrders(new Date("2026-10-06T05:00:00.000Z"));

    const updatedOrders = cancelUnpaidOrder(orders, "#012");

    expect(updatedOrders.find((order) => order.id === "#012")?.status).toBe(
      "dibatalkan",
    );
    expect(orders.find((order) => order.id === "#012")?.status).toBe(
      "belum_bayar",
    );
    expect(updatedOrders.find((order) => order.id === "#011")?.status).toBe(
      "lunas",
    );
    expect(updatedOrders.find((order) => order.id === "#008")?.status).toBe(
      "dibatalkan",
    );
  });

  it("tidak membatalkan order yang sudah lunas", () => {
    const orders = createMockOrders(new Date("2026-10-06T05:00:00.000Z"));
    const paidOrders = cancelUnpaidOrder(orders, "#011");

    expect(paidOrders.find((order) => order.id === "#011")?.status).toBe(
      "lunas",
    );
  });
});
