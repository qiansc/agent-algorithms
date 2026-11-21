export function causalAttention(
  q: number[][],
  k: number[][],
  v: number[][],
): number[][] {
  const n = q.length;
  if (k.length !== n || v.length !== n) {
    throw new RangeError('Q, K, V must have the same number of rows');
  }
  if (n === 0) return [];
  const scale = Math.sqrt(q[0].length); // √d，d 是 Q、K 每行的长度
  const out: number[][] = [];
  q.forEach((query, i) => {
    // 第 i 行只和第 0..i 行的 K 打分：未来位置根本不进入 softmax
    const scores: number[] = [];
    for (let j = 0; j <= i; j++) {
      let dot = 0;
      for (let c = 0; c < query.length; c++) dot += query[c] * k[j][c];
      scores.push(dot / scale);
    }
    const peak = Math.max(...scores);
    const weights = scores.map((s) => Math.exp(s - peak));
    const total = weights.reduce((a, b) => a + b, 0);
    const row = new Array<number>(v[0].length).fill(0);
    weights.forEach((w, j) => {
      v[j].forEach((value, c) => {
        row[c] += (w / total) * value;
      });
    });
    out.push(row);
  });
  return out;
}
