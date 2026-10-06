# Pancong POS — Design Specification

> Spesifikasi desain untuk aplikasi **Pancong POS** — Point of Sale untuk penjual Pancong & Ketan Susu.
> Sumber desain: Figma file `FD7RnYWy30GN7HjriUjzCA`, page **"Pancong - Personal Project"**.
> Dokumen ini adalah acuan tunggal untuk implementasi UI (mobile & web).
> Instruksi kerja untuk agent/developer ada di [`AGENTS.md`](./AGENTS.md).

---

## 1. Prinsip Desain

1. **Minimal, hitam–putih.** Warna aksen hanya untuk status (hijau = lunas, merah = belum bayar/destruktif). Tidak ada warna brand lain.
2. **Mobile-first, tapi satu bahasa visual** untuk mobile & web. Pola navigasi sama (side nav) supaya konsisten lintas platform.
3. **Satu font: Inter.** Tidak ada font lain.
4. **Ikon Lucide outline**, monokrom, stroke konsisten.
5. **Jelas untuk kasir.** Aksi utama selalu terlihat, teks ringkas, area sentuh besar, alur sesedikit mungkin langkah.

---

## 2. Design Tokens

### 2.1 Warna

| Token        | Hex       | Pemakaian                                          |
| ------------ | --------- | -------------------------------------------------- |
| `ink`        | `#111111` | Teks utama, tombol primary, ikon aktif             |
| `gray-900`   | `#222222` | Teks penekanan sekunder                            |
| `gray-600`   | `#666666` | Teks sekunder, label                               |
| `gray-400`   | `#999999` | Teks tersier, placeholder, ikon non-aktif          |
| `gray-200`   | `#E5E5E5` | Border, garis pemisah                              |
| `gray-100`   | `#F5F5F5` | Background halus, chip, kolom header tabel         |
| `white`      | `#FFFFFF` | Background kartu & permukaan                       |
| `success`    | `#16A34A` | Teks/ikon status **Lunas**, kembalian              |
| `success-bg` | `#DCFCE7` | Background badge Lunas                             |
| `error`      | `#DC2626` | Status **Belum Bayar**, aksi destruktif (Batalkan) |
| `error-bg`   | `#FEE2E2` | Background badge Belum Bayar                       |

**Background aplikasi**

- Mobile: `white` (permukaan penuh), konten di atas putih.
- Web: `#F5F5F5` (area konten), sidebar & kartu `white`.
- Badge **Dibatalkan** menggunakan `gray-100` bg + `gray-600` teks (status netral/mati).

### 2.2 Tipografi (Inter)

Weight yang dipakai: **Regular (400)**, **Medium (500)**, **Semi Bold (600)**.

| Peran                       | Size  | Weight           |
| --------------------------- | ----- | ---------------- |
| Angka besar (total, KPI)    | 28–32 | Semi Bold        |
| Judul layar (mobile header) | 20    | Semi Bold        |
| Judul kartu / section       | 15–16 | Semi Bold        |
| Body / nilai                | 14–15 | Regular / Medium |
| Label & subtitle            | 12–13 | Regular / Medium |
| Caption / meta              | 11–12 | Regular          |
| Label nav (rail mobile)     | 9     | Regular / Medium |

Line-height: default Figma (auto); untuk angka besar gunakan tight.

### 2.3 Spacing

Skala kelipatan **4px**: `4, 8, 12, 16, 20, 24, 32`.

- Padding kartu: 16 (mobile), 20–24 (web).
- Gap antar elemen dalam list: 10–16.
- Padding konten layar: mobile 20 (lihat catatan side-rail di §5), web 32.

### 2.4 Radius

| Token        | Nilai           | Pemakaian                                |
| ------------ | --------------- | ---------------------------------------- |
| `radius-sm`  | 6               | Quantity stepper, tombol kecil/ikon mini |
| `radius-md`  | 8               | Tombol, input, chip tombol               |
| `radius-lg`  | 10              | Baris list, item kartu                   |
| `radius-xl`  | 12–14           | Kartu, tabel                             |
| `radius-2xl` | 16              | Modal / dialog, kartu login              |
| `pill`       | 20 (atau 999)   | Badge, chip filter                       |
| avatar       | lingkaran penuh | Avatar/logo bulat                        |

### 2.5 Ikon

