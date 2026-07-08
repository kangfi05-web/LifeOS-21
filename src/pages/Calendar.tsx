// Calendar Page

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Target,
} from 'lucide-react';
import { useGoalStore } from '../stores';
import { formatCurrency, formatDate } from '../utils/calculations';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';

export function CalendarPage() {
  const { activeGoals, fetchActiveGoals } = useGoalStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    fetchActiveGoals();
  }, [fetchActiveGoals]);

  // Generate calendar days
  const getDaysInMonth = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days: Date[] = [];
    let day = startDate;

    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
  };

  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getDailyTargetForDate = (date: Date): number => {
    return activeGoals.reduce((sum, goal) => sum + goal.dailyTarget, 0);
  };

  const weekDays = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarIcon className="w-7 h-7 text-primary-400" />
            Kalender
          </h1>
          <p className="text-base-400 mt-1">Pantau target dan progress harian Anda</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-primary-500/20 text-primary-400 rounded-xl text-sm font-medium hover:bg-primary-500/30 transition-colors"
          >
            Hari Ini
          </button>
        </div>
      </div>

      {/* Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface rounded-2xl border border-white/5 p-4 md:p-6"
      >
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={goToPreviousMonth}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-semibold">
            {formatDate(currentMonth, 'MMMM yyyy')}
          </h2>
          <button
            onClick={goToNextMonth}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Week Days Header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-sm font-medium text-base-400 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {getDaysInMonth().map((day, index) => {
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isTodayDate = isToday(day);
            const dailyTarget = getDailyTargetForDate(day);

            return (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDate(day)}
                className={`
                  relative aspect-square p-1 rounded-xl text-sm transition-all
                  ${!isCurrentMonth ? 'opacity-30' : ''}
                  ${isSelected ? 'bg-primary-500 text-white ring-2 ring-primary-500' : 'hover:bg-white/5'}
                  ${isTodayDate && !isSelected ? 'ring-2 ring-amber-500' : ''}
                `}
              >
                <span className="font-medium">{formatDate(day, 'd')}</span>
                {dailyTarget > 0 && isCurrentMonth && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-success" />
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Selected Date Details */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface rounded-2xl border border-white/5 p-6"
        >
          <h3 className="text-lg font-semibold mb-4">
            {formatDate(selectedDate, 'EEEE, d MMMM yyyy')}
          </h3>

          <div className="space-y-4">
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base-400 text-sm">Target Harian Total</p>
                  <p className="text-2xl font-bold text-success">{formatCurrency(getDailyTargetForDate(selectedDate))}</p>
                </div>
                <Target className="w-10 h-10 text-base-400" />
              </div>
            </div>

            {/* Daily Targets Breakdown */}
            {activeGoals.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-base-400">Rincian Target:</p>
                {activeGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className="flex items-center justify-between bg-white/5 rounded-xl p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: goal.color ? `${goal.color}20` : '#3B82F620' }}
                      >
                        <Target className="w-4 h-4" style={{ color: goal.color || '#3B82F6' }} />
                      </div>
                      <span className="font-medium">{goal.title}</span>
                    </div>
                    <span className="font-semibold">{formatCurrency(goal.dailyTarget)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-base-400">
                <p>Tidak ada target aktif</p>
                <p className="text-sm mt-1">Buat target untuk melihat jadwal tabungan</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
