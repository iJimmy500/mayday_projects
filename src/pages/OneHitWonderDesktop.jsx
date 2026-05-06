import React from 'react';
import { SkipForward, SkipBack, Volume2, VolumeX, Shuffle, ExternalLink } from 'lucide-react';

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
  playingSong
}) {
  return (
    <div className="mac-window desktop-only">
      <div className="mac-titlebar">
        <div className="mac-buttons">
          <div className="mac-btn close"></div>
          <div className="mac-btn minimize"></div>
          <div className="mac-btn maximize"></div>
        </div>
        <div className="mac-title">OHW Radio</div>
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
                <a
                  href={`https://youtube.com/watch?v=${playingId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lcd-yt-link"
                >
                  <ExternalLink size={10} />
                </a>
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
            <div className="sidebar-item">Movies</div>
            <div className="sidebar-item">TV Shows</div>
            <div className="sidebar-item">Podcasts</div>
            <div className="sidebar-item">Radio</div>
          </div>
          <div className="sidebar-section">
            <div className="sidebar-title">Store</div>
            <div className="sidebar-item">iTunes Store</div>
          </div>
          <div className="sidebar-section">
            <div className="sidebar-title">
              Playlists
              {songs.length < 300 && <span className="sync-spinner">🔄</span>}
            </div>
            <div className={`sidebar-item ${currentPlaylist === 'Recently Added' ? 'active' : ''}`} onClick={() => setCurrentPlaylist('Recently Added')}>Recently Added</div>
            <div className={`sidebar-item ${currentPlaylist === 'Apple Music' ? 'active' : ''}`} onClick={() => setCurrentPlaylist('Apple Music')}>Apple Music</div>
            <div className={`sidebar-item ${currentPlaylist === 'Waterloo' ? 'active' : ''}`} onClick={() => setCurrentPlaylist('Waterloo')}>Waterloo</div>
            <div className={`sidebar-item ${currentPlaylist === '2010s' ? 'active' : ''}`} onClick={() => setCurrentPlaylist('2010s')}>2010s</div>
            <div className={`sidebar-item ${currentPlaylist === '2000s' ? 'active' : ''}`} onClick={() => setCurrentPlaylist('2000s')}>2000s</div>
            <div className={`sidebar-item ${currentPlaylist === '90s' ? 'active' : ''}`} onClick={() => setCurrentPlaylist('90s')}>90s</div>
            <div className={`sidebar-item ${currentPlaylist === '80s' ? 'active' : ''}`} onClick={() => setCurrentPlaylist('80s')}>80s</div>
            <div className={`sidebar-item ${currentPlaylist === '70s' ? 'active' : ''}`} onClick={() => setCurrentPlaylist('70s')}>70s</div>
          </div>
        </div>

        <div className="itunes-main">
          <div className="table-header">
            <div className="th-cell"></div>
            <div className="th-cell">Name</div>
            <div className="th-cell">Artist</div>
            <div className="th-cell">Year</div>
          </div>
          <div className="table-body">
            {filteredSongs.map((song, idx) => (
              <div
                key={`${song.id}-desktop-${idx}`}
                className={`table-row ${selectedId === song.id ? 'selected' : ''} ${playingId === song.id ? 'playing' : ''}`}
                onClick={() => setSelectedId(song.id)}
                onDoubleClick={() => {
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
                <div className="td-cell">{song.year}</div>
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
    </div>
  );
}
