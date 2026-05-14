import React from 'react';
import { Mic, Square, Pause, Play, Download, Activity } from 'lucide-react';

export default function VocalTrack({
  takes,
  activeTakeId,
  setActiveTakeId,
  vocalVolume,
  setVocalVolume,
  isRecording,
  isCountingIn,
  isPlayingBack,
  recTime,
  startRecording,
  stopRecording,
  startPlayback,
  stopPlayback,
  canvasRef,
  fmt
}) {
  const activeTake = takes.find(t => t.id === activeTakeId);
  const activeTakeUrl = activeTake?.url;

  return (
    <div className="ps-track-row vocal-row">
      <div className="ps-track-header">
        <div className="ps-track-tag">vocal takes</div>
        <div className="ps-vocal-tools">
          {takes.length > 0 && (
            <select 
              className="ps-takes-dropdown" 
              value={activeTakeId || ''} 
              onChange={(e) => setActiveTakeId(Number(e.target.value))}
            >
              {takes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          )}
          {activeTakeId && (
            <div className="ps-vol-control">
              <span>VOL</span>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={vocalVolume} 
                onChange={e => setVocalVolume(parseInt(e.target.value))} 
              />
            </div>
          )}
        </div>
      </div>

      {!activeTakeId && !isRecording && !isCountingIn ? (
        <div className="ps-booth idle">
          <Mic size={24} color="rgba(255,255,255,0.3)" />
          <p>Booth is empty. Ready to record.</p>
          <button className="ps-rec-btn" onClick={startRecording}>Record Take</button>
        </div>
      ) : (
        <div className="ps-booth active">
          {isCountingIn ? (
            <div className="ps-count-in">
              <Activity size={32} className="spin-slow" />
              <span>GET READY...</span>
            </div>
          ) : isRecording ? (
            <div className="ps-recording-state">
              <div className="ps-mic-ring live">
                <Mic size={22} />
                <div className="ps-ring-pulse" />
              </div>
              <div className="ps-rec-timer">{fmt(recTime)}</div>
              <button className="ps-rec-btn stop" onClick={stopRecording}>
                <Square size={14} fill="currentColor" /> Stop
              </button>
            </div>
          ) : (
            <div className="ps-playback-state">
              <div className="ps-visualizer-container">
                <canvas ref={canvasRef} className="ps-visualizer-canvas" width="300" height="40" />
              </div>
              
              <div className="ps-playback-controls">
                <button className="ps-play-btn" onClick={isPlayingBack ? stopPlayback : startPlayback}>
                  {isPlayingBack ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                </button>
                
                <a 
                  href={activeTakeUrl} 
                  download={`vocal-${activeTake?.name}.webm`} 
                  className="ps-dl-btn" 
                  title="Download Raw Take"
                >
                  <Download size={16} />
                </a>
                <button className="ps-rec-btn secondary" onClick={startRecording}>New Take</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
