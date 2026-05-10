export function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

export function makeArray(size, preset) {
  let arr;
  if (preset === 'reversed') {
    arr = Array.from({ length: size }, (_, i) => Math.round(((size - i) / size) * 90) + 5);
  } else if (preset === 'nearly') {
    arr = Array.from({ length: size }, (_, i) => Math.round((i / size) * 90) + 5);
    for (let i = 0; i < Math.ceil(size * 0.08); i++) {
      const a = Math.floor(Math.random() * size);
      const b = Math.floor(Math.random() * size);
      [arr[a], arr[b]] = [arr[b], arr[a]];
    }
  } else if (preset === 'unique') {
    const vals = [20, 40, 60, 80];
    arr = Array.from({ length: size }, () => vals[Math.floor(Math.random() * vals.length)]);
  } else if (preset === 'sorted') {
    arr = Array.from({ length: size }, (_, i) => Math.round((i / size) * 90) + 5);
  } else if (preset === 'mountain') {
    arr = Array.from({ length: size }, (_, i) => {
      const mid = Math.floor(size / 2);
      if (i <= mid) return Math.round((i / mid) * 90) + 5;
      return Math.round(((size - i) / mid) * 90) + 5;
    });
  } else if (preset === 'valley') {
    arr = Array.from({ length: size }, (_, i) => {
      const mid = Math.floor(size / 2);
      if (i <= mid) return Math.round(((mid - i) / mid) * 90) + 5;
      return Math.round(((i - mid) / mid) * 90) + 5;
    });
  } else if (preset === 'sawtooth') {
    const period = Math.max(1, Math.floor(size / 3));
    arr = Array.from({ length: size }, (_, i) => Math.round(((i % period) / period) * 90) + 5);
  } else {
    arr = Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 5);
  }
  return arr;
}
