"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/pos/button";
import { QuantityStepper } from "@/components/pos/quantity-stepper";
import type { Addon, MenuItem, OrderItemAddon } from "@/types/pos";
import { createAddonSnapshot } from "@/lib/addons/addons";
import { calculateLineSubtotal } from "@/lib/orders/pricing";

type AddonSheetProps = {
  menuItem: MenuItem;
  initialAddons?: OrderItemAddon[];
  initialQuantity?: number;
  /** Add-on yang dapat dipilih untuk menu ini (lihat `getSelectableAddons`). */
  addons: Addon[];
  onAdd: (menuItem: MenuItem, quantity: number, addons: OrderItemAddon[]) => void;
  onClose: () => void;
  submitLabel?: string;
};

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 0,
});

export function AddonSheet({
  addons,
  menuItem,
  initialAddons = [],
  initialQuantity = 1,
  onAdd,
  onClose,
  submitLabel = "Tambah ke Pesanan",
}: AddonSheetProps) {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>(() =>
    addons
      .filter((addon) =>
        initialAddons.some((selected) =>
          selected.addonId !== undefined
            ? selected.addonId === addon.id
            : selected.name === addon.name && selected.price === addon.price,
        ),
      )
      .map((addon) => addon.id),
  );
  const selectedAddons = addons
    .filter((addon) => selectedAddonIds.includes(addon.id))
    .map((addon) => createAddonSnapshot(addon));
  const subtotal = calculateLineSubtotal(menuItem, quantity, selectedAddons);

  function toggleAddon(addonId: string) {
    setSelectedAddonIds((current) =>
      current.includes(addonId)
        ? current.filter((id) => id !== addonId)
        : [...current, addonId],
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
        aria-labelledby="addon-sheet-heading"
        aria-modal="true"
        className="max-h-[90dvh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 md:max-w-lg md:rounded-2xl md:p-6"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              className="text-base font-semibold text-ink"
              id="addon-sheet-heading"
            >
              Atur Add-on
            </h2>
            <p className="mt-1 text-sm text-gray-600">{menuItem.name}</p>
          </div>
          <button
            aria-label="Tutup Add-on"
            className="inline-flex size-10 items-center justify-center rounded-md text-gray-600 outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={20} strokeWidth={2} />
          </button>
        </div>

        <fieldset className="mt-5">
          <legend className="mb-2 text-xs font-medium text-gray-600">
            Pilih Add-on
          </legend>
          <div className="divide-y divide-gray-200">
            {addons.map((addon) => (
              <label
                className="flex min-h-11 cursor-pointer items-center justify-between gap-3 py-2 text-sm text-ink"
                key={addon.id}
              >
                <span className="flex items-center gap-3">
                  <input
                    checked={selectedAddonIds.includes(addon.id)}
                    className="size-4 accent-ink"
                    onChange={() => toggleAddon(addon.id)}
                    type="checkbox"
                  />
                  {addon.name}
                </span>
                <span className="shrink-0 text-gray-600">
                  Rp {rupiahFormatter.format(addon.price)}
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
          {submitLabel}
        </Button>
      </section>
    </div>
  );
}
