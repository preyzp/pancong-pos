"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChartColumn,
  CircleAlert,
  CircleCheck,
  ChevronRight,
  Pencil,
  Plus,
  ReceiptText,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/pos/badge";
import { Button } from "@/components/pos/button";
import type { MenuItem, Order } from "@/types/pos";
import {
  calculateBestSellersToday,
  calculateDashboardKpis,
  getRecentOrdersToday,
} from "@/lib/dashboard/metrics";
import { cancelUnpaidOrder } from "@/lib/dashboard/order-actions";

type DashboardContentProps = {
  asOf: string;
  initialOrders: Order[];
  menu: MenuItem[];
};

type MetricCardProps = {
  icon: LucideIcon;
  label: string;
  tone: "default" | "success" | "error";
  value: string;
};

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 0,
});

function formatRupiah(amount: number): string {
  return `Rp ${rupiahFormatter.format(amount)}`;
}

function MetricCard({ icon: Icon, label, tone, value }: MetricCardProps) {
  const toneClass =
    tone === "success"
      ? "text-success"
      : tone === "error"
        ? "text-error"
        : "text-ink";

  return (
    <article className="min-w-0 rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
        <Icon
          aria-hidden="true"
          className={`size-5 shrink-0 ${toneClass}`}
          strokeWidth={2}
        />
        <h2 className="min-w-0">{label}</h2>
      </div>
      <p
        className={`mt-3 break-words text-[22px] font-semibold leading-tight ${toneClass}`}
      >
        {value}
      </p>
    </article>
  );
}

function formatRelativeTime(createdAt: string, asOf: Date): string {
  const elapsedMinutes = Math.max(
    0,
    Math.floor((asOf.getTime() - new Date(createdAt).getTime()) / 60000),
  );

  if (elapsedMinutes < 1) {
    return "Baru saja";
  }

  if (elapsedMinutes < 60) {
    return `${elapsedMinutes} menit lalu`;
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60);

  if (elapsedHours < 24) {
    return `${elapsedHours} jam lalu`;
  }

  return "Lebih dari sehari lalu";
}

