"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useStore } from "zustand";
import { AppShell } from "../layout/app-shell";
import { CancelOrderDialog } from "../order/cancel-order-dialog";
import { Button } from "../pos/button";
import { Input } from "../pos/input";
import { OrderHistoryList } from "./order-history-list";
import { cancelUnpaidOrder } from "../../lib/dashboard/order-actions";
import {
  filterHistoryOrders,
  type HistoryStatusFilter,
} from "../../lib/history/filter-orders";
import type { Order } from "../../types/pos";
import { orderStore } from "../../store/order-store";

type OrderHistoryScreenProps = {
  initialOrders: Order[];
};

const statusFilters: { label: string; value: HistoryStatusFilter }[] = [
  { label: "Semua", value: "semua" },
  { label: "Lunas", value: "lunas" },
  { label: "Belum Bayar", value: "belum_bayar" },
  { label: "Dibatalkan", value: "dibatalkan" },
];

export function OrderHistoryScreen({ initialOrders }: OrderHistoryScreenProps) {
  const router = useRouter();
  const storedOrders = useStore(orderStore, (state) => state.orders);
  const ordersInitialized = useStore(
    orderStore,
    (state) => state.ordersInitialized,
  );
  const orders = ordersInitialized ? storedOrders : initialOrders;
  const initializeOrders = useStore(
    orderStore,
    (state) => state.initializeOrders,
  );
  const setOrders = useStore(orderStore, (state) => state.setOrders);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<HistoryStatusFilter>("semua");
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const filteredOrders = filterHistoryOrders(orders, query, status);

  useEffect(() => {
    initializeOrders(initialOrders);
  }, [initialOrders, initializeOrders]);

  function confirmCancellation() {
    if (!orderToCancel || orderToCancel.status !== "belum_bayar") return;

    setOrders(cancelUnpaidOrder(orders, orderToCancel.id));
    setOrderToCancel(null);
  }

  return (
    <AppShell active="riwayat" title="Riwayat Pesanan">
      <div className="space-y-4 md:space-y-5">
        <div className="max-w-xl">
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute bottom-3 left-3 size-5 text-gray-400"
              strokeWidth={2}
            />
            <Input
              className="pl-10"
              label="Cari Pesanan"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Nomor, nama pemesan, atau menu"
              type="search"
              value={query}
            />
          </div>
        </div>

        <div
          aria-label="Filter status pesanan"
          className="flex flex-wrap gap-2"
          role="tablist"
        >
          {statusFilters.map((filter) => {
            const selected = status === filter.value;

            return (
              <Button
                aria-selected={selected}
                className="h-10 rounded-full px-3 text-xs"
                key={filter.value}
                onClick={() => setStatus(filter.value)}
                role="tab"
                variant={selected ? "primary" : "secondary"}
              >
                {filter.label}
              </Button>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-3">
          <p aria-live="polite" className="text-xs text-gray-600">
            {filteredOrders.length} pesanan
          </p>
        </div>

        <OrderHistoryList
          onCancel={setOrderToCancel}
          onEdit={(order) =>
            router.push(
              `/orders/${encodeURIComponent(order.id)}/edit?returnTo=%2Fhistory`,
            )
          }
          orders={filteredOrders}
        />
      </div>

      {orderToCancel ? (
        <CancelOrderDialog
          onCancel={() => setOrderToCancel(null)}
          onConfirm={confirmCancellation}
          order={orderToCancel}
        />
      ) : null}
    </AppShell>
  );
}
