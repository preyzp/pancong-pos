"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "zustand";
import { AppShell } from "../layout/app-shell";
import { CancelOrderDialog } from "./cancel-order-dialog";
import { OrderDetailView } from "./order-detail-view";
import { cancelUnpaidOrder } from "../../lib/dashboard/order-actions";
import type { Order } from "../../types/pos";
import { orderStore } from "../../store/order-store";

type OrderDetailScreenProps = {
  orderId: string;
};

export function OrderDetailScreen({ orderId }: OrderDetailScreenProps) {
  const router = useRouter();
  const orders = useStore(orderStore, (state) => state.orders);
  const ordersInitialized = useStore(
    orderStore,
    (state) => state.ordersInitialized,
  );
  const initializeOrders = useStore(
    orderStore,
    (state) => state.initializeOrders,
  );
  const setOrders = useStore(orderStore, (state) => state.setOrders);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const order = ordersInitialized
    ? orders.find((candidate) => candidate.id === orderId) ?? null
    : null;

  useEffect(() => {
    initializeOrders([]);
  }, [initializeOrders]);

  function confirmCancellation() {
    if (!orderToCancel || orderToCancel.status !== "belum_bayar") return;

    setOrders(cancelUnpaidOrder(orders, orderToCancel.id));
    setOrderToCancel(null);
  }

  return (
    <AppShell
      active="riwayat"
      mobileBackHref="/history"
      title="Detail Pesanan"
    >
      <OrderDetailView
        loading={!ordersInitialized}
        onCancel={setOrderToCancel}
        onEdit={(selectedOrder) =>
          router.push(
            `/orders/${encodeURIComponent(selectedOrder.id)}/edit?returnTo=${encodeURIComponent(`/orders/${encodeURIComponent(selectedOrder.id)}`)}`,
          )
        }
        order={order}
      />
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
