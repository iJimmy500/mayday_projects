import axios from 'axios';
import * as cheerio from 'cheerio';
import ytSearch from 'yt-search';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_FILE = path.join(__dirname, '../data/onehitwonders.json');

async function getYoutubeId(query) {
  try {
    const r = await ytSearch(query);
    const video = r.videos[0];
    return video ? video.videoId : null;
  } catch (err) {
    console.error(`Error searching for ${query}:`, err.message);
    return null;
  }
}

async function scrapeWaterloo() {
  console.log('Scraping Waterloo list for One Hit Wonders...');
  const url = 'https://cs.uwaterloo.ca/~dtompkin/music/list/Best14.html';
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  
  const songs = [];
  
  // The Waterloo page lists songs as a series of <a> tags inside the body
  // Structure: Artist -> Title -> BPM -> Year -> Genre -> Disc -> Details
  const links = $('a').toArray();
  
  for (let i = 0; i < links.length; i++) {
    const text = $(links[i]).text().trim();
    const href = $(links[i]).attr('href') || '';
    
    // Artists usually have /artist/ in their link
    if (href.includes('/artist/')) {
      const artist = text;
      const titleLink = links[i + 1];
      const yearLink = links[i + 3];
      
      if (titleLink && yearLink) {
        const title = $(titleLink).text().trim();
        const year = parseInt($(yearLink).text().trim()) || 0;
        
        if (artist && title && year > 1900) {
          songs.push({ artist, title, year, album: 'One Hit Wonder' });
          // Skip ahead to the next artist
          i += 6; 
        }
      }
    }
  }

  console.log(`Found ${songs.length} songs. Fetching YouTube IDs for the first 50...`);
  
  const finalSongs = [];
  const limit = 50;
  for (let i = 0; i < Math.min(songs.length, limit); i++) {
    const song = songs[i];
    console.log(`[${i+1}/${limit}] Searching for: ${song.title} by ${song.artist}`);
    const id = await getYoutubeId(`${song.title} ${song.artist} official audio`);
    if (id) {
      finalSongs.push({
        id,
        title: song.title,
        artist: song.artist,
        year: song.year,
        album: song.album
      });
    }
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  return finalSongs;
}

async function run() {
  try {
    const songs = await scrapeWaterloo();
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(songs, null, 2));
    console.log(`Successfully saved ${songs.length} songs to ${OUTPUT_FILE}`);
  } catch (err) {
    console.error('Scraper failed:', err);
  }
}

run();
