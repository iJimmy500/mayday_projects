import { useState, useEffect, useCallback, useRef } from 'react';
import { Flower, BookOpen } from 'lucide-react';
import { MAX_WRONG } from './constants';
import { fetchPool, fetchCommonSet, fetchDefinition } from './wordApi';
import TopBar    from './TopBar';
import WordDisplay from './WordDisplay';
import Keyboard  from './Keyboard';
import LivesPips from './LivesPips';
import HelpModal from './HelpModal';
import '../GraphingCalc.css';

export default function Ghost() {
  const [length, setLength]         = useState(6);
  const [word, setWord]             = useState('');
  const [guessed, setGuessed]       = useState(new Set());
  const [endState, setEndState]     = useState(null);
  const [stats, setStats]           = useState({ streak: 0, wins: 0, losses: 0 });
  const [loading, setLoading]       = useState(false);
  const [loadErr, setLoadErr]       = useState(false);
  const [shakeWord, setShakeWord]   = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [commonOnly, setCommonOnly] = useState(false);
  const [commonSet, setCommonSet]   = useState(null);
  const [commonLoading, setCommonLoading] = useState(false);
  const [definition, setDefinition] = useState(null);
  const [hintVisible, setHintVisible] = useState(false);
  const [showHelp, setShowHelp]     = useState(false);

  const poolRef = useRef({});

  const wrong        = word ? [...guessed].filter(l => !word.includes(l)).length : 0;
  const wrongLetters = word ? [...guessed].filter(l => !word.includes(l)) : [];
  const isWon        = word ? [...word].every(l => guessed.has(l)) : false;
  const isLost       = wrong >= MAX_WRONG;

  useEffect(() => {
    if (!word || endState) return;
    if (isWon)  { setEndState('win');  setStats(s => ({ ...s, wins: s.wins + 1, streak: s.streak + 1 })); }
    if (isLost) { setEndState('lose'); setStats(s => ({ ...s, losses: s.losses + 1, streak: 0 })); }
  }, [guessed]);

  const startGame = useCallback(async (len, cSet) => {
    setLoading(true);
    setLoadErr(false);
    setDefinition(null);
    setHintVisible(false);
    const activeCommon = cSet !== undefined ? cSet : commonSet;
    const cacheKey = `${len}_${activeCommon ? 'common' : 'all'}`;
    try {
      let pool = poolRef.current[cacheKey];
      if (!pool) {
        pool = await fetchPool(len, activeCommon);
        poolRef.current[cacheKey] = pool;
      }
      if (!pool.length) throw new Error('empty');
      const picked = pool[Math.floor(Math.random() * pool.length)];
      setWord(picked);
      setGuessed(new Set());
      setEndState(null);
      fetchDefinition(picked).then(setDefinition);
    } catch {
      setLoadErr(true);
    }
    setLoading(false);
  }, [commonSet]);

  useEffect(() => { startGame(length); }, []);

  const guess = useCallback((letter) => {
    if (!word || endState || loading) return;
    const l = letter.toUpperCase();
    if (guessed.has(l)) return;
    if (!word.includes(l)) {
      setShakeWord(true);
      setTimeout(() => setShakeWord(false), 400);
    }
    setGuessed(prev => new Set([...prev, l]));
  }, [word, guessed, endState, loading]);

  useEffect(() => {
    const h = (e) => {
      if (endState && e.key === 'Enter') { startGame(length); return; }
      if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) guess(e.key);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [guess, endState, length]);

  useEffect(() => {
    const close = () => setActiveMenu(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  const handleSelectLength = (len) => {
    setLength(len);
    setActiveMenu(null);
    startGame(len);
  };

  const handleToggleCommon = async () => {
    const next = !commonOnly;
    setCommonOnly(next);
    setActiveMenu(null);
    if (next && !commonSet) {
      setCommonLoading(true);
      const fetched = await fetchCommonSet();
      setCommonSet(fetched);
      setCommonLoading(false);
      startGame(length, fetched);
    } else {
      startGame(length, next ? commonSet : null);
    }
  };

  return (
    <div className="gh-theme">
      <main className="gh-main">

        <TopBar
          length={length}
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          commonOnly={commonOnly}
          commonLoading={commonLoading}
          onSelectLength={handleSelectLength}
          onToggleCommon={handleToggleCommon}
          onNewWord={() => startGame(length)}
          onHelp={() => setShowHelp(true)}
        />

        <div className="gh-live-stats">
          <span>streak <strong>{stats.streak}</strong></span>
          <span>wins <strong>{stats.wins}</strong></span>
          {word && <span className={wrong >= 4 ? 'urgent' : ''}>{wrong}/{MAX_WRONG} wrong</span>}
        </div>

        <div className={`gh-word-area${shakeWord ? ' shake' : ''}`}>
          {loading  && <div className="gh-loading-dots"><span /><span /><span /></div>}
          {loadErr  && <p className="gh-err">couldn't load words.</p>}
          {word && !loading && <WordDisplay word={word} guessed={guessed} endState={endState} />}
        </div>

        {word && !loading && definition && !endState && (
          <div className="gh-hint-area">
            {hintVisible
              ? <p className="gh-hint-text">{definition}</p>
              : <button className="gh-hint-btn" onClick={() => setHintVisible(true)}>
                  <BookOpen size={12} /><span>show hint</span>
                </button>
            }
          </div>
        )}

        {word && !loading && (
          <div className="gh-status-row">
            <LivesPips wrong={wrong} />
            <span className="gh-wrong-letters">
              {wrongLetters.length > 0
                ? wrongLetters.join('  ')
                : <span className="gh-wrong-empty">—</span>}
            </span>
          </div>
        )}

        {word && !loading && !endState && (
          <Keyboard word={word} guessed={guessed} onGuess={guess} />
        )}

        {endState && (
          <div className="gh-end">
            <div className={`gh-end-status ${endState}`}>
              {endState === 'win' ? 'got it.' : 'lost.'}
            </div>
            <div className="gh-end-word">{word}</div>
            {definition && <p className="gh-end-def">{definition}</p>}
            <div className="gh-end-actions">
              <button className="gh-retry-btn" onClick={() => startGame(length)}>
                new word <span className="gh-enter-hint">↵</span>
              </button>
            </div>
          </div>
        )}

      </main>

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

      <footer className="gh-footer">
        <a href="https://mayinflight.com" className="gh-footer-link" target="_blank" rel="noopener noreferrer">
          ghost &nbsp;<Flower size={13} strokeWidth={1.5} />
        </a>
      </footer>
    </div>
  );
}
