import React, { useState, useEffect, useRef } from 'react';
import { AlignLeft, ChevronDown, Check, RefreshCw, Timer, Layers, Skull, Trophy, Share2, Clipboard, ArrowLeft, Play, Info } from 'lucide-react';
import './Decipher.css';
import './DecipherLab.css';

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
      const shift = config.caesarShift || 0;
      return word.split('').map(char => {
        let code = char.charCodeAt(0) + shift;
        if (code > 90) code -= 26;
        return String.fromCharCode(code);
      }).join('');
    }
    case 'atbash':
      return word.split('').map(char => String.fromCharCode(90 - (char.charCodeAt(0) - 65))).join('');
    case 'reverse':
      return word.split('').reverse().join('');
    case 'leet':
      return word.split('').map(char => LEET_MAP[char] || char).join('');
    case 'morse':
      return word.split('').map(char => MORSE_DICT[char] || char).join(' ');
    case 'keyboard':
      return word.split('').map(char => KEYBOARD_SLIP_MAP[char] || char).join('');
    case 'binary':
      return word.split('').map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
    case 'vigenere': {
      const activeKey = config.vigenereKey || 'KEY';
      return word.split('').map((char, idx) => {
        const shift = activeKey.charCodeAt(idx % activeKey.length) - 65;
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

export default function DecipherLab({ onClose }) {
  const [labMode, setLabMode] = useState('create');
  const [cipherMode, setCipherMode] = useState('caesar');
  
  const [customText, setCustomText] = useState('');
  const [caesarShift, setCaesarShift] = useState(3);
  const [vigenereKey, setVigenereKey] = useState('KEY');
  const [cryptoMapping, setCryptoMapping] = useState({});
  const [cryptoKeyInverse, setCryptoKeyInverse] = useState({});

  const [shareUrl, setShareUrl] = useState('');
  const [copyBadge, setCopyBadge] = useState(false);

  const [solveCiphertext, setSolveCiphertext] = useState('');
  const [solveCorrectWord, setSolveCorrectWord] = useState('');
  const [solveConfig, setSolveConfig] = useState({});

  const [inputValue, setInputValue] = useState('');
  const [solved, setSolved] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const [activeMenu, setActiveMenu] = useState(null);
  const inputRef = useRef(null);
  const audioCtxRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rawCipher = params.get('cipher');
    const mode = params.get('mode');
    
    if (rawCipher && mode) {
      try {
        const decodedWord = decodeURIComponent(atob(rawCipher)).toUpperCase();
        setLabMode('solve');
        setCipherMode(mode);
        setSolveCorrectWord(decodedWord);

        const configPayload = {};
        if (mode === 'caesar') {
          configPayload.caesarShift = parseInt(params.get('shift')) || 3;
        }
        if (mode === 'vigenere') {
          configPayload.vigenereKey = (params.get('key') || 'KEY').toUpperCase();
        }
        if (mode === 'cryptogram') {
          const invStr = params.get('inv');
          if (invStr) {
            configPayload.cryptoKeyInverse = JSON.parse(decodeURIComponent(atob(invStr)));
          }
        }
        setSolveConfig(configPayload);

        const cipherTextResult = encryptWord(mode, decodedWord, configPayload);
        setSolveCiphertext(cipherTextResult);
        setCaesarShift(0);
      } catch (err) {
        console.error('Failed to parse share parameters', err);
        setLabMode('create');
      }
    }

    const handleClickOutside = () => setActiveMenu(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

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
    } catch (e) {}
  };

  const handleGenerateLink = () => {
    const rawWord = customText.trim().toUpperCase().replace(/[^A-Z]/g, '');
    if (!rawWord) {
      showMessage('Please enter English letters', 'error');
      return;
    }

    const encoded = btoa(encodeURIComponent(rawWord));
    const base = window.location.origin + window.location.pathname;
    let url = `${base}?cipher=${encoded}&mode=${cipherMode}`;

    if (cipherMode === 'caesar') {
      url += `&shift=${caesarShift}`;
    }
    if (cipherMode === 'vigenere') {
      url += `&key=${vigenereKey.toUpperCase()}`;
    }
    if (cipherMode === 'cryptogram') {
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      const shuffled = [...alphabet].sort(() => Math.random() - 0.5);
      const mapping = {};
      alphabet.forEach((char, i) => {
        mapping[char] = shuffled[i];
      });
      const encInv = btoa(encodeURIComponent(JSON.stringify(mapping)));
      url += `&inv=${encInv}`;
    }

    setShareUrl(url);
    playSound('success');
  };

  const handleCopyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopyBadge(true);
      playSound('click');
      setTimeout(() => setCopyBadge(false), 2000);
    });
  };

  const handleSubmitSolve = (e) => {
    e.preventDefault();
    const guess = inputValue.trim().toUpperCase();
    if (!guess || solved) return;

    if (guess === solveCorrectWord) {
      playSound('success');
      setSolved(true);
      showMessage('Transmission Deciphered!', 'success');
    } else {
      playSound('error');
      showMessage('Failed Decryption', 'error');
      const card = document.querySelector('.dec-card');
      if (card) {
        card.classList.add('shake');
        setTimeout(() => card.classList.remove('shake'), 400);
      }
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 2000);
  };

  const handleCryptoKeyChange = (cipherChar, value) => {
    const upperVal = value.toUpperCase().slice(-1);
    setCryptoMapping(prev => ({
      ...prev,
      [cipherChar]: upperVal
    }));
  };

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

  return (
    <div className="decipher-game-container">
      {/* Top Header */}
      <div className="dec-top-bar">
        <div className="dec-nav">
          <button className="dec-nav-btn" onClick={onClose}>
            <ArrowLeft size={13} />
            <span className="dec-nav-value">Play Decipher</span>
          </button>
          
          {labMode === 'create' && (
            <Dropdown 
              id="mode" 
              value={CIPHER_MODES.find(m => m.val === cipherMode)?.label || cipherMode} 
              icon={AlignLeft}
              options={CIPHER_MODES} 
              onSelect={setCipherMode} 
            />
          )}
        </div>
      </div>

      <main className="dec-main">
        {labMode === 'create' ? (
          <div className="dec-card lab-creator-view">
            {/* Creator View */}

            <div className="lab-form-group">
              <input 
                type="text"
                className="dec-input"
                placeholder="TYPE MESSAGE HERE..."
                value={customText}
                onChange={e => setCustomText(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
                autoFocus
                autoComplete="off"
              />
            </div>

            {/* Config adjusters */}
            {cipherMode === 'caesar' && (
              <div className="dec-workspace-tool" style={{ border: 'none' }}>
                <div className="dec-slider-label">
                  <span>Shift Calibration</span>
                  <span className="dec-shift-metric">-{caesarShift}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="25" 
                  value={caesarShift}
                  onChange={e => setCaesarShift(parseInt(e.target.value))}
                  className="dec-slider"
                />
              </div>
            )}

            {cipherMode === 'vigenere' && (
              <div className="lab-form-group">
                <input 
                  type="text"
                  className="dec-input"
                  style={{ fontSize: '18px', borderBottom: '1px solid #252c2a' }}
                  placeholder="e.g. MINT"
                  value={vigenereKey}
                  onChange={e => setVigenereKey(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
                />
              </div>
            )}

            {customText && (
              <div className="dec-block" style={{ marginTop: '1rem' }}>
                <div className="dec-code-output">
                  {encryptWord(cipherMode, customText.trim().toUpperCase(), {
                    caesarShift,
                    vigenereKey,
                    cryptoKeyInverse: Object.fromEntries('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(c => [c, c]))
                  })}
                </div>
              </div>
            )}

            <button className="dec-retry-btn" style={{ marginTop: '1rem' }} onClick={handleGenerateLink}>
              GENERATE LAB LINK
            </button>

            {shareUrl && (
              <div className="lab-share-dock animate-fade">
                <div className="lab-url-container">
                  <input type="text" readOnly value={shareUrl} className="lab-url-field" />
                </div>
                <button className="dec-tool-btn" onClick={handleCopyLink} title="Copy to Clipboard">
                  <Clipboard size={14} />
                  <span className="dec-nav-value" style={{ marginLeft: '4px' }}>
                    {copyBadge ? 'COPIED!' : 'COPY'}
                  </span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Solve Mode */
          <div className="dec-card">
            <header className="dec-card-head" style={{ justifyContent: 'flex-end' }}>
              <span className="dec-nav-value" style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#10b981' }}>
                Mode: {cipherMode}
              </span>
            </header>

            <div className="dec-block">
              <div className="dec-code-output">{solveCiphertext}</div>
            </div>

            {/* Interactive Workspace solver for custom code */}
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
                      {getHelperPreview(cipherMode, solveCiphertext, { caesarShift })}
                    </div>
                  </div>
                </div>
              )}
              
              {cipherMode === 'cryptogram' && (
                <div className="dec-tool-crypto">
                  <div className="dec-grid-mapping">
                    {Array.from(new Set(solveCiphertext.replace(/\s/g, '').split(''))).map(char => (
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
                      {getHelperPreview(cipherMode, solveCiphertext, { cryptoMapping })}
                    </div>
                  </div>
                </div>
              )}

              {(cipherMode === 'leet' || cipherMode === 'keyboard' || cipherMode === 'binary' || cipherMode === 'vigenere') && (
                <div className="dec-editorial-instruction">
                  {cipherMode === 'leet' && "Match character mappings: 4 ➔ A, 0 ➔ O, 3 ➔ E, 1 ➔ I."}
                  {cipherMode === 'keyboard' && "Revert character slip one step leftward on a QWERTY layout."}
                  {cipherMode === 'binary' && "Translate machine bits. 01001111 represents 'O'."}
                  {cipherMode === 'vigenere' && `Repeated key shift active. Symmetric key is: '${solveConfig.vigenereKey}'.`}
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

            <form className="dec-form" onSubmit={handleSubmitSolve}>
              <input
                ref={inputRef}
                className="dec-input"
                value={inputValue}
                onChange={e => setInputValue(e.target.value.toLowerCase())}
                placeholder="..."
                disabled={solved}
                autoFocus
                autoComplete="off"
                spellCheck={false}
              />
            </form>
          </div>
        )}

        {message.text && (
          <div className={`dec-message ${message.type}`}>{message.text}</div>
        )}

        {/* Victory solve state */}
        {solved && (
          <div className="dec-result-overlay">
            <div className="dec-result-box">
              <div className="dec-result-stats">
                <div className="dec-result-item animate-scale">
                  <span className="label" style={{ color: '#10b981' }}>solved secret message</span>
                  <span className="value" style={{ fontSize: '2.5rem', fontWeight: '600', color: '#ffffff', letterSpacing: '0.05em' }}>
                    {solveCorrectWord}
                  </span>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                <button className="dec-retry-btn" onClick={onClose}>
                  Play Main Game
                </button>
                <button className="dec-retry-btn" style={{ borderColor: '#10b981', color: '#10b981' }} onClick={() => setLabMode('create')}>
                  Create Custom Code
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
