import { useState, useCallback } from 'react';
import { CATEGORY_META, OE_ROUNDS, getPool, pickFour, formatValue, oeScore } from './gameEngine';
import { CATEGORIES } from './conversions';

export default function OrderEm({ config, onBack }) {
  const { categoryId, difficulty } = config;
  const pool = getPool(categoryId, difficulty);

  const fresh = useCallback(() => pickFour(pool), [pool]);

  const [round,      setRound]      = useState(1);
  const [score,      setScore]      = useState(0);
  const [phase,      setPhase]      = useState('ordering');
  const [current,   setCurrent]    = useState(() => fresh());
  const [clickOrder, setClickOrder] = useState([]);

  const handleCardClick = useCallback((unitId) => {
    if (phase !== 'ordering') return;
    setClickOrder(prev => {
      if (prev.includes(unitId)) return prev.slice(0, prev.indexOf(unitId));
      if (prev.length >= 4) return prev;
      return [...prev, unitId];
    });
  }, [phase]);

  const submit = useCallback(() => {
    if (!current) return;
    const correctIds = current.sorted.map(u => u.id);
    const correct = clickOrder.filter((id, i) => id === correctIds[i]).length;
    setScore(s => s + oeScore(correct));
    setPhase('revealing');
  }, [current, clickOrder]);

  const next = useCallback(() => {
    if (round >= OE_ROUNDS) { setPhase('finished'); return; }
    setCurrent(fresh());
    setClickOrder([]);
    setRound(r => r + 1);
    setPhase('ordering');
  }, [round, fresh]);

  const restart = useCallback(() => {
    setCurrent(fresh());
    setClickOrder([]);
    setRound(1);
    setScore(0);
    setPhase('ordering');
  }, [fresh]);

  if (!current) return (
    <div className="wcg-root">
      <div className="wcg-game-area">
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
          Not enough data for this combination — try a different category or difficulty.
        </p>
        <button className="wcg-hub-btn" onClick={onBack}>Back</button>
      </div>
    </div>
  );

  const cat  = CATEGORIES[current.categoryId];
  const meta = CATEGORY_META[current.categoryId];

  if (phase === 'finished') {
    const perfect = OE_ROUNDS * 4;
    return (
      <div className="wcg-root">
        <div className="wcg-gameover">
          <div>
            <div className="wcg-gameover-title">finished — {OE_ROUNDS} rounds</div>
            <div className="wcg-gameover-score">{score}</div>
          </div>
          <div className="wcg-gameover-stats">
            <div className="wcg-gameover-stat">
              <span>{perfect}</span>
              <span>max possible</span>
            </div>
            <div className="wcg-gameover-stat">
              <span>{Math.round((score / perfect) * 100)}%</span>
              <span>accuracy</span>
            </div>
          </div>
          <div className="wcg-gameover-actions">
            <button className="wcg-restart-btn" onClick={restart}>Play again</button>
            <button className="wcg-hub-btn"     onClick={onBack}>Change mode</button>
          </div>
          <p className="wcg-estimate-note">values are approximate, each adjacent pair is at least 3× apart</p>
        </div>
      </div>
    );
  }

  const correctIds   = current.sorted.map(u => u.id);
  const correctCount = phase === 'revealing'
    ? clickOrder.filter((id, i) => id === correctIds[i]).length
    : null;

  return (
    <div className="wcg-root">
      <div className="wcg-stats">
        <div className="wcg-stat">
          <span className="wcg-stat-label">score</span>
          <span className="wcg-stat-value">{score}</span>
        </div>
        <div className="wcg-stat">
          <span className="wcg-stat-label">round</span>
          <span className="wcg-stat-value">{round} / {OE_ROUNDS}</span>
        </div>
      </div>

      <div className="wcg-game-area">
        <div className="wcg-category-tag">{cat.label}</div>
        <div className="wcg-question-text">
          {phase === 'ordering'
            ? 'Click to rank — smallest first'
            : meta.question.replace('?', ' — correct order')}
        </div>

        {phase === 'ordering' && (
          <>
            <div className="wcg-oe-grid">
              {current.items.map(unit => {
                const rank = clickOrder.indexOf(unit.id);
                const sel  = rank !== -1;
                return (
                  <button
                    key={unit.id}
                    className={`wcg-oe-card${sel ? ' wcg-oe-card--selected' : ''}`}
                    onClick={() => handleCardClick(unit.id)}
                  >
                    <span className={`wcg-rank-badge${sel ? ' wcg-rank-badge--filled' : ''}`}>
                      {sel ? rank + 1 : '·'}
                    </span>
                    <div className="wcg-oe-label">{unit.label}</div>
                    {unit.hint && <div className="wcg-oe-hint">{unit.hint}</div>}
                  </button>
                );
              })}
            </div>
            <div className="wcg-action-row">
              <button
                className="wcg-next-btn"
                onClick={submit}
                disabled={clickOrder.length < 4}
              >
                {clickOrder.length < 4 ? `select ${4 - clickOrder.length} more` : 'submit ranking'}
              </button>
            </div>
          </>
        )}

        {phase === 'revealing' && (
          <>
            <div className="wcg-oe-reveal-list">
              {current.sorted.map((unit, i) => (
                <div
                  key={unit.id}
                  className={`wcg-oe-reveal-row${clickOrder[i] === unit.id ? ' wcg-oe-reveal-row--correct' : ' wcg-oe-reveal-row--wrong'}`}
                >
                  <span className="wcg-oe-reveal-pos">#{i + 1}</span>
                  <span className="wcg-oe-reveal-label">{unit.label}</span>
                  <span className="wcg-oe-reveal-value">{formatValue(unit.value, cat.baseUnit)}</span>
                </div>
              ))}
            </div>
            <div className="wcg-round-result">
              {correctCount === 4
                ? <strong>Perfect! +4 points</strong>
                : <>{correctCount === 0 ? 'None correct' : <><strong>{correctCount}/4</strong> correct</>}{' — '}+{oeScore(correctCount)} points</>
              }
            </div>
            <div className="wcg-action-row">
              <button className="wcg-next-btn" onClick={next}>
                {round >= OE_ROUNDS ? 'See results' : 'Next round'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
