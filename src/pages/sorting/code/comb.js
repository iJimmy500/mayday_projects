export default {
  javascript: `async function combSort(array) {
  let gap = array.length, swapped = true;
  while (gap !== 1 || swapped) {
    gap = Math.floor(gap / 1.3) || 1;
    swapped = false;
    for (let i = 0; i < array.length - gap; i++) {
      if (array[i] > array[i + gap]) {
        [array[i], array[i + gap]] = [array[i + gap], array[i]];
        swapped = true;
      }
    }
  }
}`,
  python: `def comb_sort(arr):
    gap = len(arr)
    swapped = True
    while gap != 1 or swapped:
        gap = int(gap / 1.3) or 1
        swapped = False
        for i in range(len(arr) - gap):
            if arr[i] > arr[i + gap]:
                arr[i], arr[i + gap] = arr[i + gap], arr[i]
                swapped = True`,
  c: `void combSort(int arr[], int n) {
    int gap = n, swapped = 1;
    while (gap != 1 || swapped) {
        gap = (gap * 10) / 13;
        if (gap < 1) gap = 1;
        swapped = 0;
        for (int i = 0; i < n - gap; i++) {
            if (arr[i] > arr[i + gap]) {
                swap(&arr[i], &arr[i + gap]);
                swapped = 1;
            }
        }
    }
}`,
  java: `public void combSort(int[] arr) {
    int n = arr.length, gap = n;
    boolean swapped = true;
    while (gap != 1 || swapped) {
        gap = (gap * 10) / 13;
        if (gap < 1) gap = 1;
        swapped = false;
        for (int i = 0; i < n - gap; i++) {
            if (arr[i] > arr[i + gap]) {
                int temp = arr[i]; arr[i] = arr[i+gap]; arr[i+gap] = temp;
                swapped = true;
            }
        }
    }
}`,
  lines: null
};
