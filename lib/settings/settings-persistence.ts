import type { PaymentMethod } from "../../types/pos";

export type ReceiptPaperWidth = "58mm" | "80mm";

export type AppSettings = {
  cashierName: string;
  storeName: string;
  storePhone: string;
  enabledPaymentMethods: PaymentMethod[];
  receiptFooter: string;
  receiptPaperWidth: ReceiptPaperWidth;
  autoPrintReceipt: boolean;
};

export const DEFAULT_SETTINGS: AppSettings = {
  cashierName: "Budi",
  storeName: "Pancong Pak Budi",
  storePhone: "",
  enabledPaymentMethods: ["tunai", "qris"],
  receiptFooter: "Terima kasih sudah berbelanja.",
  receiptPaperWidth: "58mm",
  autoPrintReceipt: false,
};

const STORAGE_KEY = "pancong-pos/settings";
const STORAGE_VERSION = 1;

export type SettingsPersistence = {
  load: () => AppSettings | null;
  save: (settings: AppSettings) => void;
};

type StorageLike = Pick<Storage, "getItem" | "setItem">;

type StoredSettings = {
  version: number;
  data: AppSettings;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isPaymentMethod(value: unknown): value is PaymentMethod {
  return value === "tunai" || value === "qris";
}

function isAppSettings(value: unknown): value is AppSettings {
  return (
    isRecord(value) &&
    typeof value.cashierName === "string" &&
    typeof value.storeName === "string" &&
    typeof value.storePhone === "string" &&
    Array.isArray(value.enabledPaymentMethods) &&
    value.enabledPaymentMethods.length > 0 &&
    value.enabledPaymentMethods.every(isPaymentMethod) &&
    new Set(value.enabledPaymentMethods).size ===
      value.enabledPaymentMethods.length &&
    typeof value.receiptFooter === "string" &&
    (value.receiptPaperWidth === "58mm" ||
      value.receiptPaperWidth === "80mm") &&
    typeof value.autoPrintReceipt === "boolean"
  );
}

function isStoredSettings(value: unknown): value is StoredSettings {
  return (
    isRecord(value) &&
    value.version === STORAGE_VERSION &&
    isAppSettings(value.data)
  );
}

function getBrowserStorage(): StorageLike | null {
  return typeof window === "undefined" ? null : window.localStorage;
}

export function createSettingsPersistence(
  getStorage: () => StorageLike | null = getBrowserStorage,
): SettingsPersistence {
  return {
    load() {
      try {
        const serialized = getStorage()?.getItem(STORAGE_KEY);
        if (!serialized) return null;

        const parsed: unknown = JSON.parse(serialized);
        return isStoredSettings(parsed) ? parsed.data : null;
      } catch {
        return null;
      }
    },
    save(settings) {
      const storage = getStorage();
      if (!storage) return;

      storage.setItem(
        STORAGE_KEY,
        JSON.stringify({ version: STORAGE_VERSION, data: settings }),
      );
    },
  };
}

export const settingsPersistence = createSettingsPersistence();
