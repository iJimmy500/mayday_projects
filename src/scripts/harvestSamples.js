const yts = require('yt-search');
const fs = require('fs');
const path = require('path');

/**
 * Add famous samples manually or via AI knowledge here
 * Format: { song: "", artist: "", sampleSong: "", sampleArtist: "", correctTime: 0, sampleStartTime: 0 }
 */
const newDiscoveries = [
  {
    song: "Toxic",
    artist: "Britney Spears",
    sampleSong: "Tere Mere Beech Mein",
    sampleArtist: "Lata Mangeshkar",
    correctTime: 0,
    sampleStartTime: 4
  },
  {
    song: "Hung Up",
    artist: "Madonna",
    sampleSong: "Gimme! Gimme! Gimme! (A Man After Midnight)",
    sampleArtist: "ABBA",
    correctTime: 0,
    sampleStartTime: 0
  },
  {
    song: "Crazy in Love",
    artist: "Beyoncé",
    sampleSong: "Are You My Woman? (Tell Me So)",
    sampleArtist: "The Chi-Lites",
    correctTime: 0,
    sampleStartTime: 0
  }
];

async function harvest() {
  console.log("🚀 Starting Sample Harvest...");
  const results = [];

  for (const item of newDiscoveries) {
    try {
      console.log(`🔍 Searching for: ${item.song} & ${item.sampleSong}...`);
      
      const songSearch = await yts(`${item.artist} ${item.song} official audio`);
      const sampleSearch = await yts(`${item.sampleArtist} ${item.sampleSong} original`);

      if (songSearch.videos.length > 0 && sampleSearch.videos.length > 0) {
        results.push({
          id: item.song.toLowerCase().replace(/ /g, '-'),
          sample: {
            name: item.sampleSong,
            artist: item.sampleArtist,
            youtubeId: sampleSearch.videos[0].videoId,
            startTime: item.sampleStartTime,
            duration: 15
          },
          song: {
            name: item.song,
            artist: item.artist,
            youtubeId: songSearch.videos[0].videoId,
            correctTime: item.correctTime
          }
        });
        console.log(`✅ Found videos for ${item.song}`);
      }
    } catch (err) {
      console.error(`❌ Error harvesting ${item.song}:`, err);
    }
  }

  const outputPath = path.join(__dirname, '../data/samples.json');
  const existingData = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
  const combined = [...existingData, ...results];
  
  // Remove duplicates by ID
  const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());

  fs.writeFileSync(outputPath, JSON.stringify(unique, null, 2));
  console.log(`\n🎉 Harvest Complete! Added ${results.length} new samples to samples.json`);
}

harvest();
