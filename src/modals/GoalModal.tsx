// Goal Modal - Create/Edit Goal

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Target } from 'lucide-react';
import { Goal, GoalCategory, GoalPriority } from '../types';
import { useGoalStore } from '../stores';
import { formatCurrency, parseCurrencyInput, getTotalDays, roundDailyTarget } from '../utils/calculations';
import { GOAL_CATEGORIES } from '../constants';

interface GoalModalProps {
  goal?: Goal | null;
  onClose: () => void;
}

export function GoalModal({ goal, onClose }: GoalModalProps) {
  const { createGoal, updateGoal } = useGoalStore();
  const isEditing = !!goal;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState(goal?.title || '');
  const [category, setCategory] = useState<GoalCategory>(goal?.category || 'savings');
  const [description, setDescription] = useState(goal?.description || '');
  const [targetAmount, setTargetAmount] = useState(goal?.targetAmount?.toString() || '');
  const [startDate, setStartDate] = useState(() => {
    if (goal?.startDate) return new Date(goal.startDate).toISOString().split('T')[0];
    return new Date().toISOString().split('T')[0];
  });
  const [deadline, setDeadline] = useState(() => {
    if (goal?.deadline) return new Date(goal.deadline).toISOString().split('T')[0];
    return '';
  });
  const [priority, setPriority] = useState<GoalPriority>(goal?.priority || 'medium');
  const [color, setColor] = useState(goal?.color || GOAL_CATEGORIES[category]?.color || '#3B82F6');
  const [note, setNote] = useState(goal?.notes || '');

  // Calculations
  const amount = parseCurrencyInput(targetAmount);
  const totalDays = startDate && deadline ? getTotalDays(startDate, deadline) : 0;
  const dailyTargetRaw = totalDays > 0 && amount > 0 ? amount / totalDays : 0;
  const dailyTarget = roundDailyTarget(dailyTargetRaw);

  useEffect(() => {
    setColor(GOAL_CATEGORIES[category]?.color || '#3B82F6');
  }, [category]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const baseData = {
        title,
        description,
        category,
        priority,
        targetAmount: amount,
        startDate: new Date(startDate),
        deadline: new Date(deadline),
        color,
        notes: note,
      };

      if (isEditing && goal) {
        // Recalculate daily/weekly/monthly targets when editing
        // Use old targetAmount to determine how much has already been collected
        const alreadyCollected = Math.max(0, goal.targetAmount - goal.remainingAmount);
        const updatedRemainingAmount = Math.max(0, amount - alreadyCollected);

        await updateGoal(goal.id, {
          ...baseData,
          dailyTarget,
          weeklyTarget: roundDailyTarget(dailyTargetRaw * 7),
          monthlyTarget: roundDailyTarget(dailyTargetRaw * 30),
          remainingAmount: updatedRemainingAmount,
        });
      } else {
        await createGoal(baseData);
      }

      onClose();
    } catch (error) {
      console.error('Failed to save goal:', error);
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return title.length > 0;
    if (step === 2) return amount > 0 && deadline.length > 0;
    return true;
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
        className="w-full max-w-lg bg-surface rounded-2xl border border-white/5 shadow-elevated overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{isEditing ? 'Edit Target' : 'Target Baru'}</h2>
              <p className="text-sm text-base-400">Langkah {step} dari 3</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center px-6 py-3 gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1 rounded-full transition-all ${
                s <= step ? 'bg-primary-500' : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Title */}
              <div>
                <label className="block text-sm text-base-400 mb-2">Nama Target</label>
                <input
                  type="text"
                  placeholder="Contoh: Rumah Impian, Motor Baru..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-lg focus:outline-none focus:border-primary-500/50"
                  autoFocus
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm text-base-400 mb-2">Kategori</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(GOAL_CATEGORIES).map(([key, cat]) => (
                    <button
                      key={key}
                      onClick={() => setCategory(key as GoalCategory)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                        category === key
                          ? 'border-primary-500/50 bg-primary-500/10'
                          : 'border-white/5 hover:border-white/10'
                      }`}
                    >
                      <span className="text-2xl">{cat.icon}</span>
                      <span className="text-xs">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm text-base-400 mb-2">Deskripsi (opsional)</label>
                <textarea
                  placeholder="Tambahkan deskripsi untuk target Anda..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl resize-none focus:outline-none focus:border-primary-500/50"
                />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Target Amount */}
              <div>
                <label className="block text-sm text-base-400 mb-2">Nominal Target</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base-400">Rp</span>
                  <input
                    type="text"
                    placeholder="0"
                    value={targetAmount ? `${parseInt(targetAmount).toLocaleString('id-ID')}` : ''}
                    onChange={(e) => setTargetAmount(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/5 rounded-xl text-2xl font-bold focus:outline-none focus:border-primary-500/50"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-base-400 mb-2">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl focus:outline-none focus:border-primary-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-base-400 mb-2">Deadline</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl focus:outline-none focus:border-primary-500/50"
                  />
                </div>
              </div>

              {/* Calculation Preview */}
              {amount > 0 && deadline && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 rounded-xl p-4 space-y-3"
                >
                  <div className="flex justify-between">
                    <span className="text-base-400">Total Hari</span>
                    <span className="font-semibold">{totalDays} hari</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-400">Target Harian</span>
                    <div className="text-right">
                      <span className="font-semibold text-success">{formatCurrency(dailyTarget)}</span>
                      {dailyTarget !== dailyTargetRaw && (
                        <p className="text-xs text-base-400 mt-0.5">dari {formatCurrency(dailyTargetRaw)}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-400">Target Mingguan</span>
                    <span className="font-semibold">{formatCurrency(roundDailyTarget(dailyTargetRaw * 7))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-400">Target Bulanan</span>
                    <span className="font-semibold">{formatCurrency(roundDailyTarget(dailyTargetRaw * 30))}</span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Priority */}
              <div>
                <label className="block text-sm text-base-400 mb-2">Prioritas</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['critical', 'high', 'medium', 'low'] as GoalPriority[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPriority(p)}
                      className={`py-2 px-3 rounded-xl border capitalize transition-all ${
                        priority === p
                          ? p === 'critical'
                            ? 'border-error bg-error/20 text-error'
                            : p === 'high'
                              ? 'border-warning bg-warning/20 text-warning'
                              : 'border-primary-500/50 bg-primary-500/10 text-primary-400'
                          : 'border-white/5 hover:border-white/10'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm text-base-400 mb-2">Warna</label>
                <div className="flex gap-2">
                  {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#22C55E'].map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-10 h-10 rounded-xl transition-transform ${
                        color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-surface' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div
                className="rounded-xl p-4 border border-white/5"
                style={{ backgroundColor: color + '10' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: color + '30' }}
                  >
                    <Target className="w-6 h-6" style={{ color }} />
                  </div>
                  <div>
                    <h4 className="font-semibold">{title}</h4>
                    <p className="text-sm text-base-400">{formatCurrency(amount)}</p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm text-base-400 mb-2">Catatan (opsional)</label>
                <textarea
                  placeholder="Tambahkan catatan atau motivasi untuk target ini..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl resize-none focus:outline-none focus:border-primary-500/50"
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 flex gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 py-3 bg-white/5 rounded-xl font-medium hover:bg-white/10 transition-colors"
            >
              Kembali
            </button>
          )}

          {step < 3 ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="flex-1 py-3 bg-gradient-to-r from-primary-500 to-accent rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Lanjut
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={!canProceed() || loading}
              className="flex-1 py-3 bg-gradient-to-r from-success to-emerald-400 rounded-xl font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Buat Target'}
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
