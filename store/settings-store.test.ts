import { describe, expect, it } from "vitest";
import {
  DEFAULT_SETTINGS,
  createSettingsPersistence,
} from "../lib/settings/settings-persistence";
import { createSettingsStore } from "./settings-store";

function createMemoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  };
}

describe("settings store", () => {
  it("menyimpan perubahan profil dan struk setelah store diinisialisasi ulang", () => {
    const storage = createMemoryStorage();
    const persistence = createSettingsPersistence(() => storage);
    const store = createSettingsStore(persistence);
    store.getState().initialize();
    store.getState().updateProfile({
      cashierName: "Sari",
      storeName: "Pancong Sari",
      storePhone: "081234567890",
    });
    store.getState().updateReceiptSettings({
      receiptFooter: "Sampai jumpa.",
      receiptPaperWidth: "80mm",
      autoPrintReceipt: true,
    });

    const reloadedStore = createSettingsStore(persistence);
    reloadedStore.getState().initialize();

    expect(reloadedStore.getState().settings).toMatchObject({
      cashierName: "Sari",
      storeName: "Pancong Sari",
      storePhone: "081234567890",
      receiptFooter: "Sampai jumpa.",
      receiptPaperWidth: "80mm",
      autoPrintReceipt: true,
    });
  });

  it("menolak menonaktifkan metode pembayaran aktif terakhir", () => {
    const persistence = createSettingsPersistence(() => createMemoryStorage());
    const store = createSettingsStore(persistence);
    store.getState().initialize();
    store.getState().setPaymentMethodEnabled("qris", false);

    expect(store.getState().setPaymentMethodEnabled("tunai", false)).toBe(
      false,
    );
    expect(store.getState().settings.enabledPaymentMethods).toEqual(["tunai"]);
    expect(store.getState().settings).not.toEqual(DEFAULT_SETTINGS);
  });
});
