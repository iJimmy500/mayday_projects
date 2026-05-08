const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const MANIFEST_PATHS = [
  path.join(DATA_DIR, 'manifest.json'),
  path.join(__dirname, '..', '..', 'images', 'manifest.json')
];
const PINTEREST_CSV = path.join(DATA_DIR, 'pinterest-com-2026-05-08.csv');

function deepRestore() {
  console.log('--- STARTING MANIFEST HEAL & DUAL-LINK ENRICHMENT ---');
  
  if (!fs.existsSync(MANIFEST_PATHS[0])) {
    console.error('ERROR: Source manifest missing!');
    return;
  }

  // 1. Build Source Maps
  const pinterestMap = {};
  if (fs.existsSync(PINTEREST_CSV)) {
    const csvData = fs.readFileSync(PINTEREST_CSV, 'utf8');
    const lines = csvData.split('\n');
    lines.forEach((line) => {
      const parts = line.split('","').map(p => p.replace(/"/g, ''));
      if (parts.length >= 13) {
        const id = parts[0] ? parts[0].trim() : '';
        const landingPage = parts[1] ? parts[1].trim() : '';
        const directLink = parts[12] ? parts[12].trim() : '';
        
        if (id && directLink.startsWith('http')) {
          pinterestMap[id] = {
            post: landingPage,
            image: directLink
          };
        }
      }
    });
  }

  const jsonSources = {};
  const dataFiles = fs.readdirSync(DATA_DIR);
  dataFiles.forEach(file => {
    if (file.endsWith('.json') && file !== 'manifest.json' && !file.includes('quiz') && !file.includes('onehit')) {
      try {
        const content = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
        const sourceUrl = content.data?.metadata?.sourceURL || content.data?.metadata?.ogUrl || content.data?.metadata?.url;
        const sourceBase = file.split('_')[0].toLowerCase();
        if (sourceUrl) {
          jsonSources[sourceBase] = sourceUrl;
        }
      } catch (e) {}
    }
  });

  // 2. Load and Heal Manifest
  let manifest = JSON.parse(fs.readFileSync(MANIFEST_PATHS[0], 'utf8'));
  let pinterestCount = 0;

  const updatedManifest = manifest.map(entry => {
    const healedEntry = { ...entry };

    // Dual-Link Pinterest Logic
    if (healedEntry.filename.startsWith('pinterest_')) {
      const pIdMatch = healedEntry.filename.match(/pinterest_(\d+)(_|.)/);
      if (pIdMatch) {
        const csvId = `1778266532-${pIdMatch[1]}`;
        if (pinterestMap[csvId]) {
          healedEntry.origin_page = pinterestMap[csvId].post; // Landing Page
          healedEntry.direct_url = pinterestMap[csvId].image; // Raw Image
          pinterestCount++;
        }
      }
    } 
    // Fix others
    else if (healedEntry.origin_page === 'Unknown' || !healedEntry.origin_page) {
      const sourceBase = healedEntry.filename.split('_')[0].toLowerCase();
      if (jsonSources[sourceBase]) {
        healedEntry.origin_page = jsonSources[sourceBase];
      }
    }

    // Cleanup photographer
    const p = healedEntry.photographer;
    if (p === 'Rockstar Games' || p === 'Community Artist' || !p || p.toLowerCase().includes('landscape from')) {
      delete healedEntry.photographer;
    }

    return healedEntry;
  });

  // 3. Sync BOTH manifests
  MANIFEST_PATHS.forEach(mPath => {
    fs.writeFileSync(mPath, JSON.stringify(updatedManifest, null, 2));
    console.log(`✅ Synced: ${path.basename(mPath)}`);
  });

  console.log(`\nEnrichment Complete! Capturing dual-links for ${pinterestCount} Pinterest assets.`);
}

deepRestore();
