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
- Ikon yang dipakai: `house`, `receipt`/`clipboard`, `clock`, `trending-up`, `settings`, `log-out`, `plus`, `minus`, `check`, `x`, `search`, `arrow-left`, `chevron-right`, `sliders-horizontal` (pilih Add-on), `pencil` (edit), `trash-2` (batalkan), `credit-card`, `printer`, `info`, `triangle-alert` (dialog batal), `qr-code`.

---

## 3. Komponen (prefix `POS/`)

Semua komponen diberi prefix `POS/` agar terisolasi dari design system lain.

| Komponen               | Spesifikasi                                                                                                                                         |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POS/Button`           | Varian **Primary** (fill `ink`, teks putih) & **Secondary** (bg putih, border `gray-200`, teks `ink`). Tinggi **44**, radius 8, teks 14 Medium.     |
| `POS/Icon Button`      | 40×40, radius 8, border `gray-200`. Varian solid (quick-add `+`) & outline.                                                                         |
| `POS/Input`            | Bg putih, border `gray-200`, radius 8, padding 12–14. Label 12 `gray-600` di atas.                                                                  |
| `POS/Search`           | Input dengan ikon `search` 20 + placeholder.                                                                                                        |
| `POS/Side Nav`         | Navigasi responsif. Desktop memakai sidebar; mobile memakai bottom navigation tetap dengan lima tujuan utama. Varian `Active = Beranda / Pesanan / Riwayat / Penjualan / Akun`. |
| `POS/Badge`            | Varian **Neutral** (`gray-100`/`gray-600`), **Success** (Lunas), **Error** (Belum Bayar), **Dibatalkan** (gray). Pill, teks 11 Medium.              |
| `POS/Menu Item`        | Baris menu: nama + harga + aksi.                                                                                                                    |
| `POS/Quantity Stepper` | `[−] qty [+]`, tombol 28–36px radius 6.                                                                                                             |
| `POS/Order Item`       | Baris item pesanan: nama, `harga × qty`, subtotal baris, add-on, dan catatan opsional per item (maks. 200 karakter).                               |
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
- **Bottom Navigation**: tinggi 64 + safe-area, fixed di bawah layar. Berisi Beranda, Pesanan, Riwayat, Penjualan, Akun (ikon + label ringkas). Item aktif memakai bg `gray-100`, ikon/teks `ink`; konten memberi padding bawah agar tidak tertutup.
- **Konten**: memenuhi lebar layar di bawah header; kartu/baris memakai `layoutAlign: stretch`.
- Layar sub (New Order, Payment, dll.) memakai **back button**.

## 6. Layout — Web (1280 × 832)

- **Sidebar**: lebar **240**, full-height, bg putih + border kanan. Brand (logo "P" + "Pancong POS" + "Kasir: Budi") di atas; nav (Beranda, Pesanan Baru, Riwayat, Penjualan) + di bawah: Pengaturan, Keluar. Item aktif: fill `ink` + teks putih; non-aktif: `gray-600`.
- **Topbar**: tinggi **72**, bg putih + border bawah. Judul + subtitle kiri; aksi (mis. `+ Pesanan Baru`) kanan.
- **Konten**: `x=240, y=72`, bg `#F5F5F5`, padding 32, kartu putih. Layout multi-kolom (mis. New Order = grid menu + panel keranjang; Beranda = KPI + 2 kolom).
- Beberapa layar mobile menjadi **modal** di web (sheet Add-on, dialog batalkan) dengan backdrop gelap (`ink` @ 45%).

---

## 7. Inventaris Layar

Dikelompokkan per alur (sama untuk mobile & web; web menata ulang jadi layout desktop):

**Alur Pesanan**

