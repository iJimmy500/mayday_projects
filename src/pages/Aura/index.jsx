import { useState, useRef } from 'react';
import { toPng } from 'html-to-image';
import './AuraLayout.css';

// Sub-components
import AuraHeader from './AuraHeader';
import AuraCanvas from './AuraCanvas';
import AuraToolbar from './AuraToolbar';
import AuraTabBar from './AuraTabBar';

// Constants
import { LAYOUTS, RATIOS, COLORS, GRADIENTS } from './constants';

export default function AuraLayout() {
  const [activeLayout, setActiveLayout] = useState(LAYOUTS[7]);
  const [customGrid, setCustomGrid] = useState({ cols: '3', rows: '3' });
  const [activeTab, setActiveTab] = useState('images');
  const [images, setImages] = useState({});
  const [library, setLibrary] = useState([]);
  const [activeLibraryImage, setActiveLibraryImage] = useState(null);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [gap, setGap] = useState(10);
  const [padding, setPadding] = useState(10);
  const [radius, setRadius] = useState(12);
  const [ratio, setRatio] = useState('9 / 16');
  
  const fileInputRef = useRef(null);
  const bulkInputRef = useRef(null);
  const [activeSlot, setActiveSlot] = useState(null);

  const handleImageUpload = (slotIndex, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImages(prev => ({ ...prev, [slotIndex]: e.target.result }));
        setLibrary(prev => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBulkUpload = (files) => {
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLibrary(prev => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const autoFill = () => {
    const newImages = { ...images };
    let libIdx = 0;
    for (let i = 0; i < activeLayout.slots; i++) {
      if (!newImages[i] && libIdx < library.length) {
        newImages[i] = library[libIdx];
        libIdx++;
      }
    }
    setImages(newImages);
  };

  const shuffleImages = () => {
    const currentImages = Object.values(images);
    if (currentImages.length < 2) return;
    const shuffled = [...currentImages];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const newImagesObj = {};
    Object.keys(images).forEach((key, idx) => {
      newImagesObj[key] = shuffled[idx];
    });
    setImages(newImagesObj);
  };

  const clearAll = () => {
    if (window.confirm('Clear all photos?')) setImages({});
  };

  const handleExport = () => {
    const node = document.querySelector('.aura-canvas-wrapper');
    if (node) {
      toPng(node, { 
        cacheBust: true,
        backgroundColor: bgColor,
        style: { borderRadius: '0' }
      })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `frame-collage-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => console.error('Export failed', err));
    }
  };

  return (
    <div className="aura-container">
      <div className="aura-main-content">
        <AuraHeader 
          shuffleImages={shuffleImages}
          clearAll={clearAll}
          handleExport={handleExport}
        />

        <main className="aura-workspace">
          <AuraCanvas 
            ratio={ratio}
            bgColor={bgColor}
            padding={padding}
            gap={gap}
            radius={radius}
            activeLayout={activeLayout}
            images={images}
            onCellClick={(i) => {
              if (activeLibraryImage) {
                setImages(prev => ({ ...prev, [i]: activeLibraryImage }));
                setActiveLibraryImage(null);
              } else {
                setActiveSlot(i);
                fileInputRef.current?.click();
              }
            }}
          />
        </main>
      </div>

      <div className="aura-bottom-ui">
        <AuraToolbar 
          activeTab={activeTab}
          library={library}
          activeLibraryImage={activeLibraryImage}
          setActiveLibraryImage={setActiveLibraryImage}
          bulkInputRef={bulkInputRef}
          autoFill={autoFill}
          customGrid={customGrid}
          setCustomGrid={setCustomGrid}
          setActiveLayout={setActiveLayout}
          activeLayout={activeLayout}
          LAYOUTS={LAYOUTS}
          COLORS={COLORS}
          GRADIENTS={GRADIENTS}
          setBgColor={setBgColor}
          bgColor={bgColor}
          RATIOS={RATIOS}
          ratio={ratio}
          setRatio={setRatio}
          gap={gap}
          setGap={setGap}
          padding={padding}
          setPadding={setPadding}
          radius={radius}
          setRadius={setRadius}
        />

        <AuraTabBar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={e => handleImageUpload(activeSlot, e.target.files[0])} />
      <input type="file" ref={bulkInputRef} style={{ display: 'none' }} accept="image/*" multiple onChange={e => handleBulkUpload(e.target.files)} />
    </div>
  );
}
