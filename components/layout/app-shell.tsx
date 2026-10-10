"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useStore } from "zustand";
import { SideNav } from "@/components/pos/side-nav";
import { menuStore } from "@/store/menu-store";
import { settingsStore } from "@/store/settings-store";

type AppShellProps = {
  active: "beranda" | "pesanan" | "riwayat" | "penjualan" | "akun";
  children: ReactNode;
  mobileBackHref?: string;
  title: string;
  subtitle?: string;
};

export function AppShell({
  active,
  children,
  mobileBackHref,
  subtitle,
  title,
}: AppShellProps) {
  const menuPersistenceError = useStore(
    menuStore,
    (state) => state.persistenceError,
  );
  const settingsPersistenceError = useStore(
    settingsStore,
    (state) => state.persistenceError,
  );
  const persistenceErrors = [
    menuPersistenceError,
    settingsPersistenceError,
  ].filter((error): error is string => Boolean(error));

  return (
    <div className="grid min-h-dvh grid-cols-1 bg-white md:grid-cols-[15rem_minmax(0,1fr)]">
      <div className="hidden md:block">
        <SideNav active={active} />
      </div>
      <div className="min-w-0">
        <header className="flex h-13 items-center border-b border-gray-200 bg-white px-5 md:h-18 md:px-8">
          {mobileBackHref ? (
            <Link
              aria-label="Kembali"
              className="mr-2 inline-flex size-10 shrink-0 items-center justify-center rounded-md text-ink outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink md:hidden"
              href={mobileBackHref}
            >
              <ArrowLeft aria-hidden="true" size={24} strokeWidth={2} />
            </Link>
          ) : null}
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-ink">{title}</h1>
            {subtitle ? (
              <p className="text-xs text-gray-600">{subtitle}</p>
            ) : null}
          </div>
        </header>
        {persistenceErrors.length > 0 ? (
          <div
            className="border-b border-gray-200 bg-white px-5 py-3 text-sm text-error md:px-8"
            role="alert"
          >
            {persistenceErrors.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        ) : null}
        <main className="min-h-[calc(100dvh-52px)] bg-white p-5 pb-24 md:min-h-[calc(100dvh-72px)] md:bg-gray-100 md:p-8">
          {children}
        </main>
      </div>
      <div className="md:hidden">
        <SideNav active={active} mobileBottom />
      </div>
    </div>
  );
}
