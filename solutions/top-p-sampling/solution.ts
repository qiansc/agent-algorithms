// 累加时的浮点容差：0.7 + 0.1 + 0.1 会算成 0.8999999999999999
export const EPS = 1e-12;

export function nucleusDraw(
  probs: number[],
  p: number,
  u: number,
): number {
  if (probs.length === 0 || !(p > 0 && p <= 1) || !(u >= 0 && u < 1)) {
    throw new RangeError('need probs, 0 < p <= 1, 0 <= u < 1');
  }
  if (probs.some((x) => x < 0)) {
    throw new RangeError('probabilities must be non-negative');
  }
  // 概率降序；同概率时编号小的在前
  const order = probs
    .map((_, i) => i)
    .sort((a, b) => probs[b] - probs[a] || a - b);
  const kept: number[] = [];
  let mass = 0;
  for (const i of order) {
    if (probs[i] === 0) break;
    kept.push(i);
    mass += probs[i];
    if (mass >= p - EPS) break; // 跨过阈值的这一个也要留下
  }

  const point = u * mass; // 把 u 缩放到保留部分的总长度，省掉归一化
  let boundary = 0;
  for (const i of kept) {
    boundary += probs[i];
    if (point < boundary) return i; // 区间左闭右开
  }
  return kept[kept.length - 1]; // 浮点误差可能让 point 恰好等于右端点
}
