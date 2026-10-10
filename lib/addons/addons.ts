import type { Addon, MenuItem, OrderItemAddon } from "../../types/pos";

/** Jumlah Add-on per satu unit menu; snapshot lama tanpa `qty` dihitung 1. */
export function getAddonQuantity(addon: OrderItemAddon): number {
  return addon.qty ?? 1;
}

/**
 * Add-on yang boleh dipilih untuk pesanan baru pada menu tertentu: aktif,
 * termasuk dalam `menuItem.addonIds` (atau semua jika tidak ditentukan),
 * diurutkan berdasarkan `sortOrder` lalu nama.
 */
export function getSelectableAddons(
  menuItem: MenuItem,
  addons: Addon[],
): Addon[] {
  const allowedIds = menuItem.addonIds ? new Set(menuItem.addonIds) : null;

  return addons
    .filter((addon) => addon.active && (!allowedIds || allowedIds.has(addon.id)))
    .sort(
      (left, right) =>
        left.sortOrder - right.sortOrder ||
        left.name.localeCompare(right.name, "id"),
    );
}

/** Salin nama dan harga master saat transaksi agar histori harga tetap. */
export function createAddonSnapshot(addon: Addon, qty = 1): OrderItemAddon {
  if (!Number.isSafeInteger(qty) || qty <= 0) {
    throw new RangeError("Jumlah Add-on harus berupa bilangan bulat positif.");
  }

  return { addonId: addon.id, name: addon.name, price: addon.price, qty };
}

/**
 * Snapshot Add-on yang tidak boleh dipakai untuk pesanan baru: tanpa ID,
 * tidak ada/nonaktif di master, tidak tersedia untuk menu, atau duplikat.
 * Histori lama tetap ditampilkan dari snapshot dan tidak divalidasi ulang.
 */
export function findUnavailableAddons(
  menuItem: MenuItem,
  selected: OrderItemAddon[],
  addons: Addon[],
): OrderItemAddon[] {
  const selectableIds = new Set(
    getSelectableAddons(menuItem, addons).map((addon) => addon.id),
  );
  const seenIds = new Set<string>();

  return selected.filter((addon) => {
    const isValid =
      addon.addonId !== undefined &&
      selectableIds.has(addon.addonId) &&
      !seenIds.has(addon.addonId) &&
      Number.isSafeInteger(getAddonQuantity(addon)) &&
      getAddonQuantity(addon) > 0;
    if (addon.addonId !== undefined) seenIds.add(addon.addonId);
    return !isValid;
  });
}
