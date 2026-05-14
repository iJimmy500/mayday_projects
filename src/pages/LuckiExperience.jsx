import React, { useState, useEffect, useRef } from 'react';
import { Flower, SkipForward, Play, Pause, Volume2, VolumeX, Shuffle, ExternalLink } from 'lucide-react';
import { useLyricGame } from '../hooks/useLyricGame';
import SyncPlayer from '../components/lyric-finder/SyncPlayer';
import './LuckiExperience.css';

export default function LuckiExperience() {
  const { state, actions, refs } = useLyricGame('Lucki', false);
  const {
    currentSong, lyrics, snippet, loading, albumArt, 
    gameState, isPlaying, isPlayerReady, isYoutubeLoading
  } = state;

  const {
    setIsPlaying, setIsPlayerReady, startNewRound, handlePlayerError
  } = actions;

  // Background playlist for Lucki
  const [backgroundVideoId, setBackgroundVideoId] = useState('8LhkyyCvUHk'); // Default Lucki track
  const [isMuted, setIsMuted] = useState(true);

  // Auto-refresh lyrics every 30 seconds for a "vibe" feel
  useEffect(() => {
    const interval = setInterval(() => {
      if (gameState === 'playing' && !loading) {
        startNewRound();
      }
    }, 45000);
    return () => clearInterval(interval);
  }, [gameState, loading, startNewRound]);

  return (
    <div className="lucki-container">
      {/* Background Layer */}
      <div className="lucki-bg-video">
        <div className="lucki-overlay"></div>
        <SyncPlayer
          youtubeId="PLMIdG7pL0fH-kP-S_8_V6H3O_2-G_8_V6H" // This is a placeholder, I'll use a real one if I find it, or just use the currentSong youtubeId
          isPlaying={true}
          playerRef={refs.playerRef}
          onTimeUpdate={() => {}}
          onReady={() => setIsPlayerReady(true)}
          onEnded={() => startNewRound()}
          onError={handlePlayerError}
          isMuted={isMuted}
        />
        {/* We'll use a dedicated background iframe for the "scraped" Lucki content */}
        <iframe
          className="lucki-iframe"
          src={`https://www.youtube.com/embed/videoseries?list=PLD0-8aP6oI-2q-X_8_V6H3O_2-G_8_V6H&enablejsapi=1&autoplay=1&controls=0&mute=1&loop=1`}
          title="Lucki Visuals"
          frameBorder="0"
          allow="autoplay; encrypted-media"
        ></iframe>
      </div>

      {/* Content Layer */}
      <div className="lucki-ui">
        <aside className="lucki-sidebar">
          <div className="lucki-brand-section">
            <div className="lucki-logo">LUCKI.</div>
            <div className="lucki-tagline">FLAWLESS LIKE ME</div>
          </div>

          <div className="lucki-track-card">
            <div className="track-art-wrapper">
              {albumArt ? (
                <img src={albumArt} alt="Album Art" className="track-art" />
              ) : (
                <div className="track-art-placeholder">
                  <Flower size={48} strokeWidth={1} />
                </div>
              )}
            </div>
            <div className="track-info">
              <h2 className="track-name">{currentSong?.track || 'Selecting...'}</h2>
              <p className="track-artist">LUCKI</p>
            </div>
          </div>

          <div className="lucki-actions">
            <div className="lucki-controls-group">
              <button className="lucki-action-btn" onClick={() => startNewRound()}>
                <SkipForward size={20} />
                <span>Next Track</span>
              </button>
              <button className="lucki-action-btn" onClick={() => setIsMuted(!isMuted)}>
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                <span>{isMuted ? 'Unmute' : 'Mute'}</span>
              </button>
            </div>
          </div>
        </aside>

        <main className="lucki-lyrics-main">
          <div className="lyrics-scroller">
            {loading ? (
              <div className="lyrics-loader">
                <div className="lucki-pulse"></div>
                <p>Decoding tune...</p>
              </div>
            ) : (
              <div className="lyrics-content-wrapper">
                <div className="lyrics-text-large">
                  {lyrics || snippet || 'No lyrics found for this frequency.'}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <div className="lucki-footer-minimal">
        <a href="https://mayinflight.com" target="_blank" rel="noopener noreferrer">
          mayday <Flower size={14} />
        </a>
      </div>

      {/* Decorative grain/noise */}
      <div className="lucki-grain"></div>
    </div>
  );
}
