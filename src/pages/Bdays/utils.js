export function daysInMonth(m, y) {
  return new Date(y, m, 0).getDate();
}

export function getSeason(month, day) {
  if ((month === 3 && day >= 20) || month === 4 || month === 5 || (month === 6 && day < 21))
    return { name: 'Spring', emoji: '🌸' };
  if ((month === 6 && day >= 21) || month === 7 || month === 8 || (month === 9 && day < 23))
    return { name: 'Summer', emoji: '☀️' };
  if ((month === 9 && day >= 23) || month === 10 || month === 11 || (month === 12 && day < 21))
    return { name: 'Autumn', emoji: '🍂' };
  return { name: 'Winter', emoji: '❄️' };
}

export function daysUntilNext(month, day) {
  const now  = new Date();
  let next   = new Date(now.getFullYear(), month - 1, day);
  if (next <= now) next = new Date(now.getFullYear() + 1, month - 1, day);
  return Math.ceil((next - now) / 86400000);
}

function popularityScore(month, day) {
  const base = [48,50,53,56,60,64,68,73,87,76,63,40][month - 1];
  const rare =
    (month === 12 && (day === 24 || day === 25 || day === 26)) ||
    (month === 1  && day === 1) ||
    (month === 7  && day === 4);
  if (rare) return Math.max(base - 30, 8);
  const peak = month === 9 && day >= 9 && day <= 20;
  return Math.max(10, Math.min(96, base + (peak ? 8 : 0) + Math.round(Math.sin(day * 1.3 + month) * 4)));
}

export const RANK_MAP = (() => {
  const all = [];
  for (let m = 1; m <= 12; m++)
    for (let d = 1; d <= new Date(2000, m, 0).getDate(); d++)
      all.push({ m, d, s: popularityScore(m, d) });
  all.sort((a, b) => b.s - a.s);
  const map = {};
  all.forEach(({ m, d }, i) => { map[`${m}-${d}`] = i + 1; });
  return map;
})();

export function popularityLabel(rank) {
  if (rank <= 20)  return 'One of the most popular birthdays of the year';
  if (rank <= 75)  return 'A very common birthday';
  if (rank <= 150) return 'A fairly common birthday';
  if (rank <= 250) return 'A less common birthday';
  return 'A rare birthday, pretty unique!';
}

export function artworkUrl(url, size = 200) {
  return url?.replace('100x100', `${size}x${size}`) ?? '';
}

// ─── Zodiac Signs ───────────────────────────────────────────────────────
export function getWesternZodiac(month, day) {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return { name: 'Aries', dates: 'Mar 21 - Apr 19' };
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return { name: 'Taurus', dates: 'Apr 20 - May 20' };
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return { name: 'Gemini', dates: 'May 21 - Jun 20' };
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return { name: 'Cancer', dates: 'Jun 21 - Jul 22' };
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return { name: 'Leo', dates: 'Jul 23 - Aug 22' };
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return { name: 'Virgo', dates: 'Aug 23 - Sep 22' };
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return { name: 'Libra', dates: 'Sep 23 - Oct 22' };
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return { name: 'Scorpio', dates: 'Oct 23 - Nov 21' };
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return { name: 'Sagittarius', dates: 'Nov 22 - Dec 21' };
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return { name: 'Capricorn', dates: 'Dec 22 - Jan 19' };
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return { name: 'Aquarius', dates: 'Jan 20 - Feb 18' };
  return { name: 'Pisces', dates: 'Feb 19 - Mar 20' };
}

export function getChineseZodiac(year) {
  const animals = ['Monkey', 'Rooster', 'Dog', 'Pig', 'Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat'];
  const emojis = ['🐒', '🐓', '🐕', '🐖', '🐀', '🐂', '🐅', '🐇', '🐉', '🐍', '🐎', '🐐'];
  const index = year % 12;
  return { name: animals[index], emoji: emojis[index] };
}

