let _idc = 0;
export const uid = () => `e${Date.now().toString(36)}${(_idc++).toString(36)}`;

export const isImageUrl = (s) => typeof s === 'string' && /^(https?:|data:|blob:|\/)/.test(s);

export const fitSize = (count) =>
  count <= 4 ? 4 : count <= 8 ? 8 : count <= 16 ? 16 : 32;

export const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export function buildRounds(entries, size) {
  const slots = [...entries.slice(0, size)];
  while (slots.length < size) slots.push(null);

  const first = [];
  for (let i = 0; i < slots.length; i += 2) {
    const a = slots[i];
    const b = slots[i + 1];
    let winnerId = null;
    if (a && !b) winnerId = a.id;
    else if (!a && b) winnerId = b.id;
    first.push({ a, b, winnerId });
  }

  const rounds = [first];
  let count = first.length;
  while (count > 1) {
    count = Math.ceil(count / 2);
    rounds.push(Array.from({ length: count }, () => ({ a: null, b: null, winnerId: null })));
  }
  return rounds;
}

export const roundName = (idx, total) => {
  const fromEnd = total - 1 - idx;
  if (fromEnd === 0) return 'Final';
  if (fromEnd === 1) return 'Semifinals';
  if (fromEnd === 2) return 'Quarterfinals';
  return `Round of ${Math.pow(2, fromEnd + 1)}`;
};

export function applyWinner(rounds, roundIdx, matchIdx, winner) {
  const next = rounds.map(r => r.map(m => ({ ...m })));
  next[roundIdx][matchIdx].winnerId = winner.id;
  let champion = undefined;

  const clearDownstream = (rIdx, mIdx) => {
    let r = rIdx, m = mIdx;
    while (next[r]) {
      if (next[r][m]) next[r][m].winnerId = null;
      const nr = next[r + 1];
      if (!nr) { champion = null; break; }
      const ti = Math.floor(m / 2);
      const slot = m % 2 === 0 ? 'a' : 'b';
      if (nr[ti][slot]) nr[ti][slot] = null;
      r += 1; m = ti;
    }
  };

  const nextRound = next[roundIdx + 1];
  if (!nextRound) {
    champion = winner;
  } else {
    const ti = Math.floor(matchIdx / 2);
    const slot = matchIdx % 2 === 0 ? 'a' : 'b';
    const target = nextRound[ti];
    if (target[slot] && target[slot].id !== winner.id) clearDownstream(roundIdx + 1, ti);
    target[slot] = winner;
    if (target.winnerId && target.winnerId !== (target.a && target.a.id) && target.winnerId !== (target.b && target.b.id)) {
      target.winnerId = null;
    }
  }

  return { rounds: next, champion };
}

export function countProgress(rounds) {
  let done = 0, total = 0;
  rounds.forEach(r => r.forEach(m => {
    if (m.a && m.b) { total++; if (m.winnerId) done++; }
  }));
  return { done, total };
}
