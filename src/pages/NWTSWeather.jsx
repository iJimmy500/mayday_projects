import React, { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, MapPin, Search, Wind, ShieldCheck, Flower, ExternalLink, Play, Pause, Music, ArrowUpRight, X } from 'lucide-react';
import WeatherBackground from '../components/NWTSWeather/WeatherBackground';
import ErrorAlert from '../components/NWTSWeather/ErrorAlert';
import './NWTSWeather.css';
import '../components/NWTSWeather/NWTSWeatherMobile.css';

// Sub-components
const SearchSuggestions = ({ results, onSelect }) => (
  <div className="nwts-search-suggestions">
    {results.map((res) => (
      <div key={res.id} className="suggestion-item" onClick={() => onSelect(res)}>
        <span className="suggestion-name">{res.name.toLowerCase()}</span>
        <span className="suggestion-admin">{res.admin1?.toLowerCase()}, {res.country_code?.toLowerCase()}</span>
      </div>
    ))}
  </div>
);

const TopBar = ({ city, isPlaying, onTogglePlay, isSearching, searchQuery, onSearchChange, onSearchKeyDown, onStartSearch, onPrivacyToggle, themeColor, searchResults, onSelectResult }) => (
  <div className="nwts-top-bar">
    <div className="nwts-location" onClick={onPrivacyToggle}>
      <MapPin size={16} strokeWidth={2.5} />
      <span>{city.toLowerCase()}</span>
    </div>
    <div className="nwts-top-actions">
      <button className={`nwts-play-btn ${isPlaying ? 'playing' : ''}`} onClick={onTogglePlay}>
        {isPlaying ? <Wind size={18} strokeWidth={2.5} /> : <Sun size={18} strokeWidth={2.5} />}
        <span>{isPlaying ? "playing" : "play album"}</span>
      </button>
      {isSearching ? (
        <div style={{ position: 'relative' }}>
          <input
            autoFocus
            className="nwts-search-input"
            placeholder="where to?"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={onSearchKeyDown}
            onBlur={() => setTimeout(() => onStartSearch(false), 200)}
          />
          {searchResults.length > 0 && (
            <SearchSuggestions results={searchResults} onSelect={onSelectResult} />
          )}
        </div>
      ) : (
        <div className="nwts-search" onClick={() => onStartSearch(true)}>
          <Search size={16} strokeWidth={2.5} />
          <span>search</span>
        </div>
      )}
      <a href="https://mayinflight.com" target="_blank" rel="noopener noreferrer" className="nwts-desktop-logo">
        <Flower size={16} />
      </a>
    </div>
  </div>
);

const MainWeather = ({ temp, condition, feelsLike, humidity, wind }) => (
  <div className="nwts-main-weather">
    <h1 className="nwts-temp">{Math.round(temp)}°</h1>
    <p className="nwts-condition">{condition.toLowerCase()}</p>
    <div className="nwts-high-low">
      <span>feels like {Math.round(feelsLike)}°</span>
      <span style={{ margin: '0 10px', opacity: 0.3 }}>|</span>
      <span>humidity {Math.round(humidity)}%</span>
      <span style={{ margin: '0 10px', opacity: 0.3 }}>|</span>
      <span>wind {Math.round(wind)} mph</span>
    </div>
  </div>
);

const ForecastPanel = ({ hourlyData, nowIndex, getWeatherIcon }) => (
  <div className="nwts-glass-panel">
    <div className="nwts-hourly">
      {[0, 3, 6, 9, 12].map((offset) => {
        const idx = (nowIndex + offset) % 24;
        const timeLabel = offset === 0 ? 'NOW' : `${idx % 12 || 12}${idx >= 12 ? 'PM' : 'AM'}`;
        return (
          <div className="hourly-item" key={offset}>
            <span>{timeLabel}</span>
            {getWeatherIcon(hourlyData?.weathercode[idx])}
            <span>{Math.round(hourlyData?.temperature_2m[idx])}°</span>
          </div>
        );
      })}
    </div>
  </div>
);

const DrakeImage = ({ isAlt, onClick }) => (
  <img src={isAlt ? "/nwts2.png" : "/nwts.png"} alt="Drake" className="nwts-drake-image interactive" onClick={onClick} title="Click to switch version" />
);

