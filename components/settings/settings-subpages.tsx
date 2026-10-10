"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useStore } from "zustand";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/pos/button";
import { Input } from "@/components/pos/input";
import { SettingsBackButton } from "@/components/settings/settings-back-button";
import {
  type AppSettings,
} from "@/lib/settings/settings-persistence";
import { settingsStore } from "@/store/settings-store";
import type { PaymentMethod } from "@/types/pos";

function SettingsDetailShell({
  children,
  description,
  title,
}: {
  children: ReactNode;
  description: string;
  title: string;
}) {
  const persistenceError = useStore(
    settingsStore,
    (state) => state.persistenceError,
  );

  return (
    <AppShell
      active="akun"
      title={title}
    >
      <section className="mx-auto w-full max-w-3xl">
        <SettingsBackButton />
        <div className="mb-5">
          <h2 className="text-base font-semibold text-ink">{title}</h2>
          <p className="mt-1 text-sm leading-5 text-gray-600">{description}</p>
        </div>
        {persistenceError ? (
          <p className="mb-4 text-sm text-error" role="alert">
            {persistenceError}
          </p>
        ) : null}
        {children}
      </section>
    </AppShell>
  );
}

type ProfileForm = Pick<
  AppSettings,
  "cashierName" | "storeName" | "storePhone"
>;

export function EditProfileScreen() {
  const settings = useStore(settingsStore, (state) => state.settings);
  const initialized = useStore(settingsStore, (state) => state.initialized);
  const initialize = useStore(settingsStore, (state) => state.initialize);
  const persistenceError = useStore(
    settingsStore,
    (state) => state.persistenceError,
  );
  const updateProfile = useStore(settingsStore, (state) => state.updateProfile);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <SettingsDetailShell
      description="Informasi ini digunakan sebagai identitas kasir dan toko."
      title="Edit Profil"
    >
      {initialized ? (
        <ProfileSettingsForm
          hasPersistenceError={Boolean(persistenceError)}
          settings={settings}
          updateProfile={updateProfile}
        />
      ) : (
        <p className="text-sm text-gray-600" role="status">
          Memuat pengaturan...
        </p>
      )}
    </SettingsDetailShell>
  );
}

function ProfileSettingsForm({
  hasPersistenceError,
  settings,
  updateProfile,
}: {
  hasPersistenceError: boolean;
  settings: ProfileForm;
  updateProfile: (profile: ProfileForm) => void;
}) {
  const [form, setForm] = useState<ProfileForm>(settings);
  const [formError, setFormError] = useState("");
  const [saved, setSaved] = useState(false);

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cashierName = form.cashierName.trim();
    const storeName = form.storeName.trim();
    const storePhone = form.storePhone.trim();

    if (!cashierName || !storeName) {
      setFormError("Nama kasir dan nama toko wajib diisi.");
      setSaved(false);
      return;
    }

    updateProfile({ cashierName, storeName, storePhone });
    setForm({ cashierName, storeName, storePhone });
    setFormError("");
    setSaved(true);
  }

  return (
    <form
      className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 md:p-6"
      onSubmit={save}
    >
      <Input
        autoComplete="organization"
        label="Nama Toko"
        maxLength={80}
        onChange={(event) => {
          setForm((current) => ({ ...current, storeName: event.target.value }));
          setSaved(false);
        }}
        placeholder="Contoh: Pancong Pak Budi"
        required
        value={form.storeName}
      />
      <Input
        autoComplete="name"
        label="Nama Kasir"
        maxLength={60}
        onChange={(event) => {
          setForm((current) => ({
            ...current,
            cashierName: event.target.value,
          }));
          setSaved(false);
        }}
        placeholder="Nama yang tampil pada pesanan"
        required
        value={form.cashierName}
      />
      <Input
        autoComplete="tel"
        inputMode="tel"
        label="Nomor Telepon Toko (opsional)"
        maxLength={24}
        onChange={(event) => {
          setForm((current) => ({
            ...current,
            storePhone: event.target.value,
          }));
          setSaved(false);
        }}
        placeholder="Contoh: 081234567890"
        value={form.storePhone}
      />
      {formError ? (
        <p className="text-sm text-error" role="alert">
          {formError}
        </p>
      ) : null}
      {saved && !hasPersistenceError ? (
        <p className="text-sm text-success" role="status">
          Profil berhasil disimpan.
        </p>
      ) : null}
      <Button type="submit">Simpan Profil</Button>
    </form>
  );
}

