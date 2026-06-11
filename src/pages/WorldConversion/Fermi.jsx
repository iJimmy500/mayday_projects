import { useState, useCallback, useRef, useEffect } from 'react';
import {
  FE_ROUNDS, getPool, pickFermiPair, fermiScore, isBullseye,
  parseGuess, fermiRating, singularizeUnit, formatValue,
} from './gameEngine';
import { CATEGORIES } from './conversions';

function formatBig(n) {
  if (n >= 1e12) return `${parseFloat((n / 1e12).toPrecision(3))} trillion`;
  if (n >= 1e9)  return `${parseFloat((n / 1e9).toPrecision(3))} billion`;
  if (n >= 1e6)  return `${parseFloat((n / 1e6).toPrecision(3))} million`;
  if (n >= 1000) return Math.round(n).toLocaleString();
  return parseFloat(n.toPrecision(3)).toLocaleString();
}

function offByText(guess, answer) {
  const ratio = guess / answer;
  if (ratio >= 1) {
    const x = parseFloat(ratio.toPrecision(2));
    return x < 1.05 ? 'dead on' : `${x}× too high`;
  }
  const x = parseFloat((1 / ratio).toPrecision(2));
  return x < 1.05 ? 'dead on' : `${x}× too low`;
}

// Position of a value on a log scale spanning answer ± 3 orders of magnitude
function logPos(value, answer) {
  const span = 3;
  const off = Math.log10(value / answer);
  return Math.min(100, Math.max(0, ((off + span) / (2 * span)) * 100));
}

