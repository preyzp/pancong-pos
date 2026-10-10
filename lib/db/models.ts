import type { ObjectId } from "mongodb";

export type OrderStatus =
  | "baru"
  | "belum_bayar"
  | "lunas"
  | "dibatalkan";

export type PaymentMethod = "tunai" | "qris";

export type TenantDocument = {
  _id?: ObjectId;
  name: string;
  slug: string;
  status: "active" | "disabled";
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
};

export type UserDocument = {
  _id?: ObjectId;
  tenantId: ObjectId;
  email: string;
  passwordHash: string;
  displayName: string;
  role: "owner" | "cashier";
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type MenuItemDocument = {
  _id?: ObjectId;
  tenantId: ObjectId;
  menuId: string;
  name: string;
  categoryId: string;
  price: number;
  addonIds: ObjectId[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type AddonDocument = {
  _id?: ObjectId;
  tenantId: ObjectId;
  name: string;
  additionalPrice: number;
  active: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export type AddonSnapshot = {
  addonId: ObjectId;
  name: string;
  unitPrice: number;
  qty: number;
};

export type OrderItemSnapshot = {
  menuId: string;
  name: string;
  categoryId: string;
  categoryName: string;
  unitPrice: number;
  qty: number;
  addons: AddonSnapshot[];
  note?: string;
};

export type OrderDocument = {
  _id?: ObjectId;
  tenantId: ObjectId;
  orderNumber: string;
  customerName: string;
  items: OrderItemSnapshot[];
  subtotal: number;
  total: number;
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
  paymentConfirmation?: "manual";
  paidAt?: Date;
  cashReceived?: number;
  change?: number;
  cashierUserId?: ObjectId;
  cashierName: string;
  createdAt: Date;
  updatedAt: Date;
};

export type SettingsDocument = {
  _id?: ObjectId;
  tenantId: ObjectId;
  storeName: string;
  storePhone: string;
  enabledPaymentMethods: PaymentMethod[];
  cashierName: string;
  receiptFooter: string;
  receiptPaperWidth: "58mm" | "80mm";
  autoPrintReceipt: boolean;
  menuCategories: { id: string; name: string }[];
  updatedAt: Date;
};
