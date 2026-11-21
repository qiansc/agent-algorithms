type Matrix = number[][];

export function matmul(a: Matrix, b: Matrix): Matrix {
  return a.map((row) =>
    b[0].map((_, c) => row.reduce((acc, x, r) => acc + x * b[r][c], 0)),
  );
}

export function multiHeadCausal(
  x: Matrix,
  wq: Matrix,
  wk: Matrix,
  wv: Matrix,
  wo: Matrix,
  heads: number,
): Matrix {
  if (x.length === 0) return [];
  const dModel = x[0].length;
  if (!(heads > 0) || dModel % heads !== 0) {
    throw new RangeError('heads must divide d_model');
  }
  const dh = dModel / heads;
  const q = matmul(x, wq);
  const k = matmul(x, wk);
  const v = matmul(x, wv);
  const n = x.length;
  const scale = Math.sqrt(dh); // 每个头的点积只有 dh 项，按 √dh 缩放
  const concat: Matrix = Array.from({ length: n }, () => []);
  for (let h = 0; h < heads; h++) {
    const lo = h * dh; // 第 h 个头占第 lo..lo+dh-1 列
    for (let i = 0; i < n; i++) {
      const scores: number[] = [];
      for (let j = 0; j <= i; j++) {
        let dot = 0;
        for (let c = 0; c < dh; c++) dot += q[i][lo + c] * k[j][lo + c];
        scores.push(dot / scale);
      }
      const peak = Math.max(...scores);
      const weights = scores.map((s) => Math.exp(s - peak));
      const total = weights.reduce((a, b) => a + b, 0);
      const out = new Array<number>(dh).fill(0);
      weights.forEach((w, j) => {
        for (let c = 0; c < dh; c++) {
          out[c] += (w / total) * v[j][lo + c];
        }
      });
      concat[i].push(...out); // 头按顺序左右拼接
    }
  }
  return matmul(concat, wo);
}
