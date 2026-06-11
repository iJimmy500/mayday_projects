import { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import { loadQuestionSet, compileLeaderboard } from './hotPotatoUtils';

export const MAX_PLAYERS = 8;
export const PASS_DELAY_MS = 3000;

const INACTIVITY_WARN_MS = 3 * 60 * 1000;
const WARN_DURATION_S = 60;
const ROOM_VALIDATE_TIMEOUT_MS = 4000;
const COUNTDOWN_SECONDS = 3;
const LS_NAME_KEY = 'hp-name';

function genRoomCode() {
  // Unambiguous characters only (no 0/O, 1/I/L), always 6 chars
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}
function genId() {
  return (crypto.randomUUID?.() ?? Math.random().toString(36).substring(2, 18));
}
function sessionKey(code) {
  return `hp-session-${code}`;
}

export function sendAnswerBroadcast(channelRef, myIdRef, liveState, answerIndex) {
  channelRef.current?.send({
    type: 'broadcast',
    event: 'submit_answer',
    payload: {
      questionIndex: liveState.currentQuestionIndex,
      answerIndex,
      playerId: myIdRef.current,
    },
  });
}

export default function useLiveGame() {
  const path = window.location.pathname;
  const rawPathCode = path.startsWith('/hotpotato/live/')
    ? path.split('/hotpotato/live/')[1].split('/')[0].replace(/[^a-z0-9]/gi, '').toUpperCase()
    : '';
  const pathCode = rawPathCode || null;
  const [isHost] = useState(!pathCode);

  const myIdRef = useRef(genId());
  const hasJoinedRef = useRef(false);
  const hadHostRef = useRef(false); // flips true the first time we see a host in presence

  // Pre-fill name from last session
  const savedName = localStorage.getItem(LS_NAME_KEY) ?? '';

  const [myName, setMyName] = useState('');
  const [nameInput, setNameInput] = useState(savedName);
  const [codeInput, setCodeInput] = useState('');
  const [tab, setTab] = useState('create');
  const [mode, setMode] = useState('distributed');
  const [roomCode, setRoomCode] = useState(pathCode || '');
  const [phase, setPhase] = useState(isHost ? 'setup' : (pathCode ? 'validating' : 'setup'));
  const [connectedPlayers, setConnectedPlayers] = useState([]);
  const connectedPlayersRef = useRef([]);
  const [settings] = useState({
    math: true, trivia: true, vocab: true,
    timerLength: 'medium', triviaCat: 'any', questionCount: 30,
    antiSpam: true, antiSpamThreshold: 3, accessibility: false,
  });
  const [liveState, setLiveState] = useState(null);
  const [urgency, setUrgency] = useState(0);
  const [shake, setShake] = useState(false);
  const [copied, setCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [error, setError] = useState('');
  const [timeoutCountdown, setTimeoutCountdown] = useState(null);
  const [connected, setConnected] = useState(false);

  const channelRef = useRef(null);
  const validateTimerRef = useRef(null);
  const questionBankRef = useRef([]);
  const qIdxRef = useRef(0);
  const pIdxRef = useRef(0);
  const playerNamesRef = useRef([]);
  const playerStatsRef = useRef({});
  const endTimeRef = useRef(null);
  const totalTimeRef = useRef(null);
  const tickIntervalRef = useRef(null);
  const wrongTimestampsRef = useRef([]);
  const turnStartTimeRef = useRef(null);
  const cachedWordsRef = useRef([]);
  const isFetchingRef = useRef(false);
  const passTimeoutRef = useRef(null);
  const inactivityTimerRef = useRef(null);
  const warnCountdownRef = useRef(null);
  const pendingJoinRef = useRef(null); // name of a setup-screen joiner awaiting room validation
  const myNameRef = useRef('');
  const phaseRef = useRef(phase);
  const pruneTimerRef = useRef(null);

  useEffect(() => { connectedPlayersRef.current = connectedPlayers; }, [connectedPlayers]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => () => doCleanup(), []);

  // URL joiners: validate room on mount
  useEffect(() => {
    if (!isHost && pathCode) validateRoom(pathCode);
  }, []);

  // Host: keep tracked presence current so joiners can read the game phase
  useEffect(() => {
    if (!isHost || !channelRef.current || !myName) return;
    channelRef.current.track({ id: myIdRef.current, name: myName, isHost: true, gamePhase: phase });
  }, [phase, isHost, myName]);

  // ── Presence helpers ──────────────────────────────────────

  function parsePresenceList(raw) {
    return Object.values(raw).flat()
      .filter(p => p && p.name)
      .map(p => ({ id: p.id, name: p.name, isHost: p.isHost, gamePhase: p.gamePhase }));
  }

  // Setup-screen join failed — return to the form with an inline error
  function failSetupJoin(msg) {
    pendingJoinRef.current = null;
    doCleanup();
    setError(msg);
    setTab('join');
    setPhase('setup');
  }

  function checkHostLeft(list) {
    const hasHost = list.some(p => p.isHost);
    if (hadHostRef.current && !hasHost && hasJoinedRef.current) {
      doCleanup();
      setPhase('host_left');
      return true;
    }
    if (hasHost) hadHostRef.current = true;
    return false;
  }

  // ── Room validation (URL joiners + setup-screen joiners) ─

  function validateRoom(code) {
    if (channelRef.current) return;

    const ch = supabase.channel(`hotpotato-${code}`, {
      config: { presence: { key: myIdRef.current } },
    });

    validateTimerRef.current = setTimeout(() => {
      if (!hasJoinedRef.current) {
        if (pendingJoinRef.current) {
          failSetupJoin("Room not found. Double-check the code.");
          return;
        }
        setPhase('not_found');
        ch.unsubscribe();
        channelRef.current = null;
        setConnected(false);
      }
    }, ROOM_VALIDATE_TIMEOUT_MS);

    ch.on('presence', { event: 'sync' }, () => {
      const raw = ch.presenceState();
      const list = parsePresenceList(raw);
      setConnectedPlayers(list);

      if (hasJoinedRef.current) {
        checkHostLeft(list);
        return;
      }

      const hostEntry = list.find(p => p.isHost);
      if (!hostEntry) return;

      clearTimeout(validateTimerRef.current);
      hadHostRef.current = true;

      if (hostEntry.gamePhase && hostEntry.gamePhase !== 'lobby') {
        if (pendingJoinRef.current) {
          failSetupJoin('That game has already started.');
          return;
        }
        setPhase('already_started');
        return;
      }

      // Setup-screen joiner: we already have their name, join as soon as validated
      const pendingName = pendingJoinRef.current;
      if (pendingName) {
        pendingJoinRef.current = null;
        if (list.length >= MAX_PLAYERS) {
          failSetupJoin('Room is full (8 players max).');
          return;
        }
        if (list.some(p => p.name.toLowerCase() === pendingName.toLowerCase())) {
          failSetupJoin('That name is already taken. Choose another.');
          return;
        }
        doJoinRoom(pendingName, code, ch);
        return;
      }

      // Check for saved session to auto-rejoin
      try {
        const stored = JSON.parse(sessionStorage.getItem(sessionKey(code)) ?? 'null');
        if (stored?.name) {
          const taken = list.some(p => p.name.toLowerCase() === stored.name.toLowerCase());
          if (!taken && list.length < MAX_PLAYERS) {
            setNameInput(stored.name);
            doJoinRoom(stored.name, code, ch);
            return;
          }
        }
      } catch {
        // corrupt session data — fall through to the join form
      }

      setPhase('join');
    });

    // Broadcast handlers — gated until we've actually joined
    ch.on('broadcast', { event: 'sync_state' }, ({ payload }) => {
      if (!hasJoinedRef.current) {
        if (payload.phase && payload.phase !== 'lobby') {
          clearTimeout(validateTimerRef.current);
          setPhase('already_started');
        }
        return;
      }
      setLiveState(payload);
      setPhase(payload.phase);
      if (payload.wasWrong) {
        setShake(true);
        setTimeout(() => setShake(false), 300);
      }
    });
    ch.on('broadcast', { event: 'tick' }, ({ payload }) => {
      if (hasJoinedRef.current) setUrgency(payload.urgency);
    });
    ch.on('broadcast', { event: 'game_ended' }, ({ payload }) => {
      if (hasJoinedRef.current) setPhase(payload?.reason === 'timeout' ? 'timed_out' : 'ended');
    });
    ch.on('broadcast', { event: 'inactivity_warning' }, ({ payload }) => {
      if (hasJoinedRef.current) setTimeoutCountdown(payload.seconds);
    });
    ch.on('broadcast', { event: 'inactivity_clear' }, () => {
      if (hasJoinedRef.current) setTimeoutCountdown(null);
    });
    ch.on('broadcast', { event: 'kick_player' }, ({ payload }) => {
      if (payload.playerId === myIdRef.current) {
        sessionStorage.removeItem(sessionKey(code)); // don't auto-rejoin after a kick
        doCleanup();
        setPhase('kicked');
      }
    });

    ch.subscribe((status) => {
      setConnected(status === 'SUBSCRIBED');
      if (status === 'CHANNEL_ERROR' && !hasJoinedRef.current) {
        clearTimeout(validateTimerRef.current);
        if (pendingJoinRef.current) failSetupJoin('Connection failed. Try again.');
        else setPhase('not_found');
      }
    });

    channelRef.current = ch;
    setRoomCode(code);
  }

  // ── Host channel setup ────────────────────────────────────

  function subscribeAsHost(code, name) {
    if (channelRef.current) return;

    const ch = supabase.channel(`hotpotato-${code}`, {
      config: { presence: { key: myIdRef.current } },
    });

    ch.on('presence', { event: 'sync' }, () => {
      const raw = ch.presenceState();
      const list = parsePresenceList(raw);
      setConnectedPlayers(list);
      resetInactivity();
      watchForDepartures(list);
    });

    ch.on('broadcast', { event: 'submit_answer' }, ({ payload }) => handlePlayerAnswer(payload));

    ch.subscribe(async (status) => {
      setConnected(status === 'SUBSCRIBED');
      if (status === 'SUBSCRIBED') {
        await ch.track({ id: myIdRef.current, name, isHost: true, gamePhase: 'lobby' });
      }
    });

    channelRef.current = ch;
  }

  // ── Mid-game departures (host only) ───────────────────────
  // If a player disconnects during a game, give them a short grace period to
  // reconnect, then remove them from the rotation so the potato isn't stuck
  // in a ghost's hands.

  function watchForDepartures(list) {
    if (!['playing', 'passing'].includes(phaseRef.current)) return;
    const present = new Set(list.map(p => p.name));
    present.add(myNameRef.current);
    const missing = playerNamesRef.current.some(n => !present.has(n));
    if (!missing) {
      clearTimeout(pruneTimerRef.current);
      pruneTimerRef.current = null;
      return;
    }
    if (pruneTimerRef.current) return;
    pruneTimerRef.current = setTimeout(() => {
      pruneTimerRef.current = null;
      pruneDepartedPlayers();
    }, 4000);
  }

  function pruneDepartedPlayers() {
    if (!['playing', 'passing'].includes(phaseRef.current)) return;
    const present = new Set(connectedPlayersRef.current.map(p => p.name));
    present.add(myNameRef.current);

    const names = playerNamesRef.current;
    if (!names.some(n => !present.has(n))) return; // everyone came back

    const activeName = names[pIdxRef.current];
    const newNames = names.filter(n => present.has(n));

    if (newNames.length < 2) {
      channelRef.current?.send({ type: 'broadcast', event: 'game_ended', payload: { reason: 'players_left' } });
      clearInterval(tickIntervalRef.current);
      clearTimeout(passTimeoutRef.current);
      playerNamesRef.current = newNames;
      setPhase('ended');
      return;
    }

    playerNamesRef.current = newNames;

    if (present.has(activeName)) {
      // A waiting player left — fix the index and refresh everyone's roster
      pIdxRef.current = newNames.indexOf(activeName);
      if (phaseRef.current === 'playing') broadcastState('playing');
    } else {
      // The player holding the potato left — pass to the next survivor
      clearInterval(tickIntervalRef.current);
      clearTimeout(passTimeoutRef.current);
      let nextName = null;
      for (let i = 1; i <= names.length; i++) {
        const cand = names[(pIdxRef.current + i) % names.length];
        if (present.has(cand)) { nextName = cand; break; }
      }
      pIdxRef.current = Math.max(0, newNames.indexOf(nextName));
      qIdxRef.current += 1;
      beginRound();
    }
  }

  function doCleanup() {
    clearTimeout(validateTimerRef.current);
    clearInterval(tickIntervalRef.current);
    clearTimeout(passTimeoutRef.current);
    clearTimeout(inactivityTimerRef.current);
    clearInterval(warnCountdownRef.current);
    clearTimeout(pruneTimerRef.current);
    setConnected(false);
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }
  }

  function persistSession(name, code) {
    localStorage.setItem(LS_NAME_KEY, name);
    sessionStorage.setItem(sessionKey(code), JSON.stringify({ name }));
  }

  // ── Inactivity (host only) ────────────────────────────────

  function resetInactivity() {
    if (!isHost) return;
    clearTimeout(inactivityTimerRef.current);
    clearInterval(warnCountdownRef.current);
    setTimeoutCountdown(null);
    channelRef.current?.send({ type: 'broadcast', event: 'inactivity_clear', payload: {} });

    inactivityTimerRef.current = setTimeout(() => {
      let secs = WARN_DURATION_S;
      setTimeoutCountdown(secs);
      channelRef.current?.send({ type: 'broadcast', event: 'inactivity_warning', payload: { seconds: secs } });

      warnCountdownRef.current = setInterval(() => {
        secs -= 1;
        setTimeoutCountdown(secs);
        channelRef.current?.send({ type: 'broadcast', event: 'inactivity_warning', payload: { seconds: secs } });
        if (secs <= 0) {
          clearInterval(warnCountdownRef.current);
          channelRef.current?.send({ type: 'broadcast', event: 'game_ended', payload: { reason: 'timeout' } });
          doCleanup();
          window.location.href = '/hotpotato';
        }
      }, 1000);
    }, INACTIVITY_WARN_MS);
  }

  // ── Setup / Join ──────────────────────────────────────────

  function handleCreateRoom(e) {
    e.preventDefault();
    const name = nameInput.trim();
    if (!name) return;
    const code = genRoomCode();
    localStorage.setItem(LS_NAME_KEY, name);
    setMyName(name);
    myNameRef.current = name;
    setRoomCode(code);
    // Note: the host's URL is NOT changed to the room URL — if it were, a
    // host refresh would reload them as a joiner of their own (now dead) room.
    subscribeAsHost(code, name);
    setPhase('lobby');
    setTimeout(resetInactivity, 0);
  }

  // Setup-screen joiners go through the same validation as URL joiners:
  // the room must exist, have a host in the lobby, a free slot, and no name clash.
  function handleJoinFromSetup(e) {
    e.preventDefault();
    const name = nameInput.trim();
    const code = codeInput.trim().toUpperCase();
    if (!name || !code) return;
    localStorage.setItem(LS_NAME_KEY, name);
    setError('');
    pendingJoinRef.current = name;
    setPhase('validating');
    validateRoom(code);
  }

  // URL joiners: channel already open from validateRoom, just track now
  function handleJoinRoom(e) {
    e.preventDefault();
    const name = nameInput.trim();
    if (!name) return;
    doJoinRoom(name, pathCode, channelRef.current);
  }

  function doJoinRoom(name, code, ch) {
    if (!ch) return;
    const existing = parsePresenceList(ch.presenceState());
    if (existing.length >= MAX_PLAYERS) {
      setError('Room is full (8 players max).');
      return;
    }
    if (existing.some(p => p.name.toLowerCase() === name.toLowerCase())) {
      setError('That name is already taken. Choose another.');
      return;
    }
    persistSession(name, code);
    setMyName(name);
    myNameRef.current = name;
    setNameInput(name);
    hasJoinedRef.current = true;
    const target = `/hotpotato/live/${code}`;
    if (window.location.pathname !== target) window.history.pushState({}, '', target);
    ch.track({ id: myIdRef.current, name, isHost: false, gamePhase: 'lobby' });
    setPhase('lobby');
  }

  // ── Host: Game Logic ──────────────────────────────────────

  async function startGame() {
    setPhase('loading');
    setLoadingStatus('Loading questions...');
    try {
      const { questions, cache } = await loadQuestionSet(
        settings, settings.questionCount, cachedWordsRef.current, setLoadingStatus
      );
      cachedWordsRef.current = cache;
      questionBankRef.current = questions;
      qIdxRef.current = 0;

      const all = connectedPlayersRef.current;
      const ordered = [myName, ...all.filter(p => !p.isHost).map(p => p.name)];
      playerNamesRef.current = ordered;
      pIdxRef.current = 0;

      const stats = {};
      ordered.forEach(n => {
        stats[n] = { correct: 0, wrong: 0, totalCorrectTime: 0, totalCorrectCount: 0, roundsSurvived: 0, mathAnswers: 0, triviaAnswers: 0, vocabAnswers: 0 };
      });
      playerStatsRef.current = stats;
      resetInactivity();

      // 3-2-1 countdown before first round
      for (let i = COUNTDOWN_SECONDS; i >= 1; i--) {
        const payload = { phase: 'countdown', mode, playerNames: ordered, countdownValue: i };
        setLiveState(payload);
        setPhase('countdown');
        channelRef.current?.send({ type: 'broadcast', event: 'sync_state', payload });
        await new Promise(r => setTimeout(r, 1000));
      }

      beginRound();
    } catch (err) {
      console.error(err);
      setLoadingStatus('Error loading questions.');
      setTimeout(() => setPhase('lobby'), 2500);
    }
  }

  function beginRound() {
    clearInterval(tickIntervalRef.current);
    let spp = 20;
    if (settings.timerLength === 'short') spp = 12;
    else if (settings.timerLength === 'long') spp = 30;
    const totalMs = playerNamesRef.current.length * spp * (0.85 + Math.random() * 0.3) * 1000;
    totalTimeRef.current = totalMs;
    endTimeRef.current = Date.now() + totalMs;
    wrongTimestampsRef.current = [];
    turnStartTimeRef.current = Date.now();
    setUrgency(0);
    broadcastState('playing');
    setPhase('playing');

    tickIntervalRef.current = setInterval(() => {
      const timeLeft = endTimeRef.current - Date.now();
      if (timeLeft <= 0) {
        clearInterval(tickIntervalRef.current);
        explodeGame();
        return;
      }
      const u = 1 - timeLeft / totalTimeRef.current;
      setUrgency(u);
      channelRef.current?.send({ type: 'broadcast', event: 'tick', payload: { urgency: u } });
    }, 300);
  }

  function broadcastState(gamePhase, extras = {}) {
    const state = {
      phase: gamePhase, mode,
      playerNames: playerNamesRef.current,
      currentPlayerIndex: pIdxRef.current,
      currentQuestion: questionBankRef.current[qIdxRef.current],
      currentQuestionIndex: qIdxRef.current,
      ...extras,
    };
    setLiveState(state);
    channelRef.current?.send({ type: 'broadcast', event: 'sync_state', payload: state });
  }

  function explodeGame() {
    const loserName = playerNamesRef.current[pIdxRef.current];
    const endStats = compileLeaderboard(playerStatsRef.current, loserName);
    broadcastState('exploded', { loserName, endStats });
    setPhase('exploded');
    setUrgency(1);
  }

  function handlePlayerAnswer({ questionIndex, answerIndex, playerId }) {
    if (questionIndex !== qIdxRef.current) return;
    const active = playerNamesRef.current[pIdxRef.current];
    const sender = connectedPlayersRef.current.find(p => p.id === playerId);
    if (!sender || sender.name !== active) return;
    processAnswer(answerIndex);
  }

  function handleHostAnswer(answerIndex) {
    if (playerNamesRef.current[pIdxRef.current] !== myName) return;
    processAnswer(answerIndex);
  }

  function processAnswer(answerIndex) {
    const qObj = questionBankRef.current[qIdxRef.current];
    const isCorrect = answerIndex === qObj.a;
    const timeSpent = (Date.now() - turnStartTimeRef.current) / 1000;
    const currentName = playerNamesRef.current[pIdxRef.current];
    const stats = { ...playerStatsRef.current[currentName] };

    if (isCorrect) {
      stats.correct += 1;
      stats.totalCorrectTime += timeSpent;
      stats.totalCorrectCount += 1;
      stats.roundsSurvived += 1;
      if (qObj.category === 'Math') stats.mathAnswers += 1;
      else if (qObj.category === 'Trivia') stats.triviaAnswers += 1;
      else if (qObj.category === 'Vocabulary') stats.vocabAnswers += 1;
    } else {
      stats.wrong += 1;
      if (settings.antiSpam) {
        const now = Date.now();
        wrongTimestampsRef.current = wrongTimestampsRef.current.filter(t => now - t < 2000);
        wrongTimestampsRef.current.push(now);
        if (wrongTimestampsRef.current.length >= settings.antiSpamThreshold) {
          playerStatsRef.current[currentName] = stats;
          clearInterval(tickIntervalRef.current);
          explodeGame();
          return;
        }
      }
      if (!settings.accessibility) {
        setShake(true);
        setTimeout(() => setShake(false), 300);
        broadcastState('playing', { wasWrong: true });
      }
      endTimeRef.current -= 5000;
    }

    playerStatsRef.current[currentName] = stats;
    resetInactivity();

    if (isCorrect) {
      clearInterval(tickIntervalRef.current);
      const nextIdx = (pIdxRef.current + 1) % playerNamesRef.current.length;
      const nextName = playerNamesRef.current[nextIdx];
      broadcastState('passing', { nextPlayerIndex: nextIdx });
      setPhase('passing');
      passTimeoutRef.current = setTimeout(() => {
        // Resolve by name — the roster may have changed during the pass delay
        const idx = playerNamesRef.current.indexOf(nextName);
        pIdxRef.current = idx >= 0 ? idx : nextIdx % playerNamesRef.current.length;
        qIdxRef.current += 1;
        if (qIdxRef.current >= Math.floor(questionBankRef.current.length * 0.75)) fetchMoreQuestions();
        beginRound();
      }, PASS_DELAY_MS);
    } else {
      qIdxRef.current += 1;
      turnStartTimeRef.current = Date.now();
      broadcastState('playing');
    }
  }

  async function fetchMoreQuestions() {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      const { questions, cache } = await loadQuestionSet(settings, 20, cachedWordsRef.current);
      cachedWordsRef.current = cache;
      questionBankRef.current = [...questionBankRef.current, ...questions];
    } catch (e) {
      console.warn('Background fetch failed', e);
    } finally {
      isFetchingRef.current = false;
    }
  }

  function quitGame() {
    if (isHost) {
      channelRef.current?.send({ type: 'broadcast', event: 'game_ended', payload: {} });
    } else if (roomCode) {
      sessionStorage.removeItem(sessionKey(roomCode)); // quitting is deliberate — don't auto-rejoin
    }
    doCleanup();
    window.location.href = '/hotpotato';
  }

  function kickPlayer(playerId) {
    channelRef.current?.send({ type: 'broadcast', event: 'kick_player', payload: { playerId } });
    setConnectedPlayers(prev => prev.filter(p => p.id !== playerId));
  }

  const roomUrl = `${window.location.origin}/hotpotato/live/${roomCode}`;

  function copyLink() {
    navigator.clipboard.writeText(roomUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function copyCode() {
    navigator.clipboard.writeText(roomCode).then(() => {
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    });
  }

  return {
    isHost, myName, pathCode,
    phase, tab, setTab, mode, setMode,
    roomCode, roomUrl,
    nameInput, setNameInput, codeInput, setCodeInput, error, setError,
    connectedPlayers, liveState, urgency, shake, loadingStatus, timeoutCountdown,
    showShareModal, setShowShareModal, copied, codeCopied,
    connected,
    channelRef, myIdRef,
    handleCreateRoom, handleJoinFromSetup, handleJoinRoom,
    startGame, handleHostAnswer, quitGame, copyLink, copyCode, kickPlayer,
    settings,
  };
}
