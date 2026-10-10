"use client";

import { useEffect } from "react";
import { useStore } from "zustand";
import { AppShell } from "@/components/layout/app-shell";
import { MOCK_MENU } from "@/data/mock/menu";
import { calculateSalesOverview } from "@/lib/dashboard/metrics";
import { menuStore } from "@/store/menu-store";
import { orderStore } from "@/store/order-store";
import type { MenuItem, Order } from "@/types/pos";

type SalesScreenProps = {
  asOf: string;
  initialMenu: MenuItem[];
  initialOrders: Order[];
};

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 0,
});

function formatRupiah(amount: number): string {
  return `Rp ${rupiahFormatter.format(amount)}`;
}

function SalesMetric({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-xl border border-gray-200 bg-white p-4 md:p-5">
      <h2 className="text-xs font-medium text-gray-600">{label}</h2>
      <p className="mt-3 wrap-break-word text-xl font-semibold text-ink md:text-2xl">
        {value}
      </p>
    </article>
  );
}

export function SalesScreen({
  asOf,
  initialMenu,
  initialOrders,
}: SalesScreenProps) {
  const storedOrders = useStore(orderStore, (state) => state.orders);
  const ordersInitialized = useStore(
    orderStore,
    (state) => state.ordersInitialized,
  );
  const initializeOrders = useStore(
    orderStore,
    (state) => state.initializeOrders,
  );
  const currentMenu = useStore(menuStore, (state) => state.items);
  const initializeMenu = useStore(menuStore, (state) => state.initialize);
  const categories = useStore(menuStore, (state) => state.categories);
  const orders = ordersInitialized ? storedOrders : initialOrders;
  const menu =
    currentMenu.length > 0
      ? currentMenu
      : initialMenu.length > 0
        ? initialMenu
        : MOCK_MENU;
  const referenceTime = new Date(asOf);
  const overview = calculateSalesOverview(orders, menu, referenceTime);
  const todayLabel = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    timeZone: "Asia/Jakarta",
    year: "numeric",
  }).format(referenceTime);
  const categoryNames = new Map(
    categories.map((category) => [category.id, category.name]),
  );
  const maxDailySales = Math.max(
    ...overview.lastSevenDays.map((day) => day.total),
    0,
  );

  useEffect(() => {
    initializeOrders(initialOrders);
  }, [initialOrders, initializeOrders]);

  useEffect(() => {
    initializeMenu(initialMenu.length > 0 ? initialMenu : MOCK_MENU);
  }, [initializeMenu, initialMenu]);

  return (
    <AppShell active="penjualan" title="Penjualan">
      <div className="mx-auto w-full max-w-6xl space-y-5 md:space-y-6">
        <p className="text-sm text-gray-600">
          Ringkasan penjualan hari ini · {todayLabel}
        </p>

        <section
          aria-label="Ringkasan penjualan"
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          <SalesMetric
            label="Total Penjualan Hari Ini"
            value={formatRupiah(overview.salesToday)}
          />
          <SalesMetric
            label="Pesanan Lunas"
            value={String(overview.paidOrdersToday)}
          />
          <SalesMetric
            label="Rata-rata per Pesanan"
            value={formatRupiah(overview.averageOrderValue)}
          />
        </section>

        <section
          aria-labelledby="sales-menu-heading"
          className="rounded-xl border border-gray-200 bg-white p-4 md:p-6"
        >
          <div className="mb-4">
            <h2
              className="text-base font-semibold text-ink"
              id="sales-menu-heading"
            >
              Penjualan per Menu
            </h2>
            <p className="mt-1 text-xs text-gray-600">
              Berdasarkan pesanan lunas hari ini; add-on dihitung bersama menu
              yang dipesan.
            </p>
          </div>
          {overview.menuSalesToday.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[34rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-xs text-gray-600">
                    <th className="pb-3 pr-4 font-medium" scope="col">
                      Menu
                    </th>
                    <th
                      className="pb-3 px-4 text-right font-medium"
                      scope="col"
                    >
                      Terjual
                    </th>
                    <th
                      className="pb-3 pl-4 text-right font-medium"
                      scope="col"
                    >
                      Penjualan
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {overview.menuSalesToday.map((item) => (
                    <tr
                      className="border-b border-gray-100 last:border-0"
                      key={item.menuId}
                    >
                      <th
                        className="py-3 pr-4 font-medium text-ink"
                        scope="row"
                      >
                        <span className="block">{item.name}</span>
                        <span className="mt-1 block text-xs font-normal text-gray-600">
                          {categoryNames.get(item.category) ?? item.category}
                        </span>
                      </th>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {item.qtySold}
                      </td>
                      <td className="py-3 pl-4 text-right font-medium text-ink">
                        {formatRupiah(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-gray-200">
                    <th
                      className="pt-3 pr-4 text-left text-sm font-semibold text-ink"
                      scope="row"
                    >
                      Total
                    </th>
                    <td className="px-4 pt-3 text-right text-sm font-semibold text-ink">
                      {overview.menuSalesToday.reduce(
                        (total, item) => total + item.qtySold,
                        0,
                      )}
                    </td>
                    <td className="pt-3 pl-4 text-right text-sm font-semibold text-ink">
                      {formatRupiah(
                        overview.menuSalesToday.reduce(
                          (total, item) => total + item.total,
                          0,
                        ),
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <p className="rounded-lg bg-gray-100 px-4 py-8 text-center text-sm text-gray-600">
              Belum ada pesanan lunas hari ini.
            </p>
          )}
        </section>

        <section
          aria-labelledby="sales-week-heading"
          className="rounded-xl border border-gray-200 bg-white p-4 md:p-6"
        >
          <div className="mb-5">
            <h2
              className="text-base font-semibold text-ink"
              id="sales-week-heading"
            >
              Penjualan 7 Hari Terakhir
            </h2>
            <p className="mt-1 text-xs text-gray-600">
              Total transaksi lunas per hari.
            </p>
          </div>
          <div
            aria-label="Grafik penjualan harian"
            className="grid grid-cols-7 items-end gap-2 md:gap-4"
            role="img"
          >
            {overview.lastSevenDays.map((day) => {
              const barHeight =
                maxDailySales === 0
                  ? 0
                  : Math.max(8, (day.total / maxDailySales) * 100);

              return (
                <div
                  className="flex min-w-0 flex-col items-center gap-2"
                  key={day.date}
                  title={`${day.label}: ${formatRupiah(day.total)} · ${day.orderCount} pesanan`}
                >
                  <span className="hidden text-center text-[10px] leading-tight text-gray-600 sm:block">
                    {day.total > 0 ? formatRupiah(day.total) : "—"}
                  </span>
                  <div className="flex h-32 w-full items-end justify-center">
                    <div
                      aria-hidden="true"
                      className="w-full max-w-10 rounded-t-md bg-ink"
                      style={{ height: `${barHeight}%` }}
                    />
                  </div>
                  <span className="text-center text-[10px] leading-tight text-gray-600 sm:text-xs">
                    {day.label}
                  </span>
                </div>
              );
            })}
          </div>
          <ul className="sr-only">
            {overview.lastSevenDays.map((day) => (
              <li key={day.date}>
                {day.label}: {formatRupiah(day.total)}, {day.orderCount} pesanan
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