export function DashboardContent({
  asOf,
  initialOrders,
  menu,
}: DashboardContentProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const referenceTime = new Date(asOf);
  const kpis = calculateDashboardKpis(orders, referenceTime);
  const bestSellers = calculateBestSellersToday(orders, menu, referenceTime);
  const recentOrders = getRecentOrdersToday(orders, referenceTime);
  const metrics: MetricCardProps[] = [
    {
      label: "Penjualan Hari Ini",
      value: formatRupiah(kpis.salesToday),
      icon: ChartColumn,
      tone: "default",
    },
    {
      label: "Pesanan",
      value: String(kpis.ordersToday),
      icon: ReceiptText,
      tone: "default",
    },
    {
      label: "Lunas",
      value: String(kpis.paidToday),
      icon: CircleCheck,
      tone: "success",
    },
    {
      label: "Belum Bayar",
      value: String(kpis.unpaidToday),
      icon: CircleAlert,
      tone: "error",
    },
  ];

  function confirmCancellation() {
    if (!orderToCancel || orderToCancel.status !== "belum_bayar") {
      return;
    }

    setOrders((currentOrders) =>
      cancelUnpaidOrder(currentOrders, orderToCancel.id),
    );
    setOrderToCancel(null);
  }

  return (
    <div className="space-y-5 md:space-y-6">
      <section
        aria-label="Ringkasan hari ini"
        className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-5"
      >
        <article className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 md:hidden">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-sm font-medium text-gray-600">
                Penjualan Hari Ini
              </h2>
              <p className="mt-2 break-words text-[28px] font-semibold leading-tight text-ink md:text-[32px]">
                {formatRupiah(kpis.salesToday)}
              </p>
            </div>
            <ChartColumn
              aria-hidden="true"
              className="size-6 shrink-0 text-gray-600"
              strokeWidth={2}
            />
          </div>
          <p className="mt-3 text-xs text-gray-600 md:text-sm">
            {kpis.ordersToday} pesanan · {kpis.paidToday} lunas ·{" "}
            {kpis.unpaidToday} belum bayar
          </p>
        </article>

        <div className="hidden grid-cols-2 gap-3 md:grid xl:grid-cols-4">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </div>

        <Link
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-ink bg-ink px-4 text-sm font-medium text-white outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink lg:w-auto lg:min-w-44"
          href="/orders/new"
        >
          <Plus aria-hidden="true" size={20} strokeWidth={2} />
          Pesanan Baru
        </Link>
      </section>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(18rem,1fr)] lg:gap-5">
        <section
          aria-labelledby="recent-orders-heading"
          className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 md:p-5"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2
              className="text-base font-semibold text-ink"
              id="recent-orders-heading"
            >
              Pesanan Terbaru
            </h2>
            <Link
              className="inline-flex min-h-10 items-center gap-1 text-xs font-medium text-gray-600 outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink"
              href="/history"
            >
              Lihat semua
              <ChevronRight aria-hidden="true" size={16} strokeWidth={2} />
            </Link>
          </div>

          {recentOrders.length > 0 ? (
            <ul>
              {recentOrders.map((order) => (
                <li
                  className="border-t border-gray-200 py-3 first:border-t-0 first:pt-0 last:pb-0"
                  key={order.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="break-words text-sm font-semibold leading-5 text-ink">
                        Pesanan {order.id} · {order.customerName}
                      </h3>
                      <p className="mt-0.5 text-xs text-gray-400">
                        {formatRelativeTime(order.createdAt, referenceTime)}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <span className="text-sm font-semibold text-ink">
                        {formatRupiah(order.total)}
                      </span>
                      <Badge status={order.status} />
                    </div>
                  </div>
                  <p className="mt-1 break-words text-xs leading-5 text-gray-600">
                    {order.items
                      .map((item) => `${item.qty} ${item.name}`)
                      .join(" · ")}
                  </p>

                  {order.status === "belum_bayar" ? (
                    <div className="mt-2 flex gap-2">
                      <Button
                        className="min-w-0 flex-1 px-2 text-xs sm:flex-none sm:px-4 sm:text-sm"
                        disabled
                        title="Fitur edit pesanan belum tersedia."
                        variant="secondary"
                      >
                        <Pencil aria-hidden="true" size={16} strokeWidth={2} />
                        Edit
                      </Button>
                      <Button
                        className="min-w-0 flex-1 px-2 text-xs text-error sm:flex-none sm:px-4 sm:text-sm"
                        onClick={() => setOrderToCancel(order)}
                        variant="secondary"
                      >
                        <Trash2 aria-hidden="true" size={16} strokeWidth={2} />
                        Batalkan
                      </Button>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-sm text-gray-600">
              Belum ada pesanan hari ini.
            </p>
          )}
        </section>

        <section
          aria-labelledby="best-sellers-heading"
          className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 md:p-5"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2
              className="text-base font-semibold text-ink"
              id="best-sellers-heading"
            >
              Menu Terlaris
            </h2>
            <span className="text-xs text-gray-600">Hari ini</span>
          </div>

          {bestSellers.length > 0 ? (
            <ol>
              {bestSellers.map((item, index) => (
                <li
                  className="flex items-center justify-between gap-3 border-t border-gray-200 py-3 first:border-t-0 first:pt-0 last:pb-0"
                  key={item.id}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                      {index + 1}
                    </span>
                    <span className="break-words text-sm font-medium text-ink">
                      {item.name}
                    </span>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-gray-900">
                    {item.qtySold} porsi
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="py-6 text-center text-sm text-gray-600">
              Belum ada menu terjual hari ini.
            </p>
          )}
        </section>
      </div>

      {orderToCancel ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/45 p-5"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setOrderToCancel(null);
            }
          }}
        >
          <section
            aria-labelledby="cancel-order-title"
            aria-modal="true"
            className="w-full max-w-md rounded-2xl bg-white p-5 md:p-6"
            role="dialog"
          >
            <div className="flex items-start gap-3">
              <CircleAlert
                aria-hidden="true"
                className="mt-0.5 size-5 shrink-0 text-error"
                strokeWidth={2}
              />
              <div>
                <h2
                  className="text-base font-semibold text-ink"
                  id="cancel-order-title"
                >
                  Batalkan pesanan {orderToCancel.id}?
                </h2>
                <p className="mt-2 text-sm leading-5 text-gray-600">
                  Pesanan atas nama {orderToCancel.customerName} akan ditandai
                  sebagai dibatalkan.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                onClick={() => setOrderToCancel(null)}
                variant="secondary"
              >
                Kembali
              </Button>
              <Button
                className="border-error bg-error"
                onClick={confirmCancellation}
              >
                Batalkan Pesanan
              </Button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
