"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "zustand";
import { AppShell } from "@/components/layout/app-shell";
import { OrderItemRow } from "@/components/pos/order-item-row";
import { PriceSummary } from "@/components/pos/price-summary";
import { Button } from "@/components/pos/button";
import { MOCK_MENU } from "@/data/mock/menu";
import { calculatePriceSummary, getCartLineKey } from "@/lib/orders/pricing";
import { validateDraftOrder } from "@/lib/orders/validation";
import { orderStore } from "@/store/order-store";
import { menuStore } from "@/store/menu-store";

type OrderReviewScreenProps = {
  orderId: string;
};

export function OrderReviewScreen({ orderId }: OrderReviewScreenProps) {
  const router = useRouter();
  const menu = useStore(menuStore, (state) => state.items);
  const initializeMenu = useStore(menuStore, (state) => state.initialize);
  const customerName = useStore(orderStore, (state) => state.customerName);
  const items = useStore(orderStore, (state) => state.items);
  const draftId = useStore(orderStore, (state) => state.draftId);
  const createOrderFromDraft = useStore(
    orderStore,
    (state) => state.createOrderFromDraft,
  );
  const [showValidation, setShowValidation] = useState(false);
  const [saveError, setSaveError] = useState("");
  const isDraftAvailable = draftId === orderId && items.length > 0;
  const priceSummary = calculatePriceSummary(items, menu);
  const errors = validateDraftOrder(customerName, items, menu);

  useEffect(() => {
    initializeMenu(MOCK_MENU);
  }, [initializeMenu]);

  function confirmOrder() {
    setShowValidation(true);
    setSaveError("");
    if (Object.keys(errors).length > 0) return;

    const result = createOrderFromDraft(menu, "Budi");
    if (!result.ok) {
      setSaveError("Draft pesanan tidak dapat disimpan. Periksa kembali pesanan.");
      return;
    }

    router.push(`/orders/${encodeURIComponent(result.order.id)}`);
  }

  return (
    <AppShell
      active="pesanan"
      mobileBackHref="/orders/new"
      title="Review Pesanan"
    >
      {isDraftAvailable ? (
        <section className="mx-auto max-w-3xl rounded-xl border border-gray-200 bg-white p-4 md:p-6">
          <div className="border-b border-gray-200 pb-4">
            <p className="text-xs text-gray-600">Nama Pemesan</p>
            <h2 className="mt-1 text-base font-semibold text-ink">
              {customerName.trim()}
            </h2>
            {showValidation && errors.customerName ? (
              <p className="mt-2 text-xs text-error" role="alert">
                {errors.customerName}
              </p>
            ) : null}
          </div>
          <ul className="py-4">
            {items.map((item) => {
              const menuItem = menu.find(
                (candidate) => candidate.id === item.menuId,
              );
              if (!menuItem) return null;

              return (
                <OrderItemRow
                  item={item}
                  key={getCartLineKey(item.menuId, item.addons)}
                />
              );
            })}
          </ul>
          {showValidation && errors.items ? (
            <p className="pb-3 text-xs text-error" role="alert">
              {errors.items}
            </p>
          ) : null}
          <PriceSummary {...priceSummary} />
          {saveError ? (
            <p className="mt-3 text-sm text-error" role="alert">
              {saveError}
            </p>
          ) : null}
          <div className="mt-5">
            <Button className="mb-3" fullWidth onClick={confirmOrder}>
              Simpan Pesanan
            </Button>
            <Button
              fullWidth
              onClick={() => router.push("/orders/new")}
              variant="secondary"
            >
              Kembali ke Pesanan Baru
            </Button>
          </div>
        </section>
      ) : (
        <section className="mx-auto max-w-xl rounded-xl border border-gray-200 bg-white p-5 text-center">
          <h2 className="text-base font-semibold text-ink">
            Draft pesanan tidak tersedia
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Silakan buat pesanan baru untuk melanjutkan review.
          </p>
          <Button className="mt-4" onClick={() => router.push("/orders/new")}>
            Pesanan Baru
          </Button>
        </section>
      )}
    </AppShell>
  );
}
