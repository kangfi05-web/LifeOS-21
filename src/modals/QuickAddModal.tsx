// Quick Add Modal - Add Saving Transaction

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, Check, Sparkles } from 'lucide-react';
import { Goal } from '../types';
import { useGoalStore, useWalletStore } from '../stores';
import { goalService } from '../services';
import { formatCurrency, parseCurrencyInput } from '../utils/calculations';
import { QUICK_ADD_AMOUNTS } from '../constants';
import { useDashboardStore } from '../stores';

interface QuickAddModalProps {
  goal?: Goal;
  initialAmount?: number;
  onClose: () => void;
}

export function QuickAddModal({ goal, initialAmount, onClose }: QuickAddModalProps) {
  const { activeGoals } = useGoalStore();
  const { wallets } = useWalletStore();
  const { refreshAll } = useDashboardStore();

  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(goal || null);
  const [amount, setAmount] = useState<number>(initialAmount ?? 0);
  const [selectedWallet, setSelectedWallet] = useState<string>('');
  const [note, setNote] = useState('');
  const [customAmount, setCustomAmount] = useState<string>(
    initialAmount ? initialAmount.toString() : ''
  );
  const [isCustom, setIsCustom] = useState(!!initialAmount);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleQuickAmount = (value: number) => {
    setIsCustom(false);
    setAmount(value);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setCustomAmount(raw);
    const parsed = parseCurrencyInput(raw);
    setAmount(parsed);
    setIsCustom(true);
  };

  const handleAddSaving = async () => {
    if (!selectedGoal || amount <= 0 || !selectedWallet) return;

    setLoading(true);
    try {
      await goalService.addSaving(
        selectedGoal.id,
        amount,
        selectedWallet,
        'quick_add',
        note || undefined
      );

      setSuccess(true);
      await refreshAll();

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Failed to add saving:', error);
    } finally {
      setLoading(false);
    }
  };

  const successVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { scale: 1, opacity: 1 },
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full md:w-auto md:min-w-[500px] bg-surface rounded-t-3xl md:rounded-2xl border border-white/5 shadow-elevated"
        >
          {/* Success Animation */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute inset-0 bg-surface/95 rounded-t-3xl md:rounded-2xl flex items-center justify-center z-10"
              >
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={successVariants}
                  className="text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-success to-emerald-400 flex items-center justify-center"
                  >
                    <Check className="w-10 h-10 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-bold mb-2">Berhasil!</h3>
                  <p className="text-base-400">Dana berhasil ditambahkan</p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-success to-emerald-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Tambah Dana</h2>
                <p className="text-sm text-base-400">Quick Add</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Goal Selection - Only if no goal passed */}
            {!goal && activeGoals.length > 0 && (
              <div>
                <label className="block text-sm text-base-400 mb-2">Pilih Target</label>
                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-2">
                  {activeGoals.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setSelectedGoal(g)}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        selectedGoal?.id === g.id
                          ? 'border-primary-500/50 bg-primary-500/10'
                          : 'border-white/5 hover:border-white/10'
                      }`}
                    >
                      <div className="flex-1 text-left">
                        <p className="font-medium">{g.title}</p>
                        <p className="text-sm text-base-400">
                          {formatCurrency(g.targetAmount - g.remainingAmount)} / {formatCurrency(g.targetAmount)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-base-400">Harian</p>
                        <p className="font-medium text-primary-400">{formatCurrency(g.dailyTarget)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Goal Info */}
            {selectedGoal && (
              <div className="bg-white/5 rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{selectedGoal.title}</p>
                    <p className="text-sm text-base-400">Target harian: {formatCurrency(selectedGoal.dailyTarget)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-success">{Math.round(selectedGoal.progress)}%</p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Amounts */}
            <div>
              <label className="block text-sm text-base-400 mb-2">Nominal</label>
              <div className="flex flex-wrap gap-2">
                {QUICK_ADD_AMOUNTS.map((value) => (
                  <button
                    key={value}
                    onClick={() => handleQuickAmount(value)}
                    className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                      !isCustom && amount === value
                        ? 'bg-primary-500 text-white'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    {value >= 1000000 ? `${value / 1000000}JT` : value >= 1000 ? `${value / 1000}K` : value}
                  </button>
                ))}
                <button
                  onClick={() => setIsCustom(true)}
                  className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                    isCustom ? 'bg-primary-500 text-white' : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  Custom
                </button>
              </div>

              {/* Custom Input */}
              {isCustom && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3"
                >
                  <input
                    type="text"
                    placeholder="Rp0"
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                    className="w-full px-4 py-3 bg-surface border border-white/5 rounded-xl text-lg font-semibold focus:outline-none focus:border-primary-500/50"
                  />
                </motion.div>
              )}
            </div>

            {/* Selected Amount Display */}
            {amount > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-4"
              >
                <p className="text-base-400 text-sm">Jumlah yang ditambahkan</p>
                <p className="text-3xl font-bold text-success mt-1">
                  {formatCurrency(amount)}
                </p>
              </motion.div>
            )}

            {/* Wallet Selection */}
            <div>
              <label className="block text-sm text-base-400 mb-2">Wallet</label>
              <div className="grid grid-cols-2 gap-2">
                {wallets.slice(0, 6).map((w) => (
                  <button
                    key={w.id}
                    onClick={() => setSelectedWallet(w.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      selectedWallet === w.id
                        ? 'border-primary-500/50 bg-primary-500/10'
                        : 'border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: w.color + '20' }}
                    >
                      <Wallet className="w-4 h-4" style={{ color: w.color }} />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-sm">{w.name}</p>
                      <p className="text-xs text-base-400">{formatCurrency(w.balance)}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm text-base-400 mb-2">Catatan (opsional)</label>
              <input
                type="text"
                placeholder="Contoh: Gaji bulanan, THR, Bonus..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-4 py-3 bg-surface border border-white/5 rounded-xl focus:outline-none focus:border-primary-500/50"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/5">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddSaving}
              disabled={!selectedGoal || amount <= 0 || !selectedWallet || loading}
              className="w-full py-4 bg-gradient-to-r from-success to-emerald-400 rounded-xl font-semibold text-white
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Menyimpan...' : 'Tambah Dana'}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
