const IGNORE = -100;

export function assistantLoss(
  logits: number[][],
  labels: number[],
): number | null {
  if (logits.length !== labels.length) {
    throw new Error('logits and labels differ in length');
  }
  let total = 0;
  let count = 0;
  // logits[j - 1] 是读完位置 j - 1 后对下一个 token 的打分，
  // 它要预测的是 labels[j]；位置 0 没有上一行来预测它
  for (let j = 1; j < labels.length; j++) {
    const target = labels[j];
    if (target === IGNORE) continue;
    const scores = logits[j - 1];
    if (
      !Number.isInteger(target) ||
      target < 0 ||
      target >= scores.length
    ) {
      throw new Error(`label ${target} out of range`);
    }
    // 不用 Math.max(...scores)：
    // 词表有十几万项时，展开参数可能超出调用栈上限
    const peak = scores.reduce((m, x) => (x > m ? x : m), -Infinity);
    // -log p = (peak - 正确分) + log Σ exp(分数 - peak)，不会溢出
    const z = scores.reduce((s, x) => s + Math.exp(x - peak), 0);
    total += peak - scores[target] + Math.log(z);
    count += 1;
  }
  return count ? total / count : null;
}
