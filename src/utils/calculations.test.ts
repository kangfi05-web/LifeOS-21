// Test untuk logic perhitungan paling kritis di LifeOS:
// - Mode cicilan bulanan (v1.8.0) — kekurangan harus "mengejar" ke bulan berjalan
// - Pembulatan target harian
// - Perhitungan hari
//
// Ini logic yang paling rawan rusak diam-diam kalau ada refactor di masa depan,
// karena bug-nya baru kelihatan efeknya berhari-hari kemudian di data user asli.

import { describe, it, expect } from 'vitest';
import { calculateInstallmentInfo, roundDailyTarget, getTotalDays, calculateProgress } from './calculations';

describe('roundDailyTarget', () => {
  it('untuk nominal di bawah 10rb, dibulatkan ke atas kelipatan 1000', () => {
    expect(roundDailyTarget(4200)).toBe(5000);
    expect(roundDailyTarget(9001)).toBe(10000);
  });

  it('untuk nominal 10rb-100rb, dibulatkan ke atas kelipatan 5000', () => {
    expect(roundDailyTarget(33334)).toBe(35000);
    expect(roundDailyTarget(10000)).toBe(10000);
  });

  it('untuk nominal 100rb ke atas, dibulatkan ke atas kelipatan 10000', () => {
    expect(roundDailyTarget(100000)).toBe(100000);
    expect(roundDailyTarget(100001)).toBe(110000);
  });

  it('mengembalikan 0 untuk nominal nol atau negatif', () => {
    expect(roundDailyTarget(0)).toBe(0);
    expect(roundDailyTarget(-100)).toBe(0);
  });
});

describe('getTotalDays', () => {
  it('menghitung total hari inklusif (start & end ikut dihitung)', () => {
    expect(getTotalDays('2026-06-05', '2026-06-05')).toBe(1);
    expect(getTotalDays('2026-06-05', '2026-06-06')).toBe(2);
  });
});

describe('calculateProgress', () => {
  it('menghitung persentase dengan benar', () => {
    expect(calculateProgress(500_000, 1_000_000)).toBe(50);
  });

  it('dibatasi maksimal 100% walau collected melebihi target', () => {
    expect(calculateProgress(2_000_000, 1_000_000)).toBe(100);
  });
});

describe('calculateInstallmentInfo — mode cicilan bulanan', () => {
  const start = '2026-06-05';
  const deadline = '2026-12-05'; // 6 bulan dari start
  const target = 6_000_000;

  it('bulan pertama, baru mulai: target harian = cicilan bulan 1 dibagi total hari bulan itu', () => {
    const today = new Date('2026-06-05'); // hari pertama, belum ada yang lewat
    const info = calculateInstallmentInfo(start, deadline, target, target, 6, today);
    expect(info.currentMonth).toBe(1);
    expect(info.totalMonths).toBe(6);
    expect(info.monthlyInstallment).toBe(1_000_000);
    // 30 hari tersisa (5 Juni s/d 4 Juli) dari cicilan 1jt -> ~33.334, dibulatkan ke 35.000
    expect(info.dailyTarget).toBeGreaterThan(30_000);
    expect(info.dailyTarget).toBeLessThanOrEqual(35_000);
  });

  it('telat 1 minggu tanpa nabung sama sekali: target harian NAIK untuk mengejar', () => {
    const day1 = calculateInstallmentInfo(start, deadline, target, target, 6, new Date('2026-06-05'));
    const day8 = calculateInstallmentInfo(start, deadline, target, target, 6, new Date('2026-06-12'));

    // Masih di bulan yang sama (bulan 1), sisa dana sama, tapi sisa hari lebih sedikit
    // -> target harian yang dibutuhkan harus lebih tinggi dari hari pertama.
    expect(day8.currentMonth).toBe(1);
    expect(day8.remainingThisPeriod).toBe(day1.remainingThisPeriod);
    expect(day8.daysLeftInPeriod).toBeLessThan(day1.daysLeftInPeriod);
    expect(day8.dailyTarget).toBeGreaterThan(day1.dailyTarget);
  });

  it('masuk bulan ke-2 tapi bulan 1 BELUM lunas: tunggakan ikut terbawa ke bulan 2', () => {
    const today = new Date('2026-07-10'); // sudah lewat 1 bulan dari start (5 Juni)
    const info = calculateInstallmentInfo(start, deadline, target, target, 6, today);

    expect(info.currentMonth).toBe(2);
    expect(info.totalCollected).toBe(0);
    // dueByNow harus mencakup 2 bulan (1jt x 2) karena bulan 1 belum dibayar sama sekali
    expect(info.dueByNow).toBe(2_000_000);
    expect(info.remainingThisPeriod).toBe(2_000_000);
    expect(info.isBehindSchedule).toBe(true);
  });

  it('kalau sudah lunas sampai bulan berjalan: remainingThisPeriod = 0', () => {
    const today = new Date('2026-06-20'); // masih bulan 1
    // Sudah bayar 1jt (pas 1 bulan cicilan) padahal baru pertengahan bulan 1
    const info = calculateInstallmentInfo(start, deadline, target, target - 1_000_000, 6, today);
    expect(info.currentMonth).toBe(1);
    expect(info.totalCollected).toBe(1_000_000);
    expect(info.dueByNow).toBe(1_000_000);
    expect(info.remainingThisPeriod).toBe(0);
    expect(info.dailyTarget).toBe(0);
    expect(info.isBehindSchedule).toBe(false);
  });

  it('currentMonth tidak pernah melebihi totalMonths walau sudah lewat deadline', () => {
    const today = new Date('2030-01-01'); // jauh setelah deadline
    const info = calculateInstallmentInfo(start, deadline, target, target, 6, today);
    expect(info.currentMonth).toBeLessThanOrEqual(6);
  });

  it('dueByNow tidak pernah melebihi total target', () => {
    const today = new Date('2030-01-01');
    const info = calculateInstallmentInfo(start, deadline, target, target, 6, today);
    expect(info.dueByNow).toBeLessThanOrEqual(target);
  });
});
