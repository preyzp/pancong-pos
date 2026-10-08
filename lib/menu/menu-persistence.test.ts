import { describe, expect, it } from "vitest";
import { MOCK_MENU } from "../../data/mock/menu";
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

    persistence.save(updatedMenu);

    expect(persistence.load()).toEqual(updatedMenu);
    expect(JSON.parse(storage.getItem("pancong-pos/menu") ?? "{}").version).toBe(
      1,
    );
  });

  it("mengabaikan JSON korup, versi tidak dikenal, dan record invalid", () => {
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
      JSON.stringify({ version: 1, data: [{ ...MOCK_MENU[0], price: -1 }] }),
    );
    expect(persistence.load()).toBeNull();
  });
});
