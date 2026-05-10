export default {
  javascript: `async function timSort(array) {
  let n = array.length, RUN = 32;
  for (let i = 0; i < n; i += RUN) await insertionSort(array, i, Math.min(i + RUN - 1, n - 1));
  for (let size = RUN; size < n; size = 2 * size) {
    for (let left = 0; left < n; left += 2 * size) {
      let mid = left + size - 1, right = Math.min(left + 2 * size - 1, n - 1);
      if (mid < right) await merge(array, left, mid, right);
    }
  }
}`,
  python: `def tim_sort(arr):
    n = len(arr)
    RUN = 32
    for i in range(0, n, RUN): insertion_sort(arr, i, min(i + RUN - 1, n - 1))
    size = RUN
    while size < n:
        for left in range(0, n, 2 * size):
            mid = left + size - 1
            right = min(left + 2 * size - 1, n - 1)
            if mid < right: merge(arr, left, mid, right)
        size *= 2`,
  c: `void timSort(int arr[], int n) {
    for (int i = 0; i < n; i += RUN) insertionSort(arr, i, min(i + RUN - 1, n - 1));
    for (int size = RUN; size < n; size = 2 * size) {
        for (int left = 0; left < n; left += 2 * size) {
            int mid = left + size - 1;
            int right = min(left + 2 * size - 1, n - 1);
            if (mid < right) merge(arr, left, mid, right);
        }
    }
}`,
  java: `public void timSort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n; i += RUN) insertionSort(arr, i, Math.min(i + RUN - 1, n - 1));
    for (int size = RUN; size < n; size = 2 * size) {
        for (int left = 0; left < n; left += 2 * size) {
            int mid = left + size - 1;
            int right = Math.min(left + 2 * size - 1, n - 1);
            if (mid < right) merge(arr, left, mid, right);
        }
    }
}`,
  lines: null
};
