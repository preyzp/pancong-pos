export type OrderStatus = "baru" | "belum_bayar" | "lunas" | "dibatalkan";

export type MenuCategory = {
  id: string;
  name: string;
};

export type PaymentMethod = "tunai" | "qris";

/**
 * Master Add-on: satu-satunya konsep tambahan yang dapat dipilih untuk menu
 * (contoh: Keju, Meses, Oreo, Milo, Susu ekstra). Padanan server: `AddonDocument`.
 */
export type Addon = {
  id: string;
  name: string;
  price: number;
  active: boolean;
  sortOrder: number;
};

/**
 * Snapshot Add-on pada item pesanan. Nilai disalin dari master saat transaksi
 * sehingga histori tidak berubah ketika master diperbarui atau dinonaktifkan.
 * `qty` adalah jumlah Add-on per satu unit menu (default 1). `addonId` dan `qty`
 * opsional hanya agar pesanan lama di perangkat tetap dapat dibaca.
 */
export type OrderItemAddon = {
  addonId?: string;
  name: string;
  price: number;
  qty?: number;
};

export type OrderItem = {
  menuId: string;
  name: string;
  category: string;
  unitPrice: number;
  qty: number;
  addons: OrderItemAddon[];
  note?: string;
};

export type Order = {
  id: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
  paidAt?: string;
  cashReceived?: number;
  change?: number;
  cashier: string;
  createdAt: string;
};

export type MenuItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  /**
   * ID Add-on yang tersedia untuk menu ini. `undefined` = semua Add-on aktif
   * (kompatibel dengan data menu lama), `[]` = menu tanpa Add-on.
   */
  addonIds?: string[];
  active?: boolean;
};
