export function clippedPolicyLoss(
  old: number[],
  newProbs: number[],
  adv: number[],
  eps: number,
): number {
  const n = adv.length;
  if (n === 0 || old.length !== n || newProbs.length !== n) {
    throw new Error('三列必须等长且非空');
  }
  if (!(eps > 0 && eps < 1)) {
    throw new Error('eps 必须在 (0, 1) 内');
  }
  let objective = 0;
  for (let i = 0; i < n; i++) {
    const previous = old[i];
    const current = newProbs[i];
    const oldOk = previous > 0 && previous <= 1;
    const newOk = current > 0 && current <= 1;
    if (!(oldOk && newOk)) {
      throw new Error('概率必须在 (0, 1] 内');
    }
    const ratio = current / previous;
    const clipped = Math.min(1 + eps, Math.max(1 - eps, ratio));
    // 两项取小：好处最多拿到裁剪边界，坏处一分不打折
    objective += Math.min(ratio * adv[i], clipped * adv[i]);
  }
  return -objective / n; // 目标要最大化，取负号交给梯度下降
}
