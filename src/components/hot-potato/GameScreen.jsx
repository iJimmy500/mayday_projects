import React from 'react';

export default function GameScreen({ playerName, question, onAnswer, disabled = false }) {
  if (!question) return null;

  return (
    <div className="hp-fade-in">
      <div className="hp-player-tag">
        <span>Potato is in: <strong className="hp-active-name">{playerName}</strong>'s hands</span>
      </div>

      <div className="hp-question-card">
        <span className="hp-question-cat">{question.category}</span>
        <div className="hp-question">{question.q}</div>
      </div>

      <div className="hp-options-grid">
        {question.options.map((opt, i) => {
          const letter = String.fromCharCode(65 + i);
          return (
            <button
              key={i}
              className={`hp-option${disabled ? ' hp-option-disabled' : ''}`}
              onClick={() => !disabled && onAnswer(i)}
            >
              <span className="hp-option-prefix">{letter}</span>
              <span className="hp-option-text">{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
