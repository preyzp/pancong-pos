"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "zustand";
import { AppShell } from "../layout/app-shell";
import { Button } from "../pos/button";
import type { PaymentMethod } from "../../types/pos";
import { Input } from "../pos/input";
import {
  PaymentConfirmationDialog,
  PaymentMethodSelector,
} from "./payment-controls";
import { orderStore } from "../../store/order-store";
import { settingsStore } from "../../store/settings-store";

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
  const settings = useStore(settingsStore, (state) => state.settings);
  const settingsInitialized = useStore(
    settingsStore,
    (state) => state.initialized,
  );
  const initializeSettings = useStore(
    settingsStore,
    (state) => state.initialize,
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    null,
  );
  const [cashReceivedInput, setCashReceivedInput] = useState("");
  const [qrisVerified, setQrisVerified] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const paymentInProgress = useRef(false);
  const order = ordersInitialized
    ? orders.find((candidate) => candidate.id === orderId) ?? null
    : null;
  const enabledMethods = settings.enabledPaymentMethods;
  const selectedMethod =
    paymentMethod && enabledMethods.includes(paymentMethod)
      ? paymentMethod
      : null;
  const parsedCashReceived =
    cashReceivedInput.trim() === "" ? null : Number(cashReceivedInput);
  const cashIsValid =
    parsedCashReceived !== null &&
    Number.isSafeInteger(parsedCashReceived) &&
    parsedCashReceived >= (order?.total ?? Number.POSITIVE_INFINITY);
  const change =
    cashIsValid && parsedCashReceived !== null && order
      ? parsedCashReceived - order.total
      : null;
  const canPay = order?.status === "belum_bayar";

  useEffect(() => {
    initializeOrders([]);
  }, [initializeOrders]);

  useEffect(() => {
    initializeSettings();
  }, [initializeSettings]);

  function confirmPayment() {
    if (paymentInProgress.current) return;
    if (
      !selectedMethod ||
      !order ||
      order.status !== "belum_bayar" ||
      !settingsStore
        .getState()
        .settings.enabledPaymentMethods.includes(selectedMethod) ||
      (selectedMethod === "tunai" && !cashIsValid) ||
      (selectedMethod === "qris" && !qrisVerified)
    ) {
      setShowConfirmation(false);
      setPaymentError("Periksa kembali metode dan nominal pembayaran.");
      return;
    }

    paymentInProgress.current = true;
    setIsProcessing(true);
    if (
      !markOrderPaid(
        order.id,
        selectedMethod,
        new Date(),
        selectedMethod === "tunai" ? parsedCashReceived ?? undefined : undefined,
        selectedMethod === "qris" ? qrisVerified : undefined,
      )
    ) {
      paymentInProgress.current = false;
      setIsProcessing(false);
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
      ) : !settingsInitialized ? (
        <p aria-live="polite" className="text-sm text-gray-600">
          Memuat pengaturan pembayaran...
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
            enabledMethods={enabledMethods}
            onChange={(method) => {
              setPaymentMethod(method);
              setQrisVerified(false);
              setPaymentError("");
            }}
            value={selectedMethod}
          />

          {selectedMethod === "tunai" ? (
            <div className="mt-4">
              <Input
                autoComplete="off"
                inputMode="numeric"
                label="Uang diterima"
                min={order.total}
                onChange={(event) => {
                  setCashReceivedInput(event.target.value);
                  setPaymentError("");
                }}
                placeholder="Masukkan nominal uang"
                type="number"
                value={cashReceivedInput}
              />
              <p
                aria-live="polite"
                className="mt-2 text-sm text-gray-600"
              >
                Kembalian:{" "}
                <span className="font-medium text-ink">
                  {change === null ? "—" : formatRupiah(change)}
                </span>
              </p>
              {cashReceivedInput && !cashIsValid ? (
                <p className="mt-2 text-sm text-error" role="alert">
                  Uang diterima harus berupa nominal bulat minimal{" "}
                  {formatRupiah(order.total)}.
                </p>
              ) : null}
            </div>
          ) : null}

          {selectedMethod === "qris" ? (
            <section
              aria-label="Langkah pembayaran QRIS"
              className="mt-4 rounded-lg border border-gray-200 bg-gray-100 p-4"
            >
              <h3 className="text-sm font-semibold text-ink">
                Pembayaran QRIS manual
              </h3>
              <ol className="mt-2 list-inside list-decimal space-y-1 text-sm leading-5 text-gray-600">
                <li>
                  Minta pelanggan memindai QRIS toko yang tersedia di perangkat
                  atau standee toko.
                </li>
                <li>
                  Pastikan aplikasi merchant menunjukkan pembayaran diterima
                  sebesar {formatRupiah(order.total)}.
                </li>
                <li>Konfirmasikan pembayaran di sini setelah diverifikasi.</li>
              </ol>
              <p className="mt-2 text-xs text-gray-600">
                QRIS tidak dibuat atau diproses oleh aplikasi ini.
              </p>
            </section>
          ) : null}

          {paymentError ? (
            <p className="mt-3 text-sm text-error" role="alert">
              {paymentError}
            </p>
          ) : null}
          <div className="mt-5 flex flex-wrap gap-2">
            <Button
              disabled={
                !selectedMethod ||
                (selectedMethod === "tunai" && !cashIsValid) ||
                isProcessing
              }
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

      {showConfirmation && order && selectedMethod ? (
        <PaymentConfirmationDialog
          cashReceived={
            selectedMethod === "tunai" ? parsedCashReceived ?? undefined : undefined
          }
          change={selectedMethod === "tunai" ? change ?? undefined : undefined}
          isProcessing={isProcessing}
          method={selectedMethod}
          onCancel={() => setShowConfirmation(false)}
          onConfirm={confirmPayment}
          onQrisVerifiedChange={setQrisVerified}
          order={order}
          qrisVerified={qrisVerified}
        />
      ) : null}
    </AppShell>
  );
}
