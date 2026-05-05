import { useState, useEffect, useRef } from 'react';
import { Flower, RefreshCw, Timer, AlignLeft, ChevronDown, Check } from 'lucide-react';
import './Vowelism.css';

const VOWELS = [
  { letter: 'E', weight: 40 }, { letter: 'A', weight: 30 },
  { letter: 'I', weight: 25 }, { letter: 'O', weight: 20 }, { letter: 'U', weight: 10 }
];
const CONSONANTS = [
  { letter: 'R', weight: 40 }, { letter: 'T', weight: 35 }, { letter: 'N', weight: 35 },
  { letter: 'S', weight: 30 }, { letter: 'L', weight: 25 }, { letter: 'C', weight: 20 },
  { letter: 'D', weight: 20 }, { letter: 'P', weight: 15 }, { letter: 'M', weight: 15 },
  { letter: 'H', weight: 15 }, { letter: 'G', weight: 10 }, { letter: 'B', weight: 10 },
  { letter: 'F', weight: 10 }, { letter: 'Y', weight: 10 }, { letter: 'W', weight: 8 },
  { letter: 'K', weight: 5 },  { letter: 'V', weight: 5 },  { letter: 'X', weight: 2 },
  { letter: 'Z', weight: 2 },  { letter: 'J', weight: 2 },  { letter: 'Q', weight: 1 }
];

