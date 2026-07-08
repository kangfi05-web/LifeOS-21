// Life Journey Page

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Compass,
  Target,
  Trophy,
  Flame,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { lifeJourneyRepository } from '../repositories';
import { LifeJourney } from '../types';
import { formatDate } from '../utils/calculations';

const JOURNEY_ICONS: Record<string, React.ElementType> = {
  goal_created: Target,
  goal_completed: Trophy,
  saving_added: Flame,
  achievement: Sparkles,
  new_streak: Flame,
  note: Calendar,
};

const JOURNEY_COLORS: Record<string, string> = {
  goal_created: 'from-blue-500 to-cyan-500',
  goal_completed: 'from-green-500 to-emerald-500',
  saving_added: 'from-purple-500 to-violet-500',
  achievement: 'from-amber-500 to-orange-500',
  new_streak: 'from-red-500 to-rose-500',
  note: 'from-gray-400 to-gray-500',
};

export function LifeJourneyPage() {
  const [journey, setJourney] = useState<LifeJourney[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJourney();
  }, []);

  const loadJourney = async () => {
    try {
      const items = await lifeJourneyRepository.getAll();
      setJourney(items);
    } catch (error) {
      console.error('Failed to load journey:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group by month
  const groupedJourney = journey.reduce((acc, item) => {
    const date = new Date(item.date);
    const monthName = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

    if (!acc[monthName]) {
      acc[monthName] = [];
    }
    acc[monthName].push(item);
    return acc;
  }, {} as Record<string, LifeJourney[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Life Journey</h1>
        <p className="text-base-400 mt-1">Dokumentasi perjalanan hidup Anda</p>
      </div>

      {/* Journey Timeline */}
      {journey.length === 0 && !loading ? (
        <EmptyJourneyState />
      ) : (
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-white/5" />

          {/* Journey Items */}
          {Object.entries(groupedJourney).map(([month, items]) => (
            <div key={month} className="mb-8">
              {/* Month Header */}
              <div className="relative flex items-center gap-4 mb-4 pl-20">
                <div className="absolute left-6 w-4 h-4 rounded-full bg-gradient-to-br from-primary-500 to-accent" />
                <h2 className="text-lg font-semibold text-primary-400">{month}</h2>
              </div>

              {/* Items */}
              <div className="space-y-4 pl-20">
                {items.map((item, index) => (
                  <JourneyCard key={item.id} item={item} index={index} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function JourneyCard({ item, index }: { item: LifeJourney; index: number }) {
  const Icon = JOURNEY_ICONS[item.category] || Compass;
  const color = JOURNEY_COLORS[item.category] || 'from-gray-400 to-gray-500';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.05 * index }}
      className="relative"
    >
      {/* Timeline Dot */}
      <div className="absolute -left-[52px] w-3 h-3 rounded-full bg-white/20" />

      {/* Card */}
      <div className="bg-surface rounded-2xl border border-white/5 p-4 hover:border-white/10 transition-all">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold">{item.title}</h3>
              <span className="text-xs text-base-400">{formatDate(item.date, 'd MMM yyyy')}</span>
            </div>
            {item.description && (
              <p className="text-sm text-base-400">{item.description}</p>
            )}
          </div>
        </div>

        {/* Image if exists */}
        {item.image && (
          <div className="mt-3 rounded-xl overflow-hidden">
            <img src={item.image} alt="" className="w-full h-40 object-cover" />
          </div>
        )}
      </div>
    </motion.div>
  );
}

function EmptyJourneyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary-500/20 to-accent/20 flex items-center justify-center">
        <Compass className="w-12 h-12 text-primary-400" />
      </div>
      <h3 className="text-xl font-semibold mb-2">Perjalanan Anda Dimulai</h3>
      <p className="text-base-400 max-w-md mx-auto">
        Setiap langkah yang Anda ambil akan tercatat di sini. Mulai buat target dan tambah dana untuk memulai perjalanan Anda.
      </p>
    </motion.div>
  );
}
