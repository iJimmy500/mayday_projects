import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JSON_FILE = path.join(__dirname, '../data/onehitwonders.json');

function prune() {
  const data = JSON.parse(fs.readFileSync(JSON_FILE, 'utf8'));
  const countsBefore = { '70s': 0, '80s': 0, '2000s': 0, total: data.length };
  
  // Track indices to keep
  let indicesToKeep = [];
  
  // Counters for pruning
  let count70s = 0;
  let count80s = 0;
  let count2000s = 0;

  data.forEach((song, index) => {
    const year = song.year;
    if (year >= 1970 && year < 1980) {
      countsBefore['70s']++;
      // Cut in half: Keep every 2nd
      if (count70s % 2 === 0) indicesToKeep.push(index);
      count70s++;
    } else if (year >= 1980 && year < 1990) {
      countsBefore['80s']++;
      // Cut in half: Keep every 2nd
      if (count80s % 2 === 0) indicesToKeep.push(index);
      count80s++;
    } else if (year >= 2000 && year < 2010) {
      countsBefore['2000s']++;
      // Semi quarter (1/8) cut means keep 7/8
      if (count2000s % 8 !== 0) indicesToKeep.push(index);
      count2000s++;
    } else {
      // Keep everything else (90s, 2010s, 2020s)
      indicesToKeep.push(index);
    }
  });

  const newData = indicesToKeep.map(idx => data[idx]);
  
  fs.writeFileSync(JSON_FILE, JSON.stringify(newData, null, 2));
  
  console.log('Pruning Complete:');
  console.log(`- 1970s: ${countsBefore['70s']} -> ${count70s - Math.floor(count70s/2)}`);
  console.log(`- 1980s: ${countsBefore['80s']} -> ${count80s - Math.floor(count80s/2)}`);
  console.log(`- 2000s: ${countsBefore['2000s']} -> ${Math.floor(count2000s * 7/8)}`);
  console.log(`Total: ${data.length} -> ${newData.length}`);
}

prune();
