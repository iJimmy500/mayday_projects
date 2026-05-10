import React, { useState, useEffect, useRef } from 'react';
import './SortingVisualizerMobile.css';
import { Play, Square, RefreshCw, Volume2, VolumeX, Monitor, ChevronDown, ChevronUp, Flower, Link as LinkIcon, X, Clock } from 'lucide-react';
import LZString from 'lz-string';
import { ALGORITHMS, PRESETS } from './constants';
import { sleep, makeArray } from './utils';

import * as Basic from './algorithms/basicSorts';
import * as Advanced from './algorithms/advancedSorts';
import * as Exotic from './algorithms/exoticSorts';
import * as Themed from './algorithms/themedSorts';

const ALL_ALGO_FUNCS = { ...Basic, ...Advanced, ...Exotic, ...Themed };
const MOBILE_ALGOS = ['bubble', 'selection', 'insertion', 'quick', 'merge', 'stalin', 'bogo', 'coin'];

export default function SortingVisualizerMobile() {
  const [algo, setAlgo] = useState('bubble');
  const [size, setSize] = useState(25);
  const [speed, setSpeed] = useState(60);
  const [preset, setPreset] = useState('random');
  const [array, setArray] = useState(() => makeArray(25, 'random'));
  const [cmp, setCmp] = useState([]);
  const [swp, setSwp] = useState([]);
  const [srt, setSrt] = useState([]);
  const [status, setStatus] = useState('idle');
  const [stats, setStats] = useState({ cmp: 0, swp: 0, ms: 0 });
  const [audioState, setAudioState] = useState(false);
  const [showAlgos, setShowAlgos] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [shareConfig, setShareConfig] = useState({ size: true, speed: true, preset: true });
  const [showIntro, setShowIntro] = useState(false);

  const killed = useRef(false);
  const audioCtx = useRef(null);
  const timerRef = useRef(null);
  const useAudioRef = useRef(false);

  const resetArray = (s = size, p = preset) => {
    killed.current = true;
    setStatus('idle');
    const a = makeArray(s, p);
    setArray(a);
    setCmp([]); setSwp([]); setSrt([]);
    setStats({ cmp: 0, swp: 0, ms: 0 });
  };

  useEffect(() => {
    const seen = localStorage.getItem('mayday_sort_intro_seen');
    if (!seen) setShowIntro(true);
  }, []);

  const closeIntro = () => {
    localStorage.setItem('mayday_sort_intro_seen', 'true');
    setShowIntro(false);
  };

  useEffect(() => { resetArray(size, preset); }, [algo, size, preset]);

  const tone = (val) => {
    if (!useAudioRef.current) return;
    if (!audioCtx.current) audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
    try {
      const osc = audioCtx.current.createOscillator();
      const g = audioCtx.current.createGain();
      osc.frequency.value = 150 + val * 12;
      osc.type = 'sine';
      g.gain.setValueAtTime(0.04, audioCtx.current.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, audioCtx.current.currentTime + 0.08);
      osc.connect(g); g.connect(audioCtx.current.destination);
      osc.start(); osc.stop(audioCtx.current.currentTime + 0.08);
    } catch (_) { }
  };

  const run = async () => {
    killed.current = false;
    setStatus('running');
    setSrt([]);
    const start = Date.now();
    timerRef.current = setInterval(() => setStats(s => ({ ...s, ms: Date.now() - start })), 100);

    let a = [...array];
    const funcName = algo + 'Sort';
    const func = ALL_ALGO_FUNCS[funcName];

    const tick = async (c, s) => {
      if (killed.current) throw new Error('k');
      setCmp(c); setSwp(s);
      setStats(st => ({ ...st, cmp: st.cmp + (c.length ? 1 : 0), swp: st.swp + (s.length ? 1 : 0) }));
      await sleep(Math.max(2, 101 - speed));
    };

    try {
      if (func) await func(a, tick, tone, setArray, setSrt, speed, sleep);
      setSrt(a.map((_, i) => i));
      setStatus('done');
    } catch (_) {
      setStatus('idle');
    }

    clearInterval(timerRef.current);
    timerRef.current = null;
    setCmp([]); setSwp([]);
  };

  const stop = () => {
    killed.current = true;
    setStatus('idle');
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const isRunning = status === 'running';

  return (
    <div className="mobile-sort-root">
      <header className="mobile-header">
        <a href="https://mayinflight.com" target="_blank" rel="noopener noreferrer" className="mobile-logo-link">
          <Flower className="flower-icon" size={18} />
          <div className="mobile-logo">mayday</div>
        </a>
        <div className="mobile-stats">
          <div className="m-stat"><b>{stats.cmp.toLocaleString()}</b> comparisons</div>
          <div className="m-stat"><b>{stats.swp.toLocaleString()}</b> swaps</div>
        </div>
      </header>

      <div className="mobile-main">
        <div className="mobile-viz">
          {array.map((v, i) => (
            <div
              key={i}
              className={`m-bar ${srt.includes(i) ? 'srt' : cmp.includes(i) ? 'cmp' : swp.includes(i) ? 'swp' : ''}`}
              style={{ height: `${v}%` }}
            />
          ))}
        </div>

        <div className="mobile-algo-selector">
          <button className="algo-trigger" onClick={() => setShowAlgos(!showAlgos)}>
            {ALGORITHMS[algo].name} {showAlgos ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {showAlgos && (
            <div className="algo-dropdown">
              {MOBILE_ALGOS.map(id => {
                const isTooSlowWarning = ['bogo', 'stooge', 'slow', 'coin', 'existential', 'frustration', 'crash'].includes(id) && 
                                         size > (id === 'bogo' ? 8 : id === 'existential' ? 5 : id === 'frustration' ? 30 : 40);
                return (
                  <button
                    key={id}
                    className={`algo-opt ${algo === id ? 'active' : ''} ${isTooSlowWarning ? 'warning' : ''}`}
                    onClick={() => { 
                      setAlgo(id); 
                      setShowAlgos(false); 
                    }}
                  >
                    <div className="m-algo-opt-content">
                      {isTooSlowWarning && <Clock size={14} className="slow-icon" />}
                      <span>{ALGORITHMS[id].name}</span>
                    </div>
                    {isTooSlowWarning && <span className="m-slow-tag">SLOW</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="mobile-controls">
        <div className="control-row">
          <div className="slider-group">
            <label>Size <span>{size}</span></label>
            <input type="range" min="5" max="50" value={size} onChange={e => setSize(+e.target.value)} disabled={isRunning} />
          </div>
          <div className="slider-group">
            <label>Speed <span>{speed}%</span></label>
            <input type="range" min="1" max="100" value={speed} onChange={e => setSpeed(+e.target.value)} />
          </div>
        </div>

        <div className="action-row">
          <button className={`m-run-btn ${isRunning ? 'stop' : ''}`} onClick={isRunning ? stop : run}>
            {isRunning ? <Square size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
            {isRunning ? 'STOP' : 'START'}
          </button>
          <button className="m-reset-btn" onClick={() => resetArray()} disabled={isRunning}><RefreshCw size={18} /></button>
          <div className="m-share-container">
            <button className={`m-share-btn ${showShare ? 'active' : ''}`} onClick={() => setShowShare(!showShare)} disabled={isRunning}><LinkIcon size={18} /></button>
            {showShare && (
              <div className="m-share-popover">
                <div className="m-share-header">
                  <span>Include:</span>
                  <button onClick={() => setShowShare(false)}><X size={14} /></button>
                </div>
                <div className="m-share-opts">
                  <label className="m-share-opt">
                    <div className={`c-cb ${shareConfig.size ? 'on' : ''}`} onClick={() => setShareConfig({ ...shareConfig, size: !shareConfig.size })}>
                      {shareConfig.size && <div className="c-cm" />}
                    </div>
                    <span onClick={() => setShareConfig({ ...shareConfig, size: !shareConfig.size })}>Size</span>
                  </label>
                  <label className="m-share-opt">
                    <div className={`c-cb ${shareConfig.speed ? 'on' : ''}`} onClick={() => setShareConfig({ ...shareConfig, speed: !shareConfig.speed })}>
                      {shareConfig.speed && <div className="c-cm" />}
                    </div>
                    <span onClick={() => setShareConfig({ ...shareConfig, speed: !shareConfig.speed })}>Speed</span>
                  </label>
                  <label className="m-share-opt">
                    <div className={`c-cb ${shareConfig.preset ? 'on' : ''}`} onClick={() => setShareConfig({ ...shareConfig, preset: !shareConfig.preset })}>
                      {shareConfig.preset && <div className="c-cm" />}
                    </div>
                    <span onClick={() => setShareConfig({ ...shareConfig, preset: !shareConfig.preset })}>Preset</span>
                  </label>
                </div>
                <button
                  className="m-share-copy"
                  onClick={async (e) => {
                    const btn = e.currentTarget;
                    const config = { algo };
                    if (shareConfig.size) config.size = size;
                    if (shareConfig.speed) config.speed = speed;
                    if (shareConfig.preset) config.preset = preset;

                    try {
                      const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(config));
                      const url = new URL(window.location.origin + window.location.pathname);
                      url.searchParams.set('c', compressed);
                      await navigator.clipboard.writeText(url.toString());

                      const oldText = btn.innerText;
                      btn.innerText = 'Copied!';
                      btn.style.background = '#3fb950';
                      setTimeout(() => {
                        btn.innerText = oldText;
                        btn.style.background = '';
                        setShowShare(false);
                      }, 1500);
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                >
                  Copy Link
                </button>
              </div>
            )}
          </div>
          <button
            className={`m-audio-btn ${audioState ? 'on' : ''}`}
            onClick={() => {
              const next = !audioState;
              if (next && !audioCtx.current) audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
              useAudioRef.current = next;
              setAudioState(next);
            }}
          >
            {audioState ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>

        <div className="desktop-notice">
          <Monitor size={14} /> Visit Desktop version for more features
        </div>
      </div>

      {showIntro && (
        <div className="m-intro-overlay">
          <div className="m-intro-modal">
            <div className="m-intro-flower"><Flower size={32} /></div>
            <h2>sort</h2>
            <p>You're using the mobile version of sort. Visit on desktop to unlock:</p>
            <ul className="m-intro-features">
              <li>
                <div className="m-feature-title">Race Mode</div>
                <div className="m-feature-desc">Battle up to 4 algorithms simultaneously</div>
              </li>
              <li>
                <div className="m-feature-title">Code View</div>
                <div className="m-feature-desc">Real-time line tracking & logic tracing</div>
              </li>
              <li>
                <div className="m-feature-title">...and more</div>
                <div className="m-feature-desc">Theory documentation, 19+ algorithms, and advanced controls</div>
              </li>
            </ul>
            <button className="m-intro-btn" onClick={closeIntro}>Continue to Visualizer</button>
          </div>
        </div>
      )}
    </div>
  );
}
