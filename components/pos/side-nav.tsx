import Link from "next/link";
import {
  ChartColumn,
  Clock,
  House,
  LogOut,
  ReceiptText,
  Settings,
  UserRound,
  type LucideIcon,
} from "lucide-react";

type NavKey = "beranda" | "pesanan" | "riwayat" | "penjualan" | "akun";

type NavItem = {
  href: string;
  icon: LucideIcon;
  key: NavKey;
  label: string;
};

const primaryItems: NavItem[] = [
  { key: "beranda", label: "Beranda", href: "/", icon: House },
  {
    key: "pesanan",
    label: "Pesanan Baru",
    href: "/orders/new",
    icon: ReceiptText,
  },
  { key: "riwayat", label: "Riwayat", href: "/history", icon: Clock },
  { key: "penjualan", label: "Penjualan", href: "/sales", icon: ChartColumn },
];

function NavLink({ active, item }: { active: NavKey; item: NavItem }) {
  const Icon = item.icon;
  const isActive = active === item.key;

  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      className={`flex min-h-11 flex-col items-center justify-center gap-1 rounded-md px-1 text-gray-600 outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink md:flex-row md:justify-start md:gap-3 md:px-3 ${isActive ? "bg-gray-100 text-ink md:bg-ink md:text-white" : ""}`}
      href={item.href}
    >
      <Icon aria-hidden="true" className="size-5.5 shrink-0" strokeWidth={2} />
      <span className="text-center text-[9px] leading-tight md:text-sm">
        {item.label}
      </span>
    </Link>
  );
}

export function SideNav({ active }: { active: NavKey }) {
  const mobileItems: NavItem[] = [
    ...primaryItems.map((item) =>
      item.key === "pesanan" ? { ...item, label: "Pesanan" } : item,
    ),
    { key: "akun", label: "Akun", href: "/settings", icon: UserRound },
  ];

  return (
    <aside className="sticky top-0 h-dvh w-16 shrink-0 border-r border-gray-200 bg-white md:w-60">
      <div className="flex h-full flex-col px-1 py-4 md:px-4">
        <Link
          aria-label="Pancong POS, Beranda"
          className="mb-6 flex h-10 items-center justify-center text-lg font-semibold text-ink md:justify-start md:gap-3 md:px-2"
          href="/"
        >
          <span
            aria-hidden="true"
            className="flex size-8 items-center justify-center rounded-full bg-ink text-sm text-white"
          >
            P
          </span>
          <span className="hidden text-sm md:inline">Pancong POS</span>
        </Link>

        <nav aria-label="Navigasi utama" className="flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-2 md:hidden">
            {mobileItems.map((item) => (
              <NavLink active={active} item={item} key={item.key} />
            ))}
          </div>
          <div className="hidden flex-col gap-2 md:flex">
            {primaryItems.map((item) => (
              <NavLink active={active} item={item} key={item.key} />
            ))}
          </div>
        </nav>

        <div className="hidden flex-col gap-2 md:flex">
          <NavLink
            active={active}
            item={{
              key: "akun",
              label: "Pengaturan",
              href: "/settings",
              icon: Settings,
            }}
          />
          <Link
            className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm text-gray-600 outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink"
            href="/login"
          >
            <LogOut
              aria-hidden="true"
              className="size-5.5 shrink-0"
              strokeWidth={2}
            />
            Keluar
          </Link>
        </div>
      </div>
    </aside>
  );
}