// ─── Birthstones & Birth Flowers ─────────────────────────────────────────
const BIRTHSTONES = [
  { month: 1, name: 'Garnet', color: '#D0104C' },
  { month: 2, name: 'Amethyst', color: '#9966CC' },
  { month: 3, name: 'Aquamarine', color: '#7FFFD4' },
  { month: 4, name: 'Diamond', color: '#B9F2FF' },
  { month: 5, name: 'Emerald', color: '#50C878' },
  { month: 6, name: 'Pearl', color: '#F5F5F5' },
  { month: 7, name: 'Ruby', color: '#E0115F' },
  { month: 8, name: 'Peridot', color: '#A6E7FF' },
  { month: 9, name: 'Sapphire', color: '#0F52BA' },
  { month: 10, name: 'Opal', color: '#A8C8BC' },
  { month: 11, name: 'Topaz', color: '#FFC870' },
  { month: 12, name: 'Turquoise', color: '#40E0D0' },
];

const BIRTH_FLOWERS = [
  { month: 1, name: 'Carnation', icon: 'Flower2' },
  { month: 2, name: 'Violet', icon: 'Flower2' },
  { month: 3, name: 'Daffodil', icon: 'Sun' },
  { month: 4, name: 'Daisy', icon: 'Flower' },
  { month: 5, name: 'Lily of the Valley', icon: 'Flower2' },
  { month: 6, name: 'Rose', icon: 'Flower' },
  { month: 7, name: 'Larkspur', icon: 'Flower2' },
  { month: 8, name: 'Gladiolus', icon: 'Flower' },
  { month: 9, name: 'Aster', icon: 'Sun' },
  { month: 10, name: 'Marigold', icon: 'Flower' },
  { month: 11, name: 'Chrysanthemum', icon: 'Flower2' },
  { month: 12, name: 'Narcissus', icon: 'Flower' },
];

export function getBirthstone(month) {
  return BIRTHSTONES.find(b => b.month === month) || { name: 'Unknown', color: '#888' };
}

export function getBirthFlower(month) {
  return BIRTH_FLOWERS.find(f => f.month === month) || { name: 'Unknown', icon: 'Flower' };
}

// ─── World population (UN data, linear interpolation) ─────────
const POP_DATA = [
  [1900, 1_600_000_000],
  [1910, 1_750_000_000],
  [1920, 1_860_000_000],
  [1930, 2_070_000_000],
  [1940, 2_300_000_000],
  [1950, 2_536_431_000],
  [1960, 3_034_949_000],
  [1970, 3_700_437_000],
  [1980, 4_458_411_000],
  [1990, 5_327_231_000],
  [2000, 6_143_494_000],
  [2010, 6_956_824_000],
  [2020, 7_794_799_000],
  [2025, 8_200_000_000],
];

export function worldPopulationAt(year) {
  if (year <= POP_DATA[0][0]) return POP_DATA[0][1];
  if (year >= POP_DATA[POP_DATA.length - 1][0]) return POP_DATA[POP_DATA.length - 1][1];
  for (let i = 0; i < POP_DATA.length - 1; i++) {
    const [y0, p0] = POP_DATA[i];
    const [y1, p1] = POP_DATA[i + 1];
    if (year >= y0 && year <= y1) {
      const t = (year - y0) / (y1 - y0);
      return Math.round(p0 + t * (p1 - p0));
    }
  }
  return 8_000_000_000;
}

