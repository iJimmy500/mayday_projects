import { useState, useEffect, useCallback } from 'react';
import { Volume2, VolumeX, Aperture, Flower, Database, FileJson, Download, X, MessageSquare, Flag } from 'lucide-react';
import SEO from '../components/SEO';
import manifest from '../data/manifest.json';

import GridImage from '../components/RDR/GridImage';
import WelcomeModal from '../components/RDR/WelcomeModal';
import CinematicOverlay from '../components/RDR/CinematicOverlay';
import InteractiveViewer from '../components/RDR/InteractiveViewer';

import './RedDeadLandscapes.css';

const getPublicId = (filename) => filename.substring(0, filename.lastIndexOf('.')) || filename;

const getOptimizedImage = (filename, width = 600) => {
  const publicId = getPublicId(filename);
  return `https://res.cloudinary.com/dxtcexgjm/image/upload/f_auto,q_auto,w_${width}/${publicId}`;
};

const getDownloadUrl = (filename) => {
  const publicId = getPublicId(filename);
  return `https://res.cloudinary.com/dxtcexgjm/image/upload/fl_attachment/${publicId}`;
};

const playHonorSound = (isMuted) => {
  if (isMuted) return;
  const audio = new Audio('/honor.mp3');
  audio.volume = 0.5;
  audio.play().catch(e => console.log('Audio blocked:', e.message));
};

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default function RedDeadLandscapes() {
  const [shuffledManifest] = useState(() => shuffleArray(manifest));
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [isNotifyExiting, setIsNotifyExiting] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);
  const [isDataExiting, setIsDataExiting] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);
  const [viewerImageLoaded, setViewerImageLoaded] = useState(false);
  const [isCinematicMode, setIsCinematicMode] = useState(false);
  const [cinematicImage, setCinematicImage] = useState(null);
  const [nextImage, setNextImage] = useState(null);
  const [showWelcome, setShowWelcome] = useState(() => {
    return !localStorage.getItem('rdr_symposium_visited');
  });
  const [isMuted, setIsMuted] = useState(false);
  const [player, setPlayer] = useState(null);
  const [hasSeenCinematicPrompt, setHasSeenCinematicPrompt] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const imgId = params.get('img');
    if (imgId) {
      const index = shuffledManifest.findIndex(loc => loc.filename === imgId);
      if (index !== -1) {
        setSelectedImage(shuffledManifest[index]);
        setCurrentIndex(index);
        if (index >= visibleCount) setVisibleCount(index + 12);
      }
    }
  }, [visibleCount, shuffledManifest]);

  useEffect(() => {
    const url = new URL(window.location);
    if (selectedImage) {
      url.searchParams.set('img', selectedImage.filename);
      setViewerImageLoaded(false);
    } else {
      url.searchParams.delete('img');
    }
    window.history.replaceState({}, '', url);
  }, [selectedImage]);

  useEffect(() => {
    if (showNotification && !isNotifyExiting) {
      const exitTimer = setTimeout(() => {
        setIsNotifyExiting(true);
        setTimeout(() => {
          setShowNotification(false);
          setIsNotifyExiting(false);
        }, 500);
      }, 2500);
      return () => clearTimeout(exitTimer);
    }
  }, [showNotification, isNotifyExiting]);

  const closeNotification = useCallback(() => {
    setIsNotifyExiting(true);
    setTimeout(() => {
      setShowNotification(false);
      setIsNotifyExiting(false);
    }, 500);
  }, []);

  const closeDataModal = useCallback(() => {
    setIsDataExiting(true);
    setTimeout(() => {
      setShowDataModal(false);
      setIsDataExiting(false);
    }, 500);
  }, []);

  const handleBack = useCallback(() => {
    if (showNotification) {
      closeNotification();
      return;
    }
    if (selectedImage) {
      setSelectedImage(null);
    } else if (isCinematicMode) {
      setIsCinematicMode(false);
    } else {
      window.location.href = 'https://mayinflight.com';
    }
  }, [selectedImage, showNotification, isCinematicMode, closeNotification]);

  const handleShare = useCallback((e) => {
    if (e) e.stopPropagation();
    if (selectedImage) {
      const shareUrl = window.location.href;
      navigator.clipboard.writeText(shareUrl).then(() => {
        playHonorSound(isMuted);
        setShowNotification(true);
        setIsNotifyExiting(false);
      });
    }
  }, [selectedImage, isMuted]);

  const handleDownload = useCallback((e) => {
    if (e) e.stopPropagation();
    if (selectedImage) {
      window.open(getDownloadUrl(selectedImage.filename), '_blank');
    }
  }, [selectedImage]);

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = () => {
      new window.YT.Player('youtube-player', {
        height: '0',
        width: '0',
        playerVars: {
          listType: 'playlist',
          list: 'PLPfHaI9XqTnEXCUC7Ac9mEPdg0PfUW6V8',
          autoplay: 0,
          loop: 1,
          enablejsapi: 1,
          origin: window.location.origin
        },
        events: {
          onReady: (event) => {
            event.target.setShuffle({ 'shufflePlaylist': true });
            const randomIndex = Math.floor(Math.random() * 20);
            event.target.playVideoAt(randomIndex);

            event.target.setVolume(25);
            if (isMuted) event.target.mute();
            setPlayer(event.target);
          }
        }
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }
  }, [isMuted]);

  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (player && player.playVideo && !isMobile) {
      if (isCinematicMode && !isMuted && !showWelcome) {
        player.playVideo();
      } else {
        player.pauseVideo();
      }
    }
  }, [isCinematicMode, isMuted, showWelcome, player]);

  const handleNext = useCallback((e) => {
    if (e) e.stopPropagation();
    const nextIdx = (currentIndex + 1) % shuffledManifest.length;
    setCurrentIndex(nextIdx);
    setSelectedImage(shuffledManifest[nextIdx]);
  }, [currentIndex, shuffledManifest]);

  const handlePrev = useCallback((e) => {
    if (e) e.stopPropagation();
    const prevIdx = (currentIndex - 1 + shuffledManifest.length) % shuffledManifest.length;
    setCurrentIndex(prevIdx);
    setSelectedImage(shuffledManifest[prevIdx]);
  }, [currentIndex, shuffledManifest]);

  const openImage = (block, idx) => {
    setSelectedImage(block);
    setCurrentIndex(idx);
  };

  const loadMore = () => {
    setVisibleCount(prev => Math.min(prev + 12, manifest.length));
  };

  useEffect(() => {
    let interval;
    if (isCinematicMode && shuffledManifest.length > 0) {
      setHasSeenCinematicPrompt(false);
      const promptTimeout = setTimeout(() => setHasSeenCinematicPrompt(true), 5000);

      const pickNext = () => shuffledManifest[Math.floor(Math.random() * shuffledManifest.length)];

      const cycleImage = () => {
        const next = pickNext();
        setNextImage(next);
        setTimeout(() => {
          setCinematicImage(next);
          setNextImage(pickNext());
        }, 2000);
      };

      interval = setInterval(cycleImage, 15000);
      return () => {
        clearInterval(interval);
        clearTimeout(promptTimeout);
      };
    }
  }, [isCinematicMode, shuffledManifest]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isCinematicMode) {
        setIsCinematicMode(false);
        setSelectedImage(null);
        return;
      }
      if (selectedImage) {
        if (e.key === 'ArrowRight') handleNext();
        if (e.key === 'ArrowLeft') handlePrev();
      }
      if (e.key === 'Escape' || e.key === 'Backspace') handleBack();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, isCinematicMode, handleNext, handlePrev, handleBack]);

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(shuffledManifest, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rdr2_landscape_compendium.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rdr-container">
      <SEO
        title="RDRscapes"
        description="A curated archive of the breathtaking vistas of the American Frontier."
        image={selectedImage ? getOptimizedImage(selectedImage.filename, 1200) : getOptimizedImage('pinterest_86.jpg', 1200)}
      />

      <header className="rdr-header">
        <h1 className="rdr-main-title">
          <span style={{ color: '#b30000' }}>RDR</span>scapes
        </h1>
        <button className="rdr-prompt-btn rdr-desktop-db" onClick={() => setShowDataModal(true)} title="Data Archive" style={{ cursor: 'pointer', border: 'none', background: 'none' }}>
          <Database size={18} strokeWidth={2} />
        </button>
        <div className="rdr-divider" />
      </header>

      <div className="rdr-scroll-area">
        <main className="rdr-masonry">
          {shuffledManifest.slice(0, visibleCount).map((block, idx) => (
            <GridImage
              key={block.filename}
              block={block}
              onClick={() => openImage(block, idx)}
            />
          ))}
        </main>

        {visibleCount < shuffledManifest.length && (
          <div className="rdr-load-more-container">
            <button className="rdr-hud-btn" onClick={loadMore}>
              <span>LOAD MORE</span>
            </button>
          </div>
        )}
      </div>

      {selectedImage && (
        <InteractiveViewer
          key="rdr-viewer"
          selectedImage={selectedImage}
          currentIndex={currentIndex}
          totalCount={shuffledManifest.length}
          shuffledManifest={shuffledManifest}
          viewerImageLoaded={viewerImageLoaded}
          onClose={() => setSelectedImage(null)}
          onPrev={handlePrev}
          onNext={handleNext}
          onOpenImage={openImage}
          onDownload={handleDownload}
          onShare={handleShare}
          setViewerImageLoaded={setViewerImageLoaded}
          getPublicId={getPublicId}
          getOptimizedImage={getOptimizedImage}
        />
      )}

      {isCinematicMode && (
        <CinematicOverlay
          key="rdr-cinematic"
          cinematicImage={cinematicImage}
          nextImage={nextImage}
          hasSeenCinematicPrompt={hasSeenCinematicPrompt}
          onExit={() => setIsCinematicMode(false)}
          onViewInCompendium={(img) => {
            setIsCinematicMode(false);
            setSelectedImage(img);
            const idx = shuffledManifest.findIndex(m => m.filename === img.filename);
            if (idx !== -1) setCurrentIndex(idx);
          }}
          getPublicId={getPublicId}
        />
      )}

      <footer className="rdr-footer">
        <div className="rdr-footer-actions">
          <div className="rdr-prompt-btn" onClick={() => {
            setCinematicImage(shuffledManifest[Math.floor(Math.random() * shuffledManifest.length)]);
            setIsCinematicMode(true);
          }} style={{ cursor: 'pointer' }}>
            <span>CINEMATIC</span>
            <Aperture size={18} strokeWidth={2} />
          </div>

          <a href="https://mayinflight.com" className="rdr-prompt-btn" style={{ cursor: 'pointer', textDecoration: 'none' }}>
            <span>MAYDAY</span>
            <Flower size={20} strokeWidth={2} />
          </a>
        </div>
      </footer>

      {showWelcome && (
        <WelcomeModal
          key="rdr-welcome"
          isExiting={isExiting}
          onEnter={() => {
            localStorage.setItem('rdr_symposium_visited', 'true');
            playHonorSound(isMuted);
            setIsExiting(true);
            setTimeout(() => {
              setShowWelcome(false);
              setIsExiting(false);
            }, 500);
          }}
        />
      )}

      {showNotification && (
        <div key="rdr-notification" className={`rdr-alert-overlay ${isNotifyExiting ? 'exiting' : ''}`} onClick={closeNotification}>
          <div className="rdr-alert-box" onClick={(e) => e.stopPropagation()}>
            <h2 className="rdr-alert-title">ALERT</h2>
            <div className="rdr-alert-divider" />
            <p className="rdr-alert-message">Direct link copied to clipboard.</p>
            <div className="rdr-alert-footer">
              <div className="rdr-alert-action" onClick={closeNotification}>
                <span>CONTINUE</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div key="rdr-yt-wrapper" style={{ position: 'absolute', width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}>
        <div id="youtube-player" />
      </div>

      <div className="rdr-master-mute" onClick={() => setIsMuted(!isMuted)}>
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        <span>{isMuted ? 'MUTED' : 'VOLUME'}</span>
      </div>

      {showDataModal && (
        <div className={`rdr-alert-overlay cinematic ${isDataExiting ? 'exiting' : ''}`} onClick={closeDataModal}>
          <div className={`rdr-menu-box ${isDataExiting ? 'exiting' : ''}`} onClick={(e) => e.stopPropagation()}>
            <h2 className="rdr-menu-title">DATABASE</h2>
            <p className="rdr-menu-explainer">
              A research archive by James006 documenting the environmental artistry of Red Dead Redemption 2.
            </p>

            <div className="rdr-menu-list">
              <div className="rdr-menu-item" onClick={downloadJSON}>
                <span>DOWNLOAD MANIFEST</span>
              </div>
              <a href="https://github.com/iJimmy500/mayday_projects/tree/main/src/scripts" target="_blank" rel="noopener noreferrer" className="rdr-menu-item">
                <span>SOURCE SCRIPTS</span>
              </a>
              <a href="https://instagram.com/phushsiafirst" target="_blank" rel="noopener noreferrer" className="rdr-menu-item">
                <span>SUGGEST ENTRY</span>
              </a>
              <a href="https://instagram.com/phushsiafirst" target="_blank" rel="noopener noreferrer" className="rdr-menu-item">
                <span>REPORT ISSUE</span>
              </a>
              <div className="rdr-menu-item" onClick={closeDataModal}>
                <span>CLOSE ARCHIVE</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
