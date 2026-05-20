import React from 'react';
import { LogOut } from 'lucide-react';

export default function CentralDisplay({ liveState, urgency, accessibility, onQuit }) {
  const { currentQuestion, playerNames, currentPlayerIndex } = liveState;
  const activePlayer = playerNames?.[currentPlayerIndex];

  return (
    <div className={`hotpotato-container hpl-central-screen ${accessibility ? 'no-flashes' : ''}`}>
      {!accessibility && (
        <div className="hp-pulse-overlay pulsing" style={{
          '--pulse-max': Math.min(urgency * 0.85, 0.85),
          '--pulse-speed': `${Math.max(2.2 - urgency * 2.0, 0.15)}s`,
        }} />
      )}
      <div className="hotpotato-content hpl-central-content">
        <div className="hp-player-tag" style={{ fontSize: '1rem' }}>
          Potato is in: <strong className="hp-active-name">{activePlayer}</strong>'s hands
        </div>
        <div className="hpl-central-question-card">
          <span className="hp-question-cat">{currentQuestion.category}</span>
          <div className="hpl-central-question">{currentQuestion.q}</div>
        </div>
        <div className="hpl-central-answers-grid">
          {currentQuestion.options.map((opt, i) => (
            <div key={i} className="hpl-central-answer-tile">
              <span className="hpl-central-tile-letter">{String.fromCharCode(65 + i)}</span>
              <span className="hpl-central-tile-text">{opt}</span>
            </div>
          ))}
        </div>
      </div>
      <button className="hpl-quit-btn" style={{ position: 'fixed', bottom: 24, left: 24 }} onClick={onQuit}>
        <LogOut size={14} /> Quit
      </button>
    </div>
  );
}