- Library: **Lucide**, gaya outline.
- `stroke-width: 2`, `stroke-linecap: round`, `stroke-linejoin: round`.
- Ukuran: **16** (kecil), **18**, **20** (default), **22**, **24** (primary/header).
- Monokrom: `ink` (aktif), `gray-400`/`gray-600` (non-aktif), `white` (di atas tombol gelap), `error` (destruktif).
- Ikon yang dipakai: `house`, `receipt`/`clipboard`, `clock`, `trending-up`, `settings`, `log-out`, `plus`, `minus`, `check`, `x`, `search`, `arrow-left`, `chevron-right`, `sliders-horizontal` (kustomisasi topping), `pencil` (edit), `trash-2` (batalkan), `credit-card`, `printer`, `info`, `triangle-alert` (dialog batal), `qr-code`.

---

## 3. Komponen (prefix `POS/`)

Semua komponen diberi prefix `POS/` agar terisolasi dari design system lain.

| Komponen               | Spesifikasi                                                                                                                                         |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POS/Button`           | Varian **Primary** (fill `ink`, teks putih) & **Secondary** (bg putih, border `gray-200`, teks `ink`). Tinggi **44**, radius 8, teks 14 Medium.     |
| `POS/Icon Button`      | 40×40, radius 8, border `gray-200`. Varian solid (quick-add `+`) & outline.                                                                         |
| `POS/Input`            | Bg putih, border `gray-200`, radius 8, padding 12–14. Label 12 `gray-600` di atas.                                                                  |
| `POS/Search`           | Input dengan ikon `search` 20 + placeholder.                                                                                                        |
| `POS/Side Nav`         | Navigasi rail kiri. Varian `Active = Beranda / Pesanan / Riwayat / Penjualan / Akun`. (Menggantikan `POS/Bottom Navigation` yang sudah deprecated.) |
| `POS/Badge`            | Varian **Neutral** (`gray-100`/`gray-600`), **Success** (Lunas), **Error** (Belum Bayar), **Dibatalkan** (gray). Pill, teks 11 Medium.              |
| `POS/Menu Item`        | Baris menu: nama + harga + aksi.                                                                                                                    |
| `POS/Quantity Stepper` | `[−] qty [+]`, tombol 28–36px radius 6.                                                                                                             |
| `POS/Order Item`       | Baris item pesanan: nama, `harga × qty`, subtotal baris.                                                                                            |
| `POS/Price Summary`    | Subtotal + Total.                                                                                                                                   |
| `POS/Order Card`       | Kartu ringkas pesanan: `No. Pesanan · Nama` + waktu + item + total + badge status.                                                                  |

---

## 4. Statuses & Aturan

| Status          | Badge               | Aturan                                                                        |
| --------------- | ------------------- | ----------------------------------------------------------------------------- |
| **Baru**        | netral (`gray-100`) | Pesanan baru masuk.                                                           |
| **Belum Bayar** | merah (`error`)     | **Bisa Edit & Batalkan.** Menampilkan aksi Edit/Batalkan di listing & detail. |
| **Lunas**       | hijau (`success`)   | Final. Tidak bisa diedit/dibatalkan.                                          |
| **Dibatalkan**  | abu (`gray-100`)    | Final. Tampil di Riwayat (ada chip filter "Dibatalkan").                      |

**Aturan aksi:** Tombol **Edit** dan **Batalkan** hanya muncul untuk pesanan berstatus **Belum Bayar**, dan ditempatkan **di dalam kartu pesanan** (dipisah garis tipis dari info). Batalkan selalu melewati **dialog konfirmasi**.

---

## 5. Layout — Mobile (390 × 844)

- **Status bar**: tinggi 44 (`9:41` kiri, `5G 100%` kanan).
- **Header**: tinggi 52 — tombol back (`arrow-left` 24) + judul (20 Semi Bold). Layar utama tidak memakai back.
- **Side Nav (rail kiri)**: lebar **64**, dari bawah status bar sampai bawah layar. Berisi brand "P" + item: Beranda, Pesanan, Riwayat, Penjualan, Akun (ikon 22 + label 9). Item aktif: bg `gray-100`, ikon/teks `ink`; non-aktif: `gray-400/600`. _(Mengganti bottom nav agar pola sama dengan web.)_
- **Konten**: di kanan rail. Lebar konten efektif ± 286 (390 − rail 64 − padding), kartu/baris pakai `layoutAlign: stretch`.
- Layar sub (New Order, Payment, dll.) memakai **back button**, tanpa rail.

## 6. Layout — Web (1280 × 832)

- **Sidebar**: lebar **240**, full-height, bg putih + border kanan. Brand (logo "P" + "Pancong POS" + "Kasir: Budi") di atas; nav (Beranda, Pesanan Baru, Riwayat, Penjualan) + di bawah: Pengaturan, Keluar. Item aktif: fill `ink` + teks putih; non-aktif: `gray-600`.
- **Topbar**: tinggi **72**, bg putih + border bawah. Judul + subtitle kiri; aksi (mis. `+ Pesanan Baru`) kanan.
- **Konten**: `x=240, y=72`, bg `#F5F5F5`, padding 32, kartu putih. Layout multi-kolom (mis. New Order = grid menu + panel keranjang; Beranda = KPI + 2 kolom).
- Beberapa layar mobile menjadi **modal** di web (sheet topping, dialog batalkan) dengan backdrop gelap (`ink` @ 45%).

