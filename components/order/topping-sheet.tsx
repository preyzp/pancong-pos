"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/pos/button";
import { QuantityStepper } from "@/components/pos/quantity-stepper";
import type { Addon, MenuItem, Topping } from "@/types/pos";
import { calculateLineSubtotal } from "@/lib/orders/pricing";

type ToppingSheetProps = {
  menuItem: MenuItem;
  toppings: Topping[];
  onAdd: (menuItem: MenuItem, quantity: number, addons: Addon[]) => void;
  onClose: () => void;
};

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 0,
});

export function ToppingSheet({
  menuItem,
  onAdd,
  onClose,
  toppings,
}: ToppingSheetProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedToppingIds, setSelectedToppingIds] = useState<string[]>([]);
  const selectedAddons = toppings
    .filter((topping) => selectedToppingIds.includes(topping.id))
    .map(({ name, price }) => ({ name, price }));
  const subtotal = calculateLineSubtotal(menuItem, quantity, selectedAddons);

  function toggleTopping(toppingId: string) {
    setSelectedToppingIds((current) =>
      current.includes(toppingId)
        ? current.filter((id) => id !== toppingId)
        : [...current, toppingId],
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 md:items-center md:p-5"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-labelledby="topping-sheet-heading"
        aria-modal="true"
        className="max-h-[90dvh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 md:max-w-lg md:rounded-2xl md:p-6"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              className="text-base font-semibold text-ink"
              id="topping-sheet-heading"
            >
              Atur topping
            </h2>
            <p className="mt-1 text-sm text-gray-600">{menuItem.name}</p>
          </div>
          <button
            aria-label="Tutup topping"
            className="inline-flex size-10 items-center justify-center rounded-md text-gray-600 outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={20} strokeWidth={2} />
          </button>
        </div>

        <fieldset className="mt-5">
          <legend className="mb-2 text-xs font-medium text-gray-600">
            Pilih add-on
          </legend>
          <div className="divide-y divide-gray-200">
            {toppings.map((topping) => (
              <label
                className="flex min-h-11 cursor-pointer items-center justify-between gap-3 py-2 text-sm text-ink"
                key={topping.id}
              >
                <span className="flex items-center gap-3">
                  <input
                    checked={selectedToppingIds.includes(topping.id)}
                    className="size-4 accent-ink"
                    onChange={() => toggleTopping(topping.id)}
                    type="checkbox"
                  />
                  {topping.name}
                </span>
                <span className="shrink-0 text-gray-600">
                  Rp {rupiahFormatter.format(topping.price)}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-5 flex items-center justify-between gap-4 border-t border-gray-200 pt-4">
          <span className="text-sm font-medium text-ink">Jumlah</span>
          <QuantityStepper
            label={menuItem.name}
            onChange={setQuantity}
            value={quantity}
          />
        </div>
        <p className="mt-3 text-sm text-gray-600">
          Subtotal:{" "}
          <span className="font-semibold text-ink">
            Rp {rupiahFormatter.format(subtotal)}
          </span>
        </p>
        <Button
          className="mt-5"
          fullWidth
          onClick={() => {
            onAdd(menuItem, quantity, selectedAddons);
            onClose();
          }}
        >
          Tambah ke Pesanan
        </Button>
      </section>
    </div>
  );
}
