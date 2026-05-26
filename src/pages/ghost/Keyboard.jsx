import { ALPHA_ROWS } from './constants';

export default function Keyboard({ word, guessed, onGuess }) {
  return (
    <div className="gh-keyboard">
      {ALPHA_ROWS.map((row, ri) => (
        <div className="gh-kb-row" key={ri}>
          {[...row].map(letter => {
            const used = guessed.has(letter);
            const hit  = used && word.includes(letter);
            const miss = used && !word.includes(letter);
            return (
              <button
                key={letter}
                className={`gh-key${hit ? ' hit' : ''}${miss ? ' miss' : ''}`}
                disabled={used}
                onClick={() => onGuess(letter)}
              >
                {letter}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
