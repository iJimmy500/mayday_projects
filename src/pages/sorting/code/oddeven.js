export default {
  javascript: `async function oddEvenSort(array) {
  let sorted = false;
  while (!sorted) {
    sorted = true;
    for (let i = 1; i < array.length - 1; i += 2) {
      if (array[i] > array[i + 1]) {
        [array[i], array[i + 1]] = [array[i + 1], array[i]];
        sorted = false;
      }
    }
    for (let i = 0; i < array.length - 1; i += 2) {
      if (array[i] > array[i + 1]) {
        [array[i], array[i + 1]] = [array[i + 1], array[i]];
        sorted = false;
      }
    }
  }
}`,
  python: `def odd_even_sort(arr):
    sorted = False
    while not sorted:
        sorted = True
        for i in range(1, len(arr)-1, 2):
            if arr[i] > arr[i+1]:
                arr[i], arr[i+1] = arr[i+1], arr[i]
                sorted = False
        for i in range(0, len(arr)-1, 2):
            if arr[i] > arr[i+1]:
                arr[i], arr[i+1] = arr[i+1], arr[i]
                sorted = False`,
  c: `void oddEvenSort(int arr[], int n) {
    int sorted = 0;
    while (!sorted) {
        sorted = 1;
        for (int i = 1; i < n - 1; i += 2) {
            if (arr[i] > arr[i + 1]) {
                swap(&arr[i], &arr[i + 1]);
                sorted = 0;
            }
        }
        for (int i = 0; i < n - 1; i += 2) {
            if (arr[i] > arr[i + 1]) {
                swap(&arr[i], &arr[i + 1]);
                sorted = 0;
            }
        }
    }
}`,
  java: `public void oddEvenSort(int[] arr) {
    boolean sorted = false;
    while (!sorted) {
        sorted = true;
        for (int i = 1; i < arr.length - 1; i += 2) {
            if (arr[i] > arr[i + 1]) {
                int temp = arr[i]; arr[i] = arr[i+1]; arr[i+1] = temp;
                sorted = false;
            }
        }
        for (int i = 0; i < arr.length - 1; i += 2) {
            if (arr[i] > arr[i + 1]) {
                int temp = arr[i]; arr[i] = arr[i+1]; arr[i+1] = temp;
                sorted = false;
            }
        }
    }
    }
}`,
  lines: {
  "compare": {
    "javascript": 5,
    "python": 5,
    "c": 5,
    "java": 5
  },
  "swap": {
    "javascript": 6,
    "python": 6,
    "c": 6,
    "java": 6
  }
}
};
