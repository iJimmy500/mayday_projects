import React from 'react';
import { PenLine, ScrollText, AudioLines } from 'lucide-react';

const MODES = [
  {
    id: 'finish',
    label: 'Finish the lyrics',
    sub: 'Type the line that comes next.',
    Icon: PenLine
  },
  {
    id: 'lyrics',
    label: 'Guess by lyrics',
    sub: 'Name the song from a snippet.',
    Icon: ScrollText
  },
  {
    id: 'clip',
    label: 'Guess by clip',
    sub: 'Name the song from a short clip.',
    Icon: AudioLines
  }
];

export default function ModeSelect({ onSelect, current }) {
  return (
    <div className="ms-overlay">
      <div className="ms-card">
        <h1 className="ms-title">Choose a mode</h1>
        <p className="ms-subtitle">Switch anytime from the dashboard.</p>
        <div className="ms-options">
          {MODES.map(({ id, label, sub, Icon }) => (
            <button
              key={id}
              className={`ms-option ${current === id ? 'suggested' : ''}`}
              onClick={() => onSelect(id)}
            >
              <span className="ms-option-icon"><Icon size={24} /></span>
              <span className="ms-option-text">
                <span className="ms-option-label">{label}</span>
                <span className="ms-option-sub">{sub}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
