import { useState, useMemo, useCallback } from 'react';
import { Shuffle, Flower, Globe } from 'lucide-react';
import { CATEGORIES, PRESETS } from './conversions';
import GameHub from './GameHub';
import './WorldConversion.css';

const CATEGORY_IDS = Object.keys(CATEGORIES);

const SORT_OPTIONS = [
  { id: 'relatable', label: 'most relatable' },
  { id: 'largest',   label: 'largest first'  },
  { id: 'smallest',  label: 'smallest first' },
];

function formatCount(n) {
  if (!isFinite(n) || n <= 0) return null;
  if (n >= 1e18) return n.toExponential(2);
  if (n >= 1e15) return `${parseFloat((n / 1e15).toPrecision(3))} quadrillion`;
  if (n >= 1e12) return `${parseFloat((n / 1e12).toPrecision(3))} trillion`;
  if (n >= 1e9)  return `${parseFloat((n / 1e9).toPrecision(3))} billion`;
  if (n >= 1e6)  return `${parseFloat((n / 1e6).toPrecision(3))} million`;
  if (n >= 1000) return Math.round(n).toLocaleString();
  if (n >= 100)  return parseFloat(n.toFixed(1)).toLocaleString();
  if (n >= 10)   return parseFloat(n.toFixed(2)).toLocaleString();
  if (n >= 1)    return parseFloat(n.toPrecision(4)).toString();
  if (n >= 0.01) return parseFloat(n.toPrecision(2)).toString();
  return null;
}

function toInputStr(n) {
  if (n >= 1e6) return n.toExponential(n >= 1e9 ? 4 : 3).replace(/\.?0+(e)/, '$1');
  return String(n);
}

function ResultCard({ unit, result }) {
  const formatted = formatCount(result);
  const isFlipped = result < 0.01 && result > 0;

  if (!formatted && !isFlipped) return null;

  return (
    <div className={`wc-card${isFlipped ? ' wc-card--flipped' : ''}`}>
      <div className="wc-card-top">
        {isFlipped ? (
          <span className="wc-card-number wc-card-number--dim">
            1 in {Math.round(1 / result).toLocaleString()}
          </span>
        ) : (
          <span className="wc-card-number">{formatted}</span>
        )}
      </div>
      <div className="wc-card-label">{unit.label}</div>
      {unit.hint && <div className="wc-card-hint">{unit.hint}</div>}
    </div>
  );
}

