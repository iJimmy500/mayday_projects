import React from 'react';

export default function MainWeather({ temp, condition, city, region, high, low }) {
  return (
    <div className="nwts-main-weather">
      <h1 className="nwts-temp">{Math.round(temp)}°</h1>
      <p className="nwts-condition">{condition}</p>
      <div className="nwts-high-low">
        <span>{city.toUpperCase()}, {region.toUpperCase()}</span>
        <span style={{ margin: '0 10px', opacity: 0.3 }}>|</span>
        <span>H: {Math.round(high)}° L: {Math.round(low)}°</span>
      </div>
    </div>
  );
}
