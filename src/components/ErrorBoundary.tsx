// Error Boundary — mencegah satu error di komponen manapun membuat SELURUH aplikasi blank putih.
// Fallback UI ini sengaja dibuat independen dari state aplikasi utama (tidak bergantung Zustand
// store atau context lain yang mungkin ikut jadi penyebab crash), dan menyediakan jalan darurat
// untuk backup data langsung dari sini — karena inilah momen paling kritis untuk "zero data loss".

import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, DownloadCloud } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  backupStatus: 'idle' | 'loading' | 'success' | 'error';
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, backupStatus: 'idle' };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Best-effort log ke console untuk debugging; jangan sampai logging itu sendiri melempar error baru
    console.error('LifeOS crashed:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleEmergencyBackup = async () => {
    this.setState({ backupStatus: 'loading' });
    try {
      // Import dinamis: hindari bundling utils backup ke initial load semua orang,
      // dan supaya tetap bisa jalan walau modul lain di aplikasi utama sudah rusak.
      const { downloadBackupFile } = await import('../utils/backupExport');
      await downloadBackupFile();
      this.setState({ backupStatus: 'success' });
    } catch {
      this.setState({ backupStatus: 'error' });
    }
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const { backupStatus } = this.state;

    return (
      <div className="min-h-screen bg-base-950 text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-surface border border-white/10 rounded-2xl p-8 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-danger/10 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-danger" />
          </div>

          <h1 className="text-xl font-bold mb-2">Terjadi Kesalahan</h1>
          <p className="text-sm text-base-400 mb-6">
            LifeOS mengalami error tak terduga. Data Anda aman di perangkat ini — tapi sebaiknya
            backup dulu sebelum memuat ulang, untuk jaga-jaga.
          </p>

          <div className="space-y-3">
            <button
              onClick={this.handleEmergencyBackup}
              disabled={backupStatus === 'loading' || backupStatus === 'success'}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-primary-500 to-accent text-sm font-semibold disabled:opacity-60"
            >
              <DownloadCloud className="w-4 h-4" />
              {backupStatus === 'loading'
                ? 'Membuat backup...'
                : backupStatus === 'success'
                  ? 'Backup Berhasil Diunduh ✓'
                  : backupStatus === 'error'
                    ? 'Gagal, coba lagi'
                    : 'Backup Data Darurat'}
            </button>

            <button
              onClick={this.handleReload}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-white/10 text-sm font-medium hover:border-primary-500/50"
            >
              <RefreshCw className="w-4 h-4" />
              Muat Ulang Aplikasi
            </button>
          </div>

          {this.state.error && (
            <details className="mt-6 text-left">
              <summary className="text-xs text-base-400 cursor-pointer hover:text-white">
                Detail teknis
              </summary>
              <pre className="mt-2 text-xs text-base-400 bg-black/30 rounded-lg p-3 overflow-auto max-h-40 whitespace-pre-wrap">
                {this.state.error.message}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }
}
