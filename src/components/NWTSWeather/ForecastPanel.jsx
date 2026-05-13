import React from 'react';

export default function ForecastPanel({ hourlyData, nowIndex, getWeatherIcon }) {
  return (
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
}
