import { useState, useEffect, useCallback } from 'react';
import {
  CATEGORY_META, HL_LIVES,
  getPool, pickPair, formatValue, streakMultiplier,
} from './gameEngine';
import { CATEGORIES } from './conversions';

const REVEAL_DELAY = 1600;

export default function HigherLower({ config, onBack }) {
  const { categoryId, difficulty } = config;
  const pool = getPool(categoryId, difficulty);

  const [pair,       setPair]       = useState(() => pickPair(pool));
  const [phase,      setPhase]      = useState('questioning');
  const [selected,   setSelected]   = useState(null);
  const [score,      setScore]      = useState(0);
  const [streak,     setStreak]     = useState(0);
  const [bestStreak, setBestStreak] = useState(
    () => parseInt(localStorage.getItem('wc_hl_best') ?? '0', 10)
  );
  const [lives,      setLives]      = useState(HL_LIVES);
  const [answered,   setAnswered]   = useState(0);
  const [recentIds,  setRecentIds]  = useState([]);

  const advance = useCallback(() => {
    const next = pickPair(pool, recentIds);
    if (!next) { setPhase('gameover'); return; }
    setRecentIds(prev => [...prev.slice(-10), next.a.id, next.b.id]);
    setPair(next);
    setSelected(null);
    setPhase('questioning');
  }, [pool, recentIds]);

  const handlePick = useCallback((side) => {
    if (phase !== 'questioning' || !pair) return;
    const correct = side === pair.bigger;
    setSelected(side);
    setPhase('revealing');

    if (correct) {
      const mult = streakMultiplier(streak);
      setScore(s => s + Math.round(1 * mult));
      setStreak(s => {
        const next = s + 1;
        if (next > bestStreak) {
          setBestStreak(next);
          localStorage.setItem('wc_hl_best', String(next));
        }
        return next;
      });
    } else {
      setStreak(0);
      setLives(l => {
        const next = l - 1;
        if (next <= 0) setTimeout(() => setPhase('gameover'), REVEAL_DELAY);
        return next;
      });
    }
    setAnswered(a => a + 1);
  }, [phase, pair, streak, bestStreak]);

  useEffect(() => {
    if (phase !== 'revealing') return;
    const wasCorrect = selected === pair?.bigger;
    if (!wasCorrect && lives <= 0) return;
    const t = setTimeout(advance, REVEAL_DELAY);
    return () => clearTimeout(t);
  }, [phase, selected, pair, lives, advance]);

  const restart = useCallback(() => {
    setPair(pickPair(pool));
    setPhase('questioning');
    setSelected(null);
    setScore(0);
    setStreak(0);
    setLives(HL_LIVES);
    setAnswered(0);
    setRecentIds([]);
  }, [pool]);

  if (!pair) return (
    <div className="wcg-root">
      <div className="wcg-game-area">
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
          Not enough data for this combination — try a different category or difficulty.
        </p>
        <button className="wcg-hub-btn" onClick={onBack}>Back</button>
      </div>
    </div>
  );

  const cat     = CATEGORIES[pair.categoryId];
  const meta    = CATEGORY_META[pair.categoryId];
  const mult    = streakMultiplier(streak);
  const revealA = phase === 'revealing';

  const cardState = (side) => {
    if (phase === 'questioning') return '';
    if (side === pair.bigger)   return 'wcg-hl-card--correct';
    if (side === selected)      return 'wcg-hl-card--wrong';
    return 'wcg-hl-card--neutral';
  };

  if (phase === 'gameover') {
    return (
      <div className="wcg-root">
        <div className="wcg-gameover">
          <div>
            <div className="wcg-gameover-title">game over</div>
            <div className="wcg-gameover-score">{score}</div>
          </div>
          <div className="wcg-gameover-stats">
            <div className="wcg-gameover-stat">
              <span>{answered}</span>
              <span>answered</span>
            </div>
            <div className="wcg-gameover-stat">
              <span>{bestStreak}</span>
              <span>best streak</span>
            </div>
          </div>
          <div className="wcg-gameover-actions">
            <button className="wcg-restart-btn" onClick={restart}>Play again</button>
            <button className="wcg-hub-btn"     onClick={onBack}>Change mode</button>
          </div>
          <p className="wcg-estimate-note">values are approximate, pairs are always separated by at least 3×</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wcg-root">
      <div className="wcg-stats">
        <div className="wcg-stat">
          <span className="wcg-stat-label">score</span>
          <span className="wcg-stat-value">{score}</span>
        </div>
        <div className="wcg-stat">
          <span className="wcg-stat-label">streak</span>
          <span className="wcg-stat-value wcg-stat-value--streak">{streak}</span>
        </div>
        {mult > 1 && (
          <div className="wcg-stat">
            <span className="wcg-stat-label">mult</span>
            <span className="wcg-multiplier">{mult}×</span>
          </div>
        )}
        <div className="wcg-lives">
          {Array.from({ length: HL_LIVES }).map((_, i) => (
            <div key={i} className={`wcg-life${i >= lives ? ' wcg-life--lost' : ''}`} />
          ))}
        </div>
      </div>

      <div className="wcg-game-area">
        <div className="wcg-category-tag">{cat.label}</div>
        <div className="wcg-question-text">{meta.question}</div>

        <div className="wcg-hl-cards">
          {(['a', 'b']).map(side => {
            const unit = pair[side];
            return (
              <button
                key={side}
                className={`wcg-hl-card ${cardState(side)} ${phase !== 'questioning' ? 'wcg-hl-card--answered' : ''}`}
                onClick={() => handlePick(side)}
              >
                {revealA && side === pair.bigger && (
                  <span className="wcg-hl-correct-badge">correct</span>
                )}
                {revealA && side === selected && side !== pair.bigger && (
                  <span className="wcg-hl-wrong-badge">wrong</span>
                )}
                <div className="wcg-hl-label">{unit.label}</div>
                {unit.hint && <div className="wcg-hl-hint">{unit.hint}</div>}
                {revealA && (
                  <div className="wcg-hl-actual">{formatValue(unit.value, cat.baseUnit)}</div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
