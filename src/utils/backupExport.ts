// Backup & Restore utility: export/import seluruh data LifeOS ke/dari file JSON
// Ini terpisah dari BackupRepository (yang menyimpan snapshot di dalam IndexedDB itu sendiri).
// File JSON hasil export bisa disimpan di luar browser (Drive, email, dsb) sehingga
// data tetap aman walau browser/cache dihapus atau pindah device.

import { db } from '../database';
import type { Table } from 'dexie';

const BACKUP_VERSION = 1;

interface BackupFile {
  backupVersion: number;
  exportedAt: string;
  data: {
    users: unknown[];
    settings: unknown[];
    goals: unknown[];
    transactions: unknown[];
    wallets: unknown[];
    dailyProgress: unknown[];
    achievements: unknown[];
    visionBoard: unknown[];
    notifications: unknown[];
    lifeJourney: unknown[];
    analyticsCache: unknown[];
  };
}

const TABLES = [
  'users',
  'settings',
  'goals',
  'transactions',
  'wallets',
  'dailyProgress',
  'achievements',
  'visionBoard',
  'notifications',
  'lifeJourney',
  'analyticsCache',
] as const;

type TableName = (typeof TABLES)[number];

function getTable(name: TableName): Table<unknown, string> {
  return db[name] as unknown as Table<unknown, string>;
}

// Mengumpulkan semua data dari IndexedDB menjadi satu objek JSON
export async function exportBackupData(): Promise<BackupFile> {
  const data: Record<string, unknown[]> = {};

  for (const table of TABLES) {
    data[table] = await getTable(table).toArray();
  }

  return {
    backupVersion: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data: data as BackupFile['data'],
  };
}

// Memicu download file JSON ke komputer user
export async function downloadBackupFile(): Promise<void> {
  const backup = await exportBackupData();
  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const date = new Date().toISOString().split('T')[0];
  const a = document.createElement('a');
  a.href = url;
  a.download = `lifeos-backup-${date}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Validasi struktur file backup sebelum di-restore
function isValidBackupFile(obj: unknown): obj is BackupFile {
  if (!obj || typeof obj !== 'object') return false;
  const candidate = obj as Record<string, unknown>;
  return (
    typeof candidate.backupVersion === 'number' &&
    !!candidate.data &&
    typeof candidate.data === 'object'
  );
}

// Restore data dari file JSON. mode 'replace' akan menghapus data lama dulu,
// mode 'merge' hanya menambahkan/menimpa record dengan id yang sama.
export async function restoreBackupFromFile(
  file: File,
  mode: 'replace' | 'merge' = 'replace'
): Promise<{ success: boolean; message: string }> {
  const text = await file.text();
  let parsed: unknown;

  try {
    parsed = JSON.parse(text);
  } catch {
    return { success: false, message: 'File bukan JSON yang valid.' };
  }

  if (!isValidBackupFile(parsed)) {
    return { success: false, message: 'Format file backup tidak dikenali.' };
  }

  await db.transaction('rw', db.tables, async () => {
    for (const table of TABLES) {
      const rows = (parsed as BackupFile).data[table] ?? [];

      if (mode === 'replace') {
        await getTable(table).clear();
      }

      if (rows.length > 0) {
        await getTable(table).bulkPut(rows);
      }
    }
  });

  return { success: true, message: 'Data berhasil dipulihkan dari backup.' };
}
