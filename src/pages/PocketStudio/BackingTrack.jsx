import React from 'react';
import { RefreshCcw } from 'lucide-react';

export default function BackingTrack({ 
  playbackRate, 
  setPlaybackRate, 
  backingVolume, 
  setBackingVolume, 
  killAll, 
  isSampleMode, 
  isRecording, 
  isPlayingBack, 
  chops, 
  localAudioUrl,
  startRecording,
  stopRecording,
  backingCanvasRef,
  tape 
}) {
  return (
    <div className="ps-track-row">
      <div className="ps-track-header">
        <div className="ps-track-tag">{localAudioUrl ? 'master studio channel' : 'backing track'}</div>
        
        {localAudioUrl && (
          <button 
            className={`ps-session-rec ${isRecording ? 'active' : ''}`}
            onClick={isRecording ? stopRecording : startRecording}
          >
            <div className="ps-rec-dot" />
            {isRecording ? 'STOP SESSION' : 'RECORD SESSION'}
          </button>
        )}
        <div className="ps-vol-control">
          <span>PITCH/SPEED</span>
          <input 
            type="range" 
            min="0.5" 
            max="2" 
            step="0.05" 
            value={playbackRate} 
            onChange={e => setPlaybackRate(parseFloat(e.target.value))} 
            className="ps-vol-slider speed"
          />
          <span className="ps-speed-val">{playbackRate.toFixed(2)}x</span>
        </div>
        <div className="ps-vol-control">
          <span>VOL</span>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={backingVolume} 
            onChange={e => setBackingVolume(parseInt(e.target.value))} 
          />
        </div>
        <button className="ps-kill-btn" onClick={killAll} title="Kill All Audio">KILL</button>
      </div>
      
      <div className={`ps-yt-embed ${isSampleMode ? 'sample-mode-active' : ''}`}>
        {localAudioUrl ? (
          <div className="ps-local-player-view minimal">
            <audio id="local-backing-audio" src={localAudioUrl} loop crossOrigin="anonymous" />
            <div className="ps-minimal-deck">
              <span className="ps-deck-label">LOCAL MASTER</span>
              <div className="ps-minimal-vis">
                <canvas ref={backingCanvasRef} width="800" height="120" />
              </div>
            </div>
          </div>
        ) : (
          <div id="yt-backing" />
        )}
        {!isRecording && !isPlayingBack && !isSampleMode && <div className="ps-yt-veil" />}
        {isSampleMode && (
          <div className="ps-sample-overlay p16">
            {Object.entries(chops).map(([key, time]) => (
              <div key={key} className="ps-pad">
                <div className="ps-pad-num">{key.toUpperCase()}</div>
                <div className="ps-pad-time">{Math.floor(time)}s</div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <button className="ps-ghost-btn" onClick={tape}>
        <RefreshCcw size={14} /> eject tape
      </button>
    </div>
  );
}
