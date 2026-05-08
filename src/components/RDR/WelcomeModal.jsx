import React from 'react';

export default function WelcomeModal({ isExiting, onEnter }) {
  return (
    <div className={`rdr-alert-overlay ${isExiting ? 'exiting' : ''}`}>
      <div className="rdr-alert-box materialize">
        <a href="https://mayinflight.com" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h2 className="rdr-alert-title rdr-wipe-in rdr-wipe-stagger-1">MAYDAY</h2>
        </a>
        <div className="rdr-alert-divider rdr-wipe-in rdr-wipe-stagger-2" />
        <p className="rdr-alert-message rdr-wipe-in rdr-wipe-stagger-3">
          WELCOME TO THE RDRSCAPES SYMPOSIUM.<br />
          <span style={{ fontSize: '16px', opacity: 0.7, marginTop: '10px', display: 'block' }}>
            A CURATED ARCHIVE OF THE MOST BREATHTAKING VISTAS AND FORGOTTEN CORNERS OF THE AMERICAN FRONTIER.
          </span>
        </p>
        <div className="rdr-alert-footer rdr-wipe-in rdr-wipe-stagger-3" style={{ justifyContent: 'center' }}>
          <div className="rdr-alert-action" onClick={onEnter}>
            <span>ENTER</span>
          </div>
        </div>
      </div>
    </div>
  );
}
