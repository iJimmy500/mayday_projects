export const DEFAULT_ITEMS = [
  "Birthday Wishlist", "Randomizer", "Vowelism", "calc", "Quiz Creator",
  "One Hit Wonder", "Canvas Breach", "RDR", "Sorting", "Lyric Finder",
  "feline", "Drake Weather", "doto", "Pocket Studio", "Flashy",
  "Mathday", "Numism", "Decipher", "Hot Potato", "ghost",
  "Throwback", "octane", "Lexica", "Bday Data", "dual cam",
  "World Conversion", "Pretium", "Pure Gas", "timeskip", "Tournament Brackets"
];

export const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export const COLOR_THEMES = [
  { id: 'mono', label: 'Minimalist', accent: 'var(--fg)', cellBg: 'var(--bg)' },
  { id: 'slate', label: 'Slate Blue', accent: '#3b82f6', cellBg: '#1e293b' },
  { id: 'emerald', label: 'Emerald', accent: '#10b981', cellBg: '#064e3b' },
  { id: 'rose', label: 'Rose Gold', accent: '#f43f5e', cellBg: '#4c0519' }
];

export const BOARD_STYLES = [
  { id: 'classic', label: 'Classic Grid' },
  { id: 'modern', label: 'Modern' }
];

export const PATTERNS = [
  { id: 'solid', label: 'Solid' },
  { id: 'dots', label: 'Polka Dots' },
  { id: 'grid', label: 'Grid' }
];

export const GRID_SIZES = [
  { id: 3, label: '3x3' },
  { id: 4, label: '4x4' },
  { id: 5, label: '5x5' },
  { id: 6, label: '6x6' }
];

export const parseItem = (line) => {
  const parts = line.split('|');
  const text = parts[0]?.trim() || '';
  const visual = parts[1]?.trim() || '';
  const isUrl = visual.startsWith('http://') || visual.startsWith('https://') || visual.startsWith('/');
  return { text, imageUrl: isUrl ? visual : null };
};

export const generateCard = (itemsList, customLayoutCode = null, size = 5) => {
  let items = [];
  const totalCells = size * size;
  const isOdd = size % 2 === 1;
  const neededItemsCount = isOdd ? totalCells - 1 : totalCells;

  if (customLayoutCode) {
    for (let char of customLayoutCode) {
      const idx = ALPHABET.indexOf(char);
      if (idx !== -1 && idx < DEFAULT_ITEMS.length) {
        items.push({ text: DEFAULT_ITEMS[idx], imageUrl: null });
      }
    }
  }

  if (items.length < neededItemsCount) {
    const parsedItems = itemsList
      .split('\n')
      .map(i => i.trim())
      .filter(i => i.length > 0)
      .map(parseItem);

    const extraNeeded = neededItemsCount - parsedItems.length;
    const fallbacks = DEFAULT_ITEMS.map(text => ({ text, imageUrl: null }));

    const combined = [...parsedItems];
    for (let i = 0; i < extraNeeded; i++) {
      combined.push(fallbacks[i % fallbacks.length]);
    }

    items = combined.sort(() => Math.random() - 0.5).slice(0, neededItemsCount);
  }

  const newBoard = [];
  let itemIdx = 0;
  const mid = Math.floor(size / 2);

  for (let r = 0; r < size; r++) {
    const row = [];
    for (let c = 0; c < size; c++) {
      if (isOdd && r === mid && c === mid) {
        row.push({ text: 'Free!', imageUrl: null });
      } else {
        row.push(items[itemIdx] || { text: "Bonus Space", imageUrl: null });
        itemIdx++;
      }
    }
    newBoard.push(row);
  }
  return newBoard;
};
