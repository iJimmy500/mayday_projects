import React, { useState, useEffect, useRef } from 'react';
import { ALGORITHMS } from '../constants';
import { sleep } from '../utils';
import * as Basic from '../algorithms/basicSorts';
import * as Advanced from '../algorithms/advancedSorts';
import * as Exotic from '../algorithms/exoticSorts';
import * as Themed from '../algorithms/themedSorts';

const ALL_ALGO_FUNCS = { ...Basic, ...Advanced, ...Exotic, ...Themed };

export default function RaceCell({ algoId, array, speed, onDone, isRacing, useAudio, rank }) {
  const [arr, setArr]       = useState([...array]);
  const [cmp, setCmp]       = useState([]);
  const [swp, setSwp]       = useState([]);
  const [srt, setSrt]       = useState([]);
  const [done, setDone]     = useState(false);
  const killed = useRef(false);
  const audioCtx = useRef(null);

  const tone = (val) => {
    if (!useAudio) return;
    if (!audioCtx.current) audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
    try {
      const osc = audioCtx.current.createOscillator();
      const g   = audioCtx.current.createGain();
      osc.frequency.value = 150 + val * 12;
      osc.type = 'sine';
      g.gain.setValueAtTime(0.03, audioCtx.current.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, audioCtx.current.currentTime + 0.08);
      osc.connect(g); g.connect(audioCtx.current.destination);
      osc.start(); osc.stop(audioCtx.current.currentTime + 0.08);
    } catch (_) {}
  };

  useEffect(() => {
    if (!isRacing) {
      setArr([...array]);
      setCmp([]);
      setSwp([]);
      setSrt([]);
      setDone(false);
    }
  }, [array, isRacing]);

  useEffect(() => {
    if (!isRacing) return;
    killed.current = false;
    run();
    return () => { killed.current = true; };
  }, [isRacing]);

  const tick = async (c, s) => {
    if (killed.current) throw new Error('killed');
    setCmp(c); setSwp(s);
    await sleep(Math.max(2, 101 - speed));
  };

  const run = async () => {
    let a = [...array];
    const funcName = algoId + 'Sort';
    const func = ALL_ALGO_FUNCS[funcName];

    try {
      if (func) {
        await func(a, tick, tone, setArr, setSrt, speed, sleep);
      }
      setSrt(a.map((_,i) => i));
      setDone(true);
      onDone();
    } catch (_) {}
    setCmp([]); setSwp([]);
  };

  return (
    <div className={`race-cell ${done ? 'done' : ''}`}>
      <div className="race-cell-header">
        <span className="race-cell-name">{ALGORITHMS[algoId].name}</span>
        {rank && (
          <span className={`race-rank-badge ${rank === 1 ? 'gold' : ''}`}>
            {rank === 1 ? '1st' : rank === 2 ? '2nd' : rank === 3 ? '3rd' : `${rank}th`}
          </span>
        )}
      </div>
      <div className="race-bars">
        {arr.map((v, i) => (
          <div
            key={i}
            className={`mini-bar${srt.includes(i) ? ' sorted' : cmp.includes(i) ? ' comparing' : swp.includes(i) ? ' swapping' : ''}`}
            style={{ height: `${v}%` }}
          />
        ))}
      </div>
    </div>
  );
}
