export function bestThreshold(
  samples: [number, number][],
  fp: number,
  fn: number,
): [number, number] {
  if (fp < 0 || fn < 0) throw new Error('代价必须是非负数');
  for (const [score, label] of samples) {
    if (!Number.isFinite(score) || (label !== 0 && label !== 1)) {
      throw new Error('分数必须是有限实数，标签只能是 0 或 1');
    }
  }
  const rows = [...samples].sort((x, y) => y[0] - x[0]);
  // 阈值为 +Infinity 时一个都不调用：每个正例都是一次漏调用
  let loss = rows.reduce((s, [, label]) => s + label, 0) * fn;
  let bestT = Infinity;
  let bestLoss = loss;
  // 阈值从高往低移动，同分的一批必须一起越过
  let i = 0;
  while (i < rows.length) {
    const score = rows[i][0];
    while (i < rows.length && rows[i][0] === score) {
      // 正例：漏调变命中；负例：多一次误调用
      loss += rows[i][1] === 1 ? -fn : fp;
      i++;
    }
    if (loss < bestLoss) {
      // 严格变小才更新，平分时保留更高的阈值
      bestT = score;
      bestLoss = loss;
    }
  }
  return [bestT, bestLoss];
}
