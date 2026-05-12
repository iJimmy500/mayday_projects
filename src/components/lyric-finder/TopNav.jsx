import React from 'react';
import { Search } from 'lucide-react';

/**
 * TopNav
 * The fixed top navigation bar for LyricFinder.
 * Displays the active playlist info on the left and the search trigger on the right.
 */
export default function TopNav({ playlistInfo, customPlaylist, artistImage, onOpenSearch }) {
  return (
    <header className="am-top-nav">
      <div className="am-nav-left">
        {playlistInfo && (
          <div className="am-active-playlist-container">
            <a
              href={playlistInfo.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className={`am-active-playlist ${artistImage ? 'has-art' : ''}`}
            >
              {artistImage && <img src={artistImage} alt="" className="am-playlist-avatar" />}
              <strong>{playlistInfo.name}</strong>
              <span className="am-playlist-progress">{customPlaylist.length} LEFT</span>
            </a>
          </div>
        )}
      </div>
      <div className="am-nav-right">
        <button className="am-nav-btn" onClick={onOpenSearch} title="Discovery Hub">
          <Search size={22} />
        </button>
      </div>
    </header>
  );
}
