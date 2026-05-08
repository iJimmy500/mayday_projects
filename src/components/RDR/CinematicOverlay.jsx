import React from 'react';

export default function CinematicOverlay({ 
  cinematicImage, 
  nextImage, 
  hasSeenCinematicPrompt, 
  onExit, 
  onViewInCompendium,
  getPublicId
}) {
  const [isVertical, setIsVertical] = React.useState(false);
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    setIsVertical(false);
    setIsLoaded(false);
  }, [cinematicImage]);

  const handleLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    if (naturalHeight > naturalWidth && !isVertical) {
      setIsVertical(true);
    } else {
      setIsLoaded(true);
    }
  };

  if (!cinematicImage) return null;

  return (
    <div className="rdr-fullscreen-overlay cinematic" onClick={onExit}>
      <div className="rdr-fullscreen-content">
        <img 
          src={`https://res.cloudinary.com/dxtcexgjm/image/upload/f_auto,q_auto,e_sharpen:50${isVertical ? ',a_-90' : ''}/${getPublicId(cinematicImage.filename)}`} 
          alt={cinematicImage.title} 
          className={`rdr-fullscreen-image cinematic-fade ${isLoaded ? 'rdr-image-loaded' : 'rdr-image-loading'}`}
          key={cinematicImage.filename + (isVertical ? '-rotated' : '')}
          onLoad={handleLoad}
        />
      </div>
      <div className="rdr-viewer-bottom-hud cinematic" onClick={(e) => e.stopPropagation()}>
        <div className="rdr-cinematic-hud-wrapper" key={cinematicImage.filename}>
          {!hasSeenCinematicPrompt ? (
            <div className="rdr-cinematic-prompt">PRESS ANY KEY TO EXIT</div>
          ) : (
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
