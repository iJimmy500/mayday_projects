import React from 'react';
import { Shuffle, Trash2, Download } from 'lucide-react';

export default function AuraHeader({ shuffleImages, clearAll, handleExport }) {
  return (
    <header className="aura-header">
      <div className="aura-brand">frame.</div>
      <div className="aura-header-actions">
        <button className="action-icon-btn" onClick={shuffleImages} title="Shuffle Photos">
          <Shuffle size={18} strokeWidth={2} />
        </button>
        <button className="action-icon-btn" onClick={clearAll} title="Clear All">
          <Trash2 size={18} strokeWidth={2} />
        </button>
        <button className="aura-save-btn" onClick={handleExport} title="Quick Save as Image">
          <Download size={18} strokeWidth={2} />
          <span>Save</span>
        </button>
        <button className="aura-done-btn" onClick={() => window.print()}>Print</button>
      </div>
    </header>
  );
}
