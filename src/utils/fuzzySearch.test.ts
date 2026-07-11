import { describe, it, expect } from 'vitest';
import { fuzzyMatch, bestFieldScore } from './fuzzySearch';

describe('fuzzyMatch', () => {
  it('exact match mendapat skor tertinggi', () => {
    const result = fuzzyMatch('wallet', 'wallet');
    expect(result.matched).toBe(true);
    expect(result.score).toBe(100);
  });

  it('starts-with mendapat skor tinggi', () => {
    const result = fuzzyMatch('wal', 'wallet');
    expect(result.matched).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(80);
  });

  it('contains mendapat skor menengah', () => {
    const result = fuzzyMatch('llet', 'wallet');
    expect(result.matched).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(60);
  });

  it('toleran terhadap typo 1 huruf', () => {
    const result = fuzzyMatch('walet', 'wallet'); // kurang 1 huruf 'l'
    expect(result.matched).toBe(true);
  });

  it('tidak match untuk string yang benar-benar tidak relevan', () => {
    const result = fuzzyMatch('xyz123', 'wallet');
    expect(result.matched).toBe(false);
  });

  it('query kosong selalu dianggap match (tidak memfilter apa-apa)', () => {
    const result = fuzzyMatch('', 'wallet');
    expect(result.matched).toBe(true);
  });
});

describe('bestFieldScore', () => {
  it('mengambil skor terbaik dari beberapa field', () => {
    const score = bestFieldScore('goal', ['deskripsi acak', 'goal', 'kategori lain']);
    expect(score).toBe(100);
  });

  it('mengabaikan field undefined', () => {
    const score = bestFieldScore('wallet', [undefined, 'my wallet', undefined]);
    expect(score).toBeGreaterThan(0);
  });

  it('mengembalikan 0 kalau tidak ada field yang cocok', () => {
    const score = bestFieldScore('zzz999', ['goal', 'wallet', 'achievement']);
    expect(score).toBe(0);
  });
});
