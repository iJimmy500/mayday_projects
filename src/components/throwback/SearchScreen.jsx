import React from 'react';
import { Flower, Trophy } from 'lucide-react';
import { TODAY_SHORT, YEARS } from './constants';

export default function SearchScreen({ username, setUsername, year, setYear, mode, setMode, onSubmit, inputRef }) {
  return (
    <div className="tb-fade-in tb-search-page">
      <div className="tb-logo">
        <div className="tb-logo-eyebrow">day 20</div>
        <div className="tb-logo-text">THROWBACK</div>
        <div className="tb-logo-sub">what were you playing on {TODAY_SHORT}?</div>
      </div>

      <form className="tb-form" onSubmit={onSubmit}>
        <div className="tb-input-group">
          <label className="tb-label">Last.fm username</label>
          <input
            ref={inputRef}
            className="tb-input"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="firstonmarz"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
          />
        </div>

        <div className="tb-input-group">
          <label className="tb-label">Go back to</label>
          <div className="tb-year-grid">
            {YEARS.map(y => (
              <button key={y} type="button"
                className={`tb-year-btn${year === y ? ' active' : ''}`}
                onClick={() => setYear(y)}>
                {y}
              </button>
            ))}
          </div>
        </div>

        <div className="tb-input-group">
          <label className="tb-label">Mode</label>
          <div className="tb-mode-toggle">
            <button type="button"
              className={`tb-mode-btn${mode === 'browse' ? ' active' : ''}`}
              onClick={() => setMode('browse')}>
              browse
            </button>
            <button type="button"
              className={`tb-mode-btn${mode === 'quiz' ? ' active' : ''}`}
              onClick={() => setMode('quiz')}>
              <Trophy size={12} /> quiz
            </button>
          </div>
        </div>

        <button className="tb-submit" type="submit" disabled={!username.trim()}>
          rewind to {year}
        </button>
      </form>

      <footer className="tb-footer">
        <a href="https://mayinflight.com" className="tb-footer-link" target="_blank" rel="noopener noreferrer">
          mayday <Flower size={13} strokeWidth={1.5} />
        </a>
      </footer>
    </div>
  );
}
