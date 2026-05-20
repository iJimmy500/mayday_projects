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
  return Math.random().toString(36).substring(2, 8).toUpperCase();
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
  const pathCode = path.startsWith('/hotpotato/live/')
    ? path.split('/hotpotato/live/')[1].toUpperCase()
    : null;
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

  useEffect(() => { connectedPlayersRef.current = connectedPlayers; }, [connectedPlayers]);
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
    return Object.values(raw).flat().map(p => ({ id: p.id, name: p.name, isHost: p.isHost, gamePhase: p.gamePhase }));
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

  // ── Room validation (URL joiners only) ───────────────────

  function validateRoom(code) {
    if (channelRef.current) return;

    const ch = supabase.channel(`hotpotato-${code}`, {
      config: { presence: { key: myIdRef.current } },
    });

    validateTimerRef.current = setTimeout(() => {
      if (!hasJoinedRef.current) {
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
        setPhase('already_started');
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
      } catch (_) {}

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
        doCleanup();
        setPhase('kicked');
      }
    });

    ch.subscribe((status) => {
      setConnected(status === 'SUBSCRIBED');
    });

    channelRef.current = ch;
    setRoomCode(code);
  }

  // ── Shared channel setup (host + setup-screen joiners) ───

  function subscribeToChannel(code, name, host) {
    if (channelRef.current) return;

    const ch = supabase.channel(`hotpotato-${code}`, {
      config: { presence: { key: myIdRef.current } },
    });

    ch.on('presence', { event: 'sync' }, () => {
      const raw = ch.presenceState();
      const list = parsePresenceList(raw);
      setConnectedPlayers(list);
      if (host) {
        resetInactivity();
      } else if (checkHostLeft(list)) {
        return;
      }
    });

    if (host) {
      ch.on('broadcast', { event: 'submit_answer' }, ({ payload }) => handlePlayerAnswer(payload));
    } else {
      ch.on('broadcast', { event: 'sync_state' }, ({ payload }) => {
        setLiveState(payload);
        setPhase(payload.phase);
        if (payload.wasWrong) {
          setShake(true);
          setTimeout(() => setShake(false), 300);
        }
      });
      ch.on('broadcast', { event: 'tick' }, ({ payload }) => setUrgency(payload.urgency));
      ch.on('broadcast', { event: 'game_ended' }, ({ payload }) => {
        setPhase(payload?.reason === 'timeout' ? 'timed_out' : 'ended');
      });
      ch.on('broadcast', { event: 'inactivity_warning' }, ({ payload }) => setTimeoutCountdown(payload.seconds));
      ch.on('broadcast', { event: 'inactivity_clear' }, () => setTimeoutCountdown(null));
      ch.on('broadcast', { event: 'kick_player' }, ({ payload }) => {
        if (payload.playerId === myIdRef.current) {
          doCleanup();
          setPhase('kicked');
        }
      });
    }

    ch.subscribe(async (status) => {
      setConnected(status === 'SUBSCRIBED');
      if (status === 'SUBSCRIBED') {
        if (!host) {
          const existing = Object.values(ch.presenceState()).flat();
          if (existing.length >= MAX_PLAYERS) {
            ch.unsubscribe();
            channelRef.current = null;
            setConnected(false);
            setError('Room is full (8 players max).');
            setPhase('setup');
            return;
          }
          if (existing.some(p => p.name.toLowerCase() === name.toLowerCase())) {
            ch.unsubscribe();
            channelRef.current = null;
            setConnected(false);
            setError('That name is already taken. Choose another.');
            setPhase('setup');
            return;
          }
          persistSession(name, code);
        }
        await ch.track({ id: myIdRef.current, name, isHost: host, gamePhase: 'lobby' });
      }
    });

    channelRef.current = ch;
  }

  function doCleanup() {
    clearTimeout(validateTimerRef.current);
    clearInterval(tickIntervalRef.current);
    clearTimeout(passTimeoutRef.current);
    clearTimeout(inactivityTimerRef.current);
    clearInterval(warnCountdownRef.current);
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
    setRoomCode(code);
    window.history.pushState({}, '', `/hotpotato/live/${code}`);
    subscribeToChannel(code, name, true);
    setPhase('lobby');
    setTimeout(resetInactivity, 0);
  }

  function handleJoinFromSetup(e) {
    e.preventDefault();
    const name = nameInput.trim();
    const code = codeInput.trim().toUpperCase();
    if (!name || !code) return;
    localStorage.setItem(LS_NAME_KEY, name);
    setMyName(name);
    setRoomCode(code);
    window.history.pushState({}, '', `/hotpotato/live/${code}`);
    subscribeToChannel(code, name, false);
    setPhase('lobby');
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
    const existing = Object.values(ch.presenceState()).flat();
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
    setNameInput(name);
    hasJoinedRef.current = true;
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
      broadcastState('passing', { nextPlayerIndex: nextIdx });
      setPhase('passing');
      passTimeoutRef.current = setTimeout(() => {
        pIdxRef.current = nextIdx;
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
