import { createStore } from "zustand/vanilla";
import {
  DEFAULT_MENU_CATEGORIES,
  MOCK_MENU,
} from "../data/mock/menu";
import type { MenuCategory, MenuItem } from "../types/pos";
import {
  menuPersistence,
  type MenuPersistence,
  type StoredMenuData,
} from "../lib/menu/menu-persistence";

export type MenuState = {
  categories: MenuCategory[];
  items: MenuItem[];
  initialized: boolean;
  persistenceError: string | null;
  initialize: (
    initialItems: MenuItem[],
    initialCategories?: MenuCategory[],
  ) => void;
  saveItem: (item: MenuItem) => void;
  setActive: (itemId: string, active: boolean) => void;
  saveCategory: (category: MenuCategory) => boolean;
  deleteCategory: (categoryId: string) => boolean;
};

export function createMenuStore(
  persistence: MenuPersistence = menuPersistence,
  initialItems: MenuItem[] = [],
) {
  const store = createStore<MenuState>()((set) => ({
    categories: DEFAULT_MENU_CATEGORIES,
    items: initialItems,
    initialized: false,
    persistenceError: null,
    initialize: (seedItems, seedCategories = DEFAULT_MENU_CATEGORIES) =>
      set((state) => {
        if (state.initialized) return state;
        const stored = persistence.load();
        return {
          categories: stored?.categories ?? seedCategories,
          items: stored?.items ?? seedItems,
          initialized: true,
        };
      }),
    saveItem: (item) =>
      set((state) => {
        const itemIndex = state.items.findIndex(
          (existing) => existing.id === item.id,
        );
        const items =
          itemIndex === -1
            ? [...state.items, item]
            : state.items.map((existing) =>
                existing.id === item.id ? item : existing,
              );
        return { items };
      }),
    setActive: (itemId, active) =>
      set((state) => ({
        items: state.items.map((item) =>
          item.id === itemId ? { ...item, active } : item,
        ),
      })),
    saveCategory: (category) => {
      let didSave = false;
      const normalizedName = category.name.trim();

      set((state) => {
        if (
          !category.id.trim() ||
          !normalizedName ||
          normalizedName.length > 50
        ) {
          return state;
        }
        const duplicate = state.categories.some(
          (existing) =>
            existing.id !== category.id &&
            existing.name.trim().toLocaleLowerCase("id") ===
              normalizedName.toLocaleLowerCase("id"),
        );
        if (duplicate) return state;

        didSave = true;
        const existing = state.categories.some(
          (current) => current.id === category.id,
        );
        return {
          categories: existing
            ? state.categories.map((current) =>
                current.id === category.id
                  ? { ...current, name: normalizedName }
                  : current,
              )
            : [...state.categories, { ...category, name: normalizedName }],
        };
      });

      return didSave;
    },
    deleteCategory: (categoryId) => {
      let didDelete = false;

      set((state) => {
        if (
          state.categories.length <= 1 ||
          state.items.some((item) => item.category === categoryId)
        ) {
          return state;
        }

        const categories = state.categories.filter(
          (category) => category.id !== categoryId,
        );
        if (categories.length === state.categories.length) return state;

        didDelete = true;
        return { categories };
      });

      return didDelete;
    },
  }));

  store.subscribe((state, previousState) => {
    if (
      !state.initialized ||
      (state.items === previousState.items &&
        state.categories === previousState.categories)
    ) {
      return;
    }

    try {
      const data: StoredMenuData = {
        categories: state.categories,
        items: state.items,
      };
      persistence.save(data);
      if (state.persistenceError) {
        store.setState({ persistenceError: null });
      }
    } catch {
      store.setState({
        persistenceError: "Perubahan menu belum tersimpan di perangkat ini.",
      });
    }
  });

  return store;
}

export const menuStore = createMenuStore(menuPersistence, MOCK_MENU);
