"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "zustand";
import { AppShell } from "../layout/app-shell";
import { CartPanel } from "./cart-panel";
import { ToppingSheet } from "./topping-sheet";
import { Input } from "../pos/input";
import { MenuItemCard } from "../pos/menu-item-card";
import { MOCK_MENU, MOCK_TOPPINGS } from "../../data/mock/menu";
import type { Addon, MenuCategory, MenuItem, Order, OrderItem } from "../../types/pos";
import {
  addOrMergeOrderItem,
  replaceOrderItemConfiguration,
  setOrderItemNote,
  setOrderItemQuantity,
} from "../../lib/orders/cart";
import {
  buildEditedOrder,
  createEditableOrder,
  type EditableOrder,
} from "../../lib/orders/edit-order";
import { validateDraftOrder } from "../../lib/orders/validation";
import { getCartLineKey } from "../../lib/orders/pricing";
import { orderStore } from "../../store/order-store";
import { menuStore } from "../../store/menu-store";

const categories: { id: MenuCategory; label: string }[] = [
  { id: "pancong", label: "Pancong" },
  { id: "ketan_susu", label: "Ketan Susu" },
];

type ToppingSelection = {
  menuItem: MenuItem;
  lineKey?: string;
  quantity: number;
  addons: Addon[];
  note?: string;
};

type EditOrderScreenProps = {
  orderId: string;
  initialOrders: Order[];
  returnTo: string;
};

export function EditOrderScreen({
  initialOrders,
  orderId,
  returnTo,
}: EditOrderScreenProps) {
  const ordersInitialized = useStore(
    orderStore,
    (state) => state.ordersInitialized,
  );

  return (
    <EditOrderContent
      key={`${orderId}:${ordersInitialized}`}
      initialOrders={initialOrders}
      orderId={orderId}
      ordersInitialized={ordersInitialized}
      returnTo={returnTo}
    />
  );
}

type EditOrderContentProps = EditOrderScreenProps & {
  ordersInitialized: boolean;
};

