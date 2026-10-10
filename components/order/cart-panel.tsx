import { Button } from "@/components/pos/button";
import { OrderItemRow } from "@/components/pos/order-item-row";
import { PriceSummary } from "@/components/pos/price-summary";
import type { OrderItem } from "@/types/pos";
import { calculatePriceSummary, getCartLineKey } from "@/lib/orders/pricing";

type CartPanelProps = {
  items: OrderItem[];
  itemsError?: string;
  submitLabel?: string;
  onCustomizeItem?: (item: OrderItem) => void;
  onNoteChange?: (lineKey: string, note: string) => void;
  onQuantityChange: (lineKey: string, quantity: number) => void;
};

export function CartPanel({
  items,
  itemsError,
  onCustomizeItem,
  onNoteChange,
  onQuantityChange,
  submitLabel = "Lanjutkan",
}: CartPanelProps) {
  const priceSummary = calculatePriceSummary(items);

  return (
    <section
      aria-labelledby="cart-heading"
      className="rounded-xl border border-gray-200 bg-white p-4 md:p-5"
    >
      <h2 className="text-base font-semibold text-ink" id="cart-heading">
        Keranjang
      </h2>

      {items.length > 0 ? (
        <ul className="mt-4">
          {items.map((item) => (
            <OrderItemRow
              editable
              item={item}
              key={getCartLineKey(item.menuId, item.addons)}
              onCustomize={onCustomizeItem}
              onNoteChange={onNoteChange}
              onQuantityChange={onQuantityChange}
            />
          ))}
        </ul>
      ) : (
        <p className="mt-4 rounded-lg bg-gray-100 p-4 text-sm text-gray-600">
          Keranjang masih kosong.
        </p>
      )}

      {itemsError ? (
        <p className="mt-3 text-xs text-error" role="alert">
          {itemsError}
        </p>
      ) : null}

      <div className="mt-4">
        <PriceSummary {...priceSummary} />
      </div>
      <Button className="mt-4" fullWidth type="submit">
        {submitLabel}
      </Button>
    </section>
  );
}
