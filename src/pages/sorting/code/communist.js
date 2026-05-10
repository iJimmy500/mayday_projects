export default {
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
};