---

## 7. Inventaris Layar

Dikelompokkan per alur (sama untuk mobile & web; web menata ulang jadi layout desktop):

**Alur Pesanan**

- Beranda / Dashboard — KPI (Penjualan hari ini, Pesanan, Lunas, Belum Bayar), Pesanan Terbaru, Menu Terlaris.
- Pesanan Baru — daftar menu (kategori Pancong & Ketan Susu) + keranjang. Tiap item: `+` quick-add & ikon kustomisasi (buka sheet topping). Ada field **Nama Pemesan**.
- Sheet Topping (Pancong / Ketan Susu) — pilih add-on (rasa sudah ditentukan dari item menu), qty, "Tambah ke Pesanan". _(Modal di web.)_
- Order Detail — nama pemesan, item, subtotal/total, aksi Edit / Batalkan / Bayar.
- Edit Pesanan — ubah qty/item + "Batalkan Pesanan" (destruktif, beda dari "Batal" = batal edit).

**Pembayaran**

- Payment — Total, metode (Tunai / QRIS), uang diterima, kembalian, Konfirmasi.
- Pembayaran QRIS — QR code + total + konfirmasi.
- Pembayaran Berhasil — konfirmasi sukses + Cetak Struk / Selesai.
- Struk — preview struk (toko, pelanggan, item, total, tunai, kembalian) + Cetak/Bagikan.

**Riwayat & Penjualan**

- Riwayat Pesanan — list/tabel + chip filter (Semua, Lunas, Belum Bayar, Dibatalkan). Aksi Edit/Batalkan pada pesanan Belum Bayar.
- Penjualan — total hari ini, penjualan per menu, grafik 7 hari.

**Pengaturan**

- Pengaturan (menu) → Edit Profil, Menu & Harga, Metode Pembayaran, Struk / Printer, Tentang Aplikasi, Keluar.

**Lain-lain**

- Login (PIN di mobile; email+password di web).
- Dialog Konfirmasi Batalkan.
- Empty states: keranjang kosong, riwayat kosong, hasil cari kosong.

---

## 8. Alur Utama (prototype: transisi **instant**)

1. **Pesan → Bayar:** Beranda → Pesanan Baru → (quick-add `+` / sheet topping) → Review (Order Detail) → Payment → (Tunai: uang diterima/kembalian **atau** QRIS) → Pembayaran Berhasil → Cetak Struk.
2. **Edit/Batal (Belum Bayar):** dari listing/Order Detail → Edit Pesanan, atau Batalkan → **dialog konfirmasi** → status jadi Dibatalkan (muncul di Riwayat).
3. **Navigasi:** side nav konsisten di semua layar utama; item aktif menandai lokasi.

---

## 9. Harga Kanonik (data contoh)

| Menu                                   | Kategori   | Harga    |
| -------------------------------------- | ---------- | -------- |
| Pancong Original / Coklat / Strawberry | Pancong    | Rp 8.000 |
| Pancong Keju                           | Pancong    | Rp 9.000 |
| Ketan Susu Original                    | Ketan Susu | Rp 6.000 |
| Ketan Susu Keju / Coklat               | Ketan Susu | Rp 7.000 |
| Extra Keju                             | Topping    | Rp 3.000 |
| Susu Kental Manis / Kacang / Meises    | Topping    | Rp 2.000 |