const WelcomeScreen = ({ onSearchKeyDown, onAutoDetect, searchQuery, setSearchQuery, themeColor, searchResults, onSelectResult }) => (
  <div className="nwts-welcome-screen" style={{ background: themeColor }}>
    <div className="welcome-content">
      <h1>drake weather</h1>
      <p>It's far from over. Where to?</p>

      <div className="welcome-search-box-container">
        <div className="welcome-search-box">
          <Search size={18} className="search-icon" />
          <input
            placeholder="toronto, on"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={onSearchKeyDown}
          />
        </div>
        {searchResults.length > 0 && (
          <SearchSuggestions results={searchResults} onSelect={onSelectResult} />
        )}
      </div>

      <div className="welcome-divider">or</div>

      <button className="welcome-auto-btn" onClick={onAutoDetect}>
        <MapPin size={16} /> detect my location
      </button>
    </div>

    <footer className="nwts-footer">
      <a href="https://mayinflight.com" className="nwts-footer-link" target="_blank" rel="noopener noreferrer">
        mayday <Flower size={14} strokeWidth={1.5} />
      </a>
    </footer>
  </div>
);

const MusicLinkModal = ({ onClose }) => (
  <div className="nwts-location-modal music-dropdown" style={{ top: '50px', right: '-20px', left: 'auto', bottom: 'auto', width: '200px', padding: '16px' }}>
    <div className="modal-header" style={{ marginBottom: '12px' }}>
      <Music size={14} strokeWidth={2.5} />
      <span>where to?</span>
      <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'white', opacity: 0.5, cursor: 'pointer', padding: 0 }}>
        <X size={14} />
      </button>
    </div>
    <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <a href="https://music.apple.com/us/album/nothing-was-the-same-deluxe/1440829462" target="_blank" rel="noopener noreferrer" className="modal-maps-link" style={{ padding: '8px 12px' }}>apple music <ArrowUpRight size={12} /></a>
      <a href="https://open.spotify.com/album/5mz0mJxb80gqJIcRf9LGHJ?si=yhtn6BWSQwyW2jdF4WGV1w" target="_blank" rel="noopener noreferrer" className="modal-maps-link" style={{ padding: '8px 12px' }}>spotify <ArrowUpRight size={12} /></a>
      <a href="https://www.youtube.com/playlist?list=OLAK5uy_kRINftXw_QTiPPiJEAwgjZXEUJWn8_nJg" target="_blank" rel="noopener noreferrer" className="modal-maps-link" style={{ padding: '8px 12px' }}>youtube <ArrowUpRight size={12} /></a>
    </div>
  </div>
);

