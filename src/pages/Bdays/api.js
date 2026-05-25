import { MONTHS, getUserLocation, WMO } from './constants';
import { getSeason, daysUntilNext, RANK_MAP, artworkUrl } from './utils';

const pad = n => String(n).padStart(2, '0');

// ─── Wikipedia ────────────────────────────────────────────────
const wikiGet = async (path) => {
  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/feed/onthisday/${path}`);
    if (!res.ok) return {};
    return res.json();
  } catch { return {}; }
};

export async function fetchWikiData(month, day, year) {
  const [sel, birth] = await Promise.all([
    wikiGet(`selected/${month}/${day}`),
    wikiGet(`births/${month}/${day}`),
  ]);

  const births = (birth.births || []).filter(b => Number(b.year) !== year).slice(0, 8);

  const firstNames = births
    .map(b => (b.pages?.[0]?.normalizedtitle || b.text || '').split(/[ -]/)[0])
    .filter(n => n && n.length > 1 && /^[A-Z]/.test(n));
  const counts = {};
  firstNames.forEach(n => { counts[n] = (counts[n] || 0) + 1; });
  const topNames = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([n]) => n);

  const birthDate = new Date(year, month - 1, day);
  const now       = new Date();
  const isFuture  = birthDate > now;

  return {
    month, day, year, isFuture,
    monthName: MONTHS[month - 1],
    dayName:   birthDate.toLocaleDateString('en-US', { weekday: 'long' }),
    age:       isFuture ? null : Math.floor((now - birthDate) / (365.25 * 86400000)),
    daysLived: isFuture ? null : Math.floor((now - birthDate) / 86400000),
    season:    getSeason(month, day),
    daysUntil: daysUntilNext(month, day),
    rank:      RANK_MAP[`${month}-${day}`] ?? 183,
    events:    (sel.selected || []).slice(0, 5),
    births,
    topNames,
  };
}

// ─── Weather (Open-Meteo, free, no key) ──────────────────────
export async function fetchWeather(year, month, day) {
  if (year < 1940) return null;
  const { lat, lon, city, imperial } = getUserLocation();
  const dateStr = `${year}-${pad(month)}-${pad(day)}`;
  try {
    const res = await fetch(
      `https://archive-api.open-meteo.com/v1/archive` +
      `?latitude=${lat}&longitude=${lon}` +
      `&start_date=${dateStr}&end_date=${dateStr}` +
      `&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_sum` +
      `&timezone=auto`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const d    = data.daily;
    if (!d?.temperature_2m_max?.length) return null;

    const tempMaxC = d.temperature_2m_max[0];
    const tempMinC = d.temperature_2m_min[0];
    const code     = d.weathercode?.[0];
    const [desc, emoji] = WMO[code] || ['', ''];

    const fmt = (c) => imperial
      ? `${Math.round(c * 9/5 + 32)}°F`
      : `${Math.round(c)}°C`;

    return {
      city,
      desc, emoji,
      high: fmt(tempMaxC),
      low:  fmt(tempMinC),
      precip: d.precipitation_sum?.[0] ?? 0,
    };
  } catch { return null; }
}

// ─── News (The Guardian, free test key) ──────────────────────
export async function fetchNews(year, month, day) {
  if (year < 1999) return [];
  const dateStr = `${year}-${pad(month)}-${pad(day)}`;
  try {
    const res = await fetch(
      `https://content.guardianapis.com/search` +
      `?from-date=${dateStr}&to-date=${dateStr}` +
      `&api-key=test&show-fields=headline` +
      `&page-size=5&order-by=relevance`
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.response?.results || []).map(r => ({
      title:   r.webTitle,
      section: r.sectionName,
      url:     r.webUrl,
    }));
  } catch { return []; }
}

// ─── iTunes + NASA APOD ───────────────────────────────────────
const safeJson = async (settled) => {
  if (settled.status !== 'fulfilled') return null;
  return settled.value.json().catch(() => null);
};

export async function fetchMediaData(year, month, day) {
  const dateStr = `${year}-${pad(month)}-${pad(day)}`;
  const base    = `https://itunes.apple.com/search?attribute=releaseYearTerm&term=${year}&limit=5&country=us`;

  const [movieRes, tvRes, apodRes] = await Promise.allSettled([
    fetch(`${base}&entity=movie`),
    fetch(`${base}&entity=tvSeason`),
    year >= 1995
      ? fetch(`https://api.nasa.gov/planetary/apod?date=${dateStr}&api_key=${import.meta.env.VITE_NASA_API_KEY}`)
      : Promise.reject('before APOD era'),
  ]);

  const [movieData, tvData, apodData] = await Promise.all(
    [movieRes, tvRes, apodRes].map(safeJson)
  );

  const movies = (movieData?.results || []).slice(0, 3).map(r => ({
    title: r.trackName || r.collectionName,
    genre: r.primaryGenreName,
    art:   artworkUrl(r.artworkUrl100, 220),
    url:   r.trackViewUrl || r.collectionViewUrl,
    kind:  'movie',
  }));

  const seen = new Set();
  const tv = (tvData?.results || [])
    .filter(r => {
      const show = (r.artistName || '').trim();
      if (seen.has(show)) return false;
      seen.add(show);
      return true;
    })
    .slice(0, 3)
    .map(r => ({
      title: r.artistName || r.collectionName,
      genre: r.primaryGenreName,
      art:   artworkUrl(r.artworkUrl100, 220),
      url:   r.collectionViewUrl,
      kind:  'tv',
    }));

  const apod = apodData?.media_type === 'image' ? {
    title: apodData.title,
    url:   apodData.url,
    hdurl: apodData.hdurl,
  } : null;

  return { movies, tv, apod };
}
