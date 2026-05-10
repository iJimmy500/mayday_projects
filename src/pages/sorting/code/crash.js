export default {
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
};
