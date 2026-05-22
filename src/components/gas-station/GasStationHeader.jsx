import { Settings, Database, VolumeX, Volume2, Flower } from 'lucide-react';

export default function GasStationHeader({
  apiError,
  onOpenSettings,
  location,
  setLocation,
  locations,
  isMuted,
  onToggleMute,
  onExit
}) {
  return (
    <header className="gs-topbar">
      {apiError && (
        <span className="gs-api-error">Failed to load live prices. Using defaults.</span>
      )}
      <button className="gs-settings-btn" onClick={onOpenSettings} title="Market Settings">
        <Settings size={18} />
      </button>
      <a href="https://www.eia.gov/" target="_blank" rel="noopener noreferrer" className="gs-eia-link" title="Live Data by EIA">
        <Database size={18} />
      </a>
      <select 
        className="gs-location-select" 
        value={location} 
        onChange={(e) => setLocation(e.target.value)}
      >
        {locations.map(loc => (
          <option key={loc.id} value={loc.id}>{loc.label}</option>
        ))}
      </select>
      <button
        className="gs-icon-btn"
        onClick={onToggleMute}
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
      </button>
      <button
        className="gs-icon-btn"
        onClick={onExit}
        title="Exit"
      >
        <Flower size={15} />
      </button>
    </header>
  );
}
