export default {
  javascript: `async function slowSort(array, i, j) {
  if (i >= j) return;
  let m = Math.floor((i + j) / 2);
  await slowSort(array, i, m);
  await slowSort(array, m + 1, j);
  if (array[m] > array[j]) {
    [array[m], array[j]] = [array[j], array[m]];
  }
  await slowSort(array, i, j - 1);
}`,
  python: `def slow_sort(arr, i, j):
    if i >= j: return
    m = (i + j) // 2
    slow_sort(arr, i, m)
    slow_sort(arr, m + 1, j)
    if arr[m] > arr[j]:
        arr[m], arr[j] = arr[j], arr[m]
    slow_sort(arr, i, j - 1)`,
  c: `void slowSort(int arr[], int i, int j) {
    if (i >= j) return;
    int m = (i + j) / 2;
    slowSort(arr, i, m);
    slowSort(arr, m + 1, j);
    if (arr[m] > arr[j]) swap(&arr[m], &arr[j]);
    slowSort(arr, i, j - 1);
}`,
  java: `public void slowSort(int[] arr, int i, int j) {
    if (i >= j) return;
    int m = (i + j) / 2;
    slowSort(arr, i, m);
    slowSort(arr, m + 1, j);
    if (arr[m] > arr[j]) {
        int temp = arr[m]; arr[m] = arr[j]; arr[j] = temp;
    }
    slowSort(arr, i, j - 1);
}`,
  lines: null
};
