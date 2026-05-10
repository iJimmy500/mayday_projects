export async function quickSort(a, tick, tone, setArray, setSrt) {
  const n = a.length;
  const partition = async (l, h) => {
    const pivot = a[h];
    let i = l - 1;
    for (let j = l; j < h; j++) {
      await tick([j, h], []);
      if (a[j] < pivot) {
        i++;
        [a[i], a[j]] = [a[j], a[i]];
        tone(a[i]);
        setArray([...a]);
        await tick([], [i, j]);
      }
    }
    [a[i + 1], a[h]] = [a[h], a[i + 1]];
    setArray([...a]);
    setSrt(p => [...p, i + 1]);
    return i + 1;
  };

  const qs = async (l, h) => {
    if (l < h) {
      const pi = await partition(l, h);
      await qs(l, pi - 1);
      await qs(pi + 1, h);
    } else if (l === h) {
      setSrt(p => [...p, l]);
    }
  };

  await qs(0, n - 1);
}
