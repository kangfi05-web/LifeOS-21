// Recovery Center — pusat perlindungan & pemulihan data LifeOS.
// Menggantikan section "Backup & Restore" sederhana dengan: Backup Health Score,
// Smart Reminder, Restore Preview (verifikasi sebelum menimpa data), dan Audit Log.

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DatabaseBackup,
  Download,
  Upload,
  ShieldCheck,
  ShieldAlert,
  History,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  X,
} from 'lucide-react';
import {
  downloadBackupFile,
  restoreBackupFromFile,
  previewBackupFile,
  getBackupHealth,
  BackupHealth,
  RestorePreview,
} from '../utils/backupExport';
import { auditLogRepository } from '../repositories/AuditLogRepository';
import { AuditLogEntry } from '../types';

const AUDIT_TYPE_LABEL: Record<AuditLogEntry['type'], string> = {
  backup: 'Backup',
  restore: 'Restore',
  import: 'Import',
  export: 'Export',
  delete_all: 'Hapus Semua Data',
  migration: 'Migrasi',
};

export function RecoveryCenter() {
  const [health, setHealth] = useState<BackupHealth | null>(null);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<RestorePreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refresh = async () => {
    const [h, logs] = await Promise.all([getBackupHealth(), auditLogRepository.getRecent(8)]);
    setHealth(h);
    setAuditLog(logs);
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleExport = async () => {
    setIsExporting(true);
    setStatus(null);
    try {
      const result = await downloadBackupFile();
      setStatus({
        type: 'success',
        message: `Backup berhasil diunduh (${result.totalRecords} data, ${result.tableCount} tabel).`,
      });
      await refresh();
    } catch {
      setStatus({ type: 'error', message: 'Gagal membuat backup. Coba lagi.' });
    } finally {
      setIsExporting(false);
    }
  };

  const handlePickFile = () => fileInputRef.current?.click();

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPendingFile(file);
    setPreviewLoading(true);
    setStatus(null);
    try {
      const p = await previewBackupFile(file);
      setPreview(p);
    } catch {
      setPreview({ valid: false, reason: 'Gagal membaca file.' });
    } finally {
      setPreviewLoading(false);
    }
  };

  const closePreview = () => {
    setPendingFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleConfirmRestore = async () => {
    if (!pendingFile) return;
    setIsRestoring(true);
    try {
      const result = await restoreBackupFromFile(pendingFile, 'replace');
      setStatus({ type: result.success ? 'success' : 'error', message: result.message });
      closePreview();
      await refresh();
      if (result.success) {
        setTimeout(() => window.location.reload(), 1200);
      }
    } catch {
      setStatus({ type: 'error', message: 'Restore gagal. File mungkin rusak.' });
    } finally {
      setIsRestoring(false);
    }
  };

  const handleBackupBeforeRestore = async () => {
    await handleExport();
  };

  const scoreColor = (score: number) =>
    score >= 80 ? 'text-success' : score >= 50 ? 'text-warning' : 'text-danger';

  const reminderBadge = (level: BackupHealth['reminderLevel']) => {
    if (level === 'high')
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-danger/10 text-danger border border-danger/30">
          <ShieldAlert className="w-3 h-3" /> Prioritas Tinggi — Backup Sekarang
        </span>
      );
    if (level === 'suggested')
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning border border-warning/30">
          <AlertTriangle className="w-3 h-3" /> Backup Disarankan
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-success/10 text-success border border-success/30">
        <ShieldCheck className="w-3 h-3" /> Data Aman
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="bg-surface rounded-2xl border border-white/5 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
          <DatabaseBackup className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-semibold">Recovery Center</h2>
          <p className="text-sm text-base-400">Perlindungan & pemulihan seluruh data Anda</p>
        </div>
      </div>

      {/* Backup Health */}
      {health && (
        <div className="bg-white/5 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-base-400">Skor Kesehatan Backup</p>
              <p className={`text-3xl font-bold ${scoreColor(health.score)}`}>{health.score}</p>
            </div>
            {reminderBadge(health.reminderLevel)}
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-base-400">Backup Terakhir</p>
              <p className="font-medium">
                {health.lastBackupAt
                  ? `${health.daysSinceBackup === 0 ? 'Hari ini' : `${health.daysSinceBackup} hari lalu`}`
                  : 'Belum pernah backup'}
              </p>
            </div>
            <div>
              <p className="text-base-400">Perubahan Belum Ter-backup</p>
              <p className="font-medium">{health.changesSinceBackup} perubahan</p>
            </div>
          </div>
        </div>
      )}

      <p className="text-sm text-base-400 mb-3">
        Backup mencakup <strong>seluruh</strong> data Anda secara otomatis (goals, wallet, transaksi,
        achievement, dan tabel lain apa pun yang ada) — tersimpan sebagai file <code>.los</code> yang
        bisa disimpan di Drive, email, atau perangkat lain.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-white/10 hover:border-primary-500/50 hover:bg-primary-500/10 transition-all font-medium disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {isExporting ? 'Mengekspor...' : 'Backup Sekarang (.los)'}
        </button>

        <button
          onClick={handlePickFile}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-white/10 hover:border-primary-500/50 hover:bg-primary-500/10 transition-all font-medium"
        >
          <Upload className="w-4 h-4" />
          Restore dari Backup
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".los,application/json"
          className="hidden"
          onChange={handleFileSelected}
        />
      </div>

      {status && (
        <div
          className={`mt-3 text-sm rounded-xl px-4 py-3 border ${
            status.type === 'success'
              ? 'bg-success/10 border-success/30 text-success'
              : 'bg-danger/10 border-danger/30 text-danger'
          }`}
        >
          {status.message}
        </div>
      )}

      {/* Audit Log */}
      {auditLog.length > 0 && (
        <div className="mt-6 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <History className="w-4 h-4 text-base-400" />
            <p className="text-sm font-medium text-base-400">Riwayat Aktivitas</p>
          </div>
          <div className="space-y-2">
            {auditLog.map((entry) => (
              <div key={entry.id} className="flex items-center gap-3 text-sm">
                {entry.status === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-danger flex-shrink-0" />
                )}
                <span className="font-medium">{AUDIT_TYPE_LABEL[entry.type]}</span>
                {entry.recordCount !== undefined && (
                  <span className="text-base-400">• {entry.recordCount} data</span>
                )}
                <span className="text-base-400 ml-auto text-xs">
                  {new Date(entry.timestamp).toLocaleString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Restore Preview Modal */}
      <AnimatePresence>
        {pendingFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={closePreview}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-surface border border-white/10 rounded-2xl shadow-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Preview Restore</h3>
                <button onClick={closePreview} className="text-base-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {previewLoading ? (
                <p className="text-sm text-base-400 py-8 text-center">Memeriksa file backup...</p>
              ) : !preview?.valid ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-danger">
                    <XCircle className="w-5 h-5" />
                    <p className="font-medium">File Tidak Valid</p>
                  </div>
                  <p className="text-sm text-base-400">{preview?.reason}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {preview.checksumValid === false && (
                    <div className="flex items-start gap-2 bg-danger/10 border border-danger/30 rounded-xl p-3 text-sm text-danger">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>Checksum tidak cocok — file mungkin rusak. Restore tidak disarankan.</span>
                    </div>
                  )}
                  {preview.isLegacyFormat && (
                    <div className="flex items-start gap-2 bg-warning/10 border border-warning/30 rounded-xl p-3 text-sm text-warning">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>Backup format lama (tanpa checksum), tapi tetap bisa dipulihkan.</span>
                    </div>
                  )}

                  <div className="bg-white/5 rounded-xl p-4 space-y-2 text-sm">
                    {preview.exportedAt && (
                      <div className="flex justify-between">
                        <span className="text-base-400">Tanggal Backup</span>
                        <span className="font-medium">
                          {new Date(preview.exportedAt).toLocaleString('id-ID')}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-base-400">Jumlah Tabel</span>
                      <span className="font-medium">{preview.tableCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-base-400">Jumlah Data</span>
                      <span className="font-medium">{preview.totalRecords}</span>
                    </div>
                    {preview.checksumValid !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-base-400">Verifikasi</span>
                        <span className={`font-medium ${preview.checksumValid ? 'text-success' : 'text-danger'}`}>
                          {preview.checksumValid ? 'Valid ✓' : 'Tidak Valid ✗'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="bg-warning/10 border border-warning/30 rounded-xl p-3 text-xs text-warning">
                    Restore akan MENGGANTI seluruh data Anda saat ini dengan isi file ini. Disarankan
                    backup data saat ini dulu sebelum lanjut.
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    <button
                      onClick={handleBackupBeforeRestore}
                      disabled={isExporting}
                      className="w-full py-2.5 rounded-xl border border-white/10 text-sm font-medium hover:border-primary-500/50"
                    >
                      Backup Data Saat Ini Dulu
                    </button>
                    <button
                      onClick={handleConfirmRestore}
                      disabled={isRestoring || preview.checksumValid === false}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-accent text-sm font-semibold text-white disabled:opacity-50"
                    >
                      {isRestoring ? 'Memulihkan...' : 'Lanjutkan Restore'}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
