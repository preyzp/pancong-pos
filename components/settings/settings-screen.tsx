import {
  ChevronRight,
  CircleUserRound,
  CreditCard,
  Info,
  Menu,
  Printer,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";

type SettingsItem = {
  description: string;
  icon: LucideIcon;
  href: string;
  title: string;
};

const settingsItems: SettingsItem[] = [
  {
    title: "Edit Profil",
    description: "Informasi profil dan nama kasir",
    icon: CircleUserRound,
    href: "/settings/profile",
  },
  {
    title: "Menu & Harga",
    description: "Daftar menu dan harga yang berlaku",
    icon: Menu,
    href: "/settings/menu",
  },
  {
    title: "Metode Pembayaran",
    description: "Metode pembayaran yang tersedia",
    icon: CreditCard,
    href: "/settings/payment-methods",
  },
  {
    title: "Struk / Printer",
    description: "Pengaturan tampilan dan printer struk",
    icon: Printer,
    href: "/settings/printer",
  },
  {
    title: "Tentang Aplikasi",
    description: "Informasi tentang Pancong POS",
    icon: Info,
    href: "/settings/about",
  },
];

export function SettingsScreen() {
  return (
    <AppShell active="akun" title="Pengaturan">
      <section
        aria-label="Menu pengaturan"
        className="mx-auto w-full max-w-4xl"
      >
        <div className="mb-4 md:mb-5">
          <h2 className="text-base font-semibold text-ink">
            Preferensi Aplikasi
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Kelola informasi dan preferensi aplikasi.
          </p>
        </div>

        <ul className="grid gap-3 md:grid-cols-2 md:gap-4">
          {settingsItems.map(({ description, href, icon: Icon, title }) => (
            <li key={title}>
              <Link
                className="flex min-h-20 items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink md:p-5"
                href={href}
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-ink">
                  <Icon aria-hidden="true" size={20} strokeWidth={2} />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium text-ink">{title}</h3>
                  <p className="mt-1 text-xs leading-5 text-gray-600">
                    {description}
                  </p>
                </div>
                <ChevronRight
                  aria-hidden="true"
                  className="shrink-0 text-gray-400"
                  size={20}
                  strokeWidth={2}
                />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}
