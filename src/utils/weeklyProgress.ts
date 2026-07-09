// Weekly Progress data — dipakai oleh grafik "Progress Mingguan" di Dashboard.
// Mengambil data asli dari tabel dailyProgress (dicatat tiap kali ada transaksi nabung),
// bukan angka sample.

import { startOfWeek, addDays, isAfter, startOfDay } from 'date-fns';
import { dailyProgressRepository } from '../repositories';

export interface WeeklyProgressDay {
  label: string; // Sen, Sel, Rab, ...
  percent: number; // 0-100, seberapa persen dailyTarget hari itu tercapai
  isFuture: boolean; // hari yang belum terjadi (di masa depan minggu ini)
  isToday: boolean;
}

const DAY_LABELS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

export async function getWeeklyProgressData(): Promise<WeeklyProgressDay[]> {
  const today = startOfDay(new Date());
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Senin

  const results: WeeklyProgressDay[] = [];

  for (let i = 0; i < 7; i++) {
    const day = addDays(weekStart, i);
    const isFuture = isAfter(day, today);
    const isToday = day.getTime() === today.getTime();

    if (isFuture) {
      results.push({ label: DAY_LABELS[i], percent: 0, isFuture: true, isToday: false });
      continue;
    }

    const records = await dailyProgressRepository.getByDate(day);
    const totalTarget = records.reduce((sum, r) => sum + r.dailyTarget, 0);
    const totalCollected = records.reduce((sum, r) => sum + r.dailyCollected, 0);

    let percent: number;
    if (totalTarget > 0) {
      percent = Math.min(100, Math.round((totalCollected / totalTarget) * 100));
    } else {
      // Belum ada target tercatat hari itu (mis. goal baru dibuat setelahnya) —
      // kalau ada dana masuk anggap tercapai, kalau tidak ada aktivitas sama sekali.
      percent = totalCollected > 0 ? 100 : 0;
    }

    results.push({ label: DAY_LABELS[i], percent, isFuture: false, isToday });
  }

  return results;
}
