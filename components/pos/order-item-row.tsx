import { SlidersHorizontal } from "lucide-react";
import { IconButton } from "@/components/pos/icon-button";
import type { OrderItem } from "@/types/pos";
import {
  calculateOrderItemSubtotal,
  getCartLineKey,
} from "@/lib/orders/pricing";
import { QuantityStepper } from "@/components/pos/quantity-stepper";

type OrderItemRowProps = {
  item: OrderItem;
  editable?: boolean;
  onCustomize?: (item: OrderItem) => void;
  onNoteChange?: (lineKey: string, note: string) => void;
  onQuantityChange?: (lineKey: string, quantity: number) => void;
};

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 0,
});

export function OrderItemRow({
  editable = false,
  item,
  onCustomize,
  onNoteChange,
  onQuantityChange,
}: OrderItemRowProps) {
  const lineKey = getCartLineKey(item.menuId, item.addons);
  const subtotal = calculateOrderItemSubtotal(item);

  return (
    <li className="border-t border-gray-200 py-3 first:border-t-0 first:pt-0 last:pb-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="wrap-break-word text-sm font-medium text-ink">
            {item.name}
          </h3>
          <p className="mt-1 text-xs text-gray-600">
            Rp {rupiahFormatter.format(item.unitPrice)} × {item.qty}
          </p>
          {item.addons.length > 0 ? (
            <p className="mt-1 wrap-break-word text-xs text-gray-600">
              Tambahan: {item.addons.map((addon) => addon.name).join(", ")}
            </p>
          ) : null}
          {editable && onNoteChange ? (
            <label className="mt-3 block text-xs text-gray-600">
              Catatan untuk {item.name}
              <textarea
                className="mt-2 min-h-20 w-full resize-y rounded-md border border-gray-200 bg-white p-3 text-sm text-ink outline-offset-2 placeholder:text-gray-400 focus-visible:outline-2 focus-visible:outline-ink"
                maxLength={200}
                onChange={(event) => onNoteChange(lineKey, event.target.value)}
                placeholder="Contoh: jangan terlalu manis"
                value={item.note ?? ""}
              />
            </label>
          ) : item.note?.trim() ? (
            <p className="mt-2 whitespace-pre-wrap wrap-break-word text-xs text-gray-600">
              Catatan: {item.note}
            </p>
          ) : null}
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-semibold text-ink">
            Rp {rupiahFormatter.format(subtotal)}
          </p>
          {editable && onQuantityChange ? (
            <div className="mt-2 flex items-center justify-end gap-2">
              {onCustomize ? (
                <IconButton
                  icon={SlidersHorizontal}
                  label={`Ubah Add-on ${item.name}`}
                  onClick={() => onCustomize(item)}
                />
              ) : null}
              <QuantityStepper
                label={item.name}
                minimum={0}
                onChange={(quantity) => onQuantityChange(lineKey, quantity)}
                value={item.qty}
              />
            </div>
          ) : null}
        </div>
      </div>
    </li>
  );
}