export default function NWTSWeather() {
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState({ city: 'Toronto', region: 'ON', country: 'Canada', lat: 43.6532, lon: -79.3832 });
  const [loading, setLoading] = useState(false);
  const [hasSetLocation, setHasSetLocation] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showMusicModal, setShowMusicModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isAltImage, setIsAltImage] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    if (error) {
      const timer = setTimeout(() => setError(null), 3000);
      return () => { clearTimeout(timer); window.removeEventListener('resize', handleResize); };
    }
    return () => window.removeEventListener('resize', handleResize);
  }, [error]);

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=5&language=en&format=json`);
        const data = await res.json();
        setSearchResults(data.results || []);
      } catch (err) {
        console.error('search failed:', err);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const getWeatherIcon = (code) => {
    if (code === 0) return <Sun size={20} strokeWidth={2.5} />;
    if (code <= 3) return <Cloud size={20} strokeWidth={2.5} />;
    if (code >= 45 && code <= 48) return <Cloud size={20} strokeWidth={2.5} />;
    if (code >= 51 && code <= 67) return <CloudRain size={20} strokeWidth={2.5} />;
    if (code >= 71 && code <= 82) return <CloudRain size={20} strokeWidth={2.5} />;
    if (code >= 95) return <CloudRain size={20} strokeWidth={2.5} />;
    return <Cloud size={20} strokeWidth={2.5} />;
  };

  const getWeatherDesc = (code) => {
    if (code === 0) return 'clear sky';
    if (code <= 3) return 'partly cloudy';
    if (code >= 45 && code <= 48) return 'foggy';
    if (code >= 51 && code <= 67) return 'rainy';
    if (code >= 71 && code <= 82) return 'snowy';
    if (code >= 95) return 'thunderstorm';
    return 'cloudy';
  };

  const fetchWeatherForCoords = async (lat, lon) => {
    try {
      setLoading(true);
      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,weathercode,windspeed_10m,relative_humidity_2m,apparent_temperature&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&forecast_days=1`);
      const weatherData = await weatherRes.json();
      setWeather(weatherData);
      setHasSetLocation(true);
    } catch (err) {
      setError("system offline");
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  const selectLocation = async (result) => {
    setLocation({
      city: result.name,
      region: result.admin1 || '',
      country: result.country,
      lat: result.latitude,
      lon: result.longitude
    });
    await fetchWeatherForCoords(result.latitude, result.longitude);
    setIsSearching(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleAutoDetect = async () => {
    try {
      setLoading(true);
      const geoRes = await fetch('https://ipapi.co/json/');
      const geoData = await geoRes.json();
      const lat = geoData.latitude || 43.6532;
      const lon = geoData.longitude || -79.3832;
      setLocation({
        city: geoData.city || 'Toronto',
        region: geoData.region || 'ON',
        country: geoData.country_name || 'Canada',
        lat, lon
      });
      await fetchWeatherForCoords(lat, lon);
    } catch (err) {
      setError("detection failed");
      setLoading(false);
    }
  };

  const handleSearchKeyDown = async (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      if (searchResults.length > 0) {
        selectLocation(searchResults[0]);
      } else {
        try {
          setLoading(true);
          const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=1&language=en&format=json`);
          const geoData = await geoRes.json();
          if (geoData.results?.length) selectLocation(geoData.results[0]);
          else { setError("city not found"); setLoading(false); }
        } catch (err) { setError("search failed"); } finally { setLoading(false); }
      }
    }
  };

  const getWeatherColor = (code, isDay) => {
    if (!isDay) return '#0F1D2B';
    if (code === undefined) return '#79B3E1';
    if (code >= 51 && code <= 67) return '#3B5369'; // Rain
    if (code >= 45 && code <= 48) return '#8FA7B8'; // Fog
    if (code > 0 && code <= 3) return '#6085A6'; // Cloudy
    return '#79B3E1'; // Clear
  };

  const current = weather?.current_weather;
  const themeColor = getWeatherColor(current?.weathercode, current?.is_day === 1);
  const nowIndex = new Date().getHours();
  const hourly = weather?.hourly;

  return (
    <div className="nwts-weather-container">
      <WeatherBackground weatherCode={current?.weathercode} isDay={current?.is_day === 1} isWindy={current?.windspeed > 15} />
      <ErrorAlert message={error} />

      {!hasSetLocation && !loading ? (
        <WelcomeScreen
          onSearchKeyDown={handleSearchKeyDown}
          onAutoDetect={handleAutoDetect}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          themeColor={themeColor}
          searchResults={searchResults}
          onSelectResult={selectLocation}
        />
      ) : loading ? (
        isMobile ? (
          <div className="nwts-mobile-ui">
            <header className="mobile-header">
              <div className="skeleton-item" style={{ width: '120px', height: '32px', borderRadius: '16px' }}></div>
              <div className="skeleton-item" style={{ width: '32px', height: '32px', borderRadius: '50%' }}></div>
            </header>
            <div className="mobile-main">
              <div className="skeleton-item" style={{ width: '180px', height: '120px', borderRadius: '24px', margin: '0 auto 20px' }}></div>
              <div className="skeleton-item" style={{ width: '140px', height: '24px', borderRadius: '8px', margin: '0 auto' }}></div>
            </div>
            <div className="mobile-forecast-mini" style={{ justifyContent: 'center', gap: '15px' }}>
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton-item" style={{ width: '60px', height: '80px', borderRadius: '16px' }}></div>
              ))}
            </div>
          </div>
        ) : (
          <div className="nwts-ui-wrapper">
            <TopBar city={location.city} isPlaying={false} onTogglePlay={() => { }} isSearching={false} searchQuery="" onSearchChange={() => { }} onSearchKeyDown={() => { }} onStartSearch={() => { }} onPrivacyToggle={() => { }} searchResults={[]} onSelectResult={() => { }} />
            <div className="nwts-main-weather">
              <div className="skeleton-item" style={{ width: '220px', height: '140px', borderRadius: '20px' }}></div>
              <div className="skeleton-item" style={{ width: '180px', height: '30px', margin: '15px 0', borderRadius: '10px' }}></div>
            </div>
          </div>
        )
      ) : isMobile ? (
        <div className="nwts-mobile-ui">
          <header className="mobile-header">
            {isSearching ? (
              <div className="mobile-search-overlay" style={{ background: `${themeColor}F2` }}>
                <div className="mobile-search-inner">
                  <Search size={16} className="search-icon" />
                  <input
                    autoFocus
                    placeholder="where to?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                  />
                  <button className="mobile-search-cancel" onClick={() => setIsSearching(false)}>cancel</button>
                </div>
                {searchResults.length > 0 && (
                  <SearchSuggestions results={searchResults} onSelect={selectLocation} />
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
                <div className="mobile-location-pill" onClick={() => setIsSearching(true)}>
                  <MapPin size={14} />
                  <span>{location.city.toLowerCase()}</span>
                </div>
                <button className={`mobile-play-pill ${showMusicModal ? 'active' : ''}`} onClick={() => setShowMusicModal(!showMusicModal)}>
                  <ArrowUpRight size={16} />
                </button>
                {showMusicModal && <MusicLinkModal onClose={() => setShowMusicModal(false)} />}
              </div>
            )}
            {!isSearching && (
              <a href="https://mayinflight.com" target="_blank" rel="noopener noreferrer" className="mobile-mayday-logo">
                <Flower size={18} />
              </a>
            )}
          </header>

          <div className="mobile-main">
            <div onClick={() => setShowLocationModal(!showLocationModal)}>
              <h1 className="mobile-temp">{Math.round(current?.temperature || 0)}°</h1>
              <p className="mobile-condition">{getWeatherDesc(current?.weathercode).toLowerCase()}</p>
              <div className="mobile-high-low">
                feels like {Math.round(hourly?.apparent_temperature[nowIndex] || 0)}° | humidity {Math.round(hourly?.relative_humidity_2m[nowIndex] || 0)}%
              </div>
            </div>

            {showLocationModal && (
              <div className="mobile-location-details" onClick={() => setShowLocationModal(false)}>
                <div className="details-header">
                  <MapPin size={14} />
                  <span>location data</span>
                </div>
                <h3>{location.city.toLowerCase()}, {location.region.toLowerCase()}</h3>
                <p>{location.country.toLowerCase()}</p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lon}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="details-maps-link"
                  onClick={(e) => e.stopPropagation()}
                >
                  open in maps <ArrowUpRight size={12} />
                </a>
              </div>
            )}
          </div>

          <div className="mobile-forecast-mini">
            {[0, 1, 2].map((offset) => {
              const idx = (nowIndex + offset) % 24;
              const timeLabel = offset === 0 ? 'now' : `${idx % 12 || 12}${idx >= 12 ? 'pm' : 'am'}`;
              return (
                <div className="mobile-hourly-mini" key={offset}>
                  <span>{timeLabel}</span>
                  {getWeatherIcon(weather?.hourly?.weathercode[idx])}
                  <span>{Math.round(weather?.hourly?.temperature_2m[idx])}°</span>
                </div>
              );
            })}
          </div>

          <div className="mobile-drake-centered">
            <img src="/nwts.png" alt="Drake" />
          </div>
        </div>
      ) : (
        <div className="nwts-ui-wrapper">
          <TopBar
            city={location.city}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            isSearching={isSearching}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSearchKeyDown={handleSearchKeyDown}
            onStartSearch={setIsSearching}
            onPrivacyToggle={() => setShowLocationModal(!showLocationModal)}
            themeColor={themeColor}
            searchResults={searchResults}
            onSelectResult={selectLocation}
          />
          {showLocationModal && (
            <div className="nwts-location-modal" onClick={() => setShowLocationModal(false)}>
              <div className="modal-header">
                <MapPin size={16} strokeWidth={2.5} />
                <span>location profile</span>
              </div>
              <div className="modal-body">
                <div className="modal-city">{location.city.toLowerCase()}</div>
                <div className="modal-region">{location.region.toLowerCase()}, {location.country.toLowerCase()}</div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lon}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="modal-maps-link"
                  onClick={(e) => e.stopPropagation()}
                >
                  view on maps <ExternalLink size={14} />
                </a>
              </div>
            </div>
          )}
          <MainWeather
            temp={current?.temperature}
            condition={getWeatherDesc(current?.weathercode)}
            feelsLike={hourly?.apparent_temperature[nowIndex]}
            humidity={hourly?.relative_humidity_2m[nowIndex]}
            wind={current?.windspeed}
          />
          <ForecastPanel hourlyData={weather?.hourly} nowIndex={nowIndex} getWeatherIcon={getWeatherIcon} />
          <DrakeImage isAlt={isAltImage} onClick={() => setIsAltImage(!isAltImage)} />
          {isPlaying && (
            <div style={{ position: 'absolute', width: '1px', height: '1px', opacity: 0.01, pointerEvents: 'none', overflow: 'hidden', bottom: 0, left: 0 }}>
              <iframe width="1" height="1" title="NWTS Player" src={`https://www.youtube.com/embed/videoseries?list=OLAK5uy_kRINftXw_QTiPPiJEAwgjZXEUJWn8_nJg&autoplay=1&mute=0&playsinline=1&enablejsapi=1&index=${Math.floor(Math.random() * 10)}`} allow="autoplay; encrypted-media" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
