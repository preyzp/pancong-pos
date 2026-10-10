import { describe, expect, it } from "vitest";
import { MOCK_MENU } from "../../data/mock/menu";
import { createMockOrders } from "../../data/mock/orders";
import {
  calculateBestSellersToday,
  calculateDashboardKpis,
  calculateSalesOverview,
  getJakartaDateKey,
  getRecentOrdersToday,
} from "./metrics";

const asOf = new Date("2026-10-06T05:00:00.000Z");
const orders = createMockOrders(asOf);

describe("metrik Dashboard untuk tanggal Asia/Jakarta", () => {
  it("menjumlahkan penjualan dari pesanan lunas hari ini", () => {
    expect(calculateDashboardKpis(orders, asOf).salesToday).toBe(68000);
  });

  describe("ringkasan Penjualan", () => {
    it("menghitung omzet lunas hari ini, rata-rata, dan penjualan per menu", () => {
      const overview = calculateSalesOverview(orders, MOCK_MENU, asOf);

      expect(overview.salesToday).toBe(68000);
      expect(overview.paidOrdersToday).toBe(3);
      expect(overview.averageOrderValue).toBe(Math.round(68000 / 3));
      expect(overview.menuSalesToday).toEqual([
        {
          menuId: "ketan-susu-original",
          name: "Ketan Susu Original",
          category: "ketan_susu",
          qtySold: 6,
          total: 36000,
        },
        {
          menuId: "pancong-original",
          name: "Pancong Original",
          category: "pancong",
          qtySold: 4,
          total: 32000,
        },
      ]);
      expect(
        overview.menuSalesToday.reduce((total, item) => total + item.total, 0),
      ).toBeLessThanOrEqual(overview.salesToday);
    });

    it("menghitung omzet tujuh tanggal Jakarta berturut-turut termasuk hari ini", () => {
      const overview = calculateSalesOverview(orders, MOCK_MENU, asOf);

      expect(overview.lastSevenDays.map((day) => day.date)).toEqual([
        "2026-09-30",
        "2026-10-01",
        "2026-10-02",
        "2026-10-03",
        "2026-10-04",
        "2026-10-05",
        "2026-10-06",
      ]);
      expect(overview.lastSevenDays[6]).toMatchObject({
        date: "2026-10-06",
        total: 68000,
        orderCount: 3,
      });
    });

    it("membatasi agregat per menu ke total pesanan dan mengecualikan belum bayar", () => {
      const inconsistentPaidOrder = {
        ...orders[1],
        total: 1000,
        items: [
          {
            ...orders[1].items[0],
            unitPrice: 5000,
            qty: 2,
            addons: [{ name: "Extra", price: 1000 }],
          },
        ],
      };
      const overview = calculateSalesOverview(
        [inconsistentPaidOrder, orders[0]],
        MOCK_MENU,
        asOf,
      );

      expect(overview.salesToday).toBe(1000);
      expect(overview.paidOrdersToday).toBe(1);
      expect(overview.menuSalesToday[0].total).toBe(1000);
      expect(
        overview.menuSalesToday.reduce((total, item) => total + item.total, 0),
      ).toBeLessThanOrEqual(overview.salesToday);
    });

    it("mengembalikan ringkasan nol saat belum ada pesanan lunas", () => {
      const overview = calculateSalesOverview(
        orders,
        MOCK_MENU,
        new Date("2026-10-06T17:00:00.000Z"),
      );

      expect(overview.salesToday).toBe(0);
      expect(overview.paidOrdersToday).toBe(0);
      expect(overview.averageOrderValue).toBe(0);
      expect(overview.menuSalesToday).toEqual([]);
      expect(overview.lastSevenDays).toHaveLength(7);
      expect(overview.lastSevenDays[6].total).toBe(0);
    });
  });

  it("menghitung pesanan hari ini tanpa pesanan dibatalkan", () => {
    expect(calculateDashboardKpis(orders, asOf).ordersToday).toBe(4);
  });

  it("menghitung pesanan lunas hari ini", () => {
    expect(calculateDashboardKpis(orders, asOf).paidToday).toBe(3);
  });

  it("menghitung pesanan belum bayar hari ini", () => {
    expect(calculateDashboardKpis(orders, asOf).unpaidToday).toBe(1);
  });

  it("mengecualikan pesanan dibatalkan dari pesanan terbaru", () => {
    expect(
      getRecentOrdersToday(orders, asOf).map((order) => order.id),
    ).not.toContain("#008");
  });

  it("memeringkat menu lunas hari ini berdasarkan jumlah terjual", () => {
    expect(calculateBestSellersToday(orders, MOCK_MENU, asOf)).toEqual([
      {
        id: "ketan-susu-original",
        name: "Ketan Susu Original",
        category: "ketan_susu",
        qtySold: 6,
      },
      {
        id: "pancong-original",
        name: "Pancong Original",
        category: "pancong",
        qtySold: 4,
      },
    ]);
  });

  it("mengurutkan pesanan terbaru berdasarkan waktu menurun", () => {
    expect(getRecentOrdersToday(orders, asOf).map((order) => order.id)).toEqual(
      ["#012", "#011", "#010", "#009"],
    );
  });

  it("menghasilkan metrik kosong untuk tanggal Jakarta yang berbeda", () => {
    const nextJakartaDay = new Date("2026-10-06T17:00:00.000Z");

    expect(getJakartaDateKey(asOf)).toBe("2026-10-06");
    expect(getJakartaDateKey(nextJakartaDay)).toBe("2026-10-07");
    expect(calculateDashboardKpis(orders, nextJakartaDay)).toEqual({
      salesToday: 0,
      ordersToday: 0,
      paidToday: 0,
      unpaidToday: 0,
    });
    expect(
      calculateBestSellersToday(orders, MOCK_MENU, nextJakartaDay),
    ).toEqual([]);
    expect(getRecentOrdersToday(orders, nextJakartaDay)).toEqual([]);
  });

  it("memetakan Pancong generik pada contoh ke Pancong Original", () => {
    const pancongItems = orders
      .filter((order) => order.id === "#011" || order.id === "#009")
      .flatMap((order) => order.items)
      .filter((item) => item.category === "pancong");

    expect(pancongItems).toHaveLength(2);
    expect(pancongItems.map((item) => item.menuId)).toEqual([
      "pancong-original",
      "pancong-original",
    ]);
    expect(pancongItems.map((item) => item.qty)).toEqual([2, 2]);
  });
});
