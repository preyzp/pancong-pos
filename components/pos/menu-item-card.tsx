import { SlidersHorizontal, Plus } from "lucide-react";
import { IconButton } from "@/components/pos/icon-button";
import type { MenuItem } from "@/types/pos";

type MenuItemCardProps = {
  item: MenuItem;
  onAdd: () => void;
  onCustomize: () => void;
};

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 0,
});

export function MenuItemCard({ item, onAdd, onCustomize }: MenuItemCardProps) {
  return (
    <article className="flex min-h-[76px] items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white p-3">
      <div className="min-w-0">
        <h3 className="break-words text-sm font-medium text-ink">
          {item.name}
        </h3>
        <p className="mt-1 text-xs text-gray-600">
          Rp {rupiahFormatter.format(item.price)}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        {item.hasToppings ? (
          <IconButton
            icon={SlidersHorizontal}
            label={`Atur topping ${item.name}`}
            onClick={onCustomize}
          />
        ) : null}
        <IconButton
          icon={Plus}
          label={`Tambah ${item.name}`}
          onClick={onAdd}
          variant="solid"
        />
      </div>
    </article>
  );
}
