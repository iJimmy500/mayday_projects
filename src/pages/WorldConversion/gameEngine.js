import { CATEGORIES, GAME_DIFFICULTY_POOL, MIN_PAIR_RATIO } from './conversions';

// ── Meta per category ─────────────────────────────────────────────────────────
export const CATEGORY_META = {
  area:       { question: 'Which covers more area?'         },
  volume:     { question: 'Which holds more?'               },
  weight:     { question: 'Which weighs more?'              },
  length:     { question: 'Which is longer?'                },
  time:       { question: 'Which represents more time?'     },
  speed:      { question: 'Which is faster?'                },
  data:       { question: 'Which stores more data?'         },
  money:      { question: 'Which is worth more?'            },
  energy:     { question: 'Which releases more energy?'     },
  population: { question: 'Which has more people?'          },
};

export const MODES = [
  { id: 'fermi',        label: 'Fermi',           desc: 'How many X fit in one Y? Estimate the number — closeness counts.' },
  { id: 'higher_lower', label: 'Higher or Lower', desc: 'Which is bigger? Build streaks, spend lives.' },
  { id: 'order_em',     label: "Order 'em",       desc: 'Rank 4 things from smallest to largest.' },
];

export const DIFFICULTY_OPTIONS = [
  { id: 'easy',   label: 'Easy',   desc: 'Common, well-known references' },
  { id: 'normal', label: 'Normal', desc: 'Mix of obvious and tricky'     },
  { id: 'hard',   label: 'Hard',   desc: 'Counterintuitive comparisons'  },
];

export const CATEGORY_OPTIONS = [
  { id: 'all', label: 'All categories' },
  ...Object.entries(CATEGORIES).map(([id, cat]) => ({ id, label: cat.label })),
];

export const HL_LIVES    = 3;
export const OE_ROUNDS   = 8;
export const FE_ROUNDS   = 8;

// ── Pool builder ──────────────────────────────────────────────────────────────

export function getPool(categoryId, difficulty) {
  const levels = GAME_DIFFICULTY_POOL[difficulty] ?? [1];

  if (categoryId === 'all') {
    return Object.entries(CATEGORIES).flatMap(([catId, cat]) =>
      cat.units
        .filter(u => levels.includes(u.difficulty))
        .map(u => ({ ...u, categoryId: catId, baseUnit: cat.baseUnit }))
    );
  }
  const cat = CATEGORIES[categoryId];
  if (!cat) return [];
  return cat.units
    .filter(u => levels.includes(u.difficulty))
    .map(u => ({ ...u, categoryId, baseUnit: cat.baseUnit }));
}

// ── Higher or Lower ───────────────────────────────────────────────────────────

export function pickPair(pool, recentIds = []) {
  // Group by category so we always compare within the same dimension
  const byCat = {};
  pool.forEach(u => {
    (byCat[u.categoryId] ??= []).push(u);
  });

  const cats = Object.keys(byCat).sort(() => Math.random() - 0.5);

  for (const catId of cats) {
    const units = byCat[catId].filter(u => !recentIds.includes(u.id));
    if (units.length < 2) continue;

    for (let attempt = 0; attempt < 120; attempt++) {
      const i = Math.floor(Math.random() * units.length);
      let j = Math.floor(Math.random() * units.length);
      while (j === i) j = Math.floor(Math.random() * units.length);
      const a = units[i];
      const b = units[j];
      const ratio = Math.max(a.value, b.value) / Math.min(a.value, b.value);
      if (ratio >= MIN_PAIR_RATIO) {
        return { a, b, bigger: a.value >= b.value ? 'a' : 'b', categoryId: catId };
      }
    }
  }
  return null;
}

// ── Order 'em ─────────────────────────────────────────────────────────────────

export function pickFour(pool, recentIds = []) {
  const byCat = {};
  pool.forEach(u => {
    (byCat[u.categoryId] ??= []).push(u);
  });

  const cats = Object.keys(byCat)
    .filter(c => byCat[c].length >= 4)
    .sort(() => Math.random() - 0.5);

  for (const catId of cats) {
    const units = byCat[catId].filter(u => !recentIds.includes(u.id));
    if (units.length < 4) continue;

    for (let attempt = 0; attempt < 150; attempt++) {
      const shuffled = [...units].sort(() => Math.random() - 0.5).slice(0, 4);
      const sorted   = [...shuffled].sort((a, b) => a.value - b.value);
      const spread   = Math.log10(sorted[3].value) - Math.log10(sorted[0].value);
      // Each adjacent pair must be at least 3x apart so approximate values
      // never produce genuinely ambiguous orderings.
      const adjacentOk = sorted.every((u, i) =>
        i === 0 || u.value / sorted[i - 1].value >= 3
      );
      if (spread >= 2 && adjacentOk) {
        return { items: shuffled, sorted, categoryId: catId };
      }
    }
  }
  return null;
}

// ── Fermi mode ────────────────────────────────────────────────────────────────

// Ratios outside this window are either trivial or impossible to reason about.
const FERMI_MIN_RATIO = 5;
const FERMI_MAX_RATIO = 1e7;

