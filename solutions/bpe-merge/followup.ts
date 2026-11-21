// 按训练时学到的顺序依次合并。merges[k] = [a, b, 新 ID]。
export function encode(
  tokens: number[],
  merges: [number, number, number][],
): number[] {
  let out = [...tokens];
  for (const [a, b, newId] of merges) {
    const merged: number[] = [];
    let i = 0;
    while (i < out.length) {
      const next = i + 1 < out.length ? out[i + 1] : null;
      if (out[i] === a && next === b) {
        merged.push(newId);
        i += 2;
      } else {
        merged.push(out[i]);
        i += 1;
      }
    }
    out = merged;
  }
  return out;
}
