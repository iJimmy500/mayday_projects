import React, { useState, useEffect } from 'react';
import { SkipForward, Volume2, VolumeX, Flower, Plus, ExternalLink, X } from 'lucide-react';

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
  ohwData,
  currentPlaylist,
  setCurrentPlaylist,
  sortConfig,
  setSortConfig
}) {
  const [mobileTab, setMobileTab] = useState('library');
  const [randomSongs, setRandomSongs] = useState([]);
  const [selectedPlaylistView, setSelectedPlaylistView] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);

  useEffect(() => {
    if (mobileTab === 'for-you' && randomSongs.length === 0 && ohwData) {
      const shuffled = [...ohwData].sort(() => 0.5 - Math.random());
      setRandomSongs(shuffled.slice(0, 20));
    }
  }, [mobileTab, ohwData, randomSongs.length]);

  const handleTabClick = (tab) => {
    setMobileTab(tab);
    setSelectedPlaylistView(null);
    if (tab !== 'search') setSearchQuery("");
  };

  const playlists = [
    { name: 'Recently Added' },
    { name: 'Apple Music' },
    { name: 'Waterloo' },
    { name: '2020s' },
    { name: '2010s' },
    { name: '2000s' },
    { name: '90s' },
    { name: '80s' },
    { name: '70s' },
    { name: '60s' }
  ];

  if (!ohwData) return null;

  return (
    <div className="ios8-interface">
      <div className="ios8-header">
        <div className="ios8-status-spacer"></div>
        <div className="ios8-nav">
          {selectedPlaylistView && (
            <button className="ios8-back-btn" onClick={() => setSelectedPlaylistView(null)}>‹ Playlists</button>
          )}
          <div className="ios8-nav-title">
            {mobileTab === 'library' && 'Library'}
            {mobileTab === 'for-you' && 'For You'}
            {mobileTab === 'playlists' && (selectedPlaylistView || 'Playlists')}
            {mobileTab === 'search' && 'Search'}
          </div>
          <a href="https://mayinflight.com" className="ios8-edit-btn" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }} target="_blank" rel="noopener noreferrer">
            mayday <Flower size={14} strokeWidth={1.5} />
          </a>
        </div>
      </div>

      <div className="ios8-content">
        {mobileTab === 'library' && (
          <div className="ios8-list">
            <div className="ios8-section-header">Recently Added</div>
            <div className="ios8-recent-grid">
              {ohwData.slice(-3).map((song, idx) => (
                <div key={`${song.id}-recent-${idx}`} className="ios8-recent-item" onClick={() => { setPlayingId(song.id); setIsMuted(false); }}>
                  <img src={`https://img.youtube.com/vi/${song.id}/mqdefault.jpg`} alt={song.title} />
                  <div className="ios8-recent-title">{song.title}</div>
                  <div className="ios8-recent-artist">{song.artist}</div>
                </div>
              ))}
            </div>
            
            <div className="ios8-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>All Songs</span>
              <button 
                style={{ background: 'none', border: 'none', color: '#ff2d55', fontSize: '13px', fontWeight: '400', padding: 0 }} 
                onClick={() => setShowSortModal(true)}
              >
                Sort
              </button>
            </div>

            {ohwData.map((song, idx) => (
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

        {mobileTab === 'playlists' && (
          <div className="ios8-list">
            {!selectedPlaylistView ? (
              playlists.map((pl, idx) => (
                <div 
                  key={idx} 
                  className="ios8-playlist-item"
                  onClick={() => {
                    setCurrentPlaylist(pl.name);
                    setSelectedPlaylistView(pl.name);
                  }}
                >
                  <div className="ios8-item-info">
                    <div className="ios8-item-title">{pl.name}</div>
                  </div>
                  <div className="ios8-chevron">›</div>
                </div>
              ))
            ) : (
              filteredSongs.map((song, idx) => (
                <div key={`${song.id}-pl-${idx}`} className={`ios8-list-item ${playingId === song.id ? 'playing' : ''}`} onClick={() => { setPlayingId(song.id); setIsMuted(false); }}>
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
              ))
            )}
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
            <button className="ios8-mini-btn" onClick={() => setShowAddModal(true)}>
              <Plus size={22} color="#ff2d55" strokeWidth={1.5} />
            </button>
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
        <div className={`ios8-tab ${mobileTab === 'playlists' ? 'active' : ''}`} onClick={() => handleTabClick('playlists')}>
          <div className="ios7-icon playlists"></div>
          <span>Playlists</span>
        </div>
        <div className={`ios8-tab ${mobileTab === 'search' ? 'active' : ''}`} onClick={() => handleTabClick('search')}>
          <div className="ios7-icon search"></div>
          <span>Search</span>
        </div>
      </div>

      {showSortModal && (
        <div className="ios7-modal-overlay" onClick={() => setShowSortModal(false)}>
          <div className="ios7-action-sheet" onClick={e => e.stopPropagation()}>
            <div className="ios7-sheet-header">
              <div className="ios7-sheet-title">Sort Library</div>
            </div>
            
            <div className="ios7-sheet-options">
              <button 
                className={`ios7-sheet-item ${sortConfig.key === 'random' ? 'active' : ''}`}
                style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                onClick={() => { setSortConfig({ key: 'random', direction: 'asc' }); setShowSortModal(false); }}
              >
                <span>Random</span>
              </button>
              <button 
                className={`ios7-sheet-item ${sortConfig.key === 'title' ? 'active' : ''}`}
                style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                onClick={() => { setSortConfig({ key: 'title', direction: 'asc' }); setShowSortModal(false); }}
              >
                <span>Song Name</span>
              </button>
              <button 
                className={`ios7-sheet-item ${sortConfig.key === 'artist' ? 'active' : ''}`}
                style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                onClick={() => { setSortConfig({ key: 'artist', direction: 'asc' }); setShowSortModal(false); }}
              >
                <span>Artist</span>
              </button>
              <button 
                className={`ios7-sheet-item ${sortConfig.key === 'year' && sortConfig.direction === 'desc' ? 'active' : ''}`}
                style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                onClick={() => { setSortConfig({ key: 'year', direction: 'desc' }); setShowSortModal(false); }}
              >
                <span>Year (Newest)</span>
              </button>
              <button 
                className={`ios7-sheet-item ${sortConfig.key === 'year' && sortConfig.direction === 'asc' ? 'active' : ''}`}
                style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                onClick={() => { setSortConfig({ key: 'year', direction: 'asc' }); setShowSortModal(false); }}
              >
                <span>Year (Oldest)</span>
              </button>
            </div>

            <button className="ios7-sheet-cancel" onClick={() => setShowSortModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {showAddModal && playingSong && (
        <div className="ios7-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="ios7-action-sheet" onClick={e => e.stopPropagation()}>
            <div className="ios7-sheet-header">
              <div className="ios7-sheet-title">Add to your playlist!</div>
              <div className="ios7-sheet-subtitle">{playingSong.title} — {playingSong.artist}</div>
            </div>
            
            <div className="ios7-sheet-options">
              <a 
                href={`https://music.apple.com/search?term=${encodeURIComponent(playingSong.artist + ' ' + playingSong.title)}`} 
                target="_blank" rel="noopener noreferrer" 
                className="ios7-sheet-item"
              >
                <img src="/assets/apple_music_icon.webp" alt="" className="ios7-item-icon" />
                <span>Apple Music</span>
                <ExternalLink size={14} color="#007aff" />
              </a>

              <a 
                href={`https://open.spotify.com/search/${encodeURIComponent(playingSong.artist + ' ' + playingSong.title)}`} 
                target="_blank" rel="noopener noreferrer" 
                className="ios7-sheet-item"
              >
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Spotify_logo_2008%E2%80%932012.svg/1280px-Spotify_logo_2008%E2%80%932012.svg.png" alt="" className="ios7-item-icon" />
                <span>Spotify</span>
                <ExternalLink size={14} color="#007aff" />
              </a>

              <a 
                href={`https://listen.tidal.com/search?q=${encodeURIComponent(playingSong.artist + ' ' + playingSong.title)}`} 
                target="_blank" rel="noopener noreferrer" 
                className="ios7-sheet-item"
              >
                <img src="https://static.vecteezy.com/system/resources/previews/073/494/883/non_2x/tidal-logo-circular-glossy-icon-with-transparent-background-free-png.png" alt="" className="ios7-item-icon" />
                <span>Tidal</span>
                <ExternalLink size={14} color="#007aff" />
              </a>

              <a 
                href={`https://music.youtube.com/search?q=${encodeURIComponent(playingSong.artist + ' ' + playingSong.title)}`} 
                target="_blank" rel="noopener noreferrer" 
                className="ios7-sheet-item"
              >
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsX4jGJGFT0h1uYOp3sfqGnqLejcmBMiTnzQ&s" alt="" className="ios7-item-icon" />
                <span>YouTube Music</span>
                <ExternalLink size={14} color="#007aff" />
              </a>
            </div>

            <button className="ios7-sheet-cancel" onClick={() => setShowAddModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
