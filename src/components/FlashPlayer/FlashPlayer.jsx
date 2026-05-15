import React, { useEffect, useRef, useState } from 'react';
import './FlashPlayer.css';

export default function FlashPlayer({ game, onClose }) {
  const containerRef = useRef(null);
  const [error, setError] = useState(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!game || !hasStarted) return;

    if (game.type === 'swf') {
      // Dynamically load Ruffle
      window.RufflePlayer = window.RufflePlayer || {};
      const script = document.createElement('script');
      script.src = "https://unpkg.com/@ruffle-rs/ruffle";
      
      script.onload = () => {
        try {
          const ruffle = window.RufflePlayer.newest();
          const player = ruffle.createPlayer();
          
          if (containerRef.current) {
            containerRef.current.innerHTML = ''; // Clear any existing
            containerRef.current.appendChild(player);
            
            // Note: Since the games aren't hosted yet, this might throw a 404
            // But the architecture is fully ready for when they are!
            player.load(game.url).then(() => {
              setIsLoading(false);
            }).catch(err => {
              console.warn("Ruffle failed to load game.", err);
              setError("Game file could not be loaded from the archive.");
              setIsLoading(false);
            });
          }
        } catch (err) {
          console.error("Error initializing Ruffle:", err);
          setError("Failed to initialize emulator.");
        }
      };

      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }
      };
    }
  }, [game, hasStarted]);

  if (!game) return null;

  return (
    <div className={`flash-player-overlay ${hasStarted ? 'game-active' : ''}`}>
      <div className="wii-channel-detail">
        <div className="wii-tv-screen">
          <div className="wii-tv-content">
            {!hasStarted ? (
              <>
                {game.image ? (
                  <img src={game.image} alt={game.title} className="wii-tv-preview" />
                ) : (
                  <div className="wii-tv-logo">Wii</div>
                )}
              </>
            ) : (
              <div className="flash-player-content">
                {isLoading && !error && (
                  <div className="flash-loader">
                    <div className="wii-loading-ring" />
                    <p>Loading Channel...</p>
                  </div>
                )}

                {error && (
                  <div className="flash-placeholder-msg" style={{ zIndex: 10, color: '#f39c12', padding: '20px' }}>
                    <p>{error}</p>
                    <p style={{ fontSize: '12px', opacity: 0.6, marginTop: '10px' }}>URL: {game.url}</p>
                  </div>
                )}
                
                {game.type === 'swf' ? (
                  <div id="ruffle-container" ref={containerRef}>
                    {/* Ruffle player mounts here */}
                  </div>
                ) : game.type === 'iframe' ? (
                  <iframe 
                    src={game.url} 
                    className={`flash-iframe ${isLoading ? 'hidden' : ''}`} 
                    title={game.title}
                    allow="autoplay; fullscreen"
                    onLoad={() => setIsLoading(false)}
                  />
                ) : (
                  <div className="flash-placeholder-msg">
                    <h2>{game.title}</h2>
                    <p>Game format not specified.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="wii-channel-actions">
          {!hasStarted ? (
            <button className="wii-action-btn wii-btn-start" onClick={() => setHasStarted(true)}>
              Start
            </button>
          ) : (
            <button className="wii-action-btn wii-btn-start" onClick={() => setHasStarted(false)}>
              Reset
            </button>
          )}
          <button className="wii-action-btn wii-btn-back" onClick={onClose}>
            Wii Menu
          </button>
        </div>
      </div>
    </div>
  );
}
