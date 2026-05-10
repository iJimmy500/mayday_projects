import React, { useState, useEffect, useRef } from 'react';
import '../SortingVisualizer.css';
import { Play, Square, RefreshCw, Volume2, VolumeX, Code, X, Zap, Share2, Copy, Link as LinkIcon, Flower, Clock } from 'lucide-react';
import LZString from 'lz-string';

import { ALGORITHMS, PRESETS } from './constants';
import { sleep, makeArray } from './utils';
import RaceCell from './components/RaceCell';
import DocsView from './components/DocsView';
import { ALGO_CODE } from './algorithmCode';

import * as Basic from './algorithms/basicSorts';
import * as Advanced from './algorithms/advancedSorts';
import * as Exotic from './algorithms/exoticSorts';
import * as Themed from './algorithms/themedSorts';

const ALL_ALGO_FUNCS = { ...Basic, ...Advanced, ...Exotic, ...Themed };

export default function SortingVisualizer() {

  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  
  // URL Hydration
  let initialConfig = {
    algo: searchParams.get('algo') || 'bubble',
    size: parseInt(searchParams.get('size')) || 20,
    speed: parseInt(searchParams.get('speed')) || 60,
    preset: searchParams.get('preset') || 'random',
    mode: searchParams.get('mode') || 'single',
    race: searchParams.get('race') ? searchParams.get('race').split(',') : []
  };

  const compressed = searchParams.get('c');
  if (compressed) {
    try {
      const decompressed = JSON.parse(LZString.decompressFromEncodedURIComponent(compressed));
      initialConfig = { ...initialConfig, ...decompressed };
    } catch (e) {
      console.error('Failed to decompress config', e);
    }
  }

  const [algo,     setAlgo]     = useState(initialConfig.algo);
  const [size,     setSize]     = useState(initialConfig.size);
  const [speed,    setSpeed]    = useState(initialConfig.speed);
  const [preset,   setPreset]   = useState(initialConfig.preset);
  const [array,    setArray]    = useState(() => makeArray(initialConfig.size, initialConfig.preset));
  const [cmp,      setCmp]      = useState([]);
  const [swp,      setSwp]      = useState([]);
  const [srt,      setSrt]      = useState([]);
  const [mode,     setMode]     = useState(initialConfig.mode);
  const [status,   setStatus]   = useState('idle');
  const [isRacing, setIsRacing] = useState(false);
  const [raceAlgos, setRaceAlgos] = useState(initialConfig.race);
  const [winners,  setWinners]  = useState([]);
  const [stats,    setStats]    = useState({ cmp: 0, swp: 0, ms: 0 });
  const [showCode, setShowCode] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [shareConfig, setShareConfig] = useState({ size: true, speed: true, preset: true });
  const [codeLang, setCodeLang] = useState('javascript');
  const [activeLine, setActiveLine] = useState(-1);
  const useAudioRef = useRef(false);
  const [audioState, setAudioState] = useState(false);
  const killed   = useRef(false);

  const audioCtx = useRef(null);
  const timerRef = useRef(null);

  const toggleRaceAlgo = (id) => {
    if (raceAlgos.includes(id)) {
      if (raceAlgos.length > 1) setRaceAlgos(raceAlgos.filter(a => a !== id));
    } else {
      if (raceAlgos.length < 4) setRaceAlgos([...raceAlgos, id]);
    }
  };

  const resetArray = (s = size, p = preset) => {
    killed.current = true;
    setStatus('idle');
    setIsRacing(false);
    setWinners([]);
    const a = makeArray(s, p);
    setArray(a);
    setCmp([]); setSwp([]); setSrt([]);
    setStats({ cmp: 0, swp: 0, ms: 0 });
    setActiveLine(-1);
  };

  useEffect(() => { resetArray(size, preset); }, [algo, size, preset]);

  const tone = (val) => {
    if (!useAudioRef.current) return;
    if (!audioCtx.current) audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
    try {
      const osc = audioCtx.current.createOscillator();
      const g   = audioCtx.current.createGain();
      osc.frequency.value = 150 + val * 12;
      osc.type = 'sine';
      g.gain.setValueAtTime(0.04, audioCtx.current.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, audioCtx.current.currentTime + 0.08);
      osc.connect(g); g.connect(audioCtx.current.destination);
      osc.start(); osc.stop(audioCtx.current.currentTime + 0.08);
    } catch (_) {}
  };

  const run = async () => {
    if (mode === 'race') {
      setWinners([]);
      setIsRacing(true);
      return;
    }
    killed.current = false;
    setStatus('running');
    setSrt([]);
    const start = Date.now();
    timerRef.current = setInterval(() => setStats(s => ({ ...s, ms: Date.now() - start })), 100);

    let a = [...array];
    const funcName = algo + 'Sort';
    const func = ALL_ALGO_FUNCS[funcName];

    const tick = async (c, s, line = -1) => {
      if (killed.current) throw new Error('k');
      setCmp(c); setSwp(s);
      setActiveLine(line);
      setStats(st => ({ ...st, cmp: st.cmp + (c.length ? 1 : 0), swp: st.swp + (s.length ? 1 : 0) }));
      await sleep(Math.max(2, 101 - speed));
    };

    try {
      if (func) {
        await func(a, tick, tone, setArray, setSrt, speed, sleep);
      }
      setSrt(a.map((_,i) => i));
      setStatus('done');
      setActiveLine(-1);
    } catch (_) {
      setStatus('idle');
    }

    clearInterval(timerRef.current);
    timerRef.current = null;
    setCmp([]); setSwp([]);
  };

  const stop = () => {
    killed.current = true;
    setIsRacing(false);
    setStatus('idle');
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const isRunning = status === 'running' || isRacing;
  const rankLabel = (i) => i === 0 ? '1st' : i === 1 ? '2nd' : i === 2 ? '3rd' : `${i+1}th`;

  return (
    <div className="sort-root">
      {/* Topbar */}
      <header className="sort-topbar">
        <div className="topbar-left">
          <a href="https://mayinflight.com" target="_blank" rel="noopener noreferrer" className="site-logo">
            <Flower size={18} className="flower-icon" />
            <span>mayday</span>
          </a>
        </div>

        <div className="topbar-center">
          <button className={`mode-tab ${mode === 'single' ? 'active' : ''}`} onClick={() => { setMode('single'); resetArray(); }}>Single</button>
          <button className={`mode-tab race-tab ${mode === 'race' ? 'active' : ''}`} onClick={() => { setMode('race'); resetArray(); }}>Race</button>
          <button className={`mode-tab ${mode === 'docs' ? 'active' : ''}`} onClick={() => { setMode('docs'); resetArray(); }}>Docs</button>
        </div>

        <div className="topbar-right">
          {mode !== 'docs' && (
            <>
              <div className="live-stat" data-label="comparisons"><span className="live-stat-val">{stats.cmp.toLocaleString()}</span></div>
              <div className="live-stat" data-label="swaps"><span className="live-stat-val">{stats.swp.toLocaleString()}</span></div>
              <div className="live-stat" data-label="time"><span className="live-stat-val">{(stats.ms / 1000).toFixed(2)}s</span></div>
              <button
                className={`audio-toggle ${audioState ? 'on' : ''}`}
                onClick={() => {
                  const next = !audioState;
                  if (next && !audioCtx.current) audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
                  useAudioRef.current = next;
                  setAudioState(next);
                }}
              >
                {audioState ? <Volume2 size={12} /> : <VolumeX size={12} />}
                {audioState ? 'audio on' : 'audio off'}
              </button>
            </>
          )}
        </div>
      </header>

      {/* Body */}
      <div className={`sort-body ${mode === 'docs' ? 'full-width' : ''}`}>
        {/* Sidebar */}
        <aside className="sort-sidebar">
          <div className="sidebar-content">
            {/* Algo list */}
            <div className="sidebar-section">
              <div className="sidebar-label">
                {mode === 'single' ? 'Algorithm' : `Racing (${raceAlgos.length}/4)`}
              </div>
              <div className="algo-list">
                {Object.entries(ALGORITHMS).map(([id, data]) => {
                  const isExotic = ['bogo', 'stooge', 'slow', 'coin', 'existential', 'frustration', 'crash'].includes(id);
                  const isTooSlowForSize = isExotic && size > (id === 'bogo' ? 8 : id === 'existential' ? 5 : id === 'frustration' ? 30 : 40);
                  const isForbiddenInRace = ['bogo', 'stooge', 'slow', 'coin', 'existential', 'frustration'].includes(id) && mode === 'race';
                  const isDisabled = isForbiddenInRace; // Only disable if forbidden in race. Allow warnings in single.
                  const isTooSlowWarning = isTooSlowForSize && mode === 'single';
                  const isActive = mode === 'single' ? algo === id : raceAlgos.includes(id);
                  
                  return (
                    <div
                      key={id}
                      className={`algo-item ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''} ${isTooSlowWarning ? 'warning' : ''}`}
                      onClick={() => {
                        if (isRunning || isDisabled) return;
                        if (mode === 'single') setAlgo(id);
                        else toggleRaceAlgo(id);
                      }}
                      title={isDisabled ? `${data.name} is not allowed in Race Mode` : isTooSlowWarning ? `Warning: ${data.name} will take a long time for this size` : ''}
                    >
                      <div className="algo-item-left">
                        {isTooSlowWarning && <Clock size={12} className="slow-icon" />}
                        <span className="algo-item-name">{data.name}</span>
                      </div>
                      <span className="algo-item-big-o">{isDisabled ? 'NO RACE' : data.big_o}</span>
                    </div>
                  );
                })}
              </div>
              {mode === 'single' && (
                <div className="complexity-box">
                  <div className="complexity-header">
                    <div className="complexity-title">{ALGORITHMS[algo].name}</div>
                    <button className="view-code-btn" onClick={() => setShowCode(true)}>
                      <Code size={12} /> View Code
                    </button>
                  </div>
                  <div className="complexity-desc">{ALGORITHMS[algo].desc}</div>
                </div>
              )}
            </div>


          </div>

          <div className="sidebar-footer">
            {/* Configuration */}
            <div className="sidebar-section">
              <div className="sidebar-label">Array Preset</div>
              <div className="preset-grid">
                {Object.entries(PRESETS).map(([id, label]) => (
                  <button key={id} className={`preset-btn ${preset === id ? 'active' : ''}`} onClick={() => setPreset(id)} disabled={isRunning}>{label}</button>
                ))}
              </div>
            </div>

            <div className="sidebar-section">
              <div className="sidebar-label">Settings</div>
              <div className="slider-row">
                <div className="slider-label"><span>n =</span><span className="slider-val">{size}</span></div>
                <input type="range" min="10" max={mode === 'race' ? 50 : 120} value={size} onChange={e => setSize(+e.target.value)} disabled={isRunning} />
              </div>
              <div className="slider-row">
                <div className="slider-label"><span>speed</span><span className="slider-val">{speed}%</span></div>
                <input type="range" min="1" max="100" value={speed} onChange={e => setSpeed(+e.target.value)} />
              </div>
            </div>

            <div className="sidebar-section">
              <div className="action-row">
                <button className={`run-btn ${isRunning ? 'stop' : mode === 'race' ? 'race' : ''}`} onClick={isRunning ? stop : run}>
                  {isRunning ? <Square size={14} /> : <Play size={14} />}
                  {isRunning ? 'Stop' : mode === 'race' ? 'Start Race' : 'Run'}
                </button>
                <button className="reset-btn" onClick={() => resetArray()} disabled={isRunning}><RefreshCw size={14} /></button>
                <div className="share-popover-container">
                  <button className={`share-btn ${showShare ? 'active' : ''}`} onClick={() => setShowShare(!showShare)} disabled={isRunning}><LinkIcon size={14} /></button>
                  {showShare && (
                    <div className="share-popover">
                      <div className="share-popover-header">
                        <span>Include Settings:</span>
                        <button className="popover-close" onClick={() => setShowShare(false)}><X size={12} /></button>
                      </div>
                      <div className="share-popover-options">
                        <label className="share-option">
                          <div className={`custom-checkbox ${shareConfig.size ? 'checked' : ''}`} onClick={() => setShareConfig({...shareConfig, size: !shareConfig.size})}>
                            {shareConfig.size && <div className="checkmark" />}
                          </div>
                          <span onClick={() => setShareConfig({...shareConfig, size: !shareConfig.size})}>Size</span>
                        </label>
                        <label className="share-option">
                          <div className={`custom-checkbox ${shareConfig.speed ? 'checked' : ''}`} onClick={() => setShareConfig({...shareConfig, speed: !shareConfig.speed})}>
                            {shareConfig.speed && <div className="checkmark" />}
                          </div>
                          <span onClick={() => setShareConfig({...shareConfig, speed: !shareConfig.speed})}>Speed</span>
                        </label>
                        <label className="share-option">
                          <div className={`custom-checkbox ${shareConfig.preset ? 'checked' : ''}`} onClick={() => setShareConfig({...shareConfig, preset: !shareConfig.preset})}>
                            {shareConfig.preset && <div className="checkmark" />}
                          </div>
                          <span onClick={() => setShareConfig({...shareConfig, preset: !shareConfig.preset})}>Preset</span>
                        </label>
                      </div>
                      <button 
                        className="share-copy-btn"
                        onClick={async (e) => {
                          const btn = e.currentTarget;
                          const config = { algo };
                          if (mode !== 'single') config.mode = mode;
                          if (mode === 'race' && raceAlgos.length > 0) config.race = raceAlgos;
                          if (shareConfig.size) config.size = size;
                          if (shareConfig.speed) config.speed = speed;
                          if (shareConfig.preset) config.preset = preset;

                          try {
                            const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(config));
                            const url = new URL(window.location.origin + window.location.pathname);
                            url.searchParams.set('c', compressed);

                            await navigator.clipboard.writeText(url.toString());
                            const originalText = btn.innerText;
                            btn.innerText = 'Link Copied!';
                            btn.classList.add('copied');
                            setTimeout(() => { 
                              btn.innerText = originalText; 
                              btn.classList.remove('copied');
                              setShowShare(false); 
                            }, 1500);
                          } catch (err) {
                            console.error('Failed to copy link', err);
                          }
                        }}
                      >
                        Copy Link
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Stage */}
        <main className="sort-main">
          <div className="viz-legend">
            <div className="legend-item"><div className="legend-dot default" /> default</div>
            <div className="legend-item"><div className="legend-dot compare" /> comparing</div>
            <div className="legend-item"><div className="legend-dot swap" /> swapping</div>
            <div className="legend-item"><div className="legend-dot sorted" /> sorted</div>
          </div>

          <div className="viz-stage">
            <div className="viz-stage-header">
              <span className="viz-stage-title">
                {mode === 'docs' ? 'Theory / Documentation' : mode === 'race' ? 'Race / Standings' : ALGORITHMS[algo].name}
              </span>
            </div>

            {mode === 'docs' && <DocsView />}

            {mode === 'single' && (
              <div className="viz-container">
                <div className="viz-bars">
                  {array.map((v, i) => (
                    <div key={i} className={`bar${(srt || []).includes?.(i) ? ' sorted' : (cmp || []).includes?.(i) ? ' comparing' : (swp || []).includes?.(i) ? ' swapping' : ''}`} style={{ height: `${v}%` }} />
                  ))}
                </div>
              </div>
            )}

            {mode === 'race' && (
              <div className="race-grid">
                {raceAlgos.length === 0 ? (
                  <div className="race-empty-state">
                    <div className="empty-message">Select up to 4 algorithms from the sidebar to start a race</div>
                  </div>
                ) : (
                  raceAlgos.map(id => {
                    const winIdx = winners.indexOf(ALGORITHMS[id].name);
                    return (
                      <RaceCell 
                        key={id} 
                        algoId={id} 
                        array={array} 
                        speed={speed} 
                        useAudio={audioState} 
                        isRacing={isRacing} 
                        rank={winIdx !== -1 ? winIdx + 1 : null}
                        onDone={() => setWinners(p => [...p, ALGORITHMS[id].name])} 
                      />
                    );
                  })
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Code Modal */}
      {showCode && (
        <div className="code-modal-overlay" onClick={() => setShowCode(false)}>
          <div className="code-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <span>{ALGORITHMS[algo].name}</span>
              </div>
              
              <div className="modal-lang-picker">
                {['javascript', 'python', 'c', 'java'].map(l => (
                  <button 
                    key={l} 
                    className={`modal-lang-btn ${codeLang === l ? 'active' : ''}`}
                    onClick={() => setCodeLang(l)}
                  >
                    {l === 'javascript' ? 'JS' : l.toUpperCase()}
                  </button>
                ))}
              </div>

              <div className="modal-actions">
                <button 
                  className={`modal-run-btn ${status === 'running' ? 'stop' : ''}`} 
                  onClick={status === 'running' ? stop : run}
                >
                  {status === 'running' ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                  <span>{status === 'running' ? 'Stop' : 'Run'}</span>
                </button>
                <button className="modal-close" onClick={() => setShowCode(false)}><X size={18} /></button>
              </div>
            </div>
            <div className="code-content">
              <pre>
                <code>
                  {(ALGO_CODE[algo]?.[codeLang] || ALL_ALGO_FUNCS[algo + 'Sort']?.toString() || '// Source not available')
                    .split('\n')
                    .map((lineText, i) => {
                      const getActiveLineIndex = () => {
                        if (activeLine === -1) return -1;
                        if (typeof activeLine === 'number') return activeLine;
                        const lineNum = ALGO_CODE[algo]?.lines?.[activeLine]?.[codeLang];
                        return lineNum != null ? lineNum - 1 : -1;
                      };
                      return (
                        <div 
                          key={i} 
                          className={`code-line ${getActiveLineIndex() === i ? 'highlight' : ''}`}
                        >
                          <span className="line-number">{i + 1}</span>
                          <span className="line-text">
                            <SyntaxHighlight text={lineText} />
                          </span>
                        </div>
                      );
                    })}
                </code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SyntaxHighlight({ text }) {
  // Ultra-simple but effective regex highlighting
  const tokens = [];
  const parts = text.split(/(\b(?:async|function|for|let|if|return|while|await|const|new|throw|try|catch|void|public|int|def|range|in|while|if|not)\b|[\(\)\{\}\[\]\=<>!\|\&\+\-\*\/]+|\".*?\"|\'.*?\'|\`.*?\`|\/\/.+|#.+)/g);

  return (
    <>
      {parts.map((p, i) => {
        if (!p) return null;
        if (/^\b(?:async|function|for|let|if|return|while|await|const|new|throw|try|catch|void|public|int|def|range|in|while|if|not)\b$/.test(p)) {
          return <span key={i} style={{ color: '#ff7b72' }}>{p}</span>;
        }
        if (/^[\(\)\{\}\[\]]+$/.test(p)) {
          return <span key={i} style={{ color: '#d2a8ff' }}>{p}</span>;
        }
        if (/^[\=<>!\|\&\+\-\*\/]+$/.test(p)) {
          return <span key={i} style={{ color: '#79c0ff' }}>{p}</span>;
        }
        if (/^(\/\/|#).+/.test(p)) {
          return <span key={i} style={{ color: '#8b949e', fontStyle: 'italic' }}>{p}</span>;
        }
        if (/^[\"\'\`].*[\"\'\`]$/.test(p)) {
          return <span key={i} style={{ color: '#a5d6ff' }}>{p}</span>;
        }
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}
