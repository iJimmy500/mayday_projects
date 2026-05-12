import React from 'react';
import { Clipboard } from 'lucide-react';

/**
 * ImportBox
 * Modal overlay for pasting/importing a custom playlist URL or raw song list.
 */
export default function ImportBox({ importUrl, onImportUrlChange, onSubmit, onClose }) {
  return (
    <div className="am-search-overlay" onClick={onClose}>
      <div className="am-search-container am-import-box" onClick={e => e.stopPropagation()}>
        <Clipboard size={24} className="am-search-icon-big" />
        <textarea
          autoFocus
          placeholder="Paste Apple Music/Spotify URL or a list of songs (Song - Artist)..."
          value={importUrl}
          onChange={e => onImportUrlChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && onSubmit(importUrl)}
        />
        <div className="am-import-actions">
          <button className="am-import-submit" onClick={() => onSubmit(importUrl)}>IMPORT</button>
          <button className="am-close-search-inline" onClick={onClose}>CANCEL</button>
        </div>
      </div>
    </div>
  );
}
