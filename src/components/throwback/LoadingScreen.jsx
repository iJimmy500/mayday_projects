import React, { useState, useEffect, useRef } from 'react';
import { TODAY_LABEL, LOADING_LINES, shuffle } from './constants';

export default function LoadingScreen({ user, year }) {
  const lines   = useRef(shuffle(LOADING_LINES));
  const [lineIdx, setLineIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const cycle = () => {
      setVisible(false);
      setTimeout(() => {
        setLineIdx(i => (i + 1) % lines.current.length);
        setVisible(true);
      }, 350);
    };
    const iv = setInterval(cycle, 2200);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="tb-fade-in tb-loading-page">
      <div className="tb-eq">
        {[1, 2, 3, 4, 5].map(i => <span key={i} className={`tb-eq-bar tb-eq-bar--${i}`} />)}
      </div>
      <p className={`tb-loading-label${visible ? '' : ' tb-loading-label--out'}`}>
        {lines.current[lineIdx]}
      </p>
      <p className="tb-loading-sub">{TODAY_LABEL}, {year} · @{user}</p>
    </div>
  );
}
