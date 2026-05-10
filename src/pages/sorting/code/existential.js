export default {
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
};
