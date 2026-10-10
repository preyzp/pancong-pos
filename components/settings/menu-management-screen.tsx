"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useStore } from "zustand";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/pos/button";
import { Input } from "@/components/pos/input";
import { SettingsBackButton } from "@/components/settings/settings-back-button";
import { DEFAULT_MENU_CATEGORIES, MOCK_MENU } from "@/data/mock/menu";
import type { MenuCategory, MenuItem } from "@/types/pos";
import { menuStore } from "@/store/menu-store";

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 0,
});

type MenuFormState = {
  category: string;
  name: string;
  price: string;
};

const emptyForm: MenuFormState = {
  category: "pancong",
  name: "",
  price: "",
};

export function MenuManagementScreen() {
  const categories = useStore(menuStore, (state) => state.categories);
  const items = useStore(menuStore, (state) => state.items);
  const initialize = useStore(menuStore, (state) => state.initialize);
  const saveItem = useStore(menuStore, (state) => state.saveItem);
  const setActive = useStore(menuStore, (state) => state.setActive);
  const saveCategory = useStore(menuStore, (state) => state.saveCategory);
  const deleteCategory = useStore(menuStore, (state) => state.deleteCategory);
  const persistenceError = useStore(
    menuStore,
    (state) => state.persistenceError,
  );
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(
    null,
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<MenuCategory | null>(
    null,
  );
  const [categoryName, setCategoryName] = useState("");
  const [form, setForm] = useState<MenuFormState>(emptyForm);
  const [formError, setFormError] = useState("");
  const [categoryFormError, setCategoryFormError] = useState("");

  useEffect(() => {
    initialize(MOCK_MENU, DEFAULT_MENU_CATEGORIES);
  }, [initialize]);

  function openCreateForm(categoryId: string) {
    setEditingItem(null);
    setForm({ ...emptyForm, category: categoryId });
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

  function openCreateCategoryForm() {
    setEditingCategory(null);
    setCategoryName("");
    setCategoryFormError("");
    setIsCategoryFormOpen(true);
  }

  function openEditCategoryForm(category: MenuCategory) {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryFormError("");
    setIsCategoryFormOpen(true);
  }

  function closeCategoryForm() {
    setEditingCategory(null);
    setCategoryName("");
    setCategoryFormError("");
    setIsCategoryFormOpen(false);
  }

  function saveMenuCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = categoryName.trim();
    if (!name) {
      setCategoryFormError("Nama kategori wajib diisi.");
      return;
    }

    const didSave = saveCategory({
      id: editingCategory?.id ?? crypto.randomUUID(),
      name,
    });
    if (!didSave) {
      setCategoryFormError("Nama kategori sudah digunakan.");
      return;
    }

    closeCategoryForm();
  }

  function confirmDeleteCategory() {
    if (!categoryToDelete) return;
    deleteCategory(categoryToDelete.id);
    setCategoryToDelete(null);
  }

  function saveMenuItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = form.name.trim();
    const price = Number(form.price);

    if (
      !name ||
      !categories.some((category) => category.id === form.category) ||
      !Number.isSafeInteger(price) ||
      price <= 0
    ) {
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
      addonIds: editingItem?.addonIds,
      active: editingItem?.active ?? true,
    });
    closeForm();
  }

  return (
    <AppShell active="akun" title="Menu & Harga">
      <section aria-label="Pengelolaan menu" className="mx-auto max-w-4xl">
        <SettingsBackButton />
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-ink">Daftar Menu</h2>
            <p className="mt-1 text-sm text-gray-600">
              Kelola kategori, nama, harga, dan ketersediaan menu.
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

        <section
          aria-labelledby="category-management-heading"
          className="mb-5 rounded-xl border border-gray-200 bg-white p-4 md:p-5"
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h3
                className="text-sm font-semibold text-ink"
                id="category-management-heading"
              >
                Kategori Menu
              </h3>
              <p className="mt-1 text-xs text-gray-600">
                Kategori yang masih memiliki menu harus dikosongkan sebelum
                dihapus.
              </p>
            </div>
            <Button
              className="h-10 shrink-0 px-3 text-xs"
              onClick={openCreateCategoryForm}
              type="button"
            >
              Tambah Kategori
            </Button>
          </div>
          <ul className="divide-y divide-gray-200">
            {categories.map((category) => {
              const itemCount = items.filter(
                (item) => item.category === category.id,
              ).length;
              const cannotDelete = itemCount > 0 || categories.length <= 1;

              return (
                <li
                  className="flex min-h-14 items-center gap-3 py-2 first:pt-0 last:pb-0"
                  key={category.id}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block wrap-break-word text-sm font-medium text-ink">
                      {category.name}
                    </span>
                    <span className="mt-1 block text-xs text-gray-600">
                      {itemCount} menu
                    </span>
                  </span>
                  <Button
                    className="h-10 px-3 text-xs"
                    onClick={() => openEditCategoryForm(category)}
                    type="button"
                    variant="secondary"
                  >
                    Edit
                  </Button>
                  <Button
                    aria-label={`Hapus kategori ${category.name}`}
                    className="h-10 px-3 text-xs"
                    disabled={cannotDelete}
                    onClick={() => setCategoryToDelete(category)}
                    title={
                      itemCount > 0
                        ? "Pindahkan semua menu dari kategori ini sebelum menghapus."
                        : categories.length <= 1
                          ? "Minimal satu kategori harus tersedia."
                          : undefined
                    }
                    type="button"
                    variant="secondary"
                  >
                    Hapus
                  </Button>
                </li>
              );
            })}
          </ul>
        </section>

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
                    {category.name}
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
                            <p className="wrap-break-word text-sm font-medium text-ink">
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
              <label className="flex flex-col gap-2 text-xs text-gray-600">
                Kategori
                <select
                  className="h-11 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-ink outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      category: event.target.value,
                    }))
                  }
                  value={form.category}
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

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

      {isCategoryFormOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 md:items-center md:p-5"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeCategoryForm();
          }}
        >
          <section
            aria-labelledby="category-form-heading"
            aria-modal="true"
            className="w-full rounded-t-2xl bg-white p-5 md:max-w-lg md:rounded-2xl md:p-6"
            role="dialog"
          >
            <h2
              className="text-base font-semibold text-ink"
              id="category-form-heading"
            >
              {editingCategory ? "Edit Kategori" : "Tambah Kategori"}
            </h2>
            <form className="mt-5 space-y-4" onSubmit={saveMenuCategory}>
              <Input
                autoFocus
                label="Nama Kategori"
                maxLength={50}
                onChange={(event) => setCategoryName(event.target.value)}
                placeholder="Contoh: Minuman"
                value={categoryName}
              />
              {categoryFormError ? (
                <p className="text-xs text-error" role="alert">
                  {categoryFormError}
                </p>
              ) : null}
              <div className="flex gap-3 pt-1">
                <Button
                  className="flex-1"
                  onClick={closeCategoryForm}
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

      {categoryToDelete ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/45 p-5">
          <section
            aria-labelledby="delete-category-heading"
            aria-modal="true"
            className="w-full max-w-md rounded-2xl bg-white p-5 md:p-6"
            role="dialog"
          >
            <h2
              className="text-base font-semibold text-ink"
              id="delete-category-heading"
            >
              Hapus Kategori?
            </h2>
            <p className="mt-2 text-sm leading-5 text-gray-600">
              Kategori “{categoryToDelete.name}” akan dihapus. Aksi ini tidak
              mengubah kategori pada riwayat pesanan.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                onClick={() => setCategoryToDelete(null)}
                variant="secondary"
              >
                Kembali
              </Button>
              <Button onClick={confirmDeleteCategory}>Hapus Kategori</Button>
            </div>
          </section>
        </div>
      ) : null}
    </AppShell>
  );
}
