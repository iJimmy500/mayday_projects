import React, { useState, useMemo } from 'react';
import { TODAY_LABEL, QUIZ_SIZE, CAT_META, shuffle, itemKey } from './constants';

export default function QuizScreen({ data, onSubmit, onBack }) {
  const [category, setCategory] = useState(null);
  const [guesses, setGuesses]   = useState([]);

  const items     = category ? data[category] : [];
  const quizCount = Math.min(QUIZ_SIZE, items.length);
  const cards     = useMemo(
    () => category ? shuffle(items.slice(0, quizCount)) : [],
    [category]
  );

  function tap(item) {
    const key = itemKey(item, category);
    setGuesses(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  }

  function submit() {
    const actual = items.slice(0, quizCount).map(i => itemKey(i, category));
    onSubmit({ guesses, actual, cards, category });
  }

  function pickCategory(cat) {
    setCategory(cat);
    setGuesses([]);
  }

  const allPicked = guesses.length === quizCount;
  const meta      = category ? CAT_META[category] : null;

  if (!category) {
    return (
      <div className="tb-fade-in tb-quiz-page">
        <div className="tb-results-header">
          <button className="tb-ghost-btn" onClick={onBack}>← back</button>
        </div>
        <div className="tb-date-display" style={{ marginBottom: 4 }}>
          <span className="tb-date-month-day">{TODAY_LABEL}</span>
          <span className="tb-date-year" style={{ fontSize: '2.6rem' }}>rank 'em</span>
        </div>
        <p className="tb-quiz-instruct">what do you want to rank?</p>
        <div className="tb-cat-grid">
          {Object.entries(CAT_META).map(([cat, m]) => {
            const count    = data[cat].length;
            const disabled = count < 2;
            return (
              <button key={cat}
                className={`tb-cat-btn${disabled ? ' disabled' : ''}`}
                onClick={() => !disabled && pickCategory(cat)}
                disabled={disabled}>
                <span className="tb-cat-icon">{m.icon}</span>
                <span className="tb-cat-label">{m.label}</span>
                <span className="tb-cat-count">{count}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="tb-fade-in tb-quiz-page">
      <div className="tb-results-header">
        <button className="tb-ghost-btn" onClick={() => setCategory(null)}>← back</button>
        <span className="tb-quiz-progress">{guesses.length} / {quizCount}</span>
      </div>

      <div className="tb-date-display" style={{ marginBottom: 4 }}>
        <span className="tb-date-month-day">{TODAY_LABEL}</span>
        <span className="tb-date-year" style={{ fontSize: '2.6rem' }}>rank 'em</span>
      </div>
      <p className="tb-quiz-instruct">tap from most → least played</p>

      <div className="tb-quiz-grid">
        {cards.map(item => {
          const key   = itemKey(item, category);
          const rank  = guesses.indexOf(key);
          const picked = rank !== -1;
          const sub   = meta.secondary(item);
          return (
            <button key={key}
              className={`tb-quiz-card${picked ? ' picked' : ''}`}
              onClick={() => tap(item)}>
              {item.art
                ? <img className="tb-quiz-art" src={item.art} alt="" />
                : <div className="tb-quiz-art-placeholder">{meta.fallback}</div>
              }
              <div className="tb-quiz-info">
                <span className="tb-quiz-track">{item.name}</span>
                {sub && <span className="tb-quiz-artist">{sub}</span>}
              </div>
              <div className={`tb-quiz-badge${picked ? ' visible' : ''}`}>
                {picked ? rank + 1 : ''}
              </div>
            </button>
          );
        })}
      </div>

      {allPicked && (
        <button className="tb-submit tb-quiz-submit tb-fade-in" onClick={submit}>
          see how you did
        </button>
      )}
    </div>
  );
}
