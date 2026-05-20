import React from 'react';
import useLiveGame, { MAX_PLAYERS, PASS_DELAY_MS, sendAnswerBroadcast } from '../utils/useLiveGame';
import LiveSetupScreen from '../components/hot-potato/live/LiveSetupScreen';
import LiveJoinScreen from '../components/hot-potato/live/LiveJoinScreen';
import LiveLobbyScreen from '../components/hot-potato/live/LiveLobbyScreen';
import CentralDisplay from '../components/hot-potato/live/CentralDisplay';
import { QuitBtn, Footer, TimeoutBanner, PassCountdown } from '../components/hot-potato/live/LiveSharedUI';
import GameScreen from '../components/hot-potato/GameScreen';
import ExplodedScreen from '../components/hot-potato/ExplodedScreen';
import LoadingScreen from '../components/hot-potato/LoadingScreen';
import './HotPotato.css';
import './HotPotatoLive.css';

export default function HotPotatoLive() {
  const game = useLiveGame();
  const {
    isHost, myName, pathCode,
    phase, tab, setTab, mode, setMode,
    roomCode, roomUrl,
    nameInput, setNameInput, codeInput, setCodeInput, error, setError,
    connectedPlayers, liveState, urgency, shake, loadingStatus, timeoutCountdown,
    showShareModal, setShowShareModal, copied, codeCopied, connected,
    channelRef, myIdRef,
    handleCreateRoom, handleJoinFromSetup, handleJoinRoom,
    startGame, handleHostAnswer, quitGame, copyLink, copyCode, kickPlayer,
    settings,
  } = game;

  const activePlayerName = liveState?.playerNames?.[liveState?.currentPlayerIndex];
  const isMyTurn = activePlayerName === myName;
  const gameMode = liveState?.mode ?? mode;

  // ── Setup ─────────────────────────────────────────────────
  if (phase === 'setup') {
    return (
      <LiveSetupScreen
        tab={tab} setTab={setTab}
        mode={mode} setMode={setMode}
        nameInput={nameInput} setNameInput={setNameInput}
        codeInput={codeInput} setCodeInput={setCodeInput}
        error={error} setError={setError}
        handleCreateRoom={handleCreateRoom}
        handleJoinFromSetup={handleJoinFromSetup}
      />
    );
  }

  // ── Validating ────────────────────────────────────────────
  if (phase === 'validating') {
    return (
      <div className="hotpotato-container">
        <div className="hotpotato-content">
          <div className="hp-fade-in hpl-page hpl-center">
            <p className="hp-title" style={{ marginBottom: '0.25rem' }}>HOT POTATO</p>
            <p className="hpl-ended-msg" style={{ marginBottom: 0 }}>Checking room…</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Join via URL ──────────────────────────────────────────
  if (phase === 'join') {
    return (
      <LiveJoinScreen
        pathCode={pathCode}
        nameInput={nameInput} setNameInput={setNameInput}
        error={error} setError={setError}
        handleJoinRoom={handleJoinRoom}
      />
    );
  }

  // ── Lobby ─────────────────────────────────────────────────
  if (phase === 'lobby') {
    return (
      <LiveLobbyScreen
        isHost={isHost} myName={myName}
        roomCode={roomCode} roomUrl={roomUrl} gameMode={gameMode}
        connectedPlayers={connectedPlayers} maxPlayers={MAX_PLAYERS}
        showShareModal={showShareModal} setShowShareModal={setShowShareModal}
        copied={copied} codeCopied={codeCopied}
        onCopy={copyLink} onCopyCode={copyCode}
        timeoutCountdown={timeoutCountdown} connected={connected}
        onStart={startGame} onQuit={quitGame} onKick={kickPlayer}
      />
    );
  }

  // ── Loading ───────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <div className="hotpotato-container">
        <div className="hotpotato-content">
          <LoadingScreen loadingStatus={loadingStatus} />
        </div>
      </div>
    );
  }

  // ── Countdown ─────────────────────────────────────────────
  if (phase === 'countdown') {
    return (
      <div className="hotpotato-container">
        <div className="hotpotato-content">
          <div className="hp-fade-in hpl-page hpl-center">
            <p className="hpl-countdown-number">{liveState?.countdownValue}</p>
            <p className="hpl-countdown-sub">Get ready!</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Playing ───────────────────────────────────────────────
  if (phase === 'playing' && liveState?.currentQuestion) {
    if (gameMode === 'central') {
      if (isHost) {
        return <CentralDisplay liveState={liveState} urgency={urgency} accessibility={settings.accessibility} onQuit={quitGame} />;
      }
      if (isMyTurn) {
        return (
          <div className="hotpotato-container">
            <div className="hotpotato-content">
              <div className={`hp-fade-in hpl-page ${shake ? 'shake' : ''}`}>
                <div className="hpl-central-your-turn">
                  <p className="hpl-central-prompt">Your turn — look at the screen!</p>
                  <div className="hpl-central-options">
                    {liveState.currentQuestion.options.map((opt, i) => (
                      <button
                        key={i}
                        className="hpl-central-option-btn"
                        onClick={() => sendAnswerBroadcast(channelRef, myIdRef, liveState, i)}
                      >
                        <span className="hpl-central-letter">{String.fromCharCode(65 + i)}</span>
                        <span className="hpl-central-opt-text">{opt}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <QuitBtn onQuit={quitGame} />
              </div>
            </div>
          </div>
        );
      }
      return (
        <div className="hotpotato-container">
          <div className="hotpotato-content">
            <div className="hp-fade-in hpl-page hpl-spectate-central">
              <p className="hpl-spectate-name">{activePlayerName}</p>
              <p className="hpl-spectate-sub">is answering — watch the screen</p>
              <QuitBtn onQuit={quitGame} />
            </div>
          </div>
        </div>
      );
    }

    // Distributed mode
    return (
      <div className="hotpotato-container">
        {!settings.accessibility && (
          <div className="hp-pulse-overlay pulsing" style={{
            '--pulse-max': Math.min(urgency * 0.85, 0.85),
            '--pulse-speed': `${Math.max(2.2 - urgency * 2.0, 0.15)}s`,
          }} />
        )}
        <div className={`hotpotato-content ${shake ? 'shake' : ''}`}>
          <div className="hp-fade-in">
            {!isMyTurn && (
              <div className="hpl-spectating-banner">
                Waiting for <strong>{activePlayerName}</strong> to answer…
              </div>
            )}
            <GameScreen
              playerName={activePlayerName}
              question={liveState.currentQuestion}
              onAnswer={(i) => {
                if (!isMyTurn) return;
                if (isHost) handleHostAnswer(i);
                else sendAnswerBroadcast(channelRef, myIdRef, liveState, i);
              }}
              disabled={!isMyTurn}
            />
            <TimeoutBanner countdown={timeoutCountdown} />
            <QuitBtn onQuit={quitGame} />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Passing ───────────────────────────────────────────────
  if (phase === 'passing' && liveState) {
    const nextName = liveState.playerNames?.[liveState.nextPlayerIndex];
    return (
      <div className="hotpotato-container">
        <div className="hotpotato-content">
          <div className="hp-fade-in hpl-page hpl-center">
            <p className="hp-pass-msg">PASS IT!</p>
            <p className="hpl-pass-sub">Next up: <strong className="hp-active-name">{nextName}</strong></p>
            <div className="hpl-pass-countdown"><PassCountdown ms={PASS_DELAY_MS} /></div>
            <QuitBtn onQuit={quitGame} />
          </div>
        </div>
      </div>
    );
  }

  // ── Exploded ──────────────────────────────────────────────
  if (phase === 'exploded' && liveState?.endStats) {
    return (
      <div className="hotpotato-container" style={{ backgroundColor: '#0b0b0b' }}>
        <div className="hotpotato-content">
          <ExplodedScreen
            loserName={liveState.loserName}
            endStats={liveState.endStats}
            onRestart={() => window.location.href = '/hotpotato'}
          />
        </div>
        <Footer />
      </div>
    );
  }

  // ── Ended / Timed out ─────────────────────────────────────
  if (phase === 'ended' || phase === 'timed_out') {
    return (
      <div className="hotpotato-container">
        <div className="hotpotato-content">
          <div className="hp-fade-in hpl-page hpl-center">
            <p className="hpl-ended-msg">
              {phase === 'timed_out' ? 'Game ended due to inactivity.' : 'The host ended the game.'}
            </p>
            <button className="hp-btn-massive" onClick={() => window.location.href = '/hotpotato'}>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Host left ─────────────────────────────────────────────
  if (phase === 'host_left') {
    return (
      <div className="hotpotato-container">
        <div className="hotpotato-content">
          <div className="hp-fade-in hpl-page hpl-center" style={{ gap: '0.75rem' }}>
            <p className="hp-title" style={{ marginBottom: 0 }}>HOT POTATO</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#e5e5ea', margin: 0 }}>Host Disconnected</p>
            <p style={{ color: '#555', fontSize: '0.95rem', margin: 0 }}>
              The host left the game. It can't continue without them.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', marginTop: '0.5rem' }}>
              <button className="hp-btn-massive" onClick={() => window.location.href = '/hotpotato'}>
                Play Locally
              </button>
              <button className="hp-btn-massive" onClick={() => window.location.href = '/hotpotato/live'}>
                Play Online <span className="hpl-beta-badge" style={{ marginLeft: 6, verticalAlign: 'middle' }}>BETA</span>
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Room not found ────────────────────────────────────────
  if (phase === 'not_found') {
    const reportHref = `mailto:jammerjamez523@gmail.com?subject=${encodeURIComponent('[Hot Potato] Room not found')}&body=${encodeURIComponent(`Room code: ${roomCode || pathCode}\nURL: ${window.location.href}\nDate: ${new Date().toLocaleString()}\n\nDescribe the issue:`)}`;
    return (
      <div className="hotpotato-container">
        <div className="hotpotato-content">
          <div className="hp-fade-in hpl-page hpl-center" style={{ gap: '0.75rem' }}>
            <p className="hp-title" style={{ marginBottom: 0 }}>HOT POTATO</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#e5e5ea', margin: 0 }}>Room Not Found</p>
            <p style={{ color: '#555', fontSize: '0.95rem', margin: 0 }}>
              This room doesn't exist or has already ended.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', marginTop: '0.5rem' }}>
              <button className="hp-btn-massive" onClick={() => window.location.href = '/hotpotato'}>
                Play Locally
              </button>
              <button className="hp-btn-massive" onClick={() => window.location.href = '/hotpotato/live'}>
                Play Online <span className="hpl-beta-badge" style={{ marginLeft: 6, verticalAlign: 'middle' }}>BETA</span>
              </button>
              <a className="hpl-report-link" href={reportHref}>Report an issue</a>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Game already started ──────────────────────────────────
  if (phase === 'already_started') {
    const reportHref = `mailto:jammerjamez523@gmail.com?subject=${encodeURIComponent('[Hot Potato] Tried to join in-progress game')}&body=${encodeURIComponent(`Room code: ${roomCode || pathCode}\nURL: ${window.location.href}\nDate: ${new Date().toLocaleString()}\n\nDescribe the issue:`)}`;
    return (
      <div className="hotpotato-container">
        <div className="hotpotato-content">
          <div className="hp-fade-in hpl-page hpl-center" style={{ gap: '0.75rem' }}>
            <p className="hp-title" style={{ marginBottom: 0 }}>HOT POTATO</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#e5e5ea', margin: 0 }}>Game In Progress</p>
            <p style={{ color: '#555', fontSize: '0.95rem', margin: 0 }}>
              This game has already begun. You can't join mid-round right now — check back when it ends!
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', marginTop: '0.5rem' }}>
              <button className="hp-btn-massive" onClick={() => window.location.href = '/hotpotato'}>
                Play Locally
              </button>
              <button className="hp-btn-massive" onClick={() => window.location.href = '/hotpotato/live'}>
                Play Online <span className="hpl-beta-badge" style={{ marginLeft: 6, verticalAlign: 'middle' }}>BETA</span>
              </button>
              <a className="hpl-report-link" href={reportHref}>Report an issue</a>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Kicked ────────────────────────────────────────────────
  if (phase === 'kicked') {
    return (
      <div className="hotpotato-container">
        <div className="hotpotato-content">
          <div className="hp-fade-in hpl-page hpl-center" style={{ gap: '0.75rem' }}>
            <p className="hp-title" style={{ marginBottom: 0 }}>HOT POTATO</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#e5e5ea', margin: 0 }}>You Were Removed</p>
            <p style={{ color: '#555', fontSize: '0.95rem', margin: 0 }}>
              The host removed you from the game.
            </p>
            <button className="hp-btn-massive" style={{ marginTop: '0.5rem' }} onClick={() => window.location.href = '/hotpotato'}>
              Back to Home
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return null;
}
