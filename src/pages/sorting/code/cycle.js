export default {
  javascript: `async function cycleSort(array) {
  for (let cycleStart = 0; cycleStart < array.length - 1; cycleStart++) {
    let item = array[cycleStart], pos = cycleStart;
    for (let i = cycleStart + 1; i < array.length; i++)
      if (array[i] < item) pos++;
    if (pos == cycleStart) continue;
    // ... rest of the cycle logic
  }
}`,
  python: `def cycle_sort(arr):
    for cycle_start in range(len(arr) - 1):
        item = arr[cycle_start]
        pos = cycle_start
        for i in range(cycle_start + 1, len(arr)):
            if arr[i] < item: pos += 1
        if pos == cycle_start: continue
        # ... rest of the cycle logic`,
  c: `void cycleSort(int arr[], int n) {
    for (int cycle_start = 0; cycle_start <= n - 2; cycle_start++) {
        int item = arr[cycle_start];
        int pos = cycle_start;
        for (int i = cycle_start + 1; i < n; i++)
            if (arr[i] < item) pos++;
        if (pos == cycle_start) continue;
        // ... rest of the cycle logic
    }
}`,
  java: `public void cycleSort(int arr[]) {
    int n = arr.length;
    for (int cycle_start = 0; cycle_start <= n - 2; cycle_start++) {
        int item = arr[cycle_start];
        int pos = cycle_start;
        for (int i = cycle_start + 1; i < n; i++)
            if (arr[i] < item) pos++;
        if (pos == cycle_start) continue;
        // ... rest of the cycle logic
    }
}`,
  lines: null
};
