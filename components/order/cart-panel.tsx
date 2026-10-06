import { Button } from "@/components/pos/button";
import { OrderItemRow } from "@/components/pos/order-item-row";
import { PriceSummary } from "@/components/pos/price-summary";
import type { MenuItem, OrderItem } from "@/types/pos";
import { calculatePriceSummary, getCartLineKey } from "@/lib/orders/pricing";

type CartPanelProps = {
  items: OrderItem[];
  menu: MenuItem[];
  itemsError?: string;
  onQuantityChange: (lineKey: string, quantity: number) => void;
};

export function CartPanel({
  items,
  itemsError,
  menu,
  onQuantityChange,
}: CartPanelProps) {
  const priceSummary = calculatePriceSummary(items, menu);

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
          {items.map((item) => {
            const menuItem = menu.find(
              (candidate) => candidate.id === item.menuId,
            );
            if (!menuItem) return null;

            return (
              <OrderItemRow
                editable
                item={item}
                key={getCartLineKey(item.menuId, item.addons)}
                menuItem={menuItem}
                onQuantityChange={onQuantityChange}
              />
            );
          })}
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
        Lanjutkan
      </Button>
    </section>
  );
}
