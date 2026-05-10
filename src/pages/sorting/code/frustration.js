export default {
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
};
