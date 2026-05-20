import React from 'react';

export default function PassingScreen({ nextPlayerName, onReady }) {
  return (
    <div className="hp-fade-in">
      <h2 className="hp-pass-msg">CORRECT!</h2>
      <p className="hp-subtitle" style={{ fontSize: '1.3rem', color: '#fff' }}>
        Hand the device to: <br/>
        <strong style={{ color: '#007aff', fontSize: '2.2rem', display: 'block', marginTop: '0.5rem' }}>
          {nextPlayerName}
        </strong>
      </p>
      <button className="hp-btn-massive hp-btn-success" onClick={onReady} style={{ marginTop: '1rem' }}>
        I Have the Potato!
      </button>
    </div>
  );
}
