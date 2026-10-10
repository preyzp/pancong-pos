"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "zustand";
import { AppShell } from "@/components/layout/app-shell";
import { CartPanel } from "@/components/order/cart-panel";
import { AddonSheet } from "@/components/order/addon-sheet";
import { MenuItemCard } from "@/components/pos/menu-item-card";
import { Input } from "@/components/pos/input";
import {
  DEFAULT_MENU_CATEGORIES,
  MOCK_MENU,
  MOCK_ADDONS,
} from "@/data/mock/menu";
import type { OrderItemAddon, MenuItem, Order, OrderItem } from "@/types/pos";
import { validateDraftOrder } from "@/lib/orders/validation";
import { replaceOrderItemConfiguration } from "@/lib/orders/cart";
import { getSelectableAddons } from "@/lib/addons/addons";
import { getCartLineKey } from "@/lib/orders/pricing";
import { orderStore } from "@/store/order-store";
import { menuStore } from "@/store/menu-store";

type AddonSelection = {
  menuItem: MenuItem;
  lineKey?: string;
  quantity: number;
  addons: OrderItemAddon[];
  note?: string;
};

type NewOrderScreenProps = {
  menu: MenuItem[];
  initialOrders: Order[];
};

export function NewOrderScreen({ initialOrders, menu }: NewOrderScreenProps) {
  const router = useRouter();
  const currentMenu = useStore(menuStore, (state) => state.items);
  const categories = useStore(menuStore, (state) => state.categories);
  const initializeMenu = useStore(menuStore, (state) => state.initialize);
  const activeMenu = currentMenu.filter((item) => item.active !== false);
  const customerName = useStore(orderStore, (state) => state.customerName);
  const items = useStore(orderStore, (state) => state.items);
  const draftId = useStore(orderStore, (state) => state.draftId);
  const [addonSelection, setAddonSelection] =
    useState<AddonSelection | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  const setCustomerName = orderStore.getState().setCustomerName;
  const addItem = orderStore.getState().addItem;
  const setItemQuantity = orderStore.getState().setItemQuantity;
  const setItemNote = orderStore.getState().setItemNote;
  const initializeOrders = orderStore.getState().initializeOrders;
  const customizeCartItem = (item: OrderItem) => {
    const menuItem = currentMenu.find((candidate) => candidate.id === item.menuId);
    if (!menuItem) return;

    setAddonSelection({
      menuItem: { ...menuItem, price: item.unitPrice },
      lineKey: getCartLineKey(item.menuId, item.addons),
      quantity: item.qty,
      addons: item.addons,
      note: item.note,
    });
  };
  const errors = validateDraftOrder(customerName, items, currentMenu);

  useEffect(() => {
    initializeOrders(initialOrders);
  }, [initialOrders, initializeOrders]);

  useEffect(() => {
    initializeMenu(
      menu.length > 0 ? menu : MOCK_MENU,
      DEFAULT_MENU_CATEGORIES,
    );
  }, [initializeMenu, menu]);

  function continueToReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setShowValidation(true);

    if (Object.keys(errors).length > 0) return;

    const id = draftId ?? crypto.randomUUID();
    orderStore.getState().setDraftId(id);
    router.push(`/orders/review/${encodeURIComponent(id)}`);
  }

  return (
    <AppShell active="pesanan" title="Pesanan Baru">
      <form className="space-y-5" onSubmit={continueToReview}>
        <div className="max-w-xl">
          <Input
            aria-describedby={
              showValidation && errors.customerName
                ? "customer-name-error"
                : undefined
            }
            aria-invalid={showValidation && Boolean(errors.customerName)}
            autoComplete="name"
            id="customer-name"
            label="Nama Pemesan"
            onChange={(event) => setCustomerName(event.target.value)}
            placeholder="Masukkan nama pemesan"
            value={customerName}
          />
          {showValidation && errors.customerName ? (
            <p
              className="mt-2 text-xs text-error"
              id="customer-name-error"
              role="alert"
            >
              {errors.customerName}
            </p>
          ) : null}
        </div>

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <section aria-label="Daftar menu" className="min-w-0 space-y-5">
            {categories.map((category) => {
              const categoryMenu = activeMenu.filter(
                (item) => item.category === category.id,
              );

              return (
                <div className="space-y-3" key={category.id}>
                  <h2 className="text-base font-semibold text-ink">
                    {category.name}
                  </h2>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {categoryMenu.map((item) => (
                      <MenuItemCard
                        item={item}
                        key={item.id}
                        onAdd={() => addItem(item, 1)}
                        onCustomize={
                          getSelectableAddons(item, MOCK_ADDONS).length > 0
                            ? () =>
                                setAddonSelection({
                                  menuItem: item,
                                  quantity: 1,
                                  addons: [],
                                })
                            : undefined
                        }
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </section>

          <CartPanel
            items={items}
            itemsError={showValidation ? errors.items : undefined}
            onCustomizeItem={customizeCartItem}
            onNoteChange={setItemNote}
            onQuantityChange={(lineKey, quantity) =>
              setItemQuantity(lineKey, quantity)
            }
          />
        </div>
      </form>

      {addonSelection ? (
        <AddonSheet
          key={`${addonSelection.menuItem.id}:${addonSelection.lineKey ?? "new"}`}
          initialAddons={addonSelection.addons}
          initialQuantity={addonSelection.quantity}
          menuItem={addonSelection.menuItem}
          onAdd={(menuItem, quantity, addons) => {
            const lineKey = addonSelection.lineKey;
            if (lineKey) {
              orderStore.setState((state) => ({
                items: replaceOrderItemConfiguration(
                  state.items,
                  lineKey,
                  menuItem,
                  quantity,
                  addons,
                  addonSelection.note,
                ),
              }));
              return;
            }

            addItem(menuItem, quantity, addons);
          }}
          onClose={() => setAddonSelection(null)}
          submitLabel={
            addonSelection.lineKey ? "Simpan perubahan" : "Tambah ke Pesanan"
          }
          addons={getSelectableAddons(addonSelection.menuItem, MOCK_ADDONS)}
        />
      ) : null}
    </AppShell>
  );
}
