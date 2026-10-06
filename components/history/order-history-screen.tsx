"use client";

import { useState } from "react";
import { Search } from "lucide-react";
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
  const [orders, setOrders] = useState(initialOrders);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<HistoryStatusFilter>("semua");
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const filteredOrders = filterHistoryOrders(orders, query, status);

  function confirmCancellation() {
    if (!orderToCancel || orderToCancel.status !== "belum_bayar") return;

    setOrders((currentOrders) =>
      cancelUnpaidOrder(currentOrders, orderToCancel.id),
    );
    setOrderToCancel(null);
  }

  return (
    <AppShell active="riwayat" title="Riwayat Pesanan">
      <div className="space-y-4 md:space-y-5">
        <div className="max-w-xl">
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-[38px] size-5 text-gray-400"
              strokeWidth={2}
            />
            <Input
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

        <OrderHistoryList onCancel={setOrderToCancel} orders={filteredOrders} />
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
