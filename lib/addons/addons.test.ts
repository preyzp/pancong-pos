import { describe, expect, it } from "vitest";
import type { Addon, MenuItem } from "../../types/pos";
import {
  createAddonSnapshot,
  findUnavailableAddons,
  getSelectableAddons,
} from "./addons";

const keju: Addon = { id: "keju", name: "Keju", price: 3000, active: true, sortOrder: 2 };
const meses: Addon = { id: "meses", name: "Meses", price: 2000, active: true, sortOrder: 1 };
const milo: Addon = { id: "milo", name: "Milo", price: 3000, active: false, sortOrder: 0 };
const addons = [keju, meses, milo];

const menuItem: MenuItem = {
  id: "pancong-coklat",
  name: "Pancong Cokelat",
  category: "pancong",
  price: 8000,
};

describe("master Add-on", () => {
  it("hanya menawarkan Add-on aktif sesuai urutan tampilan", () => {
    expect(getSelectableAddons(menuItem, addons)).toEqual([meses, keju]);
  });

  it("membatasi pilihan ke Add-on yang ditentukan menu", () => {
    expect(
      getSelectableAddons({ ...menuItem, addonIds: ["keju", "milo"] }, addons),
    ).toEqual([keju]);
    expect(getSelectableAddons({ ...menuItem, addonIds: [] }, addons)).toEqual([]);
  });

  it("membuat snapshot berisi ID, nama, harga, dan jumlah saat transaksi", () => {
    const snapshot = createAddonSnapshot(keju);

    expect(snapshot).toEqual({ addonId: "keju", name: "Keju", price: 3000, qty: 1 });

    const updatedMaster = { ...keju, name: "Keju Mozarella", price: 5000, active: false };
    expect(updatedMaster.price).toBe(5000);
    expect(snapshot).toEqual({ addonId: "keju", name: "Keju", price: 3000, qty: 1 });
    expect(() => createAddonSnapshot(keju, 0)).toThrow(RangeError);
    expect(() => createAddonSnapshot(keju, 1.5)).toThrow(RangeError);
  });

  it("menolak Add-on nonaktif, di luar menu, tanpa ID, atau duplikat untuk pesanan baru", () => {
    const limitedMenu = { ...menuItem, addonIds: ["keju", "milo"] };
    const legacy = { name: "Extra Keju", price: 3000 };

    expect(
      findUnavailableAddons(
        limitedMenu,
        [
          createAddonSnapshot(keju),
          createAddonSnapshot(milo),
          createAddonSnapshot(meses),
          legacy,
          createAddonSnapshot(keju),
        ],
        addons,
      ),
    ).toEqual([
      createAddonSnapshot(milo),
      createAddonSnapshot(meses),
      legacy,
      createAddonSnapshot(keju),
    ]);
    expect(findUnavailableAddons(limitedMenu, [createAddonSnapshot(keju)], addons)).toEqual([]);
  });
});
