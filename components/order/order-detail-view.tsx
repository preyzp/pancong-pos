import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "../pos/badge";
import { Button } from "../pos/button";
import type { Order } from "../../types/pos";

type OrderDetailViewProps = {
  order: Order | null;
  loading: boolean;
  onEdit: (order: Order) => void;
  onCancel: (order: Order) => void;
};

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 0,
});

function formatRupiah(amount: number): string {
  return `Rp ${rupiahFormatter.format(amount)}`;
}

export function OrderDetailView({
  loading,
  onCancel,
  onEdit,
  order,
}: OrderDetailViewProps) {
  if (loading) {
    return (
      <p aria-live="polite" className="text-sm text-gray-600">
        Memuat pesanan...
      </p>
    );
  }

  if (!order) {
    return (
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
    );
  }

  return (
    <section
      aria-label={`Detail Pesanan ${order.id}`}
      className="mx-auto max-w-3xl rounded-xl border border-gray-200 bg-white p-4 md:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-200 pb-4">
        <div>
          <p className="text-xs text-gray-600">Nomor Pesanan</p>
          <h2 className="mt-1 text-base font-semibold text-ink">
            Pesanan {order.id} · {order.customerName}
          </h2>
        </div>
        <Badge status={order.status} />
      </div>

      {order.paymentMethod ? (
        <p className="border-b border-gray-200 py-3 text-sm text-gray-600">
          Metode pembayaran:{" "}
          <span className="font-medium text-ink">
            {order.paymentMethod === "tunai" ? "Tunai" : "QRIS"}
          </span>
        </p>
      ) : null}
      {order.paymentMethod === "tunai" &&
      order.status === "lunas" &&
      order.cashReceived !== undefined ? (
        <dl className="space-y-2 border-b border-gray-200 py-3 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-gray-600">Uang diterima</dt>
            <dd className="font-medium text-ink">
              {formatRupiah(order.cashReceived)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-gray-600">Kembalian</dt>
            <dd className="font-medium text-ink">
              {formatRupiah(order.change ?? 0)}
            </dd>
          </div>
        </dl>
      ) : null}
      {order.paidAt ? (
        <p className="border-b border-gray-200 py-3 text-sm text-gray-600">
          Waktu pembayaran:{" "}
          <span className="font-medium text-ink">
            {new Intl.DateTimeFormat("id-ID", {
              dateStyle: "medium",
              timeStyle: "short",
              timeZone: "Asia/Jakarta",
            }).format(new Date(order.paidAt))}
          </span>
        </p>
      ) : null}

      <ul aria-label="Item pesanan" className="py-4">
        {order.items.map((item, index) => {
          const addonUnitPrice = item.addons.reduce(
            (sum, addon) => sum + addon.price,
            0,
          );
          const lineSubtotal = (item.unitPrice + addonUnitPrice) * item.qty;

          return (
            <li
              className="border-t border-gray-200 py-3 first:border-t-0 first:pt-0 last:pb-0"
              key={`${item.menuId}:${index}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="wrap-break-word text-sm font-medium text-ink">
                    {item.name}
                  </h3>
                  <p className="mt-1 text-xs text-gray-600">
                    {formatRupiah(item.unitPrice)} × {item.qty}
                  </p>
                  {item.addons.length > 0 ? (
                    <ul className="mt-1 space-y-1 text-xs text-gray-600">
                      {item.addons.map((addon, addonIndex) => (
                        <li key={`${addon.name}:${addonIndex}`}>
                          Tambahan: {addon.name} · {formatRupiah(addon.price)} /
                          item
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {item.note?.trim() ? (
                    <p className="mt-2 whitespace-pre-wrap wrap-break-word text-xs text-gray-600">
                      Catatan: {item.note}
                    </p>
                  ) : null}
                </div>
                <p className="shrink-0 text-sm font-semibold text-ink">
                  {formatRupiah(lineSubtotal)}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      <dl className="space-y-2 border-t border-gray-200 pt-4 text-sm">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-gray-600">Subtotal</dt>
          <dd className="font-medium text-ink">
            {formatRupiah(order.subtotal)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="font-semibold text-ink">Total</dt>
          <dd className="font-semibold text-ink">
            {formatRupiah(order.total)}
          </dd>
        </div>
      </dl>

      <div className="mt-5 flex flex-wrap gap-2">
        {order.status === "belum_bayar" ? (
          <>
            <Link
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-ink bg-ink px-4 text-sm font-medium text-white outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink"
              href={`/orders/${encodeURIComponent(order.id)}/pay`}
            >
              Bayar
            </Link>
            <Button onClick={() => onEdit(order)} variant="secondary">
              <Pencil aria-hidden="true" size={16} strokeWidth={2} />
              Edit Pesanan
            </Button>
            <Button
              className="text-error"
              onClick={() => onCancel(order)}
              variant="secondary"
            >
              <Trash2 aria-hidden="true" size={16} strokeWidth={2} />
              Batalkan
            </Button>
          </>
        ) : null}
        <Link
          className="inline-flex h-11 items-center justify-center rounded-md border border-gray-200 bg-white px-4 text-sm font-medium text-ink outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink"
          href="/history"
        >
          Kembali ke Riwayat
        </Link>
      </div>
    </section>
  );
}
