import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowRight, Share2 } from 'lucide-react';
import './GasStation.css';

// Modular Imports
import RANDOM_EVENTS from '../data/gasEvents.json';
import useGasStationAudio from '../hooks/useGasStationAudio';
import GasStationHeader from '../components/gas-station/GasStationHeader';
import EventModal from '../components/gas-station/EventModal';
import SettingsModal from '../components/gas-station/SettingsModal';

const GRADES = {
  'E85': { name: 'E85',     label: 'DEGRADED',  speed: 0.8, acceleration: 0.5, drift: 0 },
  '87': { name: 'Regular',  label: 'UNLEADED',  speed: 1.6, acceleration: 1.8, drift: 0 },
  '89': { name: 'Plus',     label: 'MID GRADE', speed: 3.0, acceleration: 3.0, drift: 45 },
  '93': { name: 'Premium',  label: 'PREMIUM',   speed: 4.8, acceleration: 5.5, drift: 100 },
};

const LOCATIONS = [
  { id: 'NUS', label: 'Nat Avg' },
  { id: 'SCA', label: 'CA' },
  { id: 'SCO', label: 'CO' },
  { id: 'SFL', label: 'FL' },
  { id: 'SMA', label: 'MA' },
  { id: 'SMN', label: 'MN' },
  { id: 'SNY', label: 'NY' },
  { id: 'SOH', label: 'OH' },
  { id: 'STX', label: 'TX' },
  { id: 'SWA', label: 'WA' }
];

const MODES = [
  { key: 'classic',  label: 'Classic' },
  { key: 'blind',    label: 'Midnight' },
  { key: 'speedrun', label: 'Race' },
  { key: 'drip',     label: 'Drip' },
];

const getRandomTarget = () => {
  if (Math.random() < 0.25) {
    const odd = [7.77, 12.50, 13.37, 8.88, 11.11, 14.99];
    return odd[Math.floor(Math.random() * odd.length)];
  }
  const clean = [5.00, 10.00, 15.00, 20.00];
  return clean[Math.floor(Math.random() * clean.length)];
};

