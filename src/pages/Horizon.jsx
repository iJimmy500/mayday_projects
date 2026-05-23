import { useState, useEffect, useRef } from 'react';
import { Clock, Trash2, Plus, Volume2, VolumeX, CheckCircle, Play, Pause, RotateCcw, AlertTriangle } from 'lucide-react';
import './Horizon.css';

// Pre-curated timezone locations
const AVAILABLE_CITIES = [
  { name: 'New York', tz: 'America/New_York' },
  { name: 'Los Angeles', tz: 'America/Los_Angeles' },
  { name: 'Chicago', tz: 'America/Chicago' },
  { name: 'London', tz: 'Europe/London' },
  { name: 'Paris', tz: 'Europe/Paris' },
  { name: 'Tokyo', tz: 'Asia/Tokyo' },
  { name: 'Singapore', tz: 'Asia/Singapore' },
  { name: 'Dubai', tz: 'Asia/Dubai' },
  { name: 'Mumbai', tz: 'Asia/Kolkata' },
  { name: 'Sydney', tz: 'Australia/Sydney' },
  { name: 'Auckland', tz: 'Pacific/Auckland' },
  { name: 'Cape Town', tz: 'Africa/Johannesburg' },
  { name: 'São Paulo', tz: 'America/Sao_Paulo' }
];

