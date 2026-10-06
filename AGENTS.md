# AGENTS.md — Pancong POS

Panduan untuk **semua AI coding agent** (Claude Code, Cursor, Copilot, dsb.) dan developer yang
mengerjakan aplikasi **Pancong POS**.

File ini adalah **sumber instruksi utama** untuk agent. Aturan desain lengkap ada di
[`DESIGN_SPEC.md`](./DESIGN_SPEC.md) — dokumen itu adalah sumber kebenaran untuk UI.
Jika ada `CLAUDE.md`, isinya mengacu ke file ini.

---

## Tentang Proyek

Pancong POS adalah aplikasi **Point of Sale** untuk warung Pancong & Ketan Susu
(contoh: "Pancong Pak Budi"). Dipakai kasir untuk: membuat pesanan, menambah topping/add-on,
menerima pembayaran (Tunai/QRIS), mencetak struk, melihat riwayat & penjualan, serta mengelola menu.

Target platform: **mobile (390×844)** dan **web/desktop (1280×832)** dengan bahasa visual yang sama.

Desain Figma: file `FD7RnYWy30GN7HjriUjzCA`, page **"Pancong - Personal Project"**.

---

## Tech Stack

- **Framework:** Next.js (App Router) + **TypeScript** (strict mode).
- **Styling:** **Tailwind CSS** — token desain (DESIGN_SPEC §2) dipetakan ke `tailwind.config.ts`
  (colors, spacing, borderRadius, fontFamily) + CSS variables di `globals.css`. Jangan hardcode hex.
- **Komponen UI:** **shadcn/ui** sebagai basis primitif (Button, Input, Dialog, Sheet, Tabs, dsb.),
  lalu **dibungkus/di-restyle** menjadi komponen `POS/*` sesuai DESIGN_SPEC §3. Jangan pakai default
  shadcn apa adanya — sesuaikan ke token (radius, warna, tinggi 44px, dll.).
- **Ikon:** **Lucide React** (`lucide-react`) — outline, `strokeWidth={2}`, ukuran 16/20/24.
- **Font:** **Inter** via `next/font` (Google Fonts), weight 400/500/600 saja.
- **State:** Zustand — digunakan untuk cart/order state dan UI state yang perlu dibagi antar screen.

### Pemetaan shadcn/ui → komponen `POS/*`

| `POS/*` (DESIGN_SPEC §3)   | Basis shadcn/ui                   | Catatan styling                                                                      |
| -------------------------- | --------------------------------- | ------------------------------------------------------------------------------------ |
| `POS/Button`               | `button`                          | Varian `primary` (fill `ink`) & `secondary` (border `gray-200`); tinggi 44, radius 8 |
| `POS/Icon Button`          | `button` (size icon)              | 40×40, radius 8                                                                      |
| `POS/Input` / `POS/Search` | `input`                           | Border `gray-200`, radius 8; Search + ikon `Search`                                  |
| `POS/Badge`                | `badge`                           | Varian Neutral/Success/Error/Dibatalkan → token status; bentuk pill                  |
| `POS/Side Nav`             | custom (pakai `button`/`link`)    | Rail 64 (mobile) / sidebar 240 (web)                                                 |
| Sheet Topping              | `sheet` (mobile) / `dialog` (web) | Backdrop gelap di web                                                                |
| Dialog Batalkan            | `alert-dialog`                    | Wajib konfirmasi sebelum void                                                        |
| Filter Riwayat             | `tabs` / chip custom              | Semua/Lunas/Belum Bayar/Dibatalkan                                                   |

### Perintah umum

```
install : npm install
dev     : npm run dev
build   : npm run build
test    : npm run test        # mis. Vitest / Jest + React Testing Library
lint    : npm run lint        # next lint (ESLint) + tsc --noEmit
```

> Sesuaikan `npm` dengan package manager tim (pnpm/yarn) bila perlu.
> Agent: **selalu jalankan `lint` dan `test` sebelum menganggap tugas selesai.**

---

## Aturan Desain (WAJIB)

Ringkasan; detail token & komponen di [`DESIGN_SPEC.md`](./DESIGN_SPEC.md).

1. **Font hanya Inter** (Regular/Medium/Semi Bold). Jangan font lain.
2. **Palet terbatas** — hitam/putih/abu + aksen status saja:
   - `ink #111` · `gray-900 #222` · `gray-600 #666` · `gray-400 #999` · `gray-200 #E5E5E5` · `gray-100 #F5F5F5` · `white #FFF`
   - `success #16A34A` / `success-bg #DCFCE7` (Lunas) · `error #DC2626` / `error-bg #FEE2E2` (Belum Bayar, destruktif)
   - Web app bg: `#F5F5F5`. Tidak ada warna brand lain, gradient, atau shadow berat.
