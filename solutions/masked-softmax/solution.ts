export function actionProbs(
  logits: number[],
  allowed: boolean[],
  temperature: number,
): number[] {
  if (logits.length !== allowed.length) {
    throw new Error('logits 和 allowed 长度不同');
  }
  if (!(temperature > 0)) throw new Error('温度必须大于 0');
  if (!allowed.some(Boolean)) throw new Error('没有可选的动作');
  // 只在合法动作里取最大值；减掉它以后最大的指数项是 exp(0) = 1
  let peak = -Infinity;
  logits.forEach((x, i) => {
    if (allowed[i]) peak = Math.max(peak, x);
  });
  const weights = logits.map((x, i) =>
    allowed[i] ? Math.exp((x - peak) / temperature) : 0,
  );
  // 至少是 1，不会除以 0
  const total = weights.reduce((a, b) => a + b, 0);
  return weights.map((w) => w / total);
}
