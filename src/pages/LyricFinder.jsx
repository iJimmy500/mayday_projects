import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Search, RefreshCw, Flower, Clipboard } from 'lucide-react';
import famousSongs from '../data/famousSongs.json';
import SearchHub from '../components/lyric-finder/SearchHub';
import ControlBar from '../components/lyric-finder/ControlBar';
import LyricView from '../components/lyric-finder/LyricView';
import DashboardModal from '../components/lyric-finder/DashboardModal';
import SyncPlayer from '../components/lyric-finder/SyncPlayer';
import './LyricFinder.css';

const fetchITunesJSONP = (url) => {
  return new Promise((resolve, reject) => {
    const callbackName = 'itunes_callback_' + Math.round(100000 * Math.random());
    window[callbackName] = (data) => {
      delete window[callbackName];
      document.body.removeChild(script);
      resolve({ data });
    };

    const script = document.createElement('script');
    script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + callbackName;
    script.onerror = (err) => {
      delete window[callbackName];
      document.body.removeChild(script);
      reject(err);
    };
    document.body.appendChild(script);
  });
};

export default function LyricFinder({ artistName, isGlobal }) {
  const [currentSong, setCurrentSong] = useState(null);
  const [lyrics, setLyrics] = useState('');
  const [snippet, setSnippet] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const [albumArt, setAlbumArt] = useState('');
  const [prevAlbumArt, setPrevAlbumArt] = useState('');
  const masteredIds = useRef(new Set());
  const [guess, setGuess] = useState({ title: '', artist: '' });
  const [gameState, setGameState] = useState('playing'); // 'playing', 'correct', 'failed'
  const [trackUrl, setTrackUrl] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [parsedLyrics, setParsedLyrics] = useState([]);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [startIndex, setStartIndex] = useState(0);
  const [history, setHistory] = useState([]);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [currentGuesses, setCurrentGuesses] = useState([]);
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('lyric_game_settings');
    return saved ? JSON.parse(saved) : { mode: 'both', hintDepth: 1, muted: false, strictMode: false };
  });
  const [showHistory, setShowHistory] = useState(false);
  const [showRoundGuesses, setShowRoundGuesses] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLandingState, setIsLandingState] = useState(false);
  const [customPlaylist, setCustomPlaylist] = useState([]);
  const playlistRef = useRef([]);
  const [playlistInfo, setPlaylistInfo] = useState(null);
  const [artistImage, setArtistImage] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [isCrashed, setIsCrashed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isYoutubeLoading, setIsYoutubeLoading] = useState(false);

  const isRoundStarting = useRef(false);
  const lastRequestId = useRef(0);

  useEffect(() => {
    console.log("[Flow] 🏗️ LyricFinder Mounted");
    return () => console.log("[Flow] 🏚️ LyricFinder Unmounted");
  }, []);

  useEffect(() => {
    localStorage.setItem('lyric_game_settings', JSON.stringify(settings));
  }, [settings]);

  const syncUrl = useCallback((id, type) => {
    const base = window.location.pathname.split('/')[1] || 'day11';
    let newPath = `/${base}`;
    if (type === 'genre') newPath += `/genre/${encodeURIComponent(id)}`;
    else if (type === 'mixtape') newPath += `/mixtape/${encodeURIComponent(id)}`;
    else if (type === 'custom') newPath += `/custom?source=${encodeURIComponent(id)}`;
    else if (type === 'global') newPath += `/globalsongs`;
    else if (type === 'artist') newPath += `/artist/${encodeURIComponent(id)}`;
    else if (id) newPath += `/${encodeURIComponent(id)}`;
    
    window.history.replaceState(null, '', newPath);
  }, []);

  const activeArtRequest = useRef(null);
  const playerRef = useRef(null);

  const handleTimeUpdate = useCallback((state) => {
    setCurrentTime(state.playedSeconds);
  }, []);
  const fetchAlbumArt = useCallback(async (artist, track, ytId, rid) => {
    activeArtRequest.current = rid;

    const cleanTerm = (str) => str.replace(/\(.*\)/g, '').replace(/feat\..*/gi, '').replace(/ft\..*/gi, '').trim();
    const query = `${cleanTerm(artist)} ${cleanTerm(track)}`;
    
    try {
      console.log(`[Flow] 🎨 Fetching Art...`);
      const { data } = await fetchITunesJSONP(`https://itunes.apple.com/search?term=${encodeURIComponent(artist + ' ' + track)}&entity=musicTrack&limit=1`);
      if (rid !== lastRequestId.current) return;

      if (data.results && data.results[0]) {
        const trackData = data.results[0];
        const art = trackData.artworkUrl100.replace('100x100bb', '1000x1000bb');
        setAlbumArt(art);
        setTrackUrl(trackData.trackViewUrl);
        setCurrentSong(prev => prev ? { ...prev, previewUrl: trackData.previewUrl } : prev);
        console.log(`[Flow] ✅ Art Loaded`);
      } else {
        console.warn(`[Flow] ⚠️ No art found for ${artist} - ${track}`);
      }
    } catch (err) {
      console.error("[Flow] ❌ Art fetch failed", err);
    }
  }, []);

  const fetchAudioStream = useCallback(async (song, rid) => {
    // Synced playback disabled as per request
    setIsYoutubeLoading(false);
  }, []);

  const activeLyricsRequest = useRef(null);
  const fetchLyrics = useCallback(async (randomSong, rid) => {
    if (!randomSong || !rid) return;
    activeLyricsRequest.current = rid;
    console.log(`[Flow] 📝 Fetching Lyrics...`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const { data } = await axios.get(
        `https://lrclib.net/api/search?artist_name=${encodeURIComponent(randomSong.artist)}&track_name=${encodeURIComponent(randomSong.track)}`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);
      if (rid !== lastRequestId.current) return;

      if (data && data.length > 0) {
        console.log(`[Flow] ✅ Lyrics Loaded`);
        const synced = data[0].syncedLyrics;
        const plain = data[0].plainLyrics;
        
        const cleanLrc = (l) => l ? l.replace(/\[\d+:\d+(?:\.\d+)?\]/g, '').trim() : '';
        const fullLyrics = plain || cleanLrc(synced);

        // Guard: skip if lyrics are essentially empty
        const usableLines = fullLyrics.split('\n').filter(l => l.trim().length > 5);
        if (usableLines.length < 3) {
          handleLyricsNotFound(rid, randomSong.track, randomSong.artist);
          return;
        }
        
        setLyrics(fullLyrics);
        setStatusMessage('');

        if (synced) {
          const lines = synced.split('\n');
          const timeRegex = /\[(\d+):(\d+(?:\.\d+)?)\]/;
          const timestampGlobalRegex = /\[\d+:\d+(?:\.\d+)?\]/g;

          const parsed = lines.map(line => {
            const match = timeRegex.exec(line);
            if (match) {
              const time = parseInt(match[1]) * 60 + parseFloat(match[2]);
              return { time, text: line.replace(timestampGlobalRegex, '').trim() };
            }
            return null;
          }).filter(l => l && l.text);

          setParsedLyrics(parsed);
        } else {
          setParsedLyrics([]);
        }

        const coreTitle = randomSong.track.toLowerCase()
          .replace(/\(.*\)/g, '')
          .replace(/feat\..*/g, '')
          .replace(/[^a-z0-9\s]/g, '')
          .trim();

        const lines = fullLyrics.split('\n').filter(l => {
          const cleanL = l.toLowerCase().replace(/[^a-z0-9\s]/g, '');
          const isSpoiler = cleanL.includes(coreTitle);
          return l.trim().length > 10 && !isSpoiler;
        });

        if (lines.length > 1) {
          const sIndex = Math.floor(Math.random() * Math.max(1, lines.length - 5));
          setStartIndex(sIndex);
          setSnippet(lines[sIndex]);
        } else {
          const fallbackLines = fullLyrics.split('\n').filter(l => l.trim().length > 10);
          if (fallbackLines.length < 1) {
            handleLyricsNotFound(rid, randomSong.track, randomSong.artist);
            return;
          }
          const sIndex = Math.floor(Math.random() * Math.max(1, fallbackLines.length - 5));
          setStartIndex(sIndex);
          setSnippet(fallbackLines[sIndex]);
        }
        setLoading(false);
      } else {
        handleLyricsNotFound(rid, randomSong.track, randomSong.artist);
      }
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'CanceledError' || err.name === 'AbortError') {
        console.warn(`Lyrics fetch timed out for: "${randomSong.track}"`);
      } else {
        console.error("Failed to fetch lyrics:", err);
      }
      if (rid === lastRequestId.current) handleLyricsNotFound(rid, randomSong.track, randomSong.artist);
    }
  }, []);

  const skipCount = useRef(0);
  const lastSkipTime = useRef(0);

  const startNewRound = useCallback(async (forceGlobal = false, initialPool = null) => {
    if (isRoundStarting.current) {
      return;
    }
    isRoundStarting.current = true;
    // Circuit Breaker: Stop if skipping too fast
    const now = Date.now();
    if (now - lastSkipTime.current < 10000) {
      skipCount.current++;
      if (skipCount.current > 6) {
        console.error("[Flow] 🛑 Circuit Breaker Triggered: Too many skips. Stopping auto-flow.");
        setLoading(false);
        setStatusMessage("System paused due to frequent skips.");
        return;
      }
    } else {
      skipCount.current = 0;
    }
    lastSkipTime.current = now;

    isRoundStarting.current = true;
    const rid = ++lastRequestId.current;
    setLoading(true);
    setIsPlaying(false);
    setIsPlayerReady(false);
    setStatusMessage(''); 
    setGameState('playing');
    setGuess({ title: '', artist: '' });
    setAttempts(0);
    setCurrentGuesses([]);
    setShowRoundGuesses(false);
    setLyrics('');

    if (albumArt) setPrevAlbumArt(albumArt);
    setAlbumArt('');
    setParsedLyrics([]);
    setCurrentTime(0);

    // Safety net: if still loading after 12s, force-skip the song
    const safetyTimer = setTimeout(() => {
      if (rid === lastRequestId.current && lastRequestId.current === rid) {
        console.warn(`[Safety] Song load timed out after 12s. Skipping...`);
        setLoading(false);
      }
    }, 12000);

    if (initialPool) {
      playlistRef.current = initialPool;
      setCustomPlaylist(initialPool);
    }

    let poolToUse = playlistRef.current;
    let randomSong;

    if (forceGlobal) {
      randomSong = famousSongs[Math.floor(Math.random() * famousSongs.length)];
    } else if (poolToUse.length > 0) {
      randomSong = poolToUse[0];
      const nextPool = poolToUse.slice(1);
      playlistRef.current = nextPool;
      setCustomPlaylist(nextPool);
    } else if (playlistInfo) {
      // End of a playlist
      setGameState('congrats');
      setLoading(false);
      isRoundStarting.current = false;
      return;
    } else {
      // Standby - No selection made yet
      setLoading(false);
      setIsLandingState(true);
      isRoundStarting.current = false;
      return;
    }

    if (randomSong) {
      setCurrentSong(randomSong);
      fetchAlbumArt(randomSong.artist, randomSong.track, null, rid);
      fetchLyrics(randomSong, rid);
      fetchAudioStream(randomSong, rid);
    }
    
    setTimeout(() => {
      isRoundStarting.current = false;
    }, 500);
  }, [fetchAlbumArt, fetchLyrics, fetchAudioStream]);


  const handleLyricsNotFound = useCallback((rid, track, artist) => {
    if (rid !== lastRequestId.current) return;
    setStatusMessage('Lyrics not found in LRCLib.');
    setLyrics('Lyrics not found.');
    setLoading(false);
    masteredIds.current.add(track + artist);
    console.warn(`Lyrics missing for: "${track}". Blacklisted and skipping...`);
    
    setTimeout(() => {
      if (rid === lastRequestId.current) {
        console.log(`[Flow] ⏭️ Auto-skipping to next song...`);
        isRoundStarting.current = false; // Reset lock to allow the skip
        startNewRound();
      }
    }, 3000);
  }, [startNewRound]);

  const handleGuess = () => {
    if (!currentSong) return;
    const clean = (str) => {
      if (!str) return '';
      return str
        .normalize("NFD") // Split accents from characters
        .replace(/[\u0300-\u036f]/g, "") // Strip accents
        .toLowerCase()
        .replace(/\(.*\)/g, '')
        .replace(/\[.*\]/g, '')
        .replace(/feat\..*/g, '')
        .replace(/ft\..*/g, '')
        .replace(/[^a-z0-9\s]/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
    };

    const isCloseEnough = (guessStr, targetStr) => {
      const g = clean(guessStr);
      const t = clean(targetStr);
      if (!g) return false;
      if (t === g) return true;
      
      // If strict mode is ON, we only allow exact matches (after cleaning)
      if (settings.strictMode) return false;

      if (t.includes(g) || g.includes(t)) {
        if (g.length > 2) return true;
      }
      const levenshtein = (a, b) => {
        const matrix = Array.from({ length: a.length + 1 }, (_, i) => [i]);
        for (let j = 1; j <= b.length; j++) matrix[0][j] = j;
        for (let i = 1; i <= a.length; i++) {
          for (let j = 1; j <= b.length; j++) {
            matrix[i][j] = a[i - 1] === b[j - 1] 
              ? matrix[i - 1][j - 1] 
              : Math.min(matrix[i - 1][j - 1], matrix[i][j - 1], matrix[i - 1][j]) + 1;
          }
        }
        return matrix[a.length][b.length];
      };
      const distance = levenshtein(g, t);
      const threshold = Math.floor(t.length * 0.25);
      return distance <= Math.max(1, threshold);
    };

    const isTitleCorrect = isCloseEnough(guess.title, currentSong.track);
    const isArtistCorrect = isCloseEnough(guess.artist, currentSong.artist);

    let isWin = false;
    const isArtistMode = playlistInfo?.type === 'artist';

    if (isArtistMode) {
      isWin = isTitleCorrect;
    } else if (settings.mode === 'both') {
      isWin = isTitleCorrect && isArtistCorrect;
    } else if (settings.mode === 'title') {
      isWin = isTitleCorrect;
    } else if (settings.mode === 'artist') {
      isWin = isArtistCorrect;
    }

    if (isWin) {
      setGameState('correct');
      setIsPlaying(true);
      setScore(s => s + 1);
      addToHistory(currentSong, true, currentGuesses);
    } else {
      const newGuess = { ...guess, id: attempts };
      setCurrentGuesses(prev => [...prev, newGuess]);
      setGuess({ title: '', artist: '' });

      if (attempts >= 4) {
        setGameState('failed');
        addToHistory(currentSong, false, [...currentGuesses, newGuess]);
      } else {
        setAttempts(prev => prev + 1);
        const lines = lyrics.split('\n').filter(l => l.trim().length > 10);
        const visibleLines = lines.slice(startIndex, startIndex + attempts + 2);
        setSnippet(visibleLines.join('\n'));
        setGameState('error');
        setTimeout(() => setGameState('playing'), 500);
      }
    }
  };

  const parsePlaylistUrl = useCallback(async (url) => {
    if (!url.trim()) return;
    setLoading(true);
    setIsLandingState(false);
    setIsImporting(false); // Close the box if open
    syncUrl(url, 'custom');
    
    try {
      let content = url;
      let playlistName = "Imported List";

      // Case 1: External File URL (.txt)
      if (url.startsWith('http') && (url.endsWith('.txt') || url.includes('raw.githubusercontent.com') || url.includes('gist.githubusercontent.com'))) {
        setStatusMessage("FETCHING REMOTE ARCHIVE...");
        const response = await axios.get(url);
        content = response.data;
        playlistName = url.split('/').pop().replace('.txt', '').replace(/[-_]/g, ' ').toUpperCase();
      }

      let songs = [];
      
      // Case 2: Music Service Links (Coming Soon)
      if (content.includes('music.apple.com') || content.includes('spotify.com') || content.includes('youtube.com')) {
        setStatusMessage("DIRECT LINK SCRAPING COMING SOON...");
        setTimeout(() => {
          setStatusMessage("");
          setIsLandingState(true);
          setLoading(false);
        }, 3000);
        return;
      } else {
        // Case 3: Raw Text List Parsing
        setStatusMessage("PARSING COLLECTION...");
        const lines = content.split('\n').filter(l => l.trim().length > 3);
        const mappedSongs = lines.map(line => {
          const cleanLine = line.replace(/^\d+[\s.)]*/, '').trim();
          const parts = cleanLine.split(/\s*[-–—|:]\s*/);
          if (parts.length >= 2) {
            return { track: parts[1].trim(), artist: parts[0].trim() };
          }
          return null;
        }).filter(Boolean);
        songs = mappedSongs;
      }

      if (songs.length > 0) {
        const shuffled = songs.sort(() => Math.random() - 0.5);
        setCustomPlaylist(shuffled.slice(1));
        setPlaylistInfo({ name: playlistName, type: 'Imported' });
        const rid = ++lastRequestId.current;
        const firstSong = shuffled[0];
        setCurrentSong(firstSong);
        setGuess({ title: '', artist: '' });
        setAttempts(0);
        setCurrentGuesses([]);
        setLyrics('');
        setAlbumArt('');
        fetchAlbumArt(firstSong.artist, firstSong.track, null, rid);
        fetchLyrics(firstSong, rid);
      } else {
        setStatusMessage("COULD NOT FIND SONGS IN THIS LINK/LIST.");
        setTimeout(() => setStatusMessage(''), 3000);
      }
    } catch (error) {
      console.error("Import failed", error);
      setStatusMessage("IMPORT FAILED. PLEASE TRY ANOTHER LINK.");
    } finally {
      setLoading(false);
    }
  }, [syncUrl, fetchAlbumArt, fetchLyrics]);

  const resetToRandom = useCallback(() => {
    setCustomPlaylist([]);
    setPlaylistInfo(null);
    setArtistImage('');
    const base = window.location.pathname.split('/')[1] || 'day11';
    window.history.replaceState(null, '', `/${base}`);
    startNewRound(true);
  }, [startNewRound]);

  const handleSelectGenre = useCallback(async (genre) => {
    setLoading(true);
    setIsLandingState(false);
    setArtistImage('');
    syncUrl(genre, 'genre');
    try {
      const randomOffset = Math.floor(Math.random() * 150);
      const { data } = await fetchITunesJSONP(`https://itunes.apple.com/search?term=${encodeURIComponent(genre)}&limit=50&entity=song&offset=${randomOffset}`);
      if (data.results) {
        const mapped = data.results.map(r => ({
          track: r.trackName,
          artist: r.artistName,
          album: r.collectionName,
          art: r.artworkUrl100.replace('100x100bb', '600x600bb')
        }));
        const shuffled = mapped.sort(() => Math.random() - 0.5);
        setCustomPlaylist(shuffled);
        setPlaylistInfo({ name: genre, type: 'Genre' });
        startNewRound(false, shuffled);
      }
    } catch (err) {
      console.error("Genre fetch failed", err);
      setLoading(false);
    }
  }, [syncUrl, startNewRound]);

  const handleSelectLocalPlaylist = useCallback(async (id, name) => {
    setLoading(true);
    setIsLandingState(false);
    
    if (id === 'home') {
      resetToRandom();
      return;
    }

    // Handle Global Songs using the imported JSON instead of fetching
    if (id === 'globalsongs') {
      const shuffled = [...famousSongs].sort(() => Math.random() - 0.5);
      setCustomPlaylist(shuffled);
      setPlaylistInfo({ name: 'Global Hits', type: 'Official Mixtape' });
      setArtistImage('');
      startNewRound(false, shuffled);
      syncUrl(id, 'mixtape');
      return;
    }

    syncUrl(id, 'mixtape');
    try {
      const response = await axios.get(`/data/playlists/${id}.json`);
      const data = response.data;
      if (data && data.length > 0) {
        const shuffled = data.sort(() => Math.random() - 0.5);
        setCustomPlaylist(shuffled);
        setPlaylistInfo({ name: name, type: 'Official Mixtape' });
        setArtistImage('');
        startNewRound(false, shuffled);
      }
    } catch (err) {
      console.error("Local playlist fetch failed", err);
      setLoading(false);
    }
  }, [syncUrl, resetToRandom, startNewRound]);

  const fetchGenrePlaylist = useCallback(async (genre) => {
    setLoading(true);
    setIsSearching(false);
    try {
      const randomOffset = Math.floor(Math.random() * 50);
      const { data } = await fetchITunesJSONP(`https://itunes.apple.com/search?term=${encodeURIComponent(genre)}&entity=song&limit=100&offset=${randomOffset}`);
      if (data.results && data.results.length > 0) {
        const songs = data.results.map(s => ({
          track: s.trackName,
          artist: s.artistName,
          youtubeId: null
        })).sort(() => Math.random() - 0.5);
        setCustomPlaylist(songs);
        setPlaylistInfo({ name: genre, count: songs.length, type: 'genre' });
        setArtistImage('');
        startNewRound(false, songs);
      }
    } catch (err) {
      console.error("Genre fetch failed", err);
    } finally {
      setLoading(false);
    }
  }, [fetchAlbumArt, fetchLyrics]);

  const fetchArtistPlaylist = useCallback(async (artistName) => {
    if (!artistName || !artistName.trim()) return;
    setLoading(true);
    setIsSearching(false);
    setIsLandingState(false);
    // Only sync URL if it's actually a different artist path
    const currentPath = window.location.pathname;
    const targetPathPart = encodeURIComponent(artistName);
    if (!currentPath.includes(targetPathPart)) {
      syncUrl(artistName, 'artist');
    }
    try {
      // Phase 1: Resolve Artist ID
      const artistSearch = await fetchITunesJSONP(`https://itunes.apple.com/search?term=${encodeURIComponent(artistName)}&entity=musicArtist&limit=1`);
      const artist = artistSearch.data.results?.[0];
      
      let songs = [];
      let finalArtistInfo = null;

      if (artist && artist.artistName.toLowerCase() === artistName.toLowerCase()) {
        // Phase 2: Definitive Lookup by ID
        const lookup = await fetchITunesJSONP(`https://itunes.apple.com/lookup?id=${artist.artistId}&entity=song&limit=50`);
        if (lookup.data.results) {
          // First item in lookup is usually the artist info itself
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

      // Fallback: If no ID lookup worked or was found
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

      if (songs.length > 0) {
        setCustomPlaylist(songs);
        setPlaylistInfo(finalArtistInfo);
        if (songs[0].art) setArtistImage(songs[0].art); // Optional art if available
        startNewRound(false, songs);
      }
    } catch (error) {
      console.error("Artist lookup failed", error);
      setLoading(false);
    }
  }, [syncUrl, startNewRound]);

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const path = window.location.pathname;
    const parts = path.split('/').filter(p => p.length > 0);
    const params = new URLSearchParams(window.location.search);
    const sourceUrl = params.get('source');
    
    // Format: /day11/custom?source=URL or /day11/genre/Pop etc.
    const isRoot = parts.length <= 1 && !sourceUrl;
    const isGlobalPath = parts.includes('globalsongs');
    
    if (isGlobal || isGlobalPath) {
      startNewRound(true);
      return;
    }

    if (isRoot) {
      if (artistName) {
        fetchArtistPlaylist(artistName);
      } else {
        setIsSearching(true);
        setIsLandingState(true);
        setLoading(false);
        // STANDBY MODE - No song loaded
      }
    } else if (parts.includes('custom') && sourceUrl) {
      parsePlaylistUrl(sourceUrl);
    } else {
      // Deep Link Logic
      const lastPart = parts[parts.length - 1];
      const secondLastPart = parts[parts.length - 2];
      
      if (secondLastPart === 'genre') {
        handleSelectGenre(decodeURIComponent(lastPart));
      } else if (secondLastPart === 'mixtape') {
        handleSelectLocalPlaylist(decodeURIComponent(lastPart), lastPart.replace(/_/g, ' ').toUpperCase());
      } else if (secondLastPart === 'artist') {
        fetchArtistPlaylist(decodeURIComponent(lastPart));
      } else {
        // Assume Artist Name (Legacy Support)
        fetchArtistPlaylist(decodeURIComponent(lastPart));
      }
    }
  }, [artistName, fetchArtistPlaylist, handleSelectGenre, handleSelectLocalPlaylist, parsePlaylistUrl]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Secret crash shortcut: Alt + Shift + C
      if (e.altKey && e.shiftKey && e.key === 'C') {
        setIsCrashed(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const addToHistory = (song, correct, guesses = []) => {
    const newItem = { ...song, correct, art: albumArt, url: trackUrl, timestamp: Date.now(), guesses };
    setHistory(prev => [newItem, ...prev].slice(0, 100));
    setSessionHistory(prev => [newItem, ...prev].slice(0, 50));
  };

  const giveUp = () => {
    setGameState('revealed');
    setIsPlaying(true);
    addToHistory(currentSong, false, currentGuesses);
  };

  const getBackgroundStyle = () => {
    if (gameState === 'correct' || gameState === 'revealed') return { blur: '2px', opacity: 0.15 };
    const blurValue = Math.max(8, 120 - (attempts * 28));
    const opacityValue = Math.max(0.3, 0.8 - (attempts * 0.12));
    return { blur: `${blurValue}px`, opacity: opacityValue };
  };

  const bgStyle = getBackgroundStyle();


  return (
    <div className={`lyric-finder apple-music-style ${loading ? 'am-loading' : ''} ${isSearching ? 'am-searching' : ''}`}>
      <div className="am-background">
        {prevAlbumArt && (
          <div
            className={`am-bg-blur prev ${albumArt ? 'fading' : ''}`}
            style={{ backgroundImage: `url(${prevAlbumArt})`, filter: `blur(${bgStyle.blur}) scale(1.1)` }}
          />
        )}
        {albumArt && (
          <div
            className="am-bg-blur current"
            style={{ backgroundImage: `url(${albumArt})`, filter: `blur(${bgStyle.blur}) scale(1.1)` }}
          />
        )}
      </div>

      <div className="am-bg-overlay" style={{ backgroundColor: `rgba(0, 0, 0, ${bgStyle.opacity})`, transition: 'background-color 1.2s ease' }} />

      <header className="am-top-nav">
        <div className="am-nav-left">
          {playlistInfo && (
            <div className="am-active-playlist-container">
              <a 
                href={playlistInfo.url || '#'} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`am-active-playlist ${artistImage ? 'has-art' : ''}`}
              >
                {artistImage && <img src={artistImage} alt="" className="am-playlist-avatar" />}
                <strong>{playlistInfo.name}</strong>
                <span className="am-playlist-progress">{customPlaylist.length} LEFT</span>
              </a>
            </div>
          )}
        </div>
        <div className="am-nav-right">
          <button className="am-nav-btn" onClick={() => setIsSearching(true)} title="Discovery Hub"><Search size={22} /></button>
        </div>
      </header>

      {isImporting && (
        <div className="am-search-overlay" onClick={() => setIsImporting(false)}>
          <div className="am-search-container am-import-box" onClick={e => e.stopPropagation()}>
            <Clipboard size={24} className="am-search-icon-big" />
            <textarea 
              autoFocus 
              placeholder="Paste Apple Music/Spotify URL or a list of songs (Song - Artist)..." 
              value={importUrl} 
              onChange={e => setImportUrl(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && parsePlaylistUrl(importUrl)} 
            />
            <div className="am-import-actions">
              <button className="am-import-submit" onClick={() => parsePlaylistUrl(importUrl)}>IMPORT</button>
              <button className="am-close-search-inline" onClick={() => setIsImporting(false)}>CANCEL</button>
            </div>
          </div>
        </div>
      )}

      <SearchHub 
        isOpen={isSearching} 
        isLanding={isLandingState} 
        onClose={() => setIsSearching(false)} 
        onSelectArtist={fetchArtistPlaylist} 
        onSelectGenre={handleSelectGenre} 
        onSelectLocal={handleSelectLocalPlaylist} 
        onImport={parsePlaylistUrl} 
      />

      <LyricView 
        lyrics={lyrics} 
        parsedLyrics={parsedLyrics}
        currentTime={currentTime}
        attempts={attempts} 
        startIndex={startIndex} 
        gameState={gameState} 
        loading={loading} 
        settings={settings} 
        statusMessage={statusMessage} 
      />

      {/* SyncPlayer — uses Apple Music 30s preview */}
      <SyncPlayer
        youtubeId={gameState === 'playing' ? currentSong?.youtubeId : null}
        previewUrl={currentSong?.previewUrl}
        isPlaying={isPlaying}
        playerRef={playerRef}
        onTimeUpdate={handleTimeUpdate}
        onReady={() => {
          console.log("[Flow] ✅ SyncPlayer Ready");
          setIsPlayerReady(true);
        }}
        onEnded={() => {
          console.log("[Flow] 🏁 Audio Ended");
          setIsPlaying(false);
        }}
        onError={(e) => {
          console.error("[Flow] ❌ SyncPlayer Error", e);
          setIsPlayerReady(false);
        }}
      />

      <ControlBar 
        gameState={gameState} 
        loading={loading} 
        guess={guess} 
        onGuessChange={setGuess} 
        onGuessSubmit={handleGuess} 
        onSkip={() => giveUp()} 
        onNext={() => startNewRound()} 
        onToggleHistory={() => setShowHistory(!showHistory)}
        onToggleSettings={() => setShowHistory(!showHistory)}
        onToggleGuesses={() => setShowRoundGuesses(!showRoundGuesses)} 
        hasSync={!!(currentSong?.streamUrl || currentSong?.youtubeId || currentSong?.previewUrl)}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        isYoutubeLoading={isYoutubeLoading}
        isPlayerReady={isPlayerReady}
        showHistory={showHistory} 
        showRoundGuesses={showRoundGuesses} 
        settings={settings} 
        playlistInfo={playlistInfo} 
        currentSong={currentSong} 
        albumArt={albumArt} 
        trackUrl={trackUrl} 
        currentGuesses={currentGuesses} 
      />

      <DashboardModal 
        isOpen={showHistory} 
        onClose={() => setShowHistory(false)} 
        history={history} 
        sessionHistory={sessionHistory} 
        settings={settings} 
        setSettings={setSettings} 
        playlistInfo={playlistInfo}
      />

      {gameState === 'congrats' && (
        <div className="am-congrats-overlay">
          <div className="am-congrats-card">

            <h2>PLAYLIST COMPLETE</h2>
            <p>You've mastered the entire <strong>{playlistInfo?.name}</strong> collection!</p>
            <div className="am-congrats-stats">
              <div className="am-stat-item"><span>Final Score</span><strong>{score}</strong></div>
            </div>
            <div className="am-congrats-actions"><button className="am-congrats-btn primary" onClick={resetToRandom}>RETURN HOME</button></div>
          </div>
        </div>
      )}


{isCrashed && (
        <div className="am-crash-overlay">
          <div className="am-crash-content">
            <div className="am-crash-glitch-logo">
              <Flower size={64} strokeWidth={1} className="am-crash-flower" />
            </div>
            <h1 className="am-crash-title">SYSTEM_FAILURE_EXC</h1>
            <p className="am-crash-code">0xMAYDAY_CRITICAL_PROCESS_DIED</p>
            <div className="am-crash-terminal">
              <code>{">"} [CRIT] Audio engine desynced from lyric stream</code>
              <code>{">"} [CRIT] Memory leak detected in .am-bg-blur</code>
              <code>{">"} [WARN] Flower rotation exceeded 5000rpm</code>
              <code>{">"} [HALT] Core frequency unstable</code>
            </div>
            <button className="am-crash-reboot" onClick={() => window.location.reload()}>
              <RefreshCw size={18} /> INITIALIZE RECOVERY
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
