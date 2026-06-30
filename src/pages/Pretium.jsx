import { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { buildRound, STANDARD_ROUNDS } from '../data/pretiumData';
import './Pretium.css';

// Dynamic Audio Synthesizer
const playSynthSound = (type, audioCtxRef) => {
  try {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'success') {
      // Sparkling digital upgrade chime
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
      osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.24); // C6
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } else if (type === 'error') {
      // Classic deep buzzer sound
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'click') {
      // Light tactile mechanical tick sound
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    }
  } catch (err) {
    console.warn("Audio Context playback failed or unsupported:", err);
  }
};

export default function Pretium() {
  const [gameMode, setGameMode] = useState('standard'); // standard, time, zen
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [items, setItems] = useState([]);
  const [isRevealed, setIsRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isFinished, setIsFinished] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isShake, setIsShake] = useState(false);
  const [isPop, setIsPop] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // PB score tracking
  const [pbScores, setPbScores] = useState({ standard: 0, time: 0 });
  const [roundMeta, setRoundMeta] = useState({ category: '', blurb: '' });

  const audioCtxRef = useRef(null);
  const timerRef = useRef(null);
  const usedNamesRef = useRef(new Set());

  // Initialize or fetch high scores
  useEffect(() => {
    const saved = localStorage.getItem('pretium_pb');
    if (saved) {
      try {
        setPbScores(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  // Build each round from the curated catalog
  useEffect(() => {
    setIsLoading(true);
    const round = buildRound(currentLevelIdx + 1, usedNamesRef.current);
    if (round) {
      round.items.forEach(i => usedNamesRef.current.add(i.name));
      setRoundMeta({ category: round.category, blurb: round.blurb });
      setItems(round.items);
    }
    setIsRevealed(false);
    setIsLoading(false);
  }, [currentLevelIdx, gameMode, reloadTrigger]);

  // Timer configuration for Time Attack Mode
  useEffect(() => {
    if (gameMode === 'time' && !isFinished) {
      setTimeLeft(60);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsFinished(true);
            triggerPBCheck();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [gameMode, isFinished]);

  const resetRound = () => {
    setIsRevealed(false);
    // Shuffle the current active items in state
    setItems(prev => [...prev].sort(() => Math.random() - 0.5));
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 1600);
  };

  const handleMove = (index, direction) => {
    playSynthSound('click', audioCtxRef);
    const newItems = [...items];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= newItems.length) return;

    // Swap elements
    const temp = newItems[index];
    newItems[index] = newItems[targetIdx];
    newItems[targetIdx] = temp;
    setItems(newItems);
  };

  const checkSortingOrder = () => {
    setIsRevealed(true);
    let allCorrect = true;

    // Verify each sorted item is strictly equal or greater than the next in list
    for (let i = 0; i < items.length - 1; i++) {
      if (items[i].price > items[i + 1].price) {
        allCorrect = false;
      }
    }

    if (allCorrect) {
      playSynthSound('success', audioCtxRef);
      triggerToast('Perfect Sort!');
      setScore((prev) => prev + 10);
      setIsPop(true);
      setTimeout(() => setIsPop(false), 300);

      // Progressive level increment or round looping
      setTimeout(() => {
        if (gameMode === 'standard') {
          if (currentLevelIdx < STANDARD_ROUNDS - 1) {
            setCurrentLevelIdx((prev) => prev + 1);
          } else {
            setIsFinished(true);
            triggerPBCheck();
          }
        } else {
          // Time attack / Zen modes keep generating fresh rounds infinitely
          setCurrentLevelIdx((prev) => prev + 1);
        }
      }, 1800);
    } else {
      playSynthSound('error', audioCtxRef);
      triggerToast('Sorting Error!');
      setIsShake(true);
      setTimeout(() => setIsShake(false), 400);

      if (gameMode === 'standard') {
        // Standard mode ends on sorting error to represent failure/perfection conditions
        setTimeout(() => {
          setIsFinished(true);
          triggerPBCheck();
        }, 1800);
      } else if (gameMode === 'time') {
        // Time attack deducts 5 seconds for mistakes
        setTimeLeft((prev) => Math.max(0, prev - 5));
        setTimeout(() => {
          setIsRevealed(false);
          // Keep same item order to allow correction
        }, 1800);
      } else {
        // Zen mode has no penalty, just hides reveals after 2 seconds so you can retry
        setTimeout(() => {
          setIsRevealed(false);
        }, 2000);
      }
    }
  };

  const triggerPBCheck = () => {
    setPbScores((prev) => {
      const modeName = gameMode === 'time' ? 'time' : 'standard';
      const currentPB = prev[modeName] || 0;
      if (score > currentPB) {
        const updated = { ...prev, [modeName]: score };
        localStorage.setItem('pretium_pb', JSON.stringify(updated));
        return updated;
      }
      return prev;
    });
  };

  const handleRestart = () => {
    playSynthSound('click', audioCtxRef);
    usedNamesRef.current = new Set();
    setScore(0);
    setCurrentLevelIdx(0);
    setIsFinished(false);
    setIsRevealed(false);
    setReloadTrigger(prev => prev + 1);
  };

  return (
    <div className="pret-theme">
      <main className="pret-main">
        {/* Modern Minimal top bar */}
        <header className="pret-top-bar">
          <div className="pret-logo">Pretium</div>
          <div className="pret-modes">
            {['standard', 'time', 'zen'].map((m) => (
              <button
                key={m}
                className={`pret-mode-btn ${gameMode === m ? 'active' : ''}`}
                onClick={() => {
                  playSynthSound('click', audioCtxRef);
                  usedNamesRef.current = new Set();
                  setGameMode(m);
                  setScore(0);
                  setCurrentLevelIdx(0);
                  setIsFinished(false);
                  setIsRevealed(false);
                  setReloadTrigger(prev => prev + 1);
                }}
              >
                {m}
              </button>
            ))}
          </div>
        </header>

        {/* Live level details card */}
        <section className="pret-level-card">
          <h1 className="pret-level-title">
            Round {currentLevelIdx + 1}
            {gameMode === 'standard' && ` / ${STANDARD_ROUNDS}`}
            {roundMeta.category && <span className="pret-level-category"> — {roundMeta.category}</span>}
          </h1>
          {roundMeta.blurb && <p className="pret-level-blurb">{roundMeta.blurb}</p>}
        </section>

        {/* Dynamic statistics indicators */}
        <div className="pret-stats-bar">
          <div className="pret-stat-item">
            <span>Score:</span>
            <span className="pret-stat-highlight">{score}</span>
          </div>
          {gameMode === 'time' && (
            <div className="pret-stat-item">
              <span>Time:</span>
              <span className={`pret-stat-highlight ${timeLeft < 10 ? 'pret-revealed-incorrect' : ''}`}>
                {timeLeft}s
              </span>
            </div>
          )}
          <div className="pret-stat-item">
            <span>Best:</span>
            <span className="pret-stat-highlight">
              {gameMode === 'time' ? pbScores.time : pbScores.standard}
            </span>
          </div>
        </div>

        {/* Dynamic sorting list area */}
        <div className={`pret-sort-list ${isShake ? 'pret-shake-animation' : ''} ${isPop ? 'pret-pop-animation' : ''}`}>
          {isLoading ? (
            // Premium shimmer skeleton loading templates
            Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="pret-sort-item pret-skeleton-item">
                <div className="pret-rank-badge">{idx + 1}</div>
                <div className="pret-item-info">
                  <div className="pret-skeleton-text title"></div>
                  <div className="pret-skeleton-text desc"></div>
                </div>
              </div>
            ))
          ) : (
            items.map((item, idx) => {
              // Simple placement feedback logic for correctness
              let statusClass = "";
              if (isRevealed) {
                const correctIdx = [...items]
                  .sort((a, b) => a.price - b.price)
                  .findIndex((x) => x.name === item.name);
                statusClass = correctIdx === idx ? "pret-revealed-correct" : "pret-revealed-incorrect";
              }

              return (
                <div key={`${item.name}-${item.price}-${idx}`} className="pret-sort-item">
                  <div className="pret-rank-badge">{idx + 1}</div>
                  <div className="pret-item-info">
                    <span className="pret-item-name">{item.name}</span>
                    <span className="pret-item-desc">{item.detail}</span>
                  </div>

                  {isRevealed ? (
                    <span className={`pret-price-reveal ${statusClass}`}>
                      ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  ) : (
                    <div className="pret-sort-controls">
                      <button
                        className="pret-arrow-btn"
                        disabled={idx === 0}
                        onClick={() => handleMove(idx, -1)}
                        title="Move Up"
                      >
                        <ChevronUp size={16} />
                      </button>
                      <button
                        className="pret-arrow-btn"
                        disabled={idx === items.length - 1}
                        onClick={() => handleMove(idx, 1)}
                        title="Move Down"
                      >
                        <ChevronDown size={16} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Active interactive submit action bar */}
        <footer className="pret-actions">
          <button
            className="pret-submit-btn"
            disabled={isRevealed}
            onClick={checkSortingOrder}
          >
            Submit Order
          </button>
          <button 
            className="pret-reset-btn" 
            onClick={() => {
              playSynthSound('click', audioCtxRef);
              setReloadTrigger(prev => prev + 1);
            }}
            title="Fetch completely fresh randomized products"
          >
            Refresh
          </button>
          <button className="pret-reset-btn" onClick={resetRound}>
            Reset
          </button>
        </footer>
      </main>

      {/* Floating Micro toast bubble */}
      {toastMessage && <div className="pret-popup-toast">{toastMessage}</div>}

      {/* Full Page Failure / Completion Dialogue */}
      {isFinished && (
        <div className="pret-result-overlay">
          <div className="pret-result-dialog">
            <span className="pret-dialog-category">Game Over</span>
            <h2 className="pret-dialog-title">
              {gameMode === 'standard' && currentLevelIdx === STANDARD_ROUNDS - 1 && score > 0
                ? "Perfect Win!"
                : "Round Finished!"}
            </h2>
            <p className="pret-dialog-desc">
              {gameMode === 'standard'
                ? "You made a pricing error or completed all premium packages! Retrying resets levels."
                : `You sorted sets perfectly in time limit of 60 seconds.`}
            </p>

            <div className="pret-dialog-score-row">
              <div className="pret-score-stat">
                <span className="pret-score-label">Score</span>
                <span className="pret-score-value">{score}</span>
              </div>
              <div className="pret-score-stat">
                <span className="pret-score-label">Personal Best</span>
                <span className="pret-score-value">
                  {gameMode === 'time' ? pbScores.time : pbScores.standard}
                </span>
              </div>
            </div>

            <div className="pret-dialog-actions">
              <button className="pret-dialog-btn" onClick={handleRestart}>
                Play Again
              </button>
              <button className="pret-dialog-close" onClick={() => setIsFinished(false)}>
                Review Board
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
