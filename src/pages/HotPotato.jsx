import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Flower } from 'lucide-react';
import './HotPotato.css';

// Import Modular Components
import SettingsScreen from '../components/hot-potato/SettingsScreen';
import PlayersScreen from '../components/hot-potato/PlayersScreen';
import LoadingScreen from '../components/hot-potato/LoadingScreen';
import ReadyScreen from '../components/hot-potato/ReadyScreen';
import GameScreen from '../components/hot-potato/GameScreen';
import PassingScreen from '../components/hot-potato/PassingScreen';
import ExplodedScreen from '../components/hot-potato/ExplodedScreen';

// Import Utilities
import { loadQuestionSet, compileLeaderboard } from '../utils/hotPotatoUtils';

export default function HotPotato() {
  // Game States: 'setup_settings', 'setup_players', 'loading', 'start', 'playing', 'passing', 'exploded'
  const [gameState, setGameState] = useState('setup_settings'); 
  
  const [settings, setSettings] = useState({
    math: true,
    trivia: true,
    vocab: true,
    timerLength: 'medium',
    triviaCat: 'any',
    questionCount: 30,
    accessibility: false,
    antiSpam: true,
    antiSpamThreshold: 3
  });

  const [players, setPlayers] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [passMode, setPassMode] = useState('order'); // 'order' or 'random'
  
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [nextPlayerIndex, setNextPlayerIndex] = useState(null);
  const [questionBank, setQuestionBank] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Game Loop States
  const [loadingStatus, setLoadingStatus] = useState('');
  const [urgency, setUrgency] = useState(0);
  const [shake, setShake] = useState(false);
  const [loserName, setLoserName] = useState('');
  
  // Game Stats
  const [playerStats, setPlayerStats] = useState({});
  const turnStartTimeRef = useRef(null);

  // Timer Refs
  const endTimeRef = useRef(null);
  const totalTimeRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const isFetchingMoreRef = useRef(false);
  
  // Words list cache
  const cachedWordsRef = useRef([]);

  // Anti-spam: timestamps of recent wrong answers for the current holder
  const wrongTimestampsRef = useRef([]);

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Add a player
  const addPlayer = (e) => {
    e.preventDefault();
    const name = newPlayerName.trim();
    if (!name) return;
    if (players.includes(name)) return;
    if (players.length >= 12) return;
    setPlayers(prev => [...prev, name]);
    setNewPlayerName('');
  };

  // Remove a player
  const removePlayer = (name) => {
    setPlayers(prev => prev.filter(p => p !== name));
  };

  // Shuffle players
  const shufflePlayers = () => {
    setPlayers(prev => [...prev].sort(() => 0.5 - Math.random()));
  };

  // Start initialization of the entire game
  const initGame = async () => {
    setGameState('loading');
    try {
      const { questions, cache } = await loadQuestionSet(settings, settings.questionCount, cachedWordsRef.current, setLoadingStatus);
      cachedWordsRef.current = cache;
      setQuestionBank(questions);
      setCurrentQuestionIndex(0);
      
      // Initialize stats
      const statsObj = {};
      players.forEach(p => {
        statsObj[p] = {
          correct: 0,
          wrong: 0,
          totalCorrectTime: 0,
          totalCorrectCount: 0,
          roundsSurvived: 0,
          mathAnswers: 0,
          triviaAnswers: 0,
          vocabAnswers: 0
        };
      });
      
      setPlayerStats(statsObj);
      setCurrentPlayerIndex(0);
      setGameState('start');
    } catch (err) {
      console.error(err);
      setLoadingStatus('Error loading questions. Check your internet connection.');
      setTimeout(() => setGameState('setup_settings'), 3000);
    }
  };

  // Game timer starting
  const startGame = () => {
    // Dynamic Player-Based Timer Calculation:
    // Base time: 20 seconds per player
    // Modifier based on selected Timer Length setting:
    // - Short: 12 seconds per player
    // - Medium: 20 seconds per player
    // - Long: 30 seconds per player
    let secondsPerPlayer = 20;
    if (settings.timerLength === 'short') secondsPerPlayer = 12;
    else if (settings.timerLength === 'long') secondsPerPlayer = 30;

    const baseTimeSeconds = players.length * secondsPerPlayer;
    // Add a random variation factor between -15% and +15%
    const variation = 0.85 + Math.random() * 0.3;
    const totalMs = baseTimeSeconds * variation * 1000;
    
    totalTimeRef.current = totalMs;
    endTimeRef.current = Date.now() + totalMs;
    
    setUrgency(0);
    wrongTimestampsRef.current = [];
    turnStartTimeRef.current = Date.now();
    setGameState('playing');

    startTimer();
  };

  const startTimer = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    
    timerIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const timeLeft = endTimeRef.current - now;
      
      if (timeLeft <= 0) {
        clearInterval(timerIntervalRef.current);
        setLoserName(players[currentPlayerIndex]);
        setGameState('exploded');
        setUrgency(1);
      } else {
        const p = 1 - (timeLeft / totalTimeRef.current);
        setUrgency(p);
      }
    }, 100);
  };

  // Select next player
  const selectNextPlayer = () => {
    if (passMode === 'order') {
      return (currentPlayerIndex + 1) % players.length;
    } else {
      let randIndex;
      do {
        randIndex = Math.floor(Math.random() * players.length);
      } while (randIndex === currentPlayerIndex && players.length > 1);
      return randIndex;
    }
  };

  // Background fetch of extra questions if needed
  const fetchMoreQuestions = async () => {
    if (isFetchingMoreRef.current) return;
    isFetchingMoreRef.current = true;
    try {
      const { questions, cache } = await loadQuestionSet(settings, 20, cachedWordsRef.current);
      cachedWordsRef.current = cache;
      setQuestionBank(prev => [...prev, ...questions]);
    } catch (e) {
      console.warn("Background fetch failed", e);
    } finally {
      isFetchingMoreRef.current = false;
    }
  };

  const handleAnswer = (index) => {
    const qObj = questionBank[currentQuestionIndex];
    const isCorrect = index === qObj.a;
    const timeSpent = (Date.now() - turnStartTimeRef.current) / 1000;
    
    setPlayerStats(prev => {
      const pStats = { ...prev[players[currentPlayerIndex]] };
      if (isCorrect) {
        pStats.correct += 1;
        pStats.totalCorrectTime += timeSpent;
        pStats.totalCorrectCount += 1;
        
        if (qObj.category === 'Math') pStats.mathAnswers += 1;
        else if (qObj.category === 'Trivia') pStats.triviaAnswers += 1;
        else if (qObj.category === 'Vocabulary') pStats.vocabAnswers += 1;
      } else {
        pStats.wrong += 1;
      }
      return { ...prev, [players[currentPlayerIndex]]: pStats };
    });

    if (isCorrect) {
      const nextIdx = selectNextPlayer();
      setNextPlayerIndex(nextIdx);

      // Update round count for current player
      setPlayerStats(prev => {
        const pStats = { ...prev[players[currentPlayerIndex]] };
        pStats.roundsSurvived += 1;
        return { ...prev, [players[currentPlayerIndex]]: pStats };
      });

      setGameState('passing');
    } else {
      // Anti-spam check: N wrong answers within 2 seconds = instant explosion
      if (settings.antiSpam) {
        const now = Date.now();
        const window = 2000;
        wrongTimestampsRef.current = wrongTimestampsRef.current.filter(t => now - t < window);
        wrongTimestampsRef.current.push(now);

        if (wrongTimestampsRef.current.length >= settings.antiSpamThreshold) {
          clearInterval(timerIntervalRef.current);
          setLoserName(players[currentPlayerIndex]);
          setGameState('exploded');
          setUrgency(1);
          return;
        }
      }

      if (!settings.accessibility) {
        setShake(true);
        setTimeout(() => setShake(false), 300);
      }

      // Apply Penalty (-5s)
      if (endTimeRef.current) {
        endTimeRef.current -= 5000;
      }

      // Load next question
      advanceQuestion();
      turnStartTimeRef.current = Date.now();
    }
  };

  const advanceQuestion = () => {
    const nextIdx = currentQuestionIndex + 1;
    setCurrentQuestionIndex(nextIdx);
    
    // Pre-loading check
    if (nextIdx >= Math.floor(questionBank.length * 0.75)) {
      fetchMoreQuestions();
    }
  };

  const nextPlayerReady = () => {
    setCurrentPlayerIndex(nextPlayerIndex);
    setNextPlayerIndex(null);
    advanceQuestion();

    wrongTimestampsRef.current = [];
    turnStartTimeRef.current = Date.now();
    setGameState('playing');
  };

  const restartGame = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setGameState('setup_settings');
    setUrgency(0);
    setQuestionBank([]);
  };

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const endStats = gameState === 'exploded' ? compileLeaderboard(playerStats, loserName) : null;

  return (
    <div className={`hotpotato-container ${settings.accessibility ? 'no-flashes' : ''}`} style={{ backgroundColor: gameState === 'exploded' ? '#0b0b0b' : '#000' }}>
      
      {/* Dynamic Pulse screen flash overlay */}
      {gameState !== 'setup_settings' && gameState !== 'setup_players' && gameState !== 'loading' && gameState !== 'exploded' && !settings.accessibility && (
        <div 
          className="hp-pulse-overlay pulsing"
          style={{
            '--pulse-max': Math.min(urgency * 0.85, 0.85),
            '--pulse-speed': `${Math.max(2.2 - urgency * 2.0, 0.15)}s`
          }}
        />
      )}

      <div className={`hotpotato-content ${shake ? 'shake' : ''}`}>
        
        {/* SETUP SCREEN 1: SETTINGS */}
        {gameState === 'setup_settings' && (
          <SettingsScreen 
            settings={settings}
            toggleSetting={toggleSetting}
            setSettings={setSettings}
            onContinue={() => setGameState('setup_players')}
          />
        )}

        {/* SETUP SCREEN 2: PLAYERS */}
        {gameState === 'setup_players' && (
          <PlayersScreen 
            players={players}
            addPlayer={addPlayer}
            removePlayer={removePlayer}
            shufflePlayers={shufflePlayers}
            newPlayerName={newPlayerName}
            setNewPlayerName={setNewPlayerName}
            passMode={passMode}
            setPassMode={setPassMode}
            onBack={() => setGameState('setup_settings')}
            onStartGame={initGame}
          />
        )}

        {/* LOADING SCREEN */}
        {gameState === 'loading' && (
          <LoadingScreen loadingStatus={loadingStatus} />
        )}

        {/* READY SCREEN */}
        {gameState === 'start' && (
          <ReadyScreen 
            firstPlayerName={players[0]}
            passMode={passMode}
            onPlay={startGame}
          />
        )}

        {/* PLAYING SCREEN */}
        {gameState === 'playing' && (
          <GameScreen 
            playerName={players[currentPlayerIndex]}
            question={questionBank[currentQuestionIndex]}
            onAnswer={handleAnswer}
          />
        )}

        {/* PASSING SCREEN */}
        {gameState === 'passing' && nextPlayerIndex !== null && (
          <PassingScreen 
            nextPlayerName={players[nextPlayerIndex]}
            onReady={nextPlayerReady}
          />
        )}

        {/* EXPLODED SCREEN */}
        {gameState === 'exploded' && (
          <ExplodedScreen 
            loserName={loserName}
            endStats={endStats}
            onRestart={restartGame}
          />
        )}

      </div>

      <footer className="page-footer">
        <a href="https://mayinflight.com" className="footer-link" target="_blank" rel="noopener noreferrer">
          mayday <Flower size={14} strokeWidth={1.5} />
        </a>
      </footer>
    </div>
  );
}
