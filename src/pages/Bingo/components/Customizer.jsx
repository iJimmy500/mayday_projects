import React from 'react';
import { COLOR_THEMES, BOARD_STYLES, PATTERNS, GRID_SIZES } from '../constants';

export default function Customizer({
  title, setTitle,
  gridSize, setGridSize,
  selectedStyle, setSelectedStyle,
  selectedTheme, setSelectedTheme,
  selectedPattern, setSelectedPattern,
  customInput, setCustomInput,
  currentCount, neededCount, handleApply
}) {
  return (
    <div className="bingo-custom-form no-print">
      <div className="input-group">
        <label>Card Title</label>
        <input 
          type="text" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          placeholder="e.g. Daily Goals Bingo"
        />
      </div>

      <div className="input-group">
        <label>Grid Size</label>
        <div className="theme-selector">
          {GRID_SIZES.map(size => (
            <button 
              key={size.id}
              className={`theme-btn ${gridSize === size.id ? 'active' : ''}`}
              onClick={() => setGridSize(size.id)}
            >
              {size.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="input-group">
        <label>Board Style</label>
        <div className="theme-selector">
          {BOARD_STYLES.map(style => (
            <button 
              key={style.id}
              className={`theme-btn ${selectedStyle === style.id ? 'active' : ''}`}
              onClick={() => setSelectedStyle(style.id)}
            >
              {style.label}
            </button>
          ))}
        </div>
      </div>

      <div className="input-group">
        <label>Color Theme</label>
        <div className="theme-selector">
          {COLOR_THEMES.map(theme => (
            <button 
              key={theme.id}
              className={`theme-btn ${selectedTheme === theme.id ? 'active' : ''}`}
              onClick={() => setSelectedTheme(theme.id)}
            >
              {theme.label}
            </button>
          ))}
        </div>
      </div>

      <div className="input-group">
        <label>Card Pattern Background</label>
        <div className="theme-selector">
          {PATTERNS.map(pattern => (
            <button 
              key={pattern.id}
              className={`theme-btn ${selectedPattern === pattern.id ? 'active' : ''}`}
              onClick={() => setSelectedPattern(pattern.id)}
            >
              {pattern.label}
            </button>
          ))}
        </div>
      </div>

      <div className="input-group">
        <label>Bingo Items (one per line, format: text | image_url)</label>
        <textarea
          rows={10}
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          placeholder="Drink water&#10;Read a book&#10;Add custom image | https://example.com/img.jpg"
        />
        <span className="word-count">{currentCount} / {neededCount} items entered</span>
      </div>
      <button className="bingo-apply-btn" onClick={handleApply}>
        Generate & Play
      </button>
    </div>
  );
}
