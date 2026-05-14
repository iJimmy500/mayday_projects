import React from 'react';
import { Image as ImageIcon, Layout as LayoutIconPlaceholder, Palette, Sliders } from 'lucide-react';

export default function AuraTabBar({ activeTab, setActiveTab }) {
  return (
    <div className="aura-tab-bar">
      <button 
        className={`tab-btn ${activeTab === 'images' ? 'active' : ''}`} 
        onClick={() => setActiveTab('images')}
      >
        <ImageIcon size={22} strokeWidth={2} />
        <span>Images</span>
      </button>
      <button 
        className={`tab-btn ${activeTab === 'layout' ? 'active' : ''}`} 
        onClick={() => setActiveTab('layout')}
      >
        <LayoutIconPlaceholder size={22} strokeWidth={2} />
        <span>Layout</span>
      </button>
      <button 
        className={`tab-btn ${activeTab === 'background' ? 'active' : ''}`} 
        onClick={() => setActiveTab('background')}
      >
        <Palette size={22} strokeWidth={2} />
        <span>Background</span>
      </button>
      <button 
        className={`tab-btn ${activeTab === 'format' ? 'active' : ''}`} 
        onClick={() => setActiveTab('format')}
      >
        <Sliders size={22} strokeWidth={2} />
        <span>Format</span>
      </button>
    </div>
  );
}
