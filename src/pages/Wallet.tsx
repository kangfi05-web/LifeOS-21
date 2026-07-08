// Wallet Page

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet as WalletIcon,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  Trash2,
} from 'lucide-react';
import { useWalletStore, useAppStore } from '../stores';
import { useToast } from '../components/ui/Toast';
import { formatCurrency } from '../utils/calculations';
import { Wallet, WalletType } from '../types';

export function WalletPage() {
  const { wallets, fetchWallets, loading, createWallet, deleteWallet } = useWalletStore();
  const { setCurrentPage } = useAppStore();
  const toast = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);

  useEffect(() => {
    fetchWallets();
  }, []);

  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);

  const handleDeleteWallet = async (walletId: string, walletName: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus "${walletName}"?`)) {
      await deleteWallet(walletId);
      toast.success('Wallet Dihapus', `${walletName} telah dihapus`);
      setSelectedWallet(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Wallet</h1>
          <p className="text-base-400 mt-1">Kelola semua sumber dana Anda</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-primary-500 to-accent rounded-xl font-semibold flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Tambah Wallet
        </motion.button>
      </div>

      {/* Total Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-surface to-base-950 rounded-2xl border border-white/5 p-6"
      >
        <p className="text-sm text-base-400 mb-1">Saldo Total</p>
        <p className="text-3xl md:text-4xl font-bold">{formatCurrency(totalBalance)}</p>
        <div className="flex flex-wrap items-center gap-4 md:gap-6 mt-4">
          <div className="flex items-center gap-2 text-success">
            <ArrowDownLeft className="w-4 h-4" />
            <span className="text-sm">Income: {formatCurrency(0)}</span>
          </div>
          <div className="flex items-center gap-2 text-error">
            <ArrowUpRight className="w-4 h-4" />
            <span className="text-sm">Expense: {formatCurrency(0)}</span>
          </div>
        </div>
      </motion.div>

      {/* Wallet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {wallets.map((wallet, index) => (
          <WalletCard
            key={wallet.id}
            wallet={wallet}
            index={index}
            onViewDetails={() => setSelectedWallet(wallet)}
            onDelete={() => handleDeleteWallet(wallet.id, wallet.name)}
          />
        ))}
      </div>

      {/* Empty State */}
      {wallets.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-500/20 to-accent/20 flex items-center justify-center">
            <WalletIcon className="w-12 h-12 text-primary-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Belum Ada Wallet</h3>
          <p className="text-base-400 max-w-md mx-auto mb-6">
            Tambahkan wallet pertama untuk mulai mencatat transaksi Anda
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-primary-500 to-accent rounded-xl font-semibold"
          >
            Tambah Wallet Pertama
          </motion.button>
        </motion.div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setCurrentPage('goals')}
          className="bg-surface rounded-xl border border-white/5 p-4 text-left hover:border-white/10 transition-all"
        >
          <p className="text-base-400 text-sm">Kelola Dana</p>
          <p className="font-semibold mt-1">Target & Tabungan</p>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setCurrentPage('analytics')}
          className="bg-surface rounded-xl border border-white/5 p-4 text-left hover:border-white/10 transition-all"
        >
          <p className="text-base-400 text-sm">Analisis</p>
          <p className="font-semibold mt-1">Lihat Statistik</p>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setCurrentPage('dashboard')}
          className="bg-surface rounded-xl border border-white/5 p-4 text-left hover:border-white/10 transition-all"
        >
          <p className="text-base-400 text-sm">Kembali</p>
          <p className="font-semibold mt-1">Ke Dashboard</p>
        </motion.button>
      </div>

      {/* Add Wallet Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddWalletModal
            onClose={() => setShowAddModal(false)}
            onCreate={async (data) => {
              const wallet = await createWallet(data);
              toast.success('Wallet Ditambahkan', `${data.name} berhasil dibuat`);
              return wallet;
            }}
          />
        )}
      </AnimatePresence>

      {/* Wallet Details Modal */}
      <AnimatePresence>
        {selectedWallet && (
          <WalletDetailModal
            wallet={selectedWallet}
            onClose={() => setSelectedWallet(null)}
            onDelete={() => handleDeleteWallet(selectedWallet.id, selectedWallet.name)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function WalletCard({
  wallet,
  index,
  onViewDetails,
  onDelete,
}: {
  wallet: Wallet;
  index: number;
  onViewDetails: () => void;
  onDelete: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index }}
      className="bg-surface rounded-2xl border border-white/5 overflow-hidden hover:border-white/10 transition-all"
    >
      <div
        className="h-2"
        style={{ backgroundColor: wallet.color }}
      />
      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: wallet.color + '20' }}
          >
            <WalletIcon className="w-6 h-6" style={{ color: wallet.color }} />
          </div>
          <div>
            <h3 className="font-semibold">{wallet.name}</h3>
            <p className="text-xs text-base-400 capitalize">{wallet.type}</p>
          </div>
        </div>

        <div className="text-2xl font-bold mb-4">
          {formatCurrency(wallet.balance)}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onViewDetails}
            className="flex-1 py-2 bg-primary-500/20 text-primary-400 rounded-xl text-sm font-medium hover:bg-primary-500/30 transition-colors"
          >
            Lihat Detail
          </button>
          <button
            onClick={onDelete}
            className="p-2 bg-danger-500/20 text-danger-400 rounded-xl hover:bg-danger-500/30 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function AddWalletModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (data: { name: string; icon: string; color: string; type: WalletType; initialBalance?: number }) => Promise<Wallet>;
}) {
  const [name, setName] = useState('');
  const [type, setType] = useState<WalletType>('cash');
  const [color, setColor] = useState('#3B82F6');
  const [initialBalance, setInitialBalance] = useState('0');
  const [loading, setloading] = useState(false);

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];

  const handleCreate = async () => {
    if (!name.trim()) return;

    setloading(true);
    try {
      await onCreate({
        name,
        type,
        color,
        icon: 'wallet',
        initialBalance: parseInt(initialBalance.replace(/\D/g, '')) || 0,
      });
      onClose();
    } catch (error) {
      console.error('Failed to create wallet:', error);
    } finally {
      setloading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-surface rounded-2xl border border-white/5 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Tambah Wallet Baru</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-base-400 mb-2">Nama Wallet</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: BCA, OVO, Cash..."
              className="w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl focus:outline-none focus:border-primary-500/50"
            />
          </div>

          <div>
            <label className="block text-sm text-base-400 mb-2">Tipe</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as WalletType)}
              className="w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl focus:outline-none focus:border-primary-500/50"
            >
              <option value="cash">Cash</option>
              <option value="bank">Bank</option>
              <option value="e_wallet">E-Wallet</option>
              <option value="investment">Investasi</option>
              <option value="other">Lainnya</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-base-400 mb-2">Warna</label>
            <div className="flex gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-10 h-10 rounded-xl transition-transform ${
                    color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-surface scale-110' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-base-400 mb-2">Saldo Awal (opsional)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base-400">Rp</span>
              <input
                type="text"
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                placeholder="0"
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/5 rounded-xl focus:outline-none focus:border-primary-500/50"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-white/5 rounded-xl font-medium hover:bg-white/10 transition-colors"
          >
            Batal
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreate}
            disabled={!name.trim() || loading}
            className="flex-1 py-3 bg-gradient-to-r from-primary-500 to-accent rounded-xl font-semibold disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : 'Simpan'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function WalletDetailModal({
  wallet,
  onClose,
  onDelete,
}: {
  wallet: Wallet;
  onClose: () => void;
  onDelete: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-surface rounded-2xl border border-white/5 overflow-hidden"
      >
        <div className="h-2" style={{ backgroundColor: wallet.color }} />
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: wallet.color + '20' }}
              >
                <WalletIcon className="w-6 h-6" style={{ color: wallet.color }} />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{wallet.name}</h2>
                <p className="text-sm text-base-400 capitalize">{wallet.type}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="text-center py-6">
            <p className="text-base-400 text-sm mb-1">Saldo</p>
            <p className="text-4xl font-bold">{formatCurrency(wallet.balance)}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 text-success">
                <ArrowDownLeft className="w-4 h-4" />
                <span className="text-sm">Income</span>
              </div>
              <p className="text-lg font-bold mt-1">{formatCurrency(0)}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 text-error">
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-sm">Expense</span>
              </div>
              <p className="text-lg font-bold mt-1">{formatCurrency(0)}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onDelete}
              className="flex-1 py-3 bg-danger-500/20 text-danger-400 rounded-xl font-medium hover:bg-danger-500/30 transition-colors"
            >
              Hapus Wallet
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-primary-500/20 text-primary-400 rounded-xl font-medium hover:bg-primary-500/30 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
