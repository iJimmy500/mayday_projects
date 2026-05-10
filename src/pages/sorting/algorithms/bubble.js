export async function bubbleSort(a, tick, tone, setArray, setSrt) {
  const n = a.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      await tick([j, j + 1], []);
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        tone(a[j]);
        setArray([...a]);
        await tick([], [j, j + 1]);
      }
    }
    setSrt(p => [...p, n - i - 1]);
  }
}
