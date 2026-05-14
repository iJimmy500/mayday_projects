import React from 'react';
import { Pause, Play, Mic, Repeat, Type, Scissors, Flower } from 'lucide-react';

export default function StudioHeader({ 
  isYtPlaying, 
  toggleYt, 
  isMicMuted, 
  setIsMicMuted, 
  isLooping, 
  setIsLooping, 
  showLyrics, 
  setShowLyrics, 
  isSampleMode, 
  setIsSampleMode 
}) {
  return (
    <header className="ps-header">
      <div className="ps-wordmark">pocket<span>.studio</span></div>
      <div className="ps-top-controls">
        <button className="ps-icon-btn main-play" onClick={toggleYt} title="Play/Pause Beat">
          {isYtPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
        </button>
        <button className={`ps-icon-btn ${isMicMuted ? 'muted' : ''}`} onClick={() => setIsMicMuted(!isMicMuted)} title={isMicMuted ? "Enable Mic" : "Mute Mic (Sampling Only)"}>
          {isMicMuted ? <Mic size={16} style={{opacity: 0.4}} /> : <Mic size={16} />}
        </button>
        <button className={`ps-icon-btn ${isLooping ? 'active' : ''}`} onClick={() => setIsLooping(!isLooping)} title="Loop Beat">
          <Repeat size={16} />
        </button>
        <button className={`ps-icon-btn ${showLyrics ? 'active' : ''}`} onClick={() => setShowLyrics(!showLyrics)} title="Lyric Pad">
          <Type size={16} />
        </button>
        <button className={`ps-icon-btn ${isSampleMode ? 'active' : ''}`} onClick={() => setIsSampleMode(!isSampleMode)} title="Sample Chop Mode">
          <Scissors size={16} />
        </button>
        <a href="https://mayinflight.com" target="_blank" rel="noopener noreferrer" className="ps-home-link">
          <Flower size={16} />
        </a>
      </div>
    </header>
  );
}
