// Natural Command Parser — mengubah teks natural (bahasa Indonesia) jadi aksi terstruktur.
// Modular: tambah command baru cukup daftarkan satu pattern baru di fungsi ini.

export type ParsedCommandType =
  | 'add-saving'
  | 'add-goal'
  | 'backup-export'
  | 'backup-restore'
  | 'export-report'
  | 'navigate';

export interface ParsedCommand {
  type: ParsedCommandType;
  label: string; // teks ringkas untuk ditampilkan sebagai preview di UI
  payload?: {
    amount?: number;
    title?: string;
    page?: string;
  };
}

// Halaman yang bisa dituju lewat "buka <halaman>"
const PAGE_ALIASES: Record<string, string> = {
  dashboard: 'dashboard',
  beranda: 'dashboard',
  home: 'dashboard',
  target: 'goals',
  goals: 'goals',
  goal: 'goals',
  wallet: 'wallet',
  dompet: 'wallet',
  kalender: 'calendar',
  calendar: 'calendar',
  jadwal: 'calendar',
  analytics: 'analytics',
  analitik: 'analytics',
  statistik: 'analytics',
  achievement: 'achievements',
  achievements: 'achievements',
  pencapaian: 'achievements',
  journey: 'journey',
  perjalanan: 'journey',
  universe: 'universe',
  'dream universe': 'universe',
  impian: 'universe',
  simulator: 'simulator',
  simulasi: 'simulator',
  settings: 'settings',
  pengaturan: 'settings',
};

// Parse angka dengan dukungan singkatan umum Indonesia: 50rb, 50ribu, 50k, 1jt, 1.5juta, 50.000
function parseAmount(raw: string): number | null {
  const cleaned = raw.trim().toLowerCase().replace(/\s+/g, '');
  const match = cleaned.match(/^([\d.,]+)\s*(rb|ribu|k|jt|juta)?$/);
  if (!match) return null;

  let numberPart = match[1];
  const suffix = match[2];

  // Kalau ada suffix (rb/jt), titik/koma dianggap desimal, bukan pemisah ribuan
  if (suffix) {
    numberPart = numberPart.replace(',', '.');
  } else {
    // Tanpa suffix: anggap titik/koma sebagai pemisah ribuan (format ID: 50.000)
    numberPart = numberPart.replace(/[.,]/g, '');
  }

  const base = parseFloat(numberPart);
  if (isNaN(base)) return null;

  switch (suffix) {
    case 'rb':
    case 'ribu':
    case 'k':
      return Math.round(base * 1_000);
    case 'jt':
    case 'juta':
      return Math.round(base * 1_000_000);
    default:
      return Math.round(base);
  }
}

export function parseNaturalCommand(input: string): ParsedCommand | null {
  const trimmedOriginal = input.trim();
  const text = trimmedOriginal.toLowerCase();
  if (!text) return null;

  // "tambah dana 50000" / "tambah saving 50rb" / "nabung 20k"
  let m = text.match(/^(?:tambah\s+dana|tambah\s+saving|nabung|setor)\s+(.+)$/);
  if (m) {
    const amount = parseAmount(m[1]);
    if (amount && amount > 0) {
      return {
        type: 'add-saving',
        label: `Tambah dana Rp${amount.toLocaleString('id-ID')}`,
        payload: { amount },
      };
    }
  }

  // "tambah target Laptop" / "buat target Liburan"
  // Ambil judulnya dari teks ASLI (bukan yang sudah di-lowercase) supaya kapitalisasi
  // yang diketik user tetap terjaga, mis. "Laptop" tidak berubah jadi "laptop".
  m = text.match(/^(?:tambah|buat)\s+target\s+(.+)$/);
  if (m) {
    const title = trimmedOriginal.slice(trimmedOriginal.length - m[1].length).trim();
    if (title.length > 0) {
      return {
        type: 'add-goal',
        label: `Buat target baru "${title}"`,
        payload: { title },
      };
    }
  }

  // "backup semua data" / "backup data" / "export data"
  if (/^(backup(\s+semua)?\s+data|export\s+data)$/.test(text)) {
    return {
      type: 'backup-export',
      label: 'Ekspor semua data ke file backup (.json)',
    };
  }

  // "restore backup" / "restore data" / "import backup"
  if (/^(restore\s+(backup|data)|import\s+backup)$/.test(text)) {
    return {
      type: 'backup-restore',
      label: 'Pulihkan data dari file backup',
    };
  }

  // "export pdf" / "export laporan" / "export report"
  if (/^export\s+(pdf|laporan|report)$/.test(text)) {
    return {
      type: 'export-report',
      label: 'Buka laporan untuk diekspor',
    };
  }

  // "buka wallet" / "buka dream universe" / "buka pengaturan"
  m = text.match(/^buka\s+(.+)$/);
  if (m) {
    const target = m[1].trim();
    const page = PAGE_ALIASES[target];
    if (page) {
      return {
        type: 'navigate',
        label: `Buka halaman ${target}`,
        payload: { page },
      };
    }
  }

  return null;
}
