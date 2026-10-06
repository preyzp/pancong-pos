type PriceSummaryProps = {
  subtotal: number;
  total: number;
};

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 0,
});

function formatRupiah(amount: number): string {
  return `Rp ${rupiahFormatter.format(amount)}`;
}

export function PriceSummary({ subtotal, total }: PriceSummaryProps) {
  return (
    <dl className="space-y-2 border-t border-gray-200 pt-3">
      <div className="flex items-center justify-between gap-3 text-sm text-gray-600">
        <dt>Subtotal</dt>
        <dd>{formatRupiah(subtotal)}</dd>
      </div>
      <div className="flex items-center justify-between gap-3 text-sm font-semibold text-ink">
        <dt>Total</dt>
        <dd>{formatRupiah(total)}</dd>
      </div>
    </dl>
  );
}
