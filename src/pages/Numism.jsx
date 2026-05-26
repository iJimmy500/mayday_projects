import { useState, useEffect, useRef } from 'react';
import {
  Hash,
  Target,
  Zap,
  Layers,
  Percent,
  Binary,
  RefreshCw,
  Timer,
  ChevronDown,
  Check,
  Trophy,
  Flame,
  LayoutGrid,
  Divide,
  Eye,
  Flower,
  Skull,
  AlignLeft,
  Lightbulb,
  CornerDownLeft,
  HelpCircle
} from 'lucide-react';
import './Numism.css';
import { FERMI_QUESTIONS } from '../utils/fermiQuestions';
import { 
  generateProblemData, 
  validateNumism, 
  getDescriptionForFoundItem as getDescUtil, 
  getPromptTiles as getTilesUtil, 
  getAllFactors 
} from '../utils/numismEngine';
import { playSound } from '../utils/audioEngine';

const MODES = [
  { id: 'factora', name: 'factora', icon: Layers, desc: 'Find all factors of the target' },
  { id: 'target', name: 'target', icon: Target, desc: 'Build an equation for the target' },
  { id: 'primal', name: 'primal', icon: Zap, desc: 'Prime (P) or Composite (C)' },
  { id: 'summism', name: 'summism', icon: Hash, desc: 'Digits must sum to target' },
  { id: 'quantize', name: 'quantize', icon: Eye, desc: 'Estimate the count of dots' },
  { id: 'modulo', name: 'modulo', icon: Percent, desc: 'Calculate the remainder' },
  { id: 'divis', name: 'divis', icon: Divide, desc: 'Enter multiples of the divisor' },
  { id: 'complement', name: 'complement', icon: LayoutGrid, desc: 'Reach target from secondary' },
  { id: 'binary', name: 'binary beats', icon: Binary, desc: 'Convert binary to decimal' },
  { id: 'fermi', name: 'fermi questions', icon: Lightbulb, desc: 'Estimate massive numbers to the nearest power of 10' },
  { id: 'makex', name: 'make x', icon: Flame, desc: 'Build an equation to make target X using dealt numbers' }
];

