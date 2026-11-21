const sum = (xs: number[]): number => xs.reduce((s, x) => s + x, 0);

export function dpoLoss(
  policyW: number[],
  policyL: number[],
  refW: number[],
  refL: number[],
  beta: number,
): number {
  if (
    !(policyW.length && policyL.length && refW.length && refL.length)
  ) {
    throw new Error('每个列表至少要有一个 token');
  }
  if (policyW.length !== refW.length || policyL.length !== refL.length) {
    throw new Error('同一条回答在两个模型下的 token 数必须相同');
  }
  if (!(beta > 0)) {
    throw new Error('beta 必须大于 0');
  }
  // 整条回答的对数概率 = 逐 token 条件对数概率之和
  const policyGap = sum(policyW) - sum(policyL);
  const refGap = sum(refW) - sum(refL);
  const margin = beta * (policyGap - refGap);
  // -ln(sigmoid(m)) = ln(1 + e^(-m))；只对非正数取指数，m 很负时也不会溢出
  return Math.max(-margin, 0) + Math.log1p(Math.exp(-Math.abs(margin)));
}
