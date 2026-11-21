/** 每台机器只上报本地最高的 k 个分数，汇总后取第 k 大。 */
export function kthAcrossShards(
  shards: number[][],
  k: number,
): number | null {
  if (k < 1) throw new RangeError('k must be >= 1');
  const desc = (a: number, b: number) => b - a;
  const candidates: number[] = [];
  for (const scores of shards) {
    const local = [...scores].sort(desc).slice(0, k); // 本地前 k 名
    candidates.push(...local);
  }
  if (candidates.length < k) return null;
  return candidates.sort(desc)[k - 1];
}