const paymentMethods: {
  id: PaymentMethod;
  label: string;
  description: string;
}[] = [
  {
    id: "tunai",
    label: "Tunai",
    description: "Pembayaran langsung di kasir.",
  },
  {
    id: "qris",
    label: "QRIS",
    description: "Pembayaran menggunakan kode QR.",
  },
];

export function PaymentMethodsScreen() {
  const enabledPaymentMethods = useStore(
    settingsStore,
    (state) => state.settings.enabledPaymentMethods,
  );
  const initialize = useStore(settingsStore, (state) => state.initialize);
  const setPaymentMethodEnabled = useStore(
    settingsStore,
    (state) => state.setPaymentMethodEnabled,
  );
  const [methodError, setMethodError] = useState("");

  useEffect(() => {
    initialize();
  }, [initialize]);

  function toggleMethod(method: PaymentMethod) {
    const enabled = !enabledPaymentMethods.includes(method);
    const updated = setPaymentMethodEnabled(method, enabled);
    setMethodError(
      updated
        ? ""
        : "Minimal satu metode pembayaran harus tetap aktif.",
    );
  }

  return (
    <SettingsDetailShell
      description="Pilih metode yang nantinya tersedia untuk menerima pembayaran."
      title="Metode Pembayaran"
    >
      <div className="rounded-xl border border-gray-200 bg-white p-4 md:p-6">
        <ul className="divide-y divide-gray-200">
          {paymentMethods.map(({ description, id, label }) => {
            const enabled = enabledPaymentMethods.includes(id);

            return (
              <li
                className="flex min-h-20 items-center gap-4 py-4 first:pt-0 last:pb-0"
                key={id}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">{label}</p>
                  <p className="mt-1 text-xs leading-5 text-gray-600">
                    {description}
                  </p>
                </div>
                <button
                  aria-checked={enabled}
                  aria-label={`${label}: ${enabled ? "aktif" : "nonaktif"}`}
                  className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink ${
                    enabled ? "bg-ink" : "bg-gray-200"
                  }`}
                  onClick={() => toggleMethod(id)}
                  role="switch"
                  type="button"
                >
                  <span
                    aria-hidden="true"
                    className={`size-5 rounded-full bg-white ${
                      enabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </li>
            );
          })}
        </ul>
        {methodError ? (
          <p className="mt-4 text-sm text-error" role="alert">
            {methodError}
          </p>
        ) : null}
        <p className="mt-5 border-t border-gray-200 pt-4 text-xs leading-5 text-gray-600">
          Pengaturan metode tersimpan di perangkat ini. Proses pembayaran
          belum dihubungkan dengan pilihan ini.
        </p>
      </div>
    </SettingsDetailShell>
  );
}

type ReceiptForm = Pick<
  AppSettings,
  "receiptFooter" | "receiptPaperWidth" | "autoPrintReceipt"
>;

export function ReceiptPrinterScreen() {
  const settings = useStore(settingsStore, (state) => state.settings);
  const initialized = useStore(settingsStore, (state) => state.initialized);
  const initialize = useStore(settingsStore, (state) => state.initialize);
  const persistenceError = useStore(
    settingsStore,
    (state) => state.persistenceError,
  );
  const updateReceiptSettings = useStore(
    settingsStore,
    (state) => state.updateReceiptSettings,
  );

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <SettingsDetailShell
      description="Atur preferensi tampilan struk untuk digunakan saat fitur cetak tersedia."
      title="Struk / Printer"
    >
      {initialized ? (
        <ReceiptSettingsForm
          hasPersistenceError={Boolean(persistenceError)}
          settings={{
            receiptFooter: settings.receiptFooter,
            receiptPaperWidth: settings.receiptPaperWidth,
            autoPrintReceipt: settings.autoPrintReceipt,
          }}
          updateReceiptSettings={updateReceiptSettings}
        />
      ) : (
        <p className="text-sm text-gray-600" role="status">
          Memuat pengaturan...
        </p>
      )}
    </SettingsDetailShell>
  );
}

