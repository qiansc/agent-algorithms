export function dualClipLoss(
  old: number[],
  newProbs: number[],
  adv: number[],
  eps: number,
  c: number,
): number {
  const n = adv.length;
  if (n === 0 || old.length !== n || newProbs.length !== n) {
    throw new Error('三列必须等长且非空');
  }
  if (!(eps > 0 && eps < 1 && c > 1)) {
    throw new Error('要求 0 < eps < 1 且 c > 1');
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
    let term = Math.min(ratio * adv[i], clipped * adv[i]);
    if (adv[i] < 0) {
      term = Math.max(term, c * adv[i]); // 负优势的惩罚最多算到 c 倍
    }
    objective += term;
  }
  return -objective / n;
}
