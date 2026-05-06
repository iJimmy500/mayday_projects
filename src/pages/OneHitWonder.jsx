import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Shuffle, AlertTriangle, ExternalLink, Info, Flower } from 'lucide-react';
import './OneHitWonder.css';
import ohwData from '../data/onehitwonders.json';
import OneHitWonderDesktop from './OneHitWonderDesktop';
import OneHitWonderMobile from './OneHitWonderMobile';

export default function OneHitWonder() {
  const [songs, setSongs] = useState([]);
  const [showDisclaimer, setShowDisclaimer] = useState(!localStorage.getItem('ohw_disclaimer_accepted'));
  const [syncStatus, setSyncStatus] = useState(null);
  const playerRef = useRef(null);
  const [playingId, setPlayingId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const iframeRef = useRef(null);
  const [isShuffle, setIsShuffle] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: 'random', direction: 'asc' });
  const [isLoading, setIsLoading] = useState(false);
  const [playbackError, setPlaybackError] = useState(null);
  const [currentPlaylist, setCurrentPlaylist] = useState('All');

  useEffect(() => {
    const checkSync = async () => {
      try {
        const res = await fetch('/src/data/sync_status.json');
        if (res.ok) {
          const data = await res.json();
          setSyncStatus(data.done ? null : data);
        }
      } catch (e) { }
    };
    const interval = setInterval(checkSync, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const shuffled = [...ohwData].sort(() => Math.random() - 0.5);
    setSongs(shuffled);
  }, [ohwData]);

  const filteredSongs = songs.filter(song => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!song.title.toLowerCase().includes(q) && !song.artist.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (currentPlaylist === 'All') return true;
    if (currentPlaylist === 'Recently Added') {
      const last20 = songs.slice(-20).map(s => s.id);
      return last20.includes(song.id);
    }
    if (currentPlaylist === 'Apple Music') return song.playlists?.includes('Apple Music');
    if (currentPlaylist === 'Waterloo') return song.playlists?.includes('Waterloo');
    if (currentPlaylist === '2020s') return song.year >= 2020;
    if (currentPlaylist === '2010s') return song.year >= 2010 && song.year < 2020;
    if (currentPlaylist === '2000s') return song.year >= 2000 && song.year < 2010;
    if (currentPlaylist === '90s') return song.year >= 1990 && song.year < 2000;
    if (currentPlaylist === '80s') return song.year >= 1980 && song.year < 1990;
    if (currentPlaylist === '70s') return song.year >= 1970 && song.year < 1980;
    if (currentPlaylist === '60s') return song.year < 1970;
    return true;
  }).sort((a, b) => {
    if (sortConfig.key === 'random') return 0;
    
    let aVal = a[sortConfig.key];
    let bVal = b[sortConfig.key];
    
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }
    
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const playingSong = songs.find(s => s.id === playingId);

  const handleToggleMute = () => {
    if (selectedId && selectedId !== playingId) {
      setPlayingId(selectedId);
      setIsMuted(false);
    } else {
      const newMuted = !isMuted;
      setIsMuted(newMuted);
      if (playerRef.current && typeof playerRef.current.mute === 'function') {
        if (newMuted) playerRef.current.mute();
        else playerRef.current.unMute();
      }
    }
  };

  const handleNext = React.useCallback(() => {
    if (isShuffle) {
      let nextIndex;
      do {
        nextIndex = Math.floor(Math.random() * filteredSongs.length);
      } while (filteredSongs.length > 1 && filteredSongs[nextIndex].id === playingId);
      setPlayingId(filteredSongs[nextIndex].id);
      setSelectedId(filteredSongs[nextIndex].id);
    } else {
      const currentIndex = filteredSongs.findIndex(s => s.id === playingId);
      const nextIndex = (currentIndex + 1) % filteredSongs.length;
      setPlayingId(filteredSongs[nextIndex].id);
      setSelectedId(filteredSongs[nextIndex].id);
    }
    setIsMuted(false);
  }, [playingId, isShuffle, filteredSongs]);

  const handlePrev = () => {
    const currentIndex = filteredSongs.findIndex(s => s.id === playingId);
    const prevIndex = currentIndex <= 0 ? filteredSongs.length - 1 : currentIndex - 1;
    setPlayingId(filteredSongs[prevIndex].id);
    setSelectedId(filteredSongs[prevIndex].id);
    setIsMuted(false);
  };

  const acceptDisclaimer = () => {
    setShowDisclaimer(false);
    localStorage.setItem('ohw_disclaimer_accepted', 'true');
    // When starting from disclaimer, pick the first song from our (already shuffled) list
    if (songs.length > 0) {
      const firstSong = songs[0];
      setPlayingId(firstSong.id);
      setSelectedId(firstSong.id);
      
      if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
        playerRef.current.loadVideoById(firstSong.id);
        playerRef.current.unMute();
      }
    }
  };

  useEffect(() => {
    if (playingSong && 'mediaSession' in navigator) {
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: playingSong.title,
        artist: playingSong.artist,
        album: 'One Hit Wonder Radio',
        artwork: [
          { src: `https://img.youtube.com/vi/${playingId}/hqdefault.jpg`, sizes: '480x360', type: 'image/jpeg' }
        ]
      });
      navigator.mediaSession.setActionHandler('play', handleToggleMute);
      navigator.mediaSession.setActionHandler('pause', handleToggleMute);
      navigator.mediaSession.setActionHandler('previoustrack', handlePrev);
      navigator.mediaSession.setActionHandler('nexttrack', handleNext);
    }
  }, [playingSong]);

  // Track player state for auto-advance
  // Store handleNext in a ref to avoid recreating the player on every change
  const handleNextRef = useRef(handleNext);
  useEffect(() => {
    handleNextRef.current = handleNext;
  }, [handleNext]);

  const [initialVideoId] = useState('8LhkyyCvUHk');

  useEffect(() => {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    const onPlayerStateChange = (event) => {
      if (event.data === 0) { // 0 = YT.PlayerState.ENDED
        if (handleNextRef.current) handleNextRef.current();
      }
    };

    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player('ohw-player', {
        events: {
          'onStateChange': onPlayerStateChange
        }
      });
    };

    // If API is already loaded
    if (window.YT && window.YT.Player) {
      playerRef.current = new window.YT.Player('ohw-player', {
        events: {
          'onStateChange': onPlayerStateChange
        }
      });
    }

    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (playingId && playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
      if (showDisclaimer) {
        // Just prepare it without playing
        playerRef.current.cueVideoById(playingId);
      } else {
        // Already accepted, go ahead and play
        playerRef.current.loadVideoById(playingId);
        playerRef.current.unMute();
      }
    }
  }, [playingId, showDisclaimer]);

  // Iframe ref and loading state
  const [iframeLoaded, setIframeLoaded] = useState(false);

  return (
    <div className="ohw-container" style={{ backgroundColor: playingId ? 'transparent' : '#333' }}>
      <OneHitWonderMobile 
        filteredSongs={filteredSongs}
        ohwData={songs}
        playingId={playingId}
        setPlayingId={setPlayingId}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        handleToggleMute={handleToggleMute}
        handleNext={handleNext}
        handlePrev={handlePrev}
        isShuffle={isShuffle}
        setIsShuffle={setIsShuffle}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        currentPlaylist={currentPlaylist}
        setCurrentPlaylist={setCurrentPlaylist}
        syncStatus={syncStatus}
        isLoading={isLoading}
        playingSong={playingSong}
        sortConfig={sortConfig}
        setSortConfig={setSortConfig}
      />
      
      <OneHitWonderDesktop
        filteredSongs={filteredSongs}
        songs={songs}
        playingId={playingId}
        setPlayingId={setPlayingId}
        selectedId={selectedId}
        setSelectedId={setSelectedId}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        handleToggleMute={handleToggleMute}
        handleNext={handleNext}
        handlePrev={handlePrev}
        isShuffle={isShuffle}
        setIsShuffle={setIsShuffle}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        currentPlaylist={currentPlaylist}
        setCurrentPlaylist={setCurrentPlaylist}
        syncStatus={syncStatus}
        isLoading={isLoading}
        playingSong={playingSong}
        sortConfig={sortConfig}
        setSortConfig={setSortConfig}
      />

      {playbackError && (
        <div className="mac-alert-overlay">
          <div className="mac-alert">
            <div className="mac-alert-icon">
              <AlertTriangle size={48} color="#fcd34d" />
            </div>
            <div className="mac-alert-content">
              <div className="mac-alert-title">Playback Error</div>
              <div className="mac-alert-message">
                {playbackError.message || `iTunes could not play the song "${playbackError.title}" because the resource is unavailable or restricted.`}
              </div>
              <div className="mac-alert-buttons">
                <button className="mac-alert-btn primary" onClick={() => setPlaybackError(null)}>OK</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="wallpaper-player-layer">
        <div className="wallpaper-overlay"></div>
        <iframe
          id="ohw-player"
          ref={iframeRef}
          className="wallpaper-iframe"
          src={`https://www.youtube.com/embed/videoseries?list=PLB0C27B8F25F889D1&enablejsapi=1&autoplay=0&controls=0&mute=1&rel=0&origin=${window.location.origin}&playsinline=1&iv_load_policy=3&modestbranding=1&widget_referrer=${window.location.origin}`}
          title="Background Visuals"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          onLoad={() => setIframeLoaded(true)}
          style={{ opacity: playingId ? 1 : 0 }}
        ></iframe>
      </div>

      {showDisclaimer && (
        <>
          <div className="mac-alert-overlay desktop-only">
            <div className="mac-alert">
               <a href="https://mayinflight.com" target="_blank" rel="noopener noreferrer" className="mac-alert-icon" style={{ display: 'block', textDecoration: 'none' }}>
                 <Flower size={48} color="#ff2d55" strokeWidth={1.5} />
               </a>
              <div className="mac-alert-content">
                <div className="mac-alert-title">note from james</div>
                <div className="mac-alert-message">
                  This list is a compilation of several public archives (Waterloo, Wikipedia, etc). NOT me btw.
                </div>
                <div className="mac-alert-buttons">
                  <a
                    href="https://www.google.com/search?q=one+hit+wonder+lists+archives"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mac-alert-btn"
                    style={{ textDecoration: 'none', marginRight: '10px' }}
                  >
                    View Sources
                  </a>
                  <button className="mac-alert-btn primary" onClick={acceptDisclaimer}>OK</button>
                </div>
              </div>
            </div>
          </div>

          <div className="ios-alert-overlay mobile-only">
             <div className="ios-alert">
               <div style={{ paddingTop: '20px', display: 'flex', justifyContent: 'center' }}>
                 <a href="https://mayinflight.com" target="_blank" rel="noopener noreferrer">
                   <Flower size={40} color="#ff2d55" strokeWidth={1.5} />
                 </a>
               </div>
               <div className="ios-alert-title">Note</div>
              <div className="ios-alert-message">
                This list is a compilation of several public archives (Waterloo, Wikipedia, etc). NOT me btw.
              </div>
              <a
                href="https://www.google.com/search?q=one+hit+wonder+lists+archives"
                target="_blank"
                rel="noopener noreferrer"
                className="ios-alert-btn"
                style={{ textDecoration: 'none', color: '#8e8e93', fontSize: '14px', borderTop: 'none', paddingBottom: '10px' }}
              >
                View Sources
              </a>
              <button className="ios-alert-btn" onClick={acceptDisclaimer}>OK</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
