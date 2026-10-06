type OrderStatus = "baru" | "belum_bayar" | "lunas" | "dibatalkan";

type BadgeProps = {
  status: OrderStatus;
};

const statusStyles: Record<OrderStatus, string> = {
  baru: "bg-gray-100 text-gray-600",
  belum_bayar: "bg-error-bg text-error",
  lunas: "bg-success-bg text-success",
  dibatalkan: "bg-gray-100 text-gray-600",
};

const statusLabels: Record<OrderStatus, string> = {
  baru: "Baru",
  belum_bayar: "Belum Bayar",
  lunas: "Lunas",
  dibatalkan: "Dibatalkan",
};

export function Badge({ status }: BadgeProps) {
  return (
    <span
      className={`inline-flex min-h-5 items-center rounded-full px-2 text-[11px] font-medium ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}
