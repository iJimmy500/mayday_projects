import React from 'react';
import { BackBtn, Footer } from './LiveSharedUI';

export default function LiveJoinScreen({ pathCode, nameInput, setNameInput, error, setError, handleJoinRoom }) {
  return (
    <div className="hotpotato-container">
      <div className="hotpotato-content">
        <div className="hp-fade-in hpl-page">
          <div className="hpl-top-bar">
            <BackBtn />
            <span className="hpl-beta-badge">BETA</span>
          </div>
          <h1 className="hp-title" style={{ marginBottom: '0.15rem' }}>HOT POTATO</h1>
          <p className="hp-subtitle">Room <span className="hpl-room-code-inline">{pathCode}</span></p>
          <form className="hpl-form" onSubmit={handleJoinRoom}>
            <input
              className="hp-player-input"
              placeholder="Your name"
              value={nameInput}
              onChange={e => { setNameInput(e.target.value); setError(''); }}
              maxLength={20}
              autoFocus
            />
            {error && <p className="hpl-error">{error}</p>}
            <button className="hp-btn-massive" type="submit" disabled={!nameInput.trim()}>
              Join Game
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