- Beranda / Dashboard — KPI (Penjualan hari ini, Pesanan, Lunas, Belum Bayar), Pesanan Terbaru, Menu Terlaris.
- Pesanan Baru — daftar menu (kategori Pancong & Ketan Susu) + keranjang. Tiap item di keranjang dapat langsung diedit untuk mengubah Add-on dan jumlah tanpa kembali ke daftar menu; sheet Add-on mempertahankan pilihan dan jumlah yang sudah dipilih. Catatan per item opsional. Ada field **Nama Pemesan**.
- Sheet Add-on (Pancong / Ketan Susu) — pilih Add-on yang tersedia pada menu (rasa sudah ditentukan dari item menu), qty, "Tambah ke Pesanan". _(Modal di web.)_
- Order Detail — nama pemesan, item, subtotal/total, aksi Edit / Batalkan / Bayar.
- Edit Pesanan — ubah qty/item + "Batalkan Pesanan" (destruktif, beda dari "Batal" = batal edit).

**Pembayaran**

- Payment — Total, metode (Tunai / QRIS), uang diterima, kembalian, Konfirmasi.
- Pembayaran QRIS — instruksi untuk memakai QRIS toko di luar aplikasi, verifikasi pada aplikasi merchant/bukti transaksi, lalu konfirmasi manual oleh kasir. Aplikasi tidak membuat QR, tidak memverifikasi transaksi otomatis, dan belum terintegrasi dengan payment gateway.
- Pembayaran Berhasil — konfirmasi sukses + Cetak Struk / Selesai.
- Struk — preview struk (toko, pelanggan, item, total, tunai, kembalian) + Cetak/Bagikan.

**Riwayat & Penjualan**

- Riwayat Pesanan — list/tabel + chip filter (Semua, Lunas, Belum Bayar, Dibatalkan). Aksi Edit/Batalkan pada pesanan Belum Bayar.
- Penjualan — total hari ini, jumlah pesanan lunas, rata-rata per pesanan, penjualan per menu, dan grafik 7 hari berdasarkan tanggal Asia/Jakarta. Agregat menu memakai harga item/add-on dalam snapshot transaksi, hanya menghitung pesanan lunas, dan totalnya tidak boleh melebihi total penjualan.

**Pengaturan**

- Pengaturan (menu) → Edit Profil, Menu & Harga, Metode Pembayaran, Struk / Printer, Tentang Aplikasi, Keluar.
- Edit Profil mengatur nama toko, nama kasir, dan nomor telepon toko; preferensi disimpan di server untuk tenant.
- Metode Pembayaran mengatur metode yang akan tersedia (minimal satu metode aktif) dan pilihan tersebut berlaku pada alur pembayaran.
- Struk / Printer menyimpan lebar kertas, pesan penutup, dan preferensi cetak otomatis; koneksi printer fisik belum termasuk.
- Menu & Harga menyediakan CRUD kategori. ID kategori stabil saat nama diubah; menu harus dipindahkan ke kategori lain sebelum kategori berisi menu dapat dihapus, dan setidaknya satu kategori harus tersisa.
- Pesanan Baru dan Edit Pesanan memakai kategori yang sama dengan pengelolaan menu. ID kategori pada item pesanan menjadi snapshot dan tidak ditulis ulang saat kategori menu diubah atau dihapus.

**Lain-lain**

- Login sederhana menggunakan akun tenant; autentikasi dan session dikelola serta diverifikasi di server.
- Role pengguna: `owner` untuk pengelolaan usaha dan `cashier` untuk operasional kasir; otorisasi ditegakkan di server.
- Dialog Konfirmasi Batalkan.
- Empty states: keranjang kosong, riwayat kosong, hasil cari kosong.

---

## 8. Alur Utama (prototype: transisi **instant**)

1. **Pesan → Bayar:** Beranda → Pesanan Baru → (quick-add `+` / sheet Add-on) → Review (Order Detail) → Payment → (Tunai: uang diterima/kembalian **atau** QRIS: verifikasi merchant lalu konfirmasi manual) → Pembayaran Berhasil → Cetak Struk.
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
| Extra Keju                             | Add-on     | Rp 3.000 |
| Susu Kental Manis / Kacang / Meises    | Add-on     | Rp 2.000 |

