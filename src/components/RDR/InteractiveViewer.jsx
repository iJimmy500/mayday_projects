import React from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function InteractiveViewer({ 
  selectedImage, 
  currentIndex, 
  totalCount, 
  shuffledManifest, 
  viewerImageLoaded,
  onClose,
  onPrev,
  onNext,
  onOpenImage,
  onDownload,
  onShare,
  setViewerImageLoaded,
  getPublicId,
  getOptimizedImage
}) {
  if (!selectedImage) return null;

  const [isVertical, setIsVertical] = React.useState(false);

  React.useEffect(() => {
    setIsVertical(false);
  }, [selectedImage]);

  const handleLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    if (naturalHeight > naturalWidth && !isVertical) {
      setIsVertical(true);
    } else {
      setViewerImageLoaded(true);
    }
  };

  return (
    <div className="rdr-fullscreen-overlay" onClick={onClose}>
      <div className="rdr-viewer-top-hud" onClick={(e) => e.stopPropagation()}>
        <div className="rdr-viewer-header">
          <div className="rdr-viewer-title-group">
            <h2 className="rdr-viewer-main-title">{selectedImage.title}</h2>
            <div className="rdr-viewer-actions-row">
              <a href={selectedImage.direct_url || selectedImage.origin_page} target="_blank" rel="noopener noreferrer" className="rdr-hud-btn">
                <span>MORE INFO</span>
              </a>
              <button className="rdr-hud-btn" onClick={onDownload}>
                <span>DOWNLOAD</span>
              </button>
              <button className="rdr-hud-btn" onClick={onShare}>
                <span>SHARE</span>
              </button>
            </div>
          </div>
          <div className="rdr-viewer-actions-desktop">
            <a href={selectedImage.direct_url || selectedImage.origin_page} target="_blank" rel="noopener noreferrer" className="rdr-hud-btn">
              <span>MORE INFO</span>
            </a>
            <button className="rdr-hud-btn" onClick={onDownload}>
              <span>DOWNLOAD</span>
            </button>
            <button className="rdr-hud-btn" onClick={onShare}>
              <span>SHARE</span>
            </button>
            <button className="rdr-viewer-close-btn" onClick={onClose}>
              <X size={24} />
            </button>
          </div>
          <button className="rdr-viewer-close-btn-mobile" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
      </div>

      <button className="rdr-viewer-nav left" onClick={onPrev}>
        <ChevronLeft size={32} />
      </button>

      <div className="rdr-fullscreen-content">
        {!viewerImageLoaded && <div className="rdr-viewer-skeleton rdr-skeleton" />}
        <img 
          src={`https://res.cloudinary.com/dxtcexgjm/image/upload/f_auto,q_auto,e_sharpen:50${isVertical ? ',a_-90' : ''}/${getPublicId(selectedImage.filename)}`} 
          alt={selectedImage.title} 
          className={`rdr-fullscreen-image rdr-image-loading ${viewerImageLoaded ? 'rdr-image-loaded' : ''}`} 
          onLoad={handleLoad}
        />
      </div>

      <button className="rdr-viewer-nav right" onClick={onNext}>
        <ChevronRight size={32} />
      </button>

      <div className="rdr-viewer-bottom-hud" onClick={(e) => e.stopPropagation()}>
        <div className="rdr-thumbnail-strip">
          {shuffledManifest.map((loc, idx) => {
            const isVisible = Math.abs(idx - currentIndex) < 5;
            if (!isVisible) return null;
            
            return (
              <div
                key={loc.filename}
                className={`rdr-thumb-item ${idx === currentIndex ? 'active' : ''}`}
                onClick={() => onOpenImage(loc, idx)}
              >
                <img src={getOptimizedImage(loc.filename, 200)} alt={loc.title} loading="lazy" />
                <div className="rdr-thumb-border" />
              </div>
            );
          })}
        </div>
        <div className="rdr-viewer-counter">
          {currentIndex + 1} OF {totalCount}
        </div>
      </div>
    </div>
  );
}
