import type { OrderItem } from "../../types/pos";

export type DraftOrderValidation = {
  customerName?: string;
  items?: string;
};

export function validateDraftOrder(
  customerName: string,
  items: OrderItem[],
): DraftOrderValidation {
  const errors: DraftOrderValidation = {};

  if (customerName.trim().length === 0) {
    errors.customerName = "Nama pemesan wajib diisi.";
  }

  if (items.length === 0) {
    errors.items = "Tambahkan minimal satu menu ke pesanan.";
  }

  return errors;
}