Rasa Pancong = item menu terpisah (Original/Coklat/Strawberry/Keju). Sheet Add-on hanya mengatur Add-on, bukan rasa.

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

## 10. Arsitektur Data & Model (acuan implementasi)

MongoDB adalah penyimpanan persisten. Akses database hanya dari server melalui data-access layer.
Zustand boleh menyimpan state UI dan draft sementara, tetapi bukan sumber utama data transaksi atau
pengaturan. Koleksi tenant bisnis menggunakan `tenantId`; setiap query dan mutasi wajib membatasinya
dengan tenant dari session terverifikasi. `tenantId` dari browser tidak dipercaya.

Struktur koleksi minimal:

```
Tenant {
  _id: ObjectId
  name: string
  slug: string
  status: "active" | "disabled"
  timezone: string
  createdAt: datetime
  updatedAt: datetime
}
User {
  _id: ObjectId
  tenantId: ObjectId
  email: string
  passwordHash: string
  displayName: string
  role: "owner" | "cashier"
  active: boolean
  createdAt: datetime
  updatedAt: datetime
}
MenuItem {
  _id: ObjectId
  tenantId: ObjectId
  menuId: string
  name: string
  categoryId: string
  price: integer                 // Rupiah
  addonIds: ObjectId[]            // Add-on yang tersedia untuk menu ini; referensi dalam tenant yang sama
  active: boolean
  createdAt: datetime
  updatedAt: datetime
}
Settings {
  _id: ObjectId
  tenantId: ObjectId
  storeName: string
  storePhone: string
  enabledPaymentMethods: ("tunai" | "qris")[]
  cashierName: string         // nama kasir default/profil yang masih dipakai
  receiptFooter: string
  receiptPaperWidth: "58mm" | "80mm"
  autoPrintReceipt: boolean
  menuCategories: { id: string, name: string }[]
  updatedAt: datetime
}
Session (server-side session storage):
  userId: ObjectId
  tenantId: ObjectId
  tokenHash: string
  expiresAt: datetime
  revokedAt?: datetime
```

`Settings` menyimpan kategori agar ID kategori yang stabil dan kategori tanpa menu tetap dapat
dipertahankan tanpa menambah koleksi kategori terpisah. Terapkan indeks unik tenant-scoped untuk
slug tenant, email pengguna dalam tenant, ID menu dalam tenant, dan nomor pesanan dalam tenant;
indeks session harus mendukung pencabutan dan expiry.

Session menggunakan token acak opaque yang dikirim lewat cookie `HttpOnly`, `Secure` pada produksi,
`SameSite` yang sesuai, dan masa berlaku terbatas. Server memverifikasi session pada setiap request,
membentuk konteks pengguna/tenant/role yang tepercaya, serta mencabut session saat logout. Password
disimpan sebagai hash kuat (misalnya Argon2id), bukan plaintext. Pemeriksaan role dan tenant dilakukan
di server untuk setiap Route Handler, Server Action, dan akses data; proteksi halaman UI bukan satu-
satunya kontrol.

Sebelum setiap operasi baca atau tulis, server wajib memeriksa session terautentikasi, izin role
terhadap aksi dan resource, serta membatasi operasi pada tenant dari session tersebut. Kegagalan salah
satu pemeriksaan harus menolak operasi. Jangan menerima `tenantId` dari input browser sebagai dasar
otorisasi atau isolasi data.

Koneksi MongoDB dan session secrets hanya tersedia di runtime server melalui secret manager atau
environment server. Jangan mengeksposnya melalui client bundle, props, respons API, atau variabel
`NEXT_PUBLIC_*`.

