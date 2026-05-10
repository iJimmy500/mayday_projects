export default {
  javascript: `async function bogoSort(array) {
  while (!isSorted(array)) {
    shuffle(array);
  }
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}`,
  python: `def bogo_sort(arr):
    while not is_sorted(arr):
        random.shuffle(arr)`,
  c: `void bogoSort(int arr[], int n) {
    while (!isSorted(arr, n))
        shuffle(arr, n);
}`,
  java: `public void bogoSort(int[] arr) {
    while (!isSorted(arr))
        shuffle(arr);
}`,
  lines: null
};
