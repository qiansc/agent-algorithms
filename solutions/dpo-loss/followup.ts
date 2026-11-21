const sum = (xs: number[]): number => xs.reduce((s, x) => s + x, 0);

export function rewardModelLoss(rW: number, rL: number): number {
  // Bradley–Terry：P(w 胜过 l) = sigmoid(rW - rL)，损失取负对数
  const margin = rW - rL;
  return Math.max(-margin, 0) + Math.log1p(Math.exp(-Math.abs(margin)));
}

export function implicitReward(
  policy: number[],
  ref: number[],
  beta: number,
): number {
  // DPO 的隐式奖励：beta × (当前模型对数概率 - 参考模型对数概率)
  return beta * (sum(policy) - sum(ref));
}
