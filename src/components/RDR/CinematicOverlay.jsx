import React, { useState, useEffect } from 'react';
export default function CinematicOverlay({ 
  cinematicImage, 
  nextImage, 
  hasSeenCinematicPrompt, 
  settings,
  onExit, 
  onViewInCompendium,
  getPublicId
}) {
  const [isVertical, setIsVertical] = React.useState(false);
  const [loadedFilename, setLoadedFilename] = React.useState(null);

  React.useEffect(() => {
    setIsVertical(false);
  }, [cinematicImage.filename]);

  const handleLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    // If it's vertical and we haven't rotated it yet, flip it
    if (naturalHeight > naturalWidth && !isVertical) {
      setIsVertical(true);
    } else {
      setLoadedFilename(cinematicImage.filename);
    }
  };

  const isLoaded = cinematicImage && loadedFilename === cinematicImage.filename;

  if (!cinematicImage) return null;

  const transitionClass = `transition-${settings.transition || 'fade'}`;
  const animationClass = `animation-${settings.animation || 'ken-burns'}`;

  // Build transformation string
  const quality = settings.highQuality ? 'q_auto:best' : 'q_auto';
  const transform = `f_auto,${quality},e_sharpen:50${isVertical ? ',a_-90' : ''}`;
  const imageUrl = `https://res.cloudinary.com/dxtcexgjm/image/upload/${transform}/${getPublicId(cinematicImage.filename)}`;

  return (
    <div className="rdr-fullscreen-overlay cinematic" onClick={onExit}>
      <div className="rdr-fullscreen-content">
        <div className="rdr-cinematic-stage">
          <img 
            src={imageUrl} 
            alt={cinematicImage.title} 
            className={`rdr-fullscreen-image cinematic-asset ${isLoaded ? 'rdr-image-loaded' : 'rdr-image-loading'} ${transitionClass} ${animationClass} ${isVertical ? 'rdr-force-horizontal' : ''}`}
            key={cinematicImage.filename + (isVertical ? '-rotated' : '')}
            onLoad={handleLoad}
          />
        </div>
      </div>
      <div className={`rdr-viewer-bottom-hud cinematic ${!settings.showMetadata ? 'hidden' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="rdr-cinematic-hud-wrapper" key={cinematicImage.filename}>
          {!hasSeenCinematicPrompt ? (
            <div className="rdr-cinematic-prompt">PRESS ANY KEY TO EXIT</div>
          ) : settings.showMetadata && (
            <div className="rdr-cinematic-metadata permanent">
              <div className="rdr-cinematic-title">{cinematicImage.title}</div>
              <div className="rdr-cinematic-actions">
                <button className="rdr-hud-btn" onClick={(e) => {
                  e.stopPropagation();
                  onViewInCompendium(cinematicImage);
                }}>
                  <span>VIEW IN COMPENDIUM</span>
                </button>
              </div>
            </div>
          )}
        </div>
        {nextImage && (
          <img 
            src={`https://res.cloudinary.com/dxtcexgjm/image/upload/f_auto,q_auto,e_sharpen:50/${getPublicId(nextImage.filename)}`} 
            style={{ display: 'none' }} 
            alt="preloading"
          />
        )}
      </div>
    </div>
  );
}
