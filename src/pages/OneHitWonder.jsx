import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Shuffle, AlertTriangle, ExternalLink, Info } from 'lucide-react';
import './OneHitWonder.css';
import ohwData from '../data/onehitwonders.json';
import OneHitWonderDesktop from './OneHitWonderDesktop';
import OneHitWonderMobile from './OneHitWonderMobile';

const PLAYLISTS = [
  { name: 'All Songs', icon: '🎵' },
  { name: '80s Hits', icon: '🎸' },
  { name: '90s Hits', icon: '🎧' },
  { name: 'Pop Classics', icon: '🎤' },
  { name: 'Rock Wonders', icon: '⚡' },
  { name: 'Disco Fever', icon: '🕺' }
];

export default function OneHitWonder() {
  const [songs, setSongs] = useState(ohwData);
  const [showDisclaimer, setShowDisclaimer] = useState(!localStorage.getItem('ohw_disclaimer_accepted'));
  const [syncStatus, setSyncStatus] = useState(null);
  const [playingId, setPlayingId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const iframeRef = useRef(null);
  const [isShuffle, setIsShuffle] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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
    setSongs(ohwData);
    if (!selectedId && ohwData.length > 0) {
      setSelectedId(ohwData[0].id);
    }
  }, [ohwData, selectedId]);

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
    if (currentPlaylist === '2010s') return song.year >= 2010 && song.year < 2020;
    if (currentPlaylist === '2000s') return song.year >= 2000 && song.year < 2010;
    if (currentPlaylist === '90s') return song.year >= 1990 && song.year < 2000;
    if (currentPlaylist === '80s') return song.year >= 1980 && song.year < 1990;
    if (currentPlaylist === '70s') return song.year < 1980;
    return true;
  });

  const playingSong = songs.find(s => s.id === playingId);

  const handleToggleMute = () => {
    if (selectedId && selectedId !== playingId) {
      setPlayingId(selectedId);
      setIsMuted(false);
    } else {
      const newMuted = !isMuted;
      setIsMuted(newMuted);
      if (iframeRef.current) {
        const command = newMuted ? 'mute' : 'unMute';
        iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: command, args: '' }), '*');
      }
    }
  };

  const handleNext = () => {
    if (isShuffle && filteredSongs.length > 1) {
      let nextIndex;
      do {
        nextIndex = Math.floor(Math.random() * filteredSongs.length);
      } while (filteredSongs[nextIndex].id === playingId);
      setPlayingId(filteredSongs[nextIndex].id);
      setSelectedId(filteredSongs[nextIndex].id);
    } else {
      const currentIndex = filteredSongs.findIndex(s => s.id === playingId);
      const nextIndex = (currentIndex + 1) % filteredSongs.length;
      setPlayingId(filteredSongs[nextIndex].id);
      setSelectedId(filteredSongs[nextIndex].id);
    }
    setIsMuted(false);
  };

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

  return (
    <div className="ohw-container">
      <OneHitWonderMobile 
        filteredSongs={filteredSongs}
        playingId={playingId}
        setPlayingId={setPlayingId}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        handleToggleMute={handleToggleMute}
        handleNext={handleNext}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isLoading={isLoading}
        playingSong={playingSong}
        ohwData={ohwData}
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
        {playingId && (
          <iframe
            ref={iframeRef}
            className="wallpaper-iframe"
            src={`https://www.youtube.com/embed/${playingId}?autoplay=1&controls=0&mute=0&rel=0&origin=${window.location.origin}&enablejsapi=1&playsinline=1&iv_load_policy=3&modestbranding=1`}
            title="Background Visuals"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          ></iframe>
        )}
      </div>

      {showDisclaimer && (
        <>
          <div className="mac-alert-overlay desktop-only">
            <div className="mac-alert">
              <div className="mac-alert-icon">
                <Info size={48} color="#007aff" />
              </div>
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
