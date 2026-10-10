import { describe, expect, it } from "vitest";
import {
  DEFAULT_SETTINGS,
  createSettingsPersistence,
} from "./settings-persistence";

function createMemoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    setRaw: (key: string, value: string) => values.set(key, value),
  };
}

describe("persistensi pengaturan", () => {
  it("memuat null saat belum ada pengaturan tersimpan", () => {
    const persistence = createSettingsPersistence(() => createMemoryStorage());

    expect(persistence.load()).toBeNull();
  });

  it("menyimpan dan memuat pengaturan dengan envelope berversi", () => {
    const storage = createMemoryStorage();
    const persistence = createSettingsPersistence(() => storage);
    const settings = {
      ...DEFAULT_SETTINGS,
      cashierName: "Sari",
      receiptPaperWidth: "80mm" as const,
    };

    persistence.save(settings);

    expect(persistence.load()).toEqual(settings);
    expect(
      JSON.parse(storage.getItem("pancong-pos/settings") ?? "{}").version,
    ).toBe(1);
  });

  it("mengabaikan JSON rusak, versi tak dikenal, dan data invalid", () => {
    const storage = createMemoryStorage();
    const persistence = createSettingsPersistence(() => storage);

    storage.setRaw("pancong-pos/settings", "{bad json");
    expect(persistence.load()).toBeNull();

    storage.setRaw(
      "pancong-pos/settings",
      JSON.stringify({ version: 99, data: DEFAULT_SETTINGS }),
    );
    expect(persistence.load()).toBeNull();

    storage.setRaw(
      "pancong-pos/settings",
      JSON.stringify({
        version: 1,
        data: { ...DEFAULT_SETTINGS, enabledPaymentMethods: [] },
      }),
    );
    expect(persistence.load()).toBeNull();
  });
});
