import React from 'react';
import { Zap, AlertTriangle, Crown, Calculator, Bomb } from 'lucide-react';

export default function ExplodedScreen({ loserName, endStats, onRestart }) {
  if (!endStats) return null;
  
  return (
    <div className="hp-exploded-container hp-fade-in">
      <h2 className="hp-explode-msg">BOOM!</h2>
      <p className="hp-subtitle" style={{ color: '#fff', marginBottom: '1rem' }}>
        The potato exploded in <strong style={{ color: '#ff3b30' }}>{loserName}</strong>'s hands!
      </p>

      {/* Highlights badges */}
      <div className="hp-highlights">
        {endStats.highlights.fastest && (
          <div className="hp-highlight-card">
            <Zap size={28} style={{ color: '#ffcc00', marginBottom: '8px' }} />
            <span className="hp-hl-title">Fastest Thinker</span>
            <span className="hp-hl-value">{endStats.highlights.fastest.name} ({endStats.highlights.fastest.avgSpeedStr}s)</span>
          </div>
        )}
        {endStats.highlights.mostPenalized && (
          <div className="hp-highlight-card">
            <AlertTriangle size={28} style={{ color: '#ff3b30', marginBottom: '8px' }} />
            <span className="hp-hl-title">Most Penalized</span>
            <span className="hp-hl-value">{endStats.highlights.mostPenalized.name} ({endStats.highlights.mostPenalized.wrong} wrongs)</span>
          </div>
        )}
        {endStats.highlights.triviaKing && (
          <div className="hp-highlight-card">
            <Crown size={28} style={{ color: '#ff9500', marginBottom: '8px' }} />
            <span className="hp-hl-title">Trivia King</span>
            <span className="hp-hl-value">{endStats.highlights.triviaKing.name}</span>
          </div>
        )}
        {endStats.highlights.mathProdigy && (
          <div className="hp-highlight-card">
            <Calculator size={28} style={{ color: '#30d158', marginBottom: '8px' }} />
            <span className="hp-hl-title">Math Prodigy</span>
            <span className="hp-hl-value">{endStats.highlights.mathProdigy.name}</span>
          </div>
        )}
      </div>

      {/* Scoreboard table */}
      <div className="hp-scoreboard">
        <div className="hp-scoreboard-title">Final Standings</div>
        <table className="hp-table">
          <thead>
            <tr>
              <th>Player</th>
              <th>Correct</th>
              <th>Wrong</th>
              <th>Avg Speed</th>
              <th>Rounds</th>
            </tr>
          </thead>
          <tbody>
            {endStats.leaderboard.map(row => (
              <tr key={row.name} className={row.name === loserName ? 'row-loser' : ''}>
                <td style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {row.name} 
                  {row.name === loserName && <Bomb size={16} style={{ color: '#ff3b30' }} />}
                </td>
                <td>{row.correct}</td>
                <td>{row.wrong}</td>
                <td>{row.avgSpeedStr}s</td>
                <td>{row.rounds}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button className="hp-btn-massive" onClick={onRestart} style={{ marginTop: '1.25rem' }}>Play Again</button>
    </div>
  );
}
