import React, { useState, useEffect } from 'react';
import { SkipForward, Volume2, VolumeX } from 'lucide-react';

export default function OneHitWonderMobile({
  filteredSongs,
  playingId,
  setPlayingId,
  isMuted,
  setIsMuted,
  handleToggleMute,
  handleNext,
  searchQuery,
  setSearchQuery,
  isLoading,
  playingSong,
  ohwData
}) {
  const [mobileTab, setMobileTab] = useState('library');
  const [randomSongs, setRandomSongs] = useState([]);

  useEffect(() => {
    if (mobileTab === 'for-you' && randomSongs.length === 0) {
      const shuffled = [...ohwData].sort(() => 0.5 - Math.random());
      setRandomSongs(shuffled.slice(0, 20));
    }
  }, [mobileTab, ohwData, randomSongs.length]);

  const handleTabClick = (tab) => {
    setMobileTab(tab);
    if (tab !== 'search') setSearchQuery("");
  };

  return (
    <div className="ios8-interface">
      <div className="ios8-header">
        <div className="ios8-status-spacer"></div>
        <div className="ios8-nav">
          <div className="ios8-nav-title">
            {mobileTab === 'library' && 'Library'}
            {mobileTab === 'for-you' && 'For You'}
            {mobileTab === 'search' && 'Search'}
          </div>
          <button className="ios8-edit-btn">{mobileTab === 'library' ? 'Edit' : ''}</button>
        </div>
      </div>

      <div className="ios8-content">
        {mobileTab === 'library' && (
          <div className="ios8-list">
            <div className="ios8-section-header">Recently Added</div>
            <div className="ios8-recent-grid">
              {filteredSongs.slice(-3).map((song, idx) => (
                <div key={`${song.id}-recent-${idx}`} className="ios8-recent-item" onClick={() => { setPlayingId(song.id); setIsMuted(false); }}>
                  <img src={`https://img.youtube.com/vi/${song.id}/mqdefault.jpg`} alt={song.title} />
                  <div className="ios8-recent-title">{song.title}</div>
                  <div className="ios8-recent-artist">{song.artist}</div>
                </div>
              ))}
            </div>
            <div className="ios8-section-header">All Songs</div>
            {filteredSongs.map((song, idx) => (
              <div key={`${song.id}-all-${idx}`} className={`ios8-list-item ${playingId === song.id ? 'playing' : ''}`} onClick={() => { setPlayingId(song.id); setIsMuted(false); }}>
                <img className="ios8-item-thumb" src={`https://img.youtube.com/vi/${song.id}/default.jpg`} alt="" />
                <div className="ios8-item-info">
                  <div className="ios8-item-title">{song.title}</div>
                  <div className="ios8-item-artist">{song.artist}</div>
                </div>
                {playingId === song.id && (
                  !isMuted ? (
                    <div className="ios8-visualizer">
                      <div className="v-bar"></div>
                      <div className="v-bar"></div>
                      <div className="v-bar"></div>
                      <div className="v-bar"></div>
                    </div>
                  ) : <Volume2 size={16} color="#ff2d55" />
                )}
              </div>
            ))}
          </div>
        )}

        {mobileTab === 'for-you' && (
          <div className="ios8-list">
            <div className="ios8-section-header">Mixed for You</div>
            {randomSongs.map((song, idx) => (
              <div key={`${song.id}-for-you-${idx}`} className={`ios8-list-item ${playingId === song.id ? 'playing' : ''}`} onClick={() => { setPlayingId(song.id); setIsMuted(false); }}>
                <img className="ios8-item-thumb" src={`https://img.youtube.com/vi/${song.id}/default.jpg`} alt="" />
                <div className="ios8-item-info">
                  <div className="ios8-item-title">{song.title}</div>
                  <div className="ios8-item-artist">{song.artist}</div>
                </div>
                {playingId === song.id && (
                  !isMuted ? (
                    <div className="ios8-visualizer">
                      <div className="v-bar"></div>
                      <div className="v-bar"></div>
                      <div className="v-bar"></div>
                      <div className="v-bar"></div>
                    </div>
                  ) : <Volume2 size={16} color="#ff2d55" />
                )}
              </div>
            ))}
          </div>
        )}

        {mobileTab === 'search' && (
          <div className="ios8-search-view">
            <div className="ios8-search-bar-container">
              <input
                type="text"
                className="ios8-search-input"
                placeholder="Artists, Songs, Lyrics"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="ios8-list">
              {searchQuery && filteredSongs.map((song, idx) => (
                <div key={`${song.id}-search-${idx}`} className="ios8-list-item" onClick={() => { setPlayingId(song.id); setIsMuted(false); }}>
                  <div className="ios8-item-info">
                    <div className="ios8-item-title">{song.title}</div>
                    <div className="ios8-item-artist">{song.artist}</div>
                  </div>
                </div>
              ))}
              {!searchQuery && (
                <div className="ios8-search-placeholder">
                  Find your favorite one-hit wonders.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {playingSong && (
        <div className="ios8-mini-player">
          <div
            className="ios8-mini-progress"
            style={{ width: '0%' }}
          ></div>
          <img src={`https://img.youtube.com/vi/${playingId}/default.jpg`} alt="" />
          <div className="ios8-mini-info">
            <div className="ios8-mini-title">{playingSong.title}</div>
            <div className="ios8-mini-artist">
              {isLoading ? 'Connecting...' : playingSong.artist}
            </div>
          </div>
          <div className="ios8-mini-controls">
            <button className="ios8-mini-btn" onClick={handleToggleMute}>
              {isMuted ? <VolumeX size={22} color="#ff2d55" strokeWidth={1.5} /> : <Volume2 size={22} color="#ff2d55" strokeWidth={1.5} />}
            </button>
            <button className="ios8-mini-btn" onClick={handleNext}>
              <SkipForward size={22} color="#ff2d55" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}

      <div className="ios8-tab-bar">
        <div className={`ios8-tab ${mobileTab === 'library' ? 'active' : ''}`} onClick={() => handleTabClick('library')}>
          <div className="ios7-icon library"></div>
          <span>Library</span>
        </div>
        <div className={`ios8-tab ${mobileTab === 'for-you' ? 'active' : ''}`} onClick={() => handleTabClick('for-you')}>
          <div className="ios7-icon for-you"></div>
          <span>For You</span>
        </div>
        <div className={`ios8-tab ${mobileTab === 'search' ? 'active' : ''}`} onClick={() => handleTabClick('search')}>
          <div className="ios7-icon search"></div>
          <span>Search</span>
        </div>
      </div>
    </div>
  );
}
