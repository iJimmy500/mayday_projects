import React from 'react';
import { Image as ImageIcon, Shuffle, Maximize2, Grip, Layout as LayoutIconPlaceholder, Sliders } from 'lucide-react';

const LayoutMiniIcon = ({ layout, active }) => {
  const isSpecial = ['scattered', 'slanted', 'inset'].includes(layout.type);
  
  return (
    <div className={`mini-icon type-${layout.type || 'grid'}`} style={{
      width: '28px', height: '28px',
      display: isSpecial ? 'block' : 'grid',
      position: 'relative',
      gap: '2px',
      gridTemplateColumns: layout.cols,
      gridTemplateRows: layout.rows,
      overflow: 'hidden'
    }}>
      {Array.from({ length: layout.slots }).map((_, i) => (
        <div key={i} className={`mini-slot slot-${i}`} style={{
          background: active ? 'var(--pc-text)' : 'var(--pc-text-muted)',
          borderRadius: layout.type === 'scattered' ? '1px' : '2px',
          ...(layout.spans && layout.spans[i] ? layout.spans[i] : {})
        }} />
      ))}
    </div>
  );
};

export default function AuraToolbar({
  activeTab,
  library,
  activeLibraryImage,
  setActiveLibraryImage,
  bulkInputRef,
  autoFill,
  customGrid,
  setCustomGrid,
  setActiveLayout,
  activeLayout,
  LAYOUTS,
  COLORS,
  GRADIENTS,
  setBgColor,
  bgColor,
  RATIOS,
  ratio,
  setRatio,
  gap,
  setGap,
  padding,
  setPadding,
  radius,
  setRadius
}) {
  return (
    <div className="aura-tool-panel">
      <div className="tool-panel-header">
        <h3>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h3>
        <p>Customize your collage</p>
      </div>
      <div className="tool-panel-content">
        {activeTab === 'images' && (
          <div className="library-container">
            <div className="library-actions">
              <button className="library-bulk-btn" onClick={() => bulkInputRef.current?.click()}>
                <ImageIcon size={18} />
                <span>Bulk Upload</span>
              </button>
              <button className="library-fill-btn" onClick={autoFill} disabled={library.length === 0}>
                <Shuffle size={18} />
                <span>Auto-Fill Grid</span>
              </button>
            </div>
            
            <div className="library-grid">
              {library.length === 0 && <p className="empty-lib-text">No images uploaded yet.</p>}
              {library.map((img, idx) => (
                <div 
                  key={idx} 
                  className={`library-item ${activeLibraryImage === img ? 'active' : ''}`}
                  onClick={() => setActiveLibraryImage(img)}
                >
                  <img src={img} alt="library" />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'layout' && (
          <div className="layout-selection">
            <div className="custom-grid-builder">
              <span className="section-label">Custom Grid</span>
              <div className="custom-input-row">
                <input 
                  type="number" 
                  min="1" max="10" 
                  value={customGrid.cols} 
                  onChange={e => setCustomGrid(prev => ({ ...prev, cols: e.target.value }))}
                  placeholder="Cols"
                />
                <span className="x-divider">×</span>
                <input 
                  type="number" 
                  min="1" max="10" 
                  value={customGrid.rows} 
                  onChange={e => setCustomGrid(prev => ({ ...prev, rows: e.target.value }))}
                  placeholder="Rows"
                />
                <button className="apply-grid-btn" onClick={() => {
                  const c = parseInt(customGrid.cols) || 1;
                  const r = parseInt(customGrid.rows) || 1;
                  setActiveLayout({
                    id: 'custom',
                    slots: c * r,
                    cols: `repeat(${c}, 1fr)`,
                    rows: `repeat(${r}, 1fr)`
                  });
                }}>Apply</button>
              </div>
            </div>

            <span className="section-label" style={{ marginTop: '20px' }}>Templates</span>
            <div className="layout-list">
              {LAYOUTS.map(l => (
                <button 
                  key={l.id} 
                  className={`layout-card ${activeLayout.id === l.id ? 'active' : ''}`}
                  onClick={() => setActiveLayout(l)}
                >
                  <LayoutMiniIcon layout={l} active={activeLayout.id === l.id} />
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'background' && (
          <div className="background-picker">
            <section className="palette-section">
              <span className="section-label">Solid Colors</span>
              <div className="color-palette">
                {COLORS.map(c => (
                  <div 
                    key={c}
                    className={`color-swatch ${bgColor === c ? 'active' : ''}`}
                    style={{ background: c }}
                    onClick={() => setBgColor(c)}
                  />
                ))}
              </div>
            </section>

            <section className="palette-section" style={{ marginTop: '24px' }}>
              <span className="section-label">Gradients</span>
              <div className="color-palette">
                {GRADIENTS.map(g => (
                  <div 
                    key={g}
                    className={`color-swatch ${bgColor === g ? 'active' : ''}`}
                    style={{ background: g }}
                    onClick={() => setBgColor(g)}
                  />
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'format' && (
          <div className="slider-container">
            <div className="slider-row" style={{ flexWrap: 'wrap' }}>
              <Maximize2 size={18} className="slider-icon" />
              <div style={{ display: 'flex', gap: '8px', flex: 1, flexWrap: 'wrap' }}>
                {RATIOS.map(r => (
                  <button 
                    key={r.id}
                    style={{ 
                      flex: '1 1 calc(33% - 8px)', 
                      padding: '6px', 
                      borderRadius: '8px', 
                      border: 'none', 
                      background: ratio === r.value ? 'var(--pc-text)' : 'var(--pc-surface)', 
                      color: ratio === r.value ? '#000' : 'var(--pc-text-muted)',
                      fontWeight: ratio === r.value ? '600' : '400',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                    onClick={() => setRatio(r.value)}
                  >
                    {r.id}
                  </button>
                ))}
              </div>
            </div>
            <div className="slider-row">
              <Grip size={18} className="slider-icon" />
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--pc-text-muted)', marginBottom: '4px' }}>
                  <span>Spacing</span>
                  <span>{gap}px</span>
                </div>
                <input type="range" min="0" max="40" value={gap} onChange={e => setGap(parseInt(e.target.value))} />
              </div>
            </div>
            <div className="slider-row">
              <LayoutIconPlaceholder size={18} className="slider-icon" />
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--pc-text-muted)', marginBottom: '4px' }}>
                  <span>Padding</span>
                  <span>{padding}px</span>
                </div>
                <input type="range" min="0" max="60" value={padding} onChange={e => setPadding(parseInt(e.target.value))} />
              </div>
            </div>
            <div className="slider-row">
              <div style={{ width: '18px', height: '18px', border: '2px solid var(--pc-text-muted)', borderRadius: '6px' }} className="slider-icon" />
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--pc-text-muted)', marginBottom: '4px' }}>
                  <span>Corner Radius</span>
                  <span>{radius}px</span>
                </div>
                <input type="range" min="0" max="60" value={radius} onChange={e => setRadius(parseInt(e.target.value))} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
