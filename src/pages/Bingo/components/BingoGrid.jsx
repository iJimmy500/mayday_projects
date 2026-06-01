import React from 'react';

export default function BingoGrid({ board, gridSize, marked, selectedStyle, toggleMark }) {
  const isOdd = gridSize % 2 === 1;
  const mid = Math.floor(gridSize / 2);

  return (
    <div className={`bingo-grid grid-size-${gridSize}`} style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
      {board.map((row, rowIndex) => (
        row.map((cell, colIndex) => {
          const isMarked = marked.has(`${rowIndex}-${colIndex}`);
          const isFree = isOdd && rowIndex === mid && colIndex === mid;
          const isLastCol = colIndex === gridSize - 1;
          const isLastRow = rowIndex === gridSize - 1;
          return (
            <button
              key={`${rowIndex}-${colIndex}`}
              className={`bingo-cell ${isMarked ? 'marked' : ''} ${isFree ? 'free-space' : ''} ${isLastCol ? 'cell-last-col' : ''} ${isLastRow ? 'cell-last-row' : ''}`}
              onClick={() => toggleMark(rowIndex, colIndex)}
            >
              <div className="cell-inner">
                {cell.imageUrl && (
                  <div className="cell-visual">
                    <img src={cell.imageUrl} alt={cell.text} />
                  </div>
                )}
                <span className="cell-text">{cell.text}</span>
              </div>
            </button>
          );
        })
      ))}
    </div>
  );
}
