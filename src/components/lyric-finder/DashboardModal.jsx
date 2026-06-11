import { useState } from 'react';
import { X, Flower } from 'lucide-react';

export default function DashboardModal({
  isOpen,
  onClose,
  history,
  sessionHistory,
  settings,
  setSettings,
  playlistInfo
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const correctCount = history.filter(h => h.correct).length;
  const totalCount = history.length;
  const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
  const streak = (() => {
    let s = 0;
    for (const h of history) { if (h.correct) s++; else break; }
    return s;
  })();

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="db-overlay" onClick={onClose}>
      <div className="db-sheet" onClick={e => e.stopPropagation()}>
        <div className="db-handle" />

        <div className="db-header">
          <h2 className="db-title">Dashboard</h2>
          <div className="db-header-right">
            <button className="db-share-btn" onClick={handleShare}>
              {copied ? 'Copied!' : 'Share'}
            </button>
            <button className="db-close-btn" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="db-body">
          <div className="db-stats-grid">
            <div className="db-stat-card correct">
              <span className="db-stat-num">{correctCount}</span>
              <span className="db-stat-label">Correct</span>
            </div>
            <div className="db-stat-card">
              <span className="db-stat-num">{accuracy}<span className="db-stat-unit">%</span></span>
              <span className="db-stat-label">Accuracy</span>
            </div>
            <div className="db-stat-card">
              <span className="db-stat-num">{totalCount}</span>
              <span className="db-stat-label">Played</span>
            </div>
            <div className="db-stat-card streak">
              <span className="db-stat-num">{streak}</span>
              <span className="db-stat-label">Streak</span>
            </div>
          </div>

          {playlistInfo?.type !== 'artist' && (
            <div className="db-section">
              <p className="db-section-label">Game Mode</p>
              <div className="db-chip-row">
                {['title', 'artist', 'both'].map(m => (
                  <button
                    key={m}
                    className={`db-chip ${settings.mode === m ? 'active' : ''}`}
                    onClick={() => setSettings({ ...settings, mode: m })}
                  >
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="db-section">
            <p className="db-section-label">Settings</p>
            <div className="db-surface">
              <div className="db-row">
                <div className="db-row-info">
                  <span className="db-row-label">Hint Lines</span>
                  <span className="db-row-sub">Revealed per wrong guess</span>
                </div>
                <div className="db-chip-row small">
                  {[1, 2, 3].map(d => (
                    <button
                      key={d}
                      className={`db-chip small ${settings.hintDepth === d ? 'active' : ''}`}
                      onClick={() => setSettings({ ...settings, hintDepth: d })}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="db-row-sep" />

              <div className="db-row">
                <div className="db-row-info">
                  <span className="db-row-label">Auto-Skip</span>
                  <span className="db-row-sub">Go to the next song after a correct guess</span>
                </div>
                <button
                  className={`db-toggle ${settings.autoSkip ? 'on' : ''}`}
                  onClick={() => setSettings({ ...settings, autoSkip: !settings.autoSkip })}
                  aria-label="Toggle auto-skip"
                />
              </div>

              <div className="db-row-sep" />

              <div className="db-row">
                <div className="db-row-info">
                  <span className="db-row-label">Strict Matching</span>
                  <span className="db-row-sub">Requires exact spelling (no fuzzy)</span>
                </div>
                <button
                  className={`db-toggle ${settings.strictMode ? 'on' : ''}`}
                  onClick={() => setSettings({ ...settings, strictMode: !settings.strictMode })}
                  aria-label="Toggle strict matching"
                />
              </div>
            </div>
          </div>

          <div className="db-section db-history-section">
            <p className="db-section-label">Recent Session</p>
            {history.length > 0 ? (
              <div className="db-history-list">
                {history.map((h, i) => (
                  <div key={i} className={`db-history-item ${h.correct ? 'correct' : 'missed'}`}>
                    {h.art && <img src={h.art} alt="" className="db-history-art" />}
                    <div className="db-history-info">
                      <span className="db-history-track">{h.track}</span>
                      <span className="db-history-artist">{h.artist}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="db-empty">
                <p>No songs played yet</p>
              </div>
            )}
          </div>
        </div>

        <div className="db-footer">
          <a href="https://mayinflight.com" target="_blank" rel="noopener noreferrer" className="db-mayday-link">
            mayday <Flower size={13} strokeWidth={1.5} />
          </a>
        </div>
      </div>
    </div>
  );
}
