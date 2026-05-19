import React, { useState, useEffect, useRef } from 'react';
import { AlignLeft, ChevronDown, Check, RefreshCw, Timer, Layers, Skull, Trophy, Share2 } from 'lucide-react';
import './Decipher.css';
import DecipherLab from './DecipherLab';

const CIPHER_MODES = [
  { val: 'caesar', label: 'caesar shift' },
  { val: 'atbash', label: 'atbash mirror' },
  { val: 'reverse', label: 'reverse text' },
  { val: 'leet', label: 'leetspeak' },
  { val: 'morse', label: 'morse code' },
  { val: 'keyboard', label: 'keyboard slip' },
  { val: 'binary', label: 'binary bits' },
  { val: 'vigenere', label: 'vigenère key' },
  { val: 'navajo', label: 'navajo talker' },
  { val: 'minionese', label: 'minionese' },
  { val: 'cryptogram', label: 'cryptogram' }
];

const LENGTH_MODES = [
  { val: 'easy', label: 'short (3-5)' },
  { val: 'medium', label: 'medium (6-8)' },
  { val: 'hard', label: 'long (9-12)' },
  { val: 'multi', label: 'multiple words (2-3)' }
];

const TIMER_MODES = [
  { val: 'zen', label: 'zen' },
  { val: 15, label: '15s' },
  { val: 30, label: '30s' },
  { val: 60, label: '60s' }
];

const MORSE_DICT = {
  "A": ".-", "B": "-...", "C": "-.-.", "D": "-..", "E": ".", "F": "..-.", "G": "--.", "H": "....", "I": "..",
  "J": ".---", "K": "-.-", "L": ".-..", "M": "--", "N": "-.", "O": "---", "P": ".--.", "Q": "--.-", "R": ".-.",
  "S": "...", "T": "-", "U": "..-", "V": "...-", "W": ".--", "X": "-..-", "Y": "-.--", "Z": "--..",
  "0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-", "5": ".....", "6": "-....", "7": "--...",
  "8": "---..", "9": "----."
};

const MORSE_DICT_REV = Object.fromEntries(Object.entries(MORSE_DICT).map(([k, v]) => [v, k]));

const NAVAJO_DICT = {
  "A": "WOL-LA-CHEE", "B": "SHUSH", "C": "MOASI", "D": "LHA-CHA-EH", "E": "AH-JAH", "F": "MA-E",
  "G": "KLIZZIE", "H": "LIN", "I": "TKIN", "J": "TKELE-CHO", "K": "KLIZZIE-YAZZIE", "L": "NASH-DOIE-TSO",
  "M": "NA-AS-TSO-SI", "N": "TSAH", "O": "NE-AHS-JAH", "P": "BI-SO-DIH", "Q": "CA-YEILTH", "R": "GAH",
  "S": "DIBEH", "T": "THAN-ZIE", "U": "NO-DA-IH", "V": "A-KEH-DI-GLINI", "W": "GLOE-IH", "X": "AL-NA-AS",
  "Y": "TSAH-AS-ZIH", "Z": "BESH-DO-TLIZ"
};

const MINION_DICT = {
  "A": "BA", "B": "NU", "C": "LA", "D": "PE", "E": "KA", "F": "PO", "G": "TI", "H": "DA", "I": "MI",
  "J": "LU", "K": "MA", "L": "LO", "M": "ME", "N": "NO", "O": "PA", "P": "PI", "Q": "QU", "R": "RA",
  "S": "SE", "T": "TA", "U": "TU", "V": "VI", "W": "WA", "X": "XE", "Y": "YA", "Z": "ZA"
};

const KEYBOARD_SLIP_MAP = {
  Q:'W', W:'E', E:'R', R:'T', T:'Y', Y:'U', U:'I', I:'O', O:'P',
  A:'S', S:'D', D:'F', F:'G', G:'H', H:'J', J:'K', K:'L',
  Z:'X', X:'C', C:'V', V:'B', B:'N', N:'M'
};

const LEET_MAP = { A: '4', E: '3', O: '0', I: '1', T: '7', S: '5' };

