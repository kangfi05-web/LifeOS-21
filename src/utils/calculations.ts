// Utility Functions

import { format, formatDistanceToNow, differenceInDays, differenceInCalendarDays, differenceInMonths, isBefore, startOfDay, addDays, addMonths } from 'date-fns';
import { id } from 'date-fns/locale/id';

// Format Currency - Indonesian Rupiah
export function formatCurrency(amount: number, compact: boolean = false): string {
  if (compact) {
    if (amount >= 1000000000) return `Rp${(amount / 1000000000).toFixed(1)}M`;
    if (amount >= 1000000) return `Rp${(amount / 1000000).toFixed(1)}JT`;
    if (amount >= 1000) return `Rp${(amount / 1000).toFixed(0)}K`;
  }

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Parse currency input
export function parseCurrencyInput(value: string): number {
  const cleaned = value.replace(/[^\d]/g, '');
  return parseInt(cleaned, 10) || 0;
}

// Format date
export function formatDate(date: Date | string, formatStr: string = 'd MMMM yyyy'): string {
  const d = new Date(date);
  return format(d, formatStr, { locale: id });
}

// Format date relative
export function formatDateRelative(date: Date | string): string {
  const d = new Date(date);
  return formatDistanceToNow(d, { addSuffix: true, locale: id });
}

// Calculate days remaining
export function getDaysRemaining(deadline: Date | string): number {
  const end = new Date(deadline);
  const today = startOfDay(new Date());
  return Math.max(0, differenceInDays(end, today));
}

// Calculate days passed
export function getDaysPassed(startDate: Date | string): number {
  const start = new Date(startDate);
  const today = startOfDay(new Date());
  return differenceInDays(today, start);
}

// Calculate total days in goal period
export function getTotalDays(startDate: Date | string, deadline: Date | string): number {
  const start = new Date(startDate);
  const end = new Date(deadline);
  return differenceInCalendarDays(end, start) + 1;
}

export type InstallmentMonthStatus = 'paid' | 'overdue' | 'current' | 'upcoming';

export interface InstallmentMonthDetail {
  month: number; // ke berapa (1-indexed)
  status: InstallmentMonthStatus;
  dueDate: Date; // batas bayar cicilan bulan ini
}

export interface InstallmentInfo {
  currentMonth: number; // bulan ke berapa sekarang (1-indexed)
  totalMonths: number;
  monthlyInstallment: number; // cicilan tetap per bulan
  totalCollected: number; // total yang sudah dibayar sejak awal
  dueByNow: number; // seharusnya sudah dibayar sejak awal sampai akhir bulan berjalan
  remainingThisPeriod: number; // sisa yang harus dikejar sampai akhir bulan berjalan (termasuk tunggakan)
  periodEndDate: Date; // batas akhir bulan berjalan (jatuh tempo cicilan bulan ini)
  daysLeftInPeriod: number;
  dailyTarget: number; // remainingThisPeriod disebar ke daysLeftInPeriod
  isBehindSchedule: boolean;
  monthsPaid: number; // jumlah bulan yang SUDAH lunas penuh
  monthsRemaining: number; // sisa bulan yang belum lunas (totalMonths - monthsPaid)
  monthsBreakdown: InstallmentMonthDetail[]; // status tiap bulan, lengkap 1..totalMonths
}

// Hitung info cicilan bulanan untuk goal bertipe installment (mis. hutang N bulan).
// Kunci bedanya dari dailyTarget biasa: kekurangan hanya dikejar dalam SISA HARI
// BULAN BERJALAN, bukan disebar ke seluruh sisa durasi target.
export function calculateInstallmentInfo(
  startDate: Date | string,
  deadline: Date | string,
  targetAmount: number,
  remainingAmount: number,
  installmentMonths: number,
  now: Date = new Date()
): InstallmentInfo {
  const start = startOfDay(new Date(startDate));
  const end = startOfDay(new Date(deadline));
  const today = startOfDay(now);

  const totalMonths = Math.max(1, installmentMonths);
  const monthlyInstallment = targetAmount / totalMonths;
  const totalCollected = Math.max(0, targetAmount - remainingAmount);

  // Bulan ke berapa sekarang, dihitung dari tanggal mulai (anchor ke tanggal, bukan kalender 1-31)
  const elapsedFullMonths = Math.max(0, differenceInMonths(today, start));
  const currentMonth = Math.min(totalMonths, elapsedFullMonths + 1);

  // Batas akhir bulan berjalan = tanggal jatuh tempo cicilan ke-currentMonth
  const periodEndDate = currentMonth >= totalMonths ? end : addMonths(start, currentMonth);

  // Seharusnya sudah terbayar kumulatif sampai akhir bulan berjalan
  const dueByNow = Math.min(targetAmount, monthlyInstallment * currentMonth);
  const remainingThisPeriod = Math.max(0, dueByNow - totalCollected);

  const daysLeftInPeriod = Math.max(0, differenceInCalendarDays(periodEndDate, today) + 1);
  const dailyTarget =
    daysLeftInPeriod > 0 ? remainingThisPeriod / daysLeftInPeriod : remainingThisPeriod;

  // Berapa bulan yang SUDAH lunas penuh (dihitung dari total dana terkumpul, murni angka,
  // tidak peduli itu dibayar cepat/lambat — yang penting cicilan bulan itu sudah tertutup)
  const monthsPaid = Math.min(totalMonths, Math.floor((totalCollected + 0.01) / monthlyInstallment));
  const monthsRemaining = totalMonths - monthsPaid;

  const monthsBreakdown: InstallmentMonthDetail[] = [];
  for (let m = 1; m <= totalMonths; m++) {
    let status: InstallmentMonthStatus;
    if (m <= monthsPaid) {
      status = 'paid';
    } else if (m < currentMonth) {
      status = 'overdue';
    } else if (m === currentMonth) {
      status = 'current';
    } else {
      status = 'upcoming';
    }
    monthsBreakdown.push({ month: m, status, dueDate: addMonths(start, m) });
  }

  return {
    currentMonth,
    totalMonths,
    monthlyInstallment: roundDailyTarget(monthlyInstallment),
    totalCollected,
    dueByNow,
    remainingThisPeriod,
    periodEndDate,
    daysLeftInPeriod,
    dailyTarget: roundDailyTarget(dailyTarget),
    isBehindSchedule: totalCollected < dueByNow - monthlyInstallment * 0.01,
    monthsPaid,
    monthsRemaining,
    monthsBreakdown,
  };
}

// Calculate daily target
export function calculateDailyTarget(
  totalTarget: number,
  collectedAmount: number,
  remainingDays: number
): number {
  if (remainingDays <= 0) return 0;
  const remaining = totalTarget - collectedAmount;
  return Math.max(0, remaining / remainingDays);
}

// Round daily target to nearest clean number
export function roundDailyTarget(amount: number): number {
  // Round up to nearest clean number
  if (amount <= 0) return 0;

  // For amounts under 10,000, round to nearest 1,000
  if (amount < 10000) {
    return Math.ceil(amount / 1000) * 1000;
  }

  // For amounts under 100,000, round to nearest 5,000
  if (amount < 100000) {
    return Math.ceil(amount / 5000) * 5000;
  }

  // For amounts 100,000 and above, round to nearest 10,000
  return Math.ceil(amount / 10000) * 10000;
}

// Calculate progress percentage
export function calculateProgress(collectedAmount: number, targetAmount: number): number {
  if (targetAmount === 0) return 0;
  return Math.min(100, (collectedAmount / targetAmount) * 100);
}

// Calculate estimated finish date
export function calculateEstimatedFinish(
  startDate: Date | string,
  deadline: Date | string,
  currentProgress: number
): Date | null {
  const start = new Date(startDate);
  const end = new Date(deadline);
  const totalDays = differenceInDays(end, start);

  if (currentProgress >= 100) return start;
  if (currentProgress <= 0) return end;

  const daysFromStart = Math.floor((totalDays * currentProgress) / 100);
  return addDays(start, daysFromStart);
}

// Calculate delay in days
export function calculateDelay(
  deadline: Date | string,
  estimatedFinish: Date | null,
  currentProgress: number,
  _remainingAmount: number,
  dailyTarget: number
): number {
  if (currentProgress >= 100) return 0;
  if (!estimatedFinish || dailyTarget <= 0) return 0;

  const end = new Date(deadline);
  const estimated = estimatedFinish;

  if (isBefore(estimated, end)) return 0; // Early

  return differenceInDays(estimated, end);
}

// Calculate financial health score
export function calculateFinancialHealth(
  streak: number,
  consistency: number, // 0-100
  progress: number,
  savingRate: number // 0-100
): number {
  const weights = {
    streak: 0.25,
    consistency: 0.25,
    progress: 0.25,
    savingRate: 0.25,
  };

  const streakScore = Math.min(100, streak * 0.27); // 100 days = 27, so 365 days = ~100

  const score =
    streakScore * weights.streak +
    consistency * weights.consistency +
    progress * weights.progress +
    savingRate * weights.savingRate;

  return Math.round(Math.min(100, score));
}

// Calculate XP for level up
export function calculateXPForLevel(level: number): number {
  // Exponential growth
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

// Get level title
export function getLevelTitle(level: number): string {
  if (level >= 100) return 'Legend';
  if (level >= 75) return 'Life Architect';
  if (level >= 50) return 'Financial Master';
  if (level >= 35) return 'Wealth Creator';
  if (level >= 20) return 'Achiever';
  if (level >= 10) return 'Builder';
  if (level >= 5) return 'Planner';
  return 'Dreamer';
}

// Calculate current level from total XP
export function calculateLevel(totalXP: number): number {
  let level = 1;
  let xpNeeded = 0;

  while (true) {
    xpNeeded += calculateXPForLevel(level);
    if (totalXP < xpNeeded) break;
    level++;
  }

  return level;
}

// Get greeting based on time
export function getGreeting(): { text: string; icon: string } {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 11) {
    return { text: 'Selamat Pagi', icon: 'Sun' };
  } else if (hour >= 11 && hour < 15) {
    return { text: 'Selamat Siang', icon: 'CloudSun' };
  } else if (hour >= 15 && hour < 18) {
    return { text: 'Selamat Sore', icon: 'Sunset' };
  } else {
    return { text: 'Selamat Malam', icon: 'Moon' };
  }
}

// Generate unique color
export function generateColor(): string {
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#06B6D4', '#22C55E', '#F97316', '#6366F1',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Get motivational quote
export function getRandomMotivationalQuote(): string {
  const quotes = [
    "Sedikit demi sedikit, lama-lama menjadi bukit.",
    "Hari ini lebih baik dari kemarin.",
    "Target besar dimulai dari langkah kecil.",
    "Konsistensi adalah kunci kesuksesan.",
    "Setiap langkah kecil membawa Anda lebih dekat ke impian.",
    "Jangan lihat seberapa jauh, lihat seberapa dekat.",
    "Kesabaran adalah kekuatan.",
    "Mulai hari ini, bukan besok.",
    "Impian tanpa aksi hanya mimpi.",
    "Setiap detik adalah kesempatan.",
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
}

// Animate number count
export function animateValue(
  start: number,
  end: number,
  duration: number,
  callback: (value: number) => void
): void {
  const startTime = performance.now();

  function update(currentTime: number) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease out cubic
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const current = start + (end - start) * easeOut;

    callback(Math.round(current));

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}
