export function shortestEvidence(
  tokens: string[],
  wanted: string[],
): [number, number] | null {
  if (wanted.length === 0) return [0, 0];
  // 词 -> 还欠几份；负数表示窗口里多出几份
  const need = new Map<string, number>();
  for (const w of wanted) need.set(w, (need.get(w) ?? 0) + 1);
  let remaining = wanted.length; // 总共还欠几份，等于 0 时窗口合法
  let left = 0;
  let best: [number, number] | null = null;
  for (let right = 1; right <= tokens.length; right++) {
    const word = tokens[right - 1]; // 窗口是 [left, right)
    if (need.has(word)) {
      if (need.get(word)! > 0) remaining -= 1; // 这一份是真正欠着的
      need.set(word, need.get(word)! - 1);
    }
    while (remaining === 0) {
      // 合法就尽量把左端往右收
      if (best === null || right - left < best[1] - best[0]) {
        best = [left, right]; // 严格更短才更新，并列保留靠左的
      }
      const old = tokens[left];
      left += 1;
      if (need.has(old)) {
        need.set(old, need.get(old)! + 1);
        // 移出的是必需的一份，又欠上了
        if (need.get(old)! > 0) remaining += 1;
      }
    }
  }
  return best;
}