Rasa Pancong = item menu terpisah (Original/Coklat/Strawberry/Keju). Sheet topping hanya mengatur **add-on**, bukan rasa.

### 9.1 Pesanan Contoh (kanonik — jaga konsisten antar layar)

Angka ini dipakai di mockup. Jika muncul di beberapa layar, **harus identik** (listing = Order Detail = Payment = Struk).

| No.  | Pemesan | Item                            | Total         | Status             | Muncul di                                            |
| ---- | ------- | ------------------------------- | ------------- | ------------------ | ---------------------------------------------------- |
| #012 | Andi    | 2 Pancong Coklat + 1 Ketan Susu | **Rp 22.000** | Baru / Belum Bayar | Beranda, Riwayat, Order Detail, Edit, Payment, Struk |
| #011 | Siti    | 2 Pancong (@8.000)              | Rp 16.000     | Lunas              | Beranda, Riwayat                                     |
| #010 | Rina    | 4 Ketan Susu (@6.000)           | Rp 24.000     | Lunas              | Beranda, Riwayat                                     |
| #009 | Dewi    | 2 Pancong + 2 Ketan Susu        | Rp 28.000     | Lunas              | Beranda, Riwayat                                     |
| #008 | Joko    | 2 Pancong (@8.000)              | Rp 16.000     | Dibatalkan         | Riwayat (contoh status Dibatalkan)                   |

Rincian #012 (dipakai di Payment & Struk): Pancong Coklat `Rp 8.000 × 2 = Rp 16.000`, Ketan Susu `Rp 6.000 × 1 = Rp 6.000` → Subtotal/Total **Rp 22.000**. Bayar Tunai `Rp 25.000` → Kembalian `Rp 3.000`.

**Agregat Penjualan (hari ini):** Total **Rp 420.000** · 12 pesanan · rata-rata Rp 35.000.
Rincian per menu **wajib menjumlah = total**: Pancong `Rp 240.000` (30 porsi) + Ketan Susu `Rp 180.000` (30 porsi) = `Rp 420.000`.

---

## 10. Model Data (acuan implementasi)

```
Order {
  id: string                 // "#012"
  customerName: string       // "Andi"
  items: OrderItem[]
  subtotal: number
  total: number
  status: "baru" | "belum_bayar" | "lunas" | "dibatalkan"
  paymentMethod?: "tunai" | "qris"
  cashReceived?: number
  change?: number
  cashier: string
  createdAt: datetime
}
OrderItem { menuId, name, category, unitPrice, qty, addons: Addon[] }
Addon { name, price }
MenuItem { id, name, category: "pancong"|"ketan_susu", price, hasToppings }
Topping { id, name, price }
```

---

## 11. Yang HARUS dipatuhi (do / don't)

- ✅ Inter saja; palet di §2.1 saja; ikon Lucide stroke 2.
- ✅ Aksi Edit/Batalkan hanya untuk **Belum Bayar**, di dalam kartu, dengan konfirmasi.
- ✅ Transisi antar layar **instant** (tanpa animasi) — sesuai keputusan tim.
- ❌ Jangan tambah warna brand lain / gradient / shadow berat.
- ❌ Jangan pakai bottom nav (sudah diganti side nav).
- ❌ Jangan izinkan edit/batal pada pesanan **Lunas**.

---

## 12. Mapping Figma → Kode

> Nama kode bersifat usulan (PascalCase, framework-agnostic). Sesuaikan dengan konvensi tim. Path contoh untuk struktur React/TS.

### 12.1 Komponen

