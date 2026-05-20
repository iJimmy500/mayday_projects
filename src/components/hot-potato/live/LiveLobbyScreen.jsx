import React from 'react';
import { Share2, Users, X } from 'lucide-react';
import { QuitBtn, Footer, TimeoutBanner, ShareModal } from './LiveSharedUI';

export default function LiveLobbyScreen({
  isHost, myName, roomCode, roomUrl, gameMode,
  connectedPlayers, maxPlayers,
  showShareModal, setShowShareModal, copied, onCopy,
  timeoutCountdown,
  onStart, onQuit, onKick,
}) {
  const canStart = connectedPlayers.length >= 2;

  return (
    <div className="hotpotato-container">
      {showShareModal && (
        <ShareModal
          roomUrl={roomUrl}
          roomCode={roomCode}
          copied={copied}
          onCopy={onCopy}
          onClose={() => setShowShareModal(false)}
        />
      )}
      <div className="hotpotato-content">
        <div className="hp-fade-in hpl-page">
          <div className="hpl-top-bar">
            <QuitBtn onQuit={onQuit} />
            {isHost && (
              <button className="hpl-share-btn" onClick={() => setShowShareModal(true)}>
                <Share2 size={14} /> Share
              </button>
            )}
          </div>

          <h1 className="hp-title" style={{ marginBottom: 0 }}>HOT POTATO</h1>
          <p className="hp-subtitle">
            Lobby · <span className="hpl-room-code-inline">{roomCode}</span>
            {gameMode === 'central' && <span className="hpl-mode-pill">Central</span>}
            {gameMode === 'distributed' && <span className="hpl-mode-pill">Distributed</span>}
          </p>

          {!isHost && (
            <div className="hpl-waiting-msg">Waiting for host to start...</div>
          )}

          <div className="hpl-player-list">
            <div className="hpl-player-list-title">
              <Users size={13} /> Players ({connectedPlayers.length}/{maxPlayers})
            </div>
            {connectedPlayers.map(p => (
              <div key={p.id} className="hpl-player-row">
                <span className="hpl-player-dot" />
                <span className="hpl-player-name">{p.name}</span>
                {p.isHost && <span className="hpl-host-tag">host</span>}
                {p.name === myName && <span className="hpl-you-tag">you</span>}
                {isHost && !p.isHost && (
                  <button className="hpl-kick-btn" onClick={() => onKick(p.id)} title="Remove player">
                    <X size={12} />
                  </button>
                )}
              </div>
            ))}
            {connectedPlayers.length === 0 && <p className="hpl-empty">Connecting...</p>}
          </div>

          {isHost && (
            <button
              className="hp-btn-massive"
              style={{ marginTop: '0.75rem' }}
              disabled={!canStart}
              onClick={onStart}
            >
              {canStart
                ? 'Start Game'
                : `Waiting for ${2 - connectedPlayers.length} more player${connectedPlayers.length === 1 ? '' : 's'}`}
            </button>
          )}

          <TimeoutBanner countdown={timeoutCountdown} />
        </div>
      </div>
      <Footer />
    </div>
  );
}
