import React from 'react';
import { Flower } from 'lucide-react';
import { SCORE_MSGS, CAT_META, itemKey } from './constants';
import ArtThumb from './ArtThumb';

export default function QuizResultScreen({ guesses, actual, cards, category, onRetry, onBrowse }) {
  const total    = actual.length;
  const correct  = guesses.filter((key, i) => actual[i] === key).length;
  const scoreMsg = SCORE_MSGS.find(s => correct >= s.min)?.msg ?? '';
  const meta     = CAT_META[category] ?? CAT_META.tracks;

  return (
    <div className="tb-fade-in tb-quiz-result-page">
      <div className="tb-qr-score-block">
        <span className="tb-qr-pct">
          {correct}<span className="tb-qr-denom">/{total}</span>
        </span>
        <span className="tb-qr-msg">{scoreMsg}</span>
      </div>

      <div className="tb-qr-list-header">
        <span>your guess</span>
        <span>actual</span>
      </div>

      <ol className="tb-qr-list">
        {actual.map((key, i) => {
          const findItem    = k => cards.find(c => itemKey(c, category) === k);
          const actualItem  = findItem(key);
          const guessedKey  = guesses[i];
          const guessedItem = findItem(guessedKey);
          const hit         = guessedKey === key;
          return (
            <li key={i} className={`tb-qr-row${hit ? ' hit' : ''}`}>
              <div className="tb-qr-cell tb-qr-guess">
                <span className="tb-qr-rank">{i + 1}</span>
                {guessedItem
                  ? <><ArtThumb src={guessedItem.art} fallback={meta.fallback} /><span className="tb-qr-name">{guessedItem.name}</span></>
                  : <span className="tb-qr-name tb-qr-empty">—</span>
                }
              </div>
              <div className={`tb-qr-dot${hit ? ' hit' : ''}`} />
              <div className="tb-qr-cell tb-qr-actual">
                {actualItem && (
                  <><ArtThumb src={actualItem.art} fallback={meta.fallback} /><span className="tb-qr-name">{actualItem.name}</span></>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="tb-qr-actions">
        <button className="tb-submit" onClick={onRetry}>try again</button>
        <button className="tb-ghost-btn" style={{ marginTop: 8 }} onClick={onBrowse}>browse results</button>
      </div>

      <footer className="tb-footer">
        <a href="https://mayinflight.com" className="tb-footer-link" target="_blank" rel="noopener noreferrer">
          mayday <Flower size={13} strokeWidth={1.5} />
        </a>
      </footer>
    </div>
  );
}
