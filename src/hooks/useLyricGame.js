import { useState, useEffect, useRef, useCallback } from 'react';
import famousSongs from '../data/famousSongs.json';
import { evaluateGuess, isCloseEnough } from '../utils/guessChecker';
import { trackToken } from '../utils/logToken';
import { fetchLyricsData } from '../services/lyricService';
import { 
  fetchArtistPlaylistData, 
  fetchGenrePlaylistData, 
  parsePlaylistUrlData 
} from '../services/playlistService';

export const useLyricGame = (artistName, isGlobal, initialMode) => {
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
  const [hintLines, setHintLines] = useState([]);
  const [hintStartTime, setHintStartTime] = useState(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [startIndex, setStartIndex] = useState(0);
  const [history, setHistory] = useState([]);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [currentGuesses, setCurrentGuesses] = useState([]);
  const [settings, setSettings] = useState(() => {
    const defaults = { mode: 'both', challengeMode: 'lyrics', clipLength: 10, hintDepth: 1, muted: false, strictMode: false, autoSkip: true };
    const saved = localStorage.getItem('lyric_game_settings');
    return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
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
  // For the "finish the lyrics" challenge: show one line, the player types the next.
  const [finishChallenge, setFinishChallenge] = useState(null);
  // Whether the player has settled on a challenge mode. A URL flag (/find,
  // /finish, /hear) sets it instantly; once a player has picked a mode it's
  // remembered, so we only prompt on the very first visit.
  const [modeChosen, setModeChosen] = useState(() => {
    if (initialMode) return true;
    try { return localStorage.getItem('lyric_game_mode_chosen') === '1'; }
    catch { return false; }
  });

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

  // Apply a mode forced by the URL flag (/find → lyrics, /finish → finish,
  // /hear → clip) exactly once on mount.
  useEffect(() => {
    if (initialMode) {
      setSettings(prev => ({ ...prev, challengeMode: initialMode }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chooseMode = useCallback((m) => {
    setSettings(prev => ({ ...prev, challengeMode: m }));
    try { localStorage.setItem('lyric_game_mode_chosen', '1'); } catch { /* ignore */ }
    setModeChosen(true);
  }, []);

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
    const norm = (str) => (str || '')
      .toLowerCase()
      .replace(/\(.*?\)/g, '')
      .replace(/\[.*?\]/g, '')
      .replace(/feat\..*/gi, '')
      .replace(/ft\..*/gi, '')
      .replace(/[^a-z0-9 ]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    const { fetchITunesJSONP } = await import('../utils/itunesJSONP');

    const wantArtist = norm(artist);
    const wantTrack = norm(track);

    try {
      // Pull several candidates and pick the one whose artist + track actually
      // match, so reveals don't show a cover from an unrelated remix/cover/single.
      const { data } = await fetchITunesJSONP(`https://itunes.apple.com/search?term=${encodeURIComponent(artist + ' ' + track)}&entity=musicTrack&limit=10`);
      if (rid !== lastRequestId.current) return;

      const results = data.results || [];
      if (results.length === 0) return;

      const score = (r) => {
        const a = norm(r.artistName);
        const t = norm(r.trackName);
        let s = 0;
        if (a === wantArtist) s += 4;
        else if (a.includes(wantArtist) || wantArtist.includes(a)) s += 2;
        if (t === wantTrack) s += 4;
        else if (t.includes(wantTrack) || wantTrack.includes(t)) s += 2;
        return s;
      };

      const best = results
        .map(r => ({ r, s: score(r) }))
        .sort((x, y) => y.s - x.s)[0];

      // Require at least a partial match on both fields; otherwise leave the
      // YouTube thumbnail fallback in place rather than show a wrong cover.
      const trackData = best && best.s >= 4 ? best.r : null;
      if (trackData && trackData.artworkUrl100) {
        const art = trackData.artworkUrl100.replace('100x100bb', '1000x1000bb');
        setAlbumArt(art);
        setTrackUrl(trackData.trackViewUrl);
        setCurrentSong(prev => prev ? { ...prev, previewUrl: trackData.previewUrl } : prev);
      }
    } catch (err) {
      console.error("Art fetch failed", err?.message);
    }
  }, []);

  const startNewRound = useCallback(async (forceGlobal = false, initialPool = null) => {
    // Guard against being used as a raw event handler (a click event is truthy
    // and would silently switch the game to the global song pool).
    forceGlobal = forceGlobal === true;
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
    setFinishChallenge(null);
    setAttempts(0);
    setCurrentGuesses([]);
    setShowRoundGuesses(false);
    setLyrics('');

    if (albumArt) setPrevAlbumArt(albumArt);
    setAlbumArt('');
    setParsedLyrics([]);
    setHintLines([]);
    setHintStartTime(null);
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
        console.log(`[Sync] 🔍 Searching YouTube for: ${trackToken(randomSong.artist, randomSong.track)}`);
        setIsYoutubeLoading(true);
        try {
          const res = await fetch(`/yt-search?q=${encodeURIComponent(randomSong.artist + ' ' + randomSong.track + ' official audio')}`);
          const contentType = res.headers.get("content-type");

          if (res.ok && contentType && contentType.includes("application/json")) {
            const data = await res.json();
            const videoId = Array.isArray(data) && data.length > 0 ? data[0].videoId : null;
            if (videoId && rid === lastRequestId.current) {
              console.log(`[Sync] ✅ Found Video ID for ${trackToken(randomSong.artist, randomSong.track)}`);
              setCurrentSong(prev => prev ? { ...prev, youtubeId: videoId } : prev);
            } else {
              console.warn("[Sync] ⚠️ No YouTube results found or invalid data structure");
            }
          } else {
            console.error(`[Sync] ❌ Search failed. Status: ${res.status}. Type: ${contentType}`);
          }
        } catch (err) {
          console.error("[Sync] ❌ YouTube search exception:", err.message);
        } finally {
          if (rid === lastRequestId.current) setIsYoutubeLoading(false);
        }
      };
      fetchYoutubeId();
      
      const controller = new AbortController();
      try {
        const data = await fetchLyricsData(randomSong.artist, randomSong.track, controller.signal);
        if (rid === lastRequestId.current) {
          setLyrics(data.fullLyrics);
          setParsedLyrics(data.parsedLyrics);
          setHintLines(data.hintLines);
          setHintStartTime(data.hintStartTime);
          setStartIndex(data.startIndex);
          setSnippet(data.snippet);

          // Build the "finish the lyrics" challenge from consecutive lines.
          // Prefer the synced lyrics so playback can lead up to the answer line.
          const seq = data.parsedLyrics?.length
            ? data.parsedLyrics
            : data.fullLyrics.split('\n').map(t => ({ text: t.trim(), time: null })).filter(l => l.text.length > 2);
          const candidates = [];
          for (let k = 0; k < seq.length - 1; k++) {
            if (seq[k].text.length > 6 && seq[k + 1].text.length > 6) candidates.push(k);
          }
          if (candidates.length > 0) {
            const i = candidates[Math.floor(Math.random() * candidates.length)];
            setFinishChallenge({
              prompt: seq[i].text,
              answer: seq[i + 1].text,
              answerTime: seq[i + 1].time ?? null
            });
          }

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

    // "Finish the lyrics" mode: the typed line is checked against the next line.
    if (settings.challengeMode === 'finish') {
      if (!finishChallenge) return;
      const correct = isCloseEnough(guess.title, finishChallenge.answer, settings.strictMode, false);
      if (correct) {
        setGameState('correct');
        setIsPlaying(true);
        setScore(s => s + 1);
        setCorrectParts({ title: true, artist: true });
        addToHistory(currentSong, true, currentGuesses);
      } else {
        const newGuess = { title: guess.title, artist: '', id: attempts };
        setCurrentGuesses(prev => [...prev, newGuess]);
        setGuess({ title: '', artist: '' });
        if (attempts >= 4) {
          setGameState('failed');
          setIsPlaying(true); // play the answer line they missed
          addToHistory(currentSong, false, [...currentGuesses, newGuess]);
        } else {
          setAttempts(prev => prev + 1);
          setGameState('error');
          setTimeout(() => setGameState('playing'), 500);
        }
      }
      return;
    }

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
        const visibleLines = hintLines.slice(startIndex, startIndex + attempts + 2);
        setSnippet(visibleLines.join('\n'));
        setGameState('error');
        setTimeout(() => setGameState('playing'), 500);
      }
    }
  }, [currentSong, guess, settings, playlistInfo, attempts, hintLines, startIndex, addToHistory, currentGuesses, correctParts, finishChallenge]);

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
    if (id === 'home' || id === 'globalsongs') {
      // "Global Hits" pulls from the bundled famous-songs pool rather than a
      // local playlist JSON file (which doesn't exist for this id).
      setCustomPlaylist([]);
      setPlaylistInfo(null);
      setArtistImage('');
      syncUrl(null, 'global');
      startNewRound(true);
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

  const handlePlayerReady = useCallback(() => {
    errorCount.current = 0;
    setIsPlayerReady(true);
  }, []);

  const handlePlayerError = useCallback((error) => {
    setIsPlayerReady(false);
    errorCount.current++;
    console.error(`[Flow] ⚠️ Player Error (${errorCount.current}/6):`, error?.message || 'media error');
    
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

  // We intentionally do NOT auto-start playback during the guessing phase.
  // Browsers (especially on the very first round, before any user gesture) block
  // autoplay, which left the UI claiming "Playing" while nothing actually played.
  // Instead the round starts paused and the player taps the play button to begin —
  // that gesture also unlocks audio for the rest of the session. Reveal-phase
  // playback is still started explicitly from handleGuess/giveUp after a click.

  const isRoundOver = gameState === 'correct' || gameState === 'revealed' || gameState === 'failed';

  // When a revealed song finishes playing, advance (if auto-skip is on). This is
  // what carries the user forward when they let the song play out — regardless of
  // whether playback was auto-started or they pressed play themselves.
  const handlePlaybackEnded = useCallback(() => {
    setIsPlaying(false);
    // Only advance at the end of a round; during the guessing phase the snippet
    // window also ends here and should just stop, not skip.
    if (settings.autoSkip && isRoundOver) {
      startNewRound();
    }
  }, [settings.autoSkip, isRoundOver, startNewRound]);

  // Fallback auto-advance: if the round is over and nothing is playing (user
  // didn't start the song, or paused it), move on after a short beat. While the
  // song is actively playing we instead wait for it to end (handlePlaybackEnded).
  useEffect(() => {
    if (isRoundOver && settings.autoSkip && !isPlaying) {
      const delay = gameState === 'correct' ? 6000 : 8000;
      const timer = setTimeout(() => startNewRound(), delay);
      return () => clearTimeout(timer);
    }
  }, [isRoundOver, gameState, settings.autoSkip, isPlaying, startNewRound]);

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
      guess, gameState, trackUrl, currentTime, parsedLyrics, hintLines, hintStartTime, score, attempts,
      startIndex, history, sessionHistory, currentGuesses, settings, showHistory,
      showRoundGuesses, isSearching, isLandingState, customPlaylist, playlistInfo,
      artistImage, isImporting, importUrl, isCrashed, crashReason, isPlaying, isPlayerReady,
      isYoutubeLoading, correctParts, finishChallenge, modeChosen,
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
      handleSelectGenre, handleSelectLocalPlaylist, parsePlaylistUrl,
      handlePlayerReady, handlePlayerError, chooseMode, handlePlaybackEnded
    },
    refs: { playerRef }
  };
};
