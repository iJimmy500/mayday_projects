import React, { useState, useEffect } from 'react';
import Setup from './Setup';
import BracketView from './BracketView';
import { STORAGE_KEY } from './presets';
import { buildRounds, shuffle, applyWinner, fitSize } from './bracket';
import './Brackets.css';

export default function Brackets() {
  const [stage, setStage] = useState('setup');
  const [title, setTitle] = useState('My Bracket');
  const [entries, setEntries] = useState([]);
  const [size, setSize] = useState(8);
  const [rounds, setRounds] = useState(null);
  const [champion, setChampion] = useState(null);
  const [activePreset, setActivePreset] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const s = JSON.parse(raw);
      if (!s.rounds) return;
      setTitle(s.title || 'My Bracket');
      setEntries(s.entries || []);
      setSize(s.size || 8);
      setRounds(s.rounds);
      setChampion(s.champion || null);
      setActivePreset(s.activePreset || null);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (stage === 'bracket' && rounds) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ title, entries, size, rounds, champion, activePreset }));
      } catch { /* ignore */ }
    }
  }, [stage, title, entries, size, rounds, champion, activePreset]);

  const start = (shuffleSeed) => {
    const valid = entries.filter(e => e.name.trim());
    if (valid.length < 2) return;
    const usable = Math.min(size, fitSize(valid.length));
    setSize(usable);
    setRounds(buildRounds(shuffleSeed ? shuffle(valid) : valid, usable));
    setChampion(null);
    setStage('bracket');
  };

  const pickWinner = (roundIdx, matchIdx, winner) => {
    if (!winner) return;
    const result = applyWinner(rounds, roundIdx, matchIdx, winner);
    setRounds(result.rounds);
    if (result.champion !== undefined) setChampion(result.champion);
  };

  const reset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setRounds(null);
    setChampion(null);
    setStage('setup');
  };

  if (stage === 'bracket') {
    return (
      <div className="bk-root">
        <BracketView
          title={title}
          rounds={rounds}
          champion={champion}
          onPick={pickWinner}
          onReset={reset}
          onEdit={() => setStage('setup')}
        />
      </div>
    );
  }

  return (
    <div className="bk-root">
      <Setup
        title={title} setTitle={setTitle}
        entries={entries} setEntries={setEntries}
        size={size} setSize={setSize}
        activePreset={activePreset} setActivePreset={setActivePreset}
        onStart={start}
        hasInProgress={!!rounds}
        onResume={() => setStage('bracket')}
      />
    </div>
  );
}
