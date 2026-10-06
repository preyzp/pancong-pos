"use client";

import { useRouter } from "next/navigation";
import { useStore } from "zustand";
import { AppShell } from "@/components/layout/app-shell";
import { OrderItemRow } from "@/components/pos/order-item-row";
import { PriceSummary } from "@/components/pos/price-summary";
import { Button } from "@/components/pos/button";
import { MOCK_MENU } from "@/data/mock/menu";
import { calculatePriceSummary, getCartLineKey } from "@/lib/orders/pricing";
import { orderStore } from "@/store/order-store";

type OrderReviewScreenProps = {
  orderId: string;
};

export function OrderReviewScreen({ orderId }: OrderReviewScreenProps) {
  const router = useRouter();
  const customerName = useStore(orderStore, (state) => state.customerName);
  const items = useStore(orderStore, (state) => state.items);
  const draftId = useStore(orderStore, (state) => state.draftId);
  const isDraftAvailable = draftId === orderId && items.length > 0;
  const priceSummary = calculatePriceSummary(items, MOCK_MENU);

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
          </div>
          <ul className="py-4">
            {items.map((item) => {
              const menuItem = MOCK_MENU.find(
                (candidate) => candidate.id === item.menuId,
              );
              if (!menuItem) return null;

              return (
                <OrderItemRow
                  item={item}
                  key={getCartLineKey(item.menuId, item.addons)}
                  menuItem={menuItem}
                />
              );
            })}
          </ul>
          <PriceSummary {...priceSummary} />
          <div className="mt-5">
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
