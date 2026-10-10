import { DEFAULT_MENU_CATEGORIES } from "../../data/mock/menu";
import type { MenuCategory, MenuItem } from "../../types/pos";

const STORAGE_KEY = "pancong-pos/menu";
const STORAGE_VERSION = 2;

export type MenuPersistence = {
  load: () => StoredMenuData | null;
  save: (data: StoredMenuData) => void;
};

type StorageLike = Pick<Storage, "getItem" | "setItem">;

export type StoredMenuData = {
  categories: MenuCategory[];
  items: MenuItem[];
};

type StoredMenuV1 = {
  version: number;
  data: MenuItem[];
};

type StoredMenuV2 = {
  version: number;
  data: StoredMenuData;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isMenuCategory(value: unknown): value is MenuCategory {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    value.id.length > 0 &&
    typeof value.name === "string" &&
    value.name.trim().length > 0
  );
}

function isMenuItem(value: unknown): value is MenuItem {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    value.id.length > 0 &&
    typeof value.name === "string" &&
    value.name.trim().length > 0 &&
    typeof value.category === "string" &&
    value.category.length > 0 &&
    typeof value.price === "number" &&
    Number.isSafeInteger(value.price) &&
    value.price >= 0 &&
    (value.hasToppings === undefined || typeof value.hasToppings === "boolean") &&
    (value.addonIds === undefined ||
      (Array.isArray(value.addonIds) &&
        value.addonIds.every(
          (addonId) => typeof addonId === "string" && addonId.length > 0,
        ))) &&
    (value.active === undefined || typeof value.active === "boolean")
  );
}

/**
 * Data menu lama menyimpan flag `hasToppings`; petakan ke `addonIds`
 * (`false` → tanpa Add-on, `true` → semua Add-on aktif) tanpa membuang data.
 */
function normalizeMenuItem(item: MenuItem & { hasToppings?: boolean }): MenuItem {
  const { hasToppings, ...menuItem } = item;
  if (menuItem.addonIds !== undefined || hasToppings !== false) return menuItem;
  return { ...menuItem, addonIds: [] };
}

function isStoredMenuV1(value: unknown): value is StoredMenuV1 {
  if (
    !isRecord(value) ||
    value.version !== 1 ||
    !Array.isArray(value.data) ||
    !value.data.every(isMenuItem)
  ) {
    return false;
  }

  return (
    new Set(value.data.map((item) => item.id)).size === value.data.length &&
    value.data.every(
      (item) =>
        item.category === "pancong" || item.category === "ketan_susu",
    )
  );
}

function isStoredMenuV2(value: unknown): value is StoredMenuV2 {
  if (
    !isRecord(value) ||
    value.version !== STORAGE_VERSION ||
    !isRecord(value.data) ||
    !Array.isArray(value.data.categories) ||
    value.data.categories.length === 0 ||
    !value.data.categories.every(isMenuCategory) ||
    !Array.isArray(value.data.items) ||
    !value.data.items.every(isMenuItem)
  ) {
    return false;
  }

  const categoryIds = new Set(
    value.data.categories.map((category) => category.id),
  );
  const categoryNames = value.data.categories.map((category) =>
    category.name.trim().toLocaleLowerCase("id"),
  );
  return (
    categoryIds.size === value.data.categories.length &&
    new Set(categoryNames).size === categoryNames.length &&
    new Set(value.data.items.map((item) => item.id)).size ===
      value.data.items.length &&
    value.data.items.every((item) => categoryIds.has(item.category))
  );
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
        if (isStoredMenuV2(parsed)) {
          return {
            ...parsed.data,
            items: parsed.data.items.map(normalizeMenuItem),
          };
        }

        if (isStoredMenuV1(parsed)) {
          const itemCategories = new Set(
            parsed.data.map((item) => item.category),
          );
          const categories = DEFAULT_MENU_CATEGORIES.filter((category) =>
            itemCategories.has(category.id),
          );
          return {
            categories:
              categories.length > 0
                ? categories
                : DEFAULT_MENU_CATEGORIES,
            items: parsed.data.map(normalizeMenuItem),
          };
        }

        return null;
      } catch {
        return null;
      }
    },
    save(data) {
      const storage = getStorage();
      if (!storage) return;

      storage.setItem(
        STORAGE_KEY,
        JSON.stringify({ version: STORAGE_VERSION, data }),
      );
    },
  };
}

export const menuPersistence = createMenuPersistence();
