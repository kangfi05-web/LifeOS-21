// Achievements Page

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Lock, CheckCircle } from 'lucide-react';
import { useAchievementStore } from '../stores';
import { Achievement } from '../types';

const RARITY_COLORS: Record<string, string> = {
  common: 'from-gray-400 to-gray-500',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-amber-400 to-orange-500',
  mythic: 'from-pink-400 to-rose-600',
};

const RARITY_BG: Record<string, string> = {
  common: 'bg-gray-500/20',
  rare: 'bg-blue-500/20',
  epic: 'bg-purple-500/20',
  legendary: 'bg-amber-500/20',
  mythic: 'bg-pink-500/20',
};

export function AchievementsPage() {
  const { achievements, playerProfile, initialize } = useAchievementStore();

  useEffect(() => {
    initialize();
  }, []);

  const completedCount = achievements.filter(a => a.completed).length;
  const totalCount = achievements.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Achievement</h1>
        <p className="text-base-400 mt-1">Kumpulkan badge dan tingkatkan level Anda</p>
      </div>

      {/* Player Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-surface to-base-950 rounded-2xl border border-white/5 p-6"
      >
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-accent flex items-center justify-center">
              <span className="text-4xl font-bold">U</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xs font-bold">
              {playerProfile?.level || 1}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{playerProfile?.title || 'Dreamer'}</h2>
            <p className="text-base-400">Level {playerProfile?.level || 1}</p>

            {/* XP Progress */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-base-400">Experience</span>
                <span>{playerProfile?.xp || 0} / {playerProfile?.xpToNextLevel || 100} XP</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${((playerProfile?.xp || 0) / (playerProfile?.xpToNextLevel || 100)) * 100}%`
                  }}
                  className="h-full bg-gradient-to-r from-primary-500 to-accent rounded-full"
                />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-400">{playerProfile?.currentStreak || 0}</p>
              <p className="text-xs text-base-400">Streak</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-success">{completedCount}</p>
              <p className="text-xs text-base-400">Achievement</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Progress Overview */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-base-400">Progress Achievement</span>
            <span>{completedCount} / {totalCount}</span>
          </div>
          <div className="h-3 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(completedCount / totalCount) * 100}%` }}
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((achievement, index) => (
          <AchievementCard key={achievement.id} achievement={achievement} index={index} />
        ))}
      </div>
    </div>
  );
}

function AchievementCard({ achievement, index }: { achievement: Achievement; index: number }) {
  const progress = (achievement.progress / achievement.target) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index }}
      className={`relative bg-surface rounded-2xl border border-white/5 overflow-hidden ${
        achievement.completed ? 'ring-2 ring-amber-500/50' : ''
      }`}
    >
      {/* Rarity Indicator */}
      <div className={`h-1 bg-gradient-to-r ${RARITY_COLORS[achievement.rarity]}`} />

      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`w-14 h-14 rounded-xl ${RARITY_BG[achievement.rarity]} flex items-center justify-center ${
            achievement.completed ? '' : 'opacity-50'
          }`}>
            {achievement.completed ? (
              <div className={`w-8 h-8 bg-gradient-to-br ${RARITY_COLORS[achievement.rarity]} rounded-lg flex items-center justify-center`}>
                <Trophy className="w-5 h-5 text-white" />
              </div>
            ) : (
              <Lock className="w-6 h-6 text-base-400" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold">{achievement.title}</h4>
              <span className={`text-xs px-2 py-0.5 rounded-full ${RARITY_BG[achievement.rarity]} capitalize`}>
                {achievement.rarity}
              </span>
            </div>
            <p className="text-sm text-base-400 mt-1">{achievement.description}</p>

            {/* Progress */}
            {!achievement.completed && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-base-400">Progress</span>
                  <span>{achievement.progress} / {achievement.target}</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-primary-500 rounded-full"
                  />
                </div>
              </div>
            )}

            {/* Completed Badge */}
            {achievement.completed && (
              <div className="flex items-center gap-2 mt-2 text-success">
                <CheckCircle className="w-4 h-4" />
                <span className="text-xs">Unlocked!</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
