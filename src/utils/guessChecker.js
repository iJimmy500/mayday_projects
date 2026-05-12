/**
 * guessChecker.js
 * Pure utility for evaluating a player's guess against the correct answer.
 * Handles string normalization, accent stripping, substring matching,
 * Levenshtein distance, strict mode, and game mode (both/title/artist).
 */


const clean = (str) => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\(.*\)/g, '')
    .replace(/\[.*\]/g, '')
    .replace(/feat\..*/g, '')
    .replace(/ft\..*/g, '')
    .replace(/[^a-z0-9\s]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
};


const levenshtein = (a, b) => {
  const matrix = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      matrix[i][j] =
        a[i - 1] === b[j - 1]
          ? matrix[i - 1][j - 1]
          : Math.min(matrix[i - 1][j - 1], matrix[i][j - 1], matrix[i - 1][j]) + 1;
    }
  }
  return matrix[a.length][b.length];
};

/**
 * Returns true if guessStr is close enough to targetStr.
 * @param {string} guessStr - What the user typed.
 * @param {string} targetStr - The correct answer.
 * @param {boolean} strictMode - If true, only exact matches (after cleaning) are accepted.
 */
export const isCloseEnough = (guessStr, targetStr, strictMode = false) => {
  const g = clean(guessStr);
  const t = clean(targetStr);
  if (!g) return false;
  if (t === g) return true;
  if (strictMode) return false;
  if ((t.includes(g) || g.includes(t)) && g.length > 2) return true;
  const distance = levenshtein(g, t);
  const threshold = Math.floor(t.length * 0.25);
  return distance <= Math.max(1, threshold);
};

/**
 * Evaluates a full guess attempt.
 * @param {object} guess        - { title: string, artist: string }
 * @param {object} currentSong  - { track: string, artist: string }
 * @param {object} settings     - { mode: 'both'|'title'|'artist', strictMode: boolean }
 * @param {object|null} playlistInfo - playlist context (checks for artist mode)
 * @returns {{ isWin: boolean, isTitleCorrect: boolean, isArtistCorrect: boolean }}
 */
export const evaluateGuess = (guess, currentSong, settings, playlistInfo) => {
  const isTitleCorrect = isCloseEnough(guess.title, currentSong.track, settings.strictMode);
  const isArtistCorrect = isCloseEnough(guess.artist, currentSong.artist, settings.strictMode);

  const isArtistMode = playlistInfo?.type === 'artist';

  let isWin = false;
  if (isArtistMode) {
    isWin = isTitleCorrect;
  } else if (settings.mode === 'both') {
    isWin = isTitleCorrect && isArtistCorrect;
  } else if (settings.mode === 'title') {
    isWin = isTitleCorrect;
  } else if (settings.mode === 'artist') {
    isWin = isArtistCorrect;
  }

  return { isWin, isTitleCorrect, isArtistCorrect };
};
