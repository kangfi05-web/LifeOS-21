# Changelog

Semua perubahan penting pada project ini dicatat di file ini.
Format mengikuti [Semantic Versioning](https://semver.org/lang/id/): `MAJOR.MINOR.PATCH`

- **MAJOR**: perubahan besar yang tidak kompatibel dengan versi sebelumnya
- **MINOR**: penambahan fitur baru (tetap kompatibel)
- **PATCH**: perbaikan bug kecil / update minor

## [1.1.0] - 2026-07-08
### Added
- Fitur **Export Backup**: unduh seluruh data (goals, wallet, transaksi, achievement, dll) ke file `.json`
- Fitur **Import/Restore Backup**: pulihkan data dari file `.json` hasil export, dengan konfirmasi sebelum menimpa data
- UI Backup & Restore baru di halaman Settings

## [1.0.0] - 2026-07-08
### Added
- Rilis pertama LifeOS ke GitHub & Netlify
- Deploy otomatis via Netlify (`netlify.toml`)