| Figma (`POS/…`)        | Komponen kode       | Path contoh                          | Props utama                                                                    |
| ---------------------- | ------------------- | ------------------------------------ | ------------------------------------------------------------------------------ |
| `POS/Button`           | `Button`            | `components/ui/Button`               | `variant: "primary" \| "secondary"`, `icon?`, `disabled?`, `fullWidth?`        |
| `POS/Icon Button`      | `IconButton`        | `components/ui/IconButton`           | `icon`, `variant: "solid" \| "outline"`, `onClick`                             |
| `POS/Input`            | `Input`             | `components/ui/Input`                | `label?`, `value`, `placeholder?`, `onChange`                                  |
| `POS/Search`           | `SearchInput`       | `components/ui/SearchInput`          | `value`, `placeholder`, `onChange`                                             |
| `POS/Side Nav`         | `SideNav`           | `components/layout/SideNav`          | `active: "beranda"\|"pesanan"\|"riwayat"\|"penjualan"\|"akun"`                 |
| `POS/Badge`            | `StatusBadge`       | `components/ui/StatusBadge`          | `status: "baru"\|"belum_bayar"\|"lunas"\|"dibatalkan"`                         |
| `POS/Menu Item`        | `MenuItemCard`      | `components/order/MenuItemCard`      | `item: MenuItem`, `onQuickAdd`, `onCustomize`                                  |
| `POS/Quantity Stepper` | `QuantityStepper`   | `components/ui/QuantityStepper`      | `value`, `onIncrement`, `onDecrement`                                          |
| `POS/Order Item`       | `OrderItemRow`      | `components/order/OrderItemRow`      | `item: OrderItem`, `editable?`                                                 |
| `POS/Price Summary`    | `PriceSummary`      | `components/order/PriceSummary`      | `subtotal`, `total`                                                            |
| `POS/Order Card`       | `OrderCard`         | `components/order/OrderCard`         | `order: Order`, `onEdit?`, `onCancel?` (aksi hanya saat `belum_bayar`)         |
| (sheet topping)        | `ToppingSheet`      | `components/order/ToppingSheet`      | `menuItem`, `addons`, `onAdd`, `onClose` — bottom sheet (mobile) / modal (web) |
| (dialog batal)         | `CancelOrderDialog` | `components/order/CancelOrderDialog` | `order`, `onConfirm`, `onCancel`                                               |
| (empty state)          | `EmptyState`        | `components/ui/EmptyState`           | `variant: "cart"\|"history"\|"search"`, `icon`, `title`, `subtitle`, `action?` |
| (layout web)           | `AppShell`          | `components/layout/AppShell`         | `title`, `subtitle?`, `topbarActions?` — sidebar + topbar + content            |

### 12.2 Layar → Route / Komponen

| Figma (layar)       | Komponen kode                   | Route contoh                |
| ------------------- | ------------------------------- | --------------------------- |
| Login               | `LoginScreen`                   | `/login`                    |
| Beranda / Dashboard | `DashboardScreen`               | `/`                         |
| Pesanan Baru        | `NewOrderScreen`                | `/orders/new`               |
| Order Detail        | `OrderDetailScreen`             | `/orders/:id`               |
| Edit Pesanan        | `EditOrderScreen`               | `/orders/:id/edit`          |
| Payment             | `PaymentScreen`                 | `/orders/:id/pay`           |
| Pembayaran QRIS     | `QrisPaymentScreen`             | `/orders/:id/pay/qris`      |
| Pembayaran Berhasil | `PaymentSuccessScreen`          | `/orders/:id/success`       |
| Struk               | `ReceiptScreen` / `ReceiptView` | `/orders/:id/receipt`       |
| Riwayat Pesanan     | `OrderHistoryScreen`            | `/history`                  |
| Penjualan           | `SalesScreen`                   | `/sales`                    |
| Pengaturan          | `SettingsScreen`                | `/settings`                 |
| Edit Profil         | `EditProfileScreen`             | `/settings/profile`         |
| Menu & Harga        | `MenuManagementScreen`          | `/settings/menu`            |
| Metode Pembayaran   | `PaymentMethodsScreen`          | `/settings/payment-methods` |
| Struk / Printer     | `ReceiptPrinterScreen`          | `/settings/printer`         |
| Tentang Aplikasi    | `AboutScreen`                   | `/settings/about`           |
| Dialog Batalkan     | `CancelOrderDialog` (modal)     | — (overlay)                 |
| Sheet Topping       | `ToppingSheet` (modal/sheet)    | — (overlay)                 |
| Empty states        | `EmptyState` (varian)           | — (kondisi dalam layar)     |

> Catatan: Pesanan Baru, Order Detail, Payment, QRIS, Berhasil, dan Struk adalah satu alur; di web beberapa (sheet, dialog) tampil sebagai overlay di atas layar aktif, bukan route terpisah.
