/**
 * Short, non-reversible token for a song so debug logs can correlate
 * lines for the same track without printing the answer to the console.
 */
export const trackToken = (artist, track) => {
  const str = `${artist}::${track}`;
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
  }
  return `trk_${(hash >>> 0).toString(36)}`;
};