function ReceiptSettingsForm({
  hasPersistenceError,
  settings,
  updateReceiptSettings,
}: {
  hasPersistenceError: boolean;
  settings: ReceiptForm;
  updateReceiptSettings: (receipt: ReceiptForm) => void;
}) {
  const [form, setForm] = useState<ReceiptForm>(settings);
  const [saved, setSaved] = useState(false);

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateReceiptSettings({
      receiptFooter: form.receiptFooter.trim(),
      receiptPaperWidth: form.receiptPaperWidth,
      autoPrintReceipt: form.autoPrintReceipt,
    });
    setSaved(true);
  }

  return (
    <form
      className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 md:p-6"
      onSubmit={save}
    >
      <label className="flex flex-col gap-2 text-xs text-gray-600">
        Lebar Kertas
        <select
          className="h-11 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-ink outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink"
          onChange={(event) => {
            const receiptPaperWidth =
              event.target.value === "80mm" ? "80mm" : "58mm";
            setForm((current) => ({ ...current, receiptPaperWidth }));
            setSaved(false);
          }}
          value={form.receiptPaperWidth}
        >
          <option value="58mm">58 mm</option>
          <option value="80mm">80 mm</option>
        </select>
      </label>
      <label className="flex flex-col gap-2 text-xs text-gray-600">
        Pesan Penutup
        <textarea
          className="min-h-24 w-full resize-y rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-ink outline-offset-2 placeholder:text-gray-400 focus-visible:outline-2 focus-visible:outline-ink"
          maxLength={160}
          onChange={(event) => {
            setForm((current) => ({
              ...current,
              receiptFooter: event.target.value,
            }));
            setSaved(false);
          }}
          placeholder="Contoh: Terima kasih sudah berbelanja."
          value={form.receiptFooter}
        />
      </label>
      <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-ink">
        <input
          checked={form.autoPrintReceipt}
          className="size-4 accent-ink"
          onChange={(event) => {
            setForm((current) => ({
              ...current,
              autoPrintReceipt: event.target.checked,
            }));
            setSaved(false);
          }}
          type="checkbox"
        />
        Cetak otomatis setelah pembayaran berhasil
      </label>
      <p className="text-xs leading-5 text-gray-600">
        Koneksi perangkat printer dan pencetakan struk belum dikonfigurasi.
        Preferensi ini disimpan untuk alur struk berikutnya.
      </p>
      {saved && !hasPersistenceError ? (
        <p className="text-sm text-success" role="status">
          Pengaturan struk berhasil disimpan.
        </p>
      ) : null}
      <Button type="submit">Simpan Pengaturan</Button>
    </form>
  );
}

export function AboutScreen() {
  return (
    <SettingsDetailShell
      description="Informasi produk dan versi aplikasi."
      title="Tentang Aplikasi"
    >
      <dl className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white px-4 md:px-6">
        <div className="flex min-h-14 items-center justify-between gap-4">
          <dt className="text-sm text-gray-600">Nama Aplikasi</dt>
          <dd className="text-sm font-medium text-ink">Pancong POS</dd>
        </div>
        <div className="flex min-h-14 items-center justify-between gap-4">
          <dt className="text-sm text-gray-600">Versi</dt>
          <dd className="text-sm font-medium text-ink">0.1.0</dd>
        </div>
        <div className="flex min-h-14 items-center justify-between gap-4">
          <dt className="text-sm text-gray-600">Platform</dt>
          <dd className="text-sm font-medium text-ink">Pancong POS</dd>
        </div>
      </dl>
      <p className="mt-4 text-xs leading-5 text-gray-600">
        Aplikasi kasir untuk membantu mengelola pesanan, menu, dan operasional
        Pancong POS.
      </p>
    </SettingsDetailShell>
  );
}