export default function Horizon() {
  // Main Digital Clock Time State
  const [time, setTime] = useState(new Date());

  // Tabs: 'stopwatch' | 'timer'
  const [activeTab, setActiveTab] = useState('stopwatch');

  // Persistence States
  const [worldClocks, setWorldClocks] = useState(() => {
    const saved = localStorage.getItem('hz_world_clocks');
    return saved ? JSON.parse(saved) : ['America/New_York', 'Europe/London', 'Asia/Tokyo'];
  });

  const [reminders, setReminders] = useState(() => {
    const saved = localStorage.getItem('hz_reminders');
    return saved ? JSON.parse(saved) : [];
  });

  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem('hz_muted');
    return saved ? JSON.parse(saved) : false;
  });

  // Inputs
  const [selectedTz, setSelectedTz] = useState('America/Los_Angeles');
  const [agendaText, setAgendaText] = useState('');
  const [agendaTime, setAgendaTime] = useState('');

  // Active alarms & trigger states
  const [triggeredAlarmId, setTriggeredAlarmId] = useState(null);

  // Stopwatch States
  const [swRunning, setSwRunning] = useState(false);
  const [swElapsedTime, setSwElapsedTime] = useState(0); // in ms
  const [laps, setLaps] = useState([]);
  const stopwatchTicker = useRef(null);
  const lastSwTick = useRef(0);

  // Timer States
  const [timerMinutes, setTimerMinutes] = useState('5');
  const [timerSeconds, setTimerSeconds] = useState('00');
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerTotalSec, setTimerTotalSec] = useState(300); // 5 min
  const [timerLeftSec, setTimerLeftSec] = useState(300);
  const timerTicker = useRef(null);

  // ── Synchronize with Local Storage ──────────────────────────────────
  useEffect(() => {
    localStorage.setItem('hz_world_clocks', JSON.stringify(worldClocks));
  }, [worldClocks]);

  useEffect(() => {
    localStorage.setItem('hz_reminders', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem('hz_muted', JSON.stringify(isMuted));
  }, [isMuted]);

  // ── Main clock timer loop (Ticks every 10ms for smooth ms tracking) ──
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 10);
    return () => clearInterval(interval);
  }, []);

  // ── Web Audio Chime Synth ───────────────────────────────────────────
  const playChime = (freq = 440, duration = 1.0, type = 'sine') => {
    if (isMuted) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      // Smooth attack and exponential decay envelope
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.05); // soft level
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);

      // Clean up audio nodes/context
      setTimeout(() => {
        audioCtx.close();
      }, duration * 1000 + 100);
    } catch (e) {
      console.error('AudioContext synth error:', e);
    }
  };

  // ── Alarm Triggers & Reminder Polling ───────────────────────────────
  useEffect(() => {
    const currentHourMin = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;
    const seconds = time.getSeconds();

    reminders.forEach(r => {
      // Trigger if not completed, not triggered yet today, and the time matches
      // We check seconds === 0 to restrict triggering once during the matched minute
      if (!r.completed && !r.triggered && r.time === currentHourMin && seconds === 0) {
        // Mark triggered
        setReminders(prev => prev.map(item => item.id === r.id ? { ...item, triggered: true } : item));
        
        // Trigger visual alarm flash
        setTriggeredAlarmId(r.id);
        
        // Synthesize space-chime alarm sound
        playChime(587.33, 1.5, 'sine'); // D5 note
        setTimeout(() => playChime(880, 1.2, 'sine'), 250); // A5 note
        setTimeout(() => playChime(1174.66, 1.0, 'sine'), 500); // D6 note

        // Reset visual alarm flash after 15 seconds
        setTimeout(() => {
          setTriggeredAlarmId(null);
        }, 15000);
      }
    });
  }, [time, reminders]);

  // Reset "triggered" state for next day at midnight
  useEffect(() => {
    const hrs = time.getHours();
    const mins = time.getMinutes();
    const secs = time.getSeconds();
    // At exactly midnight, refresh all alarm triggers
    if (hrs === 0 && mins === 0 && secs === 0) {
      setReminders(prev => prev.map(r => ({ ...r, triggered: false })));
    }
  }, [time]);

  // ── Day Progress Bar Computations ──────────────────────────────────
  const getDayProgress = () => {
    const hrs = time.getHours();
    const mins = time.getMinutes();
    const secs = time.getSeconds();
    const totalSecs = 24 * 60 * 60;
    const elapsedSecs = (hrs * 3600) + (mins * 60) + secs;
    return (elapsedSecs / totalSecs) * 100;
  };

  // ── World Time Calculator ──────────────────────────────────────────
  const formatWorldTime = (tz) => {
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      const timeParts = formatter.format(time).split(' ');
      return { timeStr: timeParts[0], period: timeParts[1] };
    } catch (e) {
      return { timeStr: '--:--', period: '' };
    }
  };

  const getWorldOffset = (tz) => {
    try {
      const date = new Date();
      const localString = date.toLocaleString('en-US', { timeZone: tz });
      const diffMs = new Date(localString) - new Date(date.toLocaleString('en-US'));
      const hours = Math.round(diffMs / (3600 * 1000));
      if (hours === 0) return 'Same time';
      return hours > 0 ? `+${hours}h ahead` : `${hours}h behind`;
    } catch (e) {
      return '';
    }
  };

  const handleAddWorldClock = () => {
    if (!worldClocks.includes(selectedTz)) {
      setWorldClocks(prev => [...prev, selectedTz]);
      playChime(660, 0.2); // brief confirmation chime
    }
  };

  const handleRemoveWorldClock = (tz) => {
    setWorldClocks(prev => prev.filter(item => item !== tz));
    playChime(440, 0.1);
  };

  // ── Agenda Actions ──────────────────────────────────────────────────
  const handleAddReminder = (e) => {
    e.preventDefault();
    if (!agendaText.trim()) return;

    // Use current time if no time is provided
    let scheduledTime = agendaTime;
    if (!scheduledTime) {
      scheduledTime = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;
    }

    const newItem = {
      id: Date.now().toString(),
      text: agendaText.trim(),
      time: scheduledTime,
      completed: false,
      triggered: false
    };

    // Keep chronological order (earliest time first)
    setReminders(prev => [...prev, newItem].sort((a, b) => a.time.localeCompare(b.time)));
    setAgendaText('');
    setAgendaTime('');
    playChime(880, 0.15); // soft add chime
  };

  const handleToggleReminder = (id) => {
    setReminders(prev => prev.map(r => {
      if (r.id === id) {
        const nextState = !r.completed;
        if (nextState) {
          playChime(1046.50, 0.4); // beautiful success chime (C6)
          // Turn off alarm visually if it was active
          if (triggeredAlarmId === id) setTriggeredAlarmId(null);
        } else {
          playChime(523.25, 0.2); // lower chime (C5)
        }
        return { ...r, completed: nextState };
      }
      return r;
    }));
  };

  const handleRemoveReminder = (id) => {
    setReminders(prev => prev.filter(r => r.id !== id));
    if (triggeredAlarmId === id) setTriggeredAlarmId(null);
    playChime(370, 0.1);
  };

  // ── Stopwatch Logic (Precision animation loop) ──────────────────────
  const tickStopwatch = () => {
    const now = performance.now();
    const delta = now - lastSwTick.current;
    lastSwTick.current = now;

    setSwElapsedTime(prev => prev + delta);
    stopwatchTicker.current = requestAnimationFrame(tickStopwatch);
  };

  const handleStartStopwatch = () => {
    if (!swRunning) {
      lastSwTick.current = performance.now();
      stopwatchTicker.current = requestAnimationFrame(tickStopwatch);
      playChime(784, 0.15);
    } else {
      cancelAnimationFrame(stopwatchTicker.current);
      playChime(587, 0.15);
    }
    setSwRunning(!swRunning);
  };

  const handleLapStopwatch = () => {
    if (!swRunning || swElapsedTime === 0) return;
    setLaps(prev => [
      {
        index: prev.length + 1,
        time: swElapsedTime
      },
      ...prev
    ]);
    playChime(880, 0.08);
  };

  const handleResetStopwatch = () => {
    cancelAnimationFrame(stopwatchTicker.current);
    setSwRunning(false);
    setSwElapsedTime(0);
    setLaps([]);
    playChime(392, 0.2);
  };

  useEffect(() => {
    return () => cancelAnimationFrame(stopwatchTicker.current);
  }, []);

  // ── Timer Logic (Precise second ticks) ──────────────────────────────
  const tickTimer = () => {
    setTimerLeftSec(prev => {
      if (prev <= 1) {
        // Alarm triggers
        clearInterval(timerTicker.current);
        setTimerRunning(false);
        playChime(523.25, 1.2, 'triangle'); // C5 tone
        setTimeout(() => playChime(659.25, 1.0, 'triangle'), 200); // E5 tone
        setTimeout(() => playChime(783.99, 1.5, 'triangle'), 400); // G5 tone
        alert('Horizon Timer complete!');
        return 0;
      }
      return prev - 1;
    });
  };

  const handleStartTimer = () => {
    if (timerRunning) {
      clearInterval(timerTicker.current);
      playChime(587, 0.15);
      setTimerRunning(false);
    } else {
      if (timerLeftSec === 0) return;
      timerTicker.current = setInterval(tickTimer, 1000);
      playChime(784, 0.15);
      setTimerRunning(true);
    }
  };

  const handleResetTimer = () => {
    clearInterval(timerTicker.current);
    setTimerRunning(false);
    
    // Parse duration input or default to 5m
    const minVal = parseInt(timerMinutes, 10) || 0;
    const secVal = parseInt(timerSeconds, 10) || 0;
    const total = (minVal * 60) + secVal;
    
    setTimerTotalSec(total);
    setTimerLeftSec(total);
    playChime(392, 0.2);
  };

  // Sync state if user types custom minutes/seconds directly while stopped
  useEffect(() => {
    if (!timerRunning) {
      const minVal = parseInt(timerMinutes, 10) || 0;
      const secVal = parseInt(timerSeconds, 10) || 0;
      const total = (minVal * 60) + secVal;
      setTimerTotalSec(total);
      setTimerLeftSec(total);
    }
  }, [timerMinutes, timerSeconds, timerRunning]);

  useEffect(() => {
    return () => clearInterval(timerTicker.current);
  }, []);

  // Format Helper for Stopwatch / Timer displays
  const formatStopwatch = (timeMs) => {
    const mins = Math.floor(timeMs / 60000);
    const secs = Math.floor((timeMs % 60000) / 1000);
    const ms = Math.floor((timeMs % 1000) / 10);
    return {
      main: `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`,
      ms: String(ms).padStart(2, '0')
    };
  };

  const formatTimer = (secsTotal) => {
    const mins = Math.floor(secsTotal / 60);
    const secs = secsTotal % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Formatted date details for local clock header
  const getFormattedDate = () => {
    const weekday = time.toLocaleDateString(undefined, { weekday: 'long' });
    const date = time.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    return `${weekday} · ${date}`;
  };

  return (
    <div className="hz-root">
      {/* Top Header */}
      <header className="hz-header">
        <div className="hz-logo" onClick={() => window.location.href = 'https://mayinflight.com'}>
          Horizon
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            className="hz-mute-control" 
            onClick={() => {
              setIsMuted(m => !m);
              playChime(880, 0.1);
            }} 
            title={isMuted ? 'Unmute Sound Synth' : 'Mute Sound Synth'}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <span className="hz-top-meta">Day 22</span>
        </div>
      </header>

      {/* Main Content Layout Grid */}
      <main className="hz-container">
        
        {/* Left Side: Local Digital Clock HUD & World Time List */}
        <section className="hz-left-panel">
          
          {/* Typographic Digital Clock */}
          <div className="hz-clock-section">
            <div className="hz-digital-time">
              {time.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
              <span className="hz-ms">
                .{String(Math.floor(time.getMilliseconds() / 10)).padStart(2, '0')}
              </span>
            </div>
            
            <div className="hz-date-row">
              {getFormattedDate()}
            </div>

            {/* Subtle Day Progress */}
            <div className="hz-day-progress-container">
              <div className="hz-day-progress-bar">
                <div 
                  className="hz-day-progress-fill" 
                  style={{ width: `${getDayProgress()}%` }} 
                />
              </div>
              <div className="hz-day-progress-text">
                <span>Today is {getDayProgress().toFixed(2)}% complete</span>
              </div>
            </div>
          </div>

          {/* Minimalist World Clock */}
          <div className="hz-world-clocks">
            <div className="hz-section-title">
              <span>World Clocks</span>
            </div>
            
            <div className="hz-world-grid">
              {worldClocks.map(tz => {
                const cityObj = AVAILABLE_CITIES.find(c => c.tz === tz);
                const cityName = cityObj ? cityObj.name : tz.split('/').pop().replace('_', ' ');
                const worldTimeVal = formatWorldTime(tz);
                return (
                  <div key={tz} className="hz-world-row">
                    <div className="hz-world-info">
                      <span className="hz-world-city">{cityName}</span>
                      <span className="hz-world-offset">{getWorldOffset(tz)}</span>
                    </div>
                    <div className="hz-world-time-col">
                      <span className="hz-world-time">{worldTimeVal.timeStr}</span>
                      <span className="hz-world-period">{worldTimeVal.period}</span>
                      <button className="hz-remove-btn" onClick={() => handleRemoveWorldClock(tz)} title="Remove timezone">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Add City Control */}
            <div className="hz-add-world-control">
              <select 
                className="hz-select" 
                value={selectedTz}
                onChange={e => setSelectedTz(e.target.value)}
              >
                {AVAILABLE_CITIES.filter(c => !worldClocks.includes(c.tz)).map(c => (
                  <option key={c.tz} value={c.tz}>{c.name}</option>
                ))}
              </select>
              <button className="hz-btn accent" onClick={handleAddWorldClock}>
                <Plus size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Add City
              </button>
            </div>
          </div>

        </section>

        {/* Right Side: Agenda Planner & Timekeeper Utilities */}
        <section className="hz-right-panel">
          
          {/* Today's Agenda Checklist */}
          <div className="hz-agenda-section">
            <div className="hz-section-title">
              <span>Today's Agenda</span>
              <span className="hz-agenda-time" style={{ color: 'var(--text-muted)', backgroundColor: 'transparent' }}>
                {reminders.filter(r => !r.completed).length} active
              </span>
            </div>

            {/* Add task form */}
            <form className="hz-agenda-form" onSubmit={handleAddReminder}>
              <input
                type="text"
                className="hz-input-text"
                placeholder="What's happening today?"
                value={agendaText}
                onChange={e => setAgendaText(e.target.value)}
                maxLength={80}
              />
              <input
                type="time"
                className="hz-input-time"
                value={agendaTime}
                onChange={e => setAgendaTime(e.target.value)}
              />
              <button type="submit" className="hz-btn">Add</button>
            </form>

            {/* Reminder Checklist Items */}
            <div className="hz-agenda-list">
              {reminders.map(r => (
                <div 
                  key={r.id} 
                  className={`hz-agenda-item ${r.completed ? 'completed' : ''} ${triggeredAlarmId === r.id ? 'alarm-triggered' : ''}`}
                >
                  <div className="hz-agenda-left">
                    <input 
                      type="checkbox" 
                      className="hz-checkbox" 
                      checked={r.completed}
                      onChange={() => handleToggleReminder(r.id)}
                    />
                    <span className="hz-agenda-text">{r.text}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="hz-agenda-time">{r.time}</span>
                    <button className="hz-remove-btn" onClick={() => handleRemoveReminder(r.id)} title="Delete Reminder">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}

              {reminders.length === 0 && (
                <div className="hz-agenda-empty">
                  Your agenda is clear. Set some goals for today.
                </div>
              )}
            </div>
          </div>

          {/* Timekeeper Utilities (Stopwatch & Timer) */}
          <div className="hz-timekeepers">
            <div className="hz-tab-nav">
              <button 
                className={`hz-tab-btn ${activeTab === 'stopwatch' ? 'active' : ''}`}
                onClick={() => { setActiveTab('stopwatch'); playChime(660, 0.08); }}
              >
                Stopwatch
              </button>
              <button 
                className={`hz-tab-btn ${activeTab === 'timer' ? 'active' : ''}`}
                onClick={() => { setActiveTab('timer'); playChime(660, 0.08); }}
              >
                Timer
              </button>
            </div>

            {/* Tab content 1: Stopwatch */}
            {activeTab === 'stopwatch' && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="hz-stopwatch-display">
                  {formatStopwatch(swElapsedTime).main}
                  <span className="hz-stopwatch-ms">
                    .{formatStopwatch(swElapsedTime).ms}
                  </span>
                </div>
                
                <div className="hz-control-row">
                  <button className="hz-btn" onClick={handleResetStopwatch}>
                    <RotateCcw size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Reset
                  </button>
                  {swRunning && (
                    <button className="hz-btn" onClick={handleLapStopwatch}>
                      Lap
                    </button>
                  )}
                  <button className={`hz-btn ${swRunning ? 'accent' : ''}`} onClick={handleStartStopwatch}>
                    {swRunning ? <Pause size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> : <Play size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />}
                    {swRunning ? 'Pause' : 'Start'}
                  </button>
                </div>

                {/* Lap Table */}
                {laps.length > 0 && (
                  <div className="hz-lap-list">
                    {laps.map(lap => (
                      <div key={lap.index} className="hz-lap-row">
                        <span>Lap {lap.index}</span>
                        <span className="hz-lap-val">
                          {formatStopwatch(lap.time).main}.{formatStopwatch(lap.time).ms}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab content 2: Countdown Timer */}
            {activeTab === 'timer' && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                
                {/* Visual duration inputs */}
                {!timerRunning && (
                  <div className="hz-timer-inputs">
                    <div className="hz-timer-input-col">
                      <span className="hz-timer-input-label">Min</span>
                      <input 
                        type="number" 
                        className="hz-timer-num-input" 
                        min="0" max="99" 
                        value={timerMinutes} 
                        onChange={e => setTimerMinutes(String(Math.max(0, Math.min(99, parseInt(e.target.value, 10) || 0))))}
                      />
                    </div>
                    <span className="hz-timer-colon">:</span>
                    <div className="hz-timer-input-col">
                      <span className="hz-timer-input-label">Sec</span>
                      <input 
                        type="number" 
                        className="hz-timer-num-input" 
                        min="0" max="59" 
                        value={timerSeconds} 
                        onChange={e => setTimerSeconds(String(Math.max(0, Math.min(59, parseInt(e.target.value, 10) || 0))).padStart(2, '0'))}
                      />
                    </div>
                  </div>
                )}

                {/* Visual Timer Display */}
                {timerRunning && (
                  <div className="hz-timer-display">
                    {formatTimer(timerLeftSec)}
                  </div>
                )}

                {/* Progress Visualizer */}
                <div className="hz-timer-progress-container">
                  <div className="hz-timer-progress-bar">
                    <div 
                      className="hz-timer-progress-fill" 
                      style={{ width: `${timerTotalSec > 0 ? (timerLeftSec / timerTotalSec) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div className="hz-control-row">
                  <button className="hz-btn" onClick={handleResetTimer}>
                    <RotateCcw size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Reset
                  </button>
                  <button 
                    className={`hz-btn ${timerRunning ? 'accent' : ''}`} 
                    onClick={handleStartTimer}
                    disabled={timerLeftSec === 0}
                  >
                    {timerRunning ? <Pause size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> : <Play size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />}
                    {timerRunning ? 'Pause' : 'Start'}
                  </button>
                </div>

              </div>
            )}
          </div>

        </section>

      </main>
    </div>
  );
}
