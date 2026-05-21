import React from 'react';
import { Music, Mic2, Disc3 } from 'lucide-react';

export const TODAY        = new Date();
export const CURRENT_YEAR = TODAY.getFullYear();
export const MIN_YEAR     = 2005;
export const PAGE_SIZE    = 8;
export const QUIZ_SIZE    = 8;
export const MIN_LOADING_MS = 3200;

export const TODAY_LABEL = TODAY.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
export const TODAY_SHORT  = TODAY.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export const YEARS = Array.from(
  { length: CURRENT_YEAR - MIN_YEAR },
  (_, i) => CURRENT_YEAR - 1 - i
);

export const LOADING_LINES = [
  'what do you think you got?',
  'digging through the archives…',
  'hope you had good taste back then.',
  'rewinding the tape…',
  "let's see what you were on…",
  'pulling up the receipts…',
  'this might be embarrassing.',
  'almost there…',
];

export const SCORE_MSGS = [
  { min: 8, msg: 'you know yourself too well.' },
  { min: 6, msg: 'solid memory. not bad.' },
  { min: 4, msg: 'close, but the brain lied a little.' },
  { min: 2, msg: 'were you even paying attention?' },
  { min: 0, msg: 'you were definitely not there for this.' },
];

export const CAT_META = {
  tracks:  { label: 'Tracks',  icon: <Music size={15} />, fallback: <Music size={16} />,  secondary: i => i.artist },
  artists: { label: 'Artists', icon: <Mic2  size={15} />, fallback: <Mic2  size={16} />,  secondary: () => null },
  albums:  { label: 'Albums',  icon: <Disc3 size={15} />, fallback: <Disc3 size={16} />,  secondary: i => i.artist },
};

export function itemKey(item, cat) {
  return cat === 'artists' ? item.name : `${item.name}||${item.artist}`;
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
