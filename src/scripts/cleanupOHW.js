import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE_PATH = path.join(__dirname, '../data/onehitwonders.json');

function normalize(str) {
  return str.toLowerCase()
    .replace(/\(.*?\)/g, '') // Remove everything in parentheses (remasters, feats, etc)
    .replace(/\[.*?\]/g, '') // Remove everything in brackets
    .replace(/feat\..*$/g, '') // Remove feat...
    .replace(/ft\..*$/g, '')
    .trim();
}

function run() {
  const data = JSON.parse(fs.readFileSync(FILE_PATH, 'utf8'));
  const cleaned = [];

  for (const song of data) {
    // Initialize playlists if missing
    if (!song.playlists) {
      song.playlists = ['VH1'];
    }

    const normTitle = normalize(song.title);
    const normArtist = normalize(song.artist);

    const existing = cleaned.find(s => 
      normalize(s.title) === normTitle && 
      normalize(s.artist) === normArtist
    );

    if (existing) {
      // Merge playlists
      song.playlists.forEach(p => {
        if (!existing.playlists.includes(p)) existing.playlists.push(p);
      });
      // Keep the "cleaner" title/artist if possible
      if (song.title.length < existing.title.length) {
        existing.title = song.title;
      }
    } else {
      cleaned.push(song);
    }
  }

  fs.writeFileSync(FILE_PATH, JSON.stringify(cleaned, null, 2));
  console.log(`Cleaned up library. Total songs: ${cleaned.length}`);
}

run();
