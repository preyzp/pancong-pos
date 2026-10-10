import type { MenuItem, OrderItem } from "../../types/pos";
import { calculatePriceSummary } from "./pricing";

export type DraftOrderValidation = {
  customerName?: string;
  items?: string;
};

export function validateDraftOrder(
  customerName: string,
  items: OrderItem[],
  menu: MenuItem[],
): DraftOrderValidation {
  const errors: DraftOrderValidation = {};

  if (customerName.trim().length === 0) {
    errors.customerName = "Nama pemesan wajib diisi.";
  }

  if (items.length === 0) {
    errors.items = "Tambahkan minimal satu menu ke pesanan.";
  } else if (
    items.some(
      (item) =>
        !Number.isSafeInteger(item.qty) ||
        item.qty <= 0 ||
        !Number.isFinite(item.unitPrice) ||
        item.unitPrice < 0 ||
        item.addons.some(
          (addon) =>
            !Number.isFinite(addon.price) ||
            addon.price < 0 ||
            (addon.qty !== undefined &&
              (!Number.isSafeInteger(addon.qty) || addon.qty <= 0)),
        ) ||
        !menu.some((menuItem) => menuItem.id === item.menuId),
    )
  ) {
    errors.items = "Kuantitas, Add-on, atau menu pada pesanan tidak valid.";
  } else {
    const { total } = calculatePriceSummary(items);
    if (!Number.isFinite(total) || total <= 0) {
      errors.items = "Total pesanan harus lebih dari Rp 0.";
    }
  }

  return errors;
}
