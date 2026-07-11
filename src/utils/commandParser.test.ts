import { describe, it, expect } from 'vitest';
import { parseNaturalCommand } from './commandParser';

describe('parseNaturalCommand', () => {
  it('parse "tambah dana 50000" jadi add-saving dengan amount benar', () => {
    const result = parseNaturalCommand('tambah dana 50000');
    expect(result?.type).toBe('add-saving');
    expect(result?.payload?.amount).toBe(50_000);
  });

  it('parse singkatan "50rb" jadi 50000', () => {
    const result = parseNaturalCommand('tambah dana 50rb');
    expect(result?.payload?.amount).toBe(50_000);
  });

  it('parse singkatan "1jt" jadi 1000000', () => {
    const result = parseNaturalCommand('nabung 1jt');
    expect(result?.payload?.amount).toBe(1_000_000);
  });

  it('parse format ribuan "50.000" (titik sebagai pemisah ribuan)', () => {
    const result = parseNaturalCommand('setor 50.000');
    expect(result?.payload?.amount).toBe(50_000);
  });

  it('parse "tambah target Laptop" jadi add-goal dengan title benar', () => {
    const result = parseNaturalCommand('tambah target Laptop');
    expect(result?.type).toBe('add-goal');
    expect(result?.payload?.title).toBe('Laptop');
  });

  it('parse "backup data" jadi backup-export', () => {
    const result = parseNaturalCommand('backup data');
    expect(result?.type).toBe('backup-export');
  });

  it('parse "buka wallet" jadi navigate ke halaman wallet', () => {
    const result = parseNaturalCommand('buka wallet');
    expect(result?.type).toBe('navigate');
    expect(result?.payload?.page).toBe('wallet');
  });

  it('mengembalikan null untuk teks yang tidak cocok pola manapun', () => {
    const result = parseNaturalCommand('halo apa kabar');
    expect(result).toBeNull();
  });

  it('mengembalikan null untuk teks kosong', () => {
    const result = parseNaturalCommand('');
    expect(result).toBeNull();
  });
});
