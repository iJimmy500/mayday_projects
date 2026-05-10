export async function capitalistSort(a, tick, tone, setArray) {
  const n = a.length;
  let maxIdx = 0;
  for (let i = 1; i < n; i++) {
    await tick([i, maxIdx], []);
    if (a[i] > a[maxIdx]) maxIdx = i;
  }
  let total = 0;
  for (let i = 0; i < n; i++) {
    if (i !== maxIdx) {
      total += a[i] - 5;
      a[i] = 5; tone(5); setArray([...a]); await tick([i], [i, maxIdx]);
    }
  }
  a[maxIdx] += total; tone(a[maxIdx]); setArray([...a]); await tick([], [maxIdx]);
}

export async function communistSort(a, tick, tone, setArray) {
  const n = a.length;
  let sum = a.reduce((acc, v) => acc + v, 0);
  let avg = sum / n;
  for (let i = 0; i < n; i++) {
    a[i] = avg; tone(avg); setArray([...a]); await tick([i], [i]);
  }
}

export async function bogoSort(a, tick, tone, setArray) {
  const n = a.length;
  const isSorted = (arr) => {
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] > arr[i + 1]) return false;
    }
    return true;
  };

  while (!isSorted(a)) {
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
      tone(a[i]);
      setArray([...a]);
      await tick([i, j], [i, j]);
    }
  }
}

export async function stalinSort(a, tick, tone, setArray, setSrt) {
  let i = 0;
  while (i < a.length - 1) {
    await tick([i, i + 1], []);
    if (a[i] > a[i + 1]) {
      // Eliminate the element
      a.splice(i + 1, 1);
      tone(10);
      setArray([...a]);
      await tick([], [i]);
    } else {
      i++;
    }
  }
}

export async function stoogeSort(a, tick, tone, setArray) {
  const sort = async (l, h) => {
    await tick([l, h], []);
    if (a[l] > a[h]) {
      [a[l], a[h]] = [a[h], a[l]];
      tone(a[l]);
      setArray([...a]);
      await tick([], [l, h]);
    }
    if (h - l + 1 > 2) {
      let t = Math.floor((h - l + 1) / 3);
      await sort(l, h - t);
      await sort(l + t, h);
      await sort(l, h - t);
    }
  };
  await sort(0, a.length - 1);
}

export async function quantumBogoSort(a, tick, tone, setArray) {
  // Destroy all universes where it isn't sorted
  // In this universe, it's instantly sorted.
  await tick(a.map((_, i) => i), []);
  a.sort((x, y) => x - y);
  tone(100);
  setArray([...a]);
  await tick([], a.map((_, i) => i));
}

export async function slowSort(a, tick, tone, setArray) {
  const sort = async (i, j) => {
    if (i >= j) return;
    let m = Math.floor((i + j) / 2);
    await sort(i, m);
    await sort(m + 1, j);
    await tick([m, j], []);
    if (a[m] > a[j]) {
      [a[m], a[j]] = [a[j], a[m]];
      tone(a[m]);
      setArray([...a]);
      await tick([], [m, j]);
    }
    await sort(i, j - 1);
  };
  await sort(0, a.length - 1);
}

export async function coinSort(a, tick, tone, setArray) {
  const n = a.length;
  let swapped = true;
  while (swapped) {
    swapped = false;
    for (let i = 0; i < n - 1; i++) {
      await tick([i, i + 1], []);
      // Flip a coin
      if (Math.random() > 0.5) {
        if (a[i] > a[i + 1]) {
          [a[i], a[i + 1]] = [a[i + 1], a[i]];
          tone(a[i]);
          setArray([...a]);
          await tick([], [i, i + 1]);
          swapped = true;
        }
      }
    }
  }
}

export async function existentialSort(a, tick, tone, setArray) {
  const n = a.length;
  // It's back! Restricted to very small arrays to avoid "forever" behavior.
  while (true) {
    const i = Math.floor(Math.random() * n);
    const j = Math.floor(Math.random() * n);
    await tick([i, j], []);
    if (Math.random() > 0.5) {
      [a[i], a[j]] = [a[j], a[i]];
      tone(a[i]);
      setArray([...a]);
      await tick([], [i, j]);
    }
    if (Math.random() > 0.95) {
      const k = Math.floor(Math.random() * n);
      a[k] = Math.random() * 100;
      setArray([...a]);
    }
    await new Promise(r => setTimeout(r, 50));
  }
}

export async function frustrationSort(a, tick, tone, setArray) {
  const n = a.length;
  let progress = 0;
  
  while (true) {
    // Bubble sort steps
    for (let i = 0; i < n - 1; i++) {
      await tick([i, i + 1], []);
      if (a[i] > a[i + 1]) {
        [a[i], a[i + 1]] = [a[i + 1], a[i]];
        tone(a[i]);
        setArray([...a]);
        await tick([], [i, i + 1]);
      }
    }
    
    // Check "progress" (how many are in order)
    let inOrder = 0;
    for (let i = 0; i < n - 1; i++) if (a[i] <= a[i+1]) inOrder++;
    
    // If we're nearly there... mess up.
    if (inOrder / n > 0.8) {
      // "Oops..."
      await tick(a.map((_, i) => i), a.map((_, i) => i));
      // Shuffle roughly
      for (let i = n - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      tone(5);
      setArray([...a]);
      await tick([], []);
    }
  }
}

export async function crashSort(a, tick, tone, setArray) {
  const n = a.length;
  // Sort normally for a bit
  for (let i = 0; i < Math.floor(n / 2); i++) {
    for (let j = 0; j < n - i - 1; j++) {
      await tick([j, j + 1], []);
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        tone(a[j]);
        setArray([...a]);
        await tick([], [j, j + 1]);
      }
    }
  }
  
  // FAKE CRASH
  await tick(a.map((_, i) => i), []);
  throw new Error('Fatal Error: Access violation at 0x00000000. The memory could not be "read".');
}
