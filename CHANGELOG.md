# Changelog

Semua perubahan penting pada project ini dicatat di file ini.
Format mengikuti [Semantic Versioning](https://semver.org/lang/id/): `MAJOR.MINOR.PATCH`

- **MAJOR**: perubahan besar yang tidak kompatibel dengan versi sebelumnya
- **MINOR**: penambahan fitur baru (tetap kompatibel)
- **PATCH**: perbaikan bug kecil / update minor

## [1.11.0] - 2026-07-08
### Added
- **Recovery Center** — perombakan total sistem backup jadi pusat perlindungan data:
  - **Auto-Discovery**: backup otomatis membaca SEMUA tabel Dexie yang ada saat itu (tidak ada daftar tabel hardcode) — kalau nanti ada tabel/fitur baru, otomatis ikut ter-backup tanpa perlu ubah kode
  - **Checksum verifikasi** (SHA-256): tiap backup punya checksum yang diverifikasi ulang saat restore, supaya file yang rusak/berubah terdeteksi sebelum menimpa data
  - **Restore Preview**: sebelum restore benar-benar dijalankan, tampil dulu detail file (tanggal backup, jumlah tabel, jumlah data, status verifikasi) — user baru konfirmasi setelah yakin
  - **Safe Restore**: snapshot data lama diambil otomatis sebelum restore; kalau proses gagal di tengah jalan, data lama dipulihkan otomatis tanpa ada yang hilang
  - **Backup Health Score & Smart Reminder**: skor kesehatan backup dihitung dari berapa banyak perubahan data yang belum ter-backup (bukan cuma dari waktu) — ada badge "Backup Disarankan" (20+ perubahan) dan "Prioritas Tinggi" (100+ perubahan)
  - **Audit Log**: riwayat backup/restore/import/export tersimpan dan bisa dilihat di Recovery Center
  - Format file baru **`.los`** (LifeOS Backup), tetap bisa membaca backup format lama (`.json`) dari versi sebelumnya untuk kompatibilitas mundur
- Skema database naik ke versi 2 (tambah tabel `auditLog`) — migrasi otomatis & aman, data lama tidak terpengaruh

## [1.10.0] - 2026-07-08
### Fixed
- **Grafik "Progress Mingguan" di Dashboard kini pakai data asli**, bukan sample hardcode `[80, 100, 45, 90, 30, 60, 75]` — dihitung dari tabel `dailyProgress` (target vs realisasi nabung tiap hari), sama seperti perbaikan Analytics di v1.2.0
- Hari yang belum terjadi minggu ini ditampilkan kosong/redup (bukan angka acak), dan hari ini ditandai warna beda di label

## [1.9.0] - 2026-07-08
### Added
- **Status detail cicilan bulanan** — pelengkap fitur Mode Cicilan Bulanan (v1.8.0):
  - Setiap target cicilan sekarang menampilkan **titik status per bulan** (✓ lunas hijau, biru = bulan berjalan, ⚠️ merah = tertunggak, abu-abu = belum jatuh tempo)
  - Ringkasan otomatis seperti **"Lunas 2 dari 6 bulan • tersisa 4 bulan lagi"**, dan kalau ada tunggakan langsung ditandai **"ada tunggakan, sedang dikejar"**
  - **Widget baru "Cicilan Bulanan" di Dashboard** — menampilkan ringkasan semua target cicilan aktif sekaligus, tanpa perlu buka halaman Goals
  - Status per bulan dihitung murni dari total dana terkumpul (bukan dari histori pembayaran manual), jadi tetap akurat walau user bayar lebih cepat/lambat dari jadwal

## [1.8.0] - 2026-07-08
### Added
- **Mode Cicilan Bulanan** untuk target — khusus buat hutang/kewajiban yang dibayar rutin tiap bulan selama beberapa bulan (misal hutang 6 bulan):
  - Saat buat target baru, aktifkan toggle "Mode Cicilan Bulanan", isi jumlah bulan (mis. 6) — deadline otomatis terhitung dari tanggal mulai + jumlah bulan
  - Target harian dihitung **dalam lingkup bulan berjalan saja** (sisa cicilan bulan ini ÷ sisa hari bulan ini), bukan disebar ke seluruh durasi cicilan
  - Kalau ada bulan yang terlewat/kurang bayar, kekurangannya **otomatis menumpuk** ke bulan berikutnya sampai lunas
  - Label **"Bulan ke-X dari Y"** muncul otomatis di kartu target dan form, mengikuti tanggal hari ini
  - Semua perhitungan tetap ter-refresh otomatis (memakai mekanisme catch-up dari v1.7.0)

## [1.7.0] - 2026-07-08
### Fixed
- **Bug perhitungan target harian (dailyTarget) tidak "mengejar" hari yang terlewat** — sebelumnya, `dailyTarget` cuma dihitung ulang saat ada transaksi nabung masuk. Kalau user tidak menabung sama sekali selama beberapa hari, angka target harian tetap memakai nilai lama (basi), padahal seharusnya naik untuk mengganti hari-hari yang terlewat agar target tetap tercapai di tanggal deadline
- Sekarang `dailyTarget`, `weeklyTarget`, dan `monthlyTarget` dihitung ulang otomatis berdasarkan **sisa dana ÷ sisa hari ke deadline** setiap kali aplikasi dibuka, dan dicek ulang tiap 15 menit kalau aplikasi dibiarkan terbuka lewat tengah malam — sehingga kekurangan dari hari yang terlewat otomatis terdistribusi ke hari-hari berikutnya
- Kalau deadline sudah lewat sebelum target selesai, dailyTarget menampilkan sisa dana penuh (menandakan sudah harus dikejar sekarang)

## [1.6.0] - 2026-07-08
### Performance
- **Query database lebih efisien**: Life Journey kini diambil langsung lewat index Dexie (`getRecent`) alih-alih ambil seluruh tabel lalu di-sort di JavaScript — lebih cepat & scalable seiring data bertambah
- **Import locale lebih presisi**: `date-fns/locale` diarahkan ke subpath `date-fns/locale/id` agar tree-shaking terjamin di semua bundler, bukan bergantung asumsi
- **Universal Search makin responsif**: input pencarian di Command Center (CTRL+K) sekarang pakai `useDeferredValue` — ketikan tidak pernah terasa lag walau hasil pencarian & data banyak, karena kalkulasi berat (fuzzy match, parsing command) "ditunda" sepersekian detik tanpa mengganggu input

### Notes
- Chunk `vendor-charts` (recharts) tetap ~512KB tapi sudah terisolasi & hanya dimuat saat halaman Analytics dibuka (lazy), tidak membebani halaman lain. Untuk pengecilan lebih lanjut perlu ganti library chart — dicatat sebagai rekomendasi pengembangan berikutnya, bukan dikerjakan sekarang karena berisiko tinggi untuk manfaat yang belum tentu terasa oleh pengguna.
- Ditemukan data sample hardcode di grafik "Progress Mingguan" pada Dashboard (bukan masalah performa, tapi soal akurasi data) — direkomendasikan diperbaiki di sesi berikutnya seperti halnya Analytics sebelumnya.

## [1.5.0] - 2026-07-08
### Added
- **Universal Search & Command Engine** (CTRL+K / CMD+K) — command palette yang sudah ada sebelumnya kini ditingkatkan jadi pencarian universal:
  - Mencari **Goals, Wallet, Saving History (transaksi), Achievement, Life Journey** langsung dari database Dexie (bukan dari state UI), sehingga hasil selalu lengkap & konsisten
  - **Fuzzy search dengan toleransi typo** (berbasis Levenshtein distance) — salah ketik sedikit tetap ketemu
  - **Natural Command** — ketik langsung tanpa buka menu, contoh: `tambah dana 50rb`, `tambah target Laptop`, `backup data`, `buka wallet`, `export pdf`
  - **Ranking berdasarkan frekuensi pemakaian** — command yang sering dipakai naik ke atas, disimpan permanen di perangkat
  - Aksi backup/export bisa langsung dijalankan dari command palette tanpa pindah halaman
  - Error handling: jika sebagian data gagal dimuat, pencarian tetap bisa dipakai dengan command statis
  - Peningkatan aksesibilitas: ARIA label, role dialog/listbox/option, dan dukungan *reduce motion*

### Notes
- Cakupan pencarian disesuaikan dengan data yang benar-benar ada di LifeOS versi ini (Goals, Wallet, Saving History, Achievement, Life Journey). Item seperti Notification/Category/Tags belum jadi entitas tersendiri di database sehingga belum diindeks terpisah.

## [1.4.0] - 2026-07-08
### Added
- **Notifikasi update otomatis** — saat ada versi baru LifeOS ter-deploy, pengguna yang sudah meng-install aplikasi akan melihat notifikasi kecil "Update Tersedia" dengan tombol "Perbarui Sekarang"
- Aplikasi otomatis cek versi baru setiap 60 menit selagi dibuka, tanpa mengganggu penggunaan

## [1.3.0] - 2026-07-08
### Added
- **PWA (Progressive Web App)** — aplikasi sekarang bisa di-*install* ke Home Screen (HP) atau desktop, dan tetap bisa dibuka meski koneksi internet terputus (offline-capable untuk halaman & tampilan; data tetap tersimpan lokal di IndexedDB seperti sebelumnya)
- Ikon aplikasi resmi LifeOS (favicon, ikon Android, ikon iOS/apple-touch-icon, maskable icon)
- Auto-update: service worker otomatis mengambil versi terbaru saat ada deploy baru

## [1.2.0] - 2026-07-08
### Fixed
- **Analytics kini pakai data asli**, bukan mock — grafik mingguan, distribusi kategori, streak, achievement, dan skor kesehatan finansial dihitung dari data user sesungguhnya
- Perbaiki semua error TypeScript (mismatch tipe Theme, properti yang tidak ada di tipe Goal, method yang belum ada di repository)
- Perbaiki semua error ESLint (unused variable, penggunaan `any`)

### Performance
- **Code-splitting per halaman** — ukuran file JS awal turun dari ~1MB menjadi ~122KB, tiap halaman dimuat sesuai kebutuhan
- Pisahkan vendor library besar (recharts, framer-motion, dexie) ke chunk terpisah agar caching lebih efisien

## [1.1.0] - 2026-07-08
### Added
- Fitur **Export Backup**: unduh seluruh data (goals, wallet, transaksi, achievement, dll) ke file `.json`
- Fitur **Import/Restore Backup**: pulihkan data dari file `.json` hasil export, dengan konfirmasi sebelum menimpa data
- UI Backup & Restore baru di halaman Settings

## [1.0.0] - 2026-07-08
### Added
- Rilis pertama LifeOS ke GitHub & Netlify
- Deploy otomatis via Netlify (`netlify.toml`)
