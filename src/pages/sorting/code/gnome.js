export default {
  javascript: `async function gnomeSort(array) {
  let index = 0;
  while (index < array.length) {
    if (index === 0) index++;
    if (array[index] >= array[index - 1]) index++;
    else {
      [array[index], array[index - 1]] = [array[index - 1], array[index]];
      index--;
    }
  }
}`,
  python: `def gnome_sort(arr):
    index = 0
    while index < len(arr):
        if index == 0: index += 1
        if arr[index] >= arr[index-1]: index += 1
        else:
            arr[index], arr[index-1] = arr[index-1], arr[index]
            index -= 1`,
  c: `void gnomeSort(int arr[], int n) {
    int index = 0;
    while (index < n) {
        if (index == 0) index++;
        if (arr[index] >= arr[index - 1]) index++;
        else {
            int temp = arr[index];
            arr[index] = arr[index - 1];
            arr[index - 1] = temp;
            index--;
        }
    }
}`,
  java: `public void gnomeSort(int[] arr) {
    int index = 0;
    while (index < arr.length) {
        if (index == 0) index++;
        if (arr[index] >= arr[index - 1]) index++;
        else {
            int temp = arr[index];
            arr[index] = arr[index - 1];
            arr[index - 1] = temp;
            index--;
        }
    }
}`,
  lines: {
  "compare": {
    "javascript": 4,
    "python": 4,
    "c": 4,
    "java": 4
  },
  "swap": {
    "javascript": 6,
    "python": 7,
    "c": 6,
    "java": 7
  }
}
};
