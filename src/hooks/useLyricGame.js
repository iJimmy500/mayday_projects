import { useState, useEffect, useRef, useCallback } from 'react';
import famousSongs from '../data/famousSongs.json';
import { evaluateGuess } from '../utils/guessChecker';
import { fetchLyricsData } from '../services/lyricService';
import { 
  fetchArtistPlaylistData, 
  fetchGenrePlaylistData, 
  parsePlaylistUrlData 
} from '../services/playlistService';

export const useLyricGame = (artistName, isGlobal) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [lyrics, setLyrics] = useState('');
  const [snippet, setSnippet] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const [albumArt, setAlbumArt] = useState('');
  const [prevAlbumArt, setPrevAlbumArt] = useState('');
  const [guess, setGuess] = useState({ title: '', artist: '' });
  const [gameState, setGameState] = useState('playing');
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
  const [playlistInfo, setPlaylistInfo] = useState(null);
  const [artistImage, setArtistImage] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [isCrashed, setIsCrashed] = useState(false);
  const [crashReason, setCrashReason] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isYoutubeLoading, setIsYoutubeLoading] = useState(false);
  const [correctParts, setCorrectParts] = useState({ title: false, artist: false });

  const masteredIds = useRef(new Set());
  const playlistRef = useRef([]);
  const isRoundStarting = useRef(false);
  const lastRequestId = useRef(0);
  const activeLyricsRequest = useRef(null);
  const playerRef = useRef(null);
  const hasInitialized = useRef(false);
  const errorCount = useRef(0);

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

  const addToHistory = useCallback((song, correct, guesses = []) => {
    const newItem = { ...song, correct, art: albumArt, url: trackUrl, timestamp: Date.now(), guesses };
    setHistory(prev => [newItem, ...prev].slice(0, 100));
    setSessionHistory(prev => [newItem, ...prev].slice(0, 50));
  }, [albumArt, trackUrl]);

  const fetchAlbumArt = useCallback(async (artist, track, rid) => {
    const cleanTerm = (str) => str.replace(/\(.*\)/g, '').replace(/feat\..*/gi, '').replace(/ft\..*/gi, '').trim();
    const { fetchITunesJSONP } = await import('../utils/itunesJSONP');
    
    try {
      const { data } = await fetchITunesJSONP(`https://itunes.apple.com/search?term=${encodeURIComponent(artist + ' ' + track)}&entity=musicTrack&limit=1`);
      if (rid !== lastRequestId.current) return;

      if (data.results && data.results[0]) {
        const trackData = data.results[0];
        const art = trackData.artworkUrl100.replace('100x100bb', '1000x1000bb');
        setAlbumArt(art);
        setTrackUrl(trackData.trackViewUrl);
        setCurrentSong(prev => prev ? { ...prev, previewUrl: trackData.previewUrl } : prev);
      }
    } catch (err) {
      console.error("Art fetch failed", err);
    }
  }, []);

  const startNewRound = useCallback(async (forceGlobal = false, initialPool = null) => {
    if (isRoundStarting.current) return;
    isRoundStarting.current = true;
    
    const rid = ++lastRequestId.current;
    setLoading(true);
    setIsPlaying(false);
    setIsPlayerReady(false);
    setStatusMessage(''); 
    setGameState('playing');
    setGuess({ title: '', artist: '' });
    setCorrectParts({ title: false, artist: false });
    setAttempts(0);
    setCurrentGuesses([]);
    setShowRoundGuesses(false);
    setLyrics('');

    if (albumArt) setPrevAlbumArt(albumArt);
    setAlbumArt('');
    setParsedLyrics([]);
    setCurrentTime(0);

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
      setGameState('congrats');
      setLoading(false);
      isRoundStarting.current = false;
      return;
    } else {
      setLoading(false);
      setIsLandingState(true);
      isRoundStarting.current = false;
      return;
    }

    if (randomSong) {
      setCurrentSong(randomSong);
      fetchAlbumArt(randomSong.artist, randomSong.track, rid);
      
      // Use the new local proxy to find the YouTube videoId for the song
      const fetchYoutubeId = async () => {
        console.log(`[Sync] 🔍 Searching YouTube for: ${randomSong.artist} - ${randomSong.track}`);
        try {
          const res = await fetch(`/yt-search?q=${encodeURIComponent(randomSong.artist + ' ' + randomSong.track + ' official audio')}`);
          const contentType = res.headers.get("content-type");
          
          if (res.ok && contentType && contentType.includes("application/json")) {
            const data = await res.json();
            if (data && data.length > 0 && rid === lastRequestId.current) {
              const videoId = data[0].videoId;
              console.log(`[Sync] ✅ Found Video ID: ${videoId}`);
              setCurrentSong(prev => prev ? { ...prev, youtubeId: videoId } : prev);
            } else {
              console.warn("[Sync] ⚠️ No YouTube results found or invalid data structure");
            }
          } else {
            const errorText = await res.text();
            console.error(`[Sync] ❌ Search failed. Status: ${res.status}. Type: ${contentType}`);
          }
        } catch (err) {
          console.error("[Sync] ❌ YouTube search exception:", err.message);
        }
      };
      fetchYoutubeId();
      
      const controller = new AbortController();
      try {
        const data = await fetchLyricsData(randomSong.artist, randomSong.track, controller.signal);
        if (rid === lastRequestId.current) {
          setLyrics(data.fullLyrics);
          setParsedLyrics(data.parsedLyrics);
          setStartIndex(data.startIndex);
          setSnippet(data.snippet);
          setLoading(false);
        }
      } catch (err) {
        if (rid === lastRequestId.current) {
          setStatusMessage('Lyrics not found.');
          setLyrics('Lyrics not found.');
          setLoading(false);
          setTimeout(() => {
            if (rid === lastRequestId.current) startNewRound();
          }, 3000);
        }
      }
    }
    
    setTimeout(() => { isRoundStarting.current = false; }, 500);
  }, [albumArt, playlistInfo, fetchAlbumArt]);

  const handleGuess = useCallback(() => {
    if (!currentSong) return;
    const { isWin, isTitleCorrect, isArtistCorrect } = evaluateGuess(guess, currentSong, settings, playlistInfo);

    if (isWin) {
      setGameState('correct');
      setIsPlaying(true);
      setScore(s => s + 1);
      setCorrectParts({ title: true, artist: true });
      addToHistory(currentSong, true, currentGuesses);
    } else {
      const newGuess = { ...guess, id: attempts };
      setCurrentGuesses(prev => [...prev, newGuess]);
      
      const nextGuess = { ...guess };
      const nextCorrect = { ...correctParts };

      if (isTitleCorrect) {
        nextCorrect.title = true;
      } else {
        nextGuess.title = '';
      }

      if (isArtistCorrect) {
        nextCorrect.artist = true;
      } else {
        nextGuess.artist = '';
      }

      setGuess(nextGuess);
      setCorrectParts(nextCorrect);

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
  }, [currentSong, guess, settings, playlistInfo, attempts, lyrics, startIndex, addToHistory, currentGuesses, correctParts]);

  const giveUp = useCallback(() => {
    setGameState('revealed');
    setIsPlaying(true);
    addToHistory(currentSong, false, currentGuesses);
  }, [currentSong, currentGuesses, addToHistory]);

  const resetToRandom = useCallback(() => {
    setCustomPlaylist([]);
    setPlaylistInfo(null);
    setArtistImage('');
    const base = window.location.pathname.split('/')[1] || 'day11';
    window.history.replaceState(null, '', `/${base}`);
    startNewRound(true);
  }, [startNewRound]);

  const fetchArtistPlaylist = useCallback(async (name) => {
    setLoading(true);
    setIsSearching(false);
    setIsLandingState(false);
    syncUrl(name, 'artist');
    try {
      const data = await fetchArtistPlaylistData(name);
      if (data) {
        setPlaylistInfo(data.artistInfo);
        startNewRound(false, data.songs);
      }
    } catch (error) {
      console.error("Artist lookup failed", error);
      setLoading(false);
    }
  }, [syncUrl, startNewRound]);

  const handleSelectGenre = useCallback(async (genre) => {
    setLoading(true);
    setIsLandingState(false);
    syncUrl(genre, 'genre');
    try {
      const data = await fetchGenrePlaylistData(genre);
      if (data) {
        setPlaylistInfo(data.playlistInfo);
        startNewRound(false, data.songs);
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
    syncUrl(id, 'mixtape');
    try {
      const { default: axios } = await import('axios');
      const response = await axios.get(`/data/playlists/${id}.json`);
      if (response.data && response.data.length > 0) {
        const shuffled = response.data.sort(() => Math.random() - 0.5);
        setPlaylistInfo({ name: name, type: 'Official Mixtape' });
        startNewRound(false, shuffled);
      }
    } catch (err) {
      console.error("Local playlist fetch failed", err);
      setLoading(false);
    }
  }, [resetToRandom, startNewRound, syncUrl]);

  const parsePlaylistUrl = useCallback(async (url) => {
    setLoading(true);
    setIsLandingState(false);
    setIsImporting(false);
    syncUrl(url, 'custom');
    try {
      const data = await parsePlaylistUrlData(url);
      if (data) {
        setPlaylistInfo(data.playlistInfo);
        startNewRound(false, data.songs);
      }
    } catch (error) {
      console.error("Import failed", error);
    } finally {
      setLoading(false);
    }
  }, [syncUrl, startNewRound]);

  const handlePlayerError = useCallback((error) => {
    setIsPlayerReady(false);
    errorCount.current++;
    console.error(`[Flow] ⚠️ Player Error (${errorCount.current}/6):`, error);
    
    if (errorCount.current > 6) {
      setCrashReason({
        code: 'AUDIO_ENGINE_FAILURE',
        message: 'The playback engine encountered too many consecutive errors and has been halted to prevent memory corruption.',
        details: error?.message || 'Unknown stream extraction error'
      });
      setIsCrashed(true);
    }
  }, []);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const path = window.location.pathname;
    const parts = path.split('/').filter(p => p.length > 0);
    const params = new URLSearchParams(window.location.search);
    const sourceUrl = params.get('source');
    
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
      }
    } else if (parts.includes('custom') && sourceUrl) {
      parsePlaylistUrl(sourceUrl);
    } else {
      const lastPart = parts[parts.length - 1];
      const secondLastPart = parts[parts.length - 2];
      
      if (secondLastPart === 'genre') {
        handleSelectGenre(decodeURIComponent(lastPart));
      } else if (secondLastPart === 'mixtape') {
        handleSelectLocalPlaylist(decodeURIComponent(lastPart), lastPart.replace(/_/g, ' ').toUpperCase());
      } else if (secondLastPart === 'artist') {
        fetchArtistPlaylist(decodeURIComponent(lastPart));
      } else {
        fetchArtistPlaylist(decodeURIComponent(lastPart));
      }
    }
  }, [artistName, isGlobal, fetchArtistPlaylist, handleSelectGenre, handleSelectLocalPlaylist, parsePlaylistUrl, startNewRound]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && e.shiftKey && e.key === 'C') {
        setCrashReason({
          code: 'MANUAL_INITIATED_CRASH',
          message: 'User triggered a system halt via diagnostic shortcut.'
        });
        setIsCrashed(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    state: {
      currentSong, lyrics, snippet, loading, statusMessage, albumArt, prevAlbumArt,
      guess, gameState, trackUrl, currentTime, parsedLyrics, score, attempts,
      startIndex, history, sessionHistory, currentGuesses, settings, showHistory,
      showRoundGuesses, isSearching, isLandingState, customPlaylist, playlistInfo,
      artistImage, isImporting, importUrl, isCrashed, crashReason, isPlaying, isPlayerReady,
      isYoutubeLoading, correctParts,
      hasSync: !!(parsedLyrics?.length > 1 && currentSong?.youtubeId) // Require full song (YouTube) + at least 2 synced lines
    },
    actions: {
      setCurrentSong, setLyrics, setSnippet, setLoading, setStatusMessage, setAlbumArt,
      setGuess, setGameState, setTrackUrl, setCurrentTime, setParsedLyrics, setScore,
      setAttempts, setStartIndex, setHistory, setSessionHistory, setCurrentGuesses,
      setSettings, setShowHistory, setShowRoundGuesses, setIsSearching, setIsLandingState,
      setCustomPlaylist, setPlaylistInfo, setArtistImage, setIsImporting, setImportUrl,
      setIsCrashed, setCrashReason, setIsPlaying, setIsPlayerReady, setIsYoutubeLoading,
      handleGuess, giveUp, startNewRound, resetToRandom, fetchArtistPlaylist,
      handleSelectGenre, handleSelectLocalPlaylist, parsePlaylistUrl, handlePlayerError
    },
    refs: { playerRef }
  };
};
