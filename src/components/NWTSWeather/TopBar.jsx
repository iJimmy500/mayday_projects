import React from 'react';
import { MapPin, Search, Sun, Wind } from 'lucide-react';

export default function TopBar({ city, isPlaying, onTogglePlay, isSearching, searchQuery, onSearchChange, onSearchKeyDown, onStartSearch, onPrivacyToggle }) {
  return (
    <div className="nwts-top-bar">
      <div className="nwts-location" onClick={onPrivacyToggle}>
        <MapPin size={16} strokeWidth={2.5} />
        <span>{city.toUpperCase()}</span>
      </div>
      
      <div className="nwts-top-actions">
        <button 
          className={`nwts-play-btn ${isPlaying ? 'playing' : ''}`} 
          onClick={onTogglePlay}
        >
          {isPlaying ? <Wind size={18} strokeWidth={2.5} /> : <Sun size={18} strokeWidth={2.5} />}
          <span>{isPlaying ? "PLAYING" : "PLAY ALBUM"}</span>
        </button>
        
        {isSearching ? (
          <input
            autoFocus
            className="nwts-search-input"
            placeholder="City Name..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={onSearchKeyDown}
            onBlur={() => !searchQuery && onStartSearch(false)}
          />
        ) : (
          <div className="nwts-search" onClick={() => onStartSearch(true)}>
            <Search size={14} strokeWidth={3} />
            <span>Search</span>
          </div>
        )}
      </div>
    </div>
  );
}
