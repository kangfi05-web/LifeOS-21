// Komponen notifikasi saat ada versi baru aplikasi tersedia (dari service worker PWA)

import { useRegisterSW } from 'virtual:pwa-register/react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X } from 'lucide-react';

export function PWAUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      // Cek update setiap 60 menit selama aplikasi dibuka
      if (registration) {
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      }
    },
  });

  const handleUpdate = () => {
    updateServiceWorker(true);
  };

  const handleDismiss = () => {
    setNeedRefresh(false);
  };

  return (
    <AnimatePresence>
      {needRefresh && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:w-96 z-[100]"
        >
          <div className="bg-surface border border-primary-500/30 rounded-2xl shadow-2xl p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent flex items-center justify-center flex-shrink-0">
              <RefreshCw className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">Update Tersedia</p>
              <p className="text-sm text-base-400 mt-0.5">
                Versi baru LifeOS sudah siap. Perbarui untuk mendapatkan fitur & perbaikan terbaru.
              </p>
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={handleUpdate}
                  className="px-4 py-2 bg-gradient-to-r from-primary-500 to-accent rounded-lg text-sm font-medium text-white"
                >
                  Perbarui Sekarang
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-4 py-2 text-sm font-medium text-base-400 hover:text-white transition-colors"
                >
                  Nanti
                </button>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-base-400 hover:text-white transition-colors flex-shrink-0"
              aria-label="Tutup notifikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