export function pickFermiPair(pool, recentIds = []) {
  const byCat = {};
  pool.forEach(u => {
    (byCat[u.categoryId] ??= []).push(u);
  });

  const cats = Object.keys(byCat).sort(() => Math.random() - 0.5);

  for (const catId of cats) {
    const units = byCat[catId].filter(u => !recentIds.includes(u.id));
    if (units.length < 2) continue;

    for (let attempt = 0; attempt < 150; attempt++) {
      const i = Math.floor(Math.random() * units.length);
      let j = Math.floor(Math.random() * units.length);
      while (j === i) j = Math.floor(Math.random() * units.length);
      const small = units[i].value <= units[j].value ? units[i] : units[j];
      const big   = units[i].value <= units[j].value ? units[j] : units[i];
      const answer = big.value / small.value;
      if (answer >= FERMI_MIN_RATIO && answer <= FERMI_MAX_RATIO) {
        return { small, big, answer, categoryId: catId };
      }
    }
  }
  return null;
}

// Score on log distance: full marks for nailing it, zero at 100x off.
// err 0 → 100, 2x off → ~85, 10x off → 50, 100x off → 0.
export function fermiScore(guess, answer) {
  const err = Math.abs(Math.log10(guess / answer));
  return Math.round(100 * Math.max(0, 1 - err / 2));
}

export function isBullseye(guess, answer) {
  return Math.abs(Math.log10(guess / answer)) <= Math.log10(1.25);
}

// Accepts "2,500", "2.5k", "3m", "1.2b", "4e6"
export function parseGuess(raw) {
  const str = raw.trim().toLowerCase().replace(/,/g, '');
  const m = str.match(/^([\d.]+(?:e[+-]?\d+)?)\s*(k|m|b|t)?$/);
  if (!m) return null;
  const mult = { k: 1e3, m: 1e6, b: 1e9, t: 1e12 }[m[2]] ?? 1;
  const n = parseFloat(m[1]) * mult;
  return isFinite(n) && n > 0 ? n : null;
}

export function fermiRating(avg) {
  if (avg >= 85) return 'human calculator';
  if (avg >= 70) return 'fermi master';
  if (avg >= 50) return 'solid estimator';
  if (avg >= 30) return 'right ballpark, roughly';
  return 'bold guesser';
}

// "Statues of Liberty" → "Statue of Liberty", "Texases" → "Texas".
// Quantity-style phrases ("time since...", "age of Earth") pass through as-is.
const SINGULAR_EXCEPTIONS = { 'United States': 'United States' };

export function singularizeUnit(label) {
  if (SINGULAR_EXCEPTIONS[label]) return SINGULAR_EXCEPTIONS[label];
  if (/^(time since|age of|speed of|all |daily )|'s /i.test(label)) return label;

  const depluralize = (w) => {
    if (/[^aeiou]ies$/.test(w)) return w.replace(/ies$/, 'y');
    if (/(ses|xes|zes|ches|shes)$/.test(w)) return w.replace(/es$/, '');
    if (/s$/.test(w) && !/ss$/.test(w)) return w.replace(/s$/, '');
    return w;
  };

  const parenIdx = label.indexOf(' (');
  let paren = parenIdx >= 0 ? label.slice(parenIdx) : '';
  let head = parenIdx >= 0 ? label.slice(0, parenIdx) : label;

  if (paren) paren = paren.replace(/([A-Za-z]+)\)/, (_, w) => depluralize(w) + ')');

  const ofIdx = head.indexOf(' of ');
  if (ofIdx >= 0) {
    // Plural is usually on the head ("Statues of Liberty"), occasionally on
    // the tail ("City of Los Angeleses")
    const first = head.slice(0, ofIdx);
    const sing = depluralize(first);
    head = sing !== first ? sing + head.slice(ofIdx) : depluralize(head);
  } else {
    head = depluralize(head);
  }
  return head + paren;
}

// ── Scoring helpers ───────────────────────────────────────────────────────────

export function streakMultiplier(streak) {
  if (streak >= 20) return 5;
  if (streak >= 15) return 3;
  if (streak >= 10) return 2;
  if (streak >= 5)  return 1.5;
  return 1;
}

export function oeScore(correctCount) {
  if (correctCount === 4) return 4;
  if (correctCount === 3) return 2;
  if (correctCount === 2) return 1;
  return 0;
}

// ── Display helpers ───────────────────────────────────────────────────────────

export function formatValue(value, baseUnit) {
  const n = value;
  let num;
  if      (n >= 1e12) num = `${parseFloat((n / 1e12).toPrecision(3))} trillion`;
  else if (n >= 1e9)  num = `${parseFloat((n / 1e9).toPrecision(3))} billion`;
  else if (n >= 1e6)  num = `${parseFloat((n / 1e6).toPrecision(3))} million`;
  else if (n >= 1000) num = Math.round(n).toLocaleString();
  else if (n >= 1)    num = parseFloat(n.toPrecision(4)).toString();
  else if (n >= 0.001)num = parseFloat(n.toPrecision(2)).toString();
  else                num = n.toExponential(2);
  return `${num} ${baseUnit}`;
}
