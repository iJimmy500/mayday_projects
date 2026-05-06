import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JSON_FILE = path.join(__dirname, '../data/onehitwonders.json');
const CSV_FILE = path.join(__dirname, '../../public/artifacts/one_hit_wonders_1970s_onwards.csv');

function normalize(str) {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function getYoutubeId(query) {
  try {
    const encodedQuery = encodeURIComponent(query);
    // Using an Invidious instance API for search to avoid direct YouTube rate limits
    const res = await fetch(`https://iv.melmac.space/api/v1/search?q=${encodedQuery}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const results = await res.json();
    
    // Invidious returns an array of results. We want the first video.
    const video = results.find(item => item.type === 'video');
    return video ? video.videoId : null;
  } catch (err) {
    console.error(`Error searching for ${query}:`, err.message);
    return null;
  }
}

async function processSongs() {
  const jsonData = JSON.parse(fs.readFileSync(JSON_FILE, 'utf8'));
  const csvContent = fs.readFileSync(CSV_FILE, 'utf8');
  const csvRecords = parse(csvContent, {
    columns: true,
    skip_empty_lines: true
  });

  const existingMap = new Map();
  jsonData.forEach(s => {
    existingMap.set(normalize(s.artist) + '|' + normalize(s.title), s);
  });

  const songsToAdd = [];
  const addedInThisBatch = new Set();
  
  // Track counts per decade for thinning
  const incomingCounts = { '70s': 0, '80s': 0, '2000s': 0 };

  csvRecords.forEach(record => {
    const key = normalize(record.artist) + '|' + normalize(record.song);
    const year = parseInt(record.year);
    
    if (!existingMap.has(key) && !addedInThisBatch.has(key)) {
      // Thinning logic:
      if (year >= 1970 && year < 1980) {
        if (incomingCounts['70s'] % 2 === 0) {
          songsToAdd.push(record);
          addedInThisBatch.add(key);
        }
        incomingCounts['70s']++;
      } else if (year >= 1980 && year < 1990) {
        if (incomingCounts['80s'] % 2 === 0) {
          songsToAdd.push(record);
          addedInThisBatch.add(key);
        }
        incomingCounts['80s']++;
      } else if (year >= 2000 && year < 2010) {
        if (incomingCounts['2000s'] % 8 !== 0) {
          songsToAdd.push(record);
          addedInThisBatch.add(key);
        }
        incomingCounts['2000s']++;
      } else {
        songsToAdd.push(record);
        addedInThisBatch.add(key);
      }
    }
  });

  console.log(`Found ${songsToAdd.length} new songs to process.`);

  const finalSongs = [...jsonData];
  
  // To avoid hitting rate limits or taking too long in one go, 
  // we'll process them and save frequently.
  // We'll also only do a chunk if it's too many, but let's try to do as many as we can.
  
  console.log(`Processing all ${songsToAdd.length} new songs...`);

  let errorCount = 0;
  for (let i = 0; i < songsToAdd.length; i++) {
    const song = songsToAdd[i];
    const query = `${song.song} ${song.artist} official audio`;
    console.log(`[${i + 1}/${songsToAdd.length}] Searching: ${query}`);
    
    const id = await getYoutubeId(query);
    if (id) {
      finalSongs.push({
        id,
        title: song.song,
        artist: song.artist,
        year: parseInt(song.year),
        album: `${song.decade} One Hit Wonder`,
        playlists: ["Added via CSV"]
      });
      errorCount = 0; // Reset error count on success
    } else {
      console.log(`Could not find ID for ${query}`);
      errorCount++;
    }

    if (errorCount > 20) {
      console.log("Too many consecutive errors. Stopping to avoid rate limits.");
      break;
    }

    // Save every 10 songs
    if ((i + 1) % 10 === 0) {
      sortAndSave(finalSongs);
      console.log(`Progress saved at ${i + 1} songs.`);
    }

    // Larger delay to be safe
    await new Promise(r => setTimeout(r, 1000));
  }

  sortAndSave(finalSongs);
  console.log(`Final update: Saved ${finalSongs.length} songs to ${JSON_FILE}.`);
}

function sortAndSave(songs) {
  // Sort: Year DESC, Artist ASC, Title ASC
  songs.sort((a, b) => {
    if (b.year !== a.year) return b.year - a.year;
    const artistA = (a.artist || '').toLowerCase();
    const artistB = (b.artist || '').toLowerCase();
    if (artistA < artistB) return -1;
    if (artistA > artistB) return 1;
    const titleA = (a.title || '').toLowerCase();
    const titleB = (b.title || '').toLowerCase();
    return titleA.localeCompare(titleB);
  });

  fs.writeFileSync(JSON_FILE, JSON.stringify(songs, null, 2));
}

processSongs();
