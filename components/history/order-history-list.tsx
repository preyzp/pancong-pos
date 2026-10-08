import { ChevronRight, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "../pos/badge";
import { Button } from "../pos/button";
import type { Order } from "../../types/pos";

type OrderHistoryListProps = {
  orders: Order[];
  onEdit: (order: Order) => void;
  onCancel: (order: Order) => void;
};

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 0,
});

const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  hour: "2-digit",
  hourCycle: "h23",
  minute: "2-digit",
  month: "short",
  timeZone: "Asia/Jakarta",
  year: "numeric",
});

export function OrderHistoryList({
  orders,
  onCancel,
  onEdit,
}: OrderHistoryListProps) {
  if (orders.length === 0) {
    return (
      <p className="rounded-xl border border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-600 md:px-6">
        Tidak ada pesanan yang cocok.
      </p>
    );
  }

  return (
    <ul aria-label="Daftar riwayat pesanan" className="space-y-3 md:space-y-0">
      {orders.map((order) => (
        <li
          className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-2 rounded-lg border border-gray-200 bg-white p-4 md:grid-cols-[minmax(10rem,1.1fr)_minmax(12rem,1.5fr)_minmax(8rem,.9fr)_auto_minmax(8rem,auto)] md:items-center md:gap-4 md:rounded-none md:border-x-0 md:border-t-0 md:px-4 md:py-4 md:first:rounded-t-lg md:last:rounded-b-lg md:last:border-b md:last:border-x md:last:border-gray-200"
          key={order.id}
        >
          <div className="min-w-0">
            <h2 className="wrap-break-word text-sm font-semibold leading-5 text-ink">
              <Link
                aria-label={`Lihat detail pesanan ${order.id} atas nama ${order.customerName}`}
                className="inline-flex max-w-full items-center gap-1 outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink"
                href={`/orders/${encodeURIComponent(order.id)}`}
              >
                <span className="wrap-break-word">
                  Pesanan {order.id} · {order.customerName}
                </span>
                <ChevronRight
                  aria-hidden="true"
                  className="shrink-0"
                  size={18}
                  strokeWidth={2}
                />
              </Link>
            </h2>
            <p className="mt-1 text-xs text-gray-400">
              {dateTimeFormatter.format(new Date(order.createdAt))}
            </p>
          </div>

          <p className="col-span-2 wrap-break-word text-xs leading-5 text-gray-600 md:col-span-1">
            {order.items.map((item) => `${item.qty} ${item.name}`).join(" · ")}
          </p>

          <span className="text-sm font-semibold text-ink">
            Rp {rupiahFormatter.format(order.total)}
          </span>

          <div className="justify-self-end md:justify-self-start">
            <div className="flex flex-col items-end gap-1 md:items-start">
              <Badge status={order.status} />
              {order.paymentMethod ? (
                <span className="text-xs text-gray-600">
                  {order.paymentMethod === "tunai" ? "Tunai" : "QRIS"}
                </span>
              ) : null}
            </div>
          </div>

          {order.status === "belum_bayar" ? (
            <div className="col-span-2 mt-2 flex gap-2 md:col-span-1 md:mt-0 md:justify-end">
              <Button
                className="min-w-0 flex-1 px-2 text-xs sm:flex-none sm:px-4 sm:text-sm"
                onClick={() => onEdit(order)}
                variant="secondary"
              >
                <Pencil aria-hidden="true" size={16} strokeWidth={2} />
                Edit
              </Button>
              <Button
                className="min-w-0 flex-1 px-2 text-xs text-error sm:flex-none sm:px-4 sm:text-sm"
                onClick={() => onCancel(order)}
                variant="secondary"
              >
                <Trash2 aria-hidden="true" size={16} strokeWidth={2} />
                Batalkan
              </Button>
            </div>
          ) : (
            <span className="hidden md:block" />
          )}
        </li>
      ))}
    </ul>
  );
}
