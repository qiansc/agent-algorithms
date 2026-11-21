export function auc(scores: number[], labels: number[]): number {
  const n = scores.length;
  if (labels.length !== n) {
    throw new RangeError('scores and labels must have the same length');
  }
  if (labels.some((y) => y !== 0 && y !== 1)) {
    throw new RangeError('labels must be 0 or 1');
  }
  if (scores.some((s) => Number.isNaN(s))) {
    throw new RangeError('scores must not be NaN');
  }
  const pos = labels.reduce((a, b) => a + b, 0);
  const neg = n - pos;
  if (pos === 0 || neg === 0) {
    throw new RangeError('need at least one positive and one negative');
  }

  // 下标按分数从低到高排
  const order = Array.from({ length: n }, (_, i) => i);
  order.sort((a, b) => scores[a] - scores[b]);
  let posRankSum = 0;
  let i = 0;
  while (i < n) {
    let j = i;
    while (j < n && scores[order[j]] === scores[order[i]]) j += 1;
    // order[i..j) 分数相同，占名次 i+1 … j，每个都记平均名次
    const avgRank = (i + 1 + j) / 2;
    let posInGroup = 0;
    for (let t = i; t < j; t++) posInGroup += labels[order[t]];
    posRankSum += avgRank * posInGroup;
    i = j;
  }

  // Mann–Whitney U：正样本名次和减去正样本内部互比的部分
  const u = posRankSum - (pos * (pos + 1)) / 2;
  return u / (pos * neg);
}
