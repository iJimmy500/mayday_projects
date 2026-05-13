import React from 'react';
import { ShieldCheck } from 'lucide-react';
import WeatherBackground from './WeatherBackground';
import TopBar from './TopBar';
import MainWeather from './MainWeather';
import ForecastPanel from './ForecastPanel';
import DrakeImage from './DrakeImage';

export default function NWTSWeatherDesktop({ 
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

      <div className="nwts-ui-wrapper">
        <TopBar 
          city={location.city}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          isSearching={isSearching}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchKeyDown={handleSearch}
          onStartSearch={setIsSearching}
          onPrivacyToggle={() => setShowPrivacy(!showPrivacy)}
        />

        {showPrivacy && (
          <div className="nwts-privacy-notice" onClick={() => setShowPrivacy(false)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <ShieldCheck size={16} color="#4CAF50" />
              <span style={{ fontWeight: 600, fontSize: '0.75rem' }}>Privacy Protected</span>
            </div>
            <p>Your IP address was used solely to estimate your current city for local weather.</p>
          </div>
        )}

        <MainWeather 
          temp={current?.temperature || 0}
          condition={getWeatherDesc(current?.weathercode)}
          city={location.city}
          region={location.region}
          high={(weather?.daily?.temperature_2m_max || [])[0] || 0}
          low={(weather?.daily?.temperature_2m_min || [])[0] || 0}
        />

        <ForecastPanel 
          hourlyData={weather?.hourly}
          nowIndex={nowIndex}
          getWeatherIcon={getWeatherIcon}
        />
      </div>

      <DrakeImage isAlt={isAltImage} onClick={() => setIsAltImage(!isAltImage)} />
    </>
  );
}