export function formatPopulation(n) {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(0)}M`;
  return n.toLocaleString();
}

// ─── Gmail accounts (cumulative, UN-style interpolation) ──────
const GMAIL_DATA = [
  [2004,       20_000_000],
  [2007,      100_000_000],
  [2010,      170_000_000],
  [2012,      425_000_000],
  [2016,    1_000_000_000],
  [2019,    1_500_000_000],
  [2022,    1_800_000_000],
  [2025,    2_100_000_000],
];

function gmailAccountsAt(year) {
  if (year < 2004) return 0;
  if (year >= GMAIL_DATA[GMAIL_DATA.length - 1][0]) return GMAIL_DATA[GMAIL_DATA.length - 1][1];
  for (let i = 0; i < GMAIL_DATA.length - 1; i++) {
    const [y0, g0] = GMAIL_DATA[i];
    const [y1, g1] = GMAIL_DATA[i + 1];
    if (year >= y0 && year <= y1) {
      const t = (year - y0) / (y1 - y0);
      return Math.round(g0 + t * (g1 - g0));
    }
  }
  return 0;
}

// ─── Derived life stats ───────────────────────────────────────
const SUMMER_OLYMPICS  = [1948,1952,1956,1960,1964,1968,1972,1976,1980,1984,1988,1992,1996,2000,2004,2008,2012,2016,2020,2024];
const WORLD_CUPS       = [1950,1954,1958,1962,1966,1970,1974,1978,1982,1986,1990,1994,1998,2002,2006,2010,2014,2018,2022,2026];

export function getDerivedStats(daysLived, birthYear, birthDay) {
  if (!daysLived || daysLived <= 0) return [];
  const currentYear = new Date().getFullYear();

  const heartbeats  = Math.round(daysLived * 24 * 60 * 70);
  const breaths     = Math.round(daysLived * 24 * 60 * 15);
  const sleepYears  = (daysLived * 8 / 24 / 365.25).toFixed(1);
  const olympics    = SUMMER_OLYMPICS.filter(y => y > birthYear && y <= currentYear).length;
  const worldCups   = WORLD_CUPS.filter(y => y > birthYear && y <= currentYear).length;
  const popThen     = worldPopulationAt(birthYear);
  const popNow      = worldPopulationAt(currentYear);
  const popGrowth   = popNow - popThen;

  // New stats
  const fullMoons   = Math.floor(daysLived / 29.53);
  const sunDistance = (daysLived * 2_573_000).toLocaleString(); // km
  const ageSeconds  = Math.round(daysLived * 24 * 60 * 60).toLocaleString();
  const goldenBirthdayYear = birthYear + birthDay;
  const isGoldenBirthdayPassed = currentYear > goldenBirthdayYear;
  const goldenBirthdayStatus = isGoldenBirthdayPassed 
    ? `Already passed in ${goldenBirthdayYear}` 
    : currentYear === goldenBirthdayYear 
      ? 'This is your golden birthday! 🎉' 
      : `Coming in ${goldenBirthdayYear}`;

  const stats = [
    { label: 'Heartbeats',  value: `~${(heartbeats / 1e9).toFixed(2)} billion` },
    { label: 'Breaths',     value: `~${(breaths / 1e6).toFixed(1)} million` },
    { label: 'Years asleep', value: `~${sleepYears} years` },
    { label: 'Full moons witnessed', value: String(fullMoons) },
    { label: 'Distance traveled around the sun', value: `${sunDistance} km` },
    { label: 'Age in seconds', value: ageSeconds },
    { label: 'Golden birthday', value: goldenBirthdayStatus },
  ];

  if (olympics > 0)
    stats.push({ label: 'Summer Olympics lived through', value: String(olympics) });
  if (worldCups > 0)
    stats.push({ label: 'FIFA World Cups lived through', value: String(worldCups) });
  if (popGrowth > 0)
    stats.push({ label: 'People added to Earth since birth', value: `+${formatPopulation(popGrowth)}` });

  const gmailAtBirth = gmailAccountsAt(birthYear);
  const gmailNow     = gmailAccountsAt(currentYear);
  const gmailGrowth  = gmailNow - gmailAtBirth;
  if (gmailAtBirth === 0 && gmailNow > 0)
    stats.push({ label: 'Gmail accounts created in your lifetime', value: `~${formatPopulation(gmailNow)}` });
  else if (gmailGrowth > 0)
    stats.push({ label: 'Gmail accounts created since your birth', value: `+${formatPopulation(gmailGrowth)}` });

  return stats;
}
