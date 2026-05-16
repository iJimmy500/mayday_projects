import React, { useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';

export default function SyncPlayer({
  youtubeId,
  previewUrl,
  currentSong,
  isPlaying,
  playerRef,
  onTimeUpdate,
  onReady,
  onEnded,
  onError,
  hasSync // New prop
}) {
  const audioRef = useRef(null);

  // If synced, we use YouTube for full seeking. 
  // If NOT synced, we use the Apple previewUrl for that "standard" experience.
  const useYouTube = hasSync && !!youtubeId;
  const useNativeAudio = !useYouTube && !!(previewUrl || currentSong?.streamUrl);
  
  const directUrl = previewUrl || currentSong?.streamUrl;
  const ytUrl = youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : null;

  useEffect(() => {
    if (ytUrl) console.log(`[SyncPlayer] 📺 Using YouTube`);
    else if (directUrl) console.log(`[SyncPlayer] 🔊 Using Native Audio`);
  }, [ytUrl, directUrl]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying && directUrl) {
        audioRef.current.play().catch(err => {
          if (err.name !== 'AbortError') console.error("Audio play failed:", err);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, directUrl]);

  if (!directUrl && !ytUrl) return null;

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: 0, 
      right: 0, 
      width: '1px', 
      height: '1px', 
      opacity: 0.01, 
      pointerEvents: 'none',
      zIndex: -1
    }}>
      {useYouTube ? (
        <ReactPlayer
          ref={playerRef}
          url={ytUrl}
          width="100%"
          height="100%"
          playing={isPlaying}
          onProgress={onTimeUpdate}
          onReady={() => {
            console.log("[SyncPlayer] ✅ YouTube Player Ready");
            onReady?.();
          }}
          onEnded={onEnded}
          onError={(e) => {
            console.error("[SyncPlayer] ❌ YouTube Player Error", e);
            onError?.(e);
          }}
          volume={0.8}
          config={{
            youtube: {
              playerVars: { 
                origin: window.location.origin,
                autoplay: 1,
                controls: 0
              }
            }
          }}
        />
      ) : useNativeAudio ? (
        <audio
          ref={audioRef}
          src={directUrl}
          onTimeUpdate={(e) => onTimeUpdate({ playedSeconds: e.target.currentTime })}
          onCanPlay={() => {
            console.log("[SyncPlayer] ✅ Native Audio Ready");
            onReady?.();
          }}
          onEnded={onEnded}
          onError={(e) => {
            console.error("[SyncPlayer] ❌ Native Audio Error", e);
            onError?.(e);
          }}
        />
      ) : null}
    </div>
  );
}
