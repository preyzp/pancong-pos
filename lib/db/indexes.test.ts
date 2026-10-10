import { describe, expect, it } from "vitest";
import { collectionNames, databaseIndexes } from "./indexes";

describe("indeks MongoDB", () => {
  it("mendefinisikan indeks untuk setiap koleksi fondasi", () => {
    expect(Object.keys(databaseIndexes).sort()).toEqual(
      [...collectionNames].sort(),
    );
  });

  it("menerapkan constraint unik pada identifier tenant-scoped", () => {
    expect(databaseIndexes.tenants).toContainEqual(
      expect.objectContaining({
        key: { slug: 1 },
        unique: true,
      }),
    );
    expect(databaseIndexes.users).toContainEqual(
      expect.objectContaining({
        key: { tenantId: 1, email: 1 },
        unique: true,
      }),
    );
    expect(databaseIndexes.menuItems).toContainEqual(
      expect.objectContaining({
        key: { tenantId: 1, menuId: 1 },
        unique: true,
      }),
    );
    expect(databaseIndexes.orders).toContainEqual(
      expect.objectContaining({
        key: { tenantId: 1, orderNumber: 1 },
        unique: true,
      }),
    );
    expect(databaseIndexes.addons).toContainEqual(
      expect.objectContaining({
        key: { tenantId: 1, name: 1 },
        unique: true,
      }),
    );
    expect(databaseIndexes.settings).toContainEqual(
      expect.objectContaining({
        key: { tenantId: 1 },
        unique: true,
      }),
    );
  });

  it("mendukung pencarian pesanan tenant berdasarkan waktu dan status", () => {
    expect(databaseIndexes.orders).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: { tenantId: 1, createdAt: -1 } }),
        expect.objectContaining({
          key: { tenantId: 1, status: 1, createdAt: -1 },
        }),
      ]),
    );
  });
});
