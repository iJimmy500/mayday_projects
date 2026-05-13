import React from 'react';
import { ShieldCheck, MapPin, Search, Sun, Wind } from 'lucide-react';
import WeatherBackground from './WeatherBackground';
import './NWTSWeatherMobile.css';

export default function NWTSWeatherMobile({ 
  weather, 
  location, 
  isPlaying, 
  setIsPlaying, 
  isSearching, 
  setIsSearching, 
  searchQuery, 
  setSearchQuery, 
  handleSearch, 
  showPrivacy, 
  setShowPrivacy, 
  isAltImage, 
  setIsAltImage,
  getWeatherDesc,
  getWeatherIcon,
  nowIndex
}) {
  const current = weather?.current_weather;

  return (
    <>
      {isPlaying && (
        <div style={{ position: 'absolute', width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}>
          <iframe
            width="560" height="315" title="NWTS Player"
            src={`https://www.youtube.com/embed/videoseries?list=OLAK5uy_kRINftXw_QTiPPiJEAwgjZXEUJWn8_nJg&autoplay=1&mute=0&index=${Math.floor(Math.random() * 10)}`}
            allow="autoplay; encrypted-media"
          ></iframe>
        </div>
      )}

      <div className="nwts-mobile-ui">
        {/* Top Header */}
        <header className="mobile-header">
          <div className="mobile-location" onClick={() => setShowPrivacy(!showPrivacy)}>
            <MapPin size={14} />
            <span>{location.city.toUpperCase()}</span>
          </div>
        </header>

        {/* Search Bar (Persistent on Mobile) */}
        <div className="mobile-search-bar">
          <Search size={14} />
          <input 
            placeholder="Search City..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>

        {/* Main Temp Centerpiece */}
        <div className="mobile-main">
          <h1 className="mobile-temp">{Math.round(current?.temperature || 0)}°</h1>
          <p className="mobile-condition">{getWeatherDesc(current?.weathercode)}</p>
          <div className="mobile-high-low">
            H: {Math.round((weather?.daily?.temperature_2m_max || [])[0] || 0)}° L: {Math.round((weather?.daily?.temperature_2m_min || [])[0] || 0)}°
          </div>
        </div>

        {/* Hourly Forecast (Horizontal Scroll) */}
        <div className="mobile-forecast-container">
          <div className="mobile-forecast-scroll">
            {[0, 2, 4, 6, 8, 10, 12].map((offset) => {
              const idx = (nowIndex + offset) % 24;
              const timeLabel = offset === 0 ? 'NOW' : `${idx % 12 || 12}${idx >= 12 ? 'PM' : 'AM'}`;
              return (
                <div className="mobile-hourly-item" key={offset}>
                  <span>{timeLabel}</span>
                  {getWeatherIcon(weather?.hourly?.weathercode[idx])}
                  <span>{Math.round(weather?.hourly?.temperature_2m[idx])}°</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Privacy Pop-up */}
        {showPrivacy && (
          <div className="mobile-privacy-sheet" onClick={() => setShowPrivacy(false)}>
             <ShieldCheck size={18} color="#4CAF50" />
             <p>IP Geolocation active. No data stored.</p>
          </div>
        )}
      </div>

      {/* Centered/Floating Drake Image */}
      <div className="mobile-drake-box" onClick={() => setIsAltImage(!isAltImage)}>
        <img src={isAltImage ? "/nwts2.png" : "/nwts.png"} alt="Drake" />
      </div>
    </>
  );
}