const encryptWord = (cipherMode, word, config = {}) => {
  switch (cipherMode) {
    case 'caesar': {
      const shift = config.caesarShift;
      return word.split('').map(char => {
        if (!/[A-Z]/.test(char)) return char;
        let code = char.charCodeAt(0) + shift;
        if (code > 90) code -= 26;
        return String.fromCharCode(code);
      }).join('');
    }
    case 'atbash':
      return word.split('').map(char => {
        if (!/[A-Z]/.test(char)) return char;
        return String.fromCharCode(90 - (char.charCodeAt(0) - 65));
      }).join('');
    case 'reverse':
      return word.split('').reverse().join('');
    case 'leet':
      return word.split('').map(char => LEET_MAP[char] || char).join('');
    case 'morse':
      return word.split('').map(char => MORSE_DICT[char] || char).join(' ');
    case 'keyboard':
      return word.split('').map(char => KEYBOARD_SLIP_MAP[char] || char).join('');
    case 'binary':
      return word.split('').map(char => {
        if (char === ' ') return ' ';
        return char.charCodeAt(0).toString(2).padStart(8, '0');
      }).join(' ');
    case 'vigenere': {
      const activeKey = config.vigenereKey;
      let activeIdx = 0;
      return word.split('').map((char) => {
        if (!/[A-Z]/.test(char)) return char;
        const shift = activeKey.charCodeAt(activeIdx % activeKey.length) - 65;
        activeIdx++;
        let code = char.charCodeAt(0) + shift;
        if (code > 90) code -= 26;
        return String.fromCharCode(code);
      }).join('');
    }
    case 'navajo':
      return word.split('').map(char => NAVAJO_DICT[char] || char).join(' ');
    case 'minionese':
      return word.split('').map(char => MINION_DICT[char] || char).join(' ');
    case 'cryptogram':
      return word.split('').map(char => config.cryptoKeyInverse[char] || char).join('');
    default:
      return word;
  }
};

const getHelperPreview = (cipherMode, ciphertext, config = {}) => {
  if (!ciphertext) return '';
  switch (cipherMode) {
    case 'caesar':
      return ciphertext.split('').map(char => {
        if (!/[A-Z]/.test(char)) return char;
        let code = char.charCodeAt(0) - config.caesarShift;
        if (code < 65) code += 26;
        return String.fromCharCode(code);
      }).join('');
    case 'atbash':
      return ciphertext.split('').map(char => {
        if (!/[A-Z]/.test(char)) return char;
        return String.fromCharCode(90 - (char.charCodeAt(0) - 65));
      }).join('');
    case 'reverse':
      return ciphertext.split('').reverse().join('');
    case 'morse':
      return ciphertext.split(' ').map(symbol => MORSE_DICT_REV[symbol] || symbol).join('');
    case 'cryptogram':
      return ciphertext.split('').map(char => {
        if (!/[A-Z]/.test(char)) return char;
        return config.cryptoMapping[char] || '_';
      }).join('');
    default:
      return '';
  }
};

