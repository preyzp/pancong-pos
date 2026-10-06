import { describe, expect, it } from "vitest";
import { validateDraftOrder } from "./validation";

describe("validasi draft pesanan", () => {
  it("menolak keranjang kosong", () => {
    expect(validateDraftOrder("Andi", [])).toEqual({
      items: "Tambahkan minimal satu menu ke pesanan.",
    });
  });

  it("menolak nama pemesan kosong atau whitespace", () => {
    expect(validateDraftOrder("  ", [])).toEqual({
      customerName: "Nama pemesan wajib diisi.",
      items: "Tambahkan minimal satu menu ke pesanan.",
    });
  });
});
