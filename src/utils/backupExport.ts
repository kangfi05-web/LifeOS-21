// Data Protection & Recovery Engine
// - Auto-discovery: seluruh tabel Dexie di-backup otomatis, tidak ada daftar tabel manual,
//   jadi kalau nanti ada tabel baru, otomatis ikut ter-backup tanpa perlu ubah kode ini.
// - Checksum (SHA-256) untuk verifikasi integritas file backup.
// - Restore Preview: file backup diperiksa dulu sebelum benar-benar ditulis ke database.
// - Safe Restore: snapshot data lama diambil dulu; kalau restore gagal di tengah jalan,
//   data lama otomatis dipulihkan kembali (selain itu Dexie transaction sendiri sudah atomic).

import { db } from '../database';
import { auditLogRepository } from '../repositories/AuditLogRepository';
import { settingsRepository } from '../repositories/OtherRepositories';
import pkg from '../../package.json';

const BACKUP_FORMAT = 'LifeOS_Backup';
const BACKUP_FORMAT_VERSION = 2;

// Tabel yang sengaja TIDAK ikut di-clear/ditimpa saat restore, karena sifatnya
// metadata sistem pemulihan itu sendiri (bukan data yang dimasukkan user).
const RESTORE_EXCLUDED_TABLES = new Set(['auditLog']);

export interface BackupFile {
  format: string;
  formatVersion: number;
  appVersion: string;
  exportedAt: string;
  tableCounts: Record<string, number>;
  totalRecords: number;
  checksum: string;
  data: Record<string, unknown[]>;
}

// Format lama (sebelum v1.11.0) — tetap didukung supaya backup lama masih bisa di-restore
interface LegacyBackupFile {
  backupVersion: number;
  exportedAt: string;
  data: Record<string, unknown[]>;
}

export interface RestorePreview {
  valid: boolean;
  reason?: string;
  isLegacyFormat?: boolean;
  appVersion?: string;
  exportedAt?: string;
  tableCount?: number;
  totalRecords?: number;
  checksumValid?: boolean;
  tableCounts?: Record<string, number>;
}

export interface BackupHealth {
  score: number; // 0-100
  lastBackupAt: Date | null;
  daysSinceBackup: number | null;
  changesSinceBackup: number;
  reminderLevel: 'none' | 'suggested' | 'high';
}

