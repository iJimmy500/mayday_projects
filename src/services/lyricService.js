import axios from 'axios';
import { trackToken } from '../utils/logToken';

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
  let synced = null;
  let plain = null;

  try {
    console.log(`[Lyrics] 🔍 Fetching from LRCLIB: ${trackToken(artist, track)}`);
    const { data } = await axios.get(
      `https://lrclib.net/api/get?artist_name=${encodeURIComponent(artist)}&track_name=${encodeURIComponent(track)}`,
      { signal }
    );
    
    if (data) {
      synced = data.syncedLyrics;
      plain = data.plainLyrics || data.syncedLyrics;
      console.log(`[Lyrics] ✅ Success! Synced: ${!!synced}`);
    } else {
      throw new Error("Lyrics not found on LRCLIB");
    }
  } catch (error) {
    console.warn("[Lyrics] ⚠️ LRCLIB failed, trying fallback...", error.message);
    try {
      const { data } = await axios.get(
        `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(track)}`,
        { signal }
      );
      if (data && data.lyrics) {
        plain = data.lyrics;
        console.log("[Lyrics] ✅ Success (Fallback)");
      }
    } catch (fallbackError) {
      console.error("[Lyrics] ❌ All APIs failed");
      throw new Error('Lyrics not found');
    }
  }
  
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

  const isSpoilerLine = (text) => {
    const cleanL = text.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    return !!coreTitle && cleanL.includes(coreTitle);
  };

  let hintLines = [];
  let hintTimes = null;

  // Prefer building hints from the timestamped lines so the playback hint
  // can seek the player to the exact moment the snippet is sung.
  if (parsedLyrics.length > 0) {
    let pool = parsedLyrics.filter(l => l.text.length > 10 && !isSpoilerLine(l.text));
    if (pool.length < 2) pool = parsedLyrics.filter(l => l.text.length > 10);
    if (pool.length > 0) {
      hintLines = pool.map(l => l.text);
      hintTimes = pool.map(l => l.time);
    }
  }

  if (hintLines.length === 0) {
    hintLines = fullLyrics.split('\n').map(l => l.trim()).filter(l => l.length > 10 && !isSpoilerLine(l));
    if (hintLines.length < 2) {
      hintLines = fullLyrics.split('\n').map(l => l.trim()).filter(l => l.length > 10);
    }
    if (hintLines.length < 1) {
      throw new Error('No usable snippet lines');
    }
  }

  const startIndex = Math.floor(Math.random() * Math.max(1, hintLines.length - 5));
  const snippet = hintLines[startIndex];
  const hintStartTime = hintTimes ? hintTimes[startIndex] : null;

  return { fullLyrics, parsedLyrics, snippet, startIndex, hintLines, hintStartTime };
};
