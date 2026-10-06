export type OrderStatus = "baru" | "belum_bayar" | "lunas" | "dibatalkan";

export type MenuCategory = "pancong" | "ketan_susu";

export type PaymentMethod = "tunai" | "qris";

export type Addon = {
  name: string;
  price: number;
};

export type OrderItem = {
  menuId: string;
  name: string;
  category: MenuCategory;
  unitPrice: number;
  qty: number;
  addons: Addon[];
};

export type Order = {
  id: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
  cashReceived?: number;
  change?: number;
  cashier: string;
  createdAt: string;
};

export type MenuItem = {
  id: string;
  name: string;
  category: MenuCategory;
  price: number;
  hasToppings: boolean;
};

export type Topping = {
  id: string;
  name: string;
  price: number;
};
