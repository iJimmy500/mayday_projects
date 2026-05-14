import React from 'react';
import { Image as ImageIcon } from 'lucide-react';

export default function AuraCanvas({ 
  ratio, 
  bgColor, 
  padding, 
  gap, 
  radius, 
  activeLayout, 
  images, 
  onCellClick 
}) {
  return (
    <div className="aura-canvas-wrapper" style={{ 
      aspectRatio: ratio,
      height: '100%',
      maxHeight: '70vh',
      background: bgColor,
      padding: `${padding}px`,
      borderRadius: '16px'
    }}>
      <div className={`aura-grid-container layout-${activeLayout.id} type-${activeLayout.type || 'grid'}`} style={{ 
        gap: activeLayout.type === 'scattered' ? '0' : `${gap}px`,
        gridTemplateColumns: activeLayout.cols,
        gridTemplateRows: activeLayout.rows
      }}>
        {Array.from({ length: activeLayout.slots }).map((_, i) => (
          <div 
            key={i} 
            className={`aura-cell slot-${i}`} 
            style={{ 
              borderRadius: radius > 0 ? `${radius}px` : '0',
              background: images[i] ? 'transparent' : 'rgba(0,0,0,0.05)',
              ...(activeLayout.spans && activeLayout.spans[i] ? activeLayout.spans[i] : {})
            }}
            onClick={() => onCellClick(i)}
          >
            {images[i] ? (
              <img src={images[i]} alt="slot" />
            ) : (
              <div className="aura-cell-placeholder">
                <ImageIcon size={24} strokeWidth={1.5} />
                <span>Tap to add</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
