export default {
  javascript: `async function cocktailSort(array) {
  let left = 0, right = array.length - 1, swapped = true;
  while (swapped) {
    swapped = false;
    for (let i = left; i < right; i++) {
      if (array[i] > array[i + 1]) {
        [array[i], array[i + 1]] = [array[i + 1], array[i]];
        swapped = true;
      }
    }
    if (!swapped) break;
    right--;
    for (let i = right; i > left; i--) {
      if (array[i] < array[i - 1]) {
        [array[i], array[i - 1]] = [array[i - 1], array[i]];
        swapped = true;
      }
    }
    left++;
  }
}`,
  python: `def cocktail_sort(arr):
    n = len(arr)
    swapped = True
    start, end = 0, n - 1
    while swapped:
        swapped = False
        for i in range(start, end):
            if arr[i] > arr[i + 1]:
                arr[i], arr[i + 1] = arr[i + 1], arr[i]
                swapped = True
        if not swapped: break
        swapped = False
        end -= 1
        for i in range(end - 1, start - 1, -1):
            if arr[i] > arr[i + 1]:
                arr[i], arr[i + 1] = arr[i + 1], arr[i]
                swapped = True
        start += 1`,
  c: `void cocktailSort(int a[], int n) {
    int swapped = 1;
    int start = 0, end = n - 1;
    while (swapped) {
        swapped = 0;
        for (int i = start; i < end; ++i) {
            if (a[i] > a[i + 1]) {
                swap(&a[i], &a[i + 1]);
                swapped = 1;
            }
        }
        if (!swapped) break;
        swapped = 0;
        --end;
        for (int i = end - 1; i >= start; --i) {
            if (a[i] > a[i + 1]) {
                swap(&a[i], &a[i + 1]);
                swapped = 1;
            }
        }
        ++start;
    }
}`,
  java: `public void cocktailSort(int[] a) {
    boolean swapped = true;
    int start = 0, end = a.length - 1;
    while (swapped) {
        swapped = false;
        for (int i = start; i < end; ++i) {
            if (a[i] > a[i + 1]) {
                int temp = a[i]; a[i] = a[i+1]; a[i+1] = temp;
                swapped = true;
            }
        }
        if (!swapped) break;
        swapped = false;
        end--;
        for (int i = end - 1; i >= start; i--) {
            if (a[i] > a[i + 1]) {
                int temp = a[i]; a[i] = a[i+1]; a[i+1] = temp;
                swapped = true;
            }
        }
        start++;
    }
}`,
  lines: null
};
