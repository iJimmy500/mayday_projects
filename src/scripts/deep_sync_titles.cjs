const fs = require('fs');
const path = require('path');

const MANIFEST_PATH = path.join(__dirname, '..', 'data', 'manifest.json');
const PINTEREST_CSV = path.join(__dirname, '..', 'data', 'pinterest-com-2026-05-08.csv');

function parseCSV(csvContent) {
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',');
  return lines.slice(1).map(line => {
    // Simple CSV parser for quoted strings
    const parts = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
    return parts.map(p => p.replace(/^"|"$/g, ''));
  });
}

function deepSync() {
  console.log('--- STARTING DEEP-SYNC ENRICHMENT ---');
  
  if (!fs.existsSync(MANIFEST_PATH) || !fs.existsSync(PINTEREST_CSV)) {
    console.error('ERROR: Missing manifest or CSV!');
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const pinterestData = parseCSV(fs.readFileSync(PINTEREST_CSV, 'utf8'));

  console.log(`Analyzing ${manifest.length} images against ${pinterestData.length} source records...`);

  let count = 0;
  manifest.forEach((entry) => {
    if (entry.source_name === 'PINTEREST') {
      // Extract the index from the filename (e.g., pinterest_42.jpg -> 42)
      const match = entry.filename.match(/pinterest_(\d+)/);
      if (match) {
        const idx = parseInt(match[1]) - 1; // CSV is 1-indexed in filenames
        if (pinterestData[idx]) {
          const row = pinterestData[idx];
          // Try to find the best title in the CSV (data9 is often the most descriptive)
          let bestTitle = row[11] || row[2] || row[3] || row[4];
          
          if (bestTitle && bestTitle.length > 5 && !bestTitle.includes('http')) {
            // Clean up the title
            bestTitle = bestTitle.replace(/Rdr2|RDR2|Red Dead Redemption 2/gi, '').trim();
            bestTitle = bestTitle.replace(/^\/|\/$/g, '').trim();
            bestTitle = bestTitle.charAt(0).toUpperCase() + bestTitle.slice(1);
            
            if (bestTitle.length > 3) {
              entry.title = bestTitle;
              count++;
            }
          }
        }
      }
    }
    
    // Fallback for others: clean up the filename if it's still generic
    if (entry.title.includes('Landscape from') || entry.title === 'Landscape') {
       let clean = entry.filename.split('.')[0]
         .replace(/_/g, ' ')
         .replace(/\d+/g, '')
         .trim();
       entry.title = clean.charAt(0).toUpperCase() + clean.slice(1);
    }
  });

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`✅ SUCCESS! Deep-Synced ${count} Pinterest titles from original source.`);
  console.log('Check your gallery now—it should look much more authentic!');
}

deepSync();
