export async function bubbleSort(a, tick, tone, setArray, setSrt) {
  const n = a.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      await tick([j, j+1], [], 'compare');
      if (a[j] > a[j+1]) {
        let t = a[j]; a[j] = a[j+1]; a[j+1] = t;
        setArray([...a]);
        tone(a[j+1]);
        await tick([], [j, j+1], 'swap');
      }
    }
    setSrt(p => [...p, n-i-1]);
  }
}

export async function selectionSort(a, tick, tone, setArray, setSrt) {
  const n = a.length;
  for (let i = 0; i < n; i++) {
    let min = i;
    for (let j = i + 1; j < n; j++) {
      await tick([j, min], [], 'compare');
      if (a[j] < a[min]) min = j;
    }
    if (min !== i) {
      let t = a[i]; a[i] = a[min]; a[min] = t;
      setArray([...a]);
      tone(a[i]);
      await tick([], [i, min], 'swap');
    }
    setSrt(p => [...p, i]);
  }
}

export async function insertionSort(a, tick, tone, setArray, setSrt) {
  const n = a.length;
  for (let i = 1; i < n; i++) {
    let key = a[i], j = i - 1;
    while (j >= 0 && a[j] > key) {
      await tick([j, j+1], [], 'compare');
      a[j+1] = a[j];
      setArray([...a]);
      tone(a[j+1]);
      await tick([], [j, j+1], 'swap');
      j--;
    }
    a[j+1] = key;
    setArray([...a]);
    setSrt(p => [...p, ...Array.from({length: i+1}, (_, x) => x)]);
  }
}

export async function gnomeSort(a, tick, tone, setArray, setSrt) {
  const n = a.length;
  let index = 0;
  while (index < n) {
    if (index === 0) index++;
    await tick([index, index - 1], [], 'compare');
    if (a[index] >= a[index - 1]) {
      index++;
    } else {
      let t = a[index]; a[index] = a[index-1]; a[index-1] = t;
      tone(a[index]);
      setArray([...a]);
      await tick([], [index, index - 1], 'swap');
      index--;
    }
  }
  setSrt(a.map((_, i) => i));
}

export async function oddEvenSort(a, tick, tone, setArray, setSrt) {
  const n = a.length;
  let sorted = false;
  while (!sorted) {
    sorted = true;
    for (let i = 1; i < n - 1; i += 2) {
      await tick([i, i + 1], [], 'compare');
      if (a[i] > a[i + 1]) {
        let t = a[i]; a[i] = a[i+1]; a[i+1] = t;
        tone(a[i]);
        setArray([...a]);
        await tick([], [i, i + 1], 'swap');
        sorted = false;
      }
    }
    for (let i = 0; i < n - 1; i += 2) {
      await tick([i, i + 1], [], 'compare');
      if (a[i] > a[i + 1]) {
        let t = a[i]; a[i] = a[i+1]; a[i+1] = t;
        tone(a[i]);
        setArray([...a]);
        await tick([], [i, i + 1], 'swap');
        sorted = false;
      }
    }
  }
  setSrt(a.map((_, i) => i));
}
