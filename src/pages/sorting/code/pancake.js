export default {
  javascript: `async function pancakeSort(array) {
  for (let curr_size = array.length; curr_size > 1; --curr_size) {
    let mi = findMax(array, curr_size);
    if (mi != curr_size - 1) {
      await flip(array, mi);
      await flip(array, curr_size - 1);
    }
  }
}`,
  python: `def pancake_sort(arr):
    curr_size = len(arr)
    while curr_size > 1:
        mi = find_max(arr, curr_size)
        if mi != curr_size - 1:
            flip(arr, mi)
            flip(arr, curr_size - 1)
        curr_size -= 1`,
  c: `void pancakeSort(int *arr, int n) {
    for (int curr_size = n; curr_size > 1; --curr_size) {
        int mi = findMax(arr, curr_size);
        if (mi != curr_size - 1) {
            flip(arr, mi);
            flip(arr, curr_size - 1);
        }
    }
}`,
  java: `public void pancakeSort(int arr[]) {
    int n = arr.length;
    for (int curr_size = n; curr_size > 1; --curr_size) {
        int mi = findMax(arr, curr_size);
        if (mi != curr_size - 1) {
            flip(arr, mi);
            flip(arr, curr_size - 1);
        }
    }
}`,
  lines: null
};