export default function Fermi({ config, onBack }) {
  const { categoryId, difficulty } = config;
  const pool = getPool(categoryId, difficulty);

  const [round,     setRound]     = useState(1);
  const [score,     setScore]     = useState(0);
  const [phase,     setPhase]     = useState('guessing');
  const [pair,      setPair]      = useState(() => pickFermiPair(pool));
  const [rawGuess,  setRawGuess]  = useState('');
  const [lastGuess, setLastGuess] = useState(null);
  const [recentIds, setRecentIds] = useState([]);
  const [bullseyes, setBullseyes] = useState(0);
  const [best,      setBest]      = useState(
    () => parseInt(localStorage.getItem('wc_fermi_best') ?? '0', 10)
  );
  const inputRef = useRef(null);

  useEffect(() => {
    if (phase === 'guessing') inputRef.current?.focus();
  }, [phase, pair]);

  const guessValue = parseGuess(rawGuess);

  const submit = useCallback(() => {
    if (!pair || guessValue == null) return;
    setLastGuess(guessValue);
    setScore(s => s + fermiScore(guessValue, pair.answer));
    if (isBullseye(guessValue, pair.answer)) setBullseyes(b => b + 1);
    setPhase('revealing');
  }, [pair, guessValue]);

  const next = useCallback(() => {
    if (round >= FE_ROUNDS) {
      const total = score;
      if (total > best) {
        setBest(total);
        localStorage.setItem('wc_fermi_best', String(total));
      }
      setPhase('finished');
      return;
    }
    const nextRecent = [...recentIds.slice(-8), pair.small.id, pair.big.id];
    const nextPair = pickFermiPair(pool, nextRecent);
    if (!nextPair) { setPhase('finished'); return; }
    setRecentIds(nextRecent);
    setPair(nextPair);
    setRawGuess('');
    setLastGuess(null);
    setRound(r => r + 1);
    setPhase('guessing');
  }, [round, score, best, recentIds, pair, pool]);

  const restart = useCallback(() => {
    setPair(pickFermiPair(pool));
    setRawGuess('');
    setLastGuess(null);
    setRecentIds([]);
    setRound(1);
    setScore(0);
    setBullseyes(0);
    setPhase('guessing');
  }, [pool]);

  const nudge = useCallback((factor) => {
    const cur = parseGuess(rawGuess);
    const base = cur ?? (factor > 1 ? 1 : 10);
    const v = base * factor;
    setRawGuess(v >= 1e15 ? v.toExponential(2) : String(parseFloat(v.toPrecision(6))));
    inputRef.current?.focus();
  }, [rawGuess]);

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

  if (phase === 'finished') {
    const avg = Math.round(score / FE_ROUNDS);
    return (
      <div className="wcg-root">
        <div className="wcg-gameover">
          <div>
            <div className="wcg-gameover-title">{fermiRating(avg)}</div>
            <div className="wcg-gameover-score">{score}</div>
            <div className="wcg-fm-best">best: {Math.max(best, score)} / {FE_ROUNDS * 100}</div>
          </div>
          <div className="wcg-gameover-stats">
            <div className="wcg-gameover-stat">
              <span>{avg}</span>
              <span>avg / round</span>
            </div>
            <div className="wcg-gameover-stat">
              <span>{bullseyes}</span>
              <span>bullseyes</span>
            </div>
          </div>
          <div className="wcg-gameover-actions">
            <button className="wcg-restart-btn" onClick={restart}>Play again</button>
            <button className="wcg-hub-btn"     onClick={onBack}>Change mode</button>
          </div>
          <p className="wcg-estimate-note">within 25% of the true ratio counts as a bullseye</p>
        </div>
      </div>
    );
  }

  const cat = CATEGORIES[pair.categoryId];
  const roundPts = lastGuess != null ? fermiScore(lastGuess, pair.answer) : 0;
  const bullseye = lastGuess != null && isBullseye(lastGuess, pair.answer);

  return (
    <div className="wcg-root">
      <div className="wcg-stats">
        <div className="wcg-stat">
          <span className="wcg-stat-label">score</span>
          <span className="wcg-stat-value">{score}</span>
        </div>
        <div className="wcg-stat">
          <span className="wcg-stat-label">round</span>
          <span className="wcg-stat-value">{round} / {FE_ROUNDS}</span>
        </div>
        {bullseyes > 0 && (
          <div className="wcg-stat">
            <span className="wcg-stat-label">bullseyes</span>
            <span className="wcg-stat-value wcg-stat-value--streak">{bullseyes}</span>
          </div>
        )}
      </div>

      <div className="wcg-game-area">
        <div className="wcg-category-tag">{cat.label}</div>

        <div className="wcg-fm-question">
          <div className="wcg-fm-big-card">
            <span className="wcg-fm-one">1 ×</span>
            <span className="wcg-fm-big-label">{singularizeUnit(pair.big.label)}</span>
            {pair.big.hint && <span className="wcg-fm-hint">{pair.big.hint}</span>}
          </div>
          <div className="wcg-fm-equals">≈ how many</div>
          <div className="wcg-fm-small-label">
            {pair.small.label}
            {pair.small.hint && <span className="wcg-fm-hint">{pair.small.hint}</span>}
          </div>
        </div>

        {phase === 'guessing' && (
          <>
            <div className="wcg-fm-input-row">
              <button className="wcg-fm-nudge" onClick={() => nudge(0.1)} title="divide by 10">÷10</button>
              <input
                ref={inputRef}
                className="wcg-fm-input"
                type="text"
                inputMode="decimal"
                placeholder="your estimate"
                value={rawGuess}
                onChange={e => setRawGuess(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') submit(); }}
                spellCheck={false}
                autoComplete="off"
              />
              <button className="wcg-fm-nudge" onClick={() => nudge(10)} title="multiply by 10">×10</button>
            </div>
            <div className="wcg-fm-parsed">
              {guessValue != null
                ? <>= {formatBig(guessValue)}</>
                : <span className="wcg-fm-parsed-hint">tip: "2.5k", "40m", "1.2b" work too</span>}
            </div>
            <div className="wcg-action-row">
              <button className="wcg-next-btn" onClick={submit} disabled={guessValue == null}>
                lock it in
              </button>
            </div>
          </>
        )}

        {phase === 'revealing' && (
          <>
            <div className={`wcg-fm-result${bullseye ? ' wcg-fm-result--bullseye' : ''}`}>
              <div className="wcg-fm-answer">{formatBig(pair.answer)}</div>
              <div className="wcg-fm-offby">
                {bullseye ? '🎯 bullseye — ' : ''}you said {formatBig(lastGuess)} ({offByText(lastGuess, pair.answer)})
              </div>

              <div className="wcg-fm-scale">
                <div className="wcg-fm-scale-track" />
                <div className="wcg-fm-scale-mark wcg-fm-scale-mark--answer" style={{ left: '50%' }}>
                  <span>truth</span>
                </div>
                <div
                  className="wcg-fm-scale-mark wcg-fm-scale-mark--guess"
                  style={{ left: `${logPos(lastGuess, pair.answer)}%` }}
                >
                  <span>you</span>
                </div>
              </div>
              <div className="wcg-fm-scale-legend">
                <span>÷1000</span><span>÷10</span><span>spot on</span><span>×10</span><span>×1000</span>
              </div>

              <div className="wcg-fm-points">+{roundPts} points</div>
            </div>

            <div className="wcg-fm-facts">
              <div className="wcg-fm-fact">
                <span>{singularizeUnit(pair.big.label)}</span>
                <span>{formatValue(pair.big.value, cat.baseUnit)}</span>
              </div>
              <div className="wcg-fm-fact">
                <span>{singularizeUnit(pair.small.label)}</span>
                <span>{formatValue(pair.small.value, cat.baseUnit)}</span>
              </div>
            </div>

            <div className="wcg-action-row">
              <button className="wcg-next-btn" onClick={next}>
                {round >= FE_ROUNDS ? 'See results' : 'Next round'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