function EditOrderContent({
  initialOrders,
  orderId,
  ordersInitialized,
  returnTo,
}: EditOrderContentProps) {
  const router = useRouter();
  const menu = useStore(menuStore, (state) => state.items);
  const initializeMenu = useStore(menuStore, (state) => state.initialize);
  const activeMenu = menu.filter((item) => item.active !== false);
  const storedOrders = useStore(orderStore, (state) => state.orders);
  const initializeOrders = useStore(
    orderStore,
    (state) => state.initializeOrders,
  );
  const order = ordersInitialized
    ? storedOrders.find((candidate) => candidate.id === orderId)
    : initialOrders.find((candidate) => candidate.id === orderId);
  const [editable, setEditable] = useState<EditableOrder>(() => {
    const existingOrder =
      orderStore.getState().orders.find((candidate) => candidate.id === orderId) ??
      initialOrders.find((candidate) => candidate.id === orderId);

    return existingOrder
      ? createEditableOrder(existingOrder)
      : { customerName: "", items: [] };
  });
  const [selectedTopping, setSelectedTopping] =
    useState<ToppingSelection | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  const [saveError, setSaveError] = useState("");
  const errors = validateDraftOrder(
    editable.customerName,
    editable.items,
    menu,
  );

  useEffect(() => {
    initializeOrders(initialOrders);
  }, [initialOrders, initializeOrders]);

  useEffect(() => {
    initializeMenu(MOCK_MENU);
  }, [initializeMenu]);

  function updateQuantity(lineKey: string, quantity: number) {
    setEditable((current) => ({
      ...current,
      items: setOrderItemQuantity(current.items, lineKey, quantity),
    }));
  }

  function customizeExistingItem(item: OrderItem) {
    const menuItem = menu.find((candidate) => candidate.id === item.menuId);
    if (!menuItem) return;

    setSelectedTopping({
      menuItem: { ...menuItem, price: item.unitPrice },
      lineKey: getCartLineKey(item.menuId, item.addons),
      quantity: item.qty,
      addons: item.addons,
      note: item.note,
    });
  }

  function addCustomizedItem(
    menuItem: MenuItem,
    quantity: number,
    addons: Addon[],
  ) {
    setEditable((current) => ({
      ...current,
      items: selectedTopping?.lineKey
        ? replaceOrderItemConfiguration(
            current.items,
            selectedTopping.lineKey,
            menuItem,
            quantity,
            addons,
            selectedTopping.note,
          )
        : addOrMergeOrderItem(current.items, menuItem, quantity, addons),
    }));
  }

  function saveChanges(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setShowValidation(true);
    setSaveError("");

    if (Object.keys(errors).length > 0 || !order || order.status !== "belum_bayar") {
      return;
    }

    orderStore.getState().initializeOrders(initialOrders);
    const updatedOrder = buildEditedOrder(order, editable, menu);
    if (!orderStore.getState().updateUnpaidOrder(updatedOrder, menu)) {
      setSaveError("Pesanan tidak lagi dapat diedit.");
      return;
    }

    router.push(returnTo);
  }

  return (
    <AppShell active="pesanan" mobileBackHref={returnTo} title="Edit Pesanan">
      {!order || order.status !== "belum_bayar" ? (
        <section className="mx-auto max-w-xl rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-base font-semibold text-ink">
            Pesanan tidak dapat diedit
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Hanya pesanan dengan status Belum Bayar yang dapat diedit.
          </p>
        </section>
      ) : (
        <form className="space-y-5" onSubmit={saveChanges}>
          <div className="max-w-xl">
            <Input
              aria-describedby={
                showValidation && errors.customerName
                  ? "edit-customer-name-error"
                  : undefined
              }
              aria-invalid={showValidation && Boolean(errors.customerName)}
              autoComplete="name"
              id="edit-customer-name"
              label="Nama Pemesan"
              onChange={(event) =>
                setEditable((current) => ({
                  ...current,
                  customerName: event.target.value,
                }))
              }
              placeholder="Masukkan nama pemesan"
              value={editable.customerName}
            />
            {showValidation && errors.customerName ? (
              <p
                className="mt-2 text-xs text-error"
                id="edit-customer-name-error"
                role="alert"
              >
                {errors.customerName}
              </p>
            ) : null}
          </div>

          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <section aria-label="Daftar menu" className="min-w-0 space-y-5">
              {categories.map((category) => (
                <div className="space-y-3" key={category.id}>
                  <h2 className="text-base font-semibold text-ink">
                    {category.label}
                  </h2>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {activeMenu.filter((item) => item.category === category.id).map(
                      (item) => (
                        <MenuItemCard
                          item={item}
                          key={item.id}
                          onAdd={() =>
                            setEditable((current) => ({
                              ...current,
                              items: addOrMergeOrderItem(current.items, item, 1),
                            }))
                          }
                          onCustomize={() =>
                            setSelectedTopping({
                              menuItem: item,
                              quantity: 1,
                              addons: [],
                            })
                          }
                        />
                      ),
                    )}
                  </div>
                </div>
              ))}
            </section>

            <CartPanel
              items={editable.items}
              itemsError={showValidation ? errors.items : undefined}
              menu={menu}
              onCustomizeItem={customizeExistingItem}
              onNoteChange={(lineKey, note) =>
                setEditable((current) => ({
                  ...current,
                  items: setOrderItemNote(current.items, lineKey, note),
                }))
              }
              onQuantityChange={updateQuantity}
              submitLabel="Simpan Perubahan"
            />
          </div>

          {saveError ? (
            <p className="text-sm text-error" role="alert">
              {saveError}
            </p>
          ) : null}
        </form>
      )}

      {selectedTopping ? (
        <ToppingSheet
          key={`${selectedTopping.menuItem.id}:${selectedTopping.lineKey ?? "new"}`}
          initialAddons={selectedTopping.addons}
          initialQuantity={selectedTopping.quantity}
          menuItem={selectedTopping.menuItem}
          onAdd={addCustomizedItem}
          onClose={() => setSelectedTopping(null)}
          submitLabel={
            selectedTopping.lineKey ? "Simpan Add-on" : "Tambah ke Pesanan"
          }
          toppings={MOCK_TOPPINGS}
        />
      ) : null}
    </AppShell>
  );
}