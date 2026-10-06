import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { createMockOrders } from "../../data/mock/orders";
import { OrderHistoryList } from "./order-history-list";

describe("daftar riwayat pesanan", () => {
  it("merender order mock, jumlah, waktu, dan status yang sesuai", () => {
    const orders = createMockOrders(new Date("2026-10-06T05:00:00.000Z"));
    const markup = renderToStaticMarkup(
      createElement(OrderHistoryList, { orders, onCancel: () => undefined }),
    );

    expect(markup).toContain("#012");
    expect(markup).toContain("Andi");
    expect(markup).toContain("Rp 22.000");
    expect(markup).toContain("Belum Bayar");
    expect(markup).toContain("#008");
    expect(markup).toContain("Joko");
    expect(markup).toContain("Dibatalkan");
  });

  it("hanya menampilkan aksi edit dan batal pada order belum bayar", () => {
    const orders = createMockOrders(new Date("2026-10-06T05:00:00.000Z"));
    const markup = renderToStaticMarkup(
      createElement(OrderHistoryList, { orders, onCancel: () => undefined }),
    );

    expect(markup.match(/>Edit<\/button>/g)).toHaveLength(1);
    expect(markup.match(/>Batalkan<\/button>/g)).toHaveLength(1);
    expect(markup).toContain("disabled=");
  });

  it("menampilkan empty state bila filter tidak menemukan pesanan", () => {
    const markup = renderToStaticMarkup(
      createElement(OrderHistoryList, {
        orders: [],
        onCancel: () => undefined,
      }),
    );

    expect(markup).toContain("Tidak ada pesanan yang cocok.");
  });
});
