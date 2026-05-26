export async function fetchPool(len, commonSet) {
  const res  = await fetch('/txtFiles/words.txt');
  const text = await res.text();
  const all  = text.split('\n')
    .map(w => w.trim().toUpperCase())
    .filter(w => w.length === len && /^[A-Z]+$/.test(w));
  if (!commonSet) return all;
  const filtered = all.filter(w => commonSet.has(w.toLowerCase()));
  return filtered.length > 20 ? filtered : all;
}

export async function fetchCommonSet() {
  try {
    const res  = await fetch('/txtFiles/5000-more-common.txt');
    const text = await res.text();
    return new Set(text.split('\n').map(w => w.trim().toLowerCase()).filter(Boolean));
  } catch {
    return null;
  }
}

export async function fetchDefinition(word) {
  try {
    const res  = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
    if (!res.ok) return null;
    const data = await res.json();
    const meanings = data?.[0]?.meanings;
    if (!meanings?.length) return null;
    const defs = meanings[0].definitions;
    return defs.reduce((a, b) => a.definition.length <= b.definition.length ? a : b).definition;
  } catch {
    return null;
  }
}
