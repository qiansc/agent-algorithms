interface Scored {
  idx: number;
  num: bigint; // 排序用的分数写成 num / den
  den: bigint;
}

export function cosineTopK(
  q: number[],
  docs: number[][],
  k: number,
): number[] {
  if (docs.some((vec) => vec.length !== q.length)) {
    throw new Error('文档向量和查询向量维数不同');
  }
  if (q.every((x) => x === 0)) throw new Error('查询向量不能全为零');
  if (k <= 0) return [];
  const scored: Scored[] = [];
  docs.forEach((vec, idx) => {
    // 分量绝对值 ≤ 1000、维数 ≤ 1024，下面两个和都远小于 2^53，number 精确
    const sq = vec.reduce((s, x) => s + x * x, 0); // 长度的平方 |v|²
    if (sq === 0) return; // 全零向量没有方向，跳过
    const dot = vec.reduce((s, x, i) => s + q[i] * x, 0);
    // 余弦 = dot / (|q|·|v|)，|q| 对所有文档相同，可以不管。
    // dot / |v| 和它带符号的平方 dot·|dot| / |v|² 次序相同，
    // 后者的分子分母都是整数。dot·|dot| 可达 10^18，先转成 bigint 再乘
    const d = BigInt(dot);
    scored.push({ idx, num: d < 0n ? -d * d : d * d, den: BigInt(sq) });
  });
  scored.sort((a, b) => {
    // 交叉相乘可达 10^27，必须用 bigint
    const lhs = b.num * a.den;
    const rhs = a.num * b.den;
    if (lhs !== rhs) return lhs < rhs ? -1 : 1; // 分数高的在前
    return a.idx - b.idx; // 分数相等时下标小的在前
  });
  return scored.slice(0, k).map((s) => s.idx);
}