export default function GasStation() {
  const [gameState,    setGameState]    = useState('ready');   // 'ready' | 'pumping' | 'stopped' | 'busted' | 'perfect'
  const [gameMode,     setGameMode]     = useState('classic');
  const [fuelGrade,    setFuelGrade]    = useState('87');
  const [targetAmount, setTargetAmount] = useState(() => getRandomTarget());
  const [currentCost,  setCurrentCost]  = useState(0);
  const [gallons,      setGallons]      = useState(0);
  const [isMuted,      setIsMuted]      = useState(false);

  const [location,     setLocation]     = useState('NUS');
  const [gradePrices,  setGradePrices]  = useState({ 'E85': 2.79, '87': 3.39, '89': 3.79, '93': 4.19 });
  const [pricesLoading, setPricesLoading] = useState(false);
  const [apiError,     setApiError]     = useState(false);
  const [activeEvent,  setActiveEvent]  = useState(null);
  const [priceModifier, setPriceModifier] = useState(() => {
    const saved = localStorage.getItem('gs_price_modifier');
    return saved !== null ? parseFloat(saved) : 1.0;
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [eventFrequency, setEventFrequency] = useState(() => {
    const saved = localStorage.getItem('gs_event_frequency');
    return saved !== null ? parseFloat(saved) : 0.15;
  });
  const [eventBias,      setEventBias]      = useState(() => {
    const saved = localStorage.getItem('gs_event_bias');
    return saved !== null ? saved : 'balanced';
  });

  const [score,      setScore]      = useState(0);
  const [streak,     setStreak]     = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [speedrunTime, setSpeedrunTime] = useState(0);
  const [precisionStartCost, setPrecisionStartCost] = useState(0);

  const confettiRef     = useRef(null);
  const rafRef          = useRef(null);
  const lastTimeRef     = useRef(null);
  const isPumpingRef    = useRef(false);
  const currentCostRef  = useRef(0);
  const gamesPlayedRef  = useRef(parseInt(localStorage.getItem('gs_games_played') || '0', 10));
  const pumpVelocityRef = useRef(0);
  const driftActiveRef  = useRef(false);
  const driftStartRef   = useRef(null);
  const lastTickCents   = useRef(0);
  const confettiParts   = useRef([]);

  // Audio Hook
  const {
    initAudio,
    playTone,
    playClick,
    playCentTick,
    startMotorHum,
    updateMotorHum,
    stopMotorHum,
    playPerfect,
    playBust
  } = useGasStationAudio(isMuted);

  // ── persistence ────────────────────────────────────────────────────
  useEffect(() => {
    const s = localStorage.getItem('gs_best_streak');
    if (s) setBestStreak(parseInt(s, 10));
  }, []);

  useEffect(() => {
    localStorage.setItem('gs_event_frequency', eventFrequency.toString());
  }, [eventFrequency]);

  useEffect(() => {
    localStorage.setItem('gs_event_bias', eventBias);
  }, [eventBias]);

  useEffect(() => {
    localStorage.setItem('gs_price_modifier', priceModifier.toString());
  }, [priceModifier]);

  // ── confetti ────────────────────────────────────────────────────────
  const triggerConfetti = () => {
    const canvas = confettiRef.current; if (!canvas) return;
    const colors = ['#10b981','#f59e0b','#22d3ee','#f0f2f5','#a78bfa'];
    confettiParts.current = Array.from({ length: 70 }, () => ({
      x: canvas.width / 2 + (Math.random() * 40 - 20),
      y: canvas.height - 30,
      vx: Math.random() * 8 - 4,
      vy: -(Math.random() * 10 + 5),
      size: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotSpeed: Math.random() * 5 - 2.5,
      gravity: 0.25, life: 1, decay: Math.random() * 0.012 + 0.008,
    }));
  };

  const renderConfetti = () => {
    const canvas = confettiRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    confettiParts.current = confettiParts.current.filter(p => {
      p.vy += p.gravity; p.x += p.vx; p.y += p.vy;
      p.rotation += p.rotSpeed; p.life -= p.decay;
      if (p.life <= 0 || p.y > canvas.height + 20) return false;
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.rotation * Math.PI / 180);
      ctx.fillStyle = p.color; ctx.globalAlpha = p.life;
      ctx.fillRect(-p.size, -p.size / 2, p.size * 2, p.size);
      ctx.restore();
      return true;
    });
  };

  useEffect(() => {
    const resize = () => {
      const c = confettiRef.current;
      if (c) { c.width = window.innerWidth; c.height = window.innerHeight; }
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // ── game actions ────────────────────────────────────────────────────
  const setupGame = useCallback((modeOverride, gradeOverride) => {
    const mode  = modeOverride  || gameMode;
    const grade = gradeOverride || fuelGrade;
    stopMotorHum();
    const target = getRandomTarget();
    setTargetAmount(target);

    // 1. Evaluate event triggering BEFORE setting starting gallons and costs
    let activeModifier = priceModifier;
    if (gamesPlayedRef.current > 0 && Math.random() < eventFrequency && !activeEvent) {
      let pool = RANDOM_EVENTS;
      if (eventBias === 'positive') pool = RANDOM_EVENTS.filter(e => e.isGood);
      else if (eventBias === 'negative') pool = RANDOM_EVENTS.filter(e => !e.isGood);
      if (pool.length === 0) pool = RANDOM_EVENTS; // fallback
      const randEvent = pool[Math.floor(Math.random() * pool.length)];
      activeModifier = priceModifier * randEvent.effect;
      setActiveEvent(randEvent);
      setPriceModifier(activeModifier);
    }

    // 2. Setup initial costs and gallons with correct activeModifier
    if (mode === 'drip') {
      const start = Math.round((Math.floor(target) - 0.20 + Math.random() * 0.15) * 100) / 100;
      setPrecisionStartCost(start);
      setCurrentCost(start);
      currentCostRef.current = start;
      setGallons(Math.round((start / (gradePrices[grade] * activeModifier)) * 1000) / 1000);
    } else {
      setPrecisionStartCost(0);
      setCurrentCost(0);
      currentCostRef.current = 0;
      setGallons(0);
    }

    setGameState('ready');
    setSpeedrunTime(0);
    lastTickCents.current = 0;
    pumpVelocityRef.current = 0;
    driftActiveRef.current  = false;
    isPumpingRef.current     = false;

    // 3. Increment and save games played
    gamesPlayedRef.current += 1;
    localStorage.setItem('gs_games_played', gamesPlayedRef.current.toString());
  }, [gameMode, fuelGrade, stopMotorHum, gradePrices, priceModifier, activeEvent, eventFrequency, eventBias]);

  const handleGradeChange = (key) => {
    initAudio(); playClick(); setFuelGrade(key);
    if (gameState === 'ready') setupGame(gameMode, key);
  };

  const handleModeChange = (key) => {
    initAudio(); playClick(); setGameMode(key); setupGame(key, fuelGrade);
  };

  const evaluateScore = useCallback(() => {
    stopMotorHum();
    const final = Math.round(currentCostRef.current * 100) / 100;
    const diff  = Math.round((final - targetAmount) * 100) / 100;

    if (diff === 0) {
      setGameState('perfect');
      playPerfect();
      triggerConfetti();
      setStreak(prev => {
        const ns = prev + 1;
        setBestStreak(bs => { if (ns > bs) { localStorage.setItem('gs_best_streak', ns); return ns; } return bs; });
        return ns;
      });
      const mult = fuelGrade === '93' ? 2 : fuelGrade === '89' ? 1.5 : fuelGrade === '87' ? 1 : 0.5;
      const mode = gameMode === 'blind' ? 2 : gameMode === 'speedrun' ? 1.5 : 1;
      const bonus = gameMode === 'speedrun' && speedrunTime > 0 ? Math.max(100, Math.round(10000 / speedrunTime)) : 0;
      setScore(s => { const ns = s + Math.round((1000 + bonus) * mult * mode); return ns; });
    } else if (Math.abs(diff) <= 0.05 && diff < 0) {
      setGameState('stopped');
      playClick();
      const mult = fuelGrade === '93' ? 2 : fuelGrade === '89' ? 1.5 : fuelGrade === '87' ? 1 : 0.5;
      setScore(s => s + Math.round(500 * (1 - Math.abs(diff) / 0.06) * mult));
      setStreak(0);
    } else {
      setGameState(diff > 0 ? 'busted' : 'stopped');
      if (diff > 0) playBust();
      setStreak(0);
    }
  }, [targetAmount, fuelGrade, gameMode, speedrunTime, stopMotorHum, playPerfect, playClick, playBust]);

  const handleShare = useCallback(async () => {
    const diff = Math.round((currentCost - targetAmount) * 100) / 100;
    const diffText = diff === 0 ? "exactly on the dot!" : `${Math.abs(diff).toFixed(2)} away from my target.`;
    const text = `I just pumped $${currentCost.toFixed(2)} of gas and was ${diffText}\nPlay Mayday Octane: https://projects.mayinflight.com`;
    try {
      if (navigator.share) {
        await navigator.share({ text });
      } else {
        await navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
      }
    } catch (e) {
      console.error('Error sharing:', e);
    }
  }, [currentCost, targetAmount]);

  const startPumping = useCallback(() => {
    if (gameState !== 'ready' && gameState !== 'pumping') return;
    initAudio();
    isPumpingRef.current = true;
    driftActiveRef.current = false;
    setGameState('pumping');
    startMotorHum();
  }, [gameState, initAudio, startMotorHum]);

  const stopPumping = useCallback(() => {
    if (!isPumpingRef.current) return;
    isPumpingRef.current = false;
    if (GRADES[fuelGrade].drift > 0) {
      driftActiveRef.current = true;
      driftStartRef.current  = null;
    } else {
      evaluateScore();
    }
  }, [fuelGrade, evaluateScore]);

  // ── spacebar ────────────────────────────────────────────────────────
  useEffect(() => {
    const down = (e) => { if (e.code === 'Space') { e.preventDefault(); if (!isPumpingRef.current) startPumping(); } };
    const up   = (e) => { if (e.code === 'Space') { e.preventDefault(); stopPumping(); } };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup',   up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [startPumping, stopPumping]);

  // ── eia api fetch ───────────────────────────────────────────────────
  useEffect(() => {
    let active = true;
    const fetchPrices = async () => {
      setPricesLoading(true);
      setApiError(false);
      try {
        const res = await fetch(`https://api.eia.gov/v2/petroleum/pri/gnd/data/?api_key=${import.meta.env.VITE_EIA_API_KEY}&frequency=weekly&data[0]=value&facets[product][]=EPMR&facets[product][]=EPMM&facets[product][]=EPMP&facets[duoarea][]=${location}&sort[0][column]=period&sort[0][direction]=desc&offset=0&length=10`);
        if (!res.ok) throw new Error("API response not ok");
        const json = await res.json();
        if (!active) return;
        if (json && json.response && json.response.data && json.response.data.length > 0) {
          const data = json.response.data;
          const newPrices = { ...gradePrices };
          data.forEach(row => {
            const val = parseFloat(row.value);
            if (!isNaN(val)) {
              if (row.product === 'EPMR') newPrices['87'] = val;
              if (row.product === 'EPMM') newPrices['89'] = val;
              if (row.product === 'EPMP') newPrices['93'] = val;
            }
          });
          newPrices['E85'] = Math.round(newPrices['87'] * 0.85 * 100) / 100;
          setGradePrices(newPrices);
        } else {
          throw new Error("No data returned");
        }
      } catch (e) {
        console.error("Failed to fetch gas prices", e);
        if (active) {
          setApiError(true);
          setGradePrices({ 'E85': 2.79, '87': 3.39, '89': 3.79, '93': 4.19 });
        }
      }
      if (active) setPricesLoading(false);
    };
    fetchPrices();
    return () => { active = false; };
  }, [location]);

  // ── game loop ───────────────────────────────────────────────────────
  const gameLoop = useCallback((ts) => {
    if (!lastTimeRef.current) lastTimeRef.current = ts;
    const dt    = (ts - lastTimeRef.current) / 1000;
    lastTimeRef.current = ts;
    const grade = GRADES[fuelGrade];

    if (isPumpingRef.current) {
      pumpVelocityRef.current = Math.min(grade.speed, pumpVelocityRef.current + grade.acceleration * dt);
      currentCostRef.current += pumpVelocityRef.current * dt;
      setCurrentCost(currentCostRef.current);
      setGallons(currentCostRef.current / (gradePrices[fuelGrade] * priceModifier));
      updateMotorHum(pumpVelocityRef.current / grade.speed);

      const cents = Math.floor(currentCostRef.current * 100);
      if (cents > lastTickCents.current) {
        const ticks = cents - lastTickCents.current;
        lastTickCents.current = cents;
        playCentTick(850 + pumpVelocityRef.current * 70 + (ticks >= 4 ? 100 : 0));
      }

      if (gameMode === 'speedrun') setSpeedrunTime(t => t + dt);
      if (currentCostRef.current >= 35) { isPumpingRef.current = false; evaluateScore(); }

    } else if (driftActiveRef.current) {
      if (!driftStartRef.current) driftStartRef.current = ts;
      const elapsed = ts - driftStartRef.current;
      if (elapsed < grade.drift) {
        const pct  = 1 - elapsed / grade.drift;
        const dvel = pumpVelocityRef.current * pct;
        currentCostRef.current += dvel * dt;
        setCurrentCost(currentCostRef.current);
        setGallons(currentCostRef.current / (gradePrices[fuelGrade] * priceModifier));
        updateMotorHum(pct * 0.4);
        const cents = Math.floor(currentCostRef.current * 100);
        if (cents > lastTickCents.current) { lastTickCents.current = cents; playCentTick(550 + pct * 200); }
      } else {
        driftActiveRef.current  = false;
        pumpVelocityRef.current = 0;
        evaluateScore();
      }
    }

    renderConfetti();
    rafRef.current = requestAnimationFrame(gameLoop);
  }, [fuelGrade, gameMode, updateMotorHum, playCentTick, evaluateScore, gradePrices, priceModifier]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [gameLoop]);

  // ── derived display values ──────────────────────────────────────────
  const isBlindHidden = gameMode === 'blind' && (gameState === 'pumping' || driftActiveRef.current)
    && (currentCost / targetAmount) >= 0.94;

  const isPumpReady   = gameState === 'ready' || gameState === 'pumping';
  const isTerminal    = ['stopped', 'busted', 'perfect'].includes(gameState);
  const diff          = Math.round((currentCost - targetAmount) * 100) / 100;

  const resultClass =
    gameState === 'perfect' ? 'perfect' :
    gameState === 'busted'  ? 'busted'  : 'stopped';

  const resultHeadline =
    gameState === 'perfect' ? 'Perfect.' :
    gameState === 'busted'  ? 'Over.' :
    Math.abs(diff) <= 0.05  ? 'So close.' : 'Short.';

  return (
    <div className="gs-root">
      
      {/* Event Acknowledge Modal Overlay */}
      <EventModal 
        activeEvent={activeEvent} 
        onClose={() => setActiveEvent(null)} 
      />

      {/* Settings Modal Overlay */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        eventFrequency={eventFrequency}
        setEventFrequency={setEventFrequency}
        eventBias={eventBias}
        setEventBias={setEventBias}
        onResetMarket={() => {
          setPriceModifier(1.0);
          setActiveEvent(null);
          playClick();
        }}
      />

      <canvas ref={confettiRef} className="gs-confetti" />

      {/* Top Bar Navigation and Options */}
      <GasStationHeader
        apiError={apiError}
        onOpenSettings={() => setIsSettingsOpen(true)}
        location={location}
        setLocation={setLocation}
        locations={LOCATIONS}
        isMuted={isMuted}
        onToggleMute={() => { initAudio(); setIsMuted(m => !m); }}
        onExit={() => (window.location.href = 'https://mayinflight.com')}
      />

      {/* main content */}
      <main className="gs-main">

        {/* counters */}
        <div className="gs-counters">
          <div className="gs-counter-card">
            <span className="gs-counter-label">Sale</span>
            <span className={`gs-counter-value ${gameState === 'pumping' ? 'pumping' : ''} ${isBlindHidden ? 'blurred' : ''}`}>
              ${isBlindHidden ? '??.??' : currentCost.toFixed(2)}
            </span>
          </div>
          <div className="gs-counter-card">
            <span className="gs-counter-label">Gallons</span>
            <span className={`gs-counter-value ${gameState === 'pumping' ? 'pumping' : ''} ${isBlindHidden ? 'blurred' : ''}`}>
              {isBlindHidden ? '?.???' : gallons.toFixed(3)}
            </span>
          </div>
        </div>

        {/* center — target / result / modes */}
        <div className="gs-center">
          {isTerminal ? (
            <div className="gs-result">
              <div className={`gs-result-headline ${resultClass}`}>{resultHeadline}</div>
              <div className="gs-result-rows">
                <div className="gs-result-row">
                  <span>Target</span>
                  <strong>${targetAmount.toFixed(2)}</strong>
                </div>
                <div className="gs-result-row">
                  <span>You stopped at</span>
                  <strong>${currentCost.toFixed(2)}</strong>
                </div>
                <div className="gs-result-row">
                  <span>Difference</span>
                  <strong className={resultClass}>
                    {diff >= 0 ? '+' : ''}${diff.toFixed(2)}
                  </strong>
                </div>
                {streak > 0 && (
                  <div className="gs-result-row">
                    <span>Streak</span>
                    <strong>{streak}🔥</strong>
                  </div>
                )}
              </div>
              <div className="gs-result-actions">
                <button className="gs-result-btn primary" onClick={() => { initAudio(); playClick(); setupGame(); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  Pump Again <ArrowRight size={16} />
                </button>
                <button className="gs-result-btn" onClick={handleShare} title="Share Result" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  Share <Share2 size={16} />
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="gs-target">
                <div className="gs-target-label">
                  {gameMode === 'blind' && isBlindHidden ? 'Blind mode' : 'Target'}
                </div>
                <div className={`gs-target-amount ${isBlindHidden ? 'hidden' : ''}`}>
                  ${targetAmount.toFixed(2)}
                </div>
              </div>

              <div className={`gs-status ${gameState === 'pumping' ? 'pumping' : ''}`}>
                {gameState === 'ready'   && 'Hold to pump · Release to stop'}
                {gameState === 'pumping' && (gameMode === 'speedrun' ? `${speedrunTime.toFixed(2)}s` : 'Release when ready...')}
              </div>

              <div className="gs-modes">
                {MODES.map(m => (
                  <button
                    key={m.key}
                    className={`gs-mode-pill ${gameMode === m.key ? 'active' : ''}`}
                    onClick={() => handleModeChange(m.key)}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* grade tiles */}
        <div className="gs-grades">
          {['E85', '87', '89', '93'].map((key) => {
            const g = GRADES[key];
            return (
            <div
              key={key}
              data-grade={key}
              className={`gs-grade-tile ${fuelGrade === key ? 'active' : ''}`}
              onClick={() => handleGradeChange(key)}
            >
              <div className="gs-grade-name">{g.label}</div>
              <div className="gs-grade-number">{key}</div>
              <div className="gs-grade-price">
                {pricesLoading ? (
                  <div className="gs-skeleton-pulse"></div>
                ) : (
                  `$${(gradePrices[key] * priceModifier).toFixed(2)}/gal`
                )}
              </div>
            </div>
            );
          })}
        </div>

      </main>

      {/* pump button — full-width at the bottom */}
      <div className="gs-pump-row">
        <button
          data-grade={fuelGrade}
          className={`gs-pump-btn ${isPumpReady && !isTerminal ? 'ready' : ''} ${gameState === 'pumping' ? 'pumping' : ''}`}
          onMouseDown={startPumping}
          onMouseUp={stopPumping}
          onMouseLeave={stopPumping}
          onTouchStart={e => { e.preventDefault(); startPumping(); }}
          onTouchEnd={e => { e.preventDefault(); stopPumping(); }}
          disabled={isTerminal}
        >
          {gameState === 'pumping'
            ? 'Pumping...'
            : isTerminal
              ? '—'
              : <>Hold to pump <span className="gs-pump-btn-hint">or hold Space</span></>
          }
        </button>

        {/* tiny scoreboard under pump */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 2px 0', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
          <span>Score <strong style={{ color: 'var(--text)' }}>{score}</strong></span>
          <span>Streak <strong style={{ color: 'var(--text)' }}>{streak}</strong></span>
          <span>Best <strong style={{ color: 'var(--text)' }}>{bestStreak}</strong></span>
        </div>
      </div>
    </div>
  );
}
