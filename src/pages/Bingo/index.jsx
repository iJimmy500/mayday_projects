import React, { useState, useEffect } from 'react';
import { Flower } from 'lucide-react';
import './Bingo.css';
import {
  DEFAULT_ITEMS,
  ALPHABET,
  COLOR_THEMES,
  generateCard
} from './constants';
import BingoGrid from './components/BingoGrid';
import Customizer from './components/Customizer';
import WinModal from './components/WinModal';

export default function Bingo() {
  const [title, setTitle] = useState("Mayday Bingo");
  const [customInput, setCustomInput] = useState(() => {
    return DEFAULT_ITEMS.slice(0, 24).join('\n');
  });
  const [mode, setMode] = useState('play');
  const [selectedTheme, setSelectedTheme] = useState('mono');
  const [selectedStyle, setSelectedStyle] = useState('classic');
  const [selectedPattern, setSelectedPattern] = useState('solid');
  const [gridSize, setGridSize] = useState(5);

  const [board, setBoard] = useState([]);
  const [marked, setMarked] = useState(new Set());
  const [won, setWon] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const parseHashParams = () => {
    const hash = window.location.hash.substring(1);
    if (!hash) return null;

    const params = new URLSearchParams(hash);
    const b = params.get('b');
    const t = params.get('t');
    const th = params.get('th');
    const s = params.get('s');
    const p = params.get('p');
    const sz = params.get('sz');

    return { b, t, th, s, p, sz: sz ? parseInt(sz, 10) : null };
  };

  useEffect(() => {
    const sharedData = parseHashParams();
    let finalSize = 5;
    if (sharedData) {
      if (sharedData.t) setTitle(decodeURIComponent(sharedData.t));
      if (sharedData.th) setSelectedTheme(sharedData.th);
      if (sharedData.s) setSelectedStyle(sharedData.s);
      if (sharedData.p) setSelectedPattern(sharedData.p);
      if (sharedData.sz) {
        setGridSize(sharedData.sz);
        finalSize = sharedData.sz;
      }

      const newBoard = generateCard(customInput, sharedData.b, finalSize);
      setBoard(newBoard);
    } else {
      setBoard(generateCard(customInput, null, gridSize));
    }

    const mid = Math.floor(finalSize / 2);
    if (finalSize % 2 === 1) {
      setMarked(new Set([`${mid}-${mid}`]));
    } else {
      setMarked(new Set());
    }
  }, []);

  // Intelligently resize the default items list when grid size changes
  // but only if the user hasn't typed a custom list
  useEffect(() => {
    const isOdd = gridSize % 2 === 1;
    const neededCount = isOdd ? (gridSize * gridSize) - 1 : (gridSize * gridSize);

    const currentLines = customInput.split('\n').map(i => i.trim()).filter(i => i.length > 0);
    const isUsingDefaults = currentLines.every((line, idx) => line === DEFAULT_ITEMS[idx]);

    if (isUsingDefaults) {
      setCustomInput(DEFAULT_ITEMS.slice(0, neededCount).join('\n'));
    }
  }, [gridSize]);

  const handleApply = () => {
    setBoard(generateCard(customInput, null, gridSize));

    const mid = Math.floor(gridSize / 2);
    if (gridSize % 2 === 1) {
      setMarked(new Set([`${mid}-${mid}`]));
    } else {
      setMarked(new Set());
    }

    setWon(false);
    setShowWinModal(false);
    setMode('play');
    window.location.hash = '';
  };

  const toggleMark = (row, col) => {
    const isOdd = gridSize % 2 === 1;
    const mid = Math.floor(gridSize / 2);
    if (isOdd && row === mid && col === mid) return;

    const key = `${row}-${col}`;
    const newMarked = new Set(marked);

    if (newMarked.has(key)) {
      newMarked.delete(key);
    } else {
      newMarked.add(key);
    }

    setMarked(newMarked);
    checkWin(newMarked);
  };

  const checkWin = (currentMarked) => {
    let hasWon = false;

    for (let i = 0; i < gridSize; i++) {
      let rowWin = true;
      for (let j = 0; j < gridSize; j++) {
        if (!currentMarked.has(`${i}-${j}`)) rowWin = false;
      }
      if (rowWin) hasWon = true;
    }

    for (let j = 0; j < gridSize; j++) {
      let colWin = true;
      for (let i = 0; i < gridSize; i++) {
        if (!currentMarked.has(`${i}-${j}`)) colWin = false;
      }
      if (colWin) hasWon = true;
    }

    let diag1Win = true;
    let diag2Win = true;
    for (let i = 0; i < gridSize; i++) {
      if (!currentMarked.has(`${i}-${i}`)) diag1Win = false;
      if (!currentMarked.has(`${i}-${gridSize - 1 - i}`)) diag2Win = false;
    }
    if (diag1Win || diag2Win) hasWon = true;

    if (hasWon && !won) {
      setShowWinModal(true);
    }
    setWon(hasWon);
  };

  const resetBoard = () => {
    setBoard(generateCard(customInput, null, gridSize));
    const mid = Math.floor(gridSize / 2);
    if (gridSize % 2 === 1) {
      setMarked(new Set([`${mid}-${mid}`]));
    } else {
      setMarked(new Set());
    }
    setWon(false);
    setShowWinModal(false);
    window.location.hash = '';
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const flatItems = [];
    const isOdd = gridSize % 2 === 1;
    const mid = Math.floor(gridSize / 2);

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (!(isOdd && r === mid && c === mid)) {
          flatItems.push(board[r][c]);
        }
      }
    }

    const encodedLayout = flatItems.map(item => {
      const idx = DEFAULT_ITEMS.indexOf(item.text);
      return idx !== -1 ? ALPHABET[idx] : 'A';
    }).join('');

    const params = new URLSearchParams();
    params.set('b', encodedLayout);
    params.set('t', title);
    params.set('th', selectedTheme);
    params.set('s', selectedStyle);
    params.set('p', selectedPattern);
    params.set('sz', gridSize);

    const shareUrl = `${window.location.origin}${window.location.pathname}#${params.toString()}`;

    navigator.clipboard.writeText(shareUrl).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    });
  };

  const currentCount = customInput.split('\n').map(i => i.trim()).filter(i => i.length > 0).length;
  const isOdd = gridSize % 2 === 1;
  const neededCount = isOdd ? (gridSize * gridSize) - 1 : (gridSize * gridSize);

  const activeTheme = COLOR_THEMES.find(t => t.id === selectedTheme) || COLOR_THEMES[0];

  return (
    <div className={`bingo-container theme-${selectedTheme} pattern-${selectedPattern} style-${selectedStyle}`} style={{
      '--accent-color': activeTheme.accent,
      '--cell-bg': activeTheme.cellBg
    }}>
      <div className="bingo-header no-print">
        <h1>{title || "Bingo"}</h1>
        <div className="bingo-tabs">
          <button className={mode === 'play' ? 'active' : ''} onClick={() => setMode('play')}>Play</button>
          <button className={mode === 'customize' ? 'active' : ''} onClick={() => setMode('customize')}>Customize</button>
        </div>
      </div>

      {mode === 'play' ? (
        <div className="bingo-board-wrapper">
          <div className="bingo-board">
            <div className="print-title">{title}</div>
            <BingoGrid
              board={board}
              gridSize={gridSize}
              marked={marked}
              selectedStyle={selectedStyle}
              toggleMark={toggleMark}
            />
          </div>

          <div className="bingo-actions no-print">
            <button className="bingo-reset" onClick={resetBoard}>New Card</button>
            <button className="bingo-print" onClick={handlePrint}>Print</button>
            <button className="bingo-share" onClick={handleShare}>
              {shareCopied ? "Link Copied!" : "Share"}
            </button>
          </div>
        </div>
      ) : (
        <Customizer
          title={title}
          setTitle={setTitle}
          gridSize={gridSize}
          setGridSize={setGridSize}
          selectedStyle={selectedStyle}
          setSelectedStyle={setSelectedStyle}
          selectedTheme={selectedTheme}
          setSelectedTheme={setSelectedTheme}
          selectedPattern={selectedPattern}
          setSelectedPattern={setSelectedPattern}
          customInput={customInput}
          setCustomInput={setCustomInput}
          currentCount={currentCount}
          neededCount={neededCount}
          handleApply={handleApply}
        />
      )}

      <WinModal
        showWinModal={showWinModal}
        setShowWinModal={setShowWinModal}
        resetBoard={resetBoard}
      />
      
      <a href="https://mayinflight.com" className="footer-link no-print" target="_blank" rel="noopener noreferrer">mayday <Flower size={14} strokeWidth={1.5} /></a>
    </div>
  );
}
