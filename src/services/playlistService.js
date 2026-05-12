import axios from 'axios';
import { fetchITunesJSONP } from '../utils/itunesJSONP';

export const fetchArtistPlaylistData = async (artistName) => {
  if (!artistName || !artistName.trim()) return null;

  const artistSearch = await fetchITunesJSONP(`https://itunes.apple.com/search?term=${encodeURIComponent(artistName)}&entity=musicArtist&limit=1`);
  const artist = artistSearch.data.results?.[0];
  
  let songs = [];
  let finalArtistInfo = null;

  if (artist && artist.artistName.toLowerCase() === artistName.toLowerCase()) {
    const lookup = await fetchITunesJSONP(`https://itunes.apple.com/lookup?id=${artist.artistId}&entity=song&limit=50`);
    if (lookup.data.results) {
      const filtered = lookup.data.results.filter(r => r.wrapperType === 'track');
      songs = filtered.map(s => ({
        track: s.trackName,
        artist: s.artistName,
        youtubeId: null
      })).sort(() => Math.random() - 0.5);
      
      finalArtistInfo = {
        name: artist.artistName,
        count: songs.length,
        type: 'artist',
        url: artist.artistLinkUrl || artist.artistViewUrl
      };
    }
  }

  if (songs.length === 0) {
    const { data } = await fetchITunesJSONP(`https://itunes.apple.com/search?term=${encodeURIComponent(artistName)}&entity=song&limit=50&attribute=artistTerm`);
    if (data.results && data.results.length > 0) {
      songs = data.results.map(s => ({
        track: s.trackName,
        artist: s.artistName,
        youtubeId: null
      })).sort(() => Math.random() - 0.5);
      
      finalArtistInfo = { 
        name: data.results[0].artistName, 
        count: songs.length,
        type: 'artist',
        url: data.results[0].artistViewUrl 
      };
    }
  }

  return songs.length > 0 ? { songs, artistInfo: finalArtistInfo } : null;
};

export const fetchGenrePlaylistData = async (genre) => {
  const randomOffset = Math.floor(Math.random() * 50);
  const { data } = await fetchITunesJSONP(`https://itunes.apple.com/search?term=${encodeURIComponent(genre)}&entity=song&limit=100&offset=${randomOffset}`);
  
  if (data.results && data.results.length > 0) {
    const songs = data.results.map(s => ({
      track: s.trackName,
      artist: s.artistName,
      youtubeId: null
    })).sort(() => Math.random() - 0.5);

    return { 
      songs, 
      playlistInfo: { name: genre, count: songs.length, type: 'genre' } 
    };
  }
  return null;
};

export const parsePlaylistUrlData = async (url) => {
  let content = url;
  let playlistName = "Imported List";

  if (url.startsWith('http') && (url.endsWith('.txt') || url.includes('raw.githubusercontent.com') || url.includes('gist.githubusercontent.com'))) {
    const response = await axios.get(url);
    content = response.data;
    playlistName = url.split('/').pop().replace('.txt', '').replace(/[-_]/g, ' ').toUpperCase();
  }

  const lines = content.split('\n').filter(l => l.trim().length > 3);
  const songs = lines.map(line => {
    const cleanLine = line.replace(/^\d+[\s.)]*/, '').trim();
    const parts = cleanLine.split(/\s*[-–—|:]\s*/);
    if (parts.length >= 2) {
      return { track: parts[1].trim(), artist: parts[0].trim() };
    }
    return null;
  }).filter(Boolean);

  if (songs.length > 0) {
    const shuffled = songs.sort(() => Math.random() - 0.5);
    return {
      songs: shuffled,
      playlistInfo: { name: playlistName, type: 'Imported' }
    };
  }
  return null;
};