3. **Ikon Lucide outline**, `stroke-width:2`, round cap/join. Ukuran 16/20/24.
4. **Radius**: 6 (stepper), 8 (tombol/input), 10 (baris list), 12–16 (kartu/modal), pill (badge).
5. **Spacing** kelipatan 4. Padding kartu: **16 (mobile), 20–24 (web)**.
6. **Komponen diberi prefix `POS/`** (Button, Icon Button, Input, Search, Side Nav, Badge,
   Menu Item, Quantity Stepper, Order Item, Price Summary, Order Card). Bangun UI dari komponen ini;
   jangan bikin ulang satu-satu.
7. **Navigasi = side nav** (rail kiri di mobile, sidebar penuh di web). Bottom nav **deprecated** — jangan dipakai.
8. **Transisi antar layar instan** (tanpa animasi), sesuai keputusan tim.

---

## Aturan Domain / Bisnis

- **Status pesanan**: `baru`, `belum_bayar`, `lunas`, `dibatalkan`.
- **Edit & Batalkan hanya untuk `belum_bayar`.** Pesanan `lunas` final (tidak bisa edit/batal).
  `dibatalkan` final.
- Tombol **Edit/Batalkan** muncul **di dalam kartu pesanan** pada listing (Beranda & Riwayat),
  hanya untuk `belum_bayar`.
- **Batalkan selalu lewat dialog konfirmasi** sebelum status berubah ke `dibatalkan`.
- Di Edit Pesanan: "Batal" = batal mengedit (kembali); "**Batalkan Pesanan**" (merah) = void pesanan.
- **Rasa Pancong = item menu terpisah** (Original/Coklat/Strawberry/Keju). Sheet topping hanya mengatur
  **add-on**, bukan rasa.
- **Nama pemesan** ada di setiap pesanan, diinput di Pesanan Baru, tampil **di sebelah nomor pesanan**
  ("Pesanan #012 · Andi") dan di Order Detail/Struk.
- Metode bayar: **Tunai** (uang diterima → kembalian) & **QRIS** (tampilkan QR).
- **Konsistensi angka itu aturan keras.** Harga kanonik ada di `DESIGN_SPEC.md` §9. Untuk setiap pesanan:
  `item × qty = subtotal baris`, dan angka yang sama harus muncul identik di **listing, Order Detail,
  Payment, dan Struk**. Agregat di Penjualan (per-menu) **harus menjumlah ≤ Total Penjualan**.
  Lihat tabel data contoh di `DESIGN_SPEC.md` §9.1.

---

## Struktur Layar

Lihat `DESIGN_SPEC.md` §7 untuk daftar lengkap. Ringkas: Login · Beranda · Pesanan Baru (+ Sheet Topping) ·
Order Detail · Edit Pesanan · Payment · QRIS · Pembayaran Berhasil · Struk · Riwayat
(filter: Semua/Lunas/Belum Bayar/Dibatalkan) · Penjualan · Pengaturan (+ Edit Profil, Menu & Harga,
Metode Pembayaran, Struk/Printer, Tentang) · Dialog Batalkan · Empty states.

Mapping layar → route dan `POS/*` → komponen kode ada di `DESIGN_SPEC.md` §12.

---

## Konvensi Kode

- Komponen UI mengikuti nama di design system (`Button`, `Badge`, `OrderCard`, `SideNav`, …) —
  petakan 1:1 dengan `POS/*` di Figma (lihat `DESIGN_SPEC.md` §12.1).
- Pusatkan token desain (warna/spacing/radius/tipografi) di satu tempat (CSS vars / theme),
  jangan hardcode hex berulang.
- Format mata uang: `Rp` + ribuan dengan titik (mis. `Rp 22.000`).
- Bahasa UI: **Indonesia**.
- Tanggal/waktu: format lokal (mis. `5 Okt 2026 · 09:24`).
- Aksesibilitas: area sentuh ≥ 40px, kontras teks cukup.

---

## Saat Mengimplementasi

1. Mulai dari token & komponen `POS/*`, baru susun layar.
2. Samakan mobile & web dari komponen yang sama; web menata ulang jadi multi-kolom + sidebar.
3. Patuhi aturan status (edit/batal hanya belum bayar + konfirmasi).
4. Jaga aksesibilitas: area sentuh ≥ 40px, kontras teks cukup.
5. Sebelum selesai (checklist verifikasi):
   - [ ] Tidak ada warna/font/efek di luar token.
   - [ ] Badge status benar sesuai `status` pesanan.
   - [ ] **Angka konsisten** antar layar (listing = detail = payment = struk).
   - [ ] Edit/Batalkan hanya pada `belum_bayar`, Batalkan ada dialog konfirmasi.
   - [ ] `lint` dan `test` lulus.

---

## Jangan

- ❌ Menambah warna/font/efek di luar token.
- ❌ Memakai bottom navigation.
- ❌ Mengizinkan edit/batal pada pesanan `lunas`.
- ❌ Membatalkan pesanan tanpa dialog konfirmasi.
- ❌ Menaruh "rasa" di sheet topping (rasa = item menu).
- ❌ Membiarkan angka yang sama berbeda antar layar.
