import type { MenuCategory, MenuItem } from "../../types/pos";

const STORAGE_KEY = "pancong-pos/menu";
const STORAGE_VERSION = 1;

export type MenuPersistence = {
  load: () => MenuItem[] | null;
  save: (items: MenuItem[]) => void;
};

type StorageLike = Pick<Storage, "getItem" | "setItem">;

type StoredMenu = {
  version: number;
  data: MenuItem[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isMenuCategory(value: unknown): value is MenuCategory {
  return value === "pancong" || value === "ketan_susu";
}

function isMenuItem(value: unknown): value is MenuItem {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    value.id.length > 0 &&
    typeof value.name === "string" &&
    value.name.trim().length > 0 &&
    isMenuCategory(value.category) &&
    typeof value.price === "number" &&
    Number.isSafeInteger(value.price) &&
    value.price >= 0 &&
    typeof value.hasToppings === "boolean" &&
    (value.active === undefined || typeof value.active === "boolean")
  );
}

function isStoredMenu(value: unknown): value is StoredMenu {
  if (
    !isRecord(value) ||
    value.version !== STORAGE_VERSION ||
    !Array.isArray(value.data) ||
    !value.data.every(isMenuItem)
  ) {
    return false;
  }

  return new Set(value.data.map((item) => item.id)).size === value.data.length;
}

function getBrowserStorage(): StorageLike | null {
  return typeof window === "undefined" ? null : window.localStorage;
}

export function createMenuPersistence(
  getStorage: () => StorageLike | null = getBrowserStorage,
): MenuPersistence {
  return {
    load() {
      try {
        const serialized = getStorage()?.getItem(STORAGE_KEY);
        if (!serialized) return null;

        const parsed: unknown = JSON.parse(serialized);
        return isStoredMenu(parsed) ? parsed.data : null;
      } catch {
        return null;
      }
    },
    save(items) {
      const storage = getStorage();
      if (!storage) return;

      storage.setItem(
        STORAGE_KEY,
        JSON.stringify({ version: STORAGE_VERSION, data: items }),
      );
    },
  };
}

export const menuPersistence = createMenuPersistence();
