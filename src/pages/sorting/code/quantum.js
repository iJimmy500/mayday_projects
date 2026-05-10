export default {
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
};
