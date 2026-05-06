import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';
import ytSearch from 'yt-search';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_FILE = path.join(__dirname, '../data/onehitwonders.json');
const SYNC_STATUS_FILE = path.join(__dirname, '../data/sync_status.json');
const APPLE_CSV = path.join(__dirname, '../../public/artifacts/music-apple-com-2026-05-06.csv');
const WATERLOO_CSV = path.join(__dirname, '../../public/artifacts/cs-uwaterloo-ca-2026-05-06.csv');

async function getYoutubeId(query, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const r = await ytSearch(query);
      const video = r.videos[0];
      return video ? video.videoId : null;
    } catch (err) {
      console.error(`Error searching for ${query} (Attempt ${i+1}/${retries}):`, err.message);
      await new Promise(r => setTimeout(r, 2000 * (i + 1))); // Wait longer each time
    }
  }
  return null;
}

function parseAppleCSV() {
  const content = fs.readFileSync(APPLE_CSV, 'utf8');
  const records = parse(content, { columns: true, skip_empty_lines: true });
  return records.map(r => {
    const title = r.name || r.name2;
    const artist = r.data3 || r.data5; // Adjusting based on inspection
    const album = r.data4;
    if (!title || !artist) return null;
    return { title: title.trim(), artist: artist.trim(), album: album.trim(), playlist: 'Apple Music' };
  }).filter(Boolean);
}

function parseWaterlooCSV() {
  const content = fs.readFileSync(WATERLOO_CSV, 'utf8');
  const records = parse(content, { columns: true, skip_empty_lines: true });
  return records.map(r => {
    const artist = r.data8 || r.data;
    const title = r.data9 || r.data2;
    const year = parseInt(r.data4);
    if (!title || !artist) return null;
    return { title: title.trim(), artist: artist.trim(), year, playlist: 'Waterloo' };
  }).filter(Boolean);
}

function normalize(str) {
  return str.toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/feat\..*$/g, '')
    .replace(/ft\..*$/g, '')
    .trim();
}

async function run() {
  const existingSongs = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
  const appleSongs = parseAppleCSV();
  const waterlooSongs = parseWaterlooCSV();

  const allSourceSongs = [...waterlooSongs, ...appleSongs];
  const finalSongs = [...existingSongs];

  console.log(`Checking ${allSourceSongs.length} songs from CSVs...`);

  for (let i = 0; i < allSourceSongs.length; i++) {
    const s = allSourceSongs[i];
    const normTitle = normalize(s.title);
    const normArtist = normalize(s.artist);

    const exists = finalSongs.find(fs => 
      normalize(fs.title) === normTitle && 
      normalize(fs.artist) === normArtist
    );

    if (exists) {
      if (!exists.playlists) exists.playlists = ['VH1'];
      if (!exists.playlists.includes(s.playlist)) exists.playlists.push(s.playlist);
      continue;
    }

    console.log(`[${i+1}/${allSourceSongs.length}] New song: ${s.title} by ${s.artist} (${s.playlist})`);
    fs.writeFileSync(SYNC_STATUS_FILE, JSON.stringify({ title: s.title, artist: s.artist, current: i + 1, total: allSourceSongs.length }));
    
    const id = await getYoutubeId(`${s.title} ${s.artist} official audio`);
    if (id) {
      finalSongs.push({
        id,
        title: s.title,
        artist: s.artist,
        year: s.year || 2000,
        playlists: [s.playlist]
      });
    }

    if (i % 10 === 0) {
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalSongs, null, 2));
    }
    await new Promise(r => setTimeout(r, 1000));
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalSongs, null, 2));
  fs.writeFileSync(SYNC_STATUS_FILE, JSON.stringify({ done: true }));
  console.log('Done!');
}

run();
