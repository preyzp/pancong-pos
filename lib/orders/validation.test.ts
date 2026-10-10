import { describe, expect, it } from "vitest";
import { MOCK_MENU } from "../../data/mock/menu";
import type { OrderItem } from "../../types/pos";
import { validateDraftOrder } from "./validation";

describe("validasi draft pesanan", () => {
  it("menolak keranjang kosong", () => {
    expect(validateDraftOrder("Andi", [], MOCK_MENU)).toEqual({
      items: "Tambahkan minimal satu menu ke pesanan.",
    });
  });

  it("menolak nama pemesan kosong atau whitespace", () => {
    expect(validateDraftOrder("  ", [], MOCK_MENU)).toEqual({
      customerName: "Nama pemesan wajib diisi.",
      items: "Tambahkan minimal satu menu ke pesanan.",
    });
  });

  it("menolak kuantitas tidak valid dan total nol", () => {
    const item: OrderItem = {
      menuId: "pancong-coklat",
      name: "Pancong Coklat",
      category: "pancong",
      unitPrice: 8000,
      qty: 0,
      addons: [],
    };
    expect(validateDraftOrder("Andi", [item], MOCK_MENU).items).toBe(
      "Kuantitas, Add-on, atau menu pada pesanan tidak valid.",
    );
    expect(
      validateDraftOrder("Andi", [item], [
        { ...MOCK_MENU[0], id: item.menuId, price: 0 },
      ]).items,
    ).toBe("Kuantitas, Add-on, atau menu pada pesanan tidak valid.");

    expect(
      validateDraftOrder(
        "Andi",
        [{ ...item, qty: 1, unitPrice: 0 }],
        [{ ...MOCK_MENU[0], id: item.menuId, price: 0 }],
      ).items,
    ).toBe("Total pesanan harus lebih dari Rp 0.");
  });
});
