import React from 'react';
import { Smartphone, Monitor } from 'lucide-react';
import { BackBtn, Footer } from './LiveSharedUI';

export default function LiveSetupScreen({
  tab, setTab,
  mode, setMode,
  nameInput, setNameInput,
  codeInput, setCodeInput,
  error, setError,
  handleCreateRoom,
  handleJoinFromSetup,
}) {
  return (
    <div className="hotpotato-container">
      <div className="hotpotato-content">
        <div className="hp-fade-in hpl-page">
          <div className="hpl-top-bar">
            <BackBtn />
            <span className="hpl-beta-badge">BETA</span>
          </div>

          <h1 className="hp-title" style={{ marginBottom: '0.15rem' }}>HOT POTATO</h1>
          <p className="hp-subtitle">Live Multiplayer</p>

          <div className="hpl-tabs">
            <button className={`hpl-tab ${tab === 'create' ? 'active' : ''}`} onClick={() => setTab('create')}>
              Create Room
            </button>
            <button className={`hpl-tab ${tab === 'join' ? 'active' : ''}`} onClick={() => setTab('join')}>
              Join Room
            </button>
          </div>

          {tab === 'create' && (
            <form className="hpl-form" onSubmit={handleCreateRoom}>
              <input
                className="hp-player-input"
                placeholder="Your name"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                maxLength={20}
                autoFocus
              />
              <div className="hpl-mode-group">
                <p className="hpl-mode-label">Game mode</p>
                <div className="hpl-mode-options">
                  <button
                    type="button"
                    className={`hpl-mode-card ${mode === 'distributed' ? 'active' : ''}`}
                    onClick={() => setMode('distributed')}
                  >
                    <Smartphone size={18} />
                    <span className="hpl-mode-name">Distributed</span>
                    <span className="hpl-mode-desc">Everyone plays on their own screen</span>
                  </button>
                  <button
                    type="button"
                    className={`hpl-mode-card ${mode === 'central' ? 'active' : ''}`}
                    onClick={() => setMode('central')}
                  >
                    <Monitor size={18} />
                    <span className="hpl-mode-name">Central</span>
                    <span className="hpl-mode-desc">One big screen, phones are buzzers</span>
                  </button>
                </div>
              </div>
              <button className="hp-btn-massive" type="submit" disabled={!nameInput.trim()}>
                Create Room
              </button>
            </form>
          )}

          {tab === 'join' && (
            <form className="hpl-form" onSubmit={handleJoinFromSetup}>
              <input
                className="hp-player-input"
                placeholder="Your name"
                value={nameInput}
                onChange={e => { setNameInput(e.target.value); setError(''); }}
                maxLength={20}
                autoFocus
              />
              <input
                className="hp-player-input hpl-code-input"
                placeholder="Room code"
                value={codeInput}
                onChange={e => { setCodeInput(e.target.value.toUpperCase()); setError(''); }}
                maxLength={6}
                spellCheck={false}
              />
              {error && <p className="hpl-error">{error}</p>}
              <button
                className="hp-btn-massive"
                type="submit"
                disabled={!nameInput.trim() || codeInput.trim().length < 4}
              >
                Join Game
              </button>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
