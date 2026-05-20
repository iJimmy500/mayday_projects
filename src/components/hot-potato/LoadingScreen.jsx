import React from 'react';

export default function LoadingScreen({ loadingStatus }) {
  return (
    <div className="hp-loader-container hp-fade-in">
      <div className="hp-spinner"></div>
      <p className="hp-loader-status">{loadingStatus}</p>
    </div>
  );
}
