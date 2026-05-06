import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE_PATH = path.join(__dirname, '../data/onehitwonders.json');

function normalize(str) {
  if (!str) return "";
  return str.toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/feat\..*$/g, '')
    .replace(/ft\..*$/g, '')
    .trim();
}

function audit() {
  const data = JSON.parse(fs.readFileSync(FILE_PATH, 'utf8'));
  const originalCount = data.length;
  
  // 1. Remove duplicates and merge playlists
  const uniqueSongs = [];
  const duplicates = [];

  for (const song of data) {
    const normTitle = normalize(song.title);
    const normArtist = normalize(song.artist);

    const existing = uniqueSongs.find(s => 
      normalize(s.title) === normTitle && 
      normalize(s.artist) === normArtist
    );

    if (existing) {
      // Merge playlists
      if (song.playlists) {
        song.playlists.forEach(p => {
          if (!existing.playlists.includes(p)) existing.playlists.push(p);
        });
      }
      duplicates.push(song);
    } else {
      uniqueSongs.push(song);
    }
  }

  // 2. Remove songs without IDs or empty titles
  const validSongs = uniqueSongs.filter(s => s.id && s.title && s.artist);
  const invalidCount = uniqueSongs.length - validSongs.length;

  // 3. Sort by year (descending)
  validSongs.sort((a, b) => (b.year || 0) - (a.year || 0));

  fs.writeFileSync(FILE_PATH, JSON.stringify(validSongs, null, 2));

  console.log(`--- Library Audit Complete ---`);
  console.log(`Original Songs: ${originalCount}`);
  console.log(`Duplicates Removed: ${duplicates.length}`);
  console.log(`Invalid Songs Removed: ${invalidCount}`);
  console.log(`Final Cleaned Songs: ${validSongs.length}`);
}

audit();
