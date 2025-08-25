export function sampleCombo<T>(
  pool: T[], 
  size: number, 
  isValid: (sel: T[], cand: T) => boolean
): T[] {
  const idx: number[] = [];
  for (let i = 0; i < pool.length; i++) {
    idx.push(i);
  }
  
  // Shuffle array
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  
  const out: T[] = [];
  for (const k of idx) {
    const c = pool[k];
    if (isValid(out, c)) {
      out.push(c);
    }
    if (out.length === size) break;
  }
  return out;
}