import React, { useState } from 'react';
import { SkipForward, SkipBack, Volume2, VolumeX, Shuffle, ExternalLink, Flower, Download, Database, FileJson, FileSpreadsheet, X, MessageSquare, Flag, Plus } from 'lucide-react';

export default function OneHitWonderDesktop({
  filteredSongs,
  songs,
  playingId,
  setPlayingId,
  selectedId,
  setSelectedId,
  isMuted,
  setIsMuted,
  handleToggleMute,
  handleNext,
  handlePrev,
  isShuffle,
  setIsShuffle,
  searchQuery,
  setSearchQuery,
  currentPlaylist,
  setCurrentPlaylist,
  syncStatus,
  isLoading,
  playingSong,
  sortConfig,
  setSortConfig
}) {
  const [showDataModal, setShowDataModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [songToAdd, setSongToAdd] = useState(null);

  const handleSort = (key) => {
    if (sortConfig.key === key) {
      setSortConfig({ key, direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      setSortConfig({ key, direction: 'asc' });
    }
  };

  const openAddModal = (e, song) => {
    e.stopPropagation();
    setSongToAdd(song);
    setShowAddModal(true);
  };

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(songs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'one_hit_wonders.json';
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="mac-window desktop-only">
      <div className="mac-titlebar">
        <div className="mac-buttons">
          <div className="mac-btn close"></div>
          <div className="mac-btn minimize"></div>
          <div className="mac-btn maximize"></div>
        </div>
        <div className="mac-title">OHW Radio</div>
        <button className="mac-data-btn" onClick={() => setShowDataModal(true)} title="Download Dataset">
          <Database size={14} color="#666" />
        </button>
      </div>

      <div className="itunes-header">
        <div className="itunes-controls">
          <button className="itunes-btn small" onClick={handlePrev}>
            <SkipBack fill="#444" size={14} />
          </button>
          <button className="itunes-btn large" onClick={handleToggleMute}>
            {isMuted ? <VolumeX fill="#444" size={20} /> : <Volume2 fill="#444" size={20} />}
          </button>
          <button className="itunes-btn small" onClick={handleNext}>
            <SkipForward fill="#444" size={14} />
          </button>
          <button
            className={`itunes-btn small shuffle-btn ${isShuffle ? 'active' : ''}`}
            onClick={() => setIsShuffle(!isShuffle)}
          >
            <Shuffle size={14} color={isShuffle ? "#007aff" : "#444"} />
          </button>
        </div>

        <div className="itunes-lcd">
          <div className="lcd-glare"></div>
          <div className="lcd-info">
            {playingSong ? (
              <>
                <div className={`lcd-title ${playingSong.title.length > 20 ? 'marquee-container' : ''}`}>
                  <span className={playingSong.title.length > 20 ? 'marquee-content' : ''}>{playingSong.title}</span>
                </div>
                <div className={`lcd-artist ${playingSong.artist.length > 25 ? 'marquee-container' : ''}`}>
                  <span className={playingSong.artist.length > 25 ? 'marquee-content' : ''}>{playingSong.artist}</span>
                </div>
                {isLoading && <div className="lcd-loading">Connecting...</div>}
                <div className="lcd-actions">
                  <button 
                    className="linkout-2008 sm" 
                    onClick={(e) => openAddModal(e, playingSong)}
                    title="Add to Playlist"
                    style={{ border: 'none', padding: 0 }}
                  >
                    <Plus size={10} />
                  </button>
                </div>
              </>
            ) : syncStatus ? (
              <>
                <div className="lcd-title">Syncing Library...</div>
                <div className="lcd-artist">Finding: {syncStatus.title}</div>
                <div className="lcd-loading">[{syncStatus.current}/{syncStatus.total}]</div>
              </>
            ) : (
              <>
                <div className="lcd-title">One Hit Wonder Radio</div>
                <div className="lcd-artist">Select a song to play</div>
              </>
            )}
          </div>
        </div>

        <div className="itunes-search-container">
          <input
            type="text"
            className="itunes-search"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="itunes-body">
        <div className="itunes-sidebar">
          <div className="sidebar-section">
            <div className="sidebar-title">Library</div>
            <div className={`sidebar-item ${currentPlaylist === 'All' ? 'active' : ''}`} onClick={() => setCurrentPlaylist('All')}>Music</div>
            <a href="https://youtube.com/@iamjames006" className="sidebar-item store-link" target="_blank" rel="noopener noreferrer">youtube</a>
            <div className="sidebar-item">Radio</div>
          </div>
          <div className="sidebar-section">
            <div className="sidebar-title">Store</div>
            <a href="https://mayinflight.com" className="sidebar-item store-link" target="_blank" rel="noopener noreferrer">
              mayday <Flower size={14} strokeWidth={1.5} style={{ marginLeft: 'auto' }} />
            </a>
          </div>
          <div className="sidebar-section">
            <div className="sidebar-title">
              Playlists
              {songs.length < 300 && <span className="sync-spinner">🔄</span>}
            </div>
            <div className={`sidebar-item ${currentPlaylist === 'Recently Added' ? 'active' : ''}`} onClick={() => setCurrentPlaylist('Recently Added')}>Recently Added</div>
            <div className={`sidebar-item ${currentPlaylist === 'Apple Music' ? 'active' : ''}`} onClick={() => setCurrentPlaylist('Apple Music')}>Apple Music</div>
            <div className={`sidebar-item ${currentPlaylist === 'Waterloo' ? 'active' : ''}`} onClick={() => setCurrentPlaylist('Waterloo')}>Waterloo</div>
            <div className={`sidebar-item ${currentPlaylist === '2020s' ? 'active' : ''}`} onClick={() => setCurrentPlaylist('2020s')}>2020s</div>
            <div className={`sidebar-item ${currentPlaylist === '2010s' ? 'active' : ''}`} onClick={() => setCurrentPlaylist('2010s')}>2010s</div>
            <div className={`sidebar-item ${currentPlaylist === '2000s' ? 'active' : ''}`} onClick={() => setCurrentPlaylist('2000s')}>2000s</div>
            <div className={`sidebar-item ${currentPlaylist === '90s' ? 'active' : ''}`} onClick={() => setCurrentPlaylist('90s')}>90s</div>
            <div className={`sidebar-item ${currentPlaylist === '80s' ? 'active' : ''}`} onClick={() => setCurrentPlaylist('80s')}>80s</div>
            <div className={`sidebar-item ${currentPlaylist === '70s' ? 'active' : ''}`} onClick={() => setCurrentPlaylist('70s')}>70s</div>
            <div className={`sidebar-item ${currentPlaylist === '60s' ? 'active' : ''}`} onClick={() => setCurrentPlaylist('60s')}>60s</div>
          </div>
        </div>

        <div className="itunes-main">
          <div className="table-header">
            <div className="th-cell header-corner" onClick={() => handleSort('random')}>
              {sortConfig.key !== 'random' && (
                <Shuffle size={12} className="header-shuffle-icon" title="Reset to Random Order" />
              )}
            </div>
            <div 
              className={`th-cell sortable ${sortConfig.key === 'title' ? 'active-sort' : ''}`}
              onClick={() => handleSort('title')}
            >
              Name {sortConfig.key === 'title' && (sortConfig.direction === 'asc' ? '▴' : '▾')}
            </div>
            <div 
              className={`th-cell sortable ${sortConfig.key === 'artist' ? 'active-sort' : ''}`}
              onClick={() => handleSort('artist')}
            >
              Artist {sortConfig.key === 'artist' && (sortConfig.direction === 'asc' ? '▴' : '▾')}
            </div>
            <div 
              className={`th-cell sortable ${sortConfig.key === 'year' ? 'active-sort' : ''}`}
              onClick={() => handleSort('year')}
            >
              Year {sortConfig.key === 'year' && (sortConfig.direction === 'asc' ? '▴' : '▾')}
            </div>
          </div>
          <div className="table-body">
            {filteredSongs.map((song, idx) => (
              <div
                key={`${song.id}-desktop-${idx}`}
                className={`table-row ${selectedId === song.id ? 'selected' : ''} ${playingId === song.id ? 'playing' : ''}`}
                onClick={() => {
                  setPlayingId(song.id);
                  setSelectedId(song.id);
                  setIsMuted(false);
                }}
              >
                <div className="td-cell play-icon-cell">
                  {playingId === song.id && (
                    !isMuted ? (
                      <div className="ios8-visualizer">
                        <div className="v-bar"></div>
                        <div className="v-bar"></div>
                        <div className="v-bar"></div>
                        <div className="v-bar"></div>
                      </div>
                    ) : <Volume2 size={12} color="#ff2d55" />
                  )}
                </div>
                <div className="td-cell" data-artist={song.artist}>{song.title}</div>
                <div className="td-cell">{song.artist}</div>
                <div className="td-cell year-cell">
                  {song.year}
                  <button className="row-plus-btn" onClick={(e) => openAddModal(e, song)}>
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="itunes-footer">
            <div className="footer-status">
              {filteredSongs.length} Songs, {Math.floor(filteredSongs.length * 3.5 / 60)} Hours
              {songs.length < 300 && " — Syncing Library..."}
            </div>
          </div>
        </div>
      </div>
      {showAddModal && songToAdd && (
        <div className="mac-alert-overlay">
          <div className="mac-alert data-modal">
            <div className="mac-alert-header">
              <div className="mac-alert-title">Add to your playlist!</div>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="mac-alert-message" style={{ marginBottom: '20px' }}>
              Search <strong>"{songToAdd.title}"</strong> by <strong>{songToAdd.artist}</strong> on your favorite platform:
            </div>
            
            <div className="data-file-list">
              <a 
                href={`https://music.apple.com/search?term=${encodeURIComponent(songToAdd.artist + ' ' + songToAdd.title)}`} 
                target="_blank" rel="noopener noreferrer" 
                className="data-file-item"
                style={{ textDecoration: 'none' }}
              >
                <div className="file-icon">
                  <img src="/assets/apple_music_icon.webp" alt="Apple Music" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <div className="file-info">
                  <div className="file-name">Apple Music</div>
                  <div className="file-desc">Search in Apple Music library</div>
                </div>
                <div className="linkout-2008">›</div>
              </a>

              <a 
                href={`https://open.spotify.com/search/${encodeURIComponent(songToAdd.artist + ' ' + songToAdd.title)}`} 
                target="_blank" rel="noopener noreferrer" 
                className="data-file-item"
                style={{ textDecoration: 'none' }}
              >
                <div className="file-icon">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Spotify_logo_2008%E2%80%932012.svg/1280px-Spotify_logo_2008%E2%80%932012.svg.png" alt="Spotify" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <div className="file-info">
                  <div className="file-name">Spotify</div>
                  <div className="file-desc">Find on Spotify</div>
                </div>
                <div className="linkout-2008">›</div>
              </a>

              <a 
                href={`https://listen.tidal.com/search?q=${encodeURIComponent(songToAdd.artist + ' ' + songToAdd.title)}`} 
                target="_blank" rel="noopener noreferrer" 
                className="data-file-item"
                style={{ textDecoration: 'none' }}
              >
                <div className="file-icon">
                  <img src="https://static.vecteezy.com/system/resources/previews/073/494/883/non_2x/tidal-logo-circular-glossy-icon-with-transparent-background-free-png.png" alt="Tidal" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <div className="file-info">
                  <div className="file-name">Tidal</div>
                  <div className="file-desc">Search on Tidal</div>
                </div>
                <div className="linkout-2008">›</div>
              </a>

              <a 
                href={`https://youtube.com/watch?v=${songToAdd.id}`} 
                target="_blank" rel="noopener noreferrer" 
                className="data-file-item"
                style={{ textDecoration: 'none' }}
              >
                <div className="file-icon">
                  <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsX4jGJGFT0h1uYOp3sfqGnqLejcmBMiTnzQ&s" alt="YouTube" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <div className="file-info">
                  <div className="file-name">YouTube</div>
                  <div className="file-desc">Watch original video on YouTube</div>
                </div>
                <div className="linkout-2008">›</div>
              </a>
            </div>

            <div className="mac-alert-footer" style={{ marginTop: '20px', fontSize: '11px', color: '#888', textAlign: 'center' }}>
              These links will open a search for this song on the respective platform.
            </div>
          </div>
        </div>
      )}

      {showDataModal && (
        <div className="mac-alert-overlay">
          <div className="mac-alert data-modal">
            <div className="mac-alert-header">
              <div className="mac-alert-title">Curated Data Archive</div>
              <button className="modal-close-btn" onClick={() => setShowDataModal(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="mac-alert-message">
              This library is a research archive curated by James to document musical history. It combines publicly available metadata with custom processing for educational and historical use.
            </div>
            
            <div className="data-file-list">
              <div className="data-file-item">
                <div className="file-icon"><FileJson size={24} color="#3e81cb" /></div>
                <div className="file-info">
                  <div className="file-name">one_hit_wonders.json</div>
                  <div className="file-desc">Processed library with curated YouTube metadata ({songs.length} entries)</div>
                </div>
                <button className="mac-alert-btn primary sm-btn" onClick={downloadJSON}>
                  <Download size={12} style={{ marginRight: '6px' }} /> JSON
                </button>
              </div>

              <div className="data-file-item">
                <div className="file-icon"><FileSpreadsheet size={24} color="#27c93f" /></div>
                <div className="file-info">
                  <div className="file-name">source_archive.csv</div>
                  <div className="file-desc">Raw archive of song data used for this curation</div>
                </div>
                <a href="/artifacts/one_hit_wonders_1970s_onwards.csv" download className="mac-alert-btn primary sm-btn" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                  <Download size={12} style={{ marginRight: '6px' }} /> CSV
                </a>
              </div>
            </div>

            <div className="modal-actions-grid" style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <a href="https://instagram.com/phushsiafirst" target="_blank" rel="noopener noreferrer" className="mac-alert-btn" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MessageSquare size={14} style={{ marginRight: '8px' }} /> Suggest Song
              </a>
              <a href="https://instagram.com/phushsiafirst" target="_blank" rel="noopener noreferrer" className="mac-alert-btn" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Flag size={14} style={{ marginRight: '8px' }} /> Report Issue
              </a>
            </div>

            <div className="mac-alert-footer" style={{ marginTop: '20px', fontSize: '11px', color: '#888', textAlign: 'center' }}>
              This is a personal research archive. Metadata is sourced from public records and curated by the author for educational purposes.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
