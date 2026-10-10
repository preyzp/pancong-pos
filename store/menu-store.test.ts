import { describe, expect, it } from "vitest";
import {
  DEFAULT_MENU_CATEGORIES,
  MOCK_MENU,
} from "../data/mock/menu";
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
    store.getState().initialize(MOCK_MENU, DEFAULT_MENU_CATEGORIES);

    const original = store.getState().items[0];
    store.getState().saveItem({ ...original, name: "Pancong Revisi", price: 12500 });
    store.getState().setActive(original.id, false);

    const reloadedStore = createMenuStore(persistence, MOCK_MENU);
    reloadedStore.getState().initialize(MOCK_MENU, DEFAULT_MENU_CATEGORIES);

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
    store.getState().initialize(MOCK_MENU, DEFAULT_MENU_CATEGORIES);

    store.getState().saveItem({
      id: "menu-baru",
      name: "Pancong Baru",
      category: "pancong",
      price: 14000,
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

  it("membuat dan mengubah kategori dengan nama unik tanpa mengubah ID", () => {
    const storage = createMemoryStorage();
    const persistence = createMenuPersistence(() => storage);
    const store = createMenuStore(persistence, MOCK_MENU);
    store.getState().initialize(MOCK_MENU, DEFAULT_MENU_CATEGORIES);

    expect(
      store.getState().saveCategory({ id: "minuman", name: "Minuman" }),
    ).toBe(true);
    expect(
      store
        .getState()
        .saveCategory({ id: "minuman", name: "Minuman Dingin" }),
    ).toBe(true);
    expect(
      store.getState().saveCategory({ id: "snack", name: "minuman dingin" }),
    ).toBe(false);
    expect(store.getState().categories).toContainEqual({
      id: "minuman",
      name: "Minuman Dingin",
    });
  });

  it("menyimpan kategori baru ke penyimpanan lokal", () => {
    const storage = createMemoryStorage();
    const persistence = createMenuPersistence(() => storage);
    const store = createMenuStore(persistence, MOCK_MENU);
    store.getState().initialize(MOCK_MENU, DEFAULT_MENU_CATEGORIES);
    store.getState().saveCategory({ id: "minuman", name: "Minuman" });

    const reloadedStore = createMenuStore(persistence, MOCK_MENU);
    reloadedStore.getState().initialize(MOCK_MENU, DEFAULT_MENU_CATEGORIES);

    expect(reloadedStore.getState().categories).toContainEqual({
      id: "minuman",
      name: "Minuman",
    });
  });

  it("menolak menghapus kategori yang terpakai dan kategori terakhir", () => {
    const storage = createMemoryStorage();
    const persistence = createMenuPersistence(() => storage);
    const store = createMenuStore(persistence, MOCK_MENU);
    store.getState().initialize(MOCK_MENU, DEFAULT_MENU_CATEGORIES);
    store.getState().saveCategory({ id: "minuman", name: "Minuman" });

    expect(store.getState().deleteCategory("pancong")).toBe(false);
    expect(store.getState().deleteCategory("minuman")).toBe(true);
    expect(store.getState().deleteCategory("ketan_susu")).toBe(false);
  });

  it("mengizinkan kategori terpakai dihapus setelah semua menu dipindah", () => {
    const storage = createMemoryStorage();
    const persistence = createMenuPersistence(() => storage);
    const store = createMenuStore(persistence, MOCK_MENU);
    store.getState().initialize(MOCK_MENU, DEFAULT_MENU_CATEGORIES);
    store.getState().saveCategory({ id: "jajanan", name: "Jajanan" });
    store.setState((state) => ({
      items: state.items.map((item) =>
        item.category === "pancong"
          ? { ...item, category: "jajanan" }
          : item,
      ),
    }));

    expect(store.getState().deleteCategory("pancong")).toBe(true);
    expect(store.getState().categories.map((category) => category.id)).not.toContain(
      "pancong",
    );
  });
});
