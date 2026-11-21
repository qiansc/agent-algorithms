// 令牌桶：容量 limit，每 w 秒匀速补 limit 个令牌，开始时是满的。
// 每个请求拿走 1 个令牌，拿不到就拒绝。返回每个请求是否放行。
export function tokenBucket(
  times: number[],
  w: number,
  limit: number,
): boolean[] {
  if (w <= 0 || limit < 0) {
    throw new Error('w 必须是正整数，limit 不能为负');
  }
  for (let i = 1; i < times.length; i++) {
    if (times[i - 1] > times[i]) {
      throw new Error('时间必须按非递减顺序给出');
    }
  }
  // 以 1/w 个令牌为单位记账：令牌数乘以 w 后全是整数，没有浮点误差
  const capacity = limit * w;
  let credit = capacity;
  let last = times.length > 0 ? times[0] : 0;
  const result: boolean[] = [];
  for (const t of times) {
    // 每秒补 limit/w 个令牌，即 limit 个单位
    credit = Math.min(capacity, credit + (t - last) * limit);
    last = t;
    const allowed = credit >= w; // 至少还有 1 个整令牌
    if (allowed) credit -= w;
    result.push(allowed);
  }
  return result;
}