async function computeChecksum(text: string): Promise<string> {
  const encoded = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function isNewFormat(obj: unknown): obj is BackupFile {
  if (!obj || typeof obj !== 'object') return false;
  const c = obj as Record<string, unknown>;
  return c.format === BACKUP_FORMAT && typeof c.checksum === 'string' && !!c.data;
}

function isLegacyFormat(obj: unknown): obj is LegacyBackupFile {
  if (!obj || typeof obj !== 'object') return false;
  const c = obj as Record<string, unknown>;
  return typeof c.backupVersion === 'number' && !!c.data && typeof c.data === 'object';
}

// Auto-discovery: baca seluruh nama tabel langsung dari instance Dexie yang sedang berjalan,
// bukan dari daftar hardcode. Kalau ada tabel baru ditambahkan ke schema, otomatis ikut ke sini.
function getAllTableNames(): string[] {
  return db.tables.map((t) => t.name);
}

export async function exportBackupData(): Promise<BackupFile> {
  const tableNames = getAllTableNames();
  const data: Record<string, unknown[]> = {};
  const tableCounts: Record<string, number> = {};
  let totalRecords = 0;

  for (const name of tableNames) {
    const rows = await db.table(name).toArray();
    data[name] = rows;
    tableCounts[name] = rows.length;
    totalRecords += rows.length;
  }

  const checksum = await computeChecksum(JSON.stringify(data));

  return {
    format: BACKUP_FORMAT,
    formatVersion: BACKUP_FORMAT_VERSION,
    appVersion: pkg.version,
    exportedAt: new Date().toISOString(),
    tableCounts,
    totalRecords,
    checksum,
    data,
  };
}

// Ekspor & unduh backup sebagai file .los (isinya JSON, ekstensi khusus LifeOS).
// Otomatis mencatat ke Audit Log dan reset counter "perubahan sejak backup terakhir".
export async function downloadBackupFile(): Promise<{
  success: boolean;
  totalRecords: number;
  tableCount: number;
}> {
  try {
    const backup = await exportBackupData();
    const json = JSON.stringify(backup, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const a = document.createElement('a');
    a.href = url;
    a.download = `LifeOS_Backup_${dateStr}.los`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    const tableCount = Object.keys(backup.tableCounts).length;

    const settings = await settingsRepository.get();
    if (settings) {
      await settingsRepository.update(settings.id, {
        lastBackupAt: new Date(),
        changesSinceBackup: 0,
      });
    }

    await auditLogRepository.log({
      type: 'backup',
      status: 'success',
      recordCount: backup.totalRecords,
      tableCount,
    });

    return { success: true, totalRecords: backup.totalRecords, tableCount };
  } catch (err) {
    await auditLogRepository.log({
      type: 'backup',
      status: 'failed',
      detail: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

// Periksa isi file backup TANPA menulis apa pun ke database — dipakai untuk
// menampilkan Restore Preview sebelum user memutuskan lanjut restore atau tidak.
export async function previewBackupFile(file: File): Promise<RestorePreview> {
  let text: string;
  try {
    text = await file.text();
  } catch {
    return { valid: false, reason: 'File tidak bisa dibaca.' };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { valid: false, reason: 'File bukan format backup yang valid (bukan JSON/.los yang benar).' };
  }

  if (isNewFormat(parsed)) {
    const recomputed = await computeChecksum(JSON.stringify(parsed.data));
    const checksumValid = recomputed === parsed.checksum;
    return {
      valid: true,
      isLegacyFormat: false,
      appVersion: parsed.appVersion,
      exportedAt: parsed.exportedAt,
      tableCount: Object.keys(parsed.tableCounts ?? parsed.data).length,
      totalRecords: parsed.totalRecords,
      checksumValid,
      tableCounts: parsed.tableCounts,
    };
  }

  if (isLegacyFormat(parsed)) {
    const totalRecords = Object.values(parsed.data).reduce(
      (sum, rows) => sum + (Array.isArray(rows) ? rows.length : 0),
      0
    );
    return {
      valid: true,
      isLegacyFormat: true,
      exportedAt: parsed.exportedAt,
      tableCount: Object.keys(parsed.data).length,
      totalRecords,
      checksumValid: undefined, // backup lama tidak punya checksum, jadi tidak bisa diverifikasi
      tableCounts: Object.fromEntries(
        Object.entries(parsed.data).map(([k, v]) => [k, Array.isArray(v) ? v.length : 0])
      ),
    };
  }

  return { valid: false, reason: 'Struktur file backup tidak dikenali.' };
}

// Restore dengan pengamanan: snapshot data lama diambil dulu sebelum menulis apa pun.
// Kalau proses restore gagal di tengah jalan, data lama otomatis dipulihkan lagi.
export async function restoreBackupFromFile(
  file: File,
  mode: 'replace' | 'merge' = 'replace'
): Promise<{ success: boolean; message: string }> {
  const preview = await previewBackupFile(file);

  if (!preview.valid) {
    await auditLogRepository.log({ type: 'restore', status: 'failed', detail: preview.reason });
    return { success: false, message: preview.reason ?? 'File backup tidak valid.' };
  }

  if (preview.checksumValid === false) {
    await auditLogRepository.log({
      type: 'restore',
      status: 'failed',
      detail: 'Checksum tidak cocok — file kemungkinan rusak atau sudah diubah.',
    });
    return {
      success: false,
      message: 'File backup gagal diverifikasi (checksum tidak cocok). File mungkin rusak atau sudah dimodifikasi. Restore dibatalkan demi keamanan data Anda.',
    };
  }

  const text = await file.text();
  const parsed = JSON.parse(text) as BackupFile | LegacyBackupFile;
  const incomingData = parsed.data;

  const tableNames = getAllTableNames().filter((name) => !RESTORE_EXCLUDED_TABLES.has(name));

  // Safe Restore: ambil snapshot seluruh data saat ini sebagai jaring pengaman tambahan
  // di atas atomicity bawaan Dexie transaction.
  const snapshot: Record<string, unknown[]> = {};
  for (const name of tableNames) {
    snapshot[name] = await db.table(name).toArray();
  }

  try {
    await db.transaction('rw', db.tables, async () => {
      for (const name of tableNames) {
        const rows = incomingData[name] ?? [];

        if (mode === 'replace') {
          await db.table(name).clear();
        }
        if (rows.length > 0) {
          await db.table(name).bulkPut(rows);
        }
      }
    });
  } catch (err) {
    // Rollback: kembalikan data lama dari snapshot
    try {
      await db.transaction('rw', db.tables, async () => {
        for (const name of tableNames) {
          await db.table(name).clear();
          if (snapshot[name]?.length) {
            await db.table(name).bulkPut(snapshot[name]);
          }
        }
      });
    } catch {
      // Kalau rollback pun gagal, biarkan Dexie's own transaction atomicity yang menjaga
      // (transaction asli sudah otomatis di-abort oleh Dexie saat error terjadi).
    }

    await auditLogRepository.log({
      type: 'restore',
      status: 'failed',
      detail: err instanceof Error ? err.message : String(err),
    });

    return {
      success: false,
      message: 'Restore gagal di tengah proses. Data lama Anda sudah dipulihkan kembali secara otomatis, tidak ada data yang hilang.',
    };
  }

  await auditLogRepository.log({
    type: 'restore',
    status: 'success',
    recordCount: preview.totalRecords,
    tableCount: preview.tableCount,
  });

  // Reset counter perubahan karena data sekarang identik dengan backup yang baru di-restore
  const settings = await settingsRepository.get();
  if (settings) {
    await settingsRepository.update(settings.id, { changesSinceBackup: 0 });
  }

  return {
    success: true,
    message: preview.isLegacyFormat
      ? 'Data berhasil dipulihkan dari backup (format lama).'
      : 'Data berhasil dipulihkan dari backup.',
  };
}

// Backup Health & Smart Reminder — dihitung dari kapan backup terakhir dan
// berapa banyak perubahan data yang terjadi sejak saat itu (BUKAN dari waktu semata).
export async function getBackupHealth(): Promise<BackupHealth> {
  const settings = await settingsRepository.get();
  const lastBackupAt = settings?.lastBackupAt ? new Date(settings.lastBackupAt) : null;
  const changesSinceBackup = settings?.changesSinceBackup ?? 0;

  const daysSinceBackup = lastBackupAt
    ? Math.floor((Date.now() - lastBackupAt.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  let reminderLevel: BackupHealth['reminderLevel'] = 'none';
  if (changesSinceBackup >= 100) reminderLevel = 'high';
  else if (changesSinceBackup >= 20) reminderLevel = 'suggested';

  // Skor 100 kalau baru backup & belum ada perubahan, menurun seiring banyaknya
  // perubahan yang belum ter-backup (dan sedikit penalti tambahan kalau belum pernah backup sama sekali)
  let score = 100 - Math.min(100, changesSinceBackup);
  if (!lastBackupAt) score = Math.min(score, 40);

  return {
    score: Math.max(0, Math.round(score)),
    lastBackupAt,
    daysSinceBackup,
    changesSinceBackup,
    reminderLevel,
  };
}

// Dipanggil oleh event-listener global tiap ada perubahan data (lihat backupChangeTracker.ts)
export async function incrementChangeCounter(): Promise<void> {
  const settings = await settingsRepository.get();
  if (!settings) return;
  await settingsRepository.update(settings.id, {
    changesSinceBackup: (settings.changesSinceBackup ?? 0) + 1,
  });
}
