import React from 'react';

export default function ReadyScreen({ firstPlayerName, passMode, onPlay }) {
  return (
    <div className="hp-fade-in">
      <h1 className="hp-title" style={{ fontSize: '2.8rem' }}>Ready?</h1>
      <p className="hp-subtitle">First player: <strong style={{ color: '#007aff' }}>{firstPlayerName}</strong></p>
      <p className="hp-pass-description" style={{ marginBottom: '1.25rem', opacity: 0.6 }}>
        {passMode === 'order' 
          ? "The potato will be passed sequentially in the order shown." 
          : "The potato will be passed randomly to any other player."}
      </p>
      <button className="hp-btn-massive hp-btn-danger" onClick={onPlay}>Take Potato & Play</button>
    </div>
  );
}
