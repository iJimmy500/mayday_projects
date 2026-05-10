export default {
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
};
