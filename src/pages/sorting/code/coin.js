export default {
  javascript: `async function coinFlipSort(array) {
  let swapped = true;
  while (swapped) {
    swapped = false;
    for (let i = 0; i < array.length - 1; i++) {
      if (Math.random() > 0.5) { // The Flip
        if (array[i] > array[i + 1]) {
          [array[i], array[i + 1]] = [array[i+1], array[i]];
          swapped = true;
        }
      }
    }
  }
}`,
  python: `def coin_flip_sort(arr):
    while not is_sorted(arr):
        for i in range(len(arr)-1):
            if random.random() > 0.5:
                if arr[i] > arr[i+1]:
                    arr[i], arr[i+1] = arr[i+1], arr[i]`,
  c: `void coinFlipSort(int arr[], int n) {
    // Heads or Tails?
    if (rand() % 2 == 0) bubbleSort(arr, n);
    else shuffle(arr, n);
}`,
  java: `public void sort(int[] arr) {
    // Decision by RNG
    Random r = new Random();
    if(r.nextBoolean()) Arrays.sort(arr);
}`,
  lines: null
};
