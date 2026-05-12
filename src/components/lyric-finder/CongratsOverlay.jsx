import React from 'react';

/**
 * CongratsOverlay
 * Full-screen overlay displayed when a playlist is fully completed.
 */
export default function CongratsOverlay({ playlistInfo, score, onReturnHome }) {
  return (
    <div className="am-congrats-overlay">
      <div className="am-congrats-card">
        <h2>PLAYLIST COMPLETE</h2>
        <p>
          You've mastered the entire <strong>{playlistInfo?.name}</strong> collection!
        </p>
        <div className="am-congrats-stats">
          <div className="am-stat-item">
            <span>Final Score</span>
            <strong>{score}</strong>
          </div>
        </div>
        <div className="am-congrats-actions">
          <button className="am-congrats-btn primary" onClick={onReturnHome}>
            RETURN HOME
          </button>
        </div>
      </div>
    </div>
  );
}
