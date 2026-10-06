import { CircleAlert } from "lucide-react";
import { Button } from "../pos/button";
import type { Order } from "../../types/pos";

type CancelOrderDialogProps = {
  order: Order;
  onCancel: () => void;
  onConfirm: () => void;
};

export function CancelOrderDialog({
  onCancel,
  onConfirm,
  order,
}: CancelOrderDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink/45 p-5"
      onClick={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <section
        aria-labelledby="cancel-history-order-title"
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
              id="cancel-history-order-title"
            >
              Batalkan pesanan {order.id}?
            </h2>
            <p className="mt-2 text-sm leading-5 text-gray-600">
              Pesanan atas nama {order.customerName} akan ditandai sebagai
              dibatalkan.
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button onClick={onCancel} variant="secondary">
            Kembali
          </Button>
          <Button className="border-error bg-error" onClick={onConfirm}>
            Batalkan Pesanan
          </Button>
        </div>
      </section>
    </div>
  );
}