export default function Decipher() {
  const [cipherMode, setCipherMode] = useState('caesar');
  const [lengthMode, setLengthMode] = useState('easy');
  const [timeLimit, setTimeLimit] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [zenMode, setZenMode] = useState(true);
  const [isSuddenDeath, setIsSuddenDeath] = useState(false);
  const [isLabActive, setIsLabActive] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const [dictionary, setDictionary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);

  const [targetWord, setTargetWord] = useState('');
  const [ciphertext, setCiphertext] = useState('');
  const [caesarShift, setCaesarShift] = useState(3);
  const [vigenereKey, setVigenereKey] = useState('KEY');
  const [cryptoMapping, setCryptoMapping] = useState({});
  const [cryptoKeyInverse, setCryptoKeyInverse] = useState({});

  const [inputValue, setInputValue] = useState('');
  const [solvedCount, setSolvedCount] = useState(0);
  const [solvedWords, setSolvedWords] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [pb, setPb] = useState({ words: 0 });
  const [displayedText, setDisplayedText] = useState('');
  const animIntervalRef = useRef(null);

  const [activeMenu, setActiveMenu] = useState(null);

  const audioCtxRef = useRef(null);
  const inputRef = useRef(null);

  const playSound = (type) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'error') {
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'click') {
        osc.frequency.setValueAtTime(700, ctx.currentTime);
        gain.gain.setValueAtTime(0.02, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      }
    } catch (e) {
      console.log('Audio Context error');
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if ((params.get('cipher') && params.get('mode')) || window.location.pathname.endsWith('/lab')) {
      setIsLabActive(true);
    }

    const saved = localStorage.getItem('decipher_pb');
    if (saved) setPb(JSON.parse(saved));

    fetch('/txtFiles/words.txt')
      .then(r => r.text())
      .then(text => {
        const words = text.split('\n')
          .map(w => w.trim().toUpperCase())
          .filter(w => w.length >= 3 && /^[A-Z]+$/.test(w));
        setDictionary(words);
        setLoading(false);
      });

    const handleClickOutside = () => setActiveMenu(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!ciphertext) {
      setDisplayedText('');
      return;
    }

    if (animIntervalRef.current) clearInterval(animIntervalRef.current);

    const length = ciphertext.length;
    let iteration = 0;
    const maxIterations = 12;

    animIntervalRef.current = setInterval(() => {
      iteration++;

      if (iteration >= maxIterations) {
        setDisplayedText(ciphertext);
        clearInterval(animIntervalRef.current);
        return;
      }

      let frameText = '';

      switch (cipherMode) {
        case 'caesar': {
          frameText = ciphertext.split('').map((char) => {
            if (!/[A-Z]/.test(char)) return char;
            const code = char.charCodeAt(0);
            let nextCode = code - (maxIterations - iteration);
            if (nextCode < 65) nextCode += 26;
            return String.fromCharCode(nextCode);
          }).join('');
          break;
        }

        case 'atbash': {
          frameText = ciphertext.split('').map((char, idx) => {
            if (!/[A-Z]/.test(char)) return char;
            if (idx < (iteration / maxIterations) * length) {
              return char;
            }
            return String.fromCharCode(90 - (char.charCodeAt(0) - 65));
          }).join('');
          break;
        }

        case 'reverse': {
          const original = ciphertext.split('').reverse();
          const swapBoundary = Math.floor((iteration / maxIterations) * (length / 2));
          frameText = ciphertext.split('').map((char, idx) => {
            if (idx < swapBoundary || idx >= length - swapBoundary) {
              return char;
            }
            if (idx === swapBoundary || idx === length - 1 - swapBoundary) {
              const symbols = ['|', '/', '-', '\\'];
              return symbols[iteration % symbols.length];
            }
            return original[idx];
          }).join('');
          break;
        }

        case 'leet': {
          frameText = ciphertext.split('').map((char) => {
            if (!/[A-Z0-9]/.test(char)) return char;
            if (Math.random() > 0.5) {
              const leetMapping = { '4': 'A', '3': 'E', '0': 'O', '1': 'I', '7': 'T', '5': 'S' };
              return leetMapping[char] || char;
            }
            return String.fromCharCode(Math.floor(Math.random() * 26) + 65);
          }).join('');
          break;
        }

        case 'morse': {
          const activeIdx = Math.floor((iteration / maxIterations) * length);
          frameText = ciphertext.split('').map((char, idx) => {
            if (idx < activeIdx) {
              return char;
            }
            if (idx === activeIdx) {
              const scannerSyms = ['▓', '▒', '░', '█'];
              return scannerSyms[iteration % scannerSyms.length];
            }
            if (char === ' ') return ' ';
            return '█';
          }).join('');
          break;
        }

        case 'keyboard': {
          const adjacent = 'SDFGHJKLZXCVBNMQWERTYUIOP';
          frameText = ciphertext.split('').map((char) => {
            if (!/[A-Z]/.test(char)) return char;
            if (Math.random() > 0.3) {
              return adjacent[Math.floor(Math.random() * adjacent.length)];
            }
            return char;
          }).join('');
          break;
        }

        case 'binary': {
          frameText = ciphertext.split('').map((char) => {
            if (char === ' ') return ' ';
            return Math.random() > 0.5 ? '1' : '0';
          }).join('');
          break;
        }

        case 'vigenere': {
          frameText = ciphertext.split('').map((char, idx) => {
            if (!/[A-Z]/.test(char)) return char;
            const shiftAmount = (idx + iteration) % 26;
            let code = char.charCodeAt(0) - shiftAmount;
            if (code < 65) code += 26;
            return String.fromCharCode(code);
          }).join('');
          break;
        }

        case 'navajo': {
          const codenoise = ["SHUSH", "MOASI", "AH-JAH", "MA-E", "KLIZZIE", "GAH", "TSAH"];
          frameText = ciphertext.split(' ').map(() => {
            return codenoise[Math.floor(Math.random() * codenoise.length)];
          }).join(' ');
          break;
        }

        case 'minionese': {
          const syllables = ["BA", "NU", "LA", "PE", "KA", "PO", "TI", "DA", "MI", "LU"];
          frameText = ciphertext.split(' ').map(() => {
            return syllables[Math.floor(Math.random() * syllables.length)];
          }).join(' ');
          break;
        }

        case 'cryptogram': {
          frameText = ciphertext.split('').map((char, idx) => {
            if (char === ' ') return ' ';
            if (idx < (iteration / maxIterations) * length) {
              return char;
            }
            const chars = "@#$%&*?!ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            return chars[Math.floor(Math.random() * chars.length)];
          }).join('');
          break;
        }

        default:
          frameText = ciphertext;
          break;
      }

      setDisplayedText(frameText);
    }, 50);

    return () => {
      if (animIntervalRef.current) clearInterval(animIntervalRef.current);
    };
  }, [ciphertext, cipherMode]);

  useEffect(() => {
    if (!loading && dictionary.length > 0) {
      setSolvedCount(0);
      setSolvedWords([]);
      setStarted(false);
      setFinished(false);
      newGame();
    }
  }, [cipherMode, lengthMode, timeLimit, zenMode, isSuddenDeath, loading]);

  useEffect(() => {
    if (zenMode || !started || finished) return;
    if (timeLeft <= 0) {
      setFinished(true);
      return;
    }
    const t = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [zenMode, started, finished, timeLeft]);

  const newGame = () => {
    if (dictionary.length === 0) return;

    let selected = '';
    if (lengthMode === 'multi') {
      const count = Math.random() > 0.5 ? 3 : 2;
      const pool = dictionary.filter(w => w.length >= 3 && w.length <= 6);
      const chosen = [];
      for (let i = 0; i < count; i++) {
        chosen.push(pool[Math.floor(Math.random() * pool.length)]);
      }
      selected = chosen.join(' ');
    } else {
      let minLen = 3, maxLen = 5;
      if (lengthMode === 'medium') { minLen = 6; maxLen = 8; }
      if (lengthMode === 'hard') { minLen = 9; maxLen = 12; }
      const pool = dictionary.filter(w => w.length >= minLen && w.length <= maxLen);
      selected = pool[Math.floor(Math.random() * pool.length)] || 'MAYDAY';
    }

    setTargetWord(selected);
    setCryptoMapping({});
    setInputValue('');
    setMessage({ text: '', type: '' });

    const nextShift = Math.floor(Math.random() * 15) + 3;
    setCaesarShift(0);

    const keys = ['KEY', 'MINT', 'CODE', 'SAGE', 'WAVE'];
    const activeKey = keys[Math.floor(Math.random() * keys.length)];
    setVigenereKey(activeKey);

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const shuffled = [...alphabet].sort(() => Math.random() - 0.5);
    const mapping = {};
    alphabet.forEach((char, i) => {
      mapping[char] = shuffled[i];
    });
    setCryptoKeyInverse(mapping);

    setCiphertext(encryptWord(cipherMode, selected, {
      caesarShift: nextShift,
      vigenereKey: activeKey,
      cryptoKeyInverse: mapping
    }));

    if (finished) {
      setSolvedCount(0);
      setSolvedWords([]);
      setFinished(false);
      setStarted(false);
    }

    setTimeLeft(timeLimit);
    playSound('click');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handlePenalty = () => {
    if (isSuddenDeath) {
      setTimeLeft(p => Math.max(0, p - 3));
      showMessage('-3s!', 'error');
    }
    const card = document.querySelector('.dec-card');
    if (card) {
      card.classList.add('shake');
      setTimeout(() => card.classList.remove('shake'), 400);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const guess = inputValue.trim().toUpperCase();
    if (!guess || finished) return;

    if (!started) setStarted(true);

    if (guess === targetWord) {
      playSound('success');
      setSolvedWords(p => [targetWord.toLowerCase(), ...p]);
      setSolvedCount(p => p + 1);
      showMessage('Decrypted!', 'success');

      if (isSuddenDeath) {
        setTimeLeft(p => Math.min(p + 5, timeLimit));
      }

      setTimeout(() => {
        newGame();
      }, 800);
    } else {
      playSound('error');
      showMessage('Invalid Decryption', 'error');
      handlePenalty();
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 1500);
  };

  const handleCryptoKeyChange = (cipherChar, value) => {
    const upperVal = value.toUpperCase().slice(-1);
    setCryptoMapping(prev => ({
      ...prev,
      [cipherChar]: upperVal
    }));
  };

  const updatePb = (finalCount) => {
    const newPb = { words: Math.max(pb.words, finalCount) };
    setPb(newPb);
    localStorage.setItem('decipher_pb', JSON.stringify(newPb));
  };

  useEffect(() => {
    if (finished) {
      updatePb(solvedCount);
    }
  }, [finished]);

  const Dropdown = ({ id, value, options, onSelect, icon: Icon }) => (
    <div className="dec-dropdown-wrap" onClick={e => e.stopPropagation()}>
      <button 
        className={`dec-nav-btn ${activeMenu === id ? 'active' : ''}`} 
        onClick={() => setActiveMenu(activeMenu === id ? null : id)}
      >
        {Icon && <Icon size={13} />}
        <span className="dec-nav-value">{value}</span> 
        <ChevronDown size={10} className={activeMenu === id ? 'rotated' : ''} />
      </button>
      {activeMenu === id && (
        <div className="dec-dropdown-menu">
          {options.map(opt => (
            <div 
              key={opt.val} 
              className={`dec-dropdown-item ${value === (opt.label || opt.val) ? 'selected' : ''}`} 
              onClick={() => { onSelect(opt.val); setActiveMenu(null); }}
            >
              {opt.label || opt.val} {(value === (opt.label || opt.val)) && <Check size={10} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (isLabActive) {
    return (
      <DecipherLab 
        onClose={() => { 
          setIsLabActive(false); 
          window.history.replaceState({}, '', '/day18'); 
        }} 
      />
    );
  }

  return (
    <div className="decipher-game-container">
      <div className="dec-top-bar">
        <div className="dec-dropdowns-group">
          <Dropdown 
            id="mode" 
            value={CIPHER_MODES.find(m => m.val === cipherMode)?.label || cipherMode} 
            icon={AlignLeft}
            options={CIPHER_MODES} 
            onSelect={setCipherMode} 
          />
          <Dropdown 
            id="length" 
            value={LENGTH_MODES.find(l => l.val === lengthMode)?.label || lengthMode} 
            icon={Layers}
            options={LENGTH_MODES} 
            onSelect={setLengthMode} 
          />
          <Dropdown 
            id="time" 
            value={zenMode ? 'zen' : `${timeLimit}s`} 
            icon={Timer}
            options={TIMER_MODES} 
            onSelect={val => {
              if (val === 'zen') { setZenMode(true); }
              else { setZenMode(false); setTimeLimit(val); setTimeLeft(val); }
            }} 
          />
        </div>

        <div className="dec-tools-group">
          <button 
            className={`dec-tool-btn ${isSuddenDeath ? 'active' : ''}`} 
            onClick={() => { setIsSuddenDeath(!isSuddenDeath); setZenMode(false); }}
            title="Sudden Death"
          >
            <Skull size={13} />
          </button>
          <button 
            className="dec-tool-btn" 
            onClick={() => setIsLabActive(true)}
            title="Code Lab"
          >
            <Share2 size={13} />
          </button>
          <button className="dec-tool-btn" onClick={newGame} title="New Word">
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      <main className="dec-main" onClick={() => inputRef.current?.focus()}>
        <div className="dec-header">
          <div className="dec-live-stats">
            {!zenMode && (
              <span className={`dec-timer-val ${timeLeft < 10 ? 'urgent' : ''}`}>
                {timeLeft}s
              </span>
            )}
            <span className="dec-count-val">{solvedCount} decrypted</span>
          </div>
        </div>

        <div className="dec-card">
          <header className="dec-card-head" style={{ justifyContent: 'flex-end' }}>
            <button className="dec-hint-toggle" onClick={() => setShowHint(!showHint)}>
              {showHint ? "Hide Clue" : "Clue"}
            </button>
          </header>

          {showHint && (
            <div className="dec-hint-box">
              <span>
                {cipherMode === 'caesar' && "A shift dial is available below to decrypt offset characters."}
                {cipherMode === 'atbash' && "Alphabet mirror is in effect. A maps to Z, B to Y."}
                {cipherMode === 'reverse' && "Reverse the reading trajectory of the characters."}
                {cipherMode === 'leet' && "Match net dialect conversions. e.g. 4 ➔ A, 3 ➔ E."}
                {cipherMode === 'morse' && "Standard aviation telegraph patterns. Check the decoder workspace."}
                {cipherMode === 'keyboard' && "Revert character slippage to the left on a QWERTY keyboard."}
                {cipherMode === 'binary' && "Compute binary ASCII bytes. 01001111 represents 'O'."}
                {cipherMode === 'vigenere' && `Vigenère key shift active. Symmetric key is: '${vigenereKey}'.`}
                {cipherMode === 'navajo' && "Decipher historic Native American military code talker phonetic translations using the glossary desk."}
                {cipherMode === 'minionese' && "Decode playful Minion syllables into standard text characters using the Banana codebook."}
                {cipherMode === 'cryptogram' && "Map target substitution inputs inside the desk below."}
              </span>
            </div>
          )}

          <div className="dec-block">
            <div className="dec-code-output">{displayedText || ciphertext}</div>
          </div>

          <div className="dec-workspace-tool">
            {cipherMode === 'caesar' && (
              <div className="dec-tool-caesar">
                <div className="dec-slider-label">
                  <span>Shift Calibration</span>
                  <span className="dec-shift-metric">-{caesarShift}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="25" 
                  value={caesarShift}
                  onChange={e => { setCaesarShift(parseInt(e.target.value)); playSound('beep'); }}
                  className="dec-slider"
                />
                <div className="dec-clean-preview">
                  <div className="dec-preview-value">
                    {getHelperPreview(cipherMode, ciphertext, { caesarShift })}
                  </div>
                </div>
              </div>
            )}
            
            {cipherMode === 'cryptogram' && (
              <div className="dec-tool-crypto">
                <div className="dec-grid-mapping">
                  {Array.from(new Set(ciphertext.replace(/\s/g, '').split(''))).map(char => (
                    <div key={char} className="dec-grid-pair">
                      <span className="dec-scrambled-letter">{char}</span>
                      <input 
                        type="text" 
                        maxLength="1"
                        value={cryptoMapping[char] || ''}
                        onChange={e => { handleCryptoKeyChange(char, e.target.value); playSound('beep'); }}
                        className="dec-mapping-input"
                      />
                    </div>
                  ))}
                </div>
                <div className="dec-clean-preview">
                  <div className="dec-preview-value">
                    {getHelperPreview(cipherMode, ciphertext, { cryptoMapping })}
                  </div>
                </div>
              </div>
            )}

            {(cipherMode === 'leet' || cipherMode === 'keyboard' || cipherMode === 'binary' || cipherMode === 'vigenere') && (
              <div className="dec-editorial-instruction">
                {cipherMode === 'leet' && "Match character mappings: 4 ➔ A, 0 ➔ O, 3 ➔ E, 1 ➔ I."}
                {cipherMode === 'keyboard' && "Revert character slip one step leftward on a QWERTY layout."}
                {cipherMode === 'binary' && "Translate machine bits. 01001111 represents 'O'."}
                {cipherMode === 'vigenere' && `Repeated key shift active. Symmetric key is: '${vigenereKey}'.`}
              </div>
            )}

            {(cipherMode === 'navajo' || cipherMode === 'minionese') && (
              <div className="dec-tool-glossary">
                <div className="dec-grid-mapping">
                  {Object.entries(cipherMode === 'navajo' ? NAVAJO_DICT : MINION_DICT).map(([letter, code]) => (
                    <div key={letter} className="dec-grid-pair">
                      <span className="dec-scrambled-letter">{letter}</span>
                      <span style={{ fontSize: '0.65rem', color: '#10b981', fontFamily: 'monospace', fontWeight: 'bold' }}>{code}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <form className="dec-form" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              className="dec-input"
              value={inputValue}
              onChange={e => setInputValue(e.target.value.toLowerCase())}
              placeholder="..."
              disabled={loading || finished}
              autoFocus
              autoComplete="off"
              spellCheck={false}
            />
          </form>
        </div>

        {message.text && (
          <div className={`dec-message ${message.type}`}>{message.text}</div>
        )}

        <div className="dec-solved-area">
          {solvedWords.map((w, i) => (
            <span key={i} className="dec-solved-word">{w}</span>
          ))}
          {solvedWords.length === 0 && !finished && (
            <span className="dec-solved-empty">ready.</span>
          )}
        </div>

        {finished && (
          <div className="dec-result-overlay">
            <div className="dec-result-box">
              <div className="dec-result-stats">
                <div className="dec-result-item">
                  <span className="label">decrypted</span>
                  <span className="value">{solvedCount}</span>
                </div>
              </div>

              <div className="dec-result-words">
                {solvedWords.map((w, i) => (
                  <span key={i} className="dec-result-word">{w}</span>
                ))}
              </div>

              <button className="dec-retry-btn" onClick={newGame}>RETRY</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
