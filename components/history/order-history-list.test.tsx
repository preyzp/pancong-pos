import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { createMockOrders } from "../../data/mock/orders";
import { OrderHistoryList } from "./order-history-list";

describe("daftar riwayat pesanan", () => {
  it("merender order mock, jumlah, waktu, dan status yang sesuai", () => {
    const orders = createMockOrders(new Date("2026-10-06T05:00:00.000Z"));
    const markup = renderToStaticMarkup(
      createElement(OrderHistoryList, {
        orders,
        onCancel: () => undefined,
        onEdit: () => undefined,
      }),
    );

    expect(markup).toContain("#012");
    expect(markup).toContain("Andi");
    expect(markup).toContain('href="/orders/%23012"');
    expect(markup).toContain('aria-label="Lihat detail pesanan #012 atas nama Andi"');
    expect(markup).toContain("lucide-chevron-right shrink-0");
    expect(markup).toContain("Rp 22.000");
    expect(markup).toContain("Belum Bayar");
    expect(markup).toContain("#008");
    expect(markup).toContain("Joko");
    expect(markup).toContain("Dibatalkan");
  });

  it("hanya menampilkan aksi edit dan batal pada order belum bayar", () => {
    const orders = createMockOrders(new Date("2026-10-06T05:00:00.000Z"));
    const markup = renderToStaticMarkup(
      createElement(OrderHistoryList, {
        orders,
        onCancel: () => undefined,
        onEdit: () => undefined,
      }),
    );

    expect(markup.match(/>Edit<\/button>/g)).toHaveLength(1);
    expect(markup.match(/>Batalkan<\/button>/g)).toHaveLength(1);
    expect(markup).toContain("mt-2 flex gap-2 md:col-span-1 md:mt-0 md:justify-end");
    expect(markup).toContain("min-w-0 flex-1 px-2 text-xs sm:flex-none sm:px-4 sm:text-sm");
    expect(markup).toContain("min-w-0 flex-1 px-2 text-xs text-error sm:flex-none sm:px-4 sm:text-sm");
    expect(markup).not.toContain("disabled=");
  });

  it("menampilkan empty state bila filter tidak menemukan pesanan", () => {
    const markup = renderToStaticMarkup(
      createElement(OrderHistoryList, {
        orders: [],
        onCancel: () => undefined,
        onEdit: () => undefined,
      }),
    );

    expect(markup).toContain("Tidak ada pesanan yang cocok.");
  });

  it("menampilkan versi terbaru dari order yang diedit tanpa membuat duplikat", () => {
    const orders = createMockOrders(new Date("2026-10-06T05:00:00.000Z"));
    const updatedOrders = orders.map((order) =>
      order.id === "#012"
        ? { ...order, customerName: "Andi Baru", total: 39000 }
        : order,
    );
    const markup = renderToStaticMarkup(
      createElement(OrderHistoryList, {
        orders: updatedOrders,
        onCancel: () => undefined,
        onEdit: () => undefined,
      }),
    );

    expect(markup).toContain("Andi Baru");
    expect(markup).toContain("Rp 39.000");
    expect(markup.match(/Pesanan #012/g)).toHaveLength(1);
  });

  it("menampilkan metode pembayaran untuk order lunas dan menyembunyikan aksi edit/batal", () => {
    const orders = createMockOrders(new Date("2026-10-06T05:00:00.000Z")).map(
      (order) =>
        order.id === "#012"
          ? { ...order, status: "lunas" as const, paymentMethod: "qris" as const }
          : order,
    );
    const markup = renderToStaticMarkup(
      createElement(OrderHistoryList, {
        orders,
        onCancel: () => undefined,
        onEdit: () => undefined,
      }),
    );

    expect(markup).toContain("Lunas");
    expect(markup).toContain(">QRIS</span>");
    expect(markup.match(/>Edit<\/button>/g) ?? []).toHaveLength(0);
    expect(markup.match(/>Batalkan<\/button>/g) ?? []).toHaveLength(0);
  });
});
