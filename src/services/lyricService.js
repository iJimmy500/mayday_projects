import axios from 'axios';

export const parseLrc = (lrc) => {
  if (!lrc) return [];
  const lines = lrc.split('\n');
  const timeRegex = /\[(\d+):(\d+(?:\.\d+)?)\]/;
  const timestampGlobalRegex = /\[\d+:\d+(?:\.\d+)?\]/g;

  return lines.map(line => {
    const match = timeRegex.exec(line);
    if (match) {
      const time = parseInt(match[1]) * 60 + parseFloat(match[2]);
      return { time, text: line.replace(timestampGlobalRegex, '').trim() };
    }
    return null;
  }).filter(l => l && l.text);
};

export const fetchLyricsData = async (artist, track, signal) => {
  const { data } = await axios.get(
    `/api/lyrics/search?artist_name=${encodeURIComponent(artist)}&track_name=${encodeURIComponent(track)}`,
    { signal }
  );

  if (!data || data.length === 0) {
    throw new Error('Lyrics not found');
  }

  const synced = data[0].syncedLyrics;
  const plain = data[0].plainLyrics;
  
  const cleanLrc = (l) => l ? l.replace(/\[\d+:\d+(?:\.\d+)?\]/g, '').trim() : '';
  const fullLyrics = plain || cleanLrc(synced);

  const usableLines = fullLyrics.split('\n').filter(l => l.trim().length > 5);
  if (usableLines.length < 3) {
    throw new Error('Lyrics too short');
  }

  const parsedLyrics = synced ? parseLrc(synced) : [];
  
  const coreTitle = track.toLowerCase()
    .replace(/\(.*\)/g, '')
    .replace(/feat\..*/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();

  const lines = fullLyrics.split('\n').filter(l => {
    const cleanL = l.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    const isSpoiler = cleanL.includes(coreTitle);
    return l.trim().length > 10 && !isSpoiler;
  });

  let snippet = '';
  let startIndex = 0;

  if (lines.length > 1) {
    startIndex = Math.floor(Math.random() * Math.max(1, lines.length - 5));
    snippet = lines[startIndex];
  } else {
    const fallbackLines = fullLyrics.split('\n').filter(l => l.trim().length > 10);
    if (fallbackLines.length < 1) {
      throw new Error('No usable snippet lines');
    }
    startIndex = Math.floor(Math.random() * Math.max(1, fallbackLines.length - 5));
    snippet = fallbackLines[startIndex];
  }

  return { fullLyrics, parsedLyrics, snippet, startIndex };
};