```
Order {
  _id: ObjectId
  tenantId: ObjectId
  orderNumber: string         // nomor tampilan, unik dalam tenant (mis. "#012")
  customerName: string       // "Andi"
  items: OrderItem[]
  subtotal: number
  total: number
  status: "baru" | "belum_bayar" | "lunas" | "dibatalkan"
  paymentMethod?: "tunai" | "qris"
  paymentConfirmation?: "manual" // konfirmasi QRIS oleh kasir; bukan gateway
  paidAt?: datetime
  cashReceived?: number
  change?: number
  cashierUserId?: ObjectId
  cashierName: string         // snapshot nama untuk riwayat
  createdAt: datetime
  updatedAt: datetime
}
OrderItem {
  menuId: string
  name: string                // snapshot nama saat transaksi
  categoryId: string           // snapshot ID kategori saat transaksi
  categoryName: string         // snapshot nama kategori saat transaksi
  unitPrice: integer           // snapshot harga rupiah saat transaksi
  qty: integer
  addons: { addonId: ObjectId, name: string, unitPrice: integer, qty: integer }[] // snapshot transaksi
  note?: string
}
Addon {
  _id: ObjectId
  tenantId: ObjectId
  name: string
  additionalPrice: integer      // Rupiah
  active: boolean
  sortOrder: integer             // urutan tampilan dalam tenant
  createdAt: datetime
  updatedAt: datetime
}
MenuItem { tenantId, menuId, name, categoryId, price: integer, addonIds: ObjectId[], active }
```

`Addon` adalah satu-satunya master untuk tambahan yang dapat dipilih (contoh: Keju, Meses, Oreo,
Milo, Susu ekstra). Simpan Add-on pada koleksi `addons`.
Setiap query/mutasi Add-on harus memfilter `tenantId` dari session terverifikasi. Terapkan indeks
unik `{ tenantId, name }` dan indeks daftar `{ tenantId, active, sortOrder }`. `MenuItem.addonIds`
menentukan pilihan yang tersedia untuk menu dan hanya boleh mereferensikan Add-on aktif dalam tenant
yang sama saat pesanan baru dibuat. Nonaktifkan Add-on dengan `active: false`; jangan hapus dokumen
yang masih direferensikan.

Setiap `OrderItem` menyimpan daftar Add-on sebagai snapshot `{ addonId, name, unitPrice, qty }`.
Harga dan nama snapshot berasal dari master yang tervalidasi pada saat transaksi, dan `qty` adalah
jumlah Add-on untuk satu unit menu (nilai 1 untuk pilihan sekali-pilih); jumlah unit pesanan tetap
`OrderItem.qty`. Total Add-on per baris dihitung `unitPrice × qty × OrderItem.qty`. Snapshot lama
tetap bisa ditampilkan meskipun master Add-on dinonaktifkan atau diperbarui. ID referensi dan semua
lookup tetap dibatasi ke tenant yang sama.

Aturan pemesanan Add-on:

- Satu item pesanan boleh memiliki beberapa Add-on berbeda; setiap Add-on muncul paling banyak sekali
  per item (jumlah diatur lewat `qty`). Pilihan saat ini sekali-pilih, sehingga `qty` = 1.
- Pesanan baru hanya boleh memakai Add-on yang `active: true`, tercantum di `MenuItem.addonIds`, dan
  berasal dari tenant yang sama. Server wajib memvalidasi ulang pilihan terhadap master sebelum
  menyimpan; harga dari browser tidak dipercaya.
- Add-on yang nonaktif tidak ditawarkan untuk pesanan baru, tetapi tetap tampil di histori dari
  snapshot. Histori tidak divalidasi ulang terhadap master.

Pemetaan model klien saat ini (`types/pos.ts`, masih memakai data lokal sampai migrasi):

