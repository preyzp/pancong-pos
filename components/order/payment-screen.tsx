"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "zustand";
import { AppShell } from "../layout/app-shell";
import { Button } from "../pos/button";
import type { PaymentMethod } from "../../types/pos";
import {
  PaymentConfirmationDialog,
  PaymentMethodSelector,
} from "./payment-controls";
import { orderStore } from "../../store/order-store";

type PaymentScreenProps = {
  orderId: string;
};

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 0,
});

function formatRupiah(amount: number): string {
  return `Rp ${rupiahFormatter.format(amount)}`;
}

export function PaymentScreen({ orderId }: PaymentScreenProps) {
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
  const markOrderPaid = useStore(orderStore, (state) => state.markOrderPaid);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    null,
  );
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const order = ordersInitialized
    ? orders.find((candidate) => candidate.id === orderId) ?? null
    : null;
  const canPay = order?.status === "belum_bayar";

  useEffect(() => {
    initializeOrders([]);
  }, [initializeOrders]);

  function confirmPayment() {
    if (!paymentMethod || !order || order.status !== "belum_bayar") {
      setShowConfirmation(false);
      setPaymentError("Pesanan tidak lagi dapat dibayar.");
      return;
    }

    if (!markOrderPaid(order.id, paymentMethod)) {
      setShowConfirmation(false);
      setPaymentError("Pembayaran tidak dapat dikonfirmasi.");
      return;
    }

    router.push(`/orders/${encodeURIComponent(order.id)}`);
  }

  return (
    <AppShell
      active="riwayat"
      mobileBackHref={`/orders/${encodeURIComponent(orderId)}`}
      title="Pembayaran"
    >
      {!ordersInitialized ? (
        <p aria-live="polite" className="text-sm text-gray-600">
          Memuat pesanan...
        </p>
      ) : !order ? (
        <section className="mx-auto max-w-xl rounded-xl border border-gray-200 bg-white p-5 text-center">
          <h2 className="text-base font-semibold text-ink">
            Pesanan tidak ditemukan
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Pesanan mungkin sudah tidak tersedia di perangkat ini.
          </p>
          <Link
            className="mt-4 inline-flex h-11 items-center justify-center rounded-md border border-gray-200 bg-white px-4 text-sm font-medium text-ink outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink"
            href="/history"
          >
            Kembali ke Riwayat
          </Link>
        </section>
      ) : !canPay ? (
        <section className="mx-auto max-w-xl rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-base font-semibold text-ink">
            Pesanan sudah lunas
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Pesanan ini sudah dibayar dan tidak dapat dibayar kembali.
          </p>
          <Link
            className="mt-4 inline-flex h-11 items-center justify-center rounded-md border border-gray-200 bg-white px-4 text-sm font-medium text-ink outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink"
            href={`/orders/${encodeURIComponent(order.id)}`}
          >
            Kembali ke Detail Pesanan
          </Link>
        </section>
      ) : (
        <section className="mx-auto max-w-xl rounded-xl border border-gray-200 bg-white p-4 md:p-6">
          <div className="flex items-center justify-between gap-4 border-b border-gray-200 pb-4">
            <div>
              <p className="text-xs text-gray-600">Pesanan {order.id}</p>
              <h2 className="mt-1 text-sm font-semibold text-ink">
                {order.customerName}
              </h2>
            </div>
            <p className="text-base font-semibold text-ink">
              {formatRupiah(order.total)}
            </p>
          </div>

          <PaymentMethodSelector
            onChange={(method) => {
              setPaymentMethod(method);
              setPaymentError("");
            }}
            value={paymentMethod}
          />

          {paymentError ? (
            <p className="mt-3 text-sm text-error" role="alert">
              {paymentError}
            </p>
          ) : null}
          <div className="mt-5 flex flex-wrap gap-2">
            <Button
              disabled={!paymentMethod}
              onClick={() => {
                setPaymentError("");
                setShowConfirmation(true);
              }}
            >
              Konfirmasi Pembayaran
            </Button>
            <Link
              className="inline-flex h-11 items-center justify-center rounded-md border border-gray-200 bg-white px-4 text-sm font-medium text-ink outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink"
              href={`/orders/${encodeURIComponent(order.id)}`}
            >
              Kembali
            </Link>
          </div>
        </section>
      )}

      {showConfirmation && order && paymentMethod ? (
        <PaymentConfirmationDialog
          method={paymentMethod}
          onCancel={() => setShowConfirmation(false)}
          onConfirm={confirmPayment}
          order={order}
        />
      ) : null}
    </AppShell>
  );
}
