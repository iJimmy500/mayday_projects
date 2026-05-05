import { useState, useEffect } from 'react';
import { Settings, Flower } from 'lucide-react';
import './NewTab.css';

export default function NewTab() {
  const [time, setTime] = useState(new Date());
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('nt-time-settings');
    return saved ? JSON.parse(saved) : {
      font: "'Inter', sans-serif",
      hour12: false,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('nt-time-settings', JSON.stringify(settings));
  }, [settings]);

  const formatDate = (date) => {
    try {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric',
        timeZone: settings.timezone
      });
    } catch (e) {
      return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    }
  };

  const formatTime = (date) => {
    try {
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: settings.hour12,
        timeZone: settings.timezone
      });
    } catch (e) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: settings.hour12 });
    }
  };

  const fonts = [
    { name: 'Modern Sans', value: "'Inter', sans-serif" },
    { name: 'Monospace', value: "'Roboto Mono', monospace" },
    { name: 'Elegant Serif', value: "'Playfair Display', serif" },
    { name: 'Geometric', value: "'Outfit', sans-serif" }
  ];

  const commonTimezones = [
    'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Asia/Dubai', 'Australia/Sydney'
  ];

  return (
    <div className="nt-theme" style={{ '--nt-font': settings.font }}>
      <main className="nt-main">
        <section className="nt-clock-section">
          <div className="nt-time">{formatTime(time)}</div>
          <div className="nt-date">{formatDate(time)}</div>
        </section>
      </main>

      <button className="nt-settings-trigger" onClick={() => setShowSettings(!showSettings)}>
        <Settings size={18} strokeWidth={1.5} />
      </button>

      {showSettings && (
        <div className="nt-modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="nt-modal" onClick={e => e.stopPropagation()}>
            <div className="nt-modal-header">
              <h3>Clock Settings</h3>
              <button className="nt-close" onClick={() => setShowSettings(false)}>&times;</button>
            </div>
            
            <div className="nt-setting-item">
              <label>Typography</label>
              <div className="nt-font-grid">
                {fonts.map(f => (
                  <button 
                    key={f.name}
                    className={`nt-font-btn ${settings.font === f.value ? 'active' : ''}`}
                    onClick={() => setSettings(prev => ({ ...prev, font: f.value }))}
                    style={{ fontFamily: f.value }}
                  >
                    Aa
                  </button>
                ))}
              </div>
            </div>

            <div className="nt-setting-item">
              <label>Time Format</label>
              <div className="nt-toggle-row" onClick={() => setSettings(prev => ({ ...prev, hour12: !prev.hour12 }))}>
                <span>12-hour (AM/PM)</span>
                <div className={`nt-toggle ${settings.hour12 ? 'active' : ''}`}></div>
              </div>
            </div>

            <div className="nt-setting-item">
              <label>Timezone</label>
              <select 
                className="nt-select"
                value={settings.timezone}
                onChange={(e) => setSettings(prev => ({ ...prev, timezone: e.target.value }))}
              >
                {commonTimezones.map(tz => (
                  <option key={tz} value={tz}>{tz.replace('_', ' ')}</option>
                ))}
                {!commonTimezones.includes(settings.timezone) && (
                  <option value={settings.timezone}>{settings.timezone}</option>
                )}
              </select>
            </div>
          </div>
        </div>
      )}

      <footer className="page-footer">
        <a href="https://mayinflight.com" className="footer-link" target="_blank" rel="noopener noreferrer">
          mayday <Flower size={14} strokeWidth={1.5} />
        </a>
      </footer>
    </div>
  );
}
