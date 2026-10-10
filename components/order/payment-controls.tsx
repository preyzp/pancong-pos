import { Button } from "../pos/button";
import type { Order, PaymentMethod } from "../../types/pos";

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 0,
});

function formatRupiah(amount: number): string {
  return `Rp ${rupiahFormatter.format(amount)}`;
}

export function PaymentConfirmationDialog({
  cashReceived,
  change,
  isProcessing = false,
  method,
  onCancel,
  onConfirm,
  onQrisVerifiedChange = () => undefined,
  order,
  qrisVerified = false,
}: {
  cashReceived?: number;
  change?: number;
  isProcessing?: boolean;
  method: PaymentMethod;
  onCancel: () => void;
  onConfirm: () => void;
  onQrisVerifiedChange?: (verified: boolean) => void;
  order: Order;
  qrisVerified?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/45 p-5">
      <section
        aria-labelledby="confirm-payment-heading"
        aria-modal="true"
        className="w-full max-w-md rounded-2xl bg-white p-5 md:p-6"
        role="dialog"
      >
        <h2
          className="text-base font-semibold text-ink"
          id="confirm-payment-heading"
        >
          Konfirmasi Pembayaran
        </h2>
        <p className="mt-2 text-sm leading-5 text-gray-600">
          {method === "tunai"
            ? `Konfirmasi pembayaran Tunai pesanan ${order.id} sebesar ${formatRupiah(order.total)}. Uang diterima ${formatRupiah(cashReceived ?? 0)} dengan kembalian ${formatRupiah(change ?? 0)}.`
            : `Tandai pesanan ${order.id} sebesar ${formatRupiah(order.total)} sebagai lunas setelah pembayaran QRIS diverifikasi.`}
        </p>
        {method === "qris" ? (
          <p className="mt-2 text-sm leading-5 text-gray-600">
            Pancong POS tidak membuat QR maupun terhubung ke penyedia pembayaran.
            Periksa bukti atau transaksi pada aplikasi merchant QRIS toko sebelum
            mengonfirmasi.
          </p>
        ) : null}
        {method === "qris" ? (
          <label className="mt-4 flex min-h-11 items-center gap-3 text-sm text-ink">
            <input
              checked={qrisVerified}
              className="size-4 accent-ink"
              onChange={(event) =>
                onQrisVerifiedChange(event.currentTarget.checked)
              }
              type="checkbox"
            />
            Saya sudah memastikan pembayaran QRIS diterima.
          </label>
        ) : null}
        <div className="mt-6 flex justify-end gap-2">
          <Button
            disabled={isProcessing}
            onClick={onCancel}
            variant="secondary"
          >
            Kembali
          </Button>
          <Button
            disabled={
              isProcessing || (method === "qris" && !qrisVerified)
            }
            onClick={onConfirm}
          >
            {isProcessing ? "Memproses..." : "Ya, tandai lunas"}
          </Button>
        </div>
      </section>
    </div>
  );
}

export function PaymentMethodSelector({
  enabledMethods,
  onChange,
  value,
}: {
  enabledMethods: PaymentMethod[];
  onChange: (method: PaymentMethod) => void;
  value: PaymentMethod | null;
}) {
  return (
    <fieldset className="mt-4">
      <legend className="text-sm font-medium text-ink">
        Metode pembayaran
      </legend>
      <div className="mt-2 space-y-2">
        {(
          [
            ["tunai", "Tunai"],
            ["qris", "QRIS"],
          ] as const
        )
          .filter(([method]) => enabledMethods.includes(method))
          .map(([method, label]) => (
            <label
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-gray-200 px-3 py-2 text-sm text-ink"
              key={method}
            >
              <input
                checked={value === method}
                className="size-4 accent-ink"
                name="payment-method"
                onChange={() => onChange(method)}
                type="radio"
                value={method}
              />
              {label}
            </label>
          ))}
      </div>
    </fieldset>
  );
}
