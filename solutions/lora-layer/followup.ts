type Matrix = number[][];

// 已知损失对输出 y 的梯度 gradY，求损失对 A、B 的梯度。
export function loraGrads(
  A: Matrix,
  B: Matrix,
  alpha: number,
  x: number[],
  gradY: number[],
): [Matrix, Matrix] {
  const r = A.length;
  const scale = alpha / r;
  // h = A·x
  const h = A.map((row) => row.reduce((s, a, j) => s + a * x[j], 0));
  // y_i 含 scale·B[i][t]·h[t]，所以 dL/dB[i][t] = scale·g_i·h_t
  const gradB = gradY.map((g) => h.map((ht) => scale * g * ht));
  // dL/dh[t] = scale·Σ_i B[i][t]·g_i，再乘 x 得到 dL/dA[t][j]
  const gradH = h.map((_, t) =>
    scale * gradY.reduce((s, g, i) => s + B[i][t] * g, 0),
  );
  const gradA = gradH.map((gh) => x.map((v) => gh * v));
  return [gradA, gradB];
}
