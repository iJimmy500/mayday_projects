import React, { useState, useRef, useEffect, useCallback } from 'react';
import './PocketStudio.css';

// Sub-components
import StudioHeader from './StudioHeader';
import StudioLanding from './StudioLanding';
import BackingTrack from './BackingTrack';
import VocalTrack from './VocalTrack';
import LegalModal from './LegalModal';

export default function PocketStudio() {
  const [backingUrl, setBackingUrl] = useState('');
  const [ytId, setYtId] = useState(null);

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [isCountingIn, setIsCountingIn] = useState(false);
  const [takes, setTakes] = useState([]);
  const [activeTakeId, setActiveTakeId] = useState(null);
  const [isPlayingBack, setIsPlayingBack] = useState(false);
  const [recTime, setRecTime] = useState(0);
  const [waveformPeaks, setWaveformPeaks] = useState(null);

  // Settings & Modes
  const [backingVolume, setBackingVolume] = useState(50);
  const [vocalVolume, setVocalVolume] = useState(100);
  const [isLooping, setIsLooping] = useState(true);
  const [showLyrics, setShowLyrics] = useState(false);
  const [lyrics, setLyrics] = useState('');
  const [isSampleMode, setIsSampleMode] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isYtPlaying, setIsYtPlaying] = useState(false);
  const [localAudioUrl, setLocalAudioUrl] = useState(null);
  const [showProModal, setShowProModal] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(!localStorage.getItem('ps-disclaimer-accepted'));
  const [chops, setChops] = useState({
    '1': 0, '2': 5, '3': 10, '4': 15, '5': 20, '6': 25, '7': 30, '8': 35,
    'q': 40, 'w': 45, 'e': 50, 'r': 55, 'a': 60, 's': 65, 'd': 70, 'f': 75
  });

  // Refs
  const playerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const playbackAudioRef = useRef(new Audio());
  const timerRef = useRef(null);
  const audioCtxRef = useRef(null);
  const backingSourceRef = useRef(null);
  const vocalSourceRef = useRef(null);
  const effectNodesRef = useRef([]);
  const analyserRef = useRef(null);
  const backingAnalyserRef = useRef(null);
  const canvasRef = useRef(null);
  const backingCanvasRef = useRef(null);
  const animationRef = useRef(null);
  const backingAnimationRef = useRef(null);

  // Setup Audio Context & Visualizer
  useEffect(() => {
    playbackAudioRef.current.crossOrigin = "anonymous";
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass && !audioCtxRef.current) {
      audioCtxRef.current = new AudioContextClass();
      analyserRef.current = audioCtxRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      backingAnalyserRef.current = audioCtxRef.current.createAnalyser();
      backingAnalyserRef.current.fftSize = 256;
    }
    return () => { cancelAnimationFrame(animationRef.current); };
  }, []);

  const drawVisualizer = useCallback(() => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw Static Waveform Background if we have peaks
      if (waveformPeaks) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        const step = canvas.width / waveformPeaks.length;
        waveformPeaks.forEach((peak, i) => {
          const h = peak * canvas.height;
          ctx.fillRect(i * step, canvas.height/2 - h/2, step - 1, h);
        });
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.fillRect(0, canvas.height / 2 - 1, canvas.width, 2);
      }

      if (isPlayingBack || isRecording) {
        // Draw Real-time Overlay (Playback or Live Recording)
        analyserRef.current.getByteFrequencyData(dataArray);
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height * 0.8;
          if (barHeight > 0) {
            ctx.fillStyle = isRecording ? `rgba(255, 45, 45, ${0.4 + (barHeight / canvas.height)})` : `rgba(48, 209, 88, ${0.4 + (barHeight / canvas.height)})`;
            ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          }
          x += barWidth + 1;
        }
      }
    };
    draw();
  }, [isPlayingBack, isRecording, waveformPeaks]);

  const extractWaveform = async (url) => {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      const rawData = audioBuffer.getChannelData(0); 
      const samples = 100; // Number of peaks
      const blockSize = Math.floor(rawData.length / samples);
      const peaks = [];
      for (let i = 0; i < samples; i++) {
        let max = 0;
        for (let j = 0; j < blockSize; j++) {
          const val = Math.abs(rawData[i * blockSize + j]);
          if (val > max) max = val;
        }
        peaks.push(max);
      }
      setWaveformPeaks(peaks);
    } catch (e) {
      console.warn('Waveform extraction failed', e);
    }
  };

  useEffect(() => {
    if (activeTakeId) {
      const take = takes.find(t => t.id === activeTakeId);
      if (take) {
        extractWaveform(take.url);
      }
    } else {
      setWaveformPeaks(null);
    }
  }, [activeTakeId, takes]);

  const drawBackingVisualizer = useCallback(() => {
    if (!backingCanvasRef.current || !backingAnalyserRef.current) return;
    const canvas = backingCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const bufferLength = backingAnalyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      backingAnimationRef.current = requestAnimationFrame(draw);
      if (!isYtPlaying) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.fillRect(0, canvas.height / 2, canvas.width, 1);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 2;
      let x = 0;

      if (!localAudioUrl) {
        // SIMULATED visualizer for YouTube (CORS restriction)
        for (let i = 0; i < bufferLength; i++) {
          const simHeight = Math.random() * canvas.height * 0.4;
          ctx.fillStyle = `rgba(255, 235, 59, ${0.1 + (simHeight / canvas.height)})`;
          ctx.fillRect(x, canvas.height / 2 - simHeight / 2, barWidth, simHeight);
          x += barWidth + 1;
        }
        return;
      }
      
      backingAnalyserRef.current.getByteFrequencyData(dataArray);
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.7;
        ctx.fillStyle = `rgba(255, 235, 59, ${0.2 + (barHeight / canvas.height)})`;
        ctx.fillRect(x, canvas.height / 2 - barHeight / 2, barWidth, barHeight);
        x += barWidth + 1;
      }
    };
    draw();
  }, [isYtPlaying]);

  useEffect(() => {
    if (isYtPlaying && localAudioUrl) {
      setTimeout(drawBackingVisualizer, 100);
    }
  }, [isYtPlaying, localAudioUrl, drawBackingVisualizer]);

  const extractId = (url) => {
    const m = url.match(/(?:youtu\.be\/|v=|embed\/)([a-zA-Z0-9_-]{11})/);
    return m ? m[1] : null;
  };

  useEffect(() => {
    const id = extractId(backingUrl);
    if (id) setYtId(id);
  }, [backingUrl]);

  useEffect(() => {
    if (!ytId) return;
    const setup = () => {
      if (playerRef.current?.destroy) playerRef.current.destroy();
      playerRef.current = new window.YT.Player('yt-backing', {
        videoId: ytId,
        playerVars: { controls: 0, rel: 0, modestbranding: 1, disablekb: 1 },
        events: {
          onReady: (e) => e.target.setVolume(backingVolume),
          onStateChange: (e) => {
            setIsYtPlaying(e.data === window.YT.PlayerState.PLAYING);
            if (e.data === window.YT.PlayerState.ENDED && isLooping) {
              playerRef.current.seekTo(0);
              playerRef.current.playVideo();
            }
          }
        }
      });
    };
    if (window.YT?.Player) { setup(); return; }
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
    window.onYouTubeIframeAPIReady = setup;
    return () => { playerRef.current?.destroy?.(); };
  }, [ytId, isLooping]);

  useEffect(() => {
    if (localAudioUrl) {
      const el = document.getElementById('local-backing-audio');
      if (el) el.volume = backingVolume / 100;
    }
    if (playerRef.current?.setVolume) playerRef.current.setVolume(backingVolume);
  }, [backingVolume, localAudioUrl]);

  useEffect(() => {
    if (playbackAudioRef.current) playbackAudioRef.current.volume = vocalVolume / 100;
  }, [vocalVolume]);

  useEffect(() => {
    if (localAudioUrl && audioCtxRef.current) {
      const el = document.getElementById('local-backing-audio');
      if (el && !backingSourceRef.current) {
        try {
          backingSourceRef.current = audioCtxRef.current.createMediaElementSource(el);
          backingSourceRef.current.connect(backingAnalyserRef.current);
          backingSourceRef.current.connect(audioCtxRef.current.destination);
        } catch (e) {
          console.warn('Source already connected');
        }
      }
    }
  }, [localAudioUrl]);

  useEffect(() => {
    if (localAudioUrl) {
      const el = document.getElementById('local-backing-audio');
      if (el) el.playbackRate = playbackRate;
    }
    if (playerRef.current?.setPlaybackRate) {
      playerRef.current.setPlaybackRate(playbackRate);
    }
  }, [playbackRate, localAudioUrl]);

  useEffect(() => {
    if (!isSampleMode) return;
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const key = e.key.toLowerCase();
      if (chops[key] !== undefined) {
        if (audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume();
        if (e.shiftKey) {
          // Set custom chop
          let currentTime = 0;
          if (localAudioUrl) {
            const el = document.getElementById('local-backing-audio');
            if (el) currentTime = el.currentTime;
          } else {
            currentTime = playerRef.current?.getCurrentTime() || 0;
          }
          setChops(prev => ({ ...prev, [key]: currentTime }));
        } else {
          // Jump to chop
          if (localAudioUrl) {
            const el = document.getElementById('local-backing-audio');
            if (el) {
              el.currentTime = chops[key];
              el.play();
              setIsYtPlaying(true);
            }
          } else {
            playerRef.current?.seekTo?.(chops[key]);
            playerRef.current?.playVideo?.();
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSampleMode, chops]);

  const executeRecording = (stream) => {
    const isMixed = !!localAudioUrl;

    // If local audio, we want to mix it into the stream
    let finalStream = stream;
    if (isMixed && audioCtxRef.current) {
      const dest = audioCtxRef.current.createMediaStreamDestination();
      const micSource = audioCtxRef.current.createMediaStreamSource(stream);

      // Local audio source
      const backingElement = document.getElementById('local-backing-audio');
      if (backingElement) {
        if (!backingSourceRef.current) {
          try {
            backingSourceRef.current = audioCtxRef.current.createMediaElementSource(backingElement);
          } catch (e) { console.warn(e); }
        }
        if (backingSourceRef.current) {
          backingSourceRef.current.connect(dest);
          backingSourceRef.current.connect(audioCtxRef.current.destination);
        }
      }

      micSource.connect(dest);
      if (analyserRef.current) micSource.connect(analyserRef.current);
      finalStream = dest.stream;
    }

    mediaRecorderRef.current = new MediaRecorder(finalStream);
    audioChunksRef.current = [];
    mediaRecorderRef.current.ondataavailable = e => audioChunksRef.current.push(e.data);
    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const url = URL.createObjectURL(blob);
      const newTake = {
        id: Date.now(),
        url,
        name: `Take ${takes.length + 1}`,
        isMixed
      };
      setTakes(prev => [...prev, newTake]);
      setActiveTakeId(newTake.id);
    };
    setIsRecording(true);
    setRecTime(0);
    timerRef.current = setInterval(() => setRecTime(t => t + 1), 1000);

    if (localAudioUrl) {
      const backingElement = document.getElementById('local-backing-audio');
      if (backingElement) {
        backingElement.currentTime = 0;
        backingElement.play();
      }
    } else {
      playerRef.current?.seekTo?.(0);
      playerRef.current?.playVideo?.();
    }

    mediaRecorderRef.current.start();
  };

  const startRecording = async () => {
    // If using YouTube (not local), show the Pro Modal explainer
    if (ytId && ytId !== 'local') {
      setShowProModal(true);
      return;
    }

    try {
      if (isMicMuted) {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const destination = audioCtx.createMediaStreamDestination();
        executeRecording(destination.stream);
      } else {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        executeRecording(stream);
      }
    } catch (e) {
      alert('Mic access required: ' + e.message);
    }
  };

  const proceedWithVocalOnly = async () => {
    setShowProModal(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      executeRecording(stream);
    } catch (e) {
      alert(e);
    }
  };

  const handleLocalUpload = (file) => {
    if (file) {
      const url = URL.createObjectURL(file);
      setLocalAudioUrl(url);
      setYtId('local'); // Use a dummy ID to trigger session view
    }
  };

  const stopRecording = () => {
    clearInterval(timerRef.current);
    setIsRecording(false);
    mediaRecorderRef.current?.stop();

    if (localAudioUrl) {
      const backingElement = document.getElementById('local-backing-audio');
      backingElement?.pause();
    } else {
      playerRef.current?.pauseVideo?.();
    }

    mediaRecorderRef.current?.stream?.getTracks().forEach(t => t.stop());
  };

  useEffect(() => {
    if (activeTakeId) {
      const take = takes.find(t => t.id === activeTakeId);
      if (take && playbackAudioRef.current) {
        playbackAudioRef.current.src = take.url;
      }
    }
  }, [activeTakeId, takes]);

  const startPlayback = () => {
    if (!activeTakeId) return;
    if (audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume();
    setIsPlayingBack(true);
    playerRef.current?.seekTo?.(0);
    playerRef.current?.playVideo?.();
    if (playbackAudioRef.current) {
      if (!vocalSourceRef.current) {
        vocalSourceRef.current = audioCtxRef.current.createMediaElementSource(playbackAudioRef.current);
      }
      vocalSourceRef.current.disconnect();
      effectNodesRef.current.forEach(node => node.disconnect());
      effectNodesRef.current = [];
      let currentNode = vocalSourceRef.current;
      currentNode.connect(analyserRef.current);
      currentNode.connect(audioCtxRef.current.destination);
      playbackAudioRef.current.currentTime = 0;
      playbackAudioRef.current.play();
      playbackAudioRef.current.onended = () => { setIsPlayingBack(false); playerRef.current?.pauseVideo?.(); };
      setTimeout(drawVisualizer, 50);
    }
  };

  const stopPlayback = () => {
    setIsPlayingBack(false);
    playerRef.current?.pauseVideo?.();
    playbackAudioRef.current?.pause();
    cancelAnimationFrame(animationRef.current);
  };

  const killAll = () => {
    stopPlayback();
    if (playerRef.current?.pauseVideo) playerRef.current.pauseVideo();
    if (playbackAudioRef.current) playbackAudioRef.current.pause();
    setIsPlayingBack(false);
  };

  const acceptDisclaimer = () => {
    localStorage.setItem('ps-disclaimer-accepted', 'true');
    setShowDisclaimer(false);
  };

  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const toggleYt = () => {
    if (localAudioUrl) {
      if (audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume();
      const backingElement = document.getElementById('local-backing-audio');
      if (isYtPlaying) backingElement?.pause();
      else backingElement?.play();
      setIsYtPlaying(!isYtPlaying);
      return;
    }
    if (!playerRef.current) return;
    if (isYtPlaying) playerRef.current.pauseVideo();
    else playerRef.current.playVideo();
  };

  return (
    <div className="ps-root">
      {ytId && ytId !== 'local' && (
        <div
          className="ps-bg-art"
          style={{ backgroundImage: `url(https://img.youtube.com/vi/${ytId}/maxresdefault.jpg)` }}
        />
      )}
      <div className="ps-ambient" />

      <StudioHeader
        isYtPlaying={isYtPlaying}
        toggleYt={toggleYt}
        isMicMuted={isMicMuted}
        setIsMicMuted={setIsMicMuted}
        isLooping={isLooping}
        setIsLooping={setIsLooping}
        showLyrics={showLyrics}
        setShowLyrics={setShowLyrics}
        isSampleMode={isSampleMode}
        setIsSampleMode={setIsSampleMode}
      />

      <main className="ps-main">
        {!ytId ? (
          <StudioLanding
            backingUrl={backingUrl}
            setBackingUrl={setBackingUrl}
            handleLocalUpload={handleLocalUpload}
          />
        ) : (
          <div className="ps-session">
            <div className={`ps-workspace ${showLyrics ? 'split' : ''}`}>
              <div className="ps-tracks-area">
                <BackingTrack
                  playbackRate={playbackRate}
                  setPlaybackRate={setPlaybackRate}
                  backingVolume={backingVolume}
                  setBackingVolume={setBackingVolume}
                  killAll={killAll}
                  isSampleMode={isSampleMode}
                  isRecording={isRecording}
                  isPlayingBack={isPlayingBack}
                  chops={chops}
                  localAudioUrl={localAudioUrl}
                  startRecording={startRecording}
                  stopRecording={stopRecording}
                  backingCanvasRef={backingCanvasRef}
                  tape={() => {
                    setBackingUrl('');
                    setYtId(null);
                    setLocalAudioUrl(null);
                    setTakes([]);
                    setActiveTakeId(null);
                  }}
                />

                <VocalTrack
                  takes={takes}
                  activeTakeId={activeTakeId}
                  setActiveTakeId={setActiveTakeId}
                  vocalVolume={vocalVolume}
                  setVocalVolume={setVocalVolume}
                  isRecording={isRecording}
                  isCountingIn={isCountingIn}
                  isPlayingBack={isPlayingBack}
                  recTime={recTime}
                  startRecording={startRecording}
                  stopRecording={stopRecording}
                  startPlayback={startPlayback}
                  stopPlayback={stopPlayback}
                  canvasRef={canvasRef}
                  fmt={fmt}
                />
              </div>

              {showLyrics && (
                <div className="ps-lyric-pad">
                  <div className="ps-track-tag">rhyme pad</div>
                  <textarea
                    className="ps-lyric-textarea"
                    placeholder="Write your bars here..."
                    value={lyrics}
                    onChange={(e) => setLyrics(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="ps-status-bar">
              <div className="ps-status-left">
                {(isRecording || isPlayingBack || isSampleMode) && (
                  <>
                    <div className={`ps-dot ${isRecording ? 'live' : isPlayingBack ? 'play' : 'sample'}`} />
                    <span>{isRecording ? 'Live' : isPlayingBack ? 'Playing' : 'Sample Chop Mode'}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {showDisclaimer && <LegalModal acceptDisclaimer={acceptDisclaimer} />}

      {/* Pro Modal */}
      {showProModal && (
        <div className="ps-modal-overlay">
          <div className="ps-modal pro-explainer">
            <div className="pro-badge">PRO MODE</div>
            <h3>Master Download Available</h3>
            <p>
              You're currently using a <strong>YouTube link</strong>. Due to browser security,
              we can only download your vocals, not the backing track.
            </p>
            <div className="pro-steps">
              <div className="pro-step">
                <span>1</span>
                <p>Download your beat as an MP3 (try <strong>ytmp3.nu</strong>)</p>
              </div>
              <div className="pro-step">
                <span>2</span>
                <p>Upload the file here to unlock <strong>Mixed Master Downloads</strong>.</p>
              </div>
            </div>
            <div className="pro-modal-actions">
              <button className="ps-modal-btn secondary" onClick={proceedWithVocalOnly}>
                RECORD VOCALS ONLY
              </button>
              <button className="ps-modal-btn" onClick={() => setShowProModal(false)}>
                I'LL UPLOAD A FILE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
