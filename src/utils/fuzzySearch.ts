// Fuzzy Search Engine — pencocokan teks dengan toleransi typo
// Dipakai oleh Universal Search / Command Center untuk menilai relevansi hasil.

export interface FuzzyMatchResult {
  matched: boolean;
  score: number; // makin besar makin relevan
}

// Levenshtein distance sederhana, dibatasi (early-exit) untuk performa
function levenshteinDistance(a: string, b: string, maxDistance: number): number {
  if (Math.abs(a.length - b.length) > maxDistance) return maxDistance + 1;

  const rows = a.length + 1;
  const cols = b.length + 1;
  const matrix: number[][] = Array.from({ length: rows }, () => new Array(cols).fill(0));

  for (let i = 0; i < rows; i++) matrix[i][0] = i;
  for (let j = 0; j < cols; j++) matrix[0][j] = j;

  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[rows - 1][cols - 1];
}

// Cek apakah karakter query muncul berurutan di dalam target (subsequence match)
function isSubsequence(query: string, target: string): boolean {
  let qi = 0;
  for (let i = 0; i < target.length && qi < query.length; i++) {
    if (target[i] === query[qi]) qi++;
  }
  return qi === query.length;
}

// Skor relevansi satu string terhadap query.
// Urutan prioritas: exact match > starts-with > contains > typo-tolerant > subsequence
export function fuzzyMatch(query: string, target: string): FuzzyMatchResult {
  const q = query.trim().toLowerCase();
  const t = target.trim().toLowerCase();

  if (!q) return { matched: true, score: 0 };
  if (!t) return { matched: false, score: 0 };

  if (t === q) return { matched: true, score: 100 };
  if (t.startsWith(q)) return { matched: true, score: 80 };
  if (t.includes(q)) return { matched: true, score: 60 };

  // Toleransi typo per-kata: bandingkan query dengan tiap kata di target
  const words = t.split(/\s+/);
  const maxDistance = q.length <= 4 ? 1 : 2;
  for (const word of words) {
    const distance = levenshteinDistance(q, word, maxDistance);
    if (distance <= maxDistance) {
      return { matched: true, score: 45 - distance * 10 };
    }
  }

  if (isSubsequence(q, t)) return { matched: true, score: 20 };

  return { matched: false, score: 0 };
}

// Cari skor terbaik dari beberapa field (label, deskripsi, keywords, dst)
export function bestFieldScore(query: string, fields: (string | undefined)[]): number {
  let best = 0;
  for (const field of fields) {
    if (!field) continue;
    const { matched, score } = fuzzyMatch(query, field);
    if (matched && score > best) best = score;
  }
  return best;
}
