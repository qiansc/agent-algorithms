// 一遍扫描求均值和总体方差（Welford 递推）。
export function streamingMeanVar(
  stream: Iterable<number>,
): [number, number] {
  let n = 0;
  let mean = 0;
  let m2 = 0; // 到目前为止 (x - mean)^2 的累加和
  for (const t of stream) {
    n += 1;
    const delta = t - mean; // 用更新前的均值
    mean += delta / n;
    m2 += delta * (t - mean); // 用更新后的均值
  }
  if (n === 0) throw new Error('empty stream');
  return [mean, m2 / n];
}
