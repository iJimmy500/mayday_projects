import { sleep } from '../utils';

export async function mergeSort(a, tick, tone, setArray, setSrt, speed) {
  const n = a.length;
  const ms = async (l, r) => {
    if (l >= r) return;
    const m = l + Math.floor((r-l)/2);
    await ms(l, m); await ms(m+1, r);
    const L = a.slice(l, m+1), R = a.slice(m+1, r+1);
    let i = 0, j = 0, k = l;
    while (i < L.length && j < R.length) {
      await tick([l+i, m+1+j], []);
      a[k++] = L[i] <= R[j] ? L[i++] : R[j++];
      setArray([...a]); tone(a[k-1]);
    }
    while (i < L.length) { a[k++] = L[i++]; setArray([...a]); await sleep(Math.max(2, 101-speed)); }
    while (j < R.length) { a[k++] = R[j++]; setArray([...a]); await sleep(Math.max(2, 101-speed)); }
    setSrt(p => [...p, ...Array.from({length: r-l+1}, (_,x) => l+x)]);
  };
  await ms(0, n-1);
}

export async function quickSort(a, tick, tone, setArray, setSrt) {
  const n = a.length;
  const partition = async (l, h) => {
    const pivot = a[h];
    let i = l - 1;
    for (let j = l; j < h; j++) {
      await tick([j, h], []);
      if (a[j] < pivot) { i++; [a[i], a[j]] = [a[j], a[i]]; tone(a[i]); setArray([...a]); await tick([], [i,j]); }
    }
    [a[i+1], a[h]] = [a[h], a[i+1]]; setArray([...a]);
    setSrt(p => [...p, i+1]);
    return i+1;
  };
  const qs = async (l, h) => {
    if (l < h) { const pi = await partition(l, h); await qs(l, pi-1); await qs(pi+1, h); }
    else if (l === h) setSrt(p => [...p, l]);
  };
  await qs(0, n-1);
}

export async function heapSort(a, tick, tone, setArray, setSrt) {
  const n = a.length;
  const heapify = async (size, i) => {
    let largest = i;
    let left = 2 * i + 1, right = 2 * i + 2;
    if (left < size) { await tick([left, largest], []); if (a[left] > a[largest]) largest = left; }
    if (right < size) { await tick([right, largest], []); if (a[right] > a[largest]) largest = right; }
    if (largest !== i) {
      [a[i], a[largest]] = [a[largest], a[i]]; tone(a[i]); setArray([...a]); await tick([], [i, largest]);
      await heapify(size, largest);
    }
  };
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) await heapify(n, i);
  for (let i = n - 1; i > 0; i--) {
    [a[0], a[i]] = [a[i], a[0]]; tone(a[0]); setArray([...a]); await tick([], [0, i]);
    setSrt(p => [...p, i]);
    await heapify(i, 0);
  }
}

export async function shellSort(a, tick, tone, setArray, setSrt) {
  const n = a.length;
  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    for (let i = gap; i < n; i++) {
      let temp = a[i], j;
      for (j = i; j >= gap; j -= gap) {
        await tick([j, j - gap], []);
        if (a[j - gap] > temp) { a[j] = a[j - gap]; setArray([...a]); tone(a[j]); await tick([], [j, j - gap]); }
        else break;
      }
      a[j] = temp; setArray([...a]);
    }
  }
}

export async function radixSort(a, tick, tone, setArray) {
  const n = a.length;
  const getMax = () => {
    let max = a[0];
    for (let i = 1; i < n; i++) if (a[i] > max) max = a[i];
    return max;
  };
  const countSort = async (exp) => {
    let output = new Array(n), count = new Array(10).fill(0);
    for (let i = 0; i < n; i++) count[Math.floor(a[i] / exp) % 10]++;
    for (let i = 1; i < 10; i++) count[i] += count[i - 1];
    for (let i = n - 1; i >= 0; i--) {
      let digit = Math.floor(a[i] / exp) % 10;
      output[count[digit] - 1] = a[i];
      count[digit]--;
    }
    for (let i = 0; i < n; i++) { a[i] = output[i]; tone(a[i]); setArray([...a]); await tick([i], [i]); }
  };
  let m = getMax();
  for (let exp = 1; Math.floor(m / exp) > 0; exp *= 10) await countSort(exp);
}

export async function timSort(a, tick, tone, setArray, sleep) {
  const n = a.length, RUN = 8;
  const insertionSort = async (l, r) => {
    for (let i = l + 1; i <= r; i++) {
      let key = a[i], j = i - 1;
      while (j >= l && a[j] > key) {
        await tick([j, j + 1], []);
        a[j + 1] = a[j]; setArray([...a]); tone(a[j + 1]); j--;
      }
      a[j + 1] = key; setArray([...a]);
    }
  };
  const merge = async (l, m, r) => {
    const L = a.slice(l, m + 1), R = a.slice(m + 1, r + 1);
    let i = 0, j = 0, k = l;
    while (i < L.length && j < R.length) {
      await tick([l + i, m + 1 + j], []);
      a[k++] = L[i] <= R[j] ? L[i++] : R[j++];
      setArray([...a]); tone(a[k - 1]);
    }
    while (i < L.length) { a[k++] = L[i++]; setArray([...a]); await sleep(2); }
    while (j < R.length) { a[k++] = R[j++]; setArray([...a]); await sleep(2); }
  };
  for (let i = 0; i < n; i += RUN) await insertionSort(i, Math.min(i + RUN - 1, n - 1));
  for (let size = RUN; size < n; size = 2 * size) {
    for (let left = 0; left < n; left += 2 * size) {
      let mid = left + size - 1, right = Math.min(left + 2 * size - 1, n - 1);
      if (mid < right) await merge(left, mid, right);
    }
  }
}
