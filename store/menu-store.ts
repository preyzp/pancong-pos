import { createStore } from "zustand/vanilla";
import { MOCK_MENU } from "../data/mock/menu";
import type { MenuItem } from "../types/pos";
import { menuPersistence, type MenuPersistence } from "../lib/menu/menu-persistence";

export type MenuState = {
  items: MenuItem[];
  initialized: boolean;
  persistenceError: string | null;
  initialize: (initialItems: MenuItem[]) => void;
  saveItem: (item: MenuItem) => void;
  setActive: (itemId: string, active: boolean) => void;
};

export function createMenuStore(
  persistence: MenuPersistence = menuPersistence,
  initialItems: MenuItem[] = [],
) {
  const store = createStore<MenuState>()((set) => ({
    items: initialItems,
    initialized: false,
    persistenceError: null,
    initialize: (seedItems) =>
      set((state) => {
        if (state.initialized) return state;
        return {
          items: persistence.load() ?? seedItems,
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
  }));

  store.subscribe((state, previousState) => {
    if (!state.initialized || state.items === previousState.items) return;

    try {
      persistence.save(state.items);
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
