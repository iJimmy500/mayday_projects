import React from 'react';
import { isImageUrl } from './bracket';

export function Thumb({ entry, size = 'sm' }) {
  if (entry.image) {
    return isImageUrl(entry.image)
      ? <img src={entry.image} alt="" />
      : <span className={`bk-emoji-${size}`}>{entry.image}</span>;
  }
  return <span className="bk-initial">{(entry.name.trim()[0] || '?').toUpperCase()}</span>;
}

export function Competitor({ entry, isWinner, isLoser, clickable, onClick }) {
  if (!entry) {
    return <div className="bk-comp bk-comp--bye"><span className="bk-comp-name">Bye</span></div>;
  }
  return (
    <button
      className={`bk-comp ${isWinner ? 'is-win' : ''} ${isLoser ? 'is-lose' : ''} ${clickable ? 'is-clickable' : ''}`}
      onClick={clickable ? onClick : undefined}
      disabled={!clickable}
    >
      <span className="bk-comp-thumb"><Thumb entry={entry} /></span>
      <span className="bk-comp-name">{entry.name || '—'}</span>
    </button>
  );
}
