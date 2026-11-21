export function gae(
  rewards: number[],
  values: number[],
  lastValue: number,
  gamma: number,
  lam: number,
): number[] {
  if (rewards.length !== values.length) {
    throw new Error('rewards 和 values 必须等长');
  }
  if (!(gamma >= 0 && gamma <= 1 && lam >= 0 && lam <= 1)) {
    throw new Error('gamma 和 lam 必须在 [0, 1] 内');
  }
  const n = rewards.length;
  const advantages = new Array<number>(n).fill(0);
  let running = 0; // 后一步的优势 A[t+1]，最后一步之后视为 0
  for (let t = n - 1; t >= 0; t--) {
    const nextValue = t + 1 < n ? values[t + 1] : lastValue;
    const delta = rewards[t] + gamma * nextValue - values[t]; // TD 误差
    running = delta + gamma * lam * running;
    advantages[t] = running;
  }
  return advantages;
}
