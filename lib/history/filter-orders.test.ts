import { describe, expect, it } from "vitest";
import { createMockOrders } from "../../data/mock/orders";
import { filterHistoryOrders } from "./filter-orders";

const orders = createMockOrders(new Date("2026-10-06T05:00:00.000Z"));

describe("pencarian dan filter riwayat pesanan", () => {
  it("menampilkan semua status terbaru lebih dahulu", () => {
    expect(
      filterHistoryOrders(orders, "", "semua").map((order) => order.id),
    ).toEqual(["#012", "#011", "#010", "#009", "#008"]);
  });

  it("memfilter berdasarkan status lunas", () => {
    expect(
      filterHistoryOrders(orders, "", "lunas").map((order) => order.id),
    ).toEqual(["#011", "#010", "#009"]);
  });

  it("mencari nomor pesanan tanpa membedakan kapital", () => {
    expect(
      filterHistoryOrders(orders, "#008", "semua").map((order) => order.id),
    ).toEqual(["#008"]);
  });

  it("mencari nama pemesan dan nama item", () => {
    expect(
      filterHistoryOrders(orders, "andi", "semua").map((order) => order.id),
    ).toEqual(["#012"]);
    expect(
      filterHistoryOrders(orders, "ketan susu", "lunas").map(
        (order) => order.id,
      ),
    ).toEqual(["#010", "#009"]);
  });
});
