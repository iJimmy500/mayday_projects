export async function cocktailSort(a, tick, tone, setArray) {
  const n = a.length;
  let start = 0, end = n - 1, swapped = true;
  while (swapped) {
    swapped = false;
    for (let i = start; i < end; i++) {
      await tick([i, i + 1], []);
      if (a[i] > a[i + 1]) { [a[i], a[i + 1]] = [a[i + 1], a[i]]; tone(a[i]); setArray([...a]); await tick([], [i, i + 1]); swapped = true; }
    }
    if (!swapped) break;
    end--;
    for (let i = end - 1; i >= start; i--) {
      await tick([i, i + 1], []);
      if (a[i] > a[i + 1]) { [a[i], a[i + 1]] = [a[i + 1], a[i]]; tone(a[i]); setArray([...a]); await tick([], [i, i + 1]); swapped = true; }
    }
    start++;
  }
}

export async function combSort(a, tick, tone, setArray) {
  const n = a.length;
  let gap = n, shrink = 1.3, sorted = false;
  while (!sorted) {
    gap = Math.floor(gap / shrink);
    if (gap <= 1) { gap = 1; sorted = true; }
    for (let i = 0; i + gap < n; i++) {
      await tick([i, i + gap], []);
      if (a[i] > a[i + gap]) { [a[i], a[i + gap]] = [a[i + gap], a[i]]; tone(a[i]); setArray([...a]); await tick([], [i, i + gap]); sorted = false; }
    }
  }
}

export async function pancakeSort(a, tick, tone, setArray, setSrt) {
  const n = a.length;
  const flip = async (k) => {
    let left = 0;
    while (left < k) { [a[left], a[k]] = [a[k], a[left]]; tone(a[left]); setArray([...a]); await tick([left, k], [left, k]); left++; k--; }
  };
  for (let currSize = n; currSize > 1; currSize--) {
    let mi = 0;
    for (let i = 0; i < currSize; i++) { await tick([i, mi], []); if (a[i] > a[mi]) mi = i; }
    if (mi !== currSize - 1) { await flip(mi); await flip(currSize - 1); }
    setSrt(p => [...p, currSize - 1]);
  }
}

export async function cycleSort(a, tick, tone, setArray, setSrt) {
  const n = a.length;
  for (let cycleStart = 0; cycleStart < n - 1; cycleStart++) {
    let item = a[cycleStart], pos = cycleStart;
    for (let i = cycleStart + 1; i < n; i++) { await tick([i, cycleStart], []); if (a[i] < item) pos++; }
    if (pos === cycleStart) continue;
    while (item === a[pos]) pos++;
    [a[pos], item] = [item, a[pos]]; tone(a[pos]); setArray([...a]); await tick([], [pos]);
    while (pos !== cycleStart) {
      pos = cycleStart;
      for (let i = cycleStart + 1; i < n; i++) { await tick([i, cycleStart], []); if (a[i] < item) pos++; }
      while (item === a[pos]) pos++;
      [a[pos], item] = [item, a[pos]]; tone(a[pos]); setArray([...a]); await tick([], [pos]);
    }
    setSrt(p => [...p, cycleStart]);
  }
}
