export default {
  javascript: `async function stoogeSort(array, l, h) {
  if (array[l] > array[h]) {
    [array[l], array[h]] = [array[h], array[l]];
  }
  if (h - l + 1 > 2) {
    let t = Math.floor((h - l + 1) / 3);
    await stoogeSort(array, l, h - t);
    await stoogeSort(array, l + t, h);
    await stoogeSort(array, l, h - t);
  }
}`,
  python: `def stooge_sort(arr, l, h):
    if arr[l] > arr[h]:
        arr[l], arr[h] = arr[h], arr[l]
    if h - l + 1 > 2:
        t = (h - l + 1) // 3
        stooge_sort(arr, l, h - t)
        stooge_sort(arr, l + t, h)
        stooge_sort(arr, l, h - t)`,
  c: `void stoogeSort(int arr[], int l, int h) {
    if (arr[l] > arr[h]) swap(&arr[l], &arr[h]);
    if (h - l + 1 > 2) {
        int t = (h - l + 1) / 3;
        stoogeSort(arr, l, h - t);
        stoogeSort(arr, l + t, h);
        stoogeSort(arr, l, h - t);
    }
}`,
  java: `public void stoogeSort(int[] arr, int l, int h) {
    if (arr[l] > arr[h]) {
        int temp = arr[l]; arr[l] = arr[h]; arr[h] = temp;
    }
    if (h - l + 1 > 2) {
        int t = (h - l + 1) / 3;
        stoogeSort(arr, l, h - t);
        stoogeSort(arr, l + t, h);
        stoogeSort(arr, l, h - t);
    }
}`,
  lines: null
};
