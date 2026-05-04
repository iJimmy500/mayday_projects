import { useState, useEffect, useCallback } from 'react';
import { Copy, RefreshCw, Check, Flower, Download } from 'lucide-react';
import './Randomizer.css';

export default function Randomizer() {
  const [tabs, setTabs] = useState(['password', 'name', 'word', 'number', 'color', 'decision', 'shuffle']);
  const [activeTab, setActiveTab] = useState('password');
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(100);
  const [length, setLength] = useState(16);
  const [config, setConfig] = useState({ uppercase: true, lowercase: true, numbers: true, symbols: true });
  const [count, setCount] = useState(1);
  const [startingLetter, setStartingLetter] = useState('');
  const [shuffleInput, setShuffleInput] = useState('');
  const [shuffleMode, setShuffleMode] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [dataPools, setDataPools] = useState({ names: [], words: [] });

  useEffect(() => {
    // Deep link check
    const urlParams = new URLSearchParams(window.location.search);
    const tool = urlParams.get('tool');
    
    // Randomize initial tab and order
    const initialTabs = [...tabs].sort(() => Math.random() - 0.5);
    setTabs(initialTabs);

    if (tool && tabs.includes(tool.toLowerCase())) {
      setActiveTab(tool.toLowerCase());
    } else {
      setActiveTab(initialTabs[Math.floor(Math.random() * initialTabs.length)]);
    }

    const loadFiles = async () => {
      const files = [
        { name: 'names', paths: ['/txtFiles/first-names.txt', '/txtFiles/common-names.txt', '/txtFiles/names-ssa.txt'] },
        { name: 'words', paths: ['/txtFiles/words.txt'] }
      ];
      let pools = { names: [], words: [] };
      for (const group of files) {
        for (const path of group.paths) {
          try {
            const res = await fetch(path);
            if (!res.ok) continue;
            const text = await res.text();
            let lines = text.split('\n').map(l => l.trim()).filter(l => l !== '');
            if (path.includes('names-ssa.txt')) lines = lines.map(line => line.split(',')[0]);
            pools[group.name] = [...pools[group.name], ...lines];
          } catch (e) { }
        }
      }
      setDataPools(pools);
    };
    loadFiles();
  }, []);

  const generatePassword = useCallback(() => {
    const charset = { uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', lowercase: 'abcdefghijklmnopqrstuvwxyz', numbers: '0123456789', symbols: '!@#$%^&*()_+~`|}{[]:;?><,./-=' };
    let characters = '';
    if (config.uppercase) characters += charset.uppercase;
    if (config.lowercase) characters += charset.lowercase;
    if (config.numbers) characters += charset.numbers;
    if (config.symbols) characters += charset.symbols;
    if (characters === '') return 'Select options';
    let res = '';
    for (let i = 0; i < length; i++) res += characters.charAt(Math.floor(Math.random() * characters.length));
    return res;
  }, [config, length]);

  const generateRandom = useCallback(() => {
    setIsAnimating(true);
    if (activeTab === 'number') {
      const finalVal = Math.floor(Math.random() * (max - min + 1)) + min;
      let iterations = 8, current = 0;
      const interval = setInterval(() => {
        setResult(Math.floor(Math.random() * (max - min + 1)) + min);
        if (++current >= iterations) {
          clearInterval(interval);
          setResult(finalVal);
          setIsAnimating(false);
        }
      }, 40);
      return;
    }

    setTimeout(() => {
      let newResult = '';
      if (activeTab === 'password') {
        newResult = generatePassword();
      } else if (activeTab === 'color') {
        newResult = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase();
      } else if (activeTab === 'decision') {
        const answers = ['Yes', 'No', 'Maybe', 'Definitely', 'Absolutely Not', 'Try Again', 'Not Today', 'Error: Gemini API failed', 'API Error: Rate limit exceeded', '500 Internal Server Error', 'Unexpected token in JSON', '404: Answer not found'];
        newResult = answers[Math.floor(Math.random() * answers.length)];
      } else if (activeTab === 'word' || activeTab === 'name') {
        let pool = activeTab === 'name' ? dataPools.names : dataPools.words;
        if (startingLetter) {
          const filtered = pool.filter(item => item.toLowerCase().startsWith(startingLetter.toLowerCase()));
          if (filtered.length > 0) pool = filtered;
        }
        let results = [];
        for (let i = 0; i < count; i++) results.push(pool[Math.floor(Math.random() * pool.length)]);
        newResult = results.join(', ') || 'No data loaded';
      } else if (activeTab === 'shuffle') {
        const items = shuffleInput.split(/[,\n]/).map(i => i.trim()).filter(i => i !== '');
        if (items.length === 0) {
          newResult = 'Enter items below';
        } else if (shuffleMode === 'one') {
          newResult = items[Math.floor(Math.random() * items.length)];
        } else {
          newResult = items.sort(() => Math.random() - 0.5).join(', ');
        }
      }
      setResult(newResult);
      setIsAnimating(false);
    }, 150);
  }, [activeTab, count, min, max, dataPools, generatePassword, startingLetter, shuffleInput, shuffleMode]);

  useEffect(() => { generateRandom(); }, [activeTab, generateRandom]);

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="wishlist-page generator-theme">
      <header>
        <div className="header-flex">
          <h1>Generator</h1>
          <button className="icon-btn-text" onClick={() => setShowModal(true)}>Files</button>
        </div>
      </header>

      <main className="minimal-gen">
        <div className="gen-type-selector">
          {tabs.map(tab => {
            const labels = {
              password: 'Pass',
              name: 'Name',
              word: 'Word',
              number: '123',
              color: 'Color',
              decision: 'Choice',
              shuffle: 'Mix'
            };
            return (
              <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>
                {labels[tab] || tab}
              </button>
            );
          })}
        </div>

        <div className="main-result-container">
          <div className={`result-row fuchsia-glow ${isAnimating ? 'animating' : ''}`} onClick={copyToClipboard} style={activeTab === 'color' && result.toString().startsWith('#') ? { backgroundColor: `${result}33`, border: `1px solid ${result}66`, '--glow-color': result } : {}}>
            <div className="result-content-wrapper">
              <span className={`result-val ${isAnimating && activeTab !== 'number' ? 'fade' : ''}`}>{result}</span>
            </div>
            <div className="result-meta">{copied ? <Check size={14} className="success-icon" /> : <Copy size={14} />}</div>
          </div>
          <button className={`regenerate-trigger ${isAnimating ? 'spin' : ''}`} onClick={generateRandom}><RefreshCw size={14} /> Tap to Refresh</button>
        </div>

        <div className="config-section">
          {activeTab === 'shuffle' && (
            <div className="config-row-full">
              <div className="shuffle-header">
                <div className="text-toggle small">
                  <span className={shuffleMode === 'all' ? 'active' : ''} onClick={() => setShuffleMode('all')}>Shuffle List</span>
                  <span className={shuffleMode === 'one' ? 'active' : ''} onClick={() => setShuffleMode('one')}>Pick Winner</span>
                </div>
                <button className="icon-btn-text" style={{ fontSize: '10px', padding: '2px 6px', marginTop: 0 }} onClick={() => setShuffleInput('')}>Clear</button>
              </div>
              <textarea className="shuffle-area" placeholder="Add items (comma or enter)..." value={shuffleInput} onChange={(e) => setShuffleInput(e.target.value)} />
            </div>
          )}
          {(activeTab === 'word' || activeTab === 'name') && (
            <>
              <div className="config-row"><span className="config-label">Starts With</span><div className="config-control"><input type="text" className="num-input char-input" maxLength={1} placeholder="Any" value={startingLetter} onChange={(e) => setStartingLetter(e.target.value)} /></div></div>
              <div className="config-row"><span className="config-label">Count</span><div className="config-control"><input type="range" min="1" max="10" value={count} onChange={(e) => setCount(parseInt(e.target.value))} /><span className="val-display">{count}</span></div></div>
            </>
          )}
          {activeTab === 'password' && (
            <>
              <div className="config-row"><span className="config-label">Length</span><div className="config-control"><input type="range" min="8" max="64" value={length} onChange={(e) => setLength(parseInt(e.target.value))} /><span className="val-display">{length}</span></div></div>
              <div className="config-grid">{Object.keys(config).map(key => (<div key={key} className="config-toggle" onClick={() => setConfig({ ...config, [key]: !config[key] })}><span className={config[key] ? 'active' : ''}>{key}</span></div>))}</div>
            </>
          )}
          {activeTab === 'number' && (
            <>
              <div className="config-row"><span className="config-label">Min</span><div className="config-control"><input type="number" className="num-input" value={min} onChange={(e) => setMin(parseInt(e.target.value) || 0)} /></div></div>
              <div className="config-row"><span className="config-label">Max</span><div className="config-control"><input type="number" className="num-input" value={max} onChange={(e) => setMax(parseInt(e.target.value) || 0)} /></div></div>
            </>
          )}
        </div>
      </main>

      <footer className="page-footer">
        <a href="https://mayinflight.com" className="footer-link" target="_blank" rel="noopener noreferrer">mayday <Flower size={14} strokeWidth={1.5} /></a>
      </footer>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Source Files</h2><button className="close-btn" onClick={() => setShowModal(false)}>&times;</button></div>
            <div className="file-list">
              {[
                { name: 'words.txt', path: '/txtFiles/words.txt' }, 
                { name: 'first-names.txt', path: '/txtFiles/first-names.txt' }, 
                { name: 'common-names.txt', path: '/txtFiles/common-names.txt' }, 
                { name: 'names-ssa.txt', path: '/txtFiles/names-ssa.txt' }
              ].map(file => (
                <div key={file.name} className="file-item">
                  <span className="file-name">{file.name}</span>
                  <a href={file.path} download className="icon-btn"><Download size={14} /></a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
