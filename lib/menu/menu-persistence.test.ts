import { describe, expect, it } from "vitest";
import {
  DEFAULT_MENU_CATEGORIES,
  MOCK_MENU,
} from "../../data/mock/menu";
import { createMenuPersistence } from "./menu-persistence";

function createMemoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    setRaw: (key: string, value: string) => values.set(key, value),
  };
}

describe("persistensi menu", () => {
  it("memuat menu kosong saat belum ada data tersimpan", () => {
    const storage = createMemoryStorage();
    const persistence = createMenuPersistence(() => storage);

    expect(persistence.load()).toBeNull();
  });

  it("menyimpan dan memuat menu dengan versioned envelope", () => {
    const storage = createMemoryStorage();
    const persistence = createMenuPersistence(() => storage);
    const updatedMenu = MOCK_MENU.map((item) =>
      item.id === MOCK_MENU[0].id
        ? { ...item, price: 12000, active: false }
        : item,
    );
    const data = {
      categories: [
        ...DEFAULT_MENU_CATEGORIES,
        { id: "minuman", name: "Minuman" },
      ],
      items: [
        ...updatedMenu,
        {
          id: "es-teh",
          name: "Es Teh",
          category: "minuman",
          price: 5000,
          addonIds: [],
        },
      ],
    };

    persistence.save(data);

    expect(persistence.load()).toEqual(data);
    expect(JSON.parse(storage.getItem("pancong-pos/menu") ?? "{}").version).toBe(
      2,
    );
  });

  it("memigrasikan data menu lama ke kategori yang dapat dikelola", () => {
    const storage = createMemoryStorage();
    const persistence = createMenuPersistence(() => storage);
    storage.setRaw(
      "pancong-pos/menu",
      JSON.stringify({ version: 1, data: MOCK_MENU }),
    );

    expect(persistence.load()).toEqual({
      categories: DEFAULT_MENU_CATEGORIES,
      items: MOCK_MENU,
    });
  });

  it("memetakan flag hasToppings lama ke addonIds tanpa membuang menu", () => {
    const storage = createMemoryStorage();
    const persistence = createMenuPersistence(() => storage);
    const [withAddons, withoutAddons] = MOCK_MENU;
    storage.setRaw(
      "pancong-pos/menu",
      JSON.stringify({
        version: 2,
        data: {
          categories: DEFAULT_MENU_CATEGORIES,
          items: [
            { ...withAddons, hasToppings: true },
            { ...withoutAddons, hasToppings: false },
          ],
        },
      }),
    );

    expect(persistence.load()?.items).toEqual([
      withAddons,
      { ...withoutAddons, addonIds: [] },
    ]);
  });

  it("mengabaikan JSON korup, versi tidak dikenal, dan data invalid", () => {
    const storage = createMemoryStorage();
    const persistence = createMenuPersistence(() => storage);

    storage.setRaw("pancong-pos/menu", "{bad json");
    expect(persistence.load()).toBeNull();

    storage.setRaw(
      "pancong-pos/menu",
      JSON.stringify({ version: 99, data: MOCK_MENU }),
    );
    expect(persistence.load()).toBeNull();

    storage.setRaw(
      "pancong-pos/menu",
      JSON.stringify({
        version: 2,
        data: {
          categories: DEFAULT_MENU_CATEGORIES,
          items: [{ ...MOCK_MENU[0], price: -1 }],
        },
      }),
    );
    expect(persistence.load()).toBeNull();

    storage.setRaw(
      "pancong-pos/menu",
      JSON.stringify({
        version: 2,
        data: {
          categories: DEFAULT_MENU_CATEGORIES,
          items: [{ ...MOCK_MENU[0], category: "missing-category" }],
        },
      }),
    );
    expect(persistence.load()).toBeNull();
  });
});
