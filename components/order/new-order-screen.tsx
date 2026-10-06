"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "zustand";
import { AppShell } from "@/components/layout/app-shell";
import { CartPanel } from "@/components/order/cart-panel";
import { ToppingSheet } from "@/components/order/topping-sheet";
import { MenuItemCard } from "@/components/pos/menu-item-card";
import { Input } from "@/components/pos/input";
import { MOCK_TOPPINGS } from "@/data/mock/menu";
import type { MenuCategory, MenuItem } from "@/types/pos";
import { validateDraftOrder } from "@/lib/orders/validation";
import { orderStore } from "@/store/order-store";

const categories: { id: MenuCategory; label: string }[] = [
  { id: "pancong", label: "Pancong" },
  { id: "ketan_susu", label: "Ketan Susu" },
];

type NewOrderScreenProps = {
  menu: MenuItem[];
};

export function NewOrderScreen({ menu }: NewOrderScreenProps) {
  const router = useRouter();
  const customerName = useStore(orderStore, (state) => state.customerName);
  const items = useStore(orderStore, (state) => state.items);
  const draftId = useStore(orderStore, (state) => state.draftId);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(
    null,
  );
  const [showValidation, setShowValidation] = useState(false);
  const setCustomerName = orderStore.getState().setCustomerName;
  const addItem = orderStore.getState().addItem;
  const setItemQuantity = orderStore.getState().setItemQuantity;
  const errors = validateDraftOrder(customerName, items);

  function continueToReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setShowValidation(true);

    if (Object.keys(errors).length > 0) return;

    const id = draftId ?? crypto.randomUUID();
    orderStore.getState().setDraftId(id);
    router.push(`/orders/${encodeURIComponent(id)}`);
  }

  return (
    <AppShell active="pesanan" mobileBackHref="/" title="Pesanan Baru">
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
              const categoryMenu = menu.filter(
                (item) => item.category === category.id,
              );

              return (
                <div className="space-y-3" key={category.id}>
                  <h2 className="text-base font-semibold text-ink">
                    {category.label}
                  </h2>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {categoryMenu.map((item) => (
                      <MenuItemCard
                        item={item}
                        key={item.id}
                        onAdd={() => addItem(item, 1)}
                        onCustomize={() => setSelectedMenuItem(item)}
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
            menu={menu}
            onQuantityChange={(lineKey, quantity) =>
              setItemQuantity(lineKey, quantity)
            }
          />
        </div>
      </form>

      {selectedMenuItem ? (
        <ToppingSheet
          key={selectedMenuItem.id}
          menuItem={selectedMenuItem}
          onAdd={(menuItem, quantity, addons) =>
            addItem(menuItem, quantity, addons)
          }
          onClose={() => setSelectedMenuItem(null)}
          toppings={MOCK_TOPPINGS}
        />
      ) : null}
    </AppShell>
  );
}
