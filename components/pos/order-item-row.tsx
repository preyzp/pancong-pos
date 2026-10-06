import type { MenuItem, OrderItem } from "@/types/pos";
import { calculateLineSubtotal, getCartLineKey } from "@/lib/orders/pricing";
import { QuantityStepper } from "@/components/pos/quantity-stepper";

type OrderItemRowProps = {
  item: OrderItem;
  menuItem: MenuItem;
  editable?: boolean;
  onQuantityChange?: (lineKey: string, quantity: number) => void;
};

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 0,
});

export function OrderItemRow({
  editable = false,
  item,
  menuItem,
  onQuantityChange,
}: OrderItemRowProps) {
  const lineKey = getCartLineKey(item.menuId, item.addons);
  const subtotal = calculateLineSubtotal(menuItem, item.qty, item.addons);

  return (
    <li className="border-t border-gray-200 py-3 first:border-t-0 first:pt-0 last:pb-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="break-words text-sm font-medium text-ink">
            {item.name}
          </h3>
          <p className="mt-1 text-xs text-gray-600">
            Rp {rupiahFormatter.format(menuItem.price)} × {item.qty}
          </p>
          {item.addons.length > 0 ? (
            <p className="mt-1 break-words text-xs text-gray-600">
              Tambahan: {item.addons.map((addon) => addon.name).join(", ")}
            </p>
          ) : null}
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-semibold text-ink">
            Rp {rupiahFormatter.format(subtotal)}
          </p>
          {editable && onQuantityChange ? (
            <div className="mt-2">
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