export default function Vowelism() {
  const [mode, setMode] = useState('vowels');
  const [vowelCount, setVowelCount] = useState(2);
  const [timedMode, setTimedMode] = useState(false);
  const [timeLimit, setTimeLimit] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);

  const [vowels, setVowels] = useState([]);
  const [consonants, setConsonants] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [dictionary, setDictionary] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);

  // Dropdown States
  const [activeMenu, setActiveMenu] = useState(null); // 'mode', 'vowels', 'time'

  const inputRef = useRef(null);

  useEffect(() => {
    fetch('/txtFiles/words.txt')
      .then(r => r.text())
      .then(text => {
        const words = text.split('\n').map(w => w.trim().toLowerCase()).filter(w => w.length > 1);
        setDictionary(new Set(words));
        setLoading(false);
      });

    const handleClickOutside = () => setActiveMenu(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!loading) newGame();
  }, [mode, vowelCount, loading]);

  useEffect(() => {
    if (!timedMode || !started || finished) return;
    if (timeLeft <= 0) { setFinished(true); return; }
    const t = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [timedMode, started, finished, timeLeft]);

  const weightedPick = (items, count) => {
    const pool = [...items];
    const result = [];
    for (let i = 0; i < count; i++) {
      const total = pool.reduce((s, x) => s + x.weight, 0);
      let r = Math.random() * total;
      for (let j = 0; j < pool.length; j++) {
        r -= pool[j].weight;
        if (r <= 0) { result.push(pool[j].letter); pool.splice(j, 1); break; }
      }
    }
    return result;
  };

  const newGame = () => {
    setVowels(weightedPick(VOWELS, vowelCount));
    setConsonants(mode === 'anagrams' ? weightedPick(CONSONANTS, 4) : []);
    setFoundWords([]);
    setInputValue('');
    setMessage({ text: '', type: '' });
    setStarted(false);
    setFinished(false);
    setTimeLeft(timeLimit);
    inputRef.current?.focus();
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 1800);
  };

  const validate = (word) => {
    const up = word.toUpperCase();
    if (mode === 'vowels') return vowels.every(v => up.includes(v));
    const pool = [...vowels, ...consonants];
    for (const ch of up.split('')) {
      const idx = pool.indexOf(ch);
      if (idx === -1) return false;
      pool.splice(idx, 1);
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const word = inputValue.trim().toLowerCase();
    if (!word || finished) return;
    if (!started) setStarted(true);
    if (foundWords.includes(word)) { showMessage('already found', 'error'); return; }
    if (!validate(word)) { showMessage(mode === 'vowels' ? 'missing required vowels' : 'invalid letters', 'error'); return; }
    if (dictionary.has(word)) {
      setFoundWords(p => [word, ...p]);
      setInputValue('');
      showMessage('found!', 'success');
    } else {
      showMessage('not a word', 'error');
    }
  };

  const Dropdown = ({ id, label, value, options, onSelect }) => (
    <div className="vow-dropdown-wrap" onClick={e => e.stopPropagation()}>
      <button className={`vow-nav-btn ${activeMenu === id ? 'active' : ''}`} onClick={() => setActiveMenu(activeMenu === id ? null : id)}>
        {label}: <span>{value}</span> <ChevronDown size={12} className={activeMenu === id ? 'rotated' : ''} />
      </button>
      {activeMenu === id && (
        <div className="vow-dropdown-menu">
          {options.map(opt => (
            <div key={opt.val} className={`vow-dropdown-item ${value === opt.label ? 'selected' : ''}`} onClick={() => { onSelect(opt.val); setActiveMenu(null); }}>
              {opt.label} {value === opt.label && <Check size={12} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="vow-theme">
      <main className="vow-main" onClick={() => inputRef.current?.focus()}>

        <div className="vow-nav">
          <Dropdown 
            id="mode" 
            label="mode" 
            value={mode} 
            options={[{val: 'vowels', label: 'vowels'}, {val: 'anagrams', label: 'anagrams'}]} 
            onSelect={setMode} 
          />
          <div className="vow-divider" />
          <Dropdown 
            id="vowels" 
            label="difficulty" 
            value={`${vowelCount}v`} 
            options={[1,2,3,4,5].map(v => ({val: v, label: `${v}v`}))} 
            onSelect={setVowelCount} 
          />
          <div className="vow-divider" />
          <Dropdown 
            id="time" 
            label="timer" 
            value={timedMode ? `${timeLimit}s` : 'off'} 
            options={[
              {val: 0, label: 'off'},
              {val: 15, label: '15s'},
              {val: 30, label: '30s'},
              {val: 60, label: '60s'},
              {val: 120, label: '120s'}
            ]} 
            onSelect={val => {
              if (val === 0) setTimedMode(false);
              else { setTimedMode(true); setTimeLimit(val); setTimeLeft(val); }
            }} 
          />
          <div className="vow-divider" />
          <button className="vow-nav-btn" onClick={newGame}><RefreshCw size={14} /></button>
        </div>

        <div className="vow-header">
          <div className="vow-live-stats">
            {timedMode && <span className="vow-timer-val">{timeLeft}s</span>}
            <span className="vow-count-val">{foundWords.length} words</span>
          </div>
        </div>

        <div className="vow-letters-area">
          {[...vowels, ...consonants].map((l, i) => (
            <span key={i} className={`vow-tile ${vowels.includes(l) ? 'vowel' : 'consonant'}`}>{l}</span>
          ))}
        </div>

        <form className="vow-form" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            className="vow-input"
            value={inputValue}
            onChange={e => setInputValue(e.target.value.toLowerCase())}
            placeholder="..."
            disabled={loading || finished}
            autoFocus
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
        </form>

        {message.text && (
          <div className={`vow-message ${message.type}`}>{message.text}</div>
        )}

        <div className="vow-found-area">
          {foundWords.map((w, i) => (
            <span key={i} className="vow-found-word">{w}</span>
          ))}
          {foundWords.length === 0 && !finished && (
            <span className="vow-found-empty">ready.</span>
          )}
        </div>

        {finished && (
          <div className="vow-result-overlay">
            <div className="vow-result-box">
              <div className="vow-result-stats">
                <div className="vow-result-item">
                  <span className="label">words</span>
                  <span className="value">{foundWords.length}</span>
                </div>
              </div>

              <div className="vow-result-words">
                {foundWords.map((w, i) => (
                  <span key={i} className="vow-result-word">{w}</span>
                ))}
              </div>

              <button className="vow-retry-btn" onClick={newGame}>RETRY</button>
            </div>
          </div>
        )}
      </main>

      <footer className="page-footer">
        <a href="https://mayinflight.com" className="footer-link" target="_blank" rel="noopener noreferrer">
          mayday <Flower size={14} strokeWidth={1.5} />
        </a>
      </footer>
    </div>
  );
}
