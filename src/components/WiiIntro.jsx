import { useState, useEffect } from 'react';
import { Hand, Flower, MousePointerClick } from 'lucide-react';
import './WiiIntro.css';

export default function WiiIntro({ onComplete }) {
  const [isExiting, setIsExiting] = useState(false);

  const handleContinue = () => {
    setIsExiting(true);
    setTimeout(() => {
      onComplete();
    }, 800); // Match animation duration
  };


  return (
    <div
      className={`wii-intro-overlay ${isExiting ? 'wii-intro-exit' : ''}`}
    >
      <div className="wii-warning-container">
        <h1 className="wii-warning-header">
          <Hand className="wii-waving-icon" size={32} />
          Welcome Home
        </h1>

        <div className="wii-warning-text" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '10px' }}>
            A curated collection of Flash-era classics.
          </p>
          <p style={{ opacity: 0.7 }}>
            Relive the golden age of web gaming.
          </p>
        </div>

        <div className="wii-enter-action" onClick={handleContinue}>
          <span>ENTER</span>
        </div>

      </div>

      <div className="wii-bottom-bar-intro">
        <a 
          href="https://mayinflight.com" 
          className="wii-footer-brand"
          onClick={(e) => e.stopPropagation()}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Flower size={20} strokeWidth={1.5} className="wii-flower-icon" />
          <span className="wii-brand-text">mayday</span>
        </a>
      </div>
    </div>
  );
}
