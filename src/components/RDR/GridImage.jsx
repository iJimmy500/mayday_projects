import React, { useState, memo } from 'react';

const GridImage = memo(({ block, onClick }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVertical, setIsVertical] = useState(false);
  
  const handleLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    // If it's the initial load and it's vertical, we swap the source and wait for the new one to load.
    if (naturalHeight > naturalWidth && !isVertical) {
      setIsVertical(true);
    } else {
      setIsLoaded(true);
    }
  };

  const getOptimizedImage = (filename, width = 1000, rotated = false) => {
    const lastDot = filename.lastIndexOf('.');
    const publicId = lastDot !== -1 ? filename.substring(0, lastDot) : filename;
    const transform = `f_auto,q_auto,w_${width}${rotated ? ',a_-90' : ''}`;
    return `https://res.cloudinary.com/dxtcexgjm/image/upload/${transform}/${publicId}`;
  };

  return (
    <div className={`rdr-block ${isLoaded ? 'loaded' : 'rdr-skeleton'}`} onClick={onClick}>
      <img
        src={getOptimizedImage(block.filename, 1000, isVertical)}
        alt={block.title}
        className={`rdr-block-img rdr-image-loading ${isLoaded ? 'rdr-image-loaded' : ''} ${isVertical ? 'rdr-force-horizontal' : ''}`}
        onLoad={handleLoad}
        loading="lazy"
        decoding="async"
      />
      <div className="rdr-block-title">{block.title}</div>
      <div className="rdr-source-link" onClick={(e) => e.stopPropagation()}>
        {block.photographer ? `${block.photographer.toUpperCase()} | ` : ''}{block.source_name}
      </div>
    </div>
  );
});

GridImage.displayName = 'GridImage';

export default GridImage;
