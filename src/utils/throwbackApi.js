import { TODAY } from '../components/throwback/constants';

const API_KEY = import.meta.env.VITE_LASTFM_API_KEY;
const BASE    = '/api/lastfm';

function dayTimestamps(year) {
  const from = new Date(Date.UTC(year, TODAY.getMonth(), TODAY.getDate(), 0, 0, 0));
  const to   = new Date(Date.UTC(year, TODAY.getMonth(), TODAY.getDate(), 23, 59, 59));
  return { from: Math.floor(from.getTime() / 1000), to: Math.floor(to.getTime() / 1000) };
}

function bestArt(images) {
  const arr = Array.isArray(images) ? images : [];
  for (const size of ['extralarge', 'large', 'medium']) {
    const img = arr.find(i => i.size === size);
    if (img?.['#text']) return img['#text'];
  }
  return null;
}

export async function fetchScrobbles(user, year) {
  const { from, to } = dayTimestamps(year);
  let all = [], page = 1;
  while (true) {
    const url = `${BASE}?method=user.getrecenttracks&user=${encodeURIComponent(user)}&from=${from}&to=${to}&limit=200&page=${page}&api_key=${API_KEY}&format=json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Network error');
    const data = await res.json();
    if (data.error) throw new Error(data.message ?? 'Last.fm error');
    const raw = data?.recenttracks?.track ?? [];
    const arr = Array.isArray(raw) ? raw : [raw];
    all = all.concat(arr.filter(t => !t['@attr']?.nowplaying));
    const total = parseInt(data.recenttracks?.['@attr']?.totalPages ?? '1', 10);
    if (page >= total || page >= 5) break;
    page++;
  }
  return all;
}

export function aggregate(scrobbles) {
  const tracks = {}, artists = {}, albums = {};
  for (const s of scrobbles) {
    const artistName = s.artist?.['#text'] ?? '';
    const albumName  = s.album?.['#text'] ?? '';
    const tk = `${s.name}||${artistName}`;
    const art = bestArt(s.image);
    if (!tracks[tk])  tracks[tk]  = { name: s.name, artist: artistName, art, count: 0 };
    if (!artists[artistName]) artists[artistName] = { name: artistName, art: art ?? null, count: 0 };
    else if (!artists[artistName].art && art) artists[artistName].art = art;
    if (albumName && !albums[`${albumName}||${artistName}`])
      albums[`${albumName}||${artistName}`] = { name: albumName, artist: artistName, art, count: 0 };
    tracks[tk].count++;
    artists[artistName].count++;
    if (albumName) albums[`${albumName}||${artistName}`].count++;
  }
  const sort = obj => Object.values(obj).sort((a, b) => b.count - a.count);
  return { tracks: sort(tracks), artists: sort(artists), albums: sort(albums) };
}

async function deezerArtistImage(name) {
  const url = `/api/artist-image?term=${encodeURIComponent(name)}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  return data?.data?.[0]?.picture_xl ?? data?.data?.[0]?.picture_big ?? null;
}

// Enriches the artists array with real images from iTunes in the background.
// onUpdate(index, imageUrl) is called as each image resolves.
export async function enrichArtistImages(artists, onUpdate, limit = 10) {
  const targets = artists.slice(0, limit);
  await Promise.all(
    targets.map(async (artist, i) => {
      try {
        const img = await deezerArtistImage(artist.name);
        if (img) onUpdate(i, img);
      } catch { /* skip silently */ }
    })
  );
}
