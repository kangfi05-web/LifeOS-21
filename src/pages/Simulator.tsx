// Future Simulator Page

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Calendar,
  Target,
  Sparkles,
} from 'lucide-react';
import { useGoalStore } from '../stores';
import { Goal } from '../types';
import { formatCurrency, formatDate, getDaysRemaining } from '../utils/calculations';

const DAILY_AMOUNTS = [50000, 100000, 150000, 200000, 300000, 500000, 750000, 1000000];

interface SimulationResult {
  goal: Goal;
  currentProgress: number;
  estimatedFinish: Date;
  daysEarlyOrLate: number;
  additionalNeeded: number;
}

export function SimulatorPage() {
  const { activeGoals } = useGoalStore();
  const [dailySaving, setDailySaving] = useState(100000);
  const [results, setResults] = useState<SimulationResult[]>([]);

  useEffect(() => {
    runSimulation();
  }, [dailySaving, activeGoals]);

  const runSimulation = () => {
    if (activeGoals.length === 0) return;

    // Simulate based on current priorities
    const simulationResults: SimulationResult[] = activeGoals.map((goal) => {
      const remaining = goal.remainingAmount;
      const currentDaily = goal.dailyTarget;

      // Calculate new finish date with increased daily saving
      const proportion = goal.dailyTarget / activeGoals.reduce((sum, g) => sum + g.dailyTarget, 0);
      const goalDaily = dailySaving * proportion;
      const newDaysNeeded = Math.ceil(remaining / goalDaily);

      const estimatedFinish = new Date();
      estimatedFinish.setDate(estimatedFinish.getDate() + newDaysNeeded);

      const daysEarlyOrLate = new Date(estimatedFinish) > new Date(goal.deadline)
        ? getDaysRemaining(goal.deadline) - newDaysNeeded
        : newDaysNeeded - getDaysRemaining(goal.deadline);

      return {
        goal,
        currentProgress: goal.progress,
        estimatedFinish,
        daysEarlyOrLate: Math.abs(daysEarlyOrLate),
        additionalNeeded: Math.max(0, goalDaily - currentDaily),
      };
    });

    setResults(simulationResults);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Future Simulator</h1>
        <p className="text-base-400 mt-1">Simulasi dampak keputusan finansial Anda</p>
      </div>

      {/* Simulator Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-surface to-base-950 rounded-2xl border border-white/5 p-6"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Simulasi Tabungan Harian</h2>
            <p className="text-sm text-base-400">Geser untuk melihat estimasi target selesai</p>
          </div>
        </div>

        {/* Daily Saving Slider */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-base-400">Tabungan Harian</span>
            <span className="text-2xl font-bold text-success">{formatCurrency(dailySaving)}</span>
          </div>

          <div className="relative">
            <input
              type="range"
              min={DAILY_AMOUNTS[0]}
              max={DAILY_AMOUNTS[DAILY_AMOUNTS.length - 1]}
              step={10000}
              value={dailySaving}
              onChange={(e) => setDailySaving(parseInt(e.target.value))}
              className="w-full h-2 bg-white/5 rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-6
                [&::-webkit-slider-thumb]:h-6
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-gradient-to-br
                [&::-webkit-slider-thumb]:from-primary-500
                [&::-webkit-slider-thumb]:to-accent
                [&::-webkit-slider-thumb]:cursor-pointer"
            />
          </div>

          {/* Quick Amount Buttons */}
          <div className="flex flex-wrap gap-2">
            {DAILY_AMOUNTS.map((amount) => (
              <button
                key={amount}
                onClick={() => setDailySaving(amount)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  dailySaving === amount
                    ? 'bg-primary-500 text-white'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                {formatCurrency(amount, true)}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Results */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary-400" />
          Hasil Simulasi
        </h3>

        {results.length === 0 ? (
          <div className="text-center py-12 bg-surface rounded-2xl border border-white/5">
            <Target className="w-12 h-12 mx-auto text-base-400 mb-4" />
            <p className="text-base-400">Buat target untuk melihat simulasi</p>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((result, index) => (
              <SimulationCard key={result.goal.id} result={result} index={index} />
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {results.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface rounded-2xl border border-white/5 p-6"
        >
          <h3 className="font-semibold mb-4">Ringkasan Skenario</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-sm text-base-400">Total Harian</p>
              <p className="text-2xl font-bold">{formatCurrency(dailySaving)}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-sm text-base-400">Total Bulanan</p>
              <p className="text-2xl font-bold">{formatCurrency(dailySaving * 30)}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-sm text-base-400">Target Tercepat Selesai</p>
              <p className="text-2xl font-bold text-success">
                {results.length > 0 ? formatDate(results[0].estimatedFinish, 'd MMM yyyy') : '-'}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function SimulationCard({ result, index }: { result: SimulationResult; index: number }) {
  const { goal, currentProgress, estimatedFinish, daysEarlyOrLate } = result;
  const isEarly = estimatedFinish < new Date(goal.deadline);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.05 * index }}
      className="bg-surface rounded-2xl border border-white/5 p-4 hover:border-white/10 transition-all"
    >
      <div className="flex items-center gap-4">
        {/* Progress Circle */}
        <div className="relative w-16 h-16">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(${goal.color || '#3B82F6'} ${currentProgress * 3.6}deg, rgba(255,255,255,0.1) 0deg)`,
            }}
          />
          <div className="absolute inset-2 bg-surface rounded-full flex items-center justify-center">
            <span className="text-sm font-bold">{Math.round(currentProgress)}%</span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1">
          <h4 className="font-semibold">{goal.title}</h4>
          <div className="flex items-center gap-4 mt-1 text-sm text-base-400">
            <span>{formatCurrency(goal.targetAmount - goal.remainingAmount)} / {formatCurrency(goal.targetAmount)}</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Deadline: {formatDate(goal.deadline, 'd MMM yyyy')}
            </span>
          </div>
        </div>

        {/* Estimated Result */}
        <div className="text-right">
          <p className="text-sm text-base-400">Estimasi Selesai</p>
          <p className="text-lg font-bold">{formatDate(estimatedFinish, 'd MMM yyyy')}</p>
          <p className={`text-xs ${isEarly ? 'text-success' : 'text-warning'}`}>
            {isEarly ? `${daysEarlyOrLate} hari lebih cepat` : `${daysEarlyOrLate} hari terlambat`}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
