import React, { useState } from 'react';
import { Flower, Music, Mic2, Disc3, Share2, Download } from 'lucide-react';
import { TODAY_LABEL, CURRENT_YEAR } from './constants';
import ArtThumb from './ArtThumb';
import PaginatedList from './PaginatedList';

const TABS = ['tracks', 'artists', 'albums'];
const TAB_ICONS = {
  tracks:  <Music size={12} />,
  artists: <Mic2  size={12} />,
  albums:  <Disc3 size={12} />,
};

export default function BrowseScreen({ result, onBack, onShare, onSave, cardBusy }) {
  const [activeTab, setActiveTab] = useState('tracks');
  const yearsAgo = CURRENT_YEAR - result.year;

  return (
    <div className="tb-fade-in tb-results-page">
      <div className="tb-results-header">
        <button className="tb-ghost-btn" onClick={onBack}>← back</button>
        <div className="tb-header-actions">
          <button className="tb-icon-btn" onClick={onShare} disabled={!!cardBusy} title="Share card">
            {cardBusy === 'share' ? <span className="tb-mini-spinner" /> : <Share2 size={14} />}
          </button>
          <button className="tb-icon-btn" onClick={onSave} disabled={!!cardBusy} title="Save image">
            {cardBusy === 'save' ? <span className="tb-mini-spinner" /> : <Download size={14} />}
          </button>
        </div>
      </div>

      <div className="tb-date-display">
        <span className="tb-date-month-day">{TODAY_LABEL}</span>
        <span className="tb-date-year">{result.year}</span>
      </div>

      <div className="tb-meta-row">
        <span className="tb-username">@{result.user}</span>
        <span className="tb-meta-dot">·</span>
        <span className="tb-meta-plays">{result.total} plays</span>
        <span className="tb-meta-dot">·</span>
        <span className="tb-meta-ago">{yearsAgo}y ago</span>
      </div>

      <div className="tb-tabs">
        {TABS.map(tab => {
          const count = result.data[tab].length;
          if (!count) return null;
          return (
            <button key={tab}
              className={`tb-tab${activeTab === tab ? ' active' : ''}`}
              onClick={() => setActiveTab(tab)}>
              {TAB_ICONS[tab]}
              <span>{tab}</span>
              <span className="tb-tab-count">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="tb-tab-content">
        {activeTab === 'tracks' && (
          <PaginatedList items={result.data.tracks} renderItem={(t, i) => (
            <li key={i} className="tb-row">
              <span className="tb-rank">{i + 1}</span>
              <ArtThumb src={t.art} fallback={<Music size={13} />} />
              <div className="tb-info">
                <span className="tb-primary">{t.name}</span>
                <span className="tb-secondary">{t.artist}</span>
              </div>
              <span className="tb-count">{t.count}×</span>
            </li>
          )} />
        )}
        {activeTab === 'artists' && (
          <PaginatedList items={result.data.artists} renderItem={(a, i) => (
            <li key={i} className="tb-row">
              <span className="tb-rank">{i + 1}</span>
              <ArtThumb src={a.art} fallback={<Mic2 size={13} />} />
              <div className="tb-info"><span className="tb-primary">{a.name}</span></div>
              <span className="tb-count">{a.count}×</span>
            </li>
          )} />
        )}
        {activeTab === 'albums' && (
          <PaginatedList items={result.data.albums} renderItem={(a, i) => (
            <li key={i} className="tb-row">
              <span className="tb-rank">{i + 1}</span>
              <ArtThumb src={a.art} fallback={<Disc3 size={13} />} />
              <div className="tb-info">
                <span className="tb-primary">{a.name}</span>
                <span className="tb-secondary">{a.artist}</span>
              </div>
              <span className="tb-count">{a.count}×</span>
            </li>
          )} />
        )}
      </div>

      <p className="tb-source">via last.fm</p>
      <footer className="tb-footer">
        <a href="https://mayinflight.com" className="tb-footer-link" target="_blank" rel="noopener noreferrer">
          mayday <Flower size={13} strokeWidth={1.5} />
        </a>
      </footer>
    </div>
  );
}