| Klien                                      | MongoDB                                  | Catatan                                                                |
| ------------------------------------------ | ---------------------------------------- | ---------------------------------------------------------------------- |
| `Addon { id, name, price, active, sortOrder }` | `AddonDocument` (`_id`, `additionalPrice`) | Master tunggal; `tenantId` hanya ada di server                         |
| `MenuItem.addonIds?: string[]`             | `MenuItemDocument.addonIds: ObjectId[]`  | Klien: `undefined` = semua Add-on aktif (data menu lama), `[]` = tanpa Add-on |
| `OrderItemAddon { addonId?, name, price, qty? }` | `AddonSnapshot { addonId, name, unitPrice, qty }` | `addonId`/`qty` opsional hanya untuk pesanan lama di perangkat; `qty` default 1 |

Helper domain berada di `lib/addons/addons.ts` (`getSelectableAddons`, `createAddonSnapshot`,
`findUnavailableAddons`). Flag lama `hasToppings` pada data menu lokal dibaca sebagai
`addonIds` (`false` → `[]`) tanpa membuang data.

Simpan harga sebagai bilangan integer Rupiah. Snapshot item, kategori, harga, kuantitas, add-on,
subtotal, dan total pada order tidak boleh berubah ketika menu/kategori diperbarui. Pada pembayaran,
pertahankan status, metode, waktu pembayaran, nilai uang diterima dan kembalian untuk Tunai. QRIS
dicatat sebagai konfirmasi manual oleh kasir beserta identitas/waktu konfirmasi yang tersedia; aplikasi
belum terintegrasi dengan payment gateway dan tidak melakukan verifikasi otomatis.

### 10.1 Migrasi data lokal

- Migrasikan salinan `localStorage` yang ditemukan untuk menu/kategori, pengaturan, dan pesanan melalui
  proses import tenant-scoped dengan validasi dan laporan dry-run.
- Jangan menghapus atau menimpa data lokal saat import. Pertahankan sumber sampai backup, jumlah data,
  status, dan nilai hasil impor diverifikasi; sediakan penanganan konflik dan impor yang aman diulang.
- Pertahankan nomor pesanan lama sebagai referensi historis, snapshot harga/kategori/add-on, status,
  timestamp, metode pembayaran, uang diterima, kembalian, serta teks nama kasir yang ada. Jangan
  mengarang metadata yang tidak tersimpan pada transaksi lama.
- Pisahkan seed/demo dari transaksi operasional dan jangan impor seed sebagai transaksi nyata.

---

## 11. Yang HARUS dipatuhi (do / don't)

- ✅ Inter saja; palet di §2.1 saja; ikon Lucide stroke 2.
- ✅ Aksi Edit/Batalkan hanya untuk **Belum Bayar**, di dalam kartu, dengan konfirmasi.
- ✅ Transisi antar layar **instant** (tanpa animasi) — sesuai keputusan tim.
- ✅ Seluruh akses data dibatasi tenant dari session server terverifikasi; role diperiksa di server.
- ✅ Migrasi data lokal non-destruktif; snapshot harga dan metadata pembayaran dipertahankan.
- ✅ QRIS dikonfirmasi manual dan belum terintegrasi payment gateway.
- ❌ Jangan mempercayai `tenantId` dari browser atau mengekspos kredensial/secret server.
- ❌ Jangan menghapus data lokal sebelum proses migrasi dan verifikasi selesai.
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
| (sheet Add-on)         | `AddonSheet`        | `components/order/AddonSheet`        | `menuItem`, `addons`, `onAdd`, `onClose` — bottom sheet (mobile) / modal (web) |
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
| Sheet Add-on        | `AddonSheet` (modal/sheet)      | — (overlay)                 |
| Empty states        | `EmptyState` (varian)           | — (kondisi dalam layar)     |

> Catatan: Pesanan Baru, Order Detail, Payment, QRIS (konfirmasi manual, tanpa QR dari aplikasi), Berhasil, dan Struk adalah satu alur; di web beberapa (sheet, dialog) tampil sebagai overlay di atas layar aktif, bukan route terpisah.
