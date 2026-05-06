import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JSON_FILE = path.join(__dirname, '../data/onehitwonders.json');
const CSV_FILE = path.join(__dirname, '../../public/artifacts/one_hit_wonders_1970s_onwards.csv');

function normalize(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function analyze() {
  const jsonData = JSON.parse(fs.readFileSync(JSON_FILE, 'utf8'));
  const csvContent = fs.readFileSync(CSV_FILE, 'utf8');
  const csvRecords = parse(csvContent, {
    columns: true,
    skip_empty_lines: true
  });

  const existingMap = new Set();
  jsonData.forEach(s => {
    existingMap.add(normalize(s.artist) + '|' + normalize(s.title));
  });

  let newSongsCount = 0;
  const newSongs = [];

  csvRecords.forEach(record => {
    const key = normalize(record.artist) + '|' + normalize(record.song);
    if (!existingMap.has(key)) {
      newSongsCount++;
      newSongs.push(record);
    }
  });

  console.log(`Total songs in JSON: ${jsonData.length}`);
  console.log(`Total songs in CSV: ${csvRecords.length}`);
  console.log(`New songs to add: ${newSongsCount}`);
  
  if (newSongs.length > 0) {
    console.log('Sample new songs:');
    console.log(newSongs.slice(0, 5));
  }
}

analyze();