export default function WorldConversion() {
  const [activeTab, setActiveTab] = useState(() =>
    window.location.pathname.startsWith('/convert/game') ? 'game' : 'tool'
  );

  const switchTab = useCallback((tab) => {
    setActiveTab(tab);
    history.replaceState(null, '', tab === 'game' ? '/convert/game' : '/convert');
  }, []);

  const [categoryId,     setCategoryId]     = useState('area');
  const [rawInput,       setRawInput]       = useState('');
  const [activePresetId, setActivePresetId] = useState(null);
  const [sortMode,       setSortMode]       = useState('relatable');

  const category = CATEGORIES[categoryId];

  const inputValue = useMemo(() => {
    const n = parseFloat(rawInput.replace(/,/g, ''));
    return isFinite(n) && n > 0 ? n : 0;
  }, [rawInput]);

  const categoryPresets = useMemo(
    () => PRESETS.filter(p => p.category === categoryId),
    [categoryId]
  );

  const results = useMemo(() => {
    if (!inputValue) return [];
    const mapped = category.units
      .map(unit => ({ ...unit, result: inputValue / unit.value }))
      .filter(u => isFinite(u.result) && u.result > 0);

    if (sortMode === 'relatable') {
      return [...mapped].sort(
        (a, b) => Math.abs(Math.log10(a.result)) - Math.abs(Math.log10(b.result))
      );
    }
    if (sortMode === 'largest') return [...mapped].sort((a, b) => b.result - a.result);
    return [...mapped].sort((a, b) => a.result - b.result);
  }, [category, inputValue, sortMode]);

  const handlePreset = useCallback((preset) => {
    setActivePresetId(preset.id);
    setRawInput(toInputStr(preset.value));
  }, []);

  const handleCategory = useCallback((id) => {
    setCategoryId(id);
    setActivePresetId(null);
    setRawInput('');
  }, []);

  const handleShuffle = useCallback(() => {
    if (!categoryPresets.length) return;
    const pick = categoryPresets[Math.floor(Math.random() * categoryPresets.length)];
    handlePreset(pick);
  }, [categoryPresets, handlePreset]);

  const activePreset = categoryPresets.find(p => p.id === activePresetId) ?? null;

  return (
    <div className="wc-root">
      <header className="wc-header">
        <div className="wc-header-inner">
          <div className="wc-logo">
            <Globe size={15} strokeWidth={1.5} />
            <span>convert</span>
          </div>
          <div className="wc-tabs">
            <button
              className={`wc-tab${activeTab === 'tool' ? ' wc-tab--active' : ''}`}
              onClick={() => switchTab('tool')}
            >
              tool
            </button>
            <button
              className={`wc-tab${activeTab === 'game' ? ' wc-tab--active' : ''}`}
              onClick={() => switchTab('game')}
            >
              game
            </button>
          </div>
        </div>
      </header>

      {activeTab === 'tool' && (
        <>
          <div className="wc-category-scroll">
            <div className="wc-category-row">
              {CATEGORY_IDS.map(id => (
                <button
                  key={id}
                  className={`wc-cat-chip${categoryId === id ? ' wc-cat-chip--active' : ''}`}
                  onClick={() => handleCategory(id)}
                >
                  {CATEGORIES[id].label}
                </button>
              ))}
            </div>
          </div>

          <main className="wc-body">
            <section className="wc-input-section">
              <div className="wc-input-wrap">
                <input
                  className="wc-number-input"
                  type="text"
                  inputMode="decimal"
                  placeholder="type a number..."
                  value={rawInput}
                  onChange={e => {
                    setRawInput(e.target.value);
                    setActivePresetId(null);
                  }}
                  spellCheck={false}
                  autoComplete="off"
                />
                <span className="wc-unit-badge">{category.baseUnit}</span>
              </div>

              <div className="wc-input-meta">
                {activePreset ? (
                  <span className="wc-preset-desc">
                    <span className="wc-preset-desc-name">{activePreset.label}</span>
                    {activePreset.description && (
                      <span className="wc-preset-desc-detail"> — {activePreset.description}</span>
                    )}
                  </span>
                ) : (
                  <span className="wc-input-hint">
                    pick a preset below, or type any number in {category.baseUnit}
                  </span>
                )}
              </div>

              <div className="wc-presets-outer">
                <div className="wc-presets-scroll">
                  {categoryPresets.map(p => (
                    <button
                      key={p.id}
                      className={`wc-preset-chip${activePresetId === p.id ? ' wc-preset-chip--active' : ''}`}
                      onClick={() => handlePreset(p)}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <button className="wc-shuffle" onClick={handleShuffle} title="random preset">
                  <Shuffle size={13} />
                </button>
              </div>
            </section>

            {inputValue > 0 ? (
              <section className="wc-results-section">
                <div className="wc-results-bar">
                  <span className="wc-results-count">{results.length} comparisons</span>
                  <div className="wc-sort-group">
                    {SORT_OPTIONS.map(opt => (
                      <button
                        key={opt.id}
                        className={`wc-sort-btn${sortMode === opt.id ? ' wc-sort-btn--active' : ''}`}
                        onClick={() => setSortMode(opt.id)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="wc-grid">
                  {results.map(({ result, ...unit }) => (
                    <ResultCard key={unit.id} unit={unit} result={result} />
                  ))}
                </div>
                <p className="wc-estimate-note">
                  values are approximate — figures are based on widely cited averages and estimates
                </p>
              </section>
            ) : (
              <div className="wc-empty">
                <p>select a preset or enter a value to see comparisons</p>
              </div>
            )}
          </main>
        </>
      )}

      {activeTab === 'game' && <GameHub />}

      <footer className="page-footer">
        <a href="https://mayinflight.com" className="footer-link" target="_blank" rel="noopener noreferrer">
          mayday <Flower size={14} strokeWidth={1.5} />
        </a>
      </footer>
    </div>
  );
}
