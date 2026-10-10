import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { createMockOrders } from "../../data/mock/orders";
import { MOCK_MENU } from "../../data/mock/menu";
import { buildEditedOrder, createEditableOrder } from "../../lib/orders/edit-order";
import { createOrderPersistence } from "../../lib/orders/order-persistence";
import { createOrderStore } from "../../store/order-store";
import { OrderDetailView } from "./order-detail-view";
import {
  PaymentConfirmationDialog,
  PaymentMethodSelector,
} from "./payment-controls";

class MemoryStorage {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

const noop = () => undefined;

describe("detail pesanan", () => {
  it("menampilkan identitas, status, item, quantity, harga, add-on, subtotal, dan total", () => {
    const order = createMockOrders(
      new Date("2026-10-06T05:00:00.000Z"),
    ).find((candidate) => candidate.id === "#012")!;
    order.items[0].addons = [{ name: "Extra Keju", price: 3000 }];
    order.items[0].note = "Jangan terlalu manis";
    order.subtotal = 28000;
    order.total = 28000;
    order.paymentMethod = "tunai";
    const markup = renderToStaticMarkup(
      createElement(OrderDetailView, {
        loading: false,
        onCancel: noop,
        onEdit: noop,
        order,
      }),
    );

    expect(markup).toContain("Pesanan #012 · Andi");
    expect(markup).toContain("Belum Bayar");
    expect(markup).toContain("Metode pembayaran:");
    expect(markup).toContain(">Tunai</span>");
    expect(markup).toContain("Pancong Coklat");
    expect(markup).toContain("Rp 8.000 × 2");
    expect(markup).toContain("Tambahan: Extra Keju · Rp 3.000");
    expect(markup).toContain("Catatan: Jangan terlalu manis");
    expect(markup).toContain("Ketan Susu Original");
    expect(markup).toContain("Rp 6.000 × 1");
    expect(markup).toContain("Rp 22.000");
    expect(markup).toContain("Rp 28.000");
    expect(markup).toContain("Edit Pesanan");
    expect(markup).toContain("Batalkan");
    expect(markup).toContain('href="/orders/%23012/pay"');
  });

  it("menampilkan loading dan missing-order state secara aman", () => {
    const loadingMarkup = renderToStaticMarkup(
      createElement(OrderDetailView, {
        loading: true,
        onCancel: noop,
        onEdit: noop,
        order: null,
      }),
    );
    const missingMarkup = renderToStaticMarkup(
      createElement(OrderDetailView, {
        loading: false,
        onCancel: noop,
        onEdit: noop,
        order: null,
      }),
    );

    expect(loadingMarkup).toContain("Memuat pesanan...");
    expect(missingMarkup).toContain("Pesanan tidak ditemukan");
    expect(missingMarkup).toContain("Kembali ke Riwayat");
  });

  it("menampilkan data terbaru yang sudah diedit dan di-hydrate dari persistence", () => {
    const storage = new MemoryStorage();
    const persistence = createOrderPersistence(() => storage);
    const initialOrders = createMockOrders(
      new Date("2026-10-06T05:00:00.000Z"),
    );
    const firstStore = createOrderStore(persistence);
    firstStore.getState().initializeOrders(initialOrders);
    const original = firstStore.getState().orders.find(
      (candidate) => candidate.id === "#012",
    )!;
    const editable = createEditableOrder(original);
    editable.items[0].qty = 3;
    editable.items[0].addons = [{ name: "Extra Keju", price: 3000 }];
    const updated = buildEditedOrder(original, editable);
    expect(
      firstStore.getState().updateUnpaidOrder(updated, MOCK_MENU),
    ).toBe(true);

    const afterReload = createOrderStore(persistence);
    afterReload.getState().initializeOrders(initialOrders);
    const reloadedOrder = afterReload
      .getState()
      .orders.find((candidate) => candidate.id === "#012")!;
    const markup = renderToStaticMarkup(
      createElement(OrderDetailView, {
        loading: !afterReload.getState().ordersInitialized,
        onCancel: noop,
        onEdit: noop,
        order: reloadedOrder,
      }),
    );

    expect(markup).toContain("Rp 39.000");
    expect(markup).toContain("Rp 8.000 × 3");
    expect(markup).toContain("Tambahan: Extra Keju");
    expect(markup.match(/Pesanan #012 · Andi/g)).toHaveLength(1);
  });

  it("menampilkan metode dan waktu pembayaran serta menyembunyikan aksi bayar untuk order lunas", () => {
    const order = {
      ...createMockOrders(new Date("2026-10-06T05:00:00.000Z"))[0],
      status: "lunas" as const,
      paymentMethod: "qris" as const,
      paidAt: "2026-10-07T04:00:00.000Z",
    };
    const markup = renderToStaticMarkup(
      createElement(OrderDetailView, {
        loading: false,
        onCancel: noop,
        onEdit: noop,
        order,
      }),
    );

    expect(markup).toContain("Lunas");
    expect(markup).toContain("QRIS");
    expect(markup).toContain("Waktu pembayaran:");
    expect(markup).not.toContain(">Bayar</a>");
    expect(markup).not.toContain("Edit Pesanan");
    expect(markup).not.toContain(">Batalkan</button>");
  });

  it("menampilkan uang diterima dan kembalian pada detail pesanan tunai yang lunas", () => {
    const order = {
      ...createMockOrders(new Date("2026-10-06T05:00:00.000Z"))[0],
      status: "lunas" as const,
      paymentMethod: "tunai" as const,
      cashReceived: 25000,
      change: 3000,
    };
    const markup = renderToStaticMarkup(
      createElement(OrderDetailView, {
        loading: false,
        onCancel: noop,
        onEdit: noop,
        order,
      }),
    );

    expect(markup).toContain("Uang diterima");
    expect(markup).toContain("Rp 25.000");
    expect(markup).toContain("Kembalian");
    expect(markup).toContain("Rp 3.000");
  });

  it("menampilkan opsi metode dan konfirmasi jumlah pembayaran", () => {
    const methodMarkup = renderToStaticMarkup(
      createElement(PaymentMethodSelector, {
        enabledMethods: ["tunai", "qris"],
        onChange: noop,
        value: "qris",
      }),
    );
    const order = createMockOrders(
      new Date("2026-10-06T05:00:00.000Z"),
    )[0];
    const confirmationMarkup = renderToStaticMarkup(
      createElement(PaymentConfirmationDialog, {
        cashReceived: 25000,
        change: 3000,
        method: "tunai",
        onCancel: noop,
        onConfirm: noop,
        order,
      }),
    );

    expect(methodMarkup).toContain('value="tunai"');
    expect(methodMarkup).toContain('value="qris"');
    expect(methodMarkup).toContain('checked="" value="qris"');
    expect(confirmationMarkup).toContain("Uang diterima Rp 25.000");
    expect(confirmationMarkup).toContain("kembalian Rp 3.000");
    expect(confirmationMarkup).toContain("Rp 22.000");
    expect(confirmationMarkup).toContain("Tunai");
    expect(confirmationMarkup).toContain("Ya, tandai lunas");
  });

  it("hanya menampilkan metode pembayaran yang diaktifkan", () => {
    const methodMarkup = renderToStaticMarkup(
      createElement(PaymentMethodSelector, {
        enabledMethods: ["tunai"],
        onChange: noop,
        value: "tunai",
      }),
    );

    expect(methodMarkup).toContain('value="tunai"');
    expect(methodMarkup).not.toContain('value="qris"');
  });

  it("menjelaskan konfirmasi QRIS manual dan menahannya sebelum verifikasi", () => {
    const order = createMockOrders(
      new Date("2026-10-06T05:00:00.000Z"),
    )[0];
    const confirmationMarkup = renderToStaticMarkup(
      createElement(PaymentConfirmationDialog, {
        method: "qris",
        onCancel: noop,
        onConfirm: noop,
        order,
      }),
    );

    expect(confirmationMarkup).toContain("tidak membuat QR");
    expect(confirmationMarkup).toContain(
      "Saya sudah memastikan pembayaran QRIS diterima.",
    );
    expect(confirmationMarkup).toContain('disabled=""');
  });
});