export default function Numism() {
  const [mode, setMode] = useState('factora');
  const [level, setLevel] = useState(1);
  const [timedMode, setTimedMode] = useState(false);
  const [timeLimit, setTimeLimit] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);

  const [target, setTarget] = useState(0);
  const [secondaryTarget, setSecondaryTarget] = useState(0);
  const [quantizeDots, setQuantizeDots] = useState([]);
  const [fermiQuestion, setFermiQuestion] = useState(null);
  const [foundItems, setFoundItems] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [customXStr, setCustomXStr] = useState('');
  
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  
  const [isSuddenDeath, setIsSuddenDeath] = useState(false);
  const [isProgressive, setIsProgressive] = useState(false);
  const [isHardcore, setIsHardcore] = useState(false);
  
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [itemsToLevel, setItemsToLevel] = useState(3);
  
  const [pb, setPb] = useState({ score: 0, level: 1, items: 0 });
  const [isShake, setIsShake] = useState(false);
  const [isPop, setIsPop] = useState(false);
  const [promptVisible, setPromptVisible] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showFermiModal, setShowFermiModal] = useState(false);
  const [foundItemDetails, setFoundItemDetails] = useState([]);
  const [selectedFermiDetail, setSelectedFermiDetail] = useState(null);
  const [fermiReveal, setFermiReveal] = useState(null);
  const [revealCountdown, setRevealCountdown] = useState(8);

  const inputRef = useRef(null);
  const isTransitioning = useRef(false);

  const triggerPop = () => {
    setIsPop(true);
    setTimeout(() => setIsPop(false), 300);
  };

  const triggerShake = () => {
    setIsShake(true);
    setTimeout(() => setIsShake(false), 400);
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 1500);
  };

  const generateProblem = (lvlOverride) => {
    isTransitioning.current = false;
    const l = lvlOverride !== undefined ? lvlOverride : level;
    const { target: t, secondaryTarget: s, quantizeDots: qd, fermiQuestion: fq } = generateProblemData(
      mode,
      l,
      fermiQuestion,
      FERMI_QUESTIONS
    );

    setTarget(t);
    setSecondaryTarget(s);
    setQuantizeDots(qd);
    setFermiQuestion(fq);
    setInputValue('');
    setPromptVisible(true);

    if (mode === 'quantize') {
      const showDuration = Math.max(1200 - l * 100, 600);
      const timer = setTimeout(() => {
        setPromptVisible(false);
      }, showDuration);
      return () => clearTimeout(timer);
    }
  };

  const handleCustomTargetX = (val) => {
    if (val <= 0) return;
    const { target: t, secondaryTarget: s } = generateProblemData(
      'makex', 
      level, 
      null, 
      [], 
      val
    );
    setTarget(t);
    setSecondaryTarget(s);
    setInputValue('');
    playSound('click');
  };

  const newGame = (lvlOverride, modeOverride) => {
    const activeMode = modeOverride !== undefined ? modeOverride : mode;
    const activeLevel = lvlOverride !== undefined ? lvlOverride : (isProgressive ? 1 : level);
    
    setLevel(activeLevel);
    
    setFoundItems([]);
    setFoundItemDetails([]);
    setSelectedFermiDetail(null);
    setFermiReveal(null);
    setInputValue('');
    setStarted(false);
    setFinished(false);
    setScore(0);
    setCorrectCount(0);
    setPromptVisible(true);
    
    setTimeLeft(zenMode ? 0 : timeLimit);
    generateProblem(activeLevel);
    
    setTimeout(() => inputRef.current?.focus(), 50);
    playSound('click');
  };

  useEffect(() => {
    const saved = localStorage.getItem('numism_pb');
    if (saved) {
      try {
        setPb(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }

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
    newGame(undefined, mode);
  }, [mode]);

  useEffect(() => {
    if (mode === 'makex') {
      setCustomXStr(String(target || ''));
    }
  }, [target, mode]);

  useEffect(() => {
    setTimeLeft(zenMode ? 0 : timeLimit);
  }, [zenMode, timeLimit]);

  useEffect(() => {
    if (zenMode || !started || finished) return;
    if (timeLeft <= 0) {
      setFinished(true);
      return;
    }
    const t = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [started, finished, timeLeft, zenMode]);


  const advanceFermi = () => {
    setFermiReveal(null);
    isTransitioning.current = false;
    generateProblem(level);
  };

  useEffect(() => {
    if (!fermiReveal) { setRevealCountdown(8); return; }
    setRevealCountdown(8);
    const t = setInterval(() => setRevealCountdown(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [fermiReveal]);

  useEffect(() => {
    if (fermiReveal && revealCountdown <= 0) advanceFermi();
  }, [revealCountdown, fermiReveal]);


  const updatePb = (finalScore, finalLevel, finalItems) => {
    const newPb = {
      score: Math.max(pb.score, finalScore),
      level: Math.max(pb.level, finalLevel),
      items: Math.max(pb.items, finalItems)
    };
    setPb(newPb);
    localStorage.setItem('numism_pb', JSON.stringify(newPb));
  };

  useEffect(() => {
    if (finished) {
      updatePb(score, level, foundItems.length);
    }
  }, [finished]);

  const getPromptTiles = () => {
    return getTilesUtil(mode, target, secondaryTarget);
  };

  const getDescriptionForFoundItem = (val) => {
    return getDescUtil(val, mode, target, secondaryTarget, fermiQuestion);
  };

  const validate = (val) => {
    return validateNumism(val, mode, target, secondaryTarget);
  };

  const handlePenalty = () => {
    if (isSuddenDeath) {
      setTimeLeft(p => Math.max(0, p - 5));
      showMessage('-5s!', 'error');
    }
    if (isHardcore) {
      if (isProgressive) {
        startProgressive();
        showMessage('progress reset!', 'error');
      } else {
        setFoundItems([]);
        setScore(0);
        showMessage('reset!', 'error');
      }
    }
    triggerShake();
  };

  const startProgressive = () => {
    setIsProgressive(true);
    setCorrectCount(0);
    newGame(1);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    
    // For primal mode, auto-submit if P or C is entered
    if (mode === 'primal') {
      const clean = val.trim().toLowerCase();
      if (clean === 'p' || clean === 'c') {
        setInputValue(clean);
        handleSubmit(null, clean);
        return;
      }
    }
    
    setInputValue(val);
  };

  const handlePrimalSubmit = (choice) => {
    if (finished || isTransitioning.current) return;
    setInputValue(choice);
    handleSubmit(null, choice);
  };

  const handleSubmit = (e, overrideVal) => {
    if (e) e.preventDefault();
    const val = (overrideVal !== undefined ? overrideVal : inputValue).trim();
    if (!val || finished || isTransitioning.current) return;

    if (!started) setStarted(true);

    // Dynamic Fermi Mode intercept to allow Science Olympiad-inspired "exact vs. off-by-one" points
    if (mode === 'fermi') {
      const n = parseInt(val, 10);
      if (isNaN(n)) {
        showMessage('enter an exponent', 'error');
        playSound('error');
        handlePenalty();
        return;
      }
      
      const diff = Math.abs(n - target);
      if (diff === 0) {
        playSound('success');
        triggerPop();
        showMessage('perfect exponent!', 'success');
        
        if (isSuddenDeath) setTimeLeft(p => Math.min(p + 3, 60));
        setScore(s => s + 30 * level);
        
        const itemDesc = `10^${target}`;
        const detail = { q: fermiQuestion.q, desc: fermiQuestion.desc, exponent: target, guessed: target, exact: true };
        setFoundItems(p => [itemDesc, ...p]);
        setFoundItemDetails(p => [detail, ...p]);
        setInputValue('');

        let nextLevel = level;
        let nextCorrectCount = correctCount + 1;
        if (isProgressive && nextCorrectCount >= itemsToLevel) {
          nextLevel = level + 1;
          setLevel(nextLevel);
          setCorrectCount(0);
          showMessage(`level ${nextLevel}!`, 'success');
        } else {
          setCorrectCount(nextCorrectCount);
        }
        isTransitioning.current = true;
        setTimeout(() => generateProblem(nextLevel), 400);
        return;
      } else if (diff === 1) {
        if (isSuddenDeath || isHardcore) {
          showMessage('incorrect! (strict)', 'error');
          playSound('error');
          handlePenalty();
          setInputValue('');
          setFermiReveal({ q: fermiQuestion.q, desc: fermiQuestion.desc, exponent: target });
          return;
        }
        playSound('success');
        triggerPop();
        showMessage('close! +1 order off', 'success');
        
        setScore(s => s + 10 * level);
        
        const itemDesc = `~10^${target}`;
        const detail = { q: fermiQuestion.q, desc: fermiQuestion.desc, exponent: target, guessed: n, exact: false };
        setFoundItems(p => [itemDesc, ...p]);
        setFoundItemDetails(p => [detail, ...p]);
        setInputValue('');

        let nextLevel = level;
        let nextCorrectCount = correctCount + 1;
        if (isProgressive && nextCorrectCount >= itemsToLevel) {
          nextLevel = level + 1;
          setLevel(nextLevel);
          setCorrectCount(0);
          showMessage(`level ${nextLevel}!`, 'success');
        } else {
          setCorrectCount(nextCorrectCount);
        }
        isTransitioning.current = true;
        setTimeout(() => generateProblem(nextLevel), 400);
        return;
      } else {
        showMessage('incorrect!', 'error');
        playSound('error');
        handlePenalty();
        setInputValue('');
        setFermiReveal({ q: fermiQuestion.q, desc: fermiQuestion.desc, exponent: target });
        return;
      }
    }

    if (['factora', 'divis'].includes(mode)) {
      const numVal = parseInt(val, 10);
      const isAlreadyFound = foundItems.some(item => {
        const match = item.match(/^(\d+)/);
        if (match) {
          return parseInt(match[1], 10) === numVal;
        }
        return false;
      });

      if (isAlreadyFound) {
        showMessage('already found', 'error');
        playSound('error');
        handlePenalty();
        return;
      }
    }

    if (validate(val)) {
      playSound('success');
      triggerPop();

      if (isSuddenDeath) {
        setTimeLeft(p => Math.min(p + 3, 60));
        showMessage('+3s!', 'success');
      } else {
        showMessage('correct!', 'success');
      }

      setScore(s => s + 10 * level);

      if (mode === 'factora') {
        const itemDesc = getDescriptionForFoundItem(val);
        const newFound = [itemDesc, ...foundItems];
        setFoundItems(newFound);
        setFoundItemDetails(p => [null, ...p]);
        setInputValue('');

        const allFactors = getAllFactors(target);
        const foundFactorsCount = newFound.filter(x => x.includes('(factor)')).length;
        
        if (foundFactorsCount >= allFactors.length) {
          showMessage('all factors found!', 'success');
          setScore(s => s + 50 * level);
          
          let nextLevel = level;
          let nextCorrectCount = correctCount + 1;
          
          if (isProgressive && nextCorrectCount >= itemsToLevel) {
            nextLevel = level + 1;
            setLevel(nextLevel);
            setCorrectCount(0);
            showMessage(`level ${nextLevel}!`, 'success');
          } else {
            setCorrectCount(nextCorrectCount);
          }
          
          isTransitioning.current = true;
          setTimeout(() => generateProblem(nextLevel), 500);
        }
      } else if (mode === 'divis') {
        const itemDesc = getDescriptionForFoundItem(val);
        setFoundItems(p => [itemDesc, ...p]);
        setFoundItemDetails(p => [null, ...p]);
        setInputValue('');

        if (isProgressive) {
          const nextCorrectCount = correctCount + 1;
          if (nextCorrectCount >= itemsToLevel) {
            const nextLevel = level + 1;
            setLevel(nextLevel);
            setCorrectCount(0);
            showMessage(`level ${nextLevel}!`, 'success');
            isTransitioning.current = true;
            setTimeout(() => generateProblem(nextLevel), 500);
          } else {
            setCorrectCount(nextCorrectCount);
          }
        }
      } else {
        const itemDesc = getDescriptionForFoundItem(val);
        setFoundItems(p => [itemDesc, ...p]);
        setFoundItemDetails(p => [null, ...p]);
        setInputValue('');

        let nextLevel = level;
        let nextCorrectCount = correctCount + 1;

        if (isProgressive && nextCorrectCount >= itemsToLevel) {
          nextLevel = level + 1;
          setLevel(nextLevel);
          setCorrectCount(0);
          showMessage(`level ${nextLevel}!`, 'success');
        } else {
          setCorrectCount(nextCorrectCount);
        }

        isTransitioning.current = true;
        setTimeout(() => generateProblem(nextLevel), 250);
      }
    } else {
      showMessage('incorrect', 'error');
      playSound('error');
      handlePenalty();
    }
  };

  return (
    <div className={`num-theme ${zenMode ? 'zen-active' : ''}`}>
      <main className="num-main" onClick={() => inputRef.current?.focus()}>

        <div className="num-top-bar">
          <div className="num-nav">
            <div className="num-nav-group">
              <Dropdown 
                id="mode" 
                label="mode" 
                value={mode} 
                icon={AlignLeft}
                options={MODES.map(m => ({ val: m.id, label: m.name }))}
                onSelect={setMode} 
                activeMenu={activeMenu}
                setActiveMenu={setActiveMenu}
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
                activeMenu={activeMenu}
                setActiveMenu={setActiveMenu}
              />
            </div>
          </div>

          <div className="num-nav-tools">
            <div className="num-challenge-group">
              <button 
                className={`num-tool-btn ${isProgressive ? 'active' : ''}`} 
                onClick={() => {
                  if (!isProgressive) {
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
                className={`num-tool-btn ${isHardcore ? 'active' : ''}`} 
                onClick={() => {
                  setIsHardcore(!isHardcore);
                  if (!isHardcore) {
                    if (isProgressive) startProgressive();
                    else setFoundItems([]);
                  }
                }}
                title="Hardcore Mode"
              >
                <Flame size={14} />
              </button>
              <button 
                className={`num-tool-btn ${isSuddenDeath ? 'active' : ''}`} 
                onClick={() => { setIsSuddenDeath(!isSuddenDeath); setTimedMode(!isSuddenDeath); }}
                title="Sudden Death"
              >
                <Skull size={14} />
              </button>
            </div>
            <button className="num-tool-btn" onClick={() => newGame()} title="New Game (Alt+S)">
              <RefreshCw size={14} />
            </button>
            <button className="num-tool-btn" onClick={() => setShowHelp(true)} title="How to play">
              <HelpCircle size={14} />
            </button>
          </div>
        </div>

        <div className="num-header">
          <div className="num-live-stats">
            {isProgressive && <span className="num-level-val">LVL {level}</span>}
            {(timedMode || isSuddenDeath) && (
              <span className={`num-timer-val ${timeLeft < 10 ? 'urgent' : ''}`}>
                {timeLeft}s
              </span>
            )}
            <span className="num-count-val">{score} pts</span>
            <span className="num-count-val">{foundItems.length} solved</span>
          </div>
        </div>

        {mode === 'quantize' ? (
          <div className={`num-dots-container ${!promptVisible ? 'fade-out' : ''}`}>
            {quantizeDots.map((d, i) => (
              <div 
                key={i} 
                className="num-dot" 
                style={{ left: `${d.x}%`, top: `${d.y}%`, width: `${d.size}px`, height: `${d.size}px` }} 
              />
            ))}
            {quantizeDots.length === 0 && <div className="num-dot-placeholder">Estimate!</div>}
          </div>
        ) : mode === 'fermi' ? (
          <div className={`num-fermi-box ${!promptVisible ? 'fade-out' : ''}`}>
            <div className="num-fermi-label">Fermi Question</div>
            <div className="num-fermi-question" onClick={() => setShowFermiModal(true)}>{fermiQuestion?.q}</div>
            <div className="num-fermi-sub">Order of Magnitude: 10<sup>?</sup></div>
          </div>
        ) : (
          <>
            {mode === 'makex' && (
              <div className="num-makex-header" onClick={e => e.stopPropagation()}>
                <span className="num-makex-title">MAKE</span>
                <input
                  type="number"
                  className="num-makex-target-input"
                  value={customXStr}
                  onChange={(e) => {
                    setCustomXStr(e.target.value);
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val > 0) {
                      const { target: t, secondaryTarget: s } = generateProblemData(
                        'makex',
                        level,
                        null,
                        [],
                        val
                      );
                      setTarget(t);
                      setSecondaryTarget(s);
                    }
                  }}
                  placeholder="24"
                  title="Type any target to challenge yourself!"
                />
              </div>
            )}
            <div className={`num-letters-area ${!promptVisible ? 'fade-out' : ''}`}>
              {getPromptTiles().map((l, i) => (
                <span 
                  key={`${l}-${i}`} 
                  className={`num-tile ${l === '?' ? 'highlight' : (isNaN(parseInt(l, 10)) ? 'operator' : 'digit')}`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  {l}
                </span>
              ))}
            </div>
          </>
        )}

        <div className="num-helper-text">
          {mode === 'fermi' ? 'Estimate to the nearest power of 10' : MODES.find(m => m.id === mode)?.desc}
        </div>

        <form className="num-form" onSubmit={handleSubmit}>
          <div className="num-input-wrapper">
            <input
              ref={inputRef}
              type="text"
              inputMode={
                ['target', 'makex', 'primal', 'fermi'].includes(mode)
                  ? 'text'
                  : 'numeric'
              }
              className={`num-input ${isShake ? 'shake' : ''} ${isPop ? 'pop' : ''}`}
              value={inputValue}
              onChange={handleInputChange}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              placeholder={mode === 'fermi' ? "e.g., 6" : (mode === 'primal' ? "P or C" : "1")}
              disabled={finished}
              autoFocus
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
            {inputValue.trim() !== '' && (
              <button type="submit" className="num-inline-submit-btn" title="Submit Answer">
                <CornerDownLeft size={16} />
              </button>
            )}
          </div>
        </form>

        {mode === 'primal' && !finished && (
          <div className="num-primal-options">
            <button
              type="button"
              className="num-primal-btn num-primal-btn--prime"
              onClick={() => handlePrimalSubmit('p')}
            >
              Prime <span className="num-key-hint">P</span>
            </button>
            <button
              type="button"
              className="num-primal-btn num-primal-btn--composite"
              onClick={() => handlePrimalSubmit('c')}
            >
              Composite <span className="num-key-hint">C</span>
            </button>
          </div>
        )}
        {showFermiModal && fermiQuestion && (
          <div className="num-modal-overlay" onClick={() => setShowFermiModal(false)}>
            <div className="num-modal" onClick={e => e.stopPropagation()}>
              <span className="num-modal-tag">Fermi Question</span>
              <h2 className="num-modal-title">{fermiQuestion.q}</h2>
              <p className="num-modal-desc">{fermiQuestion.desc}</p>
              <button className="num-modal-close" onClick={() => setShowFermiModal(false)}>close</button>
            </div>
          </div>
        )}

        {selectedFermiDetail && (
          <div className="num-modal-overlay" onClick={() => setSelectedFermiDetail(null)}>
            <div className="num-modal" onClick={e => e.stopPropagation()}>
              <span className="num-modal-tag">
                {selectedFermiDetail.exact ? '✓ exact' : `~off by 1 · guessed 10^${selectedFermiDetail.guessed}`}
              </span>
              <h2 className="num-modal-title">{selectedFermiDetail.q}</h2>
              <p className="num-modal-desc">Answer: 10<sup>{selectedFermiDetail.exponent}</sup></p>
              <p className="num-modal-desc" style={{ opacity: 0.5, fontSize: '13px' }}>{selectedFermiDetail.desc}</p>
              <button className="num-modal-close" onClick={() => setSelectedFermiDetail(null)}>close</button>
            </div>
          </div>
        )}

        {message.text && (
          <div className={`num-message ${message.type}`}>{message.text}</div>
        )}

        <div className="num-found-area">
          {foundItems.map((w, i) => {
            const detail = foundItemDetails[i];
            return detail ? (
              <span
                key={i}
                className="num-found-item num-found-item--fermi"
                onClick={e => { e.stopPropagation(); setSelectedFermiDetail(detail); }}
                title="tap for details"
              >{w}</span>
            ) : (
              <span key={i} className="num-found-item">{w}</span>
            );
          })}
          {foundItems.length === 0 && !finished && (
            <span className="num-found-empty">ready.</span>
          )}
        </div>

        {fermiReveal && (
          <div className="num-reveal-overlay">
            <div className="num-reveal-box">
              <span className="num-reveal-tag">answer</span>
              <div className="num-reveal-exponent">10<sup>{fermiReveal.exponent}</sup></div>
              <div className="num-reveal-question">{fermiReveal.q}</div>
              <p className="num-reveal-desc">{fermiReveal.desc}</p>
              <button className="num-reveal-next" onClick={advanceFermi}>
                next &rarr; <span className="num-reveal-countdown">{revealCountdown}s</span>
              </button>
            </div>
          </div>
        )}

        {finished && (
          <div className="num-result-overlay">
            <div className="num-result-box">
              <div className="num-result-stats">
                <div className="num-result-item">
                  <span className="label">score</span>
                  <span className="value">{score}</span>
                  {pb.score === score && score > 0 && <span className="best-tag">PB</span>}
                </div>
                <div className="num-result-item">
                  <span className="label">solved</span>
                  <span className="value">{foundItems.length}</span>
                  {pb.items === foundItems.length && foundItems.length > 0 && <span className="best-tag">PB</span>}
                </div>
                <div className="num-result-item">
                  <span className="label">level</span>
                  <span className="value">{level}</span>
                  {pb.level === level && level > 1 && <span className="best-tag">PB</span>}
                </div>
              </div>

              <div className="num-result-items">
                {foundItems.map((w, i) => {
                  const detail = foundItemDetails[i];
                  return detail ? (
                    <span
                      key={i}
                      className="num-result-item-text num-found-item--fermi"
                      onClick={() => setSelectedFermiDetail(detail)}
                      title="tap for details"
                    >{w}</span>
                  ) : (
                    <span key={i} className="num-result-item-text">{w}</span>
                  );
                })}
              </div>

              <button className="num-retry-btn" onClick={() => newGame()}>RETRY</button>
            </div>
          </div>
        )}
      </main>

      {showHelp && (
        <div className="num-modal-overlay" onClick={() => setShowHelp(false)}>
          <div className="num-modal" onClick={e => e.stopPropagation()}>
            <span className="num-modal-tag">how to play</span>
            <h2 className="num-modal-title" style={{ fontSize: 20, fontWeight: 300, marginBottom: 8 }}>numism</h2>
            <p className="num-modal-desc">eleven math modes. pick one, solve problems.</p>
            <ul className="num-modal-help-list">
              {MODES.map(m => (
                <li key={m.id}><em>{m.name}</em> — {m.desc.toLowerCase()}</li>
              ))}
            </ul>
            <p className="num-modal-desc" style={{ marginTop: 16, marginBottom: 6, color: '#444', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em' }}>modifiers</p>
            <ul className="num-modal-help-list">
              <li><Trophy size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} /><em>progressive</em> — gets harder as you score</li>
              <li><Flame size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} /><em>hardcore</em> — wrong answer resets your score</li>
              <li><Skull size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} /><em>sudden death</em> — wrong costs time, right gains time</li>
            </ul>
            <button className="num-modal-close" onClick={() => setShowHelp(false)}>got it</button>
          </div>
        </div>
      )}

      <footer className="page-footer">
        <a href="https://mayinflight.com" className="footer-link" target="_blank" rel="noopener noreferrer">
          mayday <Flower size={14} strokeWidth={1.5} />
        </a>
      </footer>

      {isInputFocused && inputValue.trim() !== '' && !finished && (
        <div className="num-mobile-submit-bar">
          <button 
            type="button" 
            className="num-mobile-submit-btn"
            onMouseDown={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            Submit Answer <CornerDownLeft size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

const Dropdown = ({ id, label, value, options, onSelect, icon: Icon, activeMenu, setActiveMenu }) => (
  <div className="num-dropdown-wrap" onClick={e => e.stopPropagation()}>
    <button className={`num-nav-btn ${activeMenu === id ? 'active' : ''}`} onClick={() => setActiveMenu(activeMenu === id ? null : id)}>
      {Icon && <Icon size={14} />}
      <span className="num-nav-value">{value}</span> 
      <ChevronDown size={10} className={activeMenu === id ? 'rotated' : ''} />
    </button>
    {activeMenu === id && (
      <div className="num-dropdown-menu">
        {options.map(opt => (
          <div key={opt.val} className={`num-dropdown-item ${value === (opt.label || opt.val) ? 'selected' : ''}`} onClick={() => { onSelect(opt.val); setActiveMenu(null); }}>
            {opt.label || opt.val} {(value === (opt.label || opt.val)) && <Check size={10} />}
          </div>
        ))}
      </div>
    )}
  </div>
);
