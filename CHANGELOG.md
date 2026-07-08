# Changelog

Semua perubahan penting pada project ini dicatat di file ini.
Format mengikuti [Semantic Versioning](https://semver.org/lang/id/): `MAJOR.MINOR.PATCH`

- **MAJOR**: perubahan besar yang tidak kompatibel dengan versi sebelumnya
- **MINOR**: penambahan fitur baru (tetap kompatibel)
- **PATCH**: perbaikan bug kecil / update minor

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
