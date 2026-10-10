import type { IndexDescription } from "mongodb";

export const collectionNames = [
  "tenants",
  "users",
  "menuItems",
  "addons",
  "orders",
  "settings",
] as const;

export type CollectionName = (typeof collectionNames)[number];

export const databaseIndexes: Record<CollectionName, IndexDescription[]> = {
  tenants: [
    {
      key: { slug: 1 },
      unique: true,
      name: "uniq_tenants_slug",
    },
  ],
  users: [
    {
      key: { tenantId: 1, email: 1 },
      unique: true,
      name: "uniq_users_tenant_email",
    },
  ],
  menuItems: [
    {
      key: { tenantId: 1, menuId: 1 },
      unique: true,
      name: "uniq_menu_items_tenant_menu",
    },
    {
      key: { tenantId: 1, categoryId: 1, active: 1 },
      name: "idx_menu_items_tenant_category_active",
    },
  ],
  addons: [
    {
      key: { tenantId: 1, name: 1 },
      unique: true,
      name: "uniq_addons_tenant_name",
    },
    {
      key: { tenantId: 1, active: 1, sortOrder: 1 },
      name: "idx_addons_tenant_active_sort",
    },
  ],
  orders: [
    {
      key: { tenantId: 1, orderNumber: 1 },
      unique: true,
      name: "uniq_orders_tenant_number",
    },
    {
      key: { tenantId: 1, createdAt: -1 },
      name: "idx_orders_tenant_created",
    },
    {
      key: { tenantId: 1, status: 1, createdAt: -1 },
      name: "idx_orders_tenant_status_created",
    },
  ],
  settings: [
    {
      key: { tenantId: 1 },
      unique: true,
      name: "uniq_settings_tenant",
    },
  ],
};
