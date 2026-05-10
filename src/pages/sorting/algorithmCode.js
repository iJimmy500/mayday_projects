export const ALGO_CODE = {
  bogo: {
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
},
  bubble: {
  javascript: `async function bubbleSort(array) {
  for (let i = 0; i < array.length; i++) {
    for (let j = 0; j < array.length - i - 1; j++) {
      if (array[j] > array[j + 1]) {
        [array[j], array[j + 1]] = [array[j + 1], array[j]];
      }
    }
  }
}`,
  python: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]`,
  c: `void bubbleSort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}`,
  java: `public void bubbleSort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
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
    "javascript": 5,
    "python": 5,
    "c": 5,
    "java": 5
  }
}
},
  capitalist: {
  javascript: `async function capitalistSort(array) {
  // The top 1% (index 0) takes all the value
  const total = array.reduce((a, b) => a + b, 0);
  array[0] = total * 0.99;
  for(let i = 1; i < array.length; i++) array[i] = total * 0.01 / (array.length - 1);
}`,
  python: `def capitalist_sort(arr):
    # Top 1% takes it all
    total = sum(arr)
    arr[0] = total * 0.99
    rem = (total * 0.01) / (len(arr) - 1)
    for i in range(1, len(arr)): arr[i] = rem`,
  c: `void capitalistSort(int arr[], int n) {
    double total = 0;
    for(int i=0; i<n; i++) total += arr[i];
    arr[0] = total * 0.99;
    for(int i=1; i<n; i++) arr[i] = total * 0.01 / (n-1);
}`,
  java: `public void capitalistSort(int[] arr) {
    double total = 0;
    for(int x : arr) total += x;
    arr[0] = (int)(total * 0.99);
    for(int i=1; i<arr.length; i++) arr[i] = (int)(total * 0.01 / (arr.length - 1));
}`,
  lines: null
},
  cocktail: {
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
},
  coin: {
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
},
  comb: {
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
},
  communist: {
  javascript: `async function communistSort(array) {
  // Equal distribution for all
  const avg = array.reduce((a, b) => a + b, 0) / array.length;
  for(let i = 0; i < array.length; i++) array[i] = avg;
}`,
  python: `def communist_sort(arr):
    # Equal share for everyone
    avg = sum(arr) / len(arr)
    for i in range(len(arr)): arr[i] = avg`,
  c: `void communistSort(int arr[], int n) {
    double avg = 0;
    for(int i=0; i<n; i++) avg += arr[i];
    avg /= n;
    for(int i=0; i<n; i++) arr[i] = avg;
}`,
  java: `public void communistSort(int[] arr) {
    double avg = 0;
    for(int x : arr) avg += x;
    avg /= arr.length;
    for(int i=0; i<arr.length; i++) arr[i] = (int)avg;
}`,
  lines: null
},
  crash: {
  javascript: `async function crashSort(array) {
  for (let i = 0; i < array.length / 2; i++) {
    await bubbleStep(array);
  }
  // This is where it gets complicated...
  throw new Error("Segmentation Fault: 0x00000000");
}`,
  python: `def crash_sort(arr):
    import os
    # Sorting...
    # Oops, forgot to check bounds
    os.abort()`,
  c: `void crashSort(int arr[], int n) {
    int *p = NULL;
    *p = 42; // Real engineering
}`,
  java: `public void sort(int[] arr) {
    Object[] o = new Object[100];
    while(true) {
        o = new Object[] { o }; // Heap space? Never heard of her.
    }
}`,
  lines: null
},
  cycle: {
  javascript: `async function cycleSort(array) {
  for (let cycleStart = 0; cycleStart < array.length - 1; cycleStart++) {
    let item = array[cycleStart], pos = cycleStart;
    for (let i = cycleStart + 1; i < array.length; i++)
      if (array[i] < item) pos++;
    if (pos == cycleStart) continue;
    // ... rest of the cycle logic
  }
}`,
  python: `def cycle_sort(arr):
    for cycle_start in range(len(arr) - 1):
        item = arr[cycle_start]
        pos = cycle_start
        for i in range(cycle_start + 1, len(arr)):
            if arr[i] < item: pos += 1
        if pos == cycle_start: continue
        # ... rest of the cycle logic`,
  c: `void cycleSort(int arr[], int n) {
    for (int cycle_start = 0; cycle_start <= n - 2; cycle_start++) {
        int item = arr[cycle_start];
        int pos = cycle_start;
        for (int i = cycle_start + 1; i < n; i++)
            if (arr[i] < item) pos++;
        if (pos == cycle_start) continue;
        // ... rest of the cycle logic
    }
}`,
  java: `public void cycleSort(int arr[]) {
    int n = arr.length;
    for (int cycle_start = 0; cycle_start <= n - 2; cycle_start++) {
        int item = arr[cycle_start];
        int pos = cycle_start;
        for (int i = cycle_start + 1; i < n; i++)
            if (arr[i] < item) pos++;
        if (pos == cycle_start) continue;
        // ... rest of the cycle logic
    }
}`,
  lines: null
},
  existential: {
  javascript: `async function existentialSort(array) {
  while (true) {
    let i = Math.floor(Math.random() * array.length);
    let j = Math.floor(Math.random() * array.length);
    if (Math.random() > 0.5) {
      [array[i], array[j]] = [array[j], array[i]];
    }
    // Occasional entropy
    if (Math.random() > 0.95) {
      array[Math.floor(Math.random()*array.length)] = Math.random()*100;
    }
    await sleep(50);
  }
}`,
  python: `# Error: Algorithm too depressed to continue`,
  c: `// TODO: Fix this before deployment`,
  java: `/* 
 * a realistic look 
 * at my average code style.
 * Good luck.
 */`,
  lines: null
},
  frustration: {
  javascript: `async function frustrationSort(array) {
  while (true) {
    await bubbleSort(array);
    if (getSortedness(array) > 0.8) {
      // LOSE CONTROL
      shuffle(array);
    }
  }
}`,
  python: `def frustration_sort(arr):
    # Almost there...
    # NOPE.
    while True:
        sort_bit(arr)
        if almost_done(arr):
            explode(arr)`,
  c: `void frustrationSort(int arr[], int n) {
    while(1) {
        sort(arr, n);
        if (check(arr, n) > 0.8) {
            fprintf(stderr, "I GIVE UP!\n");
            chaos(arr, n);
        }
    }
}`,
  java: `public void sort(int[] arr) {
    try {
        while(true) {
            bubble(arr);
            if(isNearlySorted(arr)) throw new RageQuitException();
        }
    } catch(RageQuitException e) {
        shuffle(arr);
        sort(arr);
    }
}`,
  lines: null
},
  gnome: {
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
},
  heap: {
  javascript: `async function heapSort(array) {
  let n = array.length;
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) await heapify(array, n, i);
  for (let i = n - 1; i > 0; i--) {
    [array[0], array[i]] = [array[i], array[0]];
    await heapify(array, i, 0);
  }
}`,
  python: `def heap_sort(arr):
    n = len(arr)
    for i in range(n // 2 - 1, -1, -1): heapify(arr, n, i)
    for i in range(n - 1, 0, -1):
        arr[i], arr[0] = arr[0], arr[i]
        heapify(arr, i, 0)`,
  c: `void heapSort(int arr[], int n) {
    for (int i = n / 2 - 1; i >= 0; i--) heapify(arr, n, i);
    for (int i = n - 1; i > 0; i--) {
        swap(&arr[0], &arr[i]);
        heapify(arr, i, 0);
    }
}`,
  java: `public void sort(int[] arr) {
    int n = arr.length;
    for (int i = n / 2 - 1; i >= 0; i--) heapify(arr, n, i);
    for (int i = n - 1; i > 0; i--) {
        int temp = arr[0]; arr[0] = arr[i]; arr[i] = temp;
        heapify(arr, i, 0);
    }
}`,
  lines: null
},
  insertion: {
  javascript: `async function insertionSort(array) {
  for (let i = 1; i < array.length; i++) {
    let key = array[i], j = i - 1;
    while (j >= 0 && array[j] > key) {
      array[j + 1] = array[j];
      j--;
    }
    array[j + 1] = key;
  }
}`,
  python: `def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and key < arr[j]:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key`,
  c: `void insertionSort(int arr[], int n) {
    int i, key, j;
    for (i = 1; i < n; i++) {
        key = arr[i];
        j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j = j - 1;
        }
        arr[j + 1] = key;
    }
}`,
  java: `public void insertionSort(int[] arr) {
    for (int i = 1; i < arr.length; ++i) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j = j - 1;
        }
        arr[j + 1] = key;
    }
}`,
  lines: {
  "compare": {
    "javascript": 4,
    "python": 5,
    "c": 4,
    "java": 5
  },
  "swap": {
    "javascript": 5,
    "python": 6,
    "c": 5,
    "java": 6
  }
}
},
  merge: {
  javascript: `async function mergeSort(array, l, r) {
  if (l < r) {
    let m = Math.floor((l + r) / 2);
    await mergeSort(array, l, m);
    await mergeSort(array, m + 1, r);
    await merge(array, l, m, r);
  }
}`,
  python: `def merge_sort(arr):
    if len(arr) > 1:
        mid = len(arr) // 2
        L, R = arr[:mid], arr[mid:]
        merge_sort(L)
        merge_sort(R)
        # ... merging logic`,
  c: `void mergeSort(int arr[], int l, int r) {
    if (l < r) {
        int m = l + (r - l) / 2;
        mergeSort(arr, l, m);
        mergeSort(arr, m + 1, r);
        merge(arr, l, m, r);
    }
}`,
  java: `public void sort(int[] arr, int l, int r) {
    if (l < r) {
        int m = l + (r - l) / 2;
        sort(arr, l, m);
        sort(arr, m + 1, r);
        merge(arr, l, m, r);
    }
}`,
  lines: null
},
  oddeven: {
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
},
  pancake: {
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
},
  quantum: {
  javascript: `async function quantumBogoSort(array) {
  // In the surviving universe, the array is already sorted.
  array.sort((a, b) => a - b);
}`,
  python: `def quantum_bogo_sort(arr):
    # If not sorted, destroy universe
    # Only the sorted timeline remains
    arr.sort()`,
  c: `void quantumBogoSort(int arr[], int n) {
    // Check if sorted. If not, exit(1);
    // The OS is the universe.
}`,
  java: `public void sort(int[] arr) {
    // If(notSorted) System.exit(-1);
    Arrays.sort(arr);
}`,
  lines: null
},
  quick: {
  javascript: `async function quickSort(array, low, high) {
  if (low < high) {
    let pi = await partition(array, low, high);
    await quickSort(array, low, pi - 1);
    await quickSort(array, pi + 1, high);
  }
}`,
  python: `def quick_sort(arr, low, high):
    if low < high:
        pi = partition(arr, low, high)
        quick_sort(arr, low, pi - 1)
        quick_sort(arr, pi + 1, high)`,
  c: `void quickSort(int arr[], int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}`,
  java: `public void quickSort(int[] arr, int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}`,
  lines: null
},
  radix: {
  javascript: `async function radixSort(array) {
  let max = Math.max(...array);
  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    await countSort(array, exp);
  }
}`,
  python: `def radix_sort(arr):
    max_val = max(arr)
    exp = 1
    while max_val // exp > 0:
        counting_sort(arr, exp)
        exp *= 10`,
  c: `void radixSort(int arr[], int n) {
    int m = getMax(arr, n);
    for (int exp = 1; m / exp > 0; exp *= 10)
        countSort(arr, n, exp);
}`,
  java: `public void radixSort(int[] arr) {
    int n = arr.length;
    int m = getMax(arr, n);
    for (int exp = 1; m / exp > 0; exp *= 10)
        countSort(arr, n, exp);
}`,
  lines: null
},
  selection: {
  javascript: `async function selectionSort(array) {
  for (let i = 0; i < array.length; i++) {
    let min = i;
    for (let j = i + 1; j < array.length; j++) {
      if (array[j] < array[min]) min = j;
    }
    if (min !== i) {
      [array[i], array[min]] = [array[min], array[i]];
    }
  }
}`,
  python: `def selection_sort(arr):
    for i in range(len(arr)):
        min_idx = i
        for j in range(i + 1, len(arr)):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]`,
  c: `void selectionSort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        int min_idx = i;
        for (int j = i + 1; j < n; j++)
            if (arr[j] < arr[min_idx]) min_idx = j;
        int temp = arr[min_idx];
        arr[min_idx] = arr[i];
        arr[i] = temp;
    }
}`,
  java: `public void selectionSort(int[] arr) {
    for (int i = 0; i < arr.length - 1; i++) {
        int min_idx = i;
        for (int j = i + 1; j < arr.length; j++)
            if (arr[j] < arr[min_idx]) min_idx = j;
        int temp = arr[min_idx];
        arr[min_idx] = arr[i];
        arr[i] = temp;
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
    "python": 6,
    "c": 5,
    "java": 5
  }
}
},
  shell: {
  javascript: `async function shellSort(array) {
  for (let gap = Math.floor(array.length / 2); gap > 0; gap = Math.floor(gap / 2)) {
    for (let i = gap; i < array.length; i++) {
      let temp = array[i], j;
      for (j = i; j >= gap && array[j - gap] > temp; j -= gap) {
        array[j] = array[j - gap];
      }
      array[j] = temp;
    }
  }
}`,
  python: `def shell_sort(arr):
    n = len(arr)
    gap = n // 2
    while gap > 0:
        for i in range(gap, n):
            temp = arr[i]
            j = i
            while j >= gap and arr[j - gap] > temp:
                arr[j] = arr[j - gap]
                j -= gap
            arr[j] = temp
        gap //= 2`,
  c: `void shellSort(int arr[], int n) {
    for (int gap = n / 2; gap > 0; gap /= 2) {
        for (int i = gap; i < n; i++) {
            int temp = arr[i];
            int j;
            for (j = i; j >= gap && arr[j - gap] > temp; j -= gap)
                arr[j] = arr[j - gap];
            arr[j] = temp;
        }
    }
}`,
  java: `public void shellSort(int[] arr) {
    int n = arr.length;
    for (int gap = n / 2; gap > 0; gap /= 2) {
        for (int i = gap; i < n; i++) {
            int temp = arr[i];
            int j;
            for (j = i; j >= gap && arr[j - gap] > temp; j -= gap)
                arr[j] = arr[j - gap];
            arr[j] = temp;
        }
    }
}`,
  lines: null
},
  slow: {
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
},
  stalin: {
  javascript: `async function stalinSort(array) {
  let i = 0;
  while (i < array.length - 1) {
    if (array[i] > array[i + 1]) {
      array.splice(i + 1, 1);
    } else {
      i++;
    }
  }
}`,
  python: `def stalin_sort(arr):
    if not arr: return []
    res = [arr[0]]
    for i in range(1, len(arr)):
        if arr[i] >= res[-1]:
            res.append(arr[i])
    return res`,
  c: `// This requires a dynamic array or linked list
void stalinSort(List* list) {
    Node* curr = list->head;
    while (curr && curr->next) {
        if (curr->data > curr->next->data) {
            deleteNode(list, curr->next);
        } else {
            curr = curr->next;
        }
    }
}`,
  java: `public void stalinSort(List<Integer> list) {
    for (int i = 0; i < list.size() - 1; ) {
        if (list.get(i) > list.get(i + 1)) {
            list.remove(i + 1);
        } else {
            i++;
        }
    }
}`,
  lines: null
},
  stooge: {
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
},
  tim: {
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
},
};
