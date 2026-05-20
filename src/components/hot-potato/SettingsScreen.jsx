import React from 'react';
import { Flower } from 'lucide-react';
import { TRIVIA_CATEGORIES } from '../../utils/hotPotatoUtils';

export default function SettingsScreen({ settings, toggleSetting, setSettings, onContinue }) {
  return (
    <div className="hp-fade-in">
      <h1 className="hp-title">HOT POTATO</h1>
      <p className="hp-subtitle">Select Settings</p>
      
      <div className="hp-settings-group">
        <div className="hp-settings-title">Question Categories</div>
        <div className="hp-toggle-row">
          <span className="hp-toggle-label">Math Challenges</span>
          <button className={`hp-toggle-btn ${settings.math ? 'active' : ''}`} onClick={() => toggleSetting('math')}>
            {settings.math ? 'ON' : 'OFF'}
          </button>
        </div>
        <div className="hp-toggle-row">
          <span className="hp-toggle-label">Trivia Questions</span>
          <button className={`hp-toggle-btn ${settings.trivia ? 'active' : ''}`} onClick={() => toggleSetting('trivia')}>
            {settings.trivia ? 'ON' : 'OFF'}
          </button>
        </div>
        
        {settings.trivia && (
          <div className="hp-toggle-row">
            <span className="hp-toggle-label hp-sub-label">Trivia Category</span>
            <select 
              className="hp-select"
              value={settings.triviaCat}
              onChange={(e) => setSettings(prev => ({ ...prev, triviaCat: e.target.value }))}
            >
              {TRIVIA_CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="hp-toggle-row">
          <span className="hp-toggle-label">Vocabulary Match</span>
          <button className={`hp-toggle-btn ${settings.vocab ? 'active' : ''}`} onClick={() => toggleSetting('vocab')}>
            {settings.vocab ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      <div className="hp-settings-pair">
        <div className="hp-settings-half">
          <div className="hp-settings-title" style={{ marginBottom: '0.4rem' }}>Question Bank</div>
          <div className="hp-segmented" style={{ margin: 0 }}>
            {[15, 30, 45, 60].map(cnt => (
              <button
                key={cnt}
                className={`hp-segment ${settings.questionCount === cnt ? 'active' : ''}`}
                onClick={() => setSettings(prev => ({ ...prev, questionCount: cnt }))}
              >
                {cnt}
              </button>
            ))}
          </div>
          <div className="hp-half-sublabel">Questions to load</div>
        </div>

        <div className="hp-settings-half">
          <div className="hp-settings-title" style={{ marginBottom: '0.4rem' }}>Timer</div>
          <div className="hp-segmented" style={{ margin: 0 }}>
            <button className={`hp-segment ${settings.timerLength === 'short' ? 'active' : ''}`} onClick={() => setSettings(prev => ({ ...prev, timerLength: 'short' }))}>S</button>
            <button className={`hp-segment ${settings.timerLength === 'medium' ? 'active' : ''}`} onClick={() => setSettings(prev => ({ ...prev, timerLength: 'medium' }))}>M</button>
            <button className={`hp-segment ${settings.timerLength === 'long' ? 'active' : ''}`} onClick={() => setSettings(prev => ({ ...prev, timerLength: 'long' }))}>L</button>
          </div>
          <div className="hp-half-sublabel">Short / Med / Long</div>
        </div>
      </div>

      <div className="hp-settings-pair">
        <div className="hp-settings-half">
          <div className="hp-settings-title" style={{ marginBottom: '0.4rem' }}>Spam Protection</div>
          <button className={`hp-toggle-btn ${settings.antiSpam ? 'active' : ''}`} onClick={() => toggleSetting('antiSpam')}>
            {settings.antiSpam ? 'ON' : 'OFF'}
          </button>
          {settings.antiSpam && (
            <>
              <div className="hp-half-sublabel">Trigger after (per 2s)</div>
              <div className="hp-segmented" style={{ margin: 0 }}>
                {[2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    className={`hp-segment ${settings.antiSpamThreshold === n ? 'active' : ''}`}
                    onClick={() => setSettings(prev => ({ ...prev, antiSpamThreshold: n }))}
                  >
                    {n}×
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="hp-settings-half">
          <div className="hp-settings-title" style={{ marginBottom: '0.4rem' }}>Accessibility</div>
          <button className={`hp-toggle-btn ${settings.accessibility ? 'active' : ''}`} onClick={() => toggleSetting('accessibility')}>
            {settings.accessibility ? 'ON' : 'OFF'}
          </button>
          <div className="hp-half-sublabel">No flashes or shakes</div>
        </div>
      </div>

      <button
        className="hp-btn-massive hp-btn-success"
        disabled={!settings.math && !settings.trivia && !settings.vocab}
        onClick={onContinue}
      >
        Continue
      </button>

      <button
        className="hp-btn-massive hpl-online-btn"
        style={{ marginTop: '0.5rem' }}
        onClick={() => window.location.href = '/hotpotato/live'}
      >
        Play Online <span className="hpl-beta-badge" style={{ marginLeft: 8, verticalAlign: 'middle' }}>BETA</span>
      </button>
    </div>
  );
}
