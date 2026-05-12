import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, X, Mic2, Music } from 'lucide-react';

const fetchITunesJSONP = (url) => {
  return new Promise((resolve, reject) => {
    const callbackName = 'itunes_callback_' + Math.round(100000 * Math.random());
    window[callbackName] = (data) => {
      delete window[callbackName];
      document.body.removeChild(script);
      resolve({ data });
    };

    const script = document.createElement('script');
    script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + callbackName;
    script.onerror = (err) => {
      delete window[callbackName];
      document.body.removeChild(script);
      reject(err);
    };
    document.body.appendChild(script);
  });
};

export default function SearchHub({ isOpen, onClose, onSelectArtist, onSelectGenre, onSelectLocal, onImport, isLanding }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [importUrl, setImportUrl] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const isActuallySearching = isFocused || searchQuery.trim().length > 0;

  const GENRES = ["Pop", "Hip-Hop", "Rock", "R&B", "Electronic", "Country", "Jazz", "Alternative"];
  const MIXTAPES = [
    { id: 'home', name: "Global Hits" },
    { id: 'i_ain_t_finished', name: "I Ain't Finished" },
    { id: 'twosixtape', name: "TwoSix Tape" },
    { id: 'simpleton', name: "Simpleton" },
    { id: 'wedge', name: "Wedge" },
    { id: 'music-apple-com-2026-05-11', name: "Forever Hits" },
    { id: 'music-apple-com-2026-05-11-2', name: "Top Charts Vol. 2" }
  ];

  // Live Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length > 1) {
        fetchArtistSuggestions(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchArtistSuggestions = async (query) => {
    try {
      const { data } = await fetchITunesJSONP(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=musicArtist&limit=4`);
      if (data.results) {
        setSearchResults(data.results.map(r => ({
          type: 'artist',
          id: r.artistId,
          name: r.artistName,
          image: r.artworkUrl100 ? r.artworkUrl100.replace('100x100bb', '400x400bb') : null,
          genre: r.primaryGenreName
        })));
      }
    } catch (err) {
      console.error("Live search failed", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`am-search-overlay ${isLanding ? 'landing' : ''}`} onClick={isLanding ? null : onClose}>
      <div className="am-search-container" onClick={e => e.stopPropagation()}>

        <div className={`am-search-header-transition ${isActuallySearching ? 'searching' : ''}`}>
          {isLanding && (
            <div className="am-welcome-header">
              <h1>Welcome to Lyric Finder</h1>
              <p>Select a collection or search for an artist to begin.</p>
            </div>
          )}
        </div>

        <div className="am-search-input-wrapper">
          <Search size={24} className="am-search-icon-big" />
          <input
            type="text"
            placeholder="Search Artist..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        </div>

        <div className={`am-search-results-container ${searchQuery.trim().length > 0 ? 'visible' : ''}`}>
          {searchResults.length > 0 && (
            <div className="am-search-suggestions">
              {searchResults.map(res => (
                <div
                  key={`${res.type}-${res.id}`}
                  className="am-suggestion-item"
                  onClick={() => {
                    onSelectArtist(res.name);
                    setSearchQuery('');
                    onClose();
                  }}
                >
                  <div className="am-suggest-left">
                    {res.image && (
                      <img src={res.image || null} alt="" className="am-suggest-art artist" />
                    )}
                    <div className="am-suggest-info">
                      <span className="am-suggest-name">{res.name}</span>
                      <span className="am-suggest-genre">{res.genre || 'Artist'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={`am-search-initial-content ${isActuallySearching ? 'searching' : ''}`}>
          <div className="am-genre-grid">
            <div className="am-genre-label">DISCOVER</div>
            <div className="am-horizontal-scroll">
              {/* Global Hits First */}
              {MIXTAPES.filter(m => m.id === 'home').map(m => (
                <button
                  key={m.id}
                  className="am-genre-badge mixtape"
                  onClick={() => {
                    onSelectLocal('globalsongs', 'Global Hits', true);
                    onClose();
                  }}
                >
                  {m.name}
                </button>
              ))}

              {/* Then Genres */}
              {GENRES.map(g => (
                <button
                  key={g}
                  className="am-genre-badge"
                  onClick={() => {
                    onSelectGenre(g);
                    onClose();
                  }}
                >
                  {g}
                </button>
              ))}

              {/* Then Other Mixtapes */}
              {MIXTAPES.filter(m => m.id !== 'home').map(m => (
                <button
                  key={m.id}
                  className="am-genre-badge mixtape"
                  onClick={() => {
                    onSelectLocal(m.id, m.name);
                    onClose();
                  }}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>

          <div className="am-genre-grid">
            <div className="am-genre-label">CUSTOM PLAYLIST</div>
            <div className="am-import-wrapper disabled" style={{
              opacity: 0.4,
              pointerEvents: 'none',
              filter: 'grayscale(1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 20px',
              border: '1px dashed rgba(255,255,255,0.1)',
              borderRadius: '12px'
            }}>
              <strong style={{ fontSize: '14px', letterSpacing: '2px', color: '#fff' }}>COMING SOON</strong>
              <span style={{ fontSize: '12px', opacity: 0.6, marginTop: '4px' }}>Plug n play coming soon</span>
            </div>
          </div>
        </div>

        {!isLanding && (
          <button className="am-close-search" onClick={onClose}>
            <X size={24} />
          </button>
        )}
      </div>
    </div>
  );
}
