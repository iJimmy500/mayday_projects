import { useState, useEffect, useRef } from 'react';
import { Flower, RefreshCw, Timer, AlignLeft, ChevronDown, Check, Skull, Ghost, Trophy, Zap, Hash, Layers, Flame } from 'lucide-react';
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
  const [zenMode, setZenMode] = useState(false);
  const [isRandomVowels, setIsRandomVowels] = useState(false);
  const [isRandomLength, setIsRandomLength] = useState(false);
  const [isGhost, setIsGhost] = useState(false);
  const [isSuddenDeath, setIsSuddenDeath] = useState(false);
  const [isProgressive, setIsProgressive] = useState(false);
  const [isHardcore, setIsHardcore] = useState(false);
  const [level, setLevel] = useState(1);
  const [wordsToLevel, setWordsToLevel] = useState(3);
  const [lettersVisible, setLettersVisible] = useState(true);
  const [requiredLength, setRequiredLength] = useState(0); 
  const [pb, setPb] = useState({ wpm: 0, words: 0 });

  // Dropdown States
  const [activeMenu, setActiveMenu] = useState(null); // 'mode', 'vowels', 'time'

  const audioCtx = useRef(null);
  const inputRef = useRef(null);

  const playSound = (type) => {
    if (!audioCtx.current) audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.current.createOscillator();
    const gain = audioCtx.current.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.current.destination);

    if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, audioCtx.current.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.current.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, audioCtx.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.current.currentTime + 0.1);
      osc.start();
      osc.stop(audioCtx.current.currentTime + 0.1);
    } else if (type === 'error') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, audioCtx.current.currentTime);
      gain.gain.setValueAtTime(0.05, audioCtx.current.currentTime);
      gain.gain.linearRampToValueAtTime(0, audioCtx.current.currentTime + 0.1);
      osc.start();
      osc.stop(audioCtx.current.currentTime + 0.1);
    } else if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, audioCtx.current.currentTime);
      gain.gain.setValueAtTime(0.02, audioCtx.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.current.currentTime + 0.05);
      osc.start();
      osc.stop(audioCtx.current.currentTime + 0.05);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('vowelism_pb');
    if (saved) setPb(JSON.parse(saved));

    fetch('/txtFiles/words.txt')
      .then(r => r.text())
      .then(text => {
        const words = text.split('\n').map(w => w.trim().toLowerCase()).filter(w => w.length > 1);
        setDictionary(new Set(words));
        setLoading(false);
      });

    const handleKeyDown = (e) => {
      if (e.key.toLowerCase() === 's' && e.altKey) {
        newGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const handleClickOutside = () => setActiveMenu(null);
    window.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('click', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!loading) newGame();
  }, [mode, loading]);

  useEffect(() => {
    if ((!timedMode && !isSuddenDeath) || !started || finished) return;
    if (timeLeft <= 0) { 
      setFinished(true); 
      return; 
    }
    const t = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [timedMode, started, finished, timeLeft]);

  useEffect(() => {
    if (isGhost && started && !finished) {
      const t = setTimeout(() => setLettersVisible(false), 10000);
      return () => clearTimeout(t);
    } else {
      setLettersVisible(true);
    }
  }, [isGhost, started, finished, vowels, consonants]);

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

  const newGame = (countOverride) => {
    const activeVowelCount = countOverride !== undefined ? countOverride : (isRandomVowels ? Math.floor(Math.random() * 4) + 1 : vowelCount);
    setVowels(weightedPick(VOWELS, activeVowelCount));
    
    if (isRandomLength) {
      setRequiredLength(Math.floor(Math.random() * 5) + 3); // 3-7
    }

    if (mode === 'avoidance') {
      const common = ['E', 'A', 'T', 'O', 'I', 'N', 'S', 'R', 'H', 'L'];
      const picked = [];
      const pool = [...common];
      for (let i = 0; i < 3; i++) {
        const idx = Math.floor(Math.random() * pool.length);
        picked.push(pool[idx]);
        pool.splice(idx, 1);
      }
      setConsonants(picked);
      setVowels([]);
    } else if (mode === 'anagrams') {
      setConsonants(weightedPick(CONSONANTS, 4));
    } else if (mode === 'consonants') {
      setConsonants(weightedPick(CONSONANTS, 3));
      setVowels([]);
    } else {
      setConsonants([]);
    }

    setFoundWords([]);
    setInputValue('');
    setMessage({ text: '', type: '' });
    setStarted(false);
    setFinished(false);
    setLettersVisible(true);
    setTimeLeft(isSuddenDeath ? (timeLimit || 15) : timeLimit);
    inputRef.current?.focus();
    playSound('click');
  };

  const validate = (word) => {
    const up = word.toUpperCase();
    
    if (mode === 'avoidance') {
      return !consonants.some(c => up.includes(c));
    }

    if (requiredLength > 0 && word.length !== requiredLength) return false;
    
    if (mode === 'vowels') return vowels.every(v => up.includes(v));
    if (mode === 'consonants') return consonants.every(c => up.includes(c));
    
    const pool = [...vowels, ...consonants];
    for (const ch of up.split('')) {
      const idx = pool.indexOf(ch);
      if (idx === -1) return false;
      pool.splice(idx, 1);
    }
    return true;
  };

  const startProgressive = () => {
    setLevel(1);
    setWordsToLevel(3);
    setVowelCount(1);
    setRequiredLength(0);
    setIsRandomVowels(false);
    newGame(1);
  };

  const updatePb = (currentWords, currentWpm) => {
    const newPb = {
      words: Math.max(pb.words, currentWords),
      wpm: Math.max(pb.wpm, currentWpm)
    };
    setPb(newPb);
    localStorage.setItem('vowelism_pb', JSON.stringify(newPb));
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 1800);
  };

  const handlePenalty = () => {
    if (isSuddenDeath) {
      setTimeLeft(p => Math.max(0, p - 3));
      showMessage('-3s!', 'error');
    }
    if (isHardcore) {
      if (isProgressive) {
        startProgressive();
        showMessage('PROGRESS RESET!', 'error');
      } else {
        setFoundWords([]);
        showMessage('RESET!', 'error');
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const word = inputValue.trim().toLowerCase();
    if (!word || finished) return;
    
    if (word === 'debug') {
      setFinished(true);
      return;
    }

    if (!started) setStarted(true);
    
    if (foundWords.includes(word)) { 
      showMessage('already found', 'error'); 
      playSound('error');
      handlePenalty();
      return; 
    }
    
    if (!validate(word)) { 
      let msg = 'invalid letters';
      if (mode === 'avoidance') msg = 'used forbidden letter';
      else if (requiredLength > 0 && word.length !== requiredLength) msg = `must be ${requiredLength} letters`;
      else if (mode === 'vowels') msg = 'missing required vowels';
      else if (mode === 'consonants') msg = 'missing required consonants';
      
      showMessage(msg, 'error'); 
      playSound('error');
      handlePenalty();
      return; 
    }

    if (dictionary.has(word)) {
      setFoundWords(p => [word, ...p]);
      setInputValue('');
      playSound('success');
      triggerPop();

      if (isSuddenDeath) {
        setTimeLeft(p => Math.min(p + 5, 30));
        showMessage('+5s!', 'success');
      } else {
        showMessage('found!', 'success');
      }

      if (isProgressive) {
        const nextWords = foundWords.length + 1;
        if (nextWords >= wordsToLevel) {
          // Level Up Logic
          if (vowelCount < 5) {
            setVowelCount(p => p + 1);
          } else {
            setRequiredLength(p => (p === 0 ? 4 : p + 1));
          }
          setWordsToLevel(p => p + 2);
          setLevel(p => p + 1);
          showMessage(`LEVEL ${level + 1}!`, 'success');
          // Regenerate letters for next level
          setVowels(weightedPick(VOWELS, Math.min(vowelCount + (vowelCount < 5 ? 1 : 0), 5)));
          setLettersVisible(true);
        }
      }
    } else {
      showMessage('not a word', 'error');
      playSound('error');
      handlePenalty();
    }
  };

  const Dropdown = ({ id, label, value, options, onSelect, icon: Icon }) => (
    <div className="vow-dropdown-wrap" onClick={e => e.stopPropagation()}>
      <button className={`vow-nav-btn ${activeMenu === id ? 'active' : ''}`} onClick={() => setActiveMenu(activeMenu === id ? null : id)}>
        {Icon && <Icon size={14} />}
        <span className="vow-nav-value">{value}</span> 
        <ChevronDown size={10} className={activeMenu === id ? 'rotated' : ''} />
      </button>
      {activeMenu === id && (
        <div className="vow-dropdown-menu">
          {options.map(opt => (
            <div key={opt.val} className={`vow-dropdown-item ${value === (opt.label || opt.val) ? 'selected' : ''}`} onClick={() => { onSelect(opt.val); setActiveMenu(null); }}>
              {opt.label || opt.val} {(value === (opt.label || opt.val)) && <Check size={10} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  useEffect(() => {
    if (finished) {
      const finalWpm = Math.round((foundWords.join('').length / 5) / (Math.max(timeLimit, 15) / 60));
      updatePb(foundWords.length, finalWpm);
    }
  }, [finished]);

  return (
    <div className={`vow-theme ${zenMode ? 'zen-active' : ''} ${!lettersVisible ? 'ghost-hidden' : ''}`}>
      <main className="vow-main" onClick={() => inputRef.current?.focus()}>

        <div className="vow-top-bar">
          <div className="vow-nav">
            <div className="vow-nav-group">
              <Dropdown 
                id="mode" 
                label="mode" 
                value={mode} 
                icon={AlignLeft}
                options={[
                  {val: 'vowels', label: 'vowels'}, 
                  {val: 'anagrams', label: 'anagrams'},
                  {val: 'consonants', label: 'consonants'},
                  {val: 'avoidance', label: 'avoidance'}
                ]} 
                onSelect={setMode} 
              />
              <Dropdown 
                id="vowels" 
                label="difficulty" 
                icon={Layers}
                value={isRandomVowels ? '?' : `${vowelCount}v`} 
                options={[
                  {val: 1, label: '1v'}, {val: 2, label: '2v'}, {val: 3, label: '3v'}, 
                  {val: 4, label: '4v'}, {val: 5, label: '5v'}
                ]} 
                onSelect={(val) => { setIsRandomVowels(false); setVowelCount(val); newGame(val); }} 
              />
              <button 
                className={`vow-lock-btn ${isRandomVowels ? '' : 'locked'}`} 
                onClick={() => setIsRandomVowels(!isRandomVowels)}
                title={isRandomVowels ? "Unlock Vowel Count" : "Lock Vowel Count"}
              >
                {isRandomVowels ? <RefreshCw size={10} /> : <Check size={10} />}
              </button>
              <Dropdown 
                id="length" 
                label="length" 
                icon={Hash}
                value={isRandomLength ? '?' : (requiredLength === 0 ? 'any' : `${requiredLength}L`)} 
                options={[
                  {val: 0, label: 'any'},
                  {val: 'random', label: 'random'},
                  ...[3,4,5,6,7,8].map(l => ({val: l, label: `${l}L`}))
                ]} 
                onSelect={(val) => {
                  if (val === 'random') setIsRandomLength(true);
                  else { setIsRandomLength(false); setRequiredLength(val); }
                }} 
              />
              <Dropdown 
                id="time" 
                label="timer" 
                icon={Timer}
                value={zenMode ? 'zen' : (timedMode ? `${timeLimit}s` : 'off')} 
                options={[
                  {val: 'zen', label: 'zen'},
                  {val: 0, label: 'off'},
                  {val: 15, label: '15s'},
                  {val: 30, label: '30s'},
                  {val: 60, label: '60s'}
                ]} 
                onSelect={val => {
                  if (val === 'zen') { setZenMode(true); setTimedMode(false); }
                  else if (val === 0) { setZenMode(false); setTimedMode(false); }
                  else { setZenMode(false); setTimedMode(true); setTimeLimit(val); setTimeLeft(val); }
                }} 
              />
            </div>
          </div>

          <div className="vow-nav-tools">
            <div className="vow-challenge-group">
              <button 
                className={`vow-tool-btn ${isProgressive ? 'active' : ''}`} 
                onClick={() => { 
                  if (!isProgressive) {
                    setIsProgressive(true);
                    startProgressive();
                  } else {
                    setIsProgressive(false);
                    newGame();
                  }
                }}
                title="Progressive Mode"
              >
                <Trophy size={14} />
              </button>
              <button 
                className={`vow-tool-btn ${isHardcore ? 'active' : ''}`} 
                onClick={() => {
                  setIsHardcore(!isHardcore);
                  if (!isHardcore) {
                    if (isProgressive) startProgressive();
                    else setFoundWords([]);
                  }
                }}
                title="Hardcore Mode"
              >
                <Flame size={14} />
              </button>
              <button 
                className={`vow-tool-btn ${isGhost ? 'active' : ''}`} 
                onClick={() => setIsGhost(!isGhost)}
                title="Ghost Mode"
              >
                <Ghost size={14} />
              </button>
              <button 
                className={`vow-tool-btn ${isSuddenDeath ? 'active' : ''}`} 
                onClick={() => { setIsSuddenDeath(!isSuddenDeath); setTimedMode(!isSuddenDeath); }}
                title="Sudden Death"
              >
                <Skull size={14} />
              </button>
            </div>
            <button className="vow-tool-btn" onClick={newGame} title="New Game (Alt+S)">
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        <div className="vow-header">
          <div className="vow-live-stats">
            {isProgressive && <span className="vow-level-val">LVL {level}</span>}
            {(timedMode || isSuddenDeath) && (
              <span className={`vow-timer-val ${timeLeft < 10 ? 'urgent' : ''}`}>
                {timeLeft}s
              </span>
            )}
            <span className="vow-count-val">{foundWords.length} words</span>
            {(timedMode || isSuddenDeath) && started && !finished && (
              <span className="vow-wpm-val">
                {timeLimit - timeLeft > 0 ? Math.round((foundWords.join('').length / 5) / ((timeLimit - timeLeft) / 60)) : 0} wpm
              </span>
            )}
          </div>
        </div>

        <div className={`vow-letters-area ${!lettersVisible ? 'fade-out' : ''}`}>
          {[...vowels, ...consonants].map((l, i) => (
            <span 
              key={`${l}-${i}`} 
              className={`vow-tile ${vowels.includes(l) ? 'vowel' : 'consonant'} ${mode === 'avoidance' ? 'forbidden' : ''}`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {l}
            </span>
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
                  {pb.words === foundWords.length && foundWords.length > 0 && <span className="best-tag">PB</span>}
                </div>
                {(timedMode || isSuddenDeath) && (
                  <div className="vow-result-item">
                    <span className="label">wpm</span>
                    <span className="value">{Math.round((foundWords.join('').length / 5) / (Math.max(timeLimit, 15) / 60))}</span>
                    {pb.wpm === Math.round((foundWords.join('').length / 5) / (Math.max(timeLimit, 15) / 60)) && pb.wpm > 0 && <span className="best-tag">PB</span>}
                  </div>
                )}
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
