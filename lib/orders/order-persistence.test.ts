import { describe, expect, it } from "vitest";
import { createMockOrders } from "../../data/mock/orders";
import { createOrderPersistence } from "./order-persistence";

class MemoryStorage {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

describe("penyimpanan order", () => {
  it("menyimpan dan memuat envelope versi 1", () => {
    const storage = new MemoryStorage();
    const persistence = createOrderPersistence(() => storage);
    const orders = createMockOrders(new Date("2026-10-06T05:00:00.000Z"));

    persistence.save(orders);

    expect(storage.getItem("pancong-pos/orders")).toBe(
      JSON.stringify({ version: 1, data: orders }),
    );
    expect(persistence.load()).toEqual(orders);
  });

  it("menghasilkan null untuk storage kosong, JSON korup, atau versi tidak didukung", () => {
    const storage = new MemoryStorage();
    const persistence = createOrderPersistence(() => storage);

    expect(persistence.load()).toBeNull();
    storage.setItem("pancong-pos/orders", "{invalid");
    expect(persistence.load()).toBeNull();
    storage.setItem(
      "pancong-pos/orders",
      JSON.stringify({ version: 2, data: [] }),
    );
    expect(persistence.load()).toBeNull();
    storage.setItem(
      "pancong-pos/orders",
      JSON.stringify({ version: 1, data: [{ id: "#bad" }] }),
    );
    expect(persistence.load()).toBeNull();
  });

  it("memperlakukan localStorage yang gagal diakses sebagai storage kosong saat load", () => {
    const persistence = createOrderPersistence(() => {
      throw new Error("Storage access denied");
    });

    expect(persistence.load()).toBeNull();
  });

  it("mempertahankan metode dan waktu pembayaran dalam data tersimpan", () => {
    const storage = new MemoryStorage();
    const persistence = createOrderPersistence(() => storage);
    const paidOrder = {
      ...createMockOrders(new Date("2026-10-06T05:00:00.000Z"))[0],
      status: "lunas" as const,
      paymentMethod: "qris" as const,
      paidAt: "2026-10-07T04:00:00.000Z",
    };

    persistence.save([paidOrder]);

    expect(persistence.load()).toEqual([paidOrder]);
  });

  it("mempertahankan ID kategori dinamis sebagai snapshot dalam pesanan lama", () => {
    const storage = new MemoryStorage();
    const persistence = createOrderPersistence(() => storage);
    const order = createMockOrders(new Date("2026-10-06T05:00:00.000Z"))[0];
    const categorizedOrder = {
      ...order,
      items: order.items.map((item) => ({
        ...item,
        category: "kategori-minuman",
      })),
    };

    persistence.save([categorizedOrder]);

    expect(persistence.load()).toEqual([categorizedOrder]);
  });

  it("menyimpan snapshot Add-on dengan ID dan jumlah serta menolak jumlah tidak valid", () => {
    const storage = new MemoryStorage();
    const persistence = createOrderPersistence(() => storage);
    const order = createMockOrders(new Date("2026-10-06T05:00:00.000Z"))[0];
    const withAddon = {
      ...order,
      items: order.items.map((item, index) =>
        index === 0
          ? {
              ...item,
              addons: [{ addonId: "keju", name: "Keju", price: 3000, qty: 1 }],
            }
          : item,
      ),
    };

    persistence.save([withAddon]);
    expect(persistence.load()).toEqual([withAddon]);

    storage.setItem(
      "pancong-pos/orders",
      JSON.stringify({
        version: 1,
        data: [
          {
            ...withAddon,
            items: [
              {
                ...withAddon.items[0],
                addons: [{ addonId: "keju", name: "Keju", price: 3000, qty: 0 }],
              },
            ],
          },
        ],
      }),
    );
    expect(persistence.load()).toBeNull();
  });
});
