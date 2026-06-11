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
  hasSync,
  startAt
}) {
  const HINT_PLAY_SECONDS = 10;

  const audioRef = useRef(null);
  const hintWindowEndRef = useRef(null);
  const wasPlayingRef = useRef(false);

  // If we have synced lyrics, YouTube gives us the full song so the karaoke view lines up.
  // Otherwise fall back to the Apple preview, and to YouTube again if there's no preview at all.
  const directUrl = previewUrl || currentSong?.streamUrl;
  const ytUrl = youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : null;
  const useYouTube = !!ytUrl && (hasSync || !directUrl);
  const useNativeAudio = !useYouTube && !!directUrl;

  useEffect(() => {
    if (useYouTube) console.log('[SyncPlayer] 📺 Using YouTube');
    else if (useNativeAudio) console.log('[SyncPlayer] 🔊 Using Native Audio');
  }, [useYouTube, useNativeAudio]);

  // Each time hint playback starts, jump to the moment the lyric snippet is
  // sung and arm a window so it stops after a few seconds instead of playing
  // the rest of the song.
  useEffect(() => {
    const startedPlaying = isPlaying && !wasPlayingRef.current;
    wasPlayingRef.current = isPlaying;

    if (useYouTube && startedPlaying && startAt != null && playerRef?.current) {
      const target = Math.max(0, startAt - 0.4);
      try {
        playerRef.current.currentTime = target;
        hintWindowEndRef.current = target + HINT_PLAY_SECONDS;
        console.log(`[SyncPlayer] ⏩ Playing snippet hint: ${target.toFixed(1)}s – ${hintWindowEndRef.current.toFixed(1)}s`);
      } catch (err) {
        console.warn('[SyncPlayer] Seek failed:', err);
      }
    }
  }, [useYouTube, isPlaying, startAt, ytUrl, playerRef]);

  // Once the song is revealed (startAt cleared), playback is no longer capped.
  useEffect(() => {
    if (startAt == null) hintWindowEndRef.current = null;
  }, [startAt]);

  useEffect(() => {
    if (useNativeAudio && audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          if (err.name !== 'AbortError') console.error("Audio play failed:", err);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, useNativeAudio, directUrl]);

  const handleTimeUpdate = (e) => {
    const seconds = e?.currentTarget?.currentTime ?? e?.target?.currentTime ?? 0;
    if (hintWindowEndRef.current != null && seconds >= hintWindowEndRef.current) {
      hintWindowEndRef.current = null;
      onEnded?.();
      return;
    }
    onTimeUpdate?.(seconds);
  };

  if (!useYouTube && !useNativeAudio) return null;

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
          src={ytUrl}
          style={{ width: '100%', height: '100%' }}
          playing={isPlaying}
          volume={0.8}
          onTimeUpdate={handleTimeUpdate}
          onReady={() => {
            console.log("[SyncPlayer] ✅ YouTube Player Ready");
            onReady?.();
          }}
          onEnded={onEnded}
          onError={(e) => {
            console.error("[SyncPlayer] ❌ YouTube Player Error");
            onError?.(e);
          }}
        />
      ) : (
        <audio
          ref={audioRef}
          src={directUrl}
          preload="auto"
          onTimeUpdate={handleTimeUpdate}
          onCanPlay={() => {
            console.log("[SyncPlayer] ✅ Native Audio Ready");
            onReady?.();
          }}
          onEnded={onEnded}
          onError={(e) => {
            console.error("[SyncPlayer] ❌ Native Audio Error");
            onError?.(e);
          }}
        />
      )}
    </div>
  );
}
