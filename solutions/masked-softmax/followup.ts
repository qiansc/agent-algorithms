// 返回 log 概率；非法动作是 -Infinity
export function actionLogProbs(
  logits: number[],
  allowed: boolean[],
  temperature: number,
): number[] {
  if (logits.length !== allowed.length) {
    throw new Error('logits 和 allowed 长度不同');
  }
  if (!(temperature > 0)) throw new Error('温度必须大于 0');
  if (!allowed.some(Boolean)) throw new Error('没有可选的动作');
  let peak = -Infinity;
  logits.forEach((x, i) => {
    if (allowed[i]) peak = Math.max(peak, x);
  });
  const scaled = logits.map((x) => (x - peak) / temperature);
  // log(总和) 在 0 到 log(合法动作数) 之间，不会溢出
  let total = 0;
  scaled.forEach((s, i) => {
    if (allowed[i]) total += Math.exp(s);
  });
  const logTotal = Math.log(total);
  return scaled.map((s, i) => (allowed[i] ? s - logTotal : -Infinity));
}
