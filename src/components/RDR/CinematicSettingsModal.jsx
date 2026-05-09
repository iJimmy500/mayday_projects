import React from 'react';
import { Settings, X, Clock, Play, Info, Layout } from 'lucide-react';

export default function CinematicSettingsModal({ settings, setSettings, onClose, isExiting }) {
  const updateSetting = (key, value) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      localStorage.setItem('rdr_cinematic_settings', JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className={`rdr-alert-overlay cinematic ${isExiting ? 'exiting' : ''}`} onClick={onClose}>
      <div className={`rdr-menu-box ${isExiting ? 'exiting' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="rdr-menu-list settings">
          <div className="rdr-settings-header-top">
            <h2 className="rdr-settings-title">CINEMATIC SETTINGS</h2>
            <p className="rdr-settings-explainer">
              Customize your American Frontier viewing experience.
            </p>
          </div>

          <div className="rdr-settings-content-body">
            <div className="rdr-setting-group">
              <div className="rdr-setting-header">
                <Clock size={16} />
                <span>TRANSITION INTERVAL</span>
              </div>
              <div className="rdr-setting-options">
                {[10000, 15000, 30000, 60000].map(val => (
                  <button 
                    key={val} 
                    className={`rdr-setting-btn ${settings.interval === val ? 'active' : ''}`}
                    onClick={() => updateSetting('interval', val)}
                  >
                    {val / 1000}s
                  </button>
                ))}
              </div>
            </div>

            <div className="rdr-setting-group">
              <div className="rdr-setting-header">
                <Layout size={16} />
                <span>ANIMATION STYLE</span>
              </div>
              <div className="rdr-setting-options">
                {['none', 'ken-burns', 'pan-left', 'pan-right'].map(val => (
                  <button 
                    key={val} 
                    className={`rdr-setting-btn ${settings.animation === val ? 'active' : ''}`}
                    onClick={() => updateSetting('animation', val)}
                  >
                    {val.replace('-', ' ').toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="rdr-setting-group">
              <div className="rdr-setting-header">
                <Play size={16} />
                <span>HIGH QUALITY ASSETS</span>
              </div>
              <p className="rdr-settings-explainer" style={{ marginBottom: '12px', textAlign: 'left', textTransform: 'none', opacity: 0.6 }}>
                Recommended for fast networks. Loads maximum fidelity images for a true 4K experience.
              </p>
              <div className="rdr-setting-options">
                {[true, false].map(val => (
                  <button 
                    key={String(val)} 
                    className={`rdr-setting-btn ${settings.highQuality === val ? 'active' : ''}`}
                    onClick={() => updateSetting('highQuality', val)}
                  >
                    {val ? 'ON' : 'OFF'}
                  </button>
                ))}
              </div>
            </div>

            <div className="rdr-menu-item" onClick={onClose} style={{ marginTop: '20px' }}>
              <span>CLOSE SETTINGS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
