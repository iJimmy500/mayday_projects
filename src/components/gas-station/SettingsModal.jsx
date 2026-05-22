export default function SettingsModal({ 
  isOpen, 
  onClose, 
  eventFrequency, 
  setEventFrequency, 
  eventBias, 
  setEventBias, 
  onResetMarket 
}) {
  if (!isOpen) return null;

  return (
    <div className="gs-event-modal-overlay">
      <div className="gs-event-modal" style={{ maxWidth: '360px' }}>
        <h2 className="gs-event-title" style={{ marginBottom: '24px' }}>Market Settings</h2>
        
        <div className="gs-settings-section">
          <label className="gs-settings-label">Event Frequency</label>
          <div className="gs-settings-segments">
            {[{l: 'Off', v: 0}, {l: 'Rare', v: 0.05}, {l: 'Normal', v: 0.15}, {l: 'Chaos', v: 1.0}].map(opt => (
              <button 
                key={opt.l} 
                className={`gs-settings-segment ${eventFrequency === opt.v ? 'active' : ''}`}
                onClick={() => setEventFrequency(opt.v)}
              >
                {opt.l}
              </button>
            ))}
          </div>
        </div>

        <div className="gs-settings-section" style={{ marginTop: '20px', marginBottom: '32px' }}>
          <label className="gs-settings-label">Event Bias</label>
          <div className="gs-settings-segments">
            {[{l: 'Negative', v: 'negative'}, {l: 'Balanced', v: 'balanced'}, {l: 'Positive', v: 'positive'}].map(opt => (
              <button 
                key={opt.l} 
                className={`gs-settings-segment ${eventBias === opt.v ? 'active' : ''}`}
                onClick={() => setEventBias(opt.v)}
              >
                {opt.l}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button 
            className="gs-event-btn" 
            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--text-muted)' }}
            onClick={onResetMarket}
          >
            Reset Market Prices
          </button>
          
          <button className="gs-event-btn" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
