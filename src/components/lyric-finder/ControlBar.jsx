import React from 'react';
import { SkipForward, List, RefreshCw, Eye, ExternalLink, Play, Pause, Music, Link } from 'lucide-react';

// Refreshed playback controls
export default function ControlBar({ 
  gameState, 
  loading, 
  guess, 
  onGuessChange, 
  onGuessSubmit, 
  onSkip, 
  onNext, 
  onToggleHistory, 
  onToggleSettings, 
  onToggleGuesses,
  showHistory,
  showRoundGuesses,
  settings, 
  playlistInfo, 
  currentSong, 
  albumArt, 
  trackUrl,
  currentGuesses,
  isPlaying,
  onTogglePlay,
  hasSync,
  isYoutubeLoading,
  isPlayerReady,
  youtubeStatus,
  onManualSearch
}) {
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onGuessSubmit();
    }
  };

  return (
    <div className={`am-controls ${(gameState !== 'playing' && gameState !== 'error') || loading ? 'revealed' : ''} ${gameState === 'error' ? 'shake' : ''}`}>
      <div className="am-glass-card">
        {loading ? (
          <div className="am-loading-status">FETCHING SONG...</div>
        ) : gameState === 'playing' || gameState === 'error' ? (
          <div className="am-guess-flow">
            <div className="am-inputs">
              {/* Title Input: Show if mode is 'title', 'both', or if we're in an artist-specific view */}
              {(settings.mode === 'title' || settings.mode === 'both' || playlistInfo?.type === 'artist') && (
                <input
                  autoFocus={settings.mode === 'title' || settings.mode === 'both' || playlistInfo?.type === 'artist'}
                  type="text"
                  placeholder="Song Title"
                  value={guess.title}
                  onChange={e => onGuessChange({ ...guess, title: e.target.value })}
                  onKeyDown={handleKeyDown}
                />
              )}
              
              {/* Divider and Artist Input: Only if mode is 'both' AND not in an artist-specific view */}
              {settings.mode === 'both' && playlistInfo?.type !== 'artist' && <div className="am-divider" />}

              {/* Artist Input: Show if mode is 'artist' or 'both', but HIDE if in an artist-specific view */}
              {((settings.mode === 'artist' || settings.mode === 'both') && playlistInfo?.type !== 'artist') && (
                <input
                  autoFocus={settings.mode === 'artist'}
                  type="text"
                  placeholder="Artist Name"
                  value={guess.artist}
                  onChange={e => onGuessChange({ ...guess, artist: e.target.value })}
                  onKeyDown={handleKeyDown}
                />
              )}
            </div>
            
            <div className="am-actions-group">
              <button
                className={`am-play-btn ${isPlaying ? 'playing' : ''} ${((isYoutubeLoading || !isPlayerReady) && hasSync) ? 'loading' : ''}`}
                onClick={onTogglePlay}
                disabled={!hasSync || !isPlayerReady || isYoutubeLoading}
                title={!hasSync ? "Audio not available" : isYoutubeLoading ? "Searching for audio..." : isPlaying ? "Pause" : "Play Synced Audio"}
              >
                {((isYoutubeLoading || !isPlayerReady) && hasSync) ? (
                  <div className="am-play-loading-ring" />
                ) : isPlaying ? (
                  <Pause size={20} fill="currentColor" />
                ) : (
                  <Play size={20} fill="currentColor" />
                )}
              </button>
              <button className="am-guess-btn" onClick={onGuessSubmit}>GUESS</button>
              <button className="am-skip-btn" onClick={onSkip} title="I give up">
                <SkipForward size={20} />
              </button>
              <button className={`am-queue-btn ${showHistory ? 'active' : ''}`} onClick={onToggleHistory} title="History">
                <List size={20} />
              </button>
            </div>
          </div>
        ) : (
          <div className="am-reveal-flow">
            <div className="am-reveal-header">
              <img
                src={albumArt || (currentSong?.youtubeId ? `https://img.youtube.com/vi/${currentSong?.youtubeId}/0.jpg` : null)}
                alt="Art"
                className="am-reveal-art"
              />
              <div className="am-reveal-info">
                <div className={`am-status ${gameState}`}>{gameState === 'correct' ? 'CORRECT' : 'REVEALED'}</div>
                <h3>{currentSong?.track || '...'}</h3>
                <p>{currentSong?.artist || '...'}</p>
              </div>
            </div>
            <div className="am-actions-group">
              <button
                className={`am-platform-link ${isPlaying ? 'playing' : ''}`}
                onClick={onTogglePlay}
                title={isPlaying ? "Pause Preview" : "Play Preview"}
              >
                {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
              </button>
              {trackUrl && (
                <a href={trackUrl} target="_blank" rel="noopener noreferrer" className="am-platform-link apple" title="Open on Apple Music">
                  <ExternalLink size={18} strokeWidth={2.5} />
                </a>
              )}
              {currentGuesses.length > 0 && (
                <button className={`am-view-guesses-btn ${showRoundGuesses ? 'active' : ''}`} onClick={onToggleGuesses} title="Your Guesses">
                  <Eye size={18} />
                </button>
              )}
              <button className="am-next-btn" onClick={onNext}>
                NEXT <SkipForward size={18} />
              </button>
              <button className={`am-queue-btn ${showHistory ? 'active' : ''}`} onClick={onToggleHistory} title="History">
                <List size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Round Guesses Popup */}
      {showRoundGuesses && (
        <div className="am-round-guesses-popup">
          <div className="am-guesses-header">YOUR ATTEMPTS</div>
          {currentGuesses.map((g, i) => (
            <div key={i} className="am-guess-entry">
              <span className="am-guess-num">#{i + 1}</span>
              <span className="am-guess-text">{g.title || '—'} / {g.artist || '—'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
