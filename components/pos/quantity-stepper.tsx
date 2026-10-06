import { Minus, Plus } from "lucide-react";

type QuantityStepperProps = {
  label: string;
  minimum?: number;
  value: number;
  onChange: (value: number) => void;
};

export function QuantityStepper({
  label,
  minimum = 1,
  onChange,
  value,
}: QuantityStepperProps) {
  return (
    <div
      aria-label={`Jumlah ${label}`}
      className="inline-flex items-center gap-2"
    >
      <button
        aria-label={`Kurangi ${label}`}
        className="inline-flex size-8 items-center justify-center rounded-sm border border-gray-200 bg-white text-ink outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-50"
        disabled={value <= minimum}
        onClick={() => onChange(value - 1)}
        type="button"
      >
        <Minus aria-hidden="true" size={16} strokeWidth={2} />
      </button>
      <span
        aria-live="polite"
        className="min-w-5 text-center text-sm font-medium text-ink"
      >
        {value}
      </span>
      <button
        aria-label={`Tambah ${label}`}
        className="inline-flex size-8 items-center justify-center rounded-sm border border-gray-200 bg-white text-ink outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink"
        onClick={() => onChange(value + 1)}
        type="button"
      >
        <Plus aria-hidden="true" size={16} strokeWidth={2} />
      </button>
    </div>
  );
}
