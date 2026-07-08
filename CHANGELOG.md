# Changelog

Semua perubahan penting pada project ini dicatat di file ini.
Format mengikuti [Semantic Versioning](https://semver.org/lang/id/): `MAJOR.MINOR.PATCH`

- **MAJOR**: perubahan besar yang tidak kompatibel dengan versi sebelumnya
- **MINOR**: penambahan fitur baru (tetap kompatibel)
- **PATCH**: perbaikan bug kecil / update minor

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
