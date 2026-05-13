import React from 'react';
import './WeatherBackground.css';

const WEATHER_MAPPING = {
  0: 'clear',
  1: 'cloudy', 2: 'cloudy', 3: 'cloudy',
  45: 'fog', 48: 'fog',
  51: 'rain', 53: 'rain', 55: 'rain',
  61: 'rain', 63: 'rain', 65: 'rain',
  71: 'snow', 73: 'snow', 75: 'snow',
  80: 'rain', 81: 'rain', 82: 'rain',
  95: 'storm', 96: 'storm', 99: 'storm'
};

export default function WeatherBackground({ weatherCode, isDay, isWindy }) {
  const getBaseState = () => {
    if (weatherCode === undefined) return 'clear';
    if (!isDay) return 'night';
    
    // Check for specific conditions
    if (weatherCode >= 45 && weatherCode <= 48) return 'fog';
    if (weatherCode >= 51 && weatherCode <= 67) return 'rain';
    if (weatherCode >= 71 && weatherCode <= 86) return 'snow';
    if (weatherCode >= 95) return 'storm';
    if (weatherCode > 0 && weatherCode <= 3) return 'cloudy';
    
    return 'clear';
  };

  const state = getBaseState();
  const classes = [
    'nwts-bg-container',
    `state-${state}`,
    isWindy ? 'is-windy' : '',
    !isDay ? 'is-night' : 'is-day'
  ].join(' ');

  return (
    <div className={classes}>
      {/* Background Layers */}
      <div className="bg-layer base"></div>
      <div className="bg-layer gradient"></div>
      
      {/* Dynamic Clouds */}
      <div className="nwts-clouds">
        <div className="cloud c1"></div>
        <div className="cloud c2"></div>
        <div className="cloud c3"></div>
      </div>

      {/* Special Effects */}
      {state === 'rain' && <div className="effect rain-drops"></div>}
      {state === 'snow' && <div className="effect snow-flakes"></div>}
      {state === 'fog' && <div className="effect fog-overlay"></div>}
      {state === 'storm' && <div className="effect lightning-bolt"></div>}
      {isWindy && <div className="effect wind-lines"></div>}
    </div>
  );
}
