import { useState } from 'react';
import {
  MODES, DIFFICULTY_OPTIONS, CATEGORY_OPTIONS,
} from './gameEngine';
import Fermi       from './Fermi';
import HigherLower from './HigherLower';
import OrderEm     from './OrderEm';
import './Game.css';

export default function GameHub() {
  const [mode,       setMode]       = useState('fermi');
  const [categoryId, setCategoryId] = useState('all');
  const [difficulty, setDifficulty] = useState('normal');
  const [playing,    setPlaying]    = useState(false);

  const handleBack = () => setPlaying(false);

  if (playing) {
    const config = { categoryId, difficulty };
    if (mode === 'fermi')        return <Fermi       config={config} onBack={handleBack} />;
    if (mode === 'higher_lower') return <HigherLower config={config} onBack={handleBack} />;
    if (mode === 'order_em')     return <OrderEm     config={config} onBack={handleBack} />;
  }

  return (
    <div className="wcg-root">
      <div className="wcg-hub">
        <div className="wcg-hub-header">
          <h1 className="wcg-hub-title">pick your game</h1>
          <p className="wcg-hub-sub">test your intuition about scale</p>
        </div>

        <div className="wcg-hub-pickers">

          <div className="wcg-picker">
            <span className="wcg-picker-label">mode</span>
            <div className="wcg-picker-options">
              {MODES.map(m => (
                <button
                  key={m.id}
                  className={`wcg-opt${mode === m.id ? ' wcg-opt--active' : ''}`}
                  onClick={() => setMode(m.id)}
                >
                  {m.label}
                  <span className="wcg-opt-desc">{m.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="wcg-picker">
            <span className="wcg-picker-label">category</span>
            <div className="wcg-cat-scroll">
              <div className="wcg-cat-options">
                {CATEGORY_OPTIONS.map(c => (
                  <button
                    key={c.id}
                    className={`wcg-cat-opt${categoryId === c.id ? ' wcg-cat-opt--active' : ''}`}
                    onClick={() => setCategoryId(c.id)}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="wcg-picker">
            <span className="wcg-picker-label">difficulty</span>
            <div className="wcg-picker-options">
              {DIFFICULTY_OPTIONS.map(d => (
                <button
                  key={d.id}
                  className={`wcg-opt${difficulty === d.id ? ' wcg-opt--active' : ''}`}
                  onClick={() => setDifficulty(d.id)}
                >
                  {d.label}
                  <span className="wcg-opt-desc">{d.desc}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

        <button className="wcg-play-btn" onClick={() => setPlaying(true)}>
          Play
        </button>

        <p className="wcg-estimate-note">
          values are approximate, comparisons are based on widely cited averages
        </p>
      </div>
    </div>
  );
}
