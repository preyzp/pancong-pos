import { createStore } from "zustand/vanilla";
import type { PaymentMethod } from "../types/pos";
import {
  DEFAULT_SETTINGS,
  type AppSettings,
  settingsPersistence,
  type SettingsPersistence,
} from "../lib/settings/settings-persistence";

type ProfileSettings = Pick<
  AppSettings,
  "cashierName" | "storeName" | "storePhone"
>;

type ReceiptSettings = Pick<
  AppSettings,
  "receiptFooter" | "receiptPaperWidth" | "autoPrintReceipt"
>;

export type SettingsState = {
  settings: AppSettings;
  initialized: boolean;
  persistenceError: string | null;
  initialize: () => void;
  updateProfile: (profile: ProfileSettings) => void;
  setPaymentMethodEnabled: (
    method: PaymentMethod,
    enabled: boolean,
  ) => boolean;
  updateReceiptSettings: (receipt: ReceiptSettings) => void;
};

export function createSettingsStore(
  persistence: SettingsPersistence = settingsPersistence,
) {
  const store = createStore<SettingsState>()((set) => ({
    settings: DEFAULT_SETTINGS,
    initialized: false,
    persistenceError: null,
    initialize: () =>
      set((state) => {
        if (state.initialized) return state;
        return {
          settings: persistence.load() ?? DEFAULT_SETTINGS,
          initialized: true,
        };
      }),
    updateProfile: (profile) =>
      set((state) => ({
        settings: { ...state.settings, ...profile },
      })),
    setPaymentMethodEnabled: (method, enabled) => {
      let didUpdate = false;

      set((state) => {
        const methods = state.settings.enabledPaymentMethods;
        if (methods.includes(method) === enabled) return state;
        if (!enabled && methods.length === 1) return state;

        didUpdate = true;
        return {
          settings: {
            ...state.settings,
            enabledPaymentMethods: enabled
              ? [...methods, method]
              : methods.filter((activeMethod) => activeMethod !== method),
          },
        };
      });

      return didUpdate;
    },
    updateReceiptSettings: (receipt) =>
      set((state) => ({
        settings: { ...state.settings, ...receipt },
      })),
  }));

  store.subscribe((state, previousState) => {
    if (
      !state.initialized ||
      state.settings === previousState.settings
    ) {
      return;
    }

    try {
      persistence.save(state.settings);
      if (state.persistenceError) {
        store.setState({ persistenceError: null });
      }
    } catch {
      store.setState({
        persistenceError:
          "Pengaturan belum tersimpan di perangkat ini. Periksa penyimpanan browser lalu coba lagi.",
      });
    }
  });

  return store;
}

export const settingsStore = createSettingsStore();
