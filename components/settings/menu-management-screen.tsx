"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useStore } from "zustand";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/pos/button";
import { Input } from "@/components/pos/input";
import { MOCK_MENU } from "@/data/mock/menu";
import type { MenuCategory, MenuItem } from "@/types/pos";
import { menuStore } from "@/store/menu-store";

const categories: { id: MenuCategory; label: string }[] = [
  { id: "pancong", label: "Pancong" },
  { id: "ketan_susu", label: "Ketan Susu" },
];

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 0,
});

type MenuFormState = {
  category: MenuCategory;
  name: string;
  price: string;
};

const emptyForm: MenuFormState = {
  category: "pancong",
  name: "",
  price: "",
};

export function MenuManagementScreen() {
  const items = useStore(menuStore, (state) => state.items);
  const initialize = useStore(menuStore, (state) => state.initialize);
  const saveItem = useStore(menuStore, (state) => state.saveItem);
  const setActive = useStore(menuStore, (state) => state.setActive);
  const persistenceError = useStore(
    menuStore,
    (state) => state.persistenceError,
  );
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<MenuFormState>(emptyForm);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    initialize(MOCK_MENU);
  }, [initialize]);

  function openCreateForm(category: MenuCategory) {
    setEditingItem(null);
    setForm({ ...emptyForm, category });
    setFormError("");
    setIsFormOpen(true);
  }

  function openEditForm(item: MenuItem) {
    setEditingItem(item);
    setForm({
      category: item.category,
      name: item.name,
      price: String(item.price),
    });
    setFormError("");
    setIsFormOpen(true);
  }

  function closeForm() {
    setEditingItem(null);
    setForm(emptyForm);
    setFormError("");
    setIsFormOpen(false);
  }

  function saveMenuItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = form.name.trim();
    const price = Number(form.price);

    if (!name || !Number.isSafeInteger(price) || price <= 0) {
      setFormError("Nama wajib diisi dan harga harus berupa angka positif.");
      return;
    }

    const duplicateName = items.some(
      (item) =>
        item.id !== editingItem?.id &&
        item.category === form.category &&
        item.name.trim().toLocaleLowerCase("id") ===
          name.toLocaleLowerCase("id"),
    );
    if (duplicateName) {
      setFormError("Nama menu sudah digunakan pada kategori ini.");
      return;
    }

    saveItem({
      id: editingItem?.id ?? crypto.randomUUID(),
      name,
      category: form.category,
      price,
      hasToppings: editingItem?.hasToppings ?? true,
      active: editingItem?.active ?? true,
    });
    closeForm();
  }

  return (
    <AppShell
      active="akun"
      mobileBackHref="/settings"
      title="Menu & Harga"
    >
      <section aria-label="Pengelolaan menu" className="mx-auto max-w-4xl">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-ink">Daftar Menu</h2>
            <p className="mt-1 text-sm text-gray-600">
              Kelola nama, harga, dan ketersediaan menu.
            </p>
          </div>
          <p className="shrink-0 pt-1 text-xs text-gray-600">
            {items.filter((item) => item.active !== false).length} aktif
          </p>
        </div>

        {persistenceError ? (
          <p className="mb-4 text-sm text-error" role="alert">
            {persistenceError}
          </p>
        ) : null}

        <div className="space-y-5">
          {categories.map((category) => {
            const categoryItems = items.filter(
              (item) => item.category === category.id,
            );

            return (
              <section
                aria-labelledby={`menu-${category.id}`}
                className="rounded-xl border border-gray-200 bg-white p-4 md:p-5"
                key={category.id}
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3
                    className="text-sm font-semibold text-ink"
                    id={`menu-${category.id}`}
                  >
                    {category.label}
                  </h3>
                  <Button
                    className="h-10 px-3 text-xs"
                    onClick={() => openCreateForm(category.id)}
                    type="button"
                  >
                    Tambah Menu
                  </Button>
                </div>

                {categoryItems.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {categoryItems.map((item) => {
                      const active = item.active !== false;

                      return (
                        <li
                          className="flex min-w-0 items-center gap-3 py-3 first:pt-0 last:pb-0"
                          key={item.id}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="break-words text-sm font-medium text-ink">
                              {item.name}
                            </p>
                            <p className="mt-1 text-xs text-gray-600">
                              Rp {rupiahFormatter.format(item.price)}
                            </p>
                          </div>
                          <span
                            className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                              active
                                ? "bg-success-bg text-success"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {active ? "Aktif" : "Nonaktif"}
                          </span>
                          <div className="flex shrink-0 gap-2">
                            <Button
                              className="h-10 px-3 text-xs"
                              onClick={() => openEditForm(item)}
                              type="button"
                              variant="secondary"
                            >
                              Edit
                            </Button>
                            <Button
                              className="h-10 px-3 text-xs"
                              onClick={() => setActive(item.id, !active)}
                              type="button"
                              variant="secondary"
                            >
                              {active ? "Nonaktifkan" : "Aktifkan"}
                            </Button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="py-5 text-center text-sm text-gray-600">
                    Belum ada menu pada kategori ini.
                  </p>
                )}
              </section>
            );
          })}
        </div>
      </section>

      {isFormOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 md:items-center md:p-5"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeForm();
          }}
        >
          <section
            aria-labelledby="menu-form-heading"
            aria-modal="true"
            className="w-full rounded-t-2xl bg-white p-5 md:max-w-lg md:rounded-2xl md:p-6"
            role="dialog"
          >
            <h2
              className="text-base font-semibold text-ink"
              id="menu-form-heading"
            >
              {editingItem ? "Edit Menu" : "Tambah Menu"}
            </h2>

            <form className="mt-5 space-y-4" onSubmit={saveMenuItem}>
              {editingItem ? (
                <p className="text-xs text-gray-600">
                  Kategori:{" "}
                  {categories.find(
                    (category) => category.id === editingItem.category,
                  )?.label ?? "Menu"}
                </p>
              ) : (
                <label className="flex flex-col gap-2 text-xs text-gray-600">
                  Kategori
                  <select
                    className="h-11 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-ink outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink"
                    onChange={(event) =>
                      setForm((current) => {
                        const category = categories.find(
                          (candidate) => candidate.id === event.target.value,
                        );
                        return category
                          ? { ...current, category: category.id }
                          : current;
                      })
                    }
                    value={form.category}
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <Input
                autoFocus
                label="Nama Menu"
                maxLength={80}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="Contoh: Pancong Pandan"
                value={form.name}
              />
              <Input
                inputMode="numeric"
                label="Harga (Rp)"
                min="1"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    price: event.target.value,
                  }))
                }
                placeholder="Contoh: 12000"
                step="1"
                type="number"
                value={form.price}
              />

              {formError ? (
                <p className="text-xs text-error" role="alert">
                  {formError}
                </p>
              ) : null}

              <div className="flex gap-3 pt-1">
                <Button
                  className="flex-1"
                  onClick={closeForm}
                  type="button"
                  variant="secondary"
                >
                  Batal
                </Button>
                <Button className="flex-1" type="submit">
                  Simpan
                </Button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </AppShell>
  );
}
