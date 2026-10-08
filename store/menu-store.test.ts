import { describe, expect, it } from "vitest";
import { MOCK_MENU } from "../data/mock/menu";
import { createMenuPersistence } from "../lib/menu/menu-persistence";
import { createMenuStore } from "./menu-store";

function createMemoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  };
}

describe("menu store", () => {
  it("menyimpan perubahan harga dan status aktif setelah store diinisialisasi ulang", () => {
    const storage = createMemoryStorage();
    const persistence = createMenuPersistence(() => storage);
    const store = createMenuStore(persistence, MOCK_MENU);
    store.getState().initialize(MOCK_MENU);

    const original = store.getState().items[0];
    store.getState().saveItem({ ...original, name: "Pancong Revisi", price: 12500 });
    store.getState().setActive(original.id, false);

    const reloadedStore = createMenuStore(persistence, MOCK_MENU);
    reloadedStore.getState().initialize(MOCK_MENU);

    expect(
      reloadedStore.getState().items.find((item) => item.id === original.id),
    ).toMatchObject({
      id: original.id,
      name: "Pancong Revisi",
      price: 12500,
      active: false,
    });
  });

  it("menambahkan menu baru tanpa mengubah ID ketika item yang ada diedit", () => {
    const storage = createMemoryStorage();
    const persistence = createMenuPersistence(() => storage);
    const store = createMenuStore(persistence, MOCK_MENU);
    store.getState().initialize(MOCK_MENU);

    store.getState().saveItem({
      id: "menu-baru",
      name: "Pancong Baru",
      category: "pancong",
      price: 14000,
      hasToppings: true,
      active: true,
    });
    store.getState().saveItem({
      ...MOCK_MENU[0],
      name: "Pancong Original Spesial",
    });

    expect(store.getState().items).toHaveLength(MOCK_MENU.length + 1);
    expect(store.getState().items[0]).toMatchObject({
      id: MOCK_MENU[0].id,
      name: "Pancong Original Spesial",
    });
  });
});
